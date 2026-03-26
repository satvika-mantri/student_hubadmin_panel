import { useState, useEffect } from "react";
import "../assets/form.css";

function Jobs() {
  const [jobs, setJobs] = useState([]);
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
    title: "",
    company_id: "",
    location: "",
    salary_min: "",
    salary_max: "",
    experience_level: "",
    description: "",
  });

  const [companies, setCompanies] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // FETCH JOBS
  useEffect(() => {
    fetchJobs();
  }, [page, search]);

  // FETCH COMPANIES
  useEffect(() => {
    fetch("https://studenthub-backend-woad.vercel.app/api/companies")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setCompanies(json.data);
      });
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://studenthub-backend-woad.vercel.app/api/bulk?type=jobs&page=${page}&limit=${limit}&search=${search}`
      );
      const json = await res.json();
      if (json.success) {
        setJobs(json.data);
        setTotal(json.total);
        setTotalPages(json.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // INPUT HANDLER
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // SUBMIT JOB
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.company_id) {
      setError("Please select a company");
      return;
    }

    setFormLoading(true);
    setError(null);
    setSuccess(null);

    const payload = {
      title: form.title,
      company_id: parseInt(form.company_id),
      location: form.location,
      salary_min: form.salary_min ? parseInt(form.salary_min) : null,
      salary_max: form.salary_max ? parseInt(form.salary_max) : null,
      experience_level: form.experience_level,
      description: form.description,
    };

    try {
      const res = await fetch(
        "https://studenthub-backend-woad.vercel.app/api/jobs",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const json = await res.json();

      if (json.success) {
        setSuccess("Job created successfully");
        setShowForm(false);
        fetchJobs();
        setForm({
          title: "",
          company_id: "",
          location: "",
          salary_min: "",
          salary_max: "",
          experience_level: "",
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
          <h1>{total} Jobs</h1>
          <p>Total {total} job listings</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            setError(null);
            setSuccess(null);
          }}
        >
          {showForm ? "Cancel" : "+ Post Job"}
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>

            <h2 className="form-title">Create Job</h2>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>{success}</p>}

            <div className="form-group">
              <label>Title</label>
              <input name="title" value={form.title} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Company</label>
              <select name="company_id" value={form.company_id} onChange={handleChange} required>
                <option value="">Select Company</option>
                {companies.map((c) => (
                  <option key={c.company_id} value={c.company_id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Location</label>
              <input name="location" value={form.location} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Salary Min</label>
              <input name="salary_min" value={form.salary_min} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Salary Max</label>
              <input name="salary_max" value={form.salary_max} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Experience</label>
              <input name="experience_level" value={form.experience_level} onChange={handleChange} />
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
                    title: "",
                    company_id: "",
                    location: "",
                    salary_min: "",
                    salary_max: "",
                    experience_level: "",
                    description: "",
                  })
                }
              >
                Reset
              </button>

              <button className="btn btn-primary" disabled={formLoading}>
                {formLoading ? "Creating..." : "Create Job"}
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
            {["#", "Title", "Company", "Location", "Salary", "Type", "Experience", "Applications", "Status", "Posted"].map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr><td colSpan={10}>Loading...</td></tr>
          ) : jobs.map((job, index) => (
            <tr key={job.job_id}>
              <td>{(page - 1) * limit + index + 1}</td>
              <td>{job.title}</td>
              <td>{job.company_name}</td>
              <td>{job.location}</td>
              <td>{job.salary_min} - {job.salary_max}</td>
              <td>{job.job_type}</td>
              <td>{job.experience_level}</td>
              <td>{job.total_applications}</td>
              <td>{job.status}</td>
              <td>{new Date(job.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}

export default Jobs;