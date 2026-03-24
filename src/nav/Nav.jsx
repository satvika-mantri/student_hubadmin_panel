import { NavLink } from "react-router-dom";

function Nav() {
  return (
    <div className="sidediv">

      <div className="sidebar-brand">
        <span>🎓</span>
        <span>StudentHub</span>
        <small>Admin Panel</small>
      </div>

      <NavLink to="/"            end className="navlinkside">👥 Users</NavLink>
      <NavLink to="/companies"       className="navlinkside">🏢 Companies</NavLink>
      <NavLink to="/internships"     className="navlinkside">📋 Internships</NavLink>
      <NavLink to="/jobs"            className="navlinkside">💼 Jobs</NavLink>

    </div>
  );
}

export default Nav;
