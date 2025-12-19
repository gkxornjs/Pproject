import pickle
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout, BatchNormalization
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix

# ==========================================
# ⚙️ 설정값
# ==========================================
# 🔥 중요: V4 전처리(일상 데이터 증강)된 파일 사용
DATA_FILE = 'data/lstm_data_v4.pkl' 
MODEL_SAVE_PATH = 'best_model_v3.h5'

# ==========================================
# 🚀 메인 실행
# ==========================================
if __name__ == "__main__":
    # 1. GPU 확인 (서버에서 잘 잡히는지 체크)
    print("🖥️ 사용 가능한 GPU:", len(tf.config.list_physical_devices('GPU')))

    # 2. 데이터 로드
    print(f"📂 데이터 불러오는 중: {DATA_FILE}")
    try:
        with open(DATA_FILE, 'rb') as f:
            X, y = pickle.load(f)
    except FileNotFoundError:
        print("❌ 에러: 데이터 파일이 없습니다. preprocess_lstm_v4.py를 먼저 실행하세요.")
        exit()

    print(f"🧩 전체 데이터 모양: {X.shape}")
    print(f"📊 낙상(1): {sum(y)}개, 일상(0): {len(y)-sum(y)}개")
    
    # 3. 나누기 (8:2)
    # stratify=y: 비율을 유지하면서 나눔
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # 4. 모델 설계 (Deep LSTM Structure)
    model = Sequential()

    # Layer 1: 큰 흐름 잡기 (Wide)
    model.add(LSTM(128, input_shape=(150, 6), return_sequences=True))
    model.add(BatchNormalization())
    model.add(Dropout(0.3))

    # Layer 2: 특징 압축 (Narrow)
    model.add(LSTM(64, return_sequences=False))
    model.add(BatchNormalization())
    model.add(Dropout(0.3))

    # Layer 3: 판단력 강화 (Dense)
    model.add(Dense(32, activation='relu'))
    model.add(Dropout(0.3))

    # Layer 4: 최종 출력 (0~1 확률)
    model.add(Dense(1, activation='sigmoid'))

    # 5. 컴파일
    optimizer = tf.keras.optimizers.Adam(learning_rate=0.001)
    model.compile(optimizer=optimizer, loss='binary_crossentropy', metrics=['accuracy'])
    model.summary()

    # 6. 콜백 설정 (학습 도우미)
    # 성능이 안 오르면 학습률을 낮춰서(0.5배) 다시 꼼꼼히 봄
    reduce_lr = ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=3, verbose=1)
    # 10번 동안 성능 향상 없으면 조기 종료
    early_stop = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)
    # 가장 좋은 모델 저장
    checkpoint = ModelCheckpoint(MODEL_SAVE_PATH, monitor='val_accuracy', save_best_only=True, verbose=1)

    # 7. 학습 시작
    # 🔥 핵심 변경: class_weight 제거함 (데이터 양으로 승부)
    print("\n🔥 V3 학습 시작! (자연스러운 데이터 균형 학습)")
    history = model.fit(
        X_train, y_train,
        epochs=50,             # 넉넉하게 50번 (조기 종료 믿고)
        batch_size=64,         # GPU 메모리에 맞춰서 64 or 128
        validation_data=(X_test, y_test),
        callbacks=[early_stop, checkpoint, reduce_lr]
    )

    # 8. 최종 평가
    print("\n" + "="*50)
    print("🏆 V3 최종 성적표")
    loss, acc = model.evaluate(X_test, y_test)
    print(f"✅ 정확도(Accuracy): {acc*100:.2f}%")
    
    # 보고서 출력
    y_pred_prob = model.predict(X_test)
    
    # 임계값(Threshold) 설정
    # 0.5가 표준이지만, 안전을 위해 0.45 정도로 살짝 타협 가능
    # 일단 정석대로 0.5로 테스트
    y_pred = (y_pred_prob > 0.5).astype(int) 
    
    print("\n📊 상세 보고서:")
    print(classification_report(y_test, y_pred, target_names=['일상(0)', '낙상(1)']))
    
    # 혼동 행렬 (Confusion Matrix)
    cm = confusion_matrix(y_test, y_pred)
    print("\n🧩 혼동 행렬 (맞춘 개수):")
    print(f"일상(0) 정답: {cm[0][0]}개 / 오답: {cm[0][1]}개")
    print(f"낙상(1) 정답: {cm[1][1]}개 / 오답: {cm[1][0]}개")
    print("="*50)
    print(f"💾 모델 저장 완료: {MODEL_SAVE_PATH}")