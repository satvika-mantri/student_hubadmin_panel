import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Users as UsersIcon, Shield, School, GraduationCap } from "lucide-react";
import { calculateProfileScore } from "../utils/profileScore";
import StatCard from "../components/StatCard";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import SearchFilter from "../components/SearchFilter";

const API_BASE = "https://studenthub-backend-woad.vercel.app";

function Users() {
  const navigate = useNavigate();

  // =========================================================
  // STATES
  // =========================================================

  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchColumn, setSearchColumn] = useState("Name");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const limit = 10;

  // =========================================================
  // FETCH USERS
  // =========================================================

  const fetchUsers = async () => {

    setLoading(true);

    try {

      const token = localStorage.getItem("token");


      const url =
        `${API_BASE}/api/bulk?type=users&page=${page}&limit=${limit}&search=${search}&searchColumn=${searchColumn}`;


      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });


      const json = await res.json();

     

      if (json.success) {

        const usersData = Array.isArray(json.data)
          ? json.data
          : [];

        setUsers(usersData);

        setTotal(json.total || usersData.length || 0);

        setTotalPages(json.totalPages || 1);

        setStats(json.stats || null);

      } else {

        console.error("API ERROR:", json.message);

        setUsers([]);
        setTotal(0);
      }

    } catch (err) {

      console.error("Fetch users error:", err);

      setUsers([]);
      setTotal(0);

    } finally {

      setLoading(false);
    }
  };

  // =========================================================
  // FETCH ON LOAD
  // =========================================================

  useEffect(() => {
    fetchUsers();
  }, [page, search, searchColumn]);

  // =========================================================
  // SEARCH
  // =========================================================

  const handleSearch = (e) => {

    e.preventDefault();

    setPage(1);

    setSearch(searchInput);
  };

  const handleClear = () => {

    setSearch("");

    setSearchInput("");
  };

  // =========================================================
  // FILTER USERS
  // =========================================================

  const filteredUsers = users;

  // =========================================================
  // COUNTS
  // =========================================================

  // Helper to escape CSV values
  const escapeCSV = (val) => {
    if (val === null || val === undefined || val === "N/A" || val === "") return '"N/A"';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  // Export filtered users to CSV
  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem("token");
      // Fetch all matching users without pagination limit to get full filtered list
      const url = `${API_BASE}/api/bulk?type=users&page=1&limit=999999&search=${search}&searchColumn=${searchColumn}`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      
      if (json.success) {
        const dataToExport = json.data || [];
        
        // Define CSV headers
        const headers = ["User ID", "Full Name", "Email", "Phone", "Institution", "Degree/Class", "Age", "Role", "Status", "Created At"];
        
        // Map data to CSV rows without mutating original array
        const rows = dataToExport.map(u => [
          u.user_id,
          u.full_name,
          u.email,
          u.phone,
          u.school_name || u.university,
          u.class || u.degree,
          u.age,
          u.role_name,
          u.status,
          u.created_at ? new Date(u.created_at).toLocaleDateString() : "N/A"
        ]);
        
        // Combine headers and rows
        const csvContent = [
          headers.map(escapeCSV).join(","),
          ...rows.map(row => row.map(escapeCSV).join(","))
        ].join("\n");
        
        // Create Blob and trigger download
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const urlObj = URL.createObjectURL(blob);
        link.setAttribute("href", urlObj);
        
        // Format filename: users_export_YYYY-MM-DD.csv
        const dateStr = new Date().toISOString().split('T')[0];
        link.setAttribute("download", `users_export_${dateStr}.csv`);
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast("CSV exported successfully");
      } else {
        console.error("Export failed:", json.message);
        showToast("Export failed", "error");
      }
    } catch (err) {
      console.error("Export error:", err);
      showToast("Export error", "error");
    } finally {
      setExporting(false);
    }
  };

  const adminCount =
  stats?.admins ??
  users.filter(
    (u) => u.role_name?.toLowerCase() === "admin"
  ).length;

const schoolCount =
  stats?.schoolStudents ??
  users.filter((u) => u.school_name).length;

