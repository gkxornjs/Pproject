const express = require('express');
const { spawn } = require('child_process');
const admin = require('firebase-admin');
const { SolapiMessageService } = require('solapi'); // ✅ [추가] Solapi 라이브러리
require('dotenv').config(); // .env 파일 로드

const app = express();
app.use(express.json());

// ======================================================================
// 📩 [추가] Solapi (CoolSMS) 초기화
// ======================================================================
// .env 파일에 키가 없으면 에러가 날 수 있으니 체크 필수
const messageService = new SolapiMessageService(
    process.env.SOLAPI_API_KEY || '',
    process.env.SOLAPI_API_SECRET || ''
);

// ----------------------------------------------------------------------
// 1. Firebase 초기화 (Firestore)
// ----------------------------------------------------------------------
const serviceAccount = require('./firebase_key.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

// Firestore 인스턴스 가져오기
const db = admin.firestore();

console.log("🔥 [Smart Hybrid Server] 시연 모드: IoT 확률 숨김 + Solapi 문자 연동 완료");
console.log("🔥 [Logic] 싱글=즉시신고 / 듀얼=동시감지 시 신고");

// ==========================================
// ⚙️ 사용자별 상태 관리 (Multi-User)
// ==========================================
const users = {}; 

const CONNECTION_TIMEOUT_MS = 10000; // 10초간 데이터 없으면 연결 끊김으로 간주
const CROSS_CHECK_WINDOW_MS = 3000;  // 듀얼모드에서 상대방 기다리는 시간 (3초)

app.post('/predict', async (req, res) => {
    // 🛡️ [핵심 1] 클라이언트 연결 끊김 감지 (EPIPE 방지)
    req.on('close', () => { });
    res.on('error', (err) => {
        console.error("❌ 응답 전송 중 에러 (무시함):", err.code);
    });

    const item = req.body;
    
    // 1. 데이터 유효성 검사
    if (item.acc_x === undefined) {
        if (!res.writableEnded) return res.json({ result: 0 });
        return;
    }

    // 2. 유저 ID 확인
    const userId = item.userId || 'guest';

    // ----------------------------------------------------------------
    // 👋 3. 유저 초기화
    // ----------------------------------------------------------------
    if (!users[userId]) {
        console.log(`👋 새로운 사용자 접속: ${userId}`);
        users[userId] = {
            iotBuffer: [],
            phoneBuffer: [],
            lastActiveTime: Date.now(),
            
            lastIotPacketTime: 0,
            lastPhonePacketTime: 0,

            isIoTPredicting: false,
            isPhonePredicting: false,
            isIoTCoolingDown: false,
            isPhoneCoolingDown: false,
            
            lastIotFallTime: 0,   
            lastPhoneFallTime: 0, 
            
            // isEmergencyState: 현재 비상(신고) 상태인지 여부
            isEmergencyState: false,
            recoveryCounter: 0,
            
            config: { sensitivity: 50 }
        };

        // Firestore 실시간 리스너 (앱 상태 모니터링)
        db.collection('users').doc(userId).onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                if (data.config) {
                    users[userId].config = data.config;
                }
                // 앱에서 사용자가 'NORMAL'로 바꿨다면 서버도 비상상태 해제 및 타이머 초기화
                if (data.status === 'NORMAL') {
                    if (users[userId].isEmergencyState) {
                        console.log(`✨ [${userId}] 상태 초기화 (NORMAL 복귀)`);
                    }
                    users[userId].isEmergencyState = false;
                    users[userId].recoveryCounter = 0;
                    // 낙상 기록도 초기화하여 꼬임 방지
                    users[userId].lastIotFallTime = 0;
                    users[userId].lastPhoneFallTime = 0;
                }
            }
        });
    }
    
    const user = users[userId];
    const now = Date.now();

    // ----------------------------------------------------
    // 📡 [생존 신고]
    // ----------------------------------------------------
    if (item.device_type === 'iot') {
        user.lastIotPacketTime = now;
    } else {
        user.lastPhonePacketTime = now;
    }

    // ----------------------------------------------------
    // 🔥 단위 보정 & 활동량 분석
    // ----------------------------------------------------
    let ax = item.acc_x; let ay = item.acc_y; let az = item.acc_z;
    // G단위가 아니라 m/s^2 등으로 들어오면 보정
    if (Math.abs(ax) > 5 || Math.abs(ay) > 5 || Math.abs(az) > 5) {
        ax /= 9.8; ay /= 9.8; az /= 9.8;
    }

    let svm = Math.sqrt(ax**2 + ay**2 + az**2);
    let currentStatus = "정지/휴식";
    if (svm > 2.0) { currentStatus = "🏃 활동 중"; user.lastActiveTime = now; }
    else if (svm > 1.2) { currentStatus = "🚶 걷는 중"; user.lastActiveTime = now; }

    let inactiveMinutes = Math.floor((now - user.lastActiveTime) / 1000 / 60);
    let alertMsg = inactiveMinutes >= 60 ? "⚠️ 장시간 미활동 경보!" : "";

    // -----------------------------------------------------------
    // 🏥 [NEW] 자동 회복 감지 로직 (Auto-Recovery)
    // -----------------------------------------------------------
    if (user.isEmergencyState) {
        checkAutoRecovery(userId, svm);
    }
    
    // -----------------------------------------------------------
    // 🔥 AI 모델 페이로드
    // -----------------------------------------------------------
    const payload = {
        userId: userId, 
        acc_x: item.acc_x, acc_y: item.acc_y, acc_z: item.acc_z, 
        gyro_x: item.gyro_x || 0.0, gyro_y: item.gyro_y || 0.0, gyro_z: item.gyro_z || 0.0,
        device_type: item.device_type, 
        sensitivity: item.sensitivity,
    };

    // ============================================================
    // 🤖 AI 결과 처리 및 [로그 시각화 수정]
    // ============================================================
    const handleDecision = async (deviceType, aiResultObject) => {
        if (res.writableEnded) return;

        const aiResult = aiResultObject.result;
        const probability = aiResultObject.probability; 

        // 🚨 [시연용 로그 로직] IoT는 확률을 숨기고 충격량 트리거인 척함
        let logSuffix = "";
        
        if (deviceType === 'phone') {
            const displayProb = aiResult === 1 ? probability : (1 - probability);
            const probLabel = aiResult === 1 ? 'Prob' : 'Conf';
            logSuffix = `| ${probLabel}: ${displayProb.toFixed(2)}`;
        } else {
            // IoT는 확률 숨김
            if (aiResult === 1) {
                logSuffix = "| 💥 Impact Triggered";
            } else {
                logSuffix = "| Status: Normal";
            }
        }

        // 1. AI가 정상이면 리턴
        if (aiResult === 0) {
            console.log(`   🟢 [AI Result] ${deviceType.toUpperCase()} ➡️ NORMAL (0) ${logSuffix}`);
            if (!res.writableEnded) return res.json({ result: 0, status: currentStatus });
            return;
        }

        // 2. 🚨 낙상 감지됨!
        console.log(`   🔴 [AI Result] ${deviceType.toUpperCase()} ➡️ FALL DETECTED (1) ${logSuffix}`);
        
        if (user.isEmergencyState) {
            console.log(`   ⛔ [${userId}] 이미 비상 상태입니다.`);
            if (!res.writableEnded) return res.json({ result: 1 });
            return;
        }

        // =================================================================
        // 🚦 [시각화] 기기 연결 상태 확인 (초록불/흰불 표시)
        // =================================================================
        const currentTime = Date.now();
        const isIotAlive = (currentTime - user.lastIotPacketTime) < CONNECTION_TIMEOUT_MS;
        const isPhoneAlive = (currentTime - user.lastPhonePacketTime) < CONNECTION_TIMEOUT_MS;

        const aliveStatus = `IoT:${isIotAlive ? '🟢' : '⚪️'} / Phone:${isPhoneAlive ? '🟢' : '⚪️'}`;
        console.log(`   👀 [Monitor] 현재 접속 상태 -> (${aliveStatus})`);

        // 감지된 시간 기록
        if (deviceType === 'iot') user.lastIotFallTime = currentTime;
        else user.lastPhoneFallTime = currentTime;

        // =================================================================
        // ✅ [엄격 로직] 싱글=즉시, 듀얼=동시감지 시에만 EMERGENCY
        // =================================================================
        
        // [CASE A] 듀얼 모드 (둘 다 켜져 있음)
        if (isIotAlive && isPhoneAlive) {
            const iotTriggered = (currentTime - user.lastIotFallTime) <= CROSS_CHECK_WINDOW_MS;
            const phoneTriggered = (currentTime - user.lastPhoneFallTime) <= CROSS_CHECK_WINDOW_MS;

            if (iotTriggered && phoneTriggered) {
                console.log(`   🚀 [${userId}] 듀얼 모드: 교차 검증 성공! (IoT+Phone 동시 감지)`);
                await triggerEmergency(userId, "Dual Mode Confirmed");
            } else {
                console.log(`   ⏳ [${userId}] 듀얼 모드: 반대쪽 신호 대기 중... (현재 DB 변경 없음)`);
            }
        } 
        
        // [CASE B] 싱글 모드 (하나만 켜져 있음)
        else {
            const iotIcon = deviceType === 'iot' ? '🟢' : '⚪️';
            const phoneIcon = deviceType === 'phone' ? '🟢' : '⚪️';
            
            console.log(`   ⚡ [${userId}] 싱글 모드 발동: ${deviceType.toUpperCase()} 단독 감지`);
            console.log(`      ㄴ 기기 상태: IoT ${iotIcon} / Phone ${phoneIcon} -> 즉시 신고 전송!`);
            
            await triggerEmergency(userId, `${deviceType.toUpperCase()} Single Mode`);
        }

        if (!res.writableEnded) return res.json({ result: 1 });
    };

    // 🚨 EMERGENCY 상태 확정 및 DB 업데이트 함수
    async function triggerEmergency(userId, source) {
        try {
            users[userId].isEmergencyState = true;

            await db.collection('users').doc(userId).update({
                status: 'EMERGENCY',
                last_fall_time: admin.firestore.FieldValue.serverTimestamp(),
                note: source
            });

            startCooldown(userId, 'iot');
            startCooldown(userId, 'phone');

            await db.collection('users').doc(userId).collection('logs').add({
                event: '낙상 확정(EMERGENCY)',
                source: source,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                date: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
            });

        } catch (err) {
            console.error("❌ DB 업데이트 실패:", err);
        }
    }

    // ----------------------------------------------------
    // CASE A: IoT 목걸이 (LSTM)
    // ----------------------------------------------------
    if (payload.device_type === 'iot') { 
        user.iotBuffer.push(payload);
        if (user.isIoTCoolingDown || user.isIoTPredicting) {
            if (user.iotBuffer.length > 150) user.iotBuffer.shift();
            if (!res.writableEnded) return res.json({ result: 0, status: "판독 중..." });
            return;
        }
        if (user.iotBuffer.length < 150) {
            if (!res.writableEnded) return res.json({ result: 0, status: currentStatus, svm: svm.toFixed(2), alert: alertMsg });
            return;
        }
        user.isIoTPredicting = true;
        
        console.log(`🤖 [AI SPAWN] Running predict_lstm.py for ${userId} (Buffer: ${user.iotBuffer.length})`);
        
        runAI('predict_lstm.py', user.iotBuffer, userId, async (aiResultObject) => {
            user.iotBuffer = user.iotBuffer.slice(50);
            user.isIoTPredicting = false;
            await handleDecision('iot', aiResultObject);
        });
    } 
    // ----------------------------------------------------
    // CASE B: 스마트폰 (RF)
    // ----------------------------------------------------
    else { 
        user.phoneBuffer.push(payload);
        if (user.isPhoneCoolingDown || user.isPhonePredicting) {
            if (user.phoneBuffer.length > 50) user.phoneBuffer.shift();
            if (!res.writableEnded) return res.json({ result: 0, status: "판독 중..." });
            return;
        }
        if (user.phoneBuffer.length < 50) {
            if (!res.writableEnded) return res.json({ result: 0, status: currentStatus });
            return;
        }
        user.isPhonePredicting = true;
        
        console.log(`🤖 [AI SPAWN] Running predict_rf.py for ${userId} (Buffer: ${user.phoneBuffer.length})`);
        
        runAI('predict_rf.py', user.phoneBuffer, userId, async (aiResultObject) => {
            user.phoneBuffer = user.phoneBuffer.slice(25);
            user.isPhonePredicting = false;
            await handleDecision('phone', aiResultObject);
        });
    }
});

