import React, { useState, useEffect, useMemo, useRef } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, query, orderBy, getDocs } from "firebase/firestore"; 

// ----------------------------------------------------------------------
// 1. CSS 스타일
// ----------------------------------------------------------------------
const GlobalStyles = () => (
  <style>{`
    body { margin: 0; font-family: 'Inter', sans-serif; background-color: #f3f4f6; }
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
    
    .app { display: flex; height: 100vh; overflow: hidden; }
    .sidebar { width: 260px; background: white; border-right: 1px solid #e5e7eb; display: flex; flex-direction: column; flex-shrink: 0; }
    .main { flex: 1; padding: 32px; overflow-y: auto; display: flex; flex-direction: column; gap: 24px; }
    
    .card { background: white; border-radius: 16px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); display: flex; flex-direction: column; }
    .card-header { padding: 16px 24px; border-bottom: 1px solid #f9fafb; display: flex; justify-content: space-between; align-items: center; background: #fff; }
    .card-title { font-size: 16px; font-weight: bold; color: #111827; }
    .card-subtitle { font-size: 13px; color: #6b7280; }
    
    .table { width: 100%; border-collapse: collapse; font-size: 14px; text-align: left; }
    .table th { padding: 12px 16px; color: #6b7280; font-weight: 500; border-bottom: 1px solid #e5e7eb; background: #f9fafb; font-size: 12px; white-space: nowrap; }
    .table td { padding: 12px 16px; border-bottom: 1px solid #f3f4f6; color: #374151; vertical-align: middle; }
    .empty-cell { text-align: center; padding: 40px; color: #9ca3af; }
    
    .tag { padding: 4px 10px; border-radius: 99px; font-size: 11px; font-weight: bold; }
    .tag-safe { background: #dcfce7; color: #166534; }
    .tag-danger { background: #fee2e2; color: #991b1b; }
    .tag-unknown { background: #fef9c3; color: #a16207; }

    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
    
    .stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .middle-row { display: grid; grid-template-columns: 450px 1fr; gap: 24px; height: 500px; }
  `}</style>
);

// ----------------------------------------------------------------------
// 2. Firebase 설정 (RTDB -> Firestore로 변경)
// ----------------------------------------------------------------------
const firebaseConfig = {
  // 🚨 Firestore 프로젝트 설정 (프로젝트 ID만 사용)
  projectId: "silverguard-f6dfc", 
};

// 🚨 RTDB 대신 Firestore 객체 사용
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app); 

// ----------------------------------------------------------------------
// 3. 유틸리티 함수 (Utility Functions)
// ----------------------------------------------------------------------
const parseAddressInfo = (fullAddress) => {
  if (!fullAddress || fullAddress === '위치 미상') return { city: "미지정", district: "미지정" };
  const parts = fullAddress.split(" ");
  let city = parts[0];
  
  if (city.includes("서울")) city = "서울특별시";
  else if (city.includes("인천")) city = "인천광역시";
  
  let district = parts.length >= 2 ? parts[1] : "전체";
  return { city, district };
};

const formatAddressDisplay = (fullAddress) => {
  if (!fullAddress) return "위치 미상";
  const { city, district } = parseAddressInfo(fullAddress);
  const shortCity = city.replace("특별시", "").replace("광역시", "").replace("특별자치시", "");
  return `${shortCity} ${district}`;
};

const formatPhoneNumber = (text) => {
  if (!text) return "-";
  // Firestore에 "010-..." 형태로 저장되어 있다면 '-'를 유지
  const cleaned = text.toString().replace(/[^0-9]/g, '');
  if (cleaned.length <= 3) return cleaned;
  else if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  else return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
};

// 🔥 로그 상태 변환 함수 (모바일/서버와 통일)
const translateLogStatus = (status) => {
  if (!status) return '알 수 없음';
  const s = status.toUpperCase();
  if (s === 'EMERGENCY') return '응급 호출';
  if (s === 'NORMAL' || s === 'SAFE') return '안전 복귀';
  if (s === 'SIMULATION') return '테스트 호출';
  if (s === 'CANCELLED BY USER') return '사용자 취소';
  return status;
};

// ----------------------------------------------------------------------
// 4. 컴포넌트들
// ----------------------------------------------------------------------

