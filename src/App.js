// src/App.js

import { APIProvider } from "@vis.gl/react-google-maps";
import React, { useState } from "react";
import "./App.css";

import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import StatCard from "./components/dashboard/StatCard";
import RecentAlerts from "./components/dashboard/RecentAlerts";
import MapCard from "./components/dashboard/MapCard";
import UserList from "./components/dashboard/UserList";

import {
  REGIONS,
  MOCK_STATS,
  MOCK_ALERTS,
  MOCK_USERS,
} from "./data/mockData";

import { filterUsers, filterAlerts } from "./utils/filters";

function App() {
  const [selectedRegion, setSelectedRegion] = useState("강남구");
  const [searchQuery, setSearchQuery] = useState("");

  const rawStats = MOCK_STATS[selectedRegion];
  const rawAlerts = MOCK_ALERTS[selectedRegion] || [];
  const rawUsers = MOCK_USERS[selectedRegion] || [];

  const alerts = filterAlerts(rawAlerts, searchQuery);
  const users = filterUsers(rawUsers, searchQuery);
  const stats = rawStats;

  const pendingCount = alerts.filter((a) => a.status === "미처리").length;

const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
console.log("API KEY >>>", apiKey);
  return (
    <APIProvider apiKey={apiKey}>
    <div className="app">
      <Sidebar
        regions={REGIONS}
        selectedRegion={selectedRegion}
        onSelectRegion={setSelectedRegion}
      />
      <main className="main">
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <section className="stats-row">
          <StatCard
            title="전체 유저 수"
            value={`${stats.totalUsers.toLocaleString()}명`}
            description="업데이트 예정"
          />
          <StatCard
            title="구독자 수"
            value={`${stats.paidUsers}명`}
            description="전체 ??%"
          />
          <StatCard
            title="금일 SOS 알림"
            value={`${stats.sosToday}건`}
            description={`(미처리 ${pendingCount}건)`}
          />
        </section>

        <section className="middle-row">
          <RecentAlerts alerts={alerts} region={selectedRegion} />
          <MapCard region={selectedRegion} users={users} />
        </section>

        <section className="bottom-row">
          <UserList users={users} region={selectedRegion} />
        </section>
      </main>
    </div>
    </APIProvider>
  );
}

export default App;