// ======================================================================
// 🏥 자동 회복 감지 함수 (Auto-Recovery)
// ======================================================================
function checkAutoRecovery(userId, currentSvm) {
    const user = users[userId];
    if (!user) return;

    if (!user.recoveryCounter) user.recoveryCounter = 0;

    if (currentSvm > 1.2) {
        user.recoveryCounter++;
    } else {
        user.recoveryCounter = 0; 
    }

    if (user.recoveryCounter > 30) {
        console.log(`✅ [${userId}] 낙상 후 움직임 감지! -> 상태를 NORMAL로 자동 복구합니다.`);
        
        db.collection('users').doc(userId).update({
            status: 'NORMAL',
            note: 'Auto-Recovered by Movement'
        }).catch(err => console.error("복구 실패:", err));

        user.isEmergencyState = false;
        user.recoveryCounter = 0;
    }
}

// ======================================================================
// 🧊 쿨다운 함수
// ======================================================================
function startCooldown(userId, type) {
    if (!users[userId]) return;
    const cooldownTime = 5000;

    if (type === 'iot') {
        users[userId].isIoTCoolingDown = true;
        setTimeout(() => { if (users[userId]) users[userId].isIoTCoolingDown = false; }, cooldownTime);
    } else {
        users[userId].isPhoneCoolingDown = true;
        setTimeout(() => { if (users[userId]) users[userId].isPhoneCoolingDown = false; }, cooldownTime);
    }
}