const Sidebar = ({ groupedRegions, selectedRegion, onSelectRegion, users }) => {
  const getDangerCount = (city, district = null) => {
    if (!users) return 0;
    return users.filter(u => {
      const cityMatch = u.city === city;
      const districtMatch = district ? u.district === district : true;
      return cityMatch && districtMatch && u.status === '위험';
    }).length;
  };
  const regions = groupedRegions || {};

  return (
    <aside className="sidebar">
      <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #3b82f6, #059669)', borderRadius: '8px' }} />
        <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#111' }}>SilverGuard 관제</div>
      </div>
      <nav style={{ padding: '0 12px', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 'bold', marginBottom: '8px', paddingLeft: '12px' }}>DASHBOARD</div>
        <button onClick={() => onSelectRegion({ city: "전체", district: "전체" })}
          style={{ width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: '12px', border: 'none', background: selectedRegion.city === "전체" ? '#eff6ff' : 'transparent', color: selectedRegion.city === "전체" ? '#2563eb' : '#4b5563', fontWeight: selectedRegion.city === "전체" ? '600' : '400', cursor: 'pointer', marginBottom: '16px' }}>
          Overview
        </button>
        <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 'bold', marginBottom: '8px', paddingLeft: '12px' }}>지역 선택</div>
        {Object.keys(regions).map((city) => {
          const cityDangerCount = getDangerCount(city);
          const isCityActive = selectedRegion.city === city;
          return (
            <div key={city} style={{ marginBottom: '4px' }}>
              <button onClick={() => onSelectRegion({ city: city, district: "전체" })}
                style={{ width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: isCityActive ? '#1f2937' : '#6b7280', fontWeight: 'bold', fontSize: '14px' }}>
                <span>{city}</span>
                {cityDangerCount > 0 && <span style={{ backgroundColor: '#fee2e2', color: '#dc2626', fontSize: '10px', padding: '2px 6px', borderRadius: '99px' }}>! {cityDangerCount}</span>}
              </button>
              {isCityActive && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '12px', borderLeft: '2px solid #f3f4f6', marginLeft: '12px', marginTop: '4px' }}>
                  {regions[city].map((district) => {
                    const distDangerCount = getDangerCount(city, district);
                    const isDistActive = selectedRegion.district === district;
                    return (
                      <button key={district} onClick={() => onSelectRegion({ city: city, district: district })}
                        style={{ textAlign: 'left', padding: '8px 12px', borderRadius: '8px', border: 'none', background: isDistActive ? '#eff6ff' : 'transparent', color: isDistActive ? '#2563eb' : '#6b7280', fontWeight: isDistActive ? '600' : '400', fontSize: '13px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{district}</span>
                        {distDangerCount > 0 && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

const MapCard = ({ region, users }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  const center = useMemo(() => {
    // 맵 중앙 계산 로직 유지
    const validUsers = users.filter(u => u.lat && u.lng && u.lat !== 0 && u.lng !== 0);
    if (validUsers.length === 0) return { lat: 37.5665, lng: 126.9780 };
    if (validUsers.length === 1) return { lat: validUsers[0].lat, lng: validUsers[0].lng };
    const total = validUsers.reduce((acc, u) => ({ lat: acc.lat + u.lat, lng: acc.lng + u.lng }), { lat: 0, lng: 0 });
    return { lat: total.lat / validUsers.length, lng: total.lng / validUsers.length };
  }, [users]);

  useEffect(() => {
    const loadLeaflet = () => {
      if (window.L) { initMap(); return; }
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement("link");
        link.id = "leaflet-css"; link.rel = "stylesheet"; link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = initMap;
      document.body.appendChild(script);
    };
    const initMap = () => {
      if (!mapContainerRef.current || !window.L) return;
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
      try {
        const map = window.L.map(mapContainerRef.current, { zoomControl: false, attributionControl: false }).setView([center.lat, center.lng], 13);
        window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
        window.L.control.zoom({ position: 'bottomright' }).addTo(map);
        const layerGroup = window.L.layerGroup().addTo(map);
        mapInstanceRef.current = map;
        layerGroupRef.current = layerGroup;
        updateMap(map, layerGroup, center, users);
      } catch (e) { console.warn("Map init warning", e); }
    };
    loadLeaflet();
    return () => { if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; } };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && layerGroupRef.current && window.L) {
      updateMap(mapInstanceRef.current, layerGroupRef.current, center, users);
    }
  }, [center, users]);

  const updateMap = (map, layerGroup, center, users) => {
    try {
      if (center && Number.isFinite(center.lat)) {
        map.setView([center.lat, center.lng], (users.length === 1) ? 15 : 12, { animate: false });
      }
      layerGroup.clearLayers();
      users.forEach(u => {
        if (!u.lat || !u.lng || u.lat === 0) return;
        const color = u.status === "위험" ? "#ef4444" : "#22c55e";
        const marker = window.L.circleMarker([u.lat, u.lng], { radius: 8, fillColor: color, color: "#fff", weight: 2, opacity: 1, fillOpacity: 0.9 });
        marker.bindPopup(`<div style="font-size:13px"><b>${u.name}</b><br/>${u.originalAddress}<br/><span style="color:${color}">${u.status}</span></div>`);
        marker.addTo(layerGroup);
      });
    } catch (e) { console.warn("Map update error", e); }
  };

  const safeCount = users.filter(u => u.status === '정상').length;
  const dangerCount = users.filter(u => u.status === '위험').length;

  return (
    <div className="card" style={{ height: '100%' }}>
      <div className="card-header">
        <span className="card-title">지도</span>
        <span className="card-subtitle">
          {typeof region === 'string' ? region : `${region.city} ${region.district === '전체' ? '' : region.district}`} · 
          <span style={{ color: '#16a34a', fontWeight: 'bold', marginLeft: 4 }}>안전 {safeCount}</span> · 
          <span style={{ color: '#dc2626', fontWeight: 'bold', marginLeft: 4 }}>위험 {dangerCount}</span>
        </span>
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
};

// [RecentAlerts]
const RecentAlerts = ({ alerts, region }) => (
  <div className="card" style={{ height: '100%' }}>
    <div className="card-header">
      <span className="card-title">최근 알림</span>
      <span className="card-subtitle">{typeof region === 'string' ? region : `${region.city} ${region.district === '전체' ? '' : region.district}`}</span>
    </div>
    <div style={{ flex: 1, overflowY: 'auto' }}>
      <table className="table">
        <thead>
          <tr>
            <th style={{ width: '90px' }}>날짜</th>
            <th style={{ width: '70px' }}>시간</th>
            <th style={{ width: '80px' }}>성명</th>
            <th>내용</th>
          </tr>
        </thead>
        <tbody>
          {alerts.length === 0 ? <tr><td colSpan={4} className="empty-cell">알림이 없습니다.</td></tr> : alerts.map((alert, i) => (
            <tr key={alert.id || i}>
              <td>{alert.date}</td>
              <td style={{ fontWeight: 'bold' }}>{alert.time}</td>
              <td>{alert.name}</td>
              <td>
                <span style={{ background: '#fff1f2', color: '#be123c', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', display: 'inline-block' }}>
                  {alert.content}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const StatCard = ({ title, value, description, color = '#111827' }) => (
  <div className="card" style={{ padding: '24px' }}>
    <h3 style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px 0' }}>{title}</h3>
    <div style={{ fontSize: '28px', fontWeight: '800', color: color, marginBottom: '4px' }}>{value}</div>
    <div style={{ fontSize: '13px', color: '#9ca3af' }}>{description}</div>
  </div>
);

const Header = ({ searchQuery, onSearchChange }) => (
  <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div><h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0 }}>Dashboard</h1></div>
    <input type="text" placeholder="이름, 주소, 연락처 검색" value={searchQuery} onChange={(e) => onSearchChange(e.target.value)}
      style={{ padding: '10px 16px', borderRadius: '99px', border: '1px solid #e5e7eb', width: '300px', outline: 'none' }} />
  </header>
);

const UserList = ({ users, region }) => (
  <div className="card">
    <div className="card-header">
      <span className="card-title">목록</span>
      <span className="card-subtitle">{typeof region === 'string' ? region : `${region.city} ${region.district === '전체' ? '' : region.district}`}</span>
    </div>
    <div style={{ overflowX: 'auto' }}>
      <table className="table">
        <thead><tr><th>사진</th><th>성명</th><th>나이</th><th>위치</th><th>연락처</th><th>보호자</th><th>상태</th><th>ID</th></tr></thead>
        <tbody>
          {users.length === 0 ? <tr><td colSpan={8} className="empty-cell">데이터가 없습니다.</td></tr> : users.map(u => {
            const statusText = u.status === '정상' ? '정상' : u.status === '위험' ? '위험' : '알 수 없음';
            const statusClass = u.status === '정상' ? 'tag-safe' : u.status === '위험' ? 'tag-danger' : 'tag-unknown';
            
            return (
            <tr key={u.id} className={u.status === '위험' ? 'bg-red-50/50' : ''}>
              <td><div style={{ width: 32, height: 32, background: '#e5e7eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>{u.name.charAt(0)}</div></td>
              <td style={{ fontWeight: 'bold' }}>{u.name}</td>
              <td>{u.age}세</td>
              <td style={{ color: '#6b7280' }}>{u.originalAddress}</td>
              <td style={{ fontFamily: 'monospace' }}>{formatPhoneNumber(u.phone)}</td>
              <td style={{ fontFamily: 'monospace' }}>{formatPhoneNumber(u.guardianPhone)}</td>
              <td><span className={`tag ${statusClass}`}>{statusText}</span></td>
              <td style={{ fontSize: '10px', color: '#9ca3af' }}>{u.id}</td>
            </tr>
          );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

// ----------------------------------------------------------------------
// 5. Main App (RTDB -> Firestore Migration)
// ----------------------------------------------------------------------
export default function App() {
  const [allUsers, setAllUsers] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState({ city: "전체", district: "전체" });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // 🔥 [핵심 수정] Firestore의 /users 컬렉션에서 실시간 데이터 로드
  useEffect(() => {
    // 🚨 Firestore 컬렉션 경로 지정
    const usersColRef = collection(db, 'users');
    
    // 🚨 logs 서브컬렉션은 onSnapshot 밖에 둡니다. (읽기 성능 문제)
    const unsubscribe = onSnapshot(usersColRef, async (snapshot) => {
      
      // Promise.all을 사용하여 각 유저의 로그 서브컬렉션을 비동기적으로 가져옵니다.
      const logPromises = snapshot.docs.map(async (doc) => {
          const u = doc.data();
          const userId = doc.id;
          
          const userLogs = [];
          
          // logs 서브컬렉션 참조
          const logsColRef = collection(db, 'users', userId, 'logs');
          // getDocs를 사용하여 로그 스냅샷을 가져옵니다.
          const logsSnapshot = await getDocs(query(logsColRef)); 
          
          logsSnapshot.forEach(logDoc => {
              // 로그 필드에서 timestamp를 포함하여 전체 데이터 저장
              userLogs.push({ id: logDoc.id, ...logDoc.data() });
          });
          
          return {
              id: userId,
              ...u,
              logs: userLogs
          };
      });

      // 모든 로그 데이터가 로드될 때까지 기다림
      const loadedUsers = await Promise.all(logPromises);

      // 데이터 정리 및 상태 변환
      const finalUsers = loadedUsers.map(u => {
          const conf = u.config || {};
          
          // 🔥 위치 정보 추출 강화
          // 1. App.tsx에서 저장하는 top-level currentAddress 필드를 먼저 확인
          const currentAddress = u.currentAddress; 
          // 2. LocationScreen이 location 맵 안에 저장했을 경우 확인
          const locationMapAddress = u.location?.currentAddress || u.location?.address;

          const userLocation = currentAddress || locationMapAddress || "위치 미상";
          
          const { city, district } = parseAddressInfo(userLocation);
          
          // Firestore의 Timestamp 객체에서 위도, 경도 추출
          const lat = Number(u.location?.latitude || 0);
          const lng = Number(u.location?.longitude || 0);

          // 🔥 상태 변환: EMERGENCY/VERIFY_REQUEST -> 위험, 나머지는 정상
          const rawStatus = u.status ? u.status.toUpperCase() : 'UNKNOWN';
          const displayStatus = (rawStatus === 'EMERGENCY' || rawStatus === 'VERIFY_REQUEST') ? '위험' : '정상';

          return {
              id: u.id,
              name: conf.userName || "미입력",
              age: conf.userAge || "-",
              originalAddress: userLocation,
              city, district,
              address: formatAddressDisplay(userLocation),
              lat: lat,
              lng: lng,
              phone: conf.userContact || "",
              guardianPhone: conf.guardianContact || "",
              status: displayStatus,
              updatedAt: u.updatedAt,
              logs: u.logs, // 로그 배열
          };
      });

      setAllUsers(finalUsers);
      setLoading(false);
    }, (error) => {
        console.error("❌ Firestore Subscription Error:", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const groupedRegions = useMemo(() => {
    const groups = {};
    allUsers.forEach(u => {
      if (u.city && u.district) {
        if (!groups[u.city]) groups[u.city] = new Set();
        groups[u.city].add(u.district);
      }
    });
    const result = {};
    Object.keys(groups).sort().forEach(c => result[c] = Array.from(groups[c]).sort());
    return result;
  }, [allUsers]);

  const filteredUsers = useMemo(() => {
    let res = allUsers;
    if (selectedRegion.city !== "전체") {
      res = res.filter(u => u.city === selectedRegion.city);
      if (selectedRegion.district !== "전체") res = res.filter(u => u.district === selectedRegion.district);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      res = res.filter(u => 
        u.name.toLowerCase().includes(q) || 
        u.originalAddress.toLowerCase().includes(q) || 
        u.phone.includes(q) ||
        u.guardianPhone.includes(q)
      );
    }
    return res;
  }, [allUsers, selectedRegion, searchQuery]);

  // 🔥 로그 데이터 처리를 useMemo 안에서 효율적으로 처리
  const recentAlerts = useMemo(() => {
    let logs = [];
    filteredUsers.forEach(u => {
      if (Array.isArray(u.logs)) {
        u.logs.forEach(l => {
          if (l.event || l.status || l.note) { // 이벤트, 상태 또는 노트가 있는 로그만 포함
            // Timestamp 객체를 밀리초로 변환
            const logTimestamp = l.timestamp?.toDate ? l.timestamp.toDate().getTime() : (l.timestamp || 0);
            
            // event가 없으면 note를 사용
            const content = l.event || l.note || translateLogStatus(l.status);

            logs.push({
              id: `${u.id}-${l.id}`,
              timestamp: logTimestamp,
              date: new Date(logTimestamp).toLocaleDateString('ko-KR'),
              time: new Date(logTimestamp).toLocaleTimeString('ko-KR', {hour:'2-digit', minute:'2-digit'}),
              name: u.name,
              content: content,
            });
          }
        });
      }
    });
    // 로그를 최신순으로 정렬 후 50개만 표시
    return logs.sort((a, b) => b.timestamp - a.timestamp).slice(0, 50);
  }, [filteredUsers]);


  const stats = useMemo(() => {
    const total = allUsers.length;
    const danger = filteredUsers.filter(u => u.status === '위험').length;
    const normal = filteredUsers.filter(u => u.status === '정상').length;
    const paid = Math.floor(total * 0.8); // 임시 구독자 수
    return { total, paid, danger, normal };
  }, [allUsers, filteredUsers]);

  const currentRegionLabel = selectedRegion.city === "전체" ? "전체 지역" : `${selectedRegion.city} ${selectedRegion.district === "전체" ? "" : selectedRegion.district}`;

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '600' }}>데이터 로딩중...</div>;

  return (
    <div className="app">
      <GlobalStyles />
      <Sidebar groupedRegions={groupedRegions} selectedRegion={selectedRegion} onSelectRegion={setSelectedRegion} users={allUsers} />
      <div className="main">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        
        <div className="stats-row">
          <StatCard title="전체 유저" value={`${stats.total}명`} description="실시간 모니터링" />
          <StatCard title="정상 유저" value={`${stats.normal}명`} description="안전 상태 유지 중" color="#166534" />
          <StatCard title="위험 감지" value={`${stats.danger}건`} description="조치 필요" color="#dc2626" />
        </div>

        <div className="middle-row">
          <RecentAlerts alerts={recentAlerts} region={currentRegionLabel} />
          <MapCard region={selectedRegion} users={filteredUsers} />
        </div>

        <UserList users={filteredUsers} region={currentRegionLabel} />
      </div>
    </div>
  );
}