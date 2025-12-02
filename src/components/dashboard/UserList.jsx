import React from "react";

function UserList({ users, region }) {
  return (
    <div className="card user-list-card">
      <div className="card-header">
        <span className="card-title">목록</span>
        <span className="card-subtitle">서울시 {region}</span>
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
              <td colSpan={7} className="empty-cell">
                등록된 사용자가 없습니다.
              </td>
            </tr>
          ) : (
            users.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="avatar-placeholder" />
                </td>
                <td>{u.name}</td>
                <td>{u.age}세</td>
                <td>{u.address}</td>
                <td>{u.phone}</td>
                <td>{u.guardianPhone}</td>
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