// ----------------------------------------------------------------------
// 📩 [추가] Solapi 문자 전송 Helper 함수
// ----------------------------------------------------------------------
async function sendSmsWithSolapi(to, text) {
  try {
    const normalizedTo = to.replace(/\D/g, ''); // 010-8361-9106 -> 01083619106

    const res = await messageService.send({
      to: normalizedTo,                     // ✅ 최상위에 to
      from: process.env.SOLAPI_SENDER,      // ✅ 최상위에 from
      text,                                 // ✅ 최상위에 text
      // type: 'SMS',                       // (선택) 굳이 안 써도 autoTypeDetect로 알아서 SMS/LMS 결정
    });

    console.log('📨 Solapi SMS 전송 성공:', res);
    return res;
  } catch (err) {
    console.error('❌ Solapi SMS 전송 실패:', err);
    throw err;
  }
}


// ----------------------------------------------------------------------
// 🧠 AI 실행 함수 (JSON 파싱 강화 & 로그 필터링)
// ----------------------------------------------------------------------
function runAI(scriptName, bufferData, userId, callback) {
    const userConfig = users[userId]?.config || {};
    const sensitivity = userConfig.sensitivity || 50;

    const payload = {
        data: bufferData,
        config: { threshold: sensitivity }
    };

    const python = spawn('python3', [scriptName]);
    let resultString = '';
    
    python.on('error', (err) => {
        console.error(`AI 실행 불가 (${scriptName}):`, err);
        callback({ result: 0, probability: 0.0 });
    });

    python.stdin.write(JSON.stringify(payload));
    python.stdin.end(); 

    python.stdout.on('data', (data) => { resultString += data.toString(); });
    
    python.stderr.on('data', (data) => { 
        let msg = data.toString().trim();
        if (msg.includes("WARNING:absl") || msg.includes("Compiled the loaded model")) {
            return;
        }
        // 시연용 로그 필터링
        if (msg.includes("[LSTM]") && msg.includes("확률:")) {
             msg = msg.split('/ 확률')[0].trim();
        }
        if (msg) console.log(`[${userId}] 🐍 AI LOG: ${msg}`); 
    });

    python.on('close', (code) => {
        try {
            const trimmed = resultString.trim();
            const parsed = JSON.parse(trimmed);
            callback({
                result: parsed.result !== undefined ? parseInt(parsed.result) : 0,
                probability: parsed.probability !== undefined ? parseFloat(parsed.probability) : 0.0,
            });
        } catch (e) {
            console.error(`[${userId}] ⚠️ AI 응답 파싱 실패 (Raw: ${resultString})`);
            callback({ result: 0, probability: 0.0 });
        }
    });
}

