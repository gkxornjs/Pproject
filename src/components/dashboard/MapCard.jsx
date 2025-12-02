// src/components/dashboard/MapCard.jsx
import React from "react";
import { Map, Marker } from "@vis.gl/react-google-maps";

function MapCard({ region, users }) {
  const centers = {
    강남구: { lat: 37.4979, lng: 127.0276 },
    송파구: { lat: 37.5146, lng: 127.1056 },
    마포구: { lat: 37.5499, lng: 126.9134 },
  };

  const center = centers[region] || centers["강남구"];

  const safeCount = users.filter((u) => u.status === "정상").length;
  const dangerCount = users.length - safeCount;

  return (
    <div className="card map-card">
      <div className="card-header">
        <span className="card-title">지도</span>
        <span className="card-subtitle">
          서울시 {region} · 안전 {safeCount}명 · 위험 {dangerCount}명
        </span>
      </div>

      <div className="map-container">
        <Map
          defaultCenter={center}
          defaultZoom={13}
          gestureHandling={"greedy"}
          disableDefaultUI={false}
        >
          {users.map((u) => (
            <Marker
              key={u.id}
              position={{
                lat: u.lat ?? center.lat,
                lng: u.lng ?? center.lng,
              }}
            />
          ))}
        </Map>
      </div>
    </div>
  );
}

export default MapCard;