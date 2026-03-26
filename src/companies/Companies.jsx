import { useState, useEffect } from "react";
import "../assets/form.css";

function Companies() {
  const [companies, setCompanies] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const limit = 10;

  // FORM STATE
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    industry: "",
    location: "",
    website: "",
    description: "",
  });

  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // FETCH
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // INPUT CHANGE
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    setFormLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(
        "https://studenthub-backend-woad.vercel.app/api/companies",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const json = await res.json();

      if (json.success) {
        setSuccess("Company created successfully");
        setShowForm(false);
        fetchCompanies();

        setForm({
          name: "",
          industry: "",
          location: "",
          website: "",
          description: "",
        });
      } else {
        setError(json.message);
      }
    } catch {
      setError("Server error");
    } finally {
      setFormLoading(false);
    }
  };

  // SEARCH
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
    <div style={{ padding: "20px" }}>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <h1>{total} Companies</h1>
          <p>Total {total} registered companies</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            setError(null);
            setSuccess(null);
          }}
        >
          {showForm ? "Cancel" : "+ Add Company"}
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>

            <h2 className="form-title">Create Company</h2>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>{success}</p>}

            <div className="form-group">
              <label>Name</label>
              <input name="name" value={form.name} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Industry</label>
              <input name="industry" value={form.industry} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Location</label>
              <input name="location" value={form.location} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Website</label>
              <input name="website" value={form.website} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  setForm({
                    name: "",
                    industry: "",
                    location: "",
                    website: "",
                    description: "",
                  })
                }
              >
                Reset
              </button>

              <button className="btn btn-primary" disabled={formLoading}>
                {formLoading ? "Creating..." : "Create Company"}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* SEARCH */}
      <form onSubmit={handleSearch}>
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search..."
        />
        <button type="submit">Search</button>
        {search && <button onClick={handleClear}>Clear</button>}
      </form>

      {/* TABLE */}
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
            <tr><td colSpan={7}>Loading...</td></tr>
          ) : companies.map((company, index) => (
            <tr key={company.company_id}>
              <td>{(page - 1) * limit + index + 1}</td>

              <td>{company.name}</td>

              <td>{company.industry || "—"}</td>

              <td>{company.location || "—"}</td>

              <td>
                {company.website
                  ? <a href={company.website} target="_blank" rel="noreferrer">{company.website}</a>
                  : "—"}
              </td>

              <td>{company.status}</td>

              <td>
                {new Date(company.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}

export default Companies;