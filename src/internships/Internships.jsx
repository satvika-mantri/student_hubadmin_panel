import { useState, useEffect } from "react";
import { Search, Plus, X } from "lucide-react";

const API_BASE = "https://studenthub-backend-woad.vercel.app";

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

  // ================= FETCH INTERNSHIPS =================
  useEffect(() => {
    fetchInternships();
  }, [page, search]);

  // ================= FETCH COMPANIES + SKILLS =================
  useEffect(() => {
    fetchCompanies();
    fetchSkills();
  }, []);

  // ✅ FIX 1: Correct companies API + auth
  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE}/api/bulk?type=companies&page=1&limit=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();
      if (json.success) setCompanies(json.data);

    } catch (err) {
      console.error("Fetch companies error:", err);
    }
  };

  // ✅ FIX 2: Add auth to skills fetch
  const fetchSkills = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/skills`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (json.skills) setSkills(json.skills);

    } catch (err) {
      console.error("Fetch skills error:", err);
    }
  };

  // ✅ FIX 3: Add auth to internships fetch
  const fetchInternships = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE}/api/bulk?type=internships&page=${page}&limit=${limit}&search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();

      if (json.success) {
        setInternships(json.data);
        setTotal(json.total);
        setTotalPages(json.totalPages);
      }

    } catch (err) {
      console.error("Fetch internships error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ================= FORM =================
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

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.company_id) {
      setError("Please select a company");
      return;
    }

    setFormLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/internships`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title,
          company_id: parseInt(form.company_id),
          location: form.location,
          duration: form.duration,
          stipend: form.stipend,
          description: form.description,
          skill_ids: form.skill_ids,
        }),
      });

      const json = await res.json();

      if (json.success) {
        setSuccess("Internship created successfully!");
        setForm(initialForm);
        setShowForm(false);
        fetchInternships();
      } else {
        setError(json.message);
      }

    } catch (err) {
      console.error("Create internship error:", err);
      setError("Server error");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div>

      <div className="page-header">
        <div>
          <h1>Internships</h1>
          <p>Manage {total} upcoming internships</p>
        </div>

        <button 
          className={showForm ? "btn btn-secondary" : "btn btn-primary"}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Post Internship</>}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <h2 className="form-title">Create Internship</h2>
            {error && <div className="message error">{error}</div>}
            {success && <div className="message success">{success}</div>}

            <div className="form-grid">
              <input name="title" value={form.title} onChange={handleChange} placeholder="Internship Title" required />

              <select name="company_id" value={form.company_id} onChange={handleChange} required>
                <option value="">Select Company</option>
                {companies.map(c => (
                  <option key={c.company_id} value={c.company_id}>{c.name}</option>
                ))}
              </select>

              <input name="location" value={form.location} onChange={handleChange} placeholder="Location" />
              <input name="duration" value={form.duration} onChange={handleChange} placeholder="Duration (e.g., 3 months)" />
              <input name="stipend" value={form.stipend} onChange={handleChange} placeholder="Stipend Amount/Range" />

              <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" />

              <select multiple value={form.skill_ids.map(String)} onChange={handleSkillChange} className="full-width">
                <option disabled value="">Select Skills (Multi-select)</option>
                {skills.map(s => (
                  <option key={s.skill_id} value={s.skill_id}>{s.name}</option>
                ))}
              </select>
            </div>

            <button className="btn btn-primary" disabled={formLoading}>
              {formLoading ? "Creating..." : "Create Internship"}
            </button>
          </form>
        </div>
      )}

      <form onSubmit={handleSearch} className="search-form">
        <input 
          value={searchInput} 
          onChange={(e) => setSearchInput(e.target.value)} 
          placeholder="Search internships..."
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

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>#</th><th>Title</th><th>Company</th><th>Location</th><th>Stipend</th><th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: "center" }}>Loading internships...</td></tr>
            ) : internships.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: "center" }}>No internships found.</td></tr>
            ) : internships.map((i, index) => (
              <tr key={i.internship_id}>
                <td>{(page - 1) * limit + index + 1}</td>
                <td style={{ fontWeight: 500 }}>{i.title}</td>
                <td>{i.company_name}</td>
                <td>{i.location || "Remote"}</td>
                <td>{i.stipend ? <span className="badge badge-success">{i.stipend}</span> : "Unpaid"}</td>
                <td>{i.duration || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default Internships;