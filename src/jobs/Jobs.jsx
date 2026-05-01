import { useState, useEffect } from "react";
import { Search, Plus, X } from "lucide-react";

const API_BASE = "https://studenthub-backend-woad.vercel.app";

// 🔥 Salary Formatter
const formatSalary = (amount) => {
  if (!amount) return "—";

  if (amount >= 100000) {
    return (amount / 100000).toFixed(1).replace(".0", "") + "L";
  }

  if (amount >= 1000) {
    return (amount / 1000).toFixed(0) + "K";
  }

  return amount;
};

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const limit = 10;

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    company_id: "",
    location: "",
    job_type: "",
    experience_level: "",
    salary_min: "",
    salary_max: "",
    description: ""
  });

  const [companies, setCompanies] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // ================= FETCH JOBS =================
  useEffect(() => {
    fetchJobs();
  }, [page, search]);

  // ================= FETCH COMPANIES =================
  useEffect(() => {
    fetchCompanies();
  }, []);

  // ✅ FIX 1: Correct API for companies + auth
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

  // ✅ FIX 2: Add Authorization header
  const fetchJobs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE}/api/bulk?type=jobs&page=${page}&limit=${limit}&search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();

      if (json.success) {
        setJobs(json.data);
        setTotal(json.total);
        setTotalPages(json.totalPages);
      }

    } catch (err) {
      console.error("Fetch jobs error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ================= INPUT =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.company_id) {
      setError("Please select a company");
      return;
    }

    setFormLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ FIX 3
        },
        body: JSON.stringify({
          title: form.title,
          company_id: parseInt(form.company_id),
          location: form.location,
          job_type: form.job_type,
          experience_level: form.experience_level,
          salary_min: form.salary_min ? parseInt(form.salary_min) : null,
          salary_max: form.salary_max ? parseInt(form.salary_max) : null,
          description: form.description
        })
      });

      const json = await res.json();

      if (json.success) {
        setSuccess("Job created successfully");
        setShowForm(false);
        fetchJobs();

        setForm({
          title: "",
          company_id: "",
          location: "",
          job_type: "",
          experience_level: "",
          salary_min: "",
          salary_max: "",
          description: ""
        });
      } else {
        setError(json.message);
      }

    } catch (err) {
      console.error("Create job error:", err);
      setError("Server error");
    } finally {
      setFormLoading(false);
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
  };

  return (
    <div>

      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1>Jobs</h1>
          <p>Manage over {total} job listings</p>
        </div>

        <button
          className={showForm ? "btn btn-secondary" : "btn btn-primary"}
          onClick={() => {
            setShowForm(!showForm);
            setError(null);
            setSuccess(null);
          }}
        >
          {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Post Job</>}
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <h2 className="form-title">Create Job</h2>

            {error && <div className="message error">{error}</div>}
            {success && <div className="message success">{success}</div>}

            <div className="form-grid">
              <input name="title" placeholder="Job Title" value={form.title} onChange={handleChange} required />

              <select name="company_id" value={form.company_id} onChange={handleChange} required>
                <option value="">Select Company</option>
                {companies.map((c) => (
                  <option key={c.company_id} value={c.company_id}>{c.name}</option>
                ))}
              </select>

              <input name="location" placeholder="Location" value={form.location} onChange={handleChange} />
              <input name="job_type" placeholder="Job Type" value={form.job_type} onChange={handleChange} />
              <input name="experience_level" placeholder="Experience" value={form.experience_level} onChange={handleChange} />
              <input type="number" name="salary_min" placeholder="Min Salary" value={form.salary_min} onChange={handleChange} />
              <input type="number" name="salary_max" placeholder="Max Salary" value={form.salary_max} onChange={handleChange} />

              <textarea name="description" placeholder="Job Description" value={form.description} onChange={handleChange} />
            </div>

            <button className="btn btn-primary" disabled={formLoading}>
              {formLoading ? "Creating..." : "Create Job"}
            </button>
          </form>
        </div>
      )}

      {/* SEARCH */}
      <form onSubmit={handleSearch} className="search-form">
        <input 
          value={searchInput} 
          onChange={(e) => setSearchInput(e.target.value)} 
          placeholder="Search jobs..."
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
              {["#", "Title", "Company", "Location", "Salary", "Type", "Experience", "Applications", "Status", "Posted"].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><td colSpan={10} style={{ textAlign: "center" }}>Loading jobs...</td></tr>
            ) : jobs.length === 0 ? (
              <tr><td colSpan={10} style={{ textAlign: "center" }}>No jobs found.</td></tr>
            ) : jobs.map((job, index) => (
              <tr key={job.job_id}>
                <td>{(page - 1) * limit + index + 1}</td>
                <td style={{ fontWeight: 500 }}>{job.title}</td>
                <td>{job.company_name}</td>
                <td>{job.location}</td>
                <td>
                  {job.salary_min && job.salary_max
                    ? `₹${formatSalary(job.salary_min)} – ₹${formatSalary(job.salary_max)}`
                    : job.salary_min
                    ? `₹${formatSalary(job.salary_min)}+`
                    : "—"}
                </td>
                <td><span className="badge">{job.job_type || "N/A"}</span></td>
                <td>{job.experience_level || "N/A"}</td>
                <td>{job.total_applications}</td>
                <td>
                  <span className={`badge ${job.status === 'open' ? 'badge-success' : 'badge-warning'}`}>
                    {job.status}
                  </span>
                </td>
                <td>{new Date(job.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default Jobs;