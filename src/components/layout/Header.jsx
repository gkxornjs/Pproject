import React from "react";

function Header({ searchQuery, onSearchChange }) {
  return (
    <header className="top-bar">
      <div className="top-bar-title">Dashboard</div>
      <div className="top-bar-search">
        <input
          type="text"
          placeholder="이름, 연락처, 주소로 사용자 검색"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </header>
  );
}

export default Header;