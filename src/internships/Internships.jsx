import { useState, useEffect } from "react";

function Internships() {
  const [internships, setInternships] = useState([]);
  const [page, setPage]               = useState(1);
  const [total, setTotal]             = useState(0);
  const [totalPages, setTotalPages]   = useState(0);
  const [search, setSearch]           = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading]         = useState(false);
  const limit = 10;

  useEffect(() => {
    fetchInternships();
  }, [page, search]);

  const fetchInternships = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://studenthub-backend-woad.vercel.app/api/bulk?type=internships&page=${page}&limit=${limit}&search=${search}`
      );
      const json = await res.json();
      if (json.success) {
        setInternships(json.data);
        setTotal(json.total);
        setTotalPages(json.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch internships:", err);
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
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  return (
    <div>

      {/* ── Header ── */}
      <div>
        <h1>{total} Internships</h1>
        <p>Total {total} internship listings</p>
      </div>

      {/* ── Search Bar ── */}
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by title, company or location..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit">Search</button>
        {search && (
          <button type="button" onClick={handleClear}>Clear</button>
        )}
      </form>

      {/* ── Table ── */}
      <table>
        <thead>
          <tr>
            {["#", "Title", "Company", "Location", "Stipend", "Duration", "Type", "Applications", "Status", "Posted"].map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={10}>⏳ Loading internships...</td>
            </tr>
          ) : internships.length === 0 ? (
            <tr>
              <td colSpan={10}>No internships found</td>
            </tr>
          ) : (
            internships.map((internship, index) => (
              <tr key={internship.internship_id}>
                <td>{(page - 1) * limit + index + 1}</td>

                <td>{internship.title}</td>

                <td>{internship.company_name || "—"}</td>

                <td>{internship.location || "—"}</td>

                <td>{internship.stipend || "—"}</td>

                <td>{internship.duration || "—"}</td>

                <td>{internship.internship_type || "—"}</td>

                <td>{internship.total_applications ?? 0}</td>

                <td>{internship.status}</td>

                <td>
                  {new Date(internship.created_at).toLocaleDateString("en-IN", {
                    day: "2-digit", month: "short", year: "numeric",
                  })}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div>
          <span>
            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} internships
          </span>
          <div>
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
            >
              ← Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}>{p}</button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Internships;
