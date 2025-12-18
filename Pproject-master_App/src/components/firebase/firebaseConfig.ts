import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { initializeFirestore, getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

export const firebaseConfig = {
  apiKey: "AIzaSyCcIPmt2Jd_J4SMa3PKTKVCkZVaR1no61Q",
  authDomain: "silverguard-f6dfc.firebaseapp.com",
  databaseURL: "https://silverguard-f6dfc-default-rtdb.firebaseio.com",
  projectId: "silverguard-f6dfc",
  storageBucket: "silverguard-f6dfc.appspot.com",
  messagingSenderId: "663756931944",
  appId: "1:663756931944:web:c558712bd6b676c7a18cdd",
};

// 1. 앱 초기화 (타입 명시)
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 2. Firestore 초기화 (타입 명시 및 중복 초기화 방지)
let db: Firestore;

try {
  // 안드로이드 연결 끊김 방지를 위한 설정
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  });
} catch (e) {
  // 이미 초기화된 경우 기존 인스턴스 사용
  db = getFirestore(app);
}

// 3. Auth 초기화
const auth: Auth = getAuth(app);

// 4. 내보내기
export { app, db, auth };