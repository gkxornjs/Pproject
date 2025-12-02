// src/utils/filters.js

export const normalize = (str) =>
  (str || "").toString().toLowerCase().trim();

export function filterUsers(users, query) {
  if (!query) return users;
  const q = normalize(query);
  return users.filter((u) => {
    return (
      normalize(u.name).includes(q) ||
      normalize(u.phone).includes(q) ||
      normalize(u.guardianPhone).includes(q) ||
      normalize(u.address).includes(q)
    );
  });
}

export function filterAlerts(alerts, query) {
  if (!query) return alerts;
  const q = normalize(query);
  return alerts.filter((a) => {
    return (
      normalize(a.name).includes(q) ||
      normalize(a.type).includes(q) ||
      normalize(a.status).includes(q)
    );
  });
}