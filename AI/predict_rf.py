import sys
import json
import numpy as np
import pandas as pd
import joblib
import os

# ==========================================
# ⚙️ 기본 설정
# ==========================================
MODEL_PATH = 'fall_model.pkl' 
PROB_THRESHOLD = 0.45 # AI 확률 기준

def main():
    try:
        # 1. Node.js에서 보낸 데이터 읽기
        input_str = sys.stdin.read()
        if not input_str:
            # 최종 결과: 0 (정상), 확률: 0.0
            print(json.dumps({"result": 0, "probability": 0.0}))
            return

        # 2. 데이터 및 설정(Config) 파싱
        payload = json.loads(input_str)
        
        if isinstance(payload, list):
            data_list = payload
            sensitivity = 50.0 # 기본값
        else:
            data_list = payload.get('data', [])
            config = payload.get('config', {})
            # float()로 변환하여 사용
            sensitivity = float(config.get('threshold', 50.0)) 

        df = pd.DataFrame(data_list)
        if len(df) < 10:
            print(json.dumps({"result": 0, "probability": 0.0}))
            return

        # ------------------------------------------------
        # 🎚️ 민감도를 물리적 임계값(Threshold)으로 변환
        # ------------------------------------------------
        PHYSICAL_THRESHOLD = 12.0 + (sensitivity - 10.0) * (13.0 / 90.0)

        # ------------------------------------------------
        # ⚖️ 단위 자동 보정 (g -> m/s^2)
        # ------------------------------------------------
        df['SVM_Raw'] = np.sqrt(df['acc_x']**2 + df['acc_y']**2 + df['acc_z']**2)
        avg_acc = df['SVM_Raw'].mean()
        
        if avg_acc < 5.0:
            # m/s^2로 가정하고 g로 보정
            df['acc_x'] /= 9.8
            df['acc_y'] /= 9.8
            df['acc_z'] /= 9.8
        
        # ------------------------------------------------
        # 📊 특징 추출
        # ------------------------------------------------
        # 보정된 값으로 SVM 재계산 (이제 g 단위)
        df['SVM'] = np.sqrt(df['acc_x']**2 + df['acc_y']**2 + df['acc_z']**2)
        max_svm = df['SVM'].max()
        peak_idx = df['SVM'].idxmax()

        # ------------------------------------------------
        # 🛑 [Gate 1] 충격량 필터 (설정값 반영)
        # ------------------------------------------------
        if max_svm < PHYSICAL_THRESHOLD:
            sys.stderr.write(f"👉 [PASS] 충격 미흡 (설정: {PHYSICAL_THRESHOLD:.1f} > 현재: {max_svm:.1f})\n")
            # 최종 결과: 0 (정상), 확률: 0.0
            print(json.dumps({"result": 0, "probability": 0.0}))
            return

        # ------------------------------------------------
        # 🛑 [Gate 2] 🔥 충격 후 정지 상태 확인
        # ------------------------------------------------
        after_impact_df = df.iloc[peak_idx + 5 : ]
        
        if len(after_impact_df) > 5:
            activity_level = after_impact_df['SVM'].std()
            
            if activity_level > 3.0:
                sys.stderr.write(f"👉 [제외] 충격 후 움직임 감지됨 (변동폭: {activity_level:.1f})\n")
                # 최종 결과: 0 (정상), 확률: 0.0
                print(json.dumps({"result": 0, "probability": 0.0}))
                return

        # ------------------------------------------------
        # 🤖 AI 모델 예측 (최후의 심판)
        # ------------------------------------------------
        # 나머지 특징 계산
        # Note: 스마트폰 앱은 gyro_x/y/z를 0.0으로 보내고 있음. 
        # 이 모델은 RF이므로 gyro를 사용해도 0 값이 들어가 계산에 큰 영향을 주지 않음.
        df['GVM'] = np.sqrt(df['gyro_x']**2 + df['gyro_y']**2 + df['gyro_z']**2)
        df['Jerk_SVM'] = df['SVM'].diff().fillna(0).abs()
        df['Tilt'] = df['acc_z'] / (df['SVM'] + 1e-6)

        free_fall_detected = 1 if df['SVM'].min() < 6.0 else 0
        delta_tilt = abs(df['Tilt'].iloc[-1] - df['Tilt'].iloc[0])

        features = [
            df['SVM'].max(), df['GVM'].max(), df['SVM'].mean(), df['GVM'].mean(),
            df['SVM'].std(), df['Jerk_SVM'].max(), df['Jerk_SVM'].mean(),
            df['Tilt'].mean(), df['Tilt'].std(), df['Tilt'].iloc[-10:].mean(),
            free_fall_detected, delta_tilt
        ]
        
        if not os.path.exists(MODEL_PATH):
            sys.stderr.write("[ERROR] 모델 파일 없음\n")
            print(json.dumps({"result": 0, "probability": 0.0}))
            return
            
        model = joblib.load(MODEL_PATH)
        # prob는 낙상일 확률 (클래스 1의 확률)
        prob = model.predict_proba([features])[0][1] 
        
        prediction_result = 1 if prob > PROB_THRESHOLD else 0

        # 최종 로그 출력
        sys.stderr.write(f"👉 [RF 판독] 민감도:{int(sensitivity)} / 충격:{max_svm:.1f} / 결과:{prediction_result} / 확률:{prob*100:.1f}%\n")
        sys.stderr.flush()

        # 🔥 [핵심 수정] 최종 JSON 출력
        print(json.dumps({"result": prediction_result, "probability": prob}))

    except Exception as e:
        sys.stderr.write(f"[ERROR] {str(e)}\n")
        # 오류 발생 시 0과 0.0 출력
        print(json.dumps({"result": 0, "probability": 0.0}))

if __name__ == "__main__":
    main()