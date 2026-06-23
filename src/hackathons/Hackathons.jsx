import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, X, Trophy, CheckCircle, Calendar, DollarSign } from "lucide-react";
import StatCard from "../components/StatCard";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import SearchFilter from "../components/SearchFilter";
import Modal from "../components/Modal";

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
  const [searchColumn, setSearchColumn] = useState("Title");
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
        `${API_BASE}/api/bulk?type=hackathons&page=${page}&limit=${limit}&search=${search}&searchColumn=${searchColumn}`,
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

  // ================= DATA LOGIC =================
  const activeHackathons = hackathons.filter(h => h.status === 1 || h.status === "active").length;
  const upcomingHackathons = hackathons.filter(h => new Date(h.start_date) > new Date()).length;
  const totalPrizePool = hackathons.reduce((acc, h) => {
    let pool = String(h.prize_pool || "0").replace(/[^0-9]/g, "");
    return acc + (parseInt(pool) || 0);
  }, 0);

  const formatCurrency = (amount) => {
    if (!amount) return "₹0";
    if (amount >= 100000) return "₹" + (amount / 100000).toFixed(1).replace(".0", "") + "L";
    if (amount >= 1000) return "₹" + (amount / 1000).toFixed(0) + "K";
    return "₹" + amount;
  };

  return (
    <div className="page" style={{ position: "relative" }}>

      {/* HEADER */}
      <div className="page-header" style={{ marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>Hackathons</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Manage platform hackathons and events</p>
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

      {/* STATS ROW */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        <StatCard loading={loading} title="Total Hackathons" value={total} color="#3b82f6" icon={<Trophy size={20} color="#3b82f6" />} />
        <StatCard loading={loading} title="Active Hackathons" value={activeHackathons} color="#10b981" icon={<CheckCircle size={20} color="#10b981" />} />
        <StatCard loading={loading} title="Upcoming This Month" value={upcomingHackathons} color="#f59e0b" icon={<Calendar size={20} color="#f59e0b" />} />
        <StatCard loading={loading} title="Total Prize Pool" value={formatCurrency(totalPrizePool)} color="#a855f7" icon={<DollarSign size={20} color="#a855f7" />} />
      </div>

      {/* FORM */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Create Hackathon">
          <form onSubmit={handleSubmit}>
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

            <button className="btn btn-primary" disabled={formLoading} style={{ marginTop: "16px", width: "100%" }}>
              {formLoading ? "Creating..." : "Create Hackathon"}
            </button>
          </form>
      </Modal>

      {/* SEARCH */}
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
          { value: "Organizer", label: "Organizer" },
          { value: "Mode", label: "Mode" },
          { value: "Prize Pool", label: "Prize Pool" }
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
      `}</style>

      {/* TABLE */}
      <div className="table-container" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", minWidth: "800px" }}>
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Organizer</th>
              <th>Mode</th>
              <th>Prize Pool</th>
              <th>Start Date</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                  Loading hackathons...
                </td>
              </tr>
            ) : hackathons.length === 0 ? (
              <EmptyState icon={Trophy} title="No hackathons found" description="Try adjusting your search filters or create a new hackathon." colSpan={7} />
            ) : (
              hackathons.map((h, index) => {
                const modeStr = h.mode ? h.mode.toLowerCase() : "online";
                let modeColor = "#3b82f6"; // Online (blue)
                let modeBg = "rgba(59, 130, 246, 0.15)";
                if (modeStr === "offline") { modeColor = "#f59e0b"; modeBg = "rgba(245, 158, 11, 0.15)"; } // Offline (orange)
                if (modeStr === "hybrid") { modeColor = "#8b5cf6"; modeBg = "rgba(139, 92, 246, 0.15)"; } // Hybrid (purple)

                const isActive = h.status === 1 || h.status === "active";
                
                return (
                <tr key={h.hackathon_id} className="table-row-hover">
                  <td>{(page - 1) * limit + index + 1}</td>
                  <td style={{ fontWeight: 600 }}>
                    <Link to={`/hackathons/${h.hackathon_id}`} style={{ color: "#3b82f6", textDecoration: "none", display: "inline-block" }}>
                      {h.title || "N/A"}
                    </Link>
                  </td>
                  <td>{h.organizer || "N/A"}</td>
                  <td>
                    <span className="badge" style={{ color: modeColor, background: modeBg, border: `1px solid ${modeColor}40` }}>
                      {h.mode ? h.mode.charAt(0).toUpperCase() + h.mode.slice(1) : "Online"}
                    </span>
                  </td>
                  <td>{h.prize_pool ? h.prize_pool : "N/A"}</td>
                  <td>{h.start_date ? h.start_date.split("T")[0] : "N/A"}</td>
                  <td>
                    {isActive ? (
                      <span className="badge badge-success" style={{ color: "#10b981", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)" }}>Active</span>
                    ) : (
                      <span className="badge badge-warning" style={{ color: "#94a3b8", background: "rgba(100, 116, 139, 0.15)", border: "1px solid rgba(100, 116, 139, 0.3)" }}>Draft</span>
                    )}
                  </td>
                </tr>
              )})
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <Pagination page={page} totalPages={totalPages} setPage={setPage} />

    </div>
  );
}

export default Hackathons;