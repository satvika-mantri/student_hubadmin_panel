import { useState, useEffect } from "react";

export default function Users() {
  const [users, setUsers]           = useState([]);
  const [page, setPage]             = useState(1);
  const [limit]                     = useState(10);
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch]         = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading]       = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:3000/api/bulk?type=users`
      );
      const json = await res.json();
      if (json.success) {
        setUsers(json.data);
        setTotal(json.total);
        setTotalPages(json.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  // fetch on page or search change
  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleClear = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  return (
    <div style={{ padding: "24px", fontFamily: "Inter, sans-serif", backgroundColor: "#F0F4F8", minHeight: "100vh" }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
          Users
        </h1>
        <p style={{ color: "#64748B", marginTop: "4px", fontSize: "14px" }}>
          Total {total} registered users
        </p>
      </div>

      {/* ── Search Bar ── */}
      <form onSubmit={handleSearch} style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          style={{
            flex: 1, padding: "10px 16px", borderRadius: "10px",
            border: "1.5px solid #E2E8F0", fontSize: "14px",
            outline: "none", backgroundColor: "#fff", color: "#0F172A",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 20px", borderRadius: "10px", border: "none",
            backgroundColor: "#1D4ED8", color: "#fff",
            fontWeight: 700, fontSize: "14px", cursor: "pointer",
          }}
        >
          Search
        </button>
        {search && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              padding: "10px 16px", borderRadius: "10px", border: "1.5px solid #E2E8F0",
              backgroundColor: "#fff", color: "#64748B",
              fontWeight: 600, fontSize: "14px", cursor: "pointer",
            }}
          >
            Clear
          </button>
        )}
      </form>

      {/* ── Table ── */}
      <div style={{
        backgroundColor: "#fff", borderRadius: "16px",
        border: "1.5px solid #E2E8F0", overflow: "hidden",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#F8FAFC" }}>
              {["#", "Name", "Email", "Phone", "Degree", "University", "Role", "Status", "Joined"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "14px 16px", textAlign: "left",
                    fontSize: "12px", fontWeight: 700,
                    color: "#64748B", textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    borderBottom: "1.5px solid #E2E8F0",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "48px", color: "#94A3B8" }}>
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "48px", color: "#94A3B8" }}>
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr
                  key={user.user_id}
                  style={{ borderBottom: "1px solid #F1F5F9" }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F8FAFC"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  {/* # */}
                  <td style={{ padding: "14px 16px", fontSize: "13px", color: "#94A3B8" }}>
                    {(page - 1) * limit + index + 1}
                  </td>

                  {/* Name */}
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "34px", height: "34px", borderRadius: "50%",
                        backgroundColor: "#EFF6FF",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "13px", fontWeight: 700, color: "#1D4ED8", flexShrink: 0,
                      }}>
                        {user.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontSize: "14px", fontWeight: 600, color: "#0F172A" }}>
                        {user.full_name}
                      </span>
                    </div>
                  </td>

                  {/* Email */}
                  <td style={{ padding: "14px 16px", fontSize: "13px", color: "#334155" }}>
                    {user.email}
                  </td>

                  {/* Phone */}
                  <td style={{ padding: "14px 16px", fontSize: "13px", color: "#334155" }}>
                    {user.phone || <span style={{ color: "#CBD5E1" }}>—</span>}
                  </td>

                  {/* Degree */}
                  <td style={{ padding: "14px 16px", fontSize: "13px", color: "#334155" }}>
                    {user.degree || <span style={{ color: "#CBD5E1" }}>—</span>}
                  </td>

                  {/* University */}
                  <td style={{ padding: "14px 16px", fontSize: "13px", color: "#334155" }}>
                    {user.university || <span style={{ color: "#CBD5E1" }}>—</span>}
                  </td>

                  {/* Role */}
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{
                      padding: "4px 10px", borderRadius: "20px", fontSize: "11px",
                      fontWeight: 700, backgroundColor: "#EFF6FF", color: "#1D4ED8",
                    }}>
                      {user.role_name?.replace(/_/g, " ")}
                    </span>
                  </td>

                  {/* Status */}
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{
                      padding: "4px 10px", borderRadius: "20px", fontSize: "11px",
                      fontWeight: 700,
                      backgroundColor: user.status === "active" ? "#F0FDF4" : "#FFF1F2",
                      color: user.status === "active" ? "#16A34A" : "#E11D48",
                    }}>
                      {user.status}
                    </span>
                  </td>

                  {/* Joined */}
                  <td style={{ padding: "14px 16px", fontSize: "13px", color: "#64748B" }}>
                    {new Date(user.created_at).toLocaleDateString("en-IN", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginTop: "20px",
        }}>
          <span style={{ fontSize: "13px", color: "#64748B" }}>
            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} users
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              style={{
                padding: "8px 16px", borderRadius: "8px", fontSize: "13px",
                fontWeight: 600, cursor: page === 1 ? "not-allowed" : "pointer",
                border: "1.5px solid #E2E8F0",
                backgroundColor: page === 1 ? "#F8FAFC" : "#fff",
                color: page === 1 ? "#CBD5E1" : "#0F172A",
              }}
            >
              ← Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  padding: "8px 14px", borderRadius: "8px", fontSize: "13px",
                  fontWeight: 700, cursor: "pointer", border: "none",
                  backgroundColor: page === p ? "#1D4ED8" : "#fff",
                  color: page === p ? "#fff" : "#334155",
                  border: page === p ? "none" : "1.5px solid #E2E8F0",
                }}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              style={{
                padding: "8px 16px", borderRadius: "8px", fontSize: "13px",
                fontWeight: 600, cursor: page === totalPages ? "not-allowed" : "pointer",
                border: "1.5px solid #E2E8F0",
                backgroundColor: page === totalPages ? "#F8FAFC" : "#fff",
                color: page === totalPages ? "#CBD5E1" : "#0F172A",
              }}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}