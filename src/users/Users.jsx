import { useState, useEffect } from "react";
import { Search } from "lucide-react";

const API_BASE = "https://studenthub-backend-woad.vercel.app";

function Users() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);

  const limit = 10;

  const renderRoleBadge = (roleId) => {
    switch (roleId) {
      case 1:
        return <span className="badge" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}>Admin</span>;
      case 2:
        return <span className="badge badge-warning">School Student</span>;
      case 3:
        return <span className="badge badge-info">UG Student</span>;
      case 4:
        return <span className="badge badge-success">PG Student</span>;
      default:
        return <span className="badge">User</span>;
    }
  };

  const fetchUsers = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      console.log("🔐 TOKEN:", token);

      if (!token) {
        console.warn("❌ No token found. Please login.");
        setUsers([]);
        return;
      }

      const res = await fetch(
        `${API_BASE}/api/bulk?type=users&page=${page}&limit=${limit}&search=${search}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();

      console.log("📦 FULL RESPONSE:", json);

      // 🔴 HANDLE UNAUTHORIZED
      if (res.status === 401 || json.message === "Unauthorized") {
        console.error("🚫 Unauthorized — invalid or expired token");

        alert("Session expired. Please login again.");

        localStorage.removeItem("token");

        window.location.href = "/login";
        return;
      }

      // 🔴 HANDLE OTHER ERRORS
      if (!res.ok || !json.success) {
        console.error("❌ API ERROR:", json.message);
        setUsers([]);
        return;
      }

      // ✅ CORRECT DATA MAPPING (matches your bulk.js)
      setUsers(json.data || []);
      setTotal(json.total || 0);
      setTotalPages(json.totalPages || 1);

    } catch (err) {
      console.error("🔥 Fetch users error:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleClear = () => {
    setSearch("");
    setSearchInput("");
  };

  return (
    <div className="page">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>Users</h1>
          <p>Manage {total} registered users</p>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ flex: 1, marginBottom: 0, padding: '20px' }}>
          <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Total Users</h3>
          <p style={{ fontSize: '28px', fontWeight: 600, color: '#fff', marginTop: '8px' }}>{total}</p>
        </div>
        <div className="card" style={{ flex: 1, marginBottom: 0, padding: '20px' }}>
          <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>School Users</h3>
          <p style={{ fontSize: '28px', fontWeight: 600, color: '#fff', marginTop: '8px' }}>
            {users.filter(u => u.role_id === 2).length}
          </p>
        </div>
        <div className="card" style={{ flex: 1, marginBottom: 0, padding: '20px' }}>
          <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>UG Users</h3>
          <p style={{ fontSize: '28px', fontWeight: 600, color: '#fff', marginTop: '8px' }}>
            {users.filter(u => u.role_id === 3).length}
          </p>
        </div>
        <div className="card" style={{ flex: 1, marginBottom: 0, padding: '20px' }}>
          <h3 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>PG Users</h3>
          <p style={{ fontSize: '28px', fontWeight: 600, color: '#fff', marginTop: '8px' }}>
            {users.filter(u => u.role_id === 4).length}
          </p>
        </div>
      </div>

      {/* SEARCH */}
      <form onSubmit={handleSearch} className="search-form">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search users..."
        />

        <button type="submit" className="btn btn-primary">
          <Search size={16} /> Search
        </button>

        {search && (
          <button
            type="button"
            onClick={handleClear}
            className="btn btn-secondary"
          >
            Clear
          </button>
        )}
      </form>

      {/* TABLE */}
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center" }}>
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center" }}>
                  No users found
                </td>
              </tr>
            ) : (
              users.map((u, i) => (
                <tr key={u.user_id}>
                  <td>{(page - 1) * limit + i + 1}</td>
                  <td style={{ fontWeight: 500 }}>
                    {u.full_name || "N/A"}
                  </td>
                  <td>{u.email || "N/A"}</td>
                  <td>{u.phone || "N/A"}</td>
                  <td>
                    {renderRoleBadge(u.role_id)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Users;