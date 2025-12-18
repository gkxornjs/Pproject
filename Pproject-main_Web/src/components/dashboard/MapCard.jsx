import React, { useMemo, useEffect, useRef } from "react";

// 1. 중심점 계산
const calculateCenter = (users) => {
  if (!Array.isArray(users)) return null;

  const validUsers = users.filter(u => {
    const lat = Number(u.lat);
    const lng = Number(u.lng);
    return Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0;
  });

  if (validUsers.length === 0) return { lat: 37.5665, lng: 126.9780 }; // 기본값

  if (validUsers.length === 1) {
    return { lat: Number(validUsers[0].lat), lng: Number(validUsers[0].lng) };
  }

  const total = validUsers.reduce(
    (acc, user) => ({
      lat: acc.lat + Number(user.lat),
      lng: acc.lng + Number(user.lng),
    }),
    { lat: 0, lng: 0 }
  );

  return {
    lat: total.lat / validUsers.length,
    lng: total.lng / validUsers.length,
  };
};

// 2. Leaflet 지도 컴포넌트 (LayerGroup 적용으로 안정성 강화)
const LeafletMap = ({ center, zoom, markers }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null); // 마커들을 관리할 그룹

  // (A) 초기화 (한 번만 실행)
  useEffect(() => {
    const loadLeaflet = () => {
      if (window.L) {
        initMap();
        return;
      }

      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
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

      // 이미 지도가 있으면 삭제 후 재생성 (완전 초기화)
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      try {
        const map = window.L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false
        }).setView([center.lat, center.lng], zoom);

        window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
        window.L.control.zoom({ position: 'bottomright' }).addTo(map);

        // 핵심: 마커를 담을 LayerGroup 생성 및 지도에 추가
        const layerGroup = window.L.layerGroup().addTo(map);
        
        mapInstanceRef.current = map;
        layerGroupRef.current = layerGroup;

        // 초기 데이터 렌더링
        updateMapVisuals(map, layerGroup, center, zoom, markers);

      } catch (error) {
        console.warn("지도 생성 실패:", error);
      }
    };

    loadLeaflet();

    // 클린업
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) { /* 무시 */ }
        mapInstanceRef.current = null;
        layerGroupRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 의존성 배열 비움 (최초 1회만 실행)

  // (B) 데이터 변경 시 화면 업데이트
  useEffect(() => {
    if (mapInstanceRef.current && layerGroupRef.current && window.L) {
      updateMapVisuals(mapInstanceRef.current, layerGroupRef.current, center, zoom, markers);
    }
  }, [center, zoom, markers]);

  // (C) 지도 화면 갱신 함수 (분리하여 안전하게 호출)
  const updateMapVisuals = (map, layerGroup, center, zoom, users) => {
    try {
      // 1. 뷰 이동
      if (center && Number.isFinite(center.lat) && Number.isFinite(center.lng)) {
        map.setView([center.lat, center.lng], zoom, { animate: false });
      }

      // 2. 마커 초기화 (LayerGroup 사용으로 안전하게 삭제)
      layerGroup.clearLayers();

      // 3. 마커 추가
      users.forEach(u => {
        const lat = Number(u.lat);
        const lng = Number(u.lng);

        if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat === 0 || lng === 0) return;

        const color = u.status === "위험" ? "#ef4444" : "#22c55e";

        const marker = window.L.circleMarker([lat, lng], {
          radius: 8,
          fillColor: color,
          color: "#fff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        });

        marker.bindPopup(`
          <div style="font-size:13px; font-family:sans-serif; min-width: 120px;">
            <strong style="font-size:14px;">${u.name}</strong><br/>
            <span style="font-size:11px; color:#666">${u.address || '주소 미상'}</span><br/>
            <span style="color:${color}; font-weight:bold">${u.status}</span>
          </div>
        `);

        // 마커를 지도에 직접 붙이지 않고 그룹에 추가
        marker.addTo(layerGroup);
      });
    } catch (error) {
      console.warn("지도 업데이트 중 오류 (무시 가능):", error);
    }
  };

  return <div ref={mapContainerRef} style={{ width: '100%', height: '100%', minHeight: '400px', zIndex: 0 }} />;
};

function MapCard({ region, users }) {
  const center = useMemo(() => calculateCenter(users), [users]);
  
  const safeCount = Array.isArray(users) ? users.filter((u) => u.status === "정상").length : 0;
  const dangerCount = Array.isArray(users) ? users.filter((u) => u.status === "위험").length : 0;
  
  let regionLabel = "전체 지역";
  if (typeof region === 'string') regionLabel = region;
  else if (region && typeof region === 'object') regionLabel = `${region.city || ''} ${region.district || ''}`;

  const zoom = (users.length === 1 || !regionLabel.includes("전체")) ? 15 : 11;

  return (
    <div className="card map-card">
      <div className="card-header">
        <span className="card-title">지도</span>
        <span className="card-subtitle">
          {regionLabel.trim()} · 
          <span style={{ color: "#16a34a", fontWeight: "bold", marginLeft: "4px" }}>안전 {safeCount}</span> · 
          <span style={{ color: "#dc2626", fontWeight: "bold", marginLeft: "4px" }}>위험 {dangerCount}</span>
        </span>
      </div>

      <div className="map-container" style={{ height: "500px", width: "100%", position: "relative" }}>
        {center ? (
          <LeafletMap center={center} zoom={zoom} markers={users} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
            위치 데이터가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}

export default MapCard;