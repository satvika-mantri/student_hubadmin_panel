import { useState, useEffect } from "react";
import "../assets/form.css";

function Users() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const limit = 10;

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    phone: "",
    age: ""
  });

  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // ================= FETCH USERS =================
  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://studenthub-backend-woad.vercel.app/api/bulk?type=users&page=${page}&limit=${limit}&search=${search}`
      );
      const json = await res.json();

      if (json.success) {
        setUsers(json.data);
        setTotal(json.total);
        setTotalPages(json.totalPages);
      }
    } catch (err) {
      console.error(err);
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

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    setFormLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(
        "https://studenthub-backend-woad.vercel.app/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: form.full_name,
            email: form.email,
            password: form.password,
            phone: form.phone,
            age: parseInt(form.age),
            role_id: 1   // ADMIN
          })
        }
      );

      const json = await res.json();

      if (json.success) {
        setSuccess("Admin created successfully");
        setShowForm(false);
        fetchUsers();

        setForm({
          full_name: "",
          email: "",
          password: "",
          confirm_password: "",
          phone: "",
          age: ""
        });
      } else {
        setError(json.message);
      }

    } catch (err) {
      console.error(err);
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

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <h1>{total} Users</h1>
          <p>Total {total} registered users</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            setError(null);
            setSuccess(null);
          }}
        >
          {showForm ? "Cancel" : "+ Add Admin"}
        </button>
      </div>

      {/* ================= FORM ================= */}
      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit}>

            <h2 className="form-title">Create Admin</h2>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>{success}</p>}

            <div className="form-group">
              <label>Full Name</label>
              <input name="full_name" value={form.full_name} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input name="email" value={form.email} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" name="confirm_password" value={form.confirm_password} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Age</label>
              <input type="number" name="age" value={form.age} onChange={handleChange} required />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  setForm({
                    full_name: "",
                    email: "",
                    password: "",
                    confirm_password: "",
                    phone: "",
                    age: ""
                  })
                }
              >
                Reset
              </button>

              <button className="btn btn-primary" disabled={formLoading}>
                {formLoading ? "Creating..." : "Create Admin"}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* ================= SEARCH ================= */}
      <form onSubmit={handleSearch}>
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search..."
        />
        <button type="submit">Search</button>
        {search && <button onClick={handleClear}>Clear</button>}
      </form>

      {/* ================= TABLE ================= */}
      <table>
        <thead>
          <tr>
            {["#", "Name", "Email", "Phone", "Role", "Status", "Joined"].map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr><td colSpan={7}>Loading...</td></tr>
          ) : users.map((user, index) => (
            <tr key={user.user_id}>
              <td>{(page - 1) * limit + index + 1}</td>
              <td>{user.full_name}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>{user.role_name}</td>
              <td>{user.status}</td>
              <td>{new Date(user.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}

export default Users;