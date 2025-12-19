import pandas as pd
import numpy as np
import glob
import os
import pickle
from sklearn.preprocessing import MinMaxScaler
from tqdm import tqdm

# ==========================================
# ⚙️ 설정값
# ==========================================
DATA_DIR = 'data/SisFall_dataset'  # 서버 내 원본 폴더명 확인 필요!
SAVE_PATH = 'data/lstm_data_v4.pkl' # V4 저장
SCALER_PATH = 'data/scaler.pkl'

ORIGIN_HZ = 200
TARGET_HZ = 50
DOWN_STEP = 4
WINDOW_SIZE = 150 

def process_smart(filepath, label):
    try:
        df = pd.read_csv(filepath, header=None, engine='python')
        if df.shape[1] < 9:
            df = pd.read_csv(filepath, header=None, sep=r'[,;]', engine='python')

        df = df.iloc[:, [0, 1, 2, 3, 4, 5]] # 6축
        df.columns = ['acc_x', 'acc_y', 'acc_z', 'gyro_x', 'gyro_y', 'gyro_z']
        df = df.iloc[::DOWN_STEP, :].reset_index(drop=True)

        segments = []
        labels = []

        # CASE 1: 낙상(1) - Peak Centric 유지
        if label == 1:
            svm = np.sqrt(df['acc_x']**2 + df['acc_y']**2 + df['acc_z']**2)
            peak_idx = svm.idxmax()
            start_idx = peak_idx - (WINDOW_SIZE // 2)
            end_idx = start_idx + WINDOW_SIZE
            
            if start_idx >= 0 and end_idx <= len(df):
                segments.append(df.iloc[start_idx:end_idx].values)
                labels.append(1)
                # 증강 1개 추가 (앞으로 0.2초 당겨서)
                # segments.append(df.iloc[start_idx-10:end_idx-10].values)
                # labels.append(1)

        # CASE 2: 일상(0) - 🔥 수정된 부분
        else:
            # 기존 150 -> 50으로 변경 (3배 더 촘촘하게!)
            # 낙상 데이터보다 일상 데이터가 더 많아지게 유도함
            stride = 50 
            for i in range(0, len(df) - WINDOW_SIZE, stride):
                window = df.iloc[i : i + WINDOW_SIZE].values
                segments.append(window)
                labels.append(0)

        return segments, labels

    except Exception as e:
        return [], []

if __name__ == "__main__":
    # 경로 주의: 서버에 압축 푼 폴더명에 맞게 수정하세요 (예: data/SisFall_dataset)
    file_list = glob.glob(os.path.join(DATA_DIR, "**", "*.txt"), recursive=True)
    file_list = [f for f in file_list if "readme" not in f.lower()]
    
    print(f"🔄 V4 데이터 증강 전처리 시작... (총 {len(file_list)}개 파일)")

    all_X = []
    all_y = []

    for filepath in tqdm(file_list):
        filename = os.path.basename(filepath)
        if filename.upper().startswith('D'): label = 0
        elif filename.upper().startswith('F'): label = 1
        else: continue

        segs, lbls = process_smart(filepath, label)
        if len(segs) > 0:
            all_X.extend(segs)
            all_y.extend(lbls)

    X = np.array(all_X)
    y = np.array(all_y)

    print(f"\n🧩 데이터 모양: {X.shape}")
    print(f"📊 낙상(1): {sum(y)}개, 일상(0): {len(y)-sum(y)}개") 
    # 목표: 일상(0) 개수가 낙상(1)보다 비슷하거나 많아야 함!

    # 스케일링
    N, T, F = X.shape
    scaler = MinMaxScaler()
    X_scaled = scaler.fit_transform(X.reshape(N * T, F)).reshape(N, T, F)

    with open(SAVE_PATH, 'wb') as f:
        pickle.dump((X_scaled, y), f)
    
    import joblib
    joblib.dump(scaler, SCALER_PATH)
    print("✅ V4 완료!")