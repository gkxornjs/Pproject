
import { initializeApp, getApps, getApp } from "firebase/app";

export const firebaseConfig = {
  apiKey: "AIzaSyCcIPmt2Jd_J4SMa3PKTKVCkZVaR1no61Q",
  authDomain: "silverguard-f6dfc.firebaseapp.com",
  databaseURL: "https://silverguard-f6dfc-default-rtdb.firebaseio.com",
  projectId: "silverguard-f6dfc",
  storageBucket: "silverguard-f6dfc.appspot.com",
  messagingSenderId: "663756931944",
  appId: "1:663756931944:web:c558712bd6b676c7a18cdd",
};

// 이미 초기화된 앱이 있으면 재사용, 없으면 새로 생성
export const app =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
