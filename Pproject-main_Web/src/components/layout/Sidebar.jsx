import React from "react";

function Sidebar({ groupedRegions, selectedRegion, onSelectRegion, users }) {
  
  // 🚨 위험 상태인 유저 수 계산 (뱃지 표시용)
  const getDangerCount = (city, district = null) => {
    if (!users) return 0;
    
    return users.filter(u => {
      // u.city, u.district는 App.js에서 파싱해서 넣어준 값
      const cityMatch = u.city === city;
      // district가 없으면(=null) 도시 전체, 있으면 해당 구/동만 체크
      const districtMatch = district ? u.district === district : true;
      
      return cityMatch && districtMatch && u.status === '위험';
    }).length;
  };

  // 안전장치: 데이터가 없을 경우 빈 객체 처리
  const regions = groupedRegions || {};

  return (
    <aside className="sidebar" style={{ 
      width: '260px', 
      backgroundColor: '#fff', 
      borderRight: '1px solid #e5e7eb', 
      display: 'flex', 
      flexDirection: 'column', 
      flexShrink: 0 
    }}>
      {/* 1. 브랜드 로고 영역 */}
      <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ 
          width: '32px', height: '32px', 
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)', 
          borderRadius: '8px' 
        }} />
        <div style={{ fontWeight: 'bold', fontSize: '18px', color: '#111' }}>관리자 Web</div>
      </div>

      {/* 2. 네비게이션 영역 */}
      <nav style={{ padding: '0 12px', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 'bold', marginBottom: '8px', paddingLeft: '12px', letterSpacing: '0.5px' }}>DASHBOARD</div>
        
        {/* 전체 보기 (Overview) 버튼 */}
        <button
          onClick={() => onSelectRegion({ city: "전체", district: "전체" })}
          style={{ 
            width: '100%', textAlign: 'left', padding: '12px 16px', borderRadius: '12px', border: 'none', 
            background: selectedRegion.city === "전체" ? '#eff6ff' : 'transparent', 
            color: selectedRegion.city === "전체" ? '#2563eb' : '#4b5563', 
            fontWeight: selectedRegion.city === "전체" ? '600' : '400',
            cursor: 'pointer', marginBottom: '16px', transition: 'all 0.2s'
          }}
        >
          Overview
        </button>

        <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 'bold', marginBottom: '8px', paddingLeft: '12px', letterSpacing: '0.5px' }}>지역 선택</div>
        
        {/* 지역 목록 (시/도 그룹핑) */}
        {Object.keys(regions).map((city) => {
          const cityDangerCount = getDangerCount(city);
          const isCityActive = selectedRegion.city === city;

          return (
            <div key={city} style={{ marginBottom: '12px' }}>
              {/* (A) 시/도 헤더 (클릭 시 해당 도시 전체 선택) */}
              <button
                onClick={() => onSelectRegion({ city: city, district: "전체" })}
                style={{
                  width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none',
                  background: 'transparent', cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  color: isCityActive ? '#1f2937' : '#6b7280',
                  fontWeight: 'bold', fontSize: '14px'
                }}
              >
                <span>{city}</span>
                {/* 도시에 위험 알림이 있으면 빨간 뱃지 표시 */}
                {cityDangerCount > 0 && (
                  <span style={{ backgroundColor: '#fee2e2', color: '#dc2626', fontSize: '10px', padding: '2px 6px', borderRadius: '99px' }}>
                    ! {cityDangerCount}
                  </span>
                )}
              </button>

              {/* (B) 하위 구/동 목록 (들여쓰기) */}
              <div style={{ 
                display: 'flex', flexDirection: 'column', gap: '2px', 
                paddingLeft: '12px', borderLeft: '2px solid #f3f4f6', marginLeft: '12px', marginTop: '4px' 
              }}>
                {regions[city].map((district) => {
                  const distDangerCount = getDangerCount(city, district);
                  const isDistActive = isCityActive && selectedRegion.district === district;

                  return (
                    <button
                      key={district}
                      onClick={() => onSelectRegion({ city: city, district: district })}
                      style={{
                        textAlign: 'left', padding: '8px 12px', borderRadius: '8px', border: 'none',
                        background: isDistActive ? '#eff6ff' : 'transparent',
                        color: isDistActive ? '#2563eb' : '#6b7280',
                        fontWeight: isDistActive ? '600' : '400',
                        fontSize: '13px', cursor: 'pointer',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span>{district}</span>
                      {/* 구/동에 위험 알림이 있으면 빨간 점 표시 */}
                      {distDangerCount > 0 && (
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        
        {Object.keys(regions).length === 0 && (
          <div style={{ padding: '12px', fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>
            데이터 없음
          </div>
        )}
      </nav>
      
      {/* 하단 카피라이트 */}
      <div style={{ padding: '20px', borderTop: '1px solid #f3f4f6' }}>
        <div style={{ fontSize: '12px', color: '#9ca3af' }}>© 2025 SilverGuard</div>
      </div>
    </aside>
  );
}

export default Sidebar;