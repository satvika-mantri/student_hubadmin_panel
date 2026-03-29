import { NavLink } from "react-router-dom";

function Nav() {
  return (
    <div className="sidebar">

      {/* BRAND */}
      <div className="sidebar-header">
        <h2>StudentHub</h2>
        <span>Admin Panel</span>
      </div>

      {/* NAV LINKS */}
      <div className="nav-section">
        <NavLink to="/" end className="nav-item">
          Users
        </NavLink>

        <NavLink to="/companies" className="nav-item">
          Companies
        </NavLink>

        <NavLink to="/internships" className="nav-item">
          Internships
        </NavLink>

        <NavLink to="/jobs" className="nav-item">
          Jobs
        </NavLink>
      </div>

    </div>
  );
}

export default Nav;