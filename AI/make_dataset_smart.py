import pandas as pd
import numpy as np
import os
import glob  # 파일 목록 찾는 라이브러리

# ==========================================
# ⚙️ 설정값
# ==========================================
DATA_DIR = 'data'    # 데이터 폴더
SAMPLING_RATE = 50   # 50Hz
WINDOW_SECONDS = 3   # 충격 중심 3초 (낙상용)
TRIM_SECONDS = 2     # 앞뒤 2초 제거 (일상용)

HALF_WINDOW = int(SAMPLING_RATE * WINDOW_SECONDS / 2)

# ==========================================
# 🛠️ 함수: 병합 및 스마트 크로핑
# ==========================================
def merge_and_center_data(acc_filename):
    # 1. 파일 경로 및 짝꿍(Gyro) 이름 찾기
    acc_path = os.path.join(DATA_DIR, acc_filename)
    gyro_filename = acc_filename.replace('acc_', 'gyro_') # acc -> gyro 로 이름만 변경
    gyro_path = os.path.join(DATA_DIR, gyro_filename)

    # 짝꿍 파일이 없으면 패스
    if not os.path.exists(gyro_path):
        print(f"⚠️ 짝꿍 파일 없음(Pass): {gyro_filename}")
        return None

    # 2. 라벨 결정 (파일 이름에 'fall'이 있으면 1, 'adl'이 있으면 0)
    if 'fall' in acc_filename.lower():
        label = 1
        type_str = "🚨낙상"
    elif 'adl' in acc_filename.lower():
        label = 0
        type_str = "🟢일상"
    else:
        print(f"❓ 알 수 없는 파일(Pass): {acc_filename} (이름에 fall/adl 포함 필요)")
        return None

    print(f"🔄 처리 중 [{type_str}]: {acc_filename} + {gyro_filename}")

    # 3. 데이터 읽기
    try:
        df_acc = pd.read_csv(acc_path)
        df_gyro = pd.read_csv(gyro_path)
    except Exception as e:
        print(f"❌ 읽기 에러: {e}")
        return None

    # 4. 컬럼 정리
    df_acc = df_acc[['time', 'x', 'y', 'z']].rename(columns={'x':'acc_x', 'y':'acc_y', 'z':'acc_z'})
    df_gyro = df_gyro[['time', 'x', 'y', 'z']].rename(columns={'x':'gyro_x', 'y':'gyro_y', 'z':'gyro_z'})

    # 5. 시간 동기화 합치기
    df = pd.merge_asof(
        df_acc.sort_values('time'), 
        df_gyro.sort_values('time'), 
        on='time', 
        direction='nearest'
    )
    
    # -------------------------------------------------------
    # 🔥 [핵심] 스마트 크로핑 (Peak Centering)
    # -------------------------------------------------------
    if label == 1: # 낙상(Fall) -> 충격 중심 자르기
        svm = np.sqrt(df['acc_x']**2 + df['acc_y']**2 + df['acc_z']**2)
        peak_idx = svm.idxmax()
        
        start_idx = max(0, peak_idx - HALF_WINDOW)
        end_idx = min(len(df), peak_idx + HALF_WINDOW)
        
        df_cropped = df.iloc[start_idx:end_idx].copy()
        
    else: # 일상(ADL) -> 앞뒤 노이즈만 제거
        trim_amount = SAMPLING_RATE * TRIM_SECONDS
        if len(df) > trim_amount * 2:
            df_cropped = df.iloc[trim_amount:-trim_amount].copy()
        else:
            df_cropped = df.copy()

    # 6. 라벨 달기
    df_cropped['label'] = label
    return df_cropped

# ==========================================
# 🚀 메인 실행
# ==========================================
if __name__ == "__main__":
    all_data = []
    
    # data 폴더 내의 모든 'acc_*.csv' 파일을 찾음
    # (번호가 100번이 넘어가도 다 찾습니다)
    search_pattern = os.path.join(DATA_DIR, "acc_*.csv")
    acc_file_list = glob.glob(search_pattern)
    
    # 파일명만 추출해서 정렬 (1, 10, 2 순서 방지용 로직은 생략하고 단순 정렬)
    acc_file_list.sort()

    print(f"📂 총 {len(acc_file_list)}개의 가속도 파일을 발견했습니다.")
    print("="*50)

    for acc_path in acc_file_list:
        # 경로에서 파일명만 떼어냄 (예: data/acc_fall_1.csv -> acc_fall_1.csv)
        filename = os.path.basename(acc_path)
        
        # 처리 함수 호출
        res = merge_and_center_data(filename)
        if res is not None:
            all_data.append(res)

    # 최종 저장
    if all_data:
        final_df = pd.concat(all_data, ignore_index=True)
        save_path = os.path.join(DATA_DIR, 'final_dataset_smart.csv')
        final_df.to_csv(save_path, index=False)
        
        print("\n" + "="*50)
        print(f"🎉 스마트 데이터셋 생성 완료!")
        print(f"📂 저장 위치: {save_path}")
        print(f"📊 총 데이터 개수: {len(final_df)} 줄")
        print("="*50)
    else:
        print("\n❌ 처리된 데이터가 없습니다. data 폴더를 확인하세요.")
