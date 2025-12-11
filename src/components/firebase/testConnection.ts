// src/components/firebase/testConnection.ts
import { getDatabase, ref, set } from "firebase/database";
import { app } from "./firebaseConfig";

// 여기서 app을 이용해 db를 한 번만 만든다
const db = getDatabase(app);

// Firebase 연결 테스트
export default async function testFirebaseConnection() {
  try {
    await set(ref(db, "testConnection"), {
      status: "connected",
      timestamp: Date.now(),
    });
    console.log("🔥 Firebase 연결 성공!");
  } catch (error) {
    console.error("❌ Firebase 연결 실패:", error);
  }
}
