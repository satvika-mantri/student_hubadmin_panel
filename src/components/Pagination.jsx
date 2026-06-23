import React from 'react';

const Pagination = ({ page, totalPages, setPage }) => {
  if (totalPages <= 0) return null;

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "16px", marginTop: "24px", paddingBottom: "24px" }}>
      <button
        type="button"
        className="btn btn-secondary"
        disabled={page <= 1}
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        style={page <= 1 ? { opacity: 0.5, cursor: "not-allowed" } : {}}
      >
        &lt; Prev
      </button>
      <span style={{ color: "var(--text-muted)", fontWeight: "500", fontSize: "14px" }}>
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        className="btn btn-secondary"
        disabled={page >= totalPages}
        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        style={page >= totalPages ? { opacity: 0.5, cursor: "not-allowed" } : {}}
      >
        Next &gt;
      </button>
    </div>
  );
};

export default Pagination;
