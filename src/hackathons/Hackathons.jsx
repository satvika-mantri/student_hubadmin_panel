import { useState, useEffect } from "react";
import { Search, Plus, X } from "lucide-react";

const API_BASE = "https://studenthub-backend-woad.vercel.app";

const initialForm = {
  title: "",
  organizer: "",
  location: "",
  start_date: "",
  end_date: "",
  description: "",
};

function Hackathons() {
  const [hackathons, setHackathons] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const limit = 10;

  const [form, setForm] = useState(initialForm);
  const [formLoading, setFormLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // ================= FETCH =================
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
        setHackathons(json.data);
        setTotal(json.total);
        setTotalPages(json.totalPages);
      }

    } catch (err) {
      console.error("Fetch hackathons error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ================= SEARCH =================
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleClear = () => {
    setSearch("");
    setSearchInput("");
    setPage(1);
  };

  // ================= FORM =================
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setFormLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/hackathons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (json.success) {
        setSuccess("Hackathon created successfully!");
        setForm(initialForm);
        setShowForm(false);
        fetchHackathons();
      } else {
        setError(json.message);
      }

    } catch (err) {
      console.error("Create hackathon error:", err);
      setError("Server error");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div>

      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>Hackathons</h1>
          <p>Manage {total} hackathons</p>
        </div>

        <button
          className={showForm ? "btn btn-secondary" : "btn btn-primary"}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? (
            <><X size={16} /> Cancel</>
          ) : (
            <><Plus size={16} /> Post Hackathon</>
          )}
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <h2 className="form-title">Create Hackathon</h2>

            {error && <div className="message error">{error}</div>}
            {success && <div className="message success">{success}</div>}

            <div className="form-grid">
              <input name="title" value={form.title} onChange={handleChange} placeholder="Title" required />
              <input name="organizer" value={form.organizer} onChange={handleChange} placeholder="Organizer" required />
              <input name="location" value={form.location} onChange={handleChange} placeholder="Location" required />
              <input type="date" name="start_date" value={form.start_date} onChange={handleChange} required />
              <input type="date" name="end_date" value={form.end_date} onChange={handleChange} required />

              <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" />
            </div>

            <button className="btn btn-primary" disabled={formLoading}>
              {formLoading ? "Creating..." : "Create Hackathon"}
            </button>
          </form>
        </div>
      )}

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
              <th>Start</th>
              <th>End</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center" }}>
                  Loading hackathons...
                </td>
              </tr>
            ) : hackathons.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center" }}>
                  No hackathons found.
                </td>
              </tr>
            ) : (
              hackathons.map((h, index) => (
                <tr key={h.hackathon_id}>
                  <td>{(page - 1) * limit + index + 1}</td>
                  <td style={{ fontWeight: 500 }}>{h.title}</td>
                  <td>{h.organizer}</td>
                  <td>{h.location}</td>
                  <td>{h.start_date?.split("T")[0]}</td>
                  <td>{h.end_date?.split("T")[0]}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default Hackathons;