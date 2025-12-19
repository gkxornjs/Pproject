import asyncio
from bleak import BleakScanner, BleakClient
import requests
import json
import sys
import time
import math
import threading
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import datetime

# ==========================================
# ⚙️ 설정값
# ==========================================
DEVICE_NAME = "SilverGuard_IoT"
CHARACTERISTIC_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e"

SERVER_URL = "http://localhost:60010/predict"
SERVER_CHECK_URL = "http://localhost:60010/" 
FIREBASE_KEY_PATH = "firebase_key.json"
TARGET_USER_ID = "user_1765608257766_13"

# 🔧 [중요] 단위 보정 설정
# m/s²(9.8) 단위로 들어오는 경우 -> 9.8로 나누어 g단위로 변환
SCALE_FACTOR = 9.8  

# ==========================================
# 🎨 로그 색상 설정
# ==========================================
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'

def log(tag, msg, color=Colors.OKBLUE):
    print(f"{color}[{tag}]{Colors.ENDC} {msg}")

# ==========================================
# 🔥 파이어베이스 초기화
# ==========================================
db = None
try:
    if not firebase_admin._apps:
        cred = credentials.Certificate(FIREBASE_KEY_PATH)
        firebase_admin.initialize_app(cred)
    db = firestore.client()
    log("Firebase", f"DB 연결 성공! (Key: {FIREBASE_KEY_PATH})", Colors.OKGREEN)
except Exception as e:
    log("Firebase", f"초기화 실패 (알림 전송 불가): {e}", Colors.FAIL)

# ==========================================
# 🛡️ 교차 검증(Cross-Check)
# ==========================================
IS_VERIFYING = False

def request_verification(iot_g_force):
    global IS_VERIFYING
    if IS_VERIFYING: return
    
    IS_VERIFYING = True
    if db is None:
        IS_VERIFYING = False
        return

    log("Dual-Check", f"📡 충격 감지({iot_g_force:.2f}g) -> 핸드폰에 확인 요청 전송...", Colors.HEADER)
    
    try:
        doc_ref = db.collection('users').document(TARGET_USER_ID)
        
        # '검증 요청' 상태로 변경
        doc_ref.set({
            'status': 'VERIFY_REQUEST',
            'iot_g_force': iot_g_force,
            'timestamp': datetime.datetime.now(),
            'trigger_source': 'IoT'
        }, merge=True)

        # 5초 타이머 시작
        t = threading.Thread(target=check_verification_timeout, args=(iot_g_force,))
        t.start()
        
    except Exception as e:
        log("Error", f"파이어베이스 전송 실패: {e}", Colors.FAIL)
        IS_VERIFYING = False

def check_verification_timeout(original_g):
    global IS_VERIFYING
    time.sleep(5) # 앱 응답 대기 시간

    try:
        doc_ref = db.collection('users').document(TARGET_USER_ID)
        doc = doc_ref.get()
        
        if doc.exists:
            data = doc.to_dict()
            status = data.get('status')
            
            log("Result", f"🕵️ 5초 후 상태 확인: {status}", Colors.OKBLUE)

            if status == 'VERIFY_REQUEST':
                # ⚠️ 앱이 죽어있음 -> IoT 단독 판단으로 격상
                log("Warning", "⚠️ 앱 응답 없음 -> IoT 단독 모드로 격상 (낙상 확정)", Colors.FAIL)
                
                # [수정됨] status만 바꾸는 게 아니라 'last_fall_time'도 갱신해서 앱이 깨어날 때 즉시 알림
                doc_ref.update({
                    'status': 'EMERGENCY',
                    'note': 'Single Mode (App No Response)',
                    'last_fall_time': datetime.datetime.now() # 💡 핵심: 시간 갱신
                })
                
            elif status == 'EMERGENCY':
                log("Success", "🚨 [낙상 확정] 핸드폰도 충격을 인정했습니다!", Colors.FAIL)
                # 이미 앱이 EMERGENCY로 바꿨으므로 시간 갱신 불필요 (앱이 했을 것임)
                
            elif status == 'NORMAL' or status == 'FALSE_ALARM':
                log("Info", "✅ [오작동] 핸드폰 검증 결과: 낙상 아님 (안전)", Colors.OKGREEN)
        
    except Exception as e:
        log("Error", f"결과 확인 중 에러: {e}", Colors.FAIL)
    finally:
        time.sleep(2) 
        IS_VERIFYING = False

# ==========================================
# 🏥 서버 연결 확인
# ==========================================
def check_server_connection():
    try:
        requests.get(SERVER_CHECK_URL, timeout=1)
        return True
    except:
        return True 

# ==========================================
# 🚀 데이터 처리 핸들러
# ==========================================
async def notification_handler(sender, data):
    try:
        raw_text = data.decode('utf-8').strip()
        if len(raw_text) < 5: return

        parts = raw_text.split(',')
        if len(parts) >= 6:
            # 1. 보정된 값 계산 (SCALE_FACTOR 적용)
            acc_x = float(parts[0]) / SCALE_FACTOR
            acc_y = float(parts[1]) / SCALE_FACTOR
            acc_z = float(parts[2]) / SCALE_FACTOR
            
            # 2. G값 계산 (벡터 합)
            g_force = math.sqrt(acc_x**2 + acc_y**2 + acc_z**2)

            # 서버 전송용 데이터
            payload = {
                "acc_x": acc_x, "acc_y": acc_y, "acc_z": acc_z,
                "gyro_x": float(parts[3]), "gyro_y": float(parts[4]), "gyro_z": float(parts[5]),
                "device_type": "iot",
                "userId": TARGET_USER_ID
            }
            
            try:
                # 🔥 [핵심 수정] 타임아웃을 1.0초로 늘려서 서버가 응답할 시간을 줍니다.
                # 0.2초는 너무 짧아서 EPIPE 에러를 유발합니다.
                response = requests.post(SERVER_URL, json=payload, timeout=1.0)
                
                if response.status_code == 200:
                    res_json = response.json()
                    ai_result = res_json.get('result', 0)
                    
                    # 3. 로그 출력 (1.0g 근처로 표시됨)
                    print(f"   📡 G: {g_force:.2f}g (AI: {ai_result:.2f})", end='\r')

                    # 🚨 AI 확률 50% 이상 OR G값 3.0 이상일 때 검증 요청
                    if (ai_result > 0.5 or g_force > 3.0) and not IS_VERIFYING:
                        print(f"\n💥 충격 감지! ({g_force:.2f}g) -> 교차 검증 시작")
                        request_verification(g_force)

            except Exception:
                # 타임아웃이나 연결 에러가 나도 프로그램이 죽지 않게 무시
                pass

    except ValueError:
        pass
    except Exception as e:
        log("Error", f"데이터 처리: {e}", Colors.FAIL)

# ==========================================
# 📡 메인 로직
# ==========================================
async def main():
    check_server_connection()
    log("System", f"현재 보정 비율(SCALE_FACTOR): {SCALE_FACTOR}", Colors.HEADER)
    
    device = await BleakScanner.find_device_by_name(DEVICE_NAME)
    if not device:
        log("Bleak", "❌ 장치 못 찾음", Colors.FAIL)
        return

    async with BleakClient(device, disconnected_callback=lambda c: log("Bleak", "❌ 끊김", Colors.FAIL)) as client:
        log("Bleak", "✅ 연결 성공!", Colors.OKGREEN)
        await client.start_notify(CHARACTERISTIC_UUID, notification_handler)
        
        # 무한 대기
        while client.is_connected:
            await asyncio.sleep(1)

if __name__ == "__main__":
    if sys.platform.startswith('win'):
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())