const express = require('express');
const { spawn } = require('child_process');
const admin = require('firebase-admin');

const app = express();
app.use(express.json());

// ----------------------------------------------------------------------
// 1. Firebase 초기화
// ----------------------------------------------------------------------
const serviceAccount = require('./firebase_key.json');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://silverguard-f6dfc-default-rtdb.firebaseio.com/"
    });
}
const db = admin.database();

console.log("🔥 [Smart Hybrid Server] 연결 상태에 따라 '즉시 알림' vs '교차 검증' 자동 전환!");

// ==========================================
// ⚙️ 사용자별 상태 관리 (Multi-User)
// ==========================================
const users = {}; 

// ⏳ [설정]
const CROSS_CHECK_WINDOW_MS = 3000;  // 교차 검증 대기 시간 (3초)
const CONNECTION_TIMEOUT_MS = 10000; // 10초간 데이터 없으면 연결 끊김으로 간주

app.post('/predict', (req, res) => {
    const item = req.body;
    
    // 1. 데이터 유효성 검사
    if (item.acc_x === undefined) return res.json({ result: 0 });

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
            
            // 📡 [연결 상태 추적용] 마지막 데이터 수신 시간
            lastIotPacketTime: 0,
            lastPhonePacketTime: 0,

            isIoTPredicting: false,
            isPhonePredicting: false,
            isIoTCoolingDown: false,
            isPhoneCoolingDown: false,
            
            // 🛑 [크로스체크용] 낙상 감지 시점
            lastIotFallTime: 0,   
            lastPhoneFallTime: 0, 
            
            config: { sensitivity: 50 }
        };

        db.ref(`users/${userId}/config`).on('value', (snapshot) => {
            const remoteConfig = snapshot.val();
            if (remoteConfig) {
                users[userId].config = remoteConfig;
            }
        });
    }
    
    const user = users[userId];
    const now = Date.now();

    // ----------------------------------------------------
    // 📡 [생존 신고] 기기별 마지막 패킷 시간 갱신
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
    if (Math.abs(ax) > 5 || Math.abs(ay) > 5 || Math.abs(az) > 5) {
        ax /= 9.8; ay /= 9.8; az /= 9.8;
    }

    let svm = Math.sqrt(ax**2 + ay**2 + az**2);
    let currentStatus = "정지/휴식";
    if (svm > 2.0) { currentStatus = "🏃 활동 중"; user.lastActiveTime = now; }
    else if (svm > 1.2) { currentStatus = "🚶 걷는 중"; user.lastActiveTime = now; }

    let inactiveMinutes = Math.floor((now - user.lastActiveTime) / 1000 / 60);
    let alertMsg = inactiveMinutes >= 60 ? "⚠️ 장시간 미활동 경보!" : "";

    // ============================================================
    // 🤖 AI 결과 처리 및 [스마트 분기 로직]
    // ============================================================
    const handleDecision = (deviceType, aiResult) => {
        // 1. AI가 정상이면 바로 리턴
        if (aiResult === 0) return res.json({ result: 0, status: currentStatus });

        // 2. AI가 낙상 감지함! (후보 등록)
        const currentTime = Date.now();
        
        // 🔥 [연결 상태 체크] (최근 10초 내에 데이터가 있었는가?)
        const isIotAlive = (currentTime - user.lastIotPacketTime) < CONNECTION_TIMEOUT_MS;
        const isPhoneAlive = (currentTime - user.lastPhonePacketTime) < CONNECTION_TIMEOUT_MS;

        // 낙상 감지 시간 기록
        if (deviceType === 'iot') user.lastIotFallTime = currentTime;
        else user.lastPhoneFallTime = currentTime;

        // 로그 출력
        const aliveStatus = `IoT:${isIotAlive ? '🟢' : '❌'} / Phone:${isPhoneAlive ? '🟢' : '❌'}`;
        console.log(`🚨 [${userId}] ${deviceType.toUpperCase()} 감지됨! (${aliveStatus})`);

        // ---------------------------------------------------------
        // 🔥 [분기점] 듀얼 모드(AND) vs 싱글 모드(OR)
        // ---------------------------------------------------------
        
        // [CASE A] 둘 다 살아있음 -> 엄격한 교차 검증 필요
        if (isIotAlive && isPhoneAlive) {
            if (checkCrossCheck(userId)) {
                // 성공: 둘 다 감지됨
                updateDB(userId, "IoT+스마트폰 (교차검증)");
                return res.json({ result: 1 }); // 진짜 낙상 알림
            } else {
                // 실패: 아직 짝꿍 신호 안 옴
                console.log(`   ⏳ [${userId}] 듀얼 모드 작동 중: 짝꿍 신호 대기 (앱엔 비밀로 함 🤫)`);
                return res.json({ result: 0, status: "대기중..." }); // 앱 울리지 마!
            }
        } 
        
        // [CASE B] 하나만 살아있음 -> 즉시 낙상 인정 (안전 최우선)
        else {
            const sourceMsg = deviceType === 'iot' ? "IoT 단독감지 (폰 끊김)" : "스마트폰 단독감지 (IoT 끊김)";
            console.log(`   ⚡ [${userId}] 싱글 모드 발동: ${sourceMsg} -> 즉시 알림 전송!`);
            
            updateDB(userId, sourceMsg);
            startCooldown(userId, deviceType); // 쿨타임 적용
            
            return res.json({ result: 1 }); // 앱 울려라!
        }
    };

    // ----------------------------------------------------
    // CASE A: IoT 목걸이 (LSTM)
    // ----------------------------------------------------
    if (item.device_type === 'iot') {
        user.iotBuffer.push(item);

        if (user.isIoTCoolingDown || user.isIoTPredicting) {
            if (user.iotBuffer.length > 150) user.iotBuffer.shift();
            return res.json({ result: 0, status: "판독 중..." });
        }

        if (user.iotBuffer.length < 150) {
            return res.json({ result: 0, status: currentStatus, svm: svm.toFixed(2), alert: alertMsg });
        }

        user.isIoTPredicting = true;
        
        runAI('predict_lstm.py', user.iotBuffer, userId, (result) => {
            user.iotBuffer = user.iotBuffer.slice(50);
            user.isIoTPredicting = false;
            handleDecision('iot', result);
        });
    } 
    // ----------------------------------------------------
    // CASE B: 스마트폰 (RF)
    // ----------------------------------------------------
    else {
        user.phoneBuffer.push(item);

        if (user.isPhoneCoolingDown || user.isPhonePredicting) {
            if (user.phoneBuffer.length > 50) user.phoneBuffer.shift();
            return res.json({ result: 0, status: "판독 중..." });
        }
        
        if (user.phoneBuffer.length < 50) return res.json({ result: 0, status: currentStatus });

        user.isPhonePredicting = true;
        
        runAI('predict_rf.py', user.phoneBuffer, userId, (result) => {
            user.phoneBuffer = user.phoneBuffer.slice(25);
            user.isPhonePredicting = false;
            handleDecision('phone', result);
        });
    }
});

