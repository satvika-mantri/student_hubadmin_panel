import { useState, useEffect } from "react";
import "../assets/form.css";

const initialForm = {
  title: "",
  company_id: "",
  location: "",
  duration: "",
  stipend: "",
  description: "",
  skill_ids: [],
};

function Internships() {
  const [internships, setInternships] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const limit = 10;

  const [form, setForm] = useState(initialForm);
  const [companies, setCompanies] = useState([]);
  const [skills, setSkills] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchInternships();
  }, [page, search]);

  useEffect(() => {
    fetch("https://studenthub-backend-woad.vercel.app/api/companies")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setCompanies(json.data);
      });

    fetch("https://studenthub-backend-woad.vercel.app/api/skills")
      .then((r) => r.json())
      .then((json) => {
        if (json.skills) setSkills(json.skills);
      });
  }, []);

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
      console.error(err);
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

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSkillChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((o) =>
      parseInt(o.value)
    );
    setForm((prev) => ({ ...prev, skill_ids: selected }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.company_id) {
      setError("Please select a company");
      return;
    }

    setFormLoading(true);
    setSuccess(null);
    setError(null);

    const payload = {
      title: form.title,
      company_id: parseInt(form.company_id),
      location: form.location,
      duration: form.duration,
      stipend: form.stipend,
      description: form.description,
      skill_ids: form.skill_ids,
    };

    try {
      const res = await fetch(
        "https://studenthub-backend-woad.vercel.app/api/internships",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const json = await res.json();

      if (json.success) {
        setSuccess("Internship created successfully!");
        setForm(initialForm);
        setShowForm(false);
        fetchInternships();
      } else {
        setError(json.message);
      }
    } catch {
      setError("Server error");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>

      {/* HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "20px"
      }}>
        <div>
          <h1>{total} Internships</h1>
          <p>Total {total} internship listings</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            setError(null);
            setSuccess(null);
          }}
        >
          {showForm ? "Cancel" : "+ Post Internship"}
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>

            <h2 className="form-title">New Internship</h2>

            {success && <p style={{ color: "#22c55e" }}>{success}</p>}
            {error && <p style={{ color: "#ef4444" }}>{error}</p>}

            <div className="form-group">
              <label>Title *</label>
              <input name="title" value={form.title} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Company *</label>
              <select name="company_id" value={form.company_id} onChange={handleChange} required>
                <option value="">-- Select Company --</option>
                {companies.map((c) => (
                  <option key={c.company_id} value={c.company_id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Location *</label>
              <input name="location" value={form.location} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Duration *</label>
              <input name="duration" value={form.duration} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Stipend</label>
              <input name="stipend" value={form.stipend} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Skills</label>
              <select multiple value={form.skill_ids.map(String)} onChange={handleSkillChange}>
                {skills.map((s) => (
                  <option key={s.skill_id} value={s.skill_id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setForm(initialForm)}
              >
                Reset
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={formLoading}
              >
                {formLoading ? "Creating..." : "Create Internship"}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* SEARCH */}
      <form onSubmit={handleSearch} style={{ marginBottom: "20px" }}>
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search..."
        />
        <button type="submit">Search</button>
        {search && <button onClick={handleClear}>Clear</button>}
      </form>

      {/* TABLE */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {["#", "Title", "Company", "Location", "Stipend", "Duration", "Status"].map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr><td colSpan={7}>Loading...</td></tr>
          ) : internships.map((i, index) => (
            <tr key={i.internship_id}>
              <td>{index + 1}</td>
              <td>{i.title}</td>
              <td>{i.company_name}</td>
              <td>{i.location}</td>
              <td>{i.stipend}</td>
              <td>{i.duration}</td>
              <td>{i.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}

export default Internships;