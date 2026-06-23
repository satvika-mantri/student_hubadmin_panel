import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

export const DetailHeader = ({ title, isActive, activeText = "ACTIVE", inactiveText = "DRAFT", badges = [] }) => {
  const navigate = useNavigate();
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 10, background: "var(--bg-color)", paddingBottom: "16px", paddingTop: "16px", borderBottom: "1px solid var(--border-color)", marginBottom: "32px", display: "flex", alignItems: "center", gap: "24px" }}>
      <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ border: "none", background: "transparent", color: "var(--text-muted)", padding: "8px" }}>
        <ArrowLeft size={20} />
      </button>
      <div>
        <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "700", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          {title || "Detail"}
          {isActive ? (
            <span style={{ background: "rgba(16, 185, 129, 0.15)", color: "#10b981", padding: "4px 12px", borderRadius: "99px", fontSize: "12px", fontWeight: "600", border: "1px solid rgba(16, 185, 129, 0.3)", boxShadow: "0 0 10px rgba(16, 185, 129, 0.15)", display: "inline-flex", alignItems: "center", gap: "4px", letterSpacing: "0.05em" }}><CheckCircle size={12}/> {activeText}</span>
          ) : (
            <span style={{ background: "rgba(100, 116, 139, 0.15)", color: "#94a3b8", padding: "4px 12px", borderRadius: "99px", fontSize: "12px", fontWeight: "600", border: "1px solid rgba(100, 116, 139, 0.3)", boxShadow: "0 0 10px rgba(100, 116, 139, 0.15)", display: "inline-flex", alignItems: "center", gap: "4px", letterSpacing: "0.05em" }}><XCircle size={12}/> {inactiveText}</span>
          )}
          {badges.map((badge, idx) => (
            <span key={idx} style={{ color: badge.color, background: badge.bg, padding: "4px 12px", borderRadius: "99px", fontSize: "12px", fontWeight: "600", border: badge.border ? `1px solid ${badge.border}` : "none" }}>
              {badge.text}
            </span>
          ))}
        </h1>
      </div>
    </div>
  );
};

export const AdminActionCard = ({ children, title = "Admin Actions" }) => (
  <div className="card" style={{ marginBottom: 0, padding: "24px" }}>
    <h2 style={{ fontSize: "16px", marginBottom: "20px", fontWeight: "600", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
      {title}
    </h2>
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {children}
    </div>
  </div>
);

export const InfoGridCard = ({ children, title = "Information" }) => (
  <div className="card" style={{ marginBottom: 0, padding: "24px" }}>
    <h2 style={{ fontSize: "16px", marginBottom: "20px", fontWeight: "600", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
      {title}
    </h2>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
      {children}
    </div>
  </div>
);

export const InfoItem = ({ label, value, icon: Icon, emptyText = "Not available" }) => {
  const displayValue = (!value || value === "N/A" || value === "null") 
    ? <span style={{ opacity: 0.5, fontStyle: "italic", fontSize: "14px" }}>{emptyText}</span>
    : value;

  return (
    <div>
      <strong style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>{label}</strong>
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {Icon && <Icon size={14} />} {displayValue}
      </div>
    </div>
  );
};

export const AnalyticsCard = ({ children, title = "Analytics" }) => (
  <div className="card" style={{ marginBottom: 0, padding: "24px" }}>
    <h2 style={{ fontSize: "16px", marginBottom: "20px", fontWeight: "600", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
      {title}
    </h2>
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {children}
    </div>
  </div>
);

export const AnalyticsItem = ({ label, value, icon: Icon, color = "#fff", borderBottom = true }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: borderBottom ? "16px" : "0", borderBottom: borderBottom ? "1px solid var(--border-color)" : "none" }}>
    <span style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)" }}>
      {Icon && <Icon size={16} />} {label}
    </span>
    <span style={{ fontSize: "18px", fontWeight: "bold", color: color }}>{value}</span>
  </div>
);

export const DescriptionCard = ({ description, icon: Icon, title = "Description", emptyText = "No description provided." }) => (
  <div className="card" style={{ marginBottom: 0, padding: "24px", minHeight: "100px" }}>
    <h2 style={{ fontSize: "16px", marginBottom: "20px", fontWeight: "600", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
      {Icon && <Icon size={18} color="#3b82f6" />} {title}
    </h2>
    <div style={{ fontSize: "14px", lineHeight: "1.6", color: "#ccc", whiteSpace: "pre-wrap", marginBottom: "24px" }}>
      {description ? description : <span style={{ opacity: 0.5, fontStyle: "italic", fontSize: "14px" }}>{emptyText}</span>}
    </div>
  </div>
);
