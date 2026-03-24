import { useState, useEffect } from "react";

function Companies() {
  const [companies, setCompanies]     = useState([]);
  const [page, setPage]               = useState(1);
  const [total, setTotal]             = useState(0);
  const [totalPages, setTotalPages]   = useState(0);
  const [search, setSearch]           = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading]         = useState(false);
  const limit = 10;

  useEffect(() => {
    fetchCompanies();
  }, [page, search]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://studenthub-backend-woad.vercel.app/api/bulk?type=companies&page=${page}&limit=${limit}&search=${search}`
      );
      const json = await res.json();
      if (json.success) {
        setCompanies(json.data);
        setTotal(json.total);
        setTotalPages(json.totalPages);
      }
    } catch (err) {
      console.error("Failed to fetch companies:", err);
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
        <h1>{total} Companies</h1>
        <p>Total {total} registered companies</p>
      </div>

      {/* ── Search Bar ── */}
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search by name or industry..."
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
            {["#", "Name", "Industry", "Location", "Website", "Status", "Joined"].map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={7}>⏳ Loading companies...</td>
            </tr>
          ) : companies.length === 0 ? (
            <tr>
              <td colSpan={7}>No companies found</td>
            </tr>
          ) : (
            companies.map((company, index) => (
              <tr key={company.company_id}>
                <td>{(page - 1) * limit + index + 1}</td>

                <td>
                  <span>{company.name?.charAt(0).toUpperCase()}</span>
                  <span>{company.name}</span>
                </td>

                <td>{company.industry || "—"}</td>

                <td>{company.location || "—"}</td>

                <td>
                  {company.website
                    ? <a href={company.website} target="_blank" rel="noreferrer">{company.website}</a>
                    : "—"}
                </td>

                <td>{company.status}</td>

                <td>
                  {new Date(company.created_at).toLocaleDateString("en-IN", {
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
            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total} companies
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

export default Companies;
