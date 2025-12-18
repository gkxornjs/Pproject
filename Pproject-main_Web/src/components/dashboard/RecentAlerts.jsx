import React from "react";

function RecentAlerts({ alerts, region }) {
  return (
    <div className="card recent-alerts-card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="card-title">최근 알림</span>
        <span className="card-subtitle" style={{ fontSize: '12px', color: '#888' }}>
          {region === "전체" ? "전체 지역" : region}
        </span>
      </div>

      <div className="alerts-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {/* 알림이 없을 경우 */}
        {alerts.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
            해당 지역에 위험 알림이 없습니다.
          </div>
        ) : (
          /* 알림이 있을 경우 목록 출력 */
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #eee', fontSize: '12px', color: '#888', textAlign: 'left' }}>
                <th style={{ padding: '8px' }}>날짜</th>
                <th style={{ padding: '8px' }}>시간</th>
                <th style={{ padding: '8px' }}>성명</th>
                <th style={{ padding: '8px' }}>내용</th>
                <th style={{ padding: '8px' }}>구분</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert, index) => (
                <tr key={alert.id || index} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '12px 8px', fontSize: '13px' }}>{alert.date}</td>
                  <td style={{ padding: '12px 8px', fontSize: '13px', fontWeight: 'bold' }}>{alert.time}</td>
                  <td style={{ padding: '12px 8px', fontSize: '14px' }}>{alert.name}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <span style={{ 
                      backgroundColor: '#fff1f2', color: '#be123c', 
                      padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' 
                    }}>
                      {alert.content}
                    </span>
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <span style={{ 
                      backgroundColor: alert.status === '처리' ? '#ecfdf5' : '#fef2f2',
                      color: alert.status === '처리' ? '#047857' : '#ef4444',
                      padding: '4px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 'bold', border: '1px solid transparent'
                    }}>
                      {alert.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default RecentAlerts;