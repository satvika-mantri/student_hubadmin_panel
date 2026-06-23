import React from 'react';

const EmptyState = ({ icon: Icon, title, description, colSpan }) => (
  <tr>
    <td colSpan={colSpan} style={{ textAlign: "center", padding: "60px 0" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", color: "var(--text-muted)" }}>
        {Icon && <Icon size={48} style={{ opacity: 0.2 }} />}
        <p style={{ fontSize: "16px", margin: 0 }}>{title || "No data found"}</p>
        {description && <p style={{ fontSize: "14px", opacity: 0.7, margin: 0 }}>{description}</p>}
      </div>
    </td>
  </tr>
);

export default EmptyState;
