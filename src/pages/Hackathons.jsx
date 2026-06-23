import { useState, useEffect } from "react";
import { Search } from "lucide-react";

const API_BASE = "https://studenthub-backend-woad.vercel.app";

function Hackathons() {
  const [hackathons, setHackathons] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const limit = 1000;

  useEffect(() => {
    fetchHackathons();
  }, [page, search]);

  const fetchHackathons = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE}/api/bulk?type=hackathons&page=${page}&limit=${limit}&search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();
      if (json.success) {
        setHackathons(json.data || []);
        setTotal(json.total || 0);
        setTotalPages(json.totalPages || 1);
      }
    } catch (err) {
      console.error("Fetch hackathons error:", err);
    } finally {
      setLoading(false);
    }
  };

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
    <div>
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>Hackathons</h1>
          <p>Manage {total} hackathons</p>
        </div>
      </div>

      {/* SEARCH */}
      <form onSubmit={handleSearch} className="search-form">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search hackathons..."
        />
        <button type="submit" className="btn btn-primary">
          <Search size={16} /> Search
        </button>
        {search && (
          <button type="button" onClick={handleClear} className="btn btn-secondary">
            Clear
          </button>
        )}
      </form>

      {/* TABLE */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Organizer</th>
              <th>Location</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: "center" }}>Loading...</td></tr>
            ) : hackathons.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: "center" }}>No data found</td></tr>
            ) : hackathons.map((hack, index) => (
              <tr key={hack.hackathon_id || index}>
                <td>{(page - 1) * limit + index + 1}</td>
                <td style={{ fontWeight: 500 }}>{hack.title || "N/A"}</td>
                <td>{hack.organizer || "N/A"}</td>
                <td>{hack.location || "N/A"}</td>
                <td>{hack.start_date ? new Date(hack.start_date).toLocaleDateString() : "N/A"}</td>
                <td>{hack.end_date ? new Date(hack.end_date).toLocaleDateString() : "N/A"}</td>
                <td>
                  <span className={`badge ${hack.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                    {hack.status || "inactive"}
                  </span>
                </td>
                <td>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button className="badge badge-info" style={{ border: "none", cursor: "pointer" }}>Edit</button>
                    <button className="badge badge-warning" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", border: "none", cursor: "pointer" }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px", padding: "0 8px" }}>
          <button
            className="btn btn-secondary"
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>
            Page {page} of {totalPages}
          </span>
          <button
            className="btn btn-secondary"
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default Hackathons;