// ======================================================================
// 🛡️ 교차 검증 함수 (둘 다 최근에 감지됐는지 확인)
// ======================================================================
function checkCrossCheck(userId) {
    const user = users[userId];
    if (!user) return false;

    const now = Date.now();
    const iotDiff = now - user.lastIotFallTime;
    const phoneDiff = now - user.lastPhoneFallTime;

    // "두 기기 모두 최근 3초 안에 비명 질렀는가?"
    if (iotDiff <= CROSS_CHECK_WINDOW_MS && phoneDiff <= CROSS_CHECK_WINDOW_MS) {
        console.log(`   🚑 [${userId}] 교차 검증 성공! (IoT와 폰 동시 감지)`);
        
        // 중복 방지 리셋 & 쿨타임
        user.lastIotFallTime = 0; 
        user.lastPhoneFallTime = 0;
        startCooldown(userId, 'iot');
        startCooldown(userId, 'phone');
        return true;
    }
    return false;
}

// ----------------------------------------------------------------------
// ❄️ 쿨타임 함수
// ----------------------------------------------------------------------
function startCooldown(userId, type) {
    if (!users[userId]) return;
    
    if (type === 'iot') {
        users[userId].isIoTCoolingDown = true;
        setTimeout(() => { if (users[userId]) users[userId].isIoTCoolingDown = false; }, 10000);
    } else {
        users[userId].isPhoneCoolingDown = true;
        setTimeout(() => { if (users[userId]) users[userId].isPhoneCoolingDown = false; }, 10000);
    }
}

// ----------------------------------------------------------------------
// 🧠 AI 실행 함수
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
    
    python.stdin.write(JSON.stringify(payload));
    python.stdin.end(); 

    python.stdout.on('data', (data) => { resultString += data.toString(); });
    python.stderr.on('data', (data) => { 
        const msg = data.toString().trim();
        // 로그 깔끔하게 필터링
        if (msg.includes("RF") || msg.includes("LSTM") || msg.includes("CRITICAL") || msg.includes("제외")) {
            console.log(`[${userId}]    ${msg}`);
        } else if (msg.includes("ERROR")) {
            console.error(`[${userId}]    🐍 [Error]: ${msg}`);
        }
    });

    python.on('close', (code) => {
        const result = parseInt(resultString.trim());
        callback(isNaN(result) ? 0 : result);
    });
}

// ----------------------------------------------------------------------
// 💾 DB 업데이트 함수
// ----------------------------------------------------------------------
function updateDB(userId, source) {
    const now = new Date();
    const kstString = now.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

    db.ref(`users/${userId}`).update({
        status: 'emergency',
        last_event: 'fall_detected',
        timestamp: admin.database.ServerValue.TIMESTAMP
    }).catch(err => console.error("DB Error:", err));

    db.ref(`users/${userId}/logs`).push({
        event: '낙상 감지(확정)',
        source: source,
        timestamp: admin.database.ServerValue.TIMESTAMP,
        date: kstString
    }).then(() => {
        console.log(`💾 [DB] 낙상 기록 저장 완료! (${source})`);
    }).catch(err => console.error("DB Log Error:", err));
}

const PORT = 60010;
app.listen(PORT, () => {
    console.log(`✅ Smart Hybrid Server running on port ${PORT}`);
});