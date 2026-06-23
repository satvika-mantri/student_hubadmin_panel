import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, X, Building2, Briefcase, CheckCircle, XCircle } from "lucide-react";
import StatCard from "../components/StatCard";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import SearchFilter from "../components/SearchFilter";
import Modal from "../components/Modal";

const API_BASE = "https://studenthub-backend-woad.vercel.app";

function Companies() {
  const [companies, setCompanies] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchBy, setSearchBy] = useState("Name");
  const [loading, setLoading] = useState(false);
  const limit = 10;

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

  // ================= FETCH =================
  useEffect(() => {
    fetchCompanies();
  }, [page, search]);

  // ✅ FIX 1: Add Authorization
  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE}/api/bulk?type=companies&page=${page}&limit=${limit}&search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();

      if (json.success) {
        setCompanies(json.data);
        setTotal(json.total);
        setTotalPages(json.totalPages);
      }

    } catch (err) {
      console.error("Fetch companies error:", err);
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

    setFormLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/companies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ FIX 2
        },
        body: JSON.stringify(form),
      });

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

    } catch (err) {
      console.error("Create company error:", err);
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

  const filteredCompanies = companies.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    
    if (searchBy === "Name") return c.name?.toLowerCase().includes(q);
    if (searchBy === "Industry") return c.industry?.toLowerCase().includes(q);
    if (searchBy === "Location") return c.location?.toLowerCase().includes(q);
    if (searchBy === "Website") return c.website?.toLowerCase().includes(q);
    if (searchBy === "Status") {
      const statusText = (c.status === 1 || c.status === "active") ? "active" : "inactive";
      return statusText.includes(q);
    }
    if (searchBy === "Open Roles") {
      const totalRoles = (c.internships_count || 0) + (c.jobs_count || 0);
      return String(totalRoles).includes(q);
    }

    return true;
  });

  const activeCount = companies.filter(c => c.status === 1 || c.status === "active").length;
  const hiringCompanies = companies.filter(c => (c.internships_count || 0) > 0 || (c.jobs_count || 0) > 0).length;
  const totalRoles = companies.reduce((acc, c) => acc + (c.internships_count || 0) + (c.jobs_count || 0), 0);

  return (
    <div className="page" style={{ position: "relative" }}>

      <div className="page-header" style={{ marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>Companies</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Manage platform companies and recruiters</p>
        </div>

        <button
          className={showForm ? "btn btn-secondary" : "btn btn-primary"}
          onClick={() => {
            setShowForm(!showForm);
            setError(null);
            setSuccess(null);
          }}
        >
          {showForm ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Add Company</>}
        </button>
      </div>

      {/* STATS ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        <StatCard loading={loading} title="Total Companies" value={total} color="#3b82f6" icon={<Building2 size={20} color="#3b82f6" />} />
        <StatCard loading={loading} title="Active" value={activeCount} color="#10b981" icon={<CheckCircle size={20} color="#10b981" />} />
        <StatCard loading={loading} title="Companies Hiring" value={hiringCompanies} color="#f59e0b" icon={<Briefcase size={20} color="#f59e0b" />} />
        <StatCard loading={loading} title="Total Open Roles" value={totalRoles} color="#8b5cf6" icon={<Briefcase size={20} color="#8b5cf6" />} />
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Add New Company">
          <form onSubmit={handleSubmit}>
            {error && <div className="message error">{error}</div>}
            {success && <div className="message success">{success}</div>}

            <div className="form-grid">
              <input name="name" placeholder="Company Name" value={form.name} onChange={handleChange} required />
              <input name="industry" placeholder="Industry" value={form.industry} onChange={handleChange} />
              <input name="location" placeholder="Location" value={form.location} onChange={handleChange} />
              <input name="website" placeholder="Website URL" value={form.website} onChange={handleChange} />
              <textarea name="description" placeholder="Company Description" value={form.description} onChange={handleChange} />
            </div>

            <button className="btn btn-primary" disabled={formLoading} style={{ marginTop: "16px", width: "100%" }}>
              {formLoading ? "Creating..." : "Create Company"}
            </button>
          </form>
      </Modal>

      <SearchFilter
        searchColumn={searchBy}
        setSearchColumn={setSearchBy}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        handleSearch={handleSearch}
        handleClear={handleClear}
        isSearchActive={!!search}
        options={[
          { value: "Name", label: "Name" },
          { value: "Industry", label: "Industry" },
          { value: "Location", label: "Location" },
          { value: "Website", label: "Website" },
          { value: "Open Roles", label: "Open Roles" },
          { value: "Status", label: "Status" }
        ]}
      />

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
        .custom-table-container::-webkit-scrollbar {
          height: 8px;
        }
        .custom-table-container::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }
        .custom-table-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
        .custom-table-container::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>

      <div className="table-container custom-table-container" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", minWidth: "800px" }}>
            <thead>
              <tr>
                <th>#</th>
                <th>Company</th>
                <th>Industry</th>
                <th>Location</th>
                <th>Open Roles</th>
                <th>Website</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>Loading companies...</td></tr>
              ) : filteredCompanies.length === 0 ? (
                <EmptyState icon={Building2} title="No companies found" description="Try adjusting your search or filters." colSpan={7} />
              ) : filteredCompanies.map((c, i) => {
                const internshipsCount = c.internships_count || 0;
                const jobsCount = c.jobs_count || 0;
                const totalRoles = internshipsCount + jobsCount;

                return (
                <tr key={c.company_id} className="table-row-hover">
                  <td>{(page - 1) * limit + i + 1}</td>
                  <td style={{ fontWeight: 600 }}>
                    <Link to={`/companies/${c.company_id}`} style={{ color: "#3b82f6", textDecoration: "none", display: "inline-block" }}>
                      {c.name || "N/A"}
                    </Link>
                  </td>
                  <td>{c.industry ? <span className="badge">{c.industry}</span> : <span style={{ opacity: 0.5 }}>—</span>}</td>
                  <td>{c.location || <span style={{ opacity: 0.5 }}>—</span>}</td>
                  <td>
                    {totalRoles > 0 ? (
                      <span style={{ fontSize: "13px", color: "var(--text-main)" }}>
                        {internshipsCount} Internships • {jobsCount} Jobs
                      </span>
                    ) : (
                      <span style={{ opacity: 0.5, fontStyle: "italic", fontSize: "13px" }}>No open roles</span>
                    )}
                  </td>
                  <td>
                    {c.website ? <a href={c.website} target="_blank" rel="noreferrer" style={{ color: "#3b82f6", textDecoration: "underline" }}>Website</a> : <span style={{ opacity: 0.5 }}>—</span>}
                  </td>
                  <td>
                    {c.status === 1 || c.status === "active" ? (
                      <span className="badge badge-success" style={{ color: "#10b981", background: "rgba(16, 185, 129, 0.15)" }}>Active</span>
                    ) : (
                      <span className="badge badge-warning" style={{ color: "#ef4444", background: "rgba(239, 68, 68, 0.15)" }}>Inactive</span>
                    )}
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>

      <Pagination page={page} totalPages={totalPages} setPage={setPage} />

    </div>
  );
}

export default Companies;