const collegeCount =
  stats?.collegeStudents ??
  users.filter(
    (u) => u.university || u.degree
  ).length;

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="page" style={{ position: "relative" }}>

      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", padding: "12px 24px", borderRadius: "8px", background: toast.type === "success" ? "#10b981" : "#ef4444", color: "#fff", zIndex: 1000, boxShadow: "0 4px 6px rgba(0,0,0,0.1)", fontWeight: "bold" }}>
          {toast.message}
        </div>
      )}

      {/* ========================================================= */}
      <div className="page-header" style={{ marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>Users</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Manage and view platform users</p>
        </div>
      </div>

      {/* STATS ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        <StatCard loading={loading} title="Total Users" value={total} color="#3b82f6" icon={<UsersIcon size={20} color="#3b82f6" />} />
        <StatCard loading={loading} title="Admin Users" value={adminCount} color="#f59e0b" icon={<Shield size={20} color="#f59e0b" />} />
        <StatCard loading={loading} title="School Students" value={schoolCount} color="#10b981" icon={<School size={20} color="#10b981" />} />
        <StatCard loading={loading} title="College Students" value={collegeCount} color="#8b5cf6" icon={<GraduationCap size={20} color="#8b5cf6" />} />
      </div>

      {/* ========================================================= */}
      {/* SEARCH & FILTERS */}
      {/* ========================================================= */}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "16px", flex: 1 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          <SearchFilter
            searchColumn={searchColumn}
            setSearchColumn={setSearchColumn}
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            handleSearch={handleSearch}
            handleClear={handleClear}
            isSearchActive={!!search}
            options={[
          { value: "Name", label: "Name" },
          { value: "Email", label: "Email" },
          { value: "Phone", label: "Phone" },
          { value: "Institution", label: "Institution" },
          { value: "Degree/Class", label: "Degree/Class" },
          { value: "Age", label: "Age" },
          { value: "Role", label: "Role" }
        ]}
      />
      </div>

      <button 
        onClick={handleExportCSV} 
        disabled={exporting}
        className="btn btn-primary"
        style={{ 
          background: "#10b981", 
          color: "#fff", 
          fontWeight: "bold",
          opacity: exporting ? 0.7 : 1,
          cursor: exporting ? "not-allowed" : "pointer"
        }}
      >
        {exporting ? "Exporting..." : "Export CSV"}
      </button>
      </div>

      {/* ========================================================= */}
      {/* TABLE */}
      {/* ========================================================= */}

      <style>{`
        .table-row-hover:hover td {
          background-color: rgba(255, 255, 255, 0.04) !important;
          transition: background-color 0.2s ease;
        }
        .table-row-hover:hover td a {
          color: #60a5fa !important;
          transition: color 0.2s ease;
        }
        .table-row-hover td a {
          transition: color 0.2s ease;
        }
      `}</style>

      <div className="table-container" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", minWidth: "1200px" }}>

          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Institution</th>
              <th>Degree/Class</th>
              <th>Age</th>
              <th>Role</th>
              <th>Profile Strength</th>
              <th>Status</th>
              <th>Resume</th>
              <th>LinkedIn</th>
              <th>GitHub</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>Loading users...</td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <EmptyState icon={UsersIcon} title="No users found" description="Try adjusting your search or filters." colSpan={10} />
            ) : (
              filteredUsers.map((u, index) => {
                const globalIndex = (page - 1) * limit + index + 1;
                return (
                  <tr key={u.user_id} className="table-row-hover">
                    <td>{globalIndex}</td>
                    <td style={{ fontWeight: 600 }}>
                      <Link to={`/users/${u.user_id}`} style={{ color: "#3b82f6", textDecoration: "none", display: "inline-block" }}>
                        {u.full_name || "N/A"}
                      </Link>
                    </td>
                    <td>
                      {u.email || "N/A"}
                    </td>

                    <td>
                      {u.phone || "N/A"}
                    </td>

                    <td>
                      {u.university || u.school_name || "N/A"}
                    </td>

                    <td>
                      {u.degree || u.class || "N/A"}
                    </td>

                    <td>
                      {u.age || "N/A"}
                    </td>

                    <td>
                      <span className="badge">
                        {u.role_name || "N/A"}
                      </span>
                    </td>

                    <td>
                      {(() => {
                        const { percentage, color } = calculateProfileScore(u);
                        return (
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: "100px" }}>
                            <div style={{ flex: 1, height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden" }}>
                              <div style={{ width: `${percentage}%`, height: "100%", background: color, transition: "width 0.3s ease" }}></div>
                            </div>
                            <span style={{ fontSize: "12px", color: "var(--text-color, #fff)", fontWeight: "bold" }}>{percentage}%</span>
                          </div>
                        );
                      })()}
                    </td>

                    <td>
                      {u.status === 1 ||
  u.status === "active" ||
  u.status === "Active" ? (
                        <span className="badge badge-success" style={{ color: "#10b981", background: "rgba(16, 185, 129, 0.15)" }}>Active</span>
                      ) : (
                        <span className="badge badge-warning" style={{ color: "#ef4444", background: "rgba(239, 68, 68, 0.15)" }}>Inactive</span>
                      )}
                    </td>

                    <td>
                      {
                        u.resume_url ? (
                          <a
                            href={u.resume_url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "#3b82f6", textDecoration: "underline" }}
                          >
                            Resume
                          </a>
                        ) : (
                          "N/A"
                        )
                      }
                    </td>

                    <td>
                      {
                        u.linkedin_url ? (
                          <a
                            href={u.linkedin_url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "#3b82f6", textDecoration: "underline" }}
                          >
                            LinkedIn
                          </a>
                        ) : (
                          "N/A"
                        )
                      }
                    </td>

                    <td>
                      {
                        u.github_url ? (
                          <a
                            href={u.github_url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "#3b82f6", textDecoration: "underline" }}
                          >
                            GitHub
                          </a>
                        ) : (
                          "N/A"
                        )
                      }
                    </td>

                  </tr>
                );
              })
            )}

          </tbody>

        </table>
      </div>

      {/* PAGINATION */}
      <Pagination page={page} totalPages={totalPages} setPage={setPage} />

    </div>
  );
}

export default Users;