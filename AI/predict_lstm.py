import sys
import json
import numpy as np
import pandas as pd
import tensorflow as tf
import os

# ==========================================
# ⚙️ 설정값 (민감도 대폭 완화 버전)
# ==========================================
MODEL_PATH = 'best_model_v3.h5' 

# 1. [기본] AI가 이 확률만 넘으면 바로 낙상
HIGH_PROB_THRESHOLD = 0.40  # 40%만 넘어도 인정 (기존 50%)

# 2. [보정] AI가 긴가민가해도(20%), 충격이 조금만 있으면(1.3G) 낙상
LOW_PROB_THRESHOLD = 0.20   # 20%
IMPACT_THRESHOLD_G = 1.3    # 1.3G (살짝 툭 건드리는 정도)

# 3. 🚀 [치트키] AI 무시하고 강제 낙상 처리하는 충격량
FORCE_IMPACT_G = 1.6

def main():
    # 텐서플로우 로그 숨기기
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
    
    # 🚨 최종 결과를 저장할 변수를 미리 정의 (오류 발생 시에도 JSON 출력을 보장)
    final_result = {"result": 0, "probability": 0.0}

    try:
        # 1. 데이터 수신
        input_str = sys.stdin.read()
        if not input_str:
            print(json.dumps(final_result))
            return

        # 2. 데이터 파싱
        try:
            payload = json.loads(input_str)
            data_list = payload.get('data', [])
        except:
            print(json.dumps(final_result))
            return

        if len(data_list) == 0:
            print(json.dumps(final_result))
            return

        df = pd.DataFrame(data_list)

        # ------------------------------------------------
        # ⚖️ 충격량 계산 (G 단위로 변환)
        # ------------------------------------------------
        svm_series = np.sqrt(df['acc_x']**2 + df['acc_y']**2 + df['acc_z']**2)
        avg_val = svm_series.mean()
        
        # G단위로 변환
        if avg_val > 5.0: 
            svm_series = svm_series / 9.8 
        
        max_impact_g = svm_series.max() # 최대 충격 (G)

        # ------------------------------------------------
        # 🤖 모델 입력 전처리
        # ------------------------------------------------
        required_length = 150 
        
        if len(df) < required_length:
            print(json.dumps(final_result))
            return
            
        df_input = df.iloc[-required_length:] 
        X = df_input[['acc_x', 'acc_y', 'acc_z', 'gyro_x', 'gyro_y', 'gyro_z']].values
        X = np.expand_dims(X, axis=0) 

        # ------------------------------------------------
        # 🧠 예측 실행
        # ------------------------------------------------
        if not os.path.exists(MODEL_PATH):
            sys.stderr.write(f"[ERROR] 모델 파일 없음\n")
            print(json.dumps(final_result))
            return

        model = tf.keras.models.load_model(MODEL_PATH)
        prediction = model.predict(X, verbose=0)
        # 클래스 1 (낙상)에 대한 확률을 추출
        prob = float(prediction[0][0]) 

        # 로그 출력 (디버깅용)
        mark = "💥" if max_impact_g >= FORCE_IMPACT_G else ""
        sys.stderr.write(f"👉 [LSTM] 충격:{max_impact_g:.2f}g{mark} / 확률:{prob*100:.1f}%\n")
        sys.stderr.flush()

        # =========================================================
        # 🛑 판정 로직 (우선순위 순서대로)
        # =========================================================
        prediction_result = 0 # 최종 결과 (기본값: 정상)

        # 1. [치트키] 충격량이 설정값(1.6G) 넘으면 무조건 낙상!
        if max_impact_g >= FORCE_IMPACT_G:
            sys.stderr.write(f"   ㄴ🚨 [강제] 충격량({max_impact_g:.2f}g) 기준 초과 -> 낙상 확정\n")
            prediction_result = 1
        
        # 2. [확신] AI 확률이 40%만 넘어도 낙상
        elif prob > HIGH_PROB_THRESHOLD:
            sys.stderr.write(f"   ㄴ🔥 [확정] AI 확률 높음\n")
            prediction_result = 1

        # 3. [보정] 확률은 낮은데(20%), 충격이 좀 있으면(1.3G) 낙상
        elif prob > LOW_PROB_THRESHOLD and max_impact_g > IMPACT_THRESHOLD_G:
            sys.stderr.write(f"   ㄴ⚠️ [보정] 낮은 확률 + 충격 감지됨\n")
            prediction_result = 1

        # 4. 최종 결과 출력
        final_result = {"result": prediction_result, "probability": prob}
        print(json.dumps(final_result))

    except Exception as e:
        sys.stderr.write(f"[ERROR] LSTM 에러: {str(e)}\n")
        print(json.dumps(final_result))

if __name__ == "__main__":
    main()