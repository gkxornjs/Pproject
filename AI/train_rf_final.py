import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
# ⚠️ SMOTE 설치 필요: pip install imbalanced-learn
from imblearn.over_sampling import SMOTE 

# ==========================================
# ⚙️ 설정값
# ==========================================
DATASET_FILE = 'data/final_dataset_smart.csv' 
MODEL_SAVE_PATH = 'fall_model.pkl' # 최종 모델 저장 (덮어쓰기)
WINDOW_SIZE = 50   
STEP_SIZE = 25     

# ==========================================
# 🛠️ 함수: 특징 추출 (최종 버전: 12개 특징)
# ==========================================
def create_windows(df):
    X_list = []
    y_list = []
    
    # 1. 기본 물리량 계산
    # SVM: 충격량 (벡터 합)
    df['SVM'] = np.sqrt(df['acc_x']**2 + df['acc_y']**2 + df['acc_z']**2)
    # GVM: 회전량 (벡터 합)
    df['GVM'] = np.sqrt(df['gyro_x']**2 + df['gyro_y']**2 + df['gyro_z']**2)
    # Jerk: 충격의 변화율 (미분)
    df['Jerk_SVM'] = df['SVM'].diff().fillna(0).abs()
    # Tilt: 기울기 (Z축 중력 가속도 비율)
    df['Tilt'] = df['acc_z'] / (df['SVM'] + 1e-6)

    print("✂️ 데이터 자르기 & 특징 추출 중... (Free Fall + Delta Tilt 적용)")

    for i in range(0, len(df) - WINDOW_SIZE, STEP_SIZE):
        window = df.iloc[i : i + WINDOW_SIZE]
        
        # 라벨 결정 (윈도우 과반수가 낙상이면 낙상)
        label = 1 if window['label'].mean() > 0.5 else 0

        # ---------------------------------------------------------
        # 🔥 [추가 전략] 새로운 변수 계산
        # ---------------------------------------------------------
        # (A) Free Fall (무중력): 쿵 하고 찍는 급성 낙상 감지용
        # 윈도우 내에서 충격량이 0.6g 밑으로 떨어진 적이 있는가?
        free_fall_detected = 1 if window['SVM'].min() < 0.6 else 0
        
        # (B) Delta Tilt (자세 변화량): 스르륵 눕는 완만 낙상 감지용
        # 1초 전(시작점)과 지금(끝점)의 자세 차이 절댓값
        start_tilt = window['Tilt'].iloc[0]
        end_tilt = window['Tilt'].iloc[-1]
        delta_tilt = abs(end_tilt - start_tilt)

        # --- 🔍 AI에게 줄 12가지 힌트 (Features) ---
        features = [
            window['SVM'].max(),   # 0. 최대 충격
            window['GVM'].max(),   # 1. 최대 회전
            window['SVM'].mean(),  # 2. 평균 충격
            window['GVM'].mean(),  # 3. 평균 회전
            window['SVM'].std(),   # 4. 충격 변화량 (표준편차)
            window['Jerk_SVM'].max(),  # 5. 최대 급격함
            window['Jerk_SVM'].mean(), # 6. 평균 급격함
            window['Tilt'].mean(),     # 7. 평균 자세
            window['Tilt'].std(),      # 8. 자세 변화량 (표준편차)
            window['Tilt'].iloc[-10:].mean(), # 9. 마지막 자세 (누워있나?)
            
            free_fall_detected,    # 10. ✨ 무중력 여부
            delta_tilt             # 11. ✨ 자세 변화폭 (NEW)
        ]
        
        X_list.append(features)
        y_list.append(label)

    return np.array(X_list), np.array(y_list)

# ==========================================
# 🚀 메인 실행
# ==========================================
if __name__ == "__main__":
    print(f"📂 데이터 로딩: {DATASET_FILE}")
    try:
        df = pd.read_csv(DATASET_FILE)
    except FileNotFoundError:
        print("❌ 파일 없음! 경로를 확인하세요.")
        exit()

    # 1. 전처리 실행
    X, y = create_windows(df)
    print(f"🧩 데이터 변환 완료: 특징 {X.shape[1]}개 (12개여야 정상)")

    # 2. 데이터 나누기 (Train 8 : Test 2)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    # -----------------------------------------------------
    # 🔥 [SMOTE 전략] 데이터 불균형 해소 (뻥튀기)
    # -----------------------------------------------------
    print(f"⚖️ SMOTE 적용 전: 낙상 데이터 = {sum(y_train)}개")
    
    smote = SMOTE(random_state=42)
    X_train_resampled, y_train_resampled = smote.fit_resample(X_train, y_train)
    
    print(f"⚖️ SMOTE 적용 후: 낙상 데이터 = {sum(y_train_resampled)}개 (1:1 균형 맞춰짐!)")

    # 3. 모델 학습 (Random Forest)
    print("🤖 AI 모델 학습 시작...")
    model = RandomForestClassifier(
        n_estimators=200, 
        random_state=42, 
        class_weight='balanced' # 안전장치 (SMOTE 했지만 한 번 더 강조)
    )
    model.fit(X_train_resampled, y_train_resampled)

    # 4. 성능 평가
    y_pred = model.predict(X_test)
    
    print("\n" + "="*40)
    print(f"🏆 [최종] 성적표 (SMOTE + FreeFall + DeltaTilt)")
    print("="*40)
    print(classification_report(y_test, y_pred, target_names=['일상(0)', '낙상(1)']))
    
    # 혼동 행렬 (몇 개나 맞췄나 확인)
    cm = confusion_matrix(y_test, y_pred)
    print(f"✅ 놓친 낙상: {cm[1][0]}개") 
    print(f"✅ 전체 낙상 테스트 수: {cm[1][0] + cm[1][1]}개")

    # 5. 모델 저장
    joblib.dump(model, MODEL_SAVE_PATH)
    print(f"💾 업그레이드된 모델 저장 완료: {MODEL_SAVE_PATH}")