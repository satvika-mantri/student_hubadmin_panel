import { useState, useEffect } from "react";
import { Search } from "lucide-react";

const API_BASE = "https://studenthub-backend-woad.vercel.app";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const limit = 1000;

  useEffect(() => {
    fetchCourses();
  }, [page, search]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${API_BASE}/api/bulk?type=courses&page=${page}&limit=${limit}&search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();
      if (json.success) {
        setCourses(json.data || []);
        setTotal(json.total || 0);
        setTotalPages(json.totalPages || 1);
      }
    } catch (err) {
      console.error("Fetch courses error:", err);
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
          <h1>Courses</h1>
          <p>Manage {total} courses</p>
        </div>
      </div>

      {/* SEARCH */}
      <form onSubmit={handleSearch} className="search-form">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search courses..."
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
              <th>Provider</th>
              <th>Level</th>
              <th>Duration</th>
              <th>Target Group</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: "center" }}>Loading...</td></tr>
            ) : courses.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: "center" }}>No data found</td></tr>
            ) : courses.map((course, index) => (
              <tr key={course.course_id || index}>
                <td>{(page - 1) * limit + index + 1}</td>
                <td style={{ fontWeight: 500 }}>{course.title || "N/A"}</td>
                <td>{course.provider || "N/A"}</td>
                <td>{course.level || "N/A"}</td>
                <td>{course.duration || "N/A"}</td>
                <td>{course.target_group || "N/A"}</td>
                <td>
                  <span className={`badge ${course.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                    {course.status || "inactive"}
                  </span>
                </td>
                <td>
                  {/* Actions wrapper */}
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

export default Courses;
