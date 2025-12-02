// src/components/layout/Sidebar.jsx
import React from "react";

function Sidebar({ regions, selectedRegion, onSelectRegion }) {
  return (
    <aside className="sidebar">
      <div className="brand-placeholder">
        <div className="brand-icon" />
        <div className="brand-name">관리자 Web</div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-title">Dashboard</div>
        <div className="sidebar-item sidebar-item-active">Overview</div>

        <div className="sidebar-section-title">지역 선택</div>
        {regions.map((region) => (
          <button
            key={region}
            className={
              "sidebar-region-btn" +
              (region === selectedRegion ? " active" : "")
            }
            onClick={() => onSelectRegion(region)}
          >
            서울시 {region}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;