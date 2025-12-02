// src/data/mockData.js

export const REGIONS = ["강남구", "송파구", "마포구"];

export const MOCK_STATS = {
  강남구: { totalUsers: 150230, paidUsers: 137, sosToday: 4 },
  송파구: { totalUsers: 80230, paidUsers: 80, sosToday: 1 },
  마포구: { totalUsers: 45230, paidUsers: 40, sosToday: 0 },
};

export const MOCK_ALERTS = {
  강남구: [
    { time: "11:20", name: "권민재", type: "낙상 감지", status: "처리" },
    { time: "11:20", name: "하태권", type: "앱 재접속", status: "처리" },
    { time: "11:20", name: "백현종", type: "기타", status: "미처리" },
  ],
  송파구: [
    { time: "10:05", name: "임지원", type: "SOS 호출", status: "처리" },
  ],
  마포구: [
    { time: "09:30", name: "김지혁", type: "기기 분실", status: "미처리" },
  ],
};

export const MOCK_USERS = {
  강남구: [
    {
      id: 1,
      name: "권민재",
      address: "서울시 강남구 00동",
      status: "정상",
      age: 78,
      phone: "010-0000-0000",
      guardianPhone: "010-0000-0000",
      lat: 37.4979,
      lng: 127.0276,
    },
    {
      id: 2,
      name: "하태권",
      address: "서울시 강남구 00동",
      status: "정상",
      age: 82,
      phone: "010-3333-4444",
      guardianPhone: "010-7777-6666",
      lat: 378.4979,
      lng: 128.0276,
    },
    {
      id: 3,
      name: "백현종",
      address: "서울시 강남구 00동",
      status: "위험 감지",
      age: 75,
      phone: "010-5555-6666",
      guardianPhone: "010-1234-5678",
      lat: 36.4979,
      lng: 126.0276,
    },
  ],
  송파구: [
    {
      id: 4,
      name: "임지원",
      address: "서울시 송파구 00동",
      status: "정상",
      age: 80,
      phone: "010-0000-1111",
      guardianPhone: "010-2222-3333",
      lat: 35.4979,
      lng: 125.0276,
    },
  ],
  마포구: [
    {
      id: 5,
      name: "김지혁",
      address: "서울시 마포구 00동",
      status: "위험 감지",
      age: 77,
      phone: "010-4444-5555",
      guardianPhone: "010-6666-7777",
      lat: 33.4979,
      lng: 123.0276,
    },
  ],
};