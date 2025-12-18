import React from "react";

function UserList({ users, region }) {
  
  // 📞 전화번호 포맷팅 함수 (기존 로직 유지)
  const formatPhoneNumber = (text) => {
    if (!text) return "-";
    const cleaned = text.toString().replace(/[^0-9]/g, '');
    
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 7) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    } else {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
    }
  };

  // 📍 주소 포맷팅 함수
  // (App.js에서 이미 변환된 'address'를 주지만, 만약 원본이 넘어올 경우를 대비해 로직 유지)
  const formatAddressDisplay = (addr) => {
    if (!addr) return "-";
    // 이미 App.js에서 포맷팅 된 경우 그대로 반환
    if (!addr.includes("특별") && !addr.includes("광역")) return addr; 
    
    // 혹시 원본 주소가 넘어왔을 경우를 위한 방어 코드
    const parts = addr.split(' ');
    let city = "";
    let dong = "";

    for (let part of parts) {
      if (part.endsWith("시") || part.endsWith("도") || part.endsWith("광역시")) {
        city = part.replace("광역시", "시").replace("특별자치시", "시").replace("특별시", "시");
      }
      else if (part.endsWith("동") || part.endsWith("읍") || part.endsWith("면")) {
        dong = part;
      }
    }
    if (city && dong) return `${city} ${dong}`;
    if (parts.length >= 2) return `${parts[0]} ${parts[1]}`;
    return addr;
  };

  return (
    <div className="card user-list-card">
      <div className="card-header">
        <span className="card-title">목록</span>
        <span className="card-subtitle">관리 지역: {region || "전체"}</span>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>사진</th>
            <th>성명</th>
            <th>나이</th>
            <th>위치</th>
            <th>연락처</th>
            <th>보호자 연락처</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={7} className="empty-cell" style={{textAlign: "center", padding: "20px", color: "#999"}}>
                해당 지역에 등록된 사용자가 없습니다.
              </td>
            </tr>
          ) : (
            users.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="avatar-placeholder">
                    {u.name.charAt(0)}
                  </div>
                </td>
                <td style={{ fontWeight: "bold" }}>{u.name}</td>
                <td>{u.age}세</td>
                {/* App.js에서 이미 포맷팅된 u.address를 우선 사용 */}
                <td>{u.address || formatAddressDisplay(u.originalAddress)}</td>
                <td style={{ fontFamily: "monospace" }}>{formatPhoneNumber(u.phone)}</td>
                <td style={{ fontFamily: "monospace" }}>{formatPhoneNumber(u.guardianPhone)}</td>
                <td>
                  <span
                    className={
                      "tag " +
                      (u.status === "정상" ? "tag-safe" : "tag-danger")
                    }
                  >
                    {u.status}
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

export default UserList;