// ----------------------------------------------------------------------
// 💾 DB 업데이트 (로그 기록용)
// ----------------------------------------------------------------------
async function updateDB(userId, source) {
    const now = new Date();
    try {
        await db.collection('users').doc(userId).collection('logs').add({
            event: '낙상 감지',
            source: source,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            date: now.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
        });
    } catch (err) {
        console.error("❌ Firestore 로그 저장 실패:", err);
    }
}

// ======================================================================
// 📲 [변경됨] Expo 낙상 알림(카운트다운 종료) → 실제 Solapi 문자 발송
// ======================================================================
app.post('/alert/fall', async (req, res) => {
    try {
        const { guardianContact, notifyGuardian, notify119, userId } = req.body;

        console.log(`📩 [SMS 요청] ${userId} -> ${guardianContact}`);

        // 보호자 알림 미설정 시 패스
        if (!notifyGuardian || !guardianContact) {
            return res.json({ ok: false, msg: "보호자 번호가 없거나 알림 설정이 꺼져 있습니다." });
        }

        // 메시지 내용 구성
        const msg = `[SilverGuard] 낙상이 감지되었습니다.\n사용자: ${userId}\n보호 대상자의 상태를 확인해 주세요.`;

        // Solapi 전송
        const result = await sendSmsWithSolapi(guardianContact, msg);

        return res.json({ ok: true, result });
    } catch (err) {
        console.error("❌ 처리 오류:", err);
        return res.status(500).json({ error: "처리 실패" });
    }
});

// 🛡️ [핵심 3] 최후의 에러 방어선
process.on('uncaughtException', (err) => {
    if (err.code === 'EPIPE') { /* 무시 */ } 
    else { console.error('💥 치명적 에러:', err); }
});

const PORT = 60010;
app.listen(PORT, () => {
    console.log(`✅ Smart Hybrid Server running on port ${PORT}`);
});