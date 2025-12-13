import React from "react";

function RecentAlerts({ alerts, region }) {
  return (
    <div className="card recent-alerts-card">
      <div className="card-header">
        <span className="card-title">최근 알림</span>
        <span className="card-subtitle">서울시 {region}</span>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>날짜</th>
            <th>시간</th>
            <th>성명</th>
            <th>내용</th>
            <th>구분</th>
          </tr>
        </thead>
        <tbody>
          {alerts.length === 0 ? (
            <tr>
              <td colSpan={5} className="empty-cell">
                최근 알림이 없습니다.
              </td>
            </tr>
          ) : (
            alerts.map((a, idx) => (
              <tr key={idx}>
                <td>{a.date}</td>
                <td>{a.time}</td>
                <td>{a.name}</td>
                <td>
                  <span className="tag tag-alert">{a.type}</span>
                </td>
                <td>
                  <span
                    className={
                      "tag " + (a.status === "처리" ? "tag-safe" : "tag-danger")
                    }
                  >
                    {a.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default RecentAlerts; 