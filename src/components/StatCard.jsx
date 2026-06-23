import React from 'react';

const StatCard = ({ title, value, icon, color, loading }) => (
  <div className="card hoverable" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px", borderTop: `3px solid ${color}` }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: "500" }}>{title}</span>
      {icon}
    </div>
    <div style={{ fontSize: "28px", fontWeight: "bold", color: "#fff" }}>{loading ? "..." : value}</div>
  </div>
);

export default StatCard;
