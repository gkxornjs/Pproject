import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Alert, Text, LogBox } from 'react-native';
import { Accelerometer, AccelerometerMeasurement } from 'expo-sensors';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔥 [Firebase] Config에서 설정된 db 가져오기
import { doc, onSnapshot, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './src/components/firebase/firebaseConfig'; 

import { OnboardingScreen } from './src/components/screens/OnboardingScreen';
import { HomeScreen } from './src/components/screens/HomeScreen';
import { FallAlertScreen } from './src/components/screens/FallAlertScreen';
import { SettingsScreen } from './src/components/screens/SettingsScreen';
import { LocationScreen } from './src/components/screens/LocationScreen';
import { LogsScreen } from './src/components/screens/LogsScreen';

// 🔇 경고 무시
LogBox.ignoreLogs(['Unsupported top level event type']);

// 🔥 [설정] 내 노트북(서버) IP 주소
const SERVER_URL = 'http://192.168.3.3:60010/predict'; 

type Screen = 'onboarding' | 'home' | 'alert' | 'settings' | 'logs' | 'location';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [currentAddress, setCurrentAddress] = useState<string>('위치 정보를 불러오는 중...');
  
  // 🔥 [ID] 초기값은 비워두고, useEffect에서 로드합니다. (중복 방지)
  const [myUserId, setMyUserId] = useState<string>('');

  const [sensorPermission, setSensorPermission] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState(false);

  // 사용자 설정 State
  const [userName, setUserName] = useState('');
  const [userAge, setUserAge] = useState('');
  const [userContact, setUserContact] = useState('');
  const [guardianContact, setGuardianContact] = useState('');
  const [sensitivity, setSensitivity] = useState(50);
  const [notifyGuardian, setNotifyGuardian] = useState(true);
  const [notify119, setNotify119] = useState(false);
  const [alertCountdown, setAlertCountdown] = useState(10); 

  const [data, setData] = useState({ x: 0, y: 0, z: 0 });
  const [subscription, setSubscription] = useState<any>(null); 

  const currentSensorRef = useRef({ x: 0, y: 0, z: 0 });
  const lastAlertTimeRef = useRef<number>(0);
  
  // 🔥 [로그용] 이전 상태 기억
  const lastStatusRef = useRef<string>(''); 

  // ---------------------------------------------------------
  // 🐛 [로그] 위치 변경 감지 함수
  // ---------------------------------------------------------
  const handleAddressChange = (newAddress: string) => {
    console.log(`📍 [위치] 주소가 변경되었습니다: ${newAddress}`);
    setCurrentAddress(newAddress);
  };

  // ---------------------------------------------------------
  // 🐛 [디버깅] DB 로드 확인
  // ---------------------------------------------------------
  useEffect(() => {
    if (!db) console.error("❌ DB 객체 없음! firebaseConfig.ts를 확인하세요.");
    else console.log("✅ DB 객체 로드됨.");
  }, []);

  // ---------------------------------------------------------
  // 🆔 1. 앱 시작 시 ID 생성 및 설정 불러오기
  // ---------------------------------------------------------
  useEffect(() => {
    const initUser = async () => {
      try {
        // 1. 기기에 저장된 ID가 있는지 확인
        let userId = await AsyncStorage.getItem('SILVER_GUARD_USER_ID');
        
        // 2. 없으면 새로 생성 (랜덤)
        if (!userId) {
          const timestamp = Date.now();
          const random = Math.floor(Math.random() * 1000);
          userId = `user_${timestamp}_${random}`;
          
          await AsyncStorage.setItem('SILVER_GUARD_USER_ID', userId);
          console.log("✨ 새로운 유저 ID 생성됨:", userId);
        } else {
          console.log("✅ 기존 유저 ID 로드됨:", userId);
        }
        
        setMyUserId(userId);
        
        // 3. Firestore에서 정보 가져오기
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          console.log("🟢 [Firestore] 기존 유저 정보 불러옴");
          const data = docSnap.data();
          if (data.config) {
            const conf = data.config;
            
            // 🔥 [FIX] 모든 텍스트/숫자 필드 로드 로직 강화 (null/undefined 체크)
            if (conf.userName != null) setUserName(conf.userName);
            if (conf.userAge != null) setUserAge(conf.userAge); 
            if (conf.userContact != null) setUserContact(conf.userContact); 
            if (conf.guardianContact != null) setGuardianContact(conf.guardianContact);
            
            if (conf.sensitivity !== undefined) setSensitivity(conf.sensitivity); 
            if (conf.alertCountdown !== undefined) setAlertCountdown(conf.alertCountdown); 
            
            if (conf.notifyGuardian !== undefined) setNotifyGuardian(conf.notifyGuardian);
            if (conf.notify119 !== undefined) setNotify119(conf.notify119);

            // 추가: 저장된 currentAddress가 있다면 로드 (위치 로딩은 LocationScreen이 담당)
            if (data.currentAddress != null) setCurrentAddress(data.currentAddress); 

            console.log(`📋 [설정 로드 완료] ${conf.userName}, ${conf.userAge}세`);
          }
        } else {
            console.log("🟡 [Firestore] 신규 유저 생성 (문서 초기화)");
            await setDoc(docRef, { created_at: new Date(), status: 'NORMAL', currentAddress: '위치 정보 미기록' }, { merge: true });
        }
      } catch (e: any) {
        console.error("🔴 초기화 에러:", e.message);
      }
    };
    initUser();
  }, []); // 앱 켤 때 한 번만 실행

  // ---------------------------------------------------------
  // 🔥 [핵심] 파이어베이스 실시간 리스너 (상태 모니터링)
  // ---------------------------------------------------------
  useEffect(() => {
    if (!myUserId || !db) return;

    console.log("👀 실시간 리스너 시작...");
    
    const unsub = onSnapshot(doc(db, "users", myUserId), (docSnap) => {
        if (docSnap.exists()) {
            const fbData = docSnap.data();
            const status = fbData.status;
            
            // 🔥 [로그] 상태 변경 시에만 출력
            if (status !== lastStatusRef.current) {
                console.log(`🔄 [상태 변경] ${lastStatusRef.current || '없음'} ➡️ ${status}`);
                lastStatusRef.current = status;
            }

            // 1. 낙상 확정 (EMERGENCY)
            if (status === 'EMERGENCY') {
                let serverTime = 0;
                if (fbData.last_fall_time?.toMillis) {
                    serverTime = fbData.last_fall_time.toMillis();
                } else {
                    serverTime = Date.now();
                }

                // 최근 5초 이내의 알림만 처리 (중복 방지)
                const isRecent = (Date.now() - serverTime) < 5000; 

                if (serverTime > lastAlertTimeRef.current && isRecent) {
                    console.log("🚨 [App] 서버 명령: 낙상 발생! 화면 띄움");
                    setCurrentScreen('alert');
                    lastAlertTimeRef.current = serverTime; 
                }
            }

            // 2. 교차 검증 요청 (VERIFY_REQUEST)
            if (status === 'VERIFY_REQUEST') {
                handleCrossCheck(fbData.iot_g_force);
            }
        }
    });

    return () => unsub();
  }, [myUserId]);

  // ---------------------------------------------------------
  // 🤝 교차 검증 로직
  // ---------------------------------------------------------
  const handleCrossCheck = async (iotGForce: number) => {
    console.log(`🤔 [교차검증] IoT(${iotGForce.toFixed(1)}g). 폰 확인 중...`);
    
    const { x, y, z } = currentSensorRef.current;
    const phoneGForce = Math.sqrt(x*x + y*y + z*z); 
    const THRESHOLD = 12.0; // 약 1.2g

    if (phoneGForce > THRESHOLD) {
        console.log(`🚨 [검증] 폰도 충격(${phoneGForce.toFixed(1)}). 확정!`);
        await updateDoc(doc(db, "users", myUserId), {
            status: 'EMERGENCY',
            last_fall_time: new Date(),
            note: 'Verified by Phone'
        });
        setCurrentScreen('alert');
    } else {
        console.log(`✅ [검증] 폰은 정상(${phoneGForce.toFixed(1)}). 무시.`);
        await updateDoc(doc(db, "users", myUserId), {
            status: 'FALSE_ALARM',
            note: 'Phone sensor normal'
        });
    }
  };

  // ---------------------------------------------------------
  // 💾 설정 저장 (로그 포함)
  // ---------------------------------------------------------
  const saveSettingsToFirebase = async () => {
    if (!myUserId) return; 
    console.log(`🔥 설정 저장 시작... (${userName})`);
    
    try {
        const userRef = doc(db, "users", myUserId);
        await setDoc(userRef, {
            config: {
                userName, userAge, userContact, guardianContact, sensitivity, 
                notifyGuardian, notify119, alertCountdown,
                updatedAt: new Date()
            }
        }, { merge: true }); 

        console.log(`📝 [설정 완료] 이름:${userName}, 보호자:${guardianContact}, 민감도:${sensitivity}`);
        Alert.alert("저장 완료", "설정이 저장되었습니다.");
    } catch (error: any) {
        console.error("❌ 저장 실패:", error.message);
        Alert.alert("저장 실패", error.message);
    }
  };

  // ---------------------------------------------------------
  // 📡 센서 구독 및 서버 전송 (에러 로깅 강화)
  // ---------------------------------------------------------
  const sendDataToServer = async (x: number, y: number, z: number) => {
    if (!myUserId) return; // ID가 없으면 전송 안 함
    try {
      await fetch(SERVER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: myUserId, 
          acc_x: x, acc_y: y, acc_z: z, 
          device_type: 'phone', 
          sensitivity: sensitivity
        }),
      });
    } catch (error: any) { 
        // 🚨 [CRITICAL FIX] 에러 발생 시 로그 출력
        if (error.message && error.message.includes("Network request failed")) {
            console.error("❌ [전송 실패] 네트워크 오류! 서버 IP(172.30.1.12) 또는 포트(60010)를 확인하세요! (서버가 켜져 있는지 확인)");
        } else if (error.message && error.message.includes("timed out")) {
             console.error("❌ [전송 실패] 연결 시간 초과! 서버 IP/포트 문제, 또는 방화벽 확인 필수!");
        } else {
            console.error("❌ [전송 실패] 기타 에러:", error.message);
        }
    }
  };

  const _subscribe = () => {
    // 100ms 간격으로 데이터 전송
    Accelerometer.setUpdateInterval(100); 
    setSubscription(
      Accelerometer.addListener((accelerometerData: AccelerometerMeasurement) => {
        // g -> m/s^2 변환
        const x = accelerometerData.x * 9.8;
        const y = accelerometerData.y * 9.8;
        const z = accelerometerData.z * 9.8;

        setData(accelerometerData);
        currentSensorRef.current = { x, y, z };
        
        // 🔥 [디버깅 로그 추가] 센서 값이 읽히는지 확인
        const currentSVM = Math.sqrt(x*x + y*y + z*z);
        if (Date.now() % 500 < 100) { // 0.5초에 한 번만 찍도록 제한
             console.log(`🟢 [SENSOR READ] SVM: ${currentSVM.toFixed(2)} g`);
        }
        
        sendDataToServer(x, y, z);
      })
    );
  };

  const _unsubscribe = () => {
    subscription?.remove();
    setSubscription(null);
  };

  useEffect(() => {
    // ID가 로드되고 Home 화면일 때만 구독 시작
    if (myUserId && currentScreen === 'home') _subscribe(); 
    else _unsubscribe();
    return () => _unsubscribe();
  }, [currentScreen, myUserId]); // myUserId가 로드될 때도 구독 재시작

  // ---------------------------------------------------------
  // UI 핸들러
  // ---------------------------------------------------------
  const handleStart = () => { if (sensorPermission && notificationPermission) setCurrentScreen('home'); };
  const handleSensorPermission = () => setSensorPermission(true);
  const handleNotificationPermission = () => setNotificationPermission(true);
  
  const simulateFall = async () => {
      if (!myUserId) return;
      console.log("🧪 [테스트] 강제 낙상 시뮬레이션 실행");
      await updateDoc(doc(db, "users", myUserId), {
          status: 'EMERGENCY',
          last_fall_time: new Date(),
          note: 'Simulation'
      });
      setCurrentScreen('alert');
  };

  const cancelAlert = async () => {
    if (!myUserId) return;
    console.log("✅ [취소] 알림 종료, 상태 복구");
    await updateDoc(doc(db, "users", myUserId), {
        status: 'NORMAL',
        note: 'Cancelled by User'
    });
    setCurrentScreen('home');
  };

  const navigateTo = (screen: Screen) => setCurrentScreen(screen);

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {/* 디버깅용 ID 표시 (시연 시 참고용) */}
        <View style={{position: 'absolute', top: 50, right: 20, zIndex: 999}}>
          <Text style={{fontSize: 10, color: '#aaa'}}>ID: {myUserId}</Text>
        </View>

        {currentScreen === 'onboarding' && (
          <OnboardingScreen
            onStart={handleStart}
            onSensorPermission={handleSensorPermission}
            onNotificationPermission={handleNotificationPermission}
            sensorGranted={sensorPermission}
            notificationGranted={notificationPermission}
          />
        )}

        {currentScreen === 'home' && (
          <HomeScreen onNavigate={navigateTo} onSimulateFall={simulateFall} address={currentAddress} />
        )}

        {currentScreen === 'alert' && (
          <FallAlertScreen
            onCancel={cancelAlert}
            countdownSeconds={alertCountdown}
            notifyGuardian={notifyGuardian}
            notify119={notify119}
            guardianContact={guardianContact}
            userId={myUserId} // 🔥 userId prop 전달 (App.tsx 오류 해결)
          />
        )}

        {currentScreen === 'settings' && (
          <SettingsScreen
            onNavigate={navigateTo}
            userName={userName} setUserName={setUserName}
            userAge={userAge} setUserAge={setUserAge} 
            userContact={userContact} setUserContact={setUserContact} 
            guardianContact={guardianContact} setGuardianContact={setGuardianContact}
            sensitivity={sensitivity} setSensitivity={setSensitivity}
            notifyGuardian={notifyGuardian} setNotifyGuardian={setNotifyGuardian}
            notify119={notify119} setNotify119={setNotify119}
            alertCountdown={alertCountdown} setAlertCountdown={setAlertCountdown}
            onSave={saveSettingsToFirebase} 
          />
        )}

        {currentScreen === 'location' && (
          <LocationScreen 
            onNavigate={navigateTo} 
            setGlobalAddress={handleAddressChange} 
            userId={myUserId} 
          />
        )}

        {currentScreen === 'logs' && (
            <LogsScreen 
                onNavigate={navigateTo} 
                userId={myUserId} 
            />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
});