import { useState, useEffect } from "react";
import "../assets/form.css";

const API_BASE = "https://studenthub-backend-woad.vercel.app";

function Users() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const limit = 10;

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
console.log("TOKEN BEING SENT:", token);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_BASE}/api/bulk?type=users&page=${page}&limit=${limit}&search=${search}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();

      console.log("Users response:", json); // debug

      if (json.success) {
        setUsers(json.data);
        setTotal(json.total);
        setTotalPages(json.totalPages);
      }
    } catch (err) {
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

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
      <h1>{total} Users</h1>

      <form onSubmit={handleSearch}>
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search users..."
        />
        <button type="submit">Search</button>
        {search && <button onClick={handleClear}>Clear</button>}
      </form>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5}>Loading...</td>
            </tr>
          ) : users.length === 0 ? (
            <tr>
              <td colSpan={5}>No users found</td>
            </tr>
          ) : (
            users.map((u, i) => (
              <tr key={u.user_id}>
                <td>{(page - 1) * limit + i + 1}</td>
                <td>{u.full_name}</td>
                <td>{u.email}</td>
                <td>{u.phone}</td>
                <td>{u.role_name}</td>
              </tr>
            ))
          )}
        </tbody>
  
    </table>
    </div>
  );
}

export default Users;