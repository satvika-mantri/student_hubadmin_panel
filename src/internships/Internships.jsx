import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, X, CheckCircle, XCircle, Building2 } from "lucide-react";
import StatCard from "../components/StatCard";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import SearchFilter from "../components/SearchFilter";
import Modal from "../components/Modal";

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

const initialForm = {
  title:       "",
  company_id:  "",
  location:    "",
  duration:    "",
  stipend:     "",
  description: "",
  skill_ids:   [],
};

function Internships() {
  // ── List state ──
  const [internships, setInternships] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchColumn, setSearchColumn] = useState("Title");
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
  }, [page, search, searchColumn]);

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
        `${API_BASE}/api/bulk?type=internships&page=${page}&limit=${limit}&search=${search}&searchColumn=${searchColumn}`,
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

  // ================= STATUS HELPER =================
  const getInternshipStatus = (i) => {
    if (i.status === 0) return "Closed";
    if (i.application_deadline && new Date(i.application_deadline) < new Date()) return "Expired";
    return "Active";
  };

  const statusStyles = {
    Active: { background: "rgba(16, 185, 129, 0.15)", color: "#10b981", padding: "6px 16px", borderRadius: "99px", fontSize: "12px", fontWeight: "600", border: "1px solid rgba(16, 185, 129, 0.3)", boxShadow: "0 0 10px rgba(16, 185, 129, 0.15)" },
    Expired: { background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", padding: "6px 16px", borderRadius: "99px", fontSize: "12px", fontWeight: "600", border: "1px solid rgba(239, 68, 68, 0.3)", boxShadow: "0 0 10px rgba(239, 68, 68, 0.15)" },
    Closed: { background: "rgba(100, 116, 139, 0.15)", color: "#94a3b8", padding: "6px 16px", borderRadius: "99px", fontSize: "12px", fontWeight: "600", border: "1px solid rgba(100, 116, 139, 0.3)", boxShadow: "0 0 10px rgba(100, 116, 139, 0.15)" }
  };

  const activeCount = internships.filter(i => getInternshipStatus(i) === "Active").length;
  const closedCount = internships.filter(i => getInternshipStatus(i) === "Closed").length;
  const uniqueCompanies = new Set(internships.filter(i => i.company_id).map(i => i.company_id)).size;

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

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Create Internship">
          <form onSubmit={handleSubmit}>
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

            <button className="btn btn-primary" disabled={formLoading} style={{ marginTop: "16px", width: "100%" }}>
              {formLoading ? "Creating..." : "Create Internship"}
            </button>
          </form>
      </Modal>

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

      {/* STATS ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        <StatCard title="Total Internships" value={total} color="#3b82f6" icon={<Search size={20} color="#3b82f6" />} />
        <StatCard title="Active" value={activeCount} color="#10b981" icon={<CheckCircle size={20} color="#10b981" />} />
        <StatCard title="Closed" value={closedCount} color="#94a3b8" icon={<XCircle size={20} color="#94a3b8" />} />
        <StatCard title="Companies Hiring" value={uniqueCompanies} color="#8b5cf6" icon={<Building2 size={20} color="#8b5cf6" />} />
      </div>

      <SearchFilter
        searchColumn={searchColumn}
        setSearchColumn={setSearchColumn}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        handleSearch={handleSearch}
        handleClear={handleClear}
        isSearchActive={!!search}
        options={[
          { value: "Title", label: "Title" },
          { value: "Company", label: "Company" },
          { value: "Location", label: "Location" },
          { value: "Stipend", label: "Stipend" },
          { value: "Duration", label: "Duration" },
          { value: "Status", label: "Status" }
        ]}
      />

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>#</th><th>Title</th><th>Company</th><th>Location</th><th>Stipend</th><th>Duration</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>Loading internships...</td></tr>
            ) : internships.length === 0 ? (
              <EmptyState icon={Search} title="No internships found" description="Try adjusting your search or filters." colSpan={7} />
            ) : internships.map((i, index) => {
              const currentStatus = getInternshipStatus(i);
              return (
              <tr key={i.internship_id} className="table-row-hover">
                <td>{(page - 1) * limit + index + 1}</td>
                <td style={{ fontWeight: 600 }}>
                  <Link to={`/internships/${i.internship_id}`} style={{ color: "#3b82f6", textDecoration: "none", display: "inline-block" }}>
                    {i.title}
                  </Link>
                </td>
                <td>{i.company_name}</td>
                <td>{i.location || "Remote"}</td>
                <td>{i.stipend ? <span className="badge badge-success">{i.stipend}</span> : "Unpaid"}</td>
                <td>{i.duration || "N/A"}</td>
                <td>
                  <span style={statusStyles[currentStatus]}>
                    {currentStatus}
                  </span>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <Pagination page={page} totalPages={totalPages} setPage={setPage} />

    </div>
  );
}

export default Internships;