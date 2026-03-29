import { useState, useEffect } from "react";
import "../assets/form.css";

const API_BASE = "https://studenthub-backend-woad.vercel.app";

function Companies() {
  const [companies, setCompanies] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
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

  return (
    <div style={{ padding: "20px" }}>

      <h1>{total} Companies</h1>

      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? "Cancel" : "+ Add Company"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit}>
          <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
          <input name="industry" placeholder="Industry" value={form.industry} onChange={handleChange} />
          <input name="location" placeholder="Location" value={form.location} onChange={handleChange} />
          <input name="website" placeholder="Website" value={form.website} onChange={handleChange} />
          <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />

          <button disabled={formLoading}>
            {formLoading ? "Creating..." : "Create Company"}
          </button>
        </form>
      )}

      <form onSubmit={handleSearch}>
        <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
        <button type="submit">Search</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>#</th><th>Name</th><th>Industry</th><th>Location</th><th>Website</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={5}>Loading...</td></tr>
          ) : companies.map((c, i) => (
            <tr key={c.company_id}>
              <td>{(page - 1) * limit + i + 1}</td>
              <td>{c.name}</td>
              <td>{c.industry}</td>
              <td>{c.location}</td>
              <td>{c.website}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}

export default Companies;