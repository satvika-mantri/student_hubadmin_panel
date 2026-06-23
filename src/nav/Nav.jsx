import { NavLink } from "react-router-dom";
import { Users, Briefcase, GraduationCap, Building2, LayoutDashboard, LogOut, BookOpen, Code } from "lucide-react";

function Nav() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="sidebar">

      {/* BRAND */}
      <div className="sidebar-header">
        <div className="logo-wrapper">
          <LayoutDashboard size={20} />
        </div>
        <div>
          <h2>StudentHub</h2>
          <span>Admin Panel</span>
        </div>
      </div>

      {/* NAV LINKS */}
      <div className="nav-section">
        <NavLink to="/" end className="nav-item">
          <LayoutDashboard className="nav-icon" /> Dashboard
        </NavLink>

        <NavLink to="/users" className="nav-item">
          <Users className="nav-icon" /> Users
        </NavLink>

        <NavLink to="/companies" className="nav-item">
          <Building2 className="nav-icon" /> Companies
        </NavLink>

        <NavLink to="/internships" className="nav-item">
          <GraduationCap className="nav-icon" /> Internships
        </NavLink>

        <NavLink to="/jobs" className="nav-item">
          <Briefcase className="nav-icon" /> Jobs
        </NavLink>

        <NavLink to="/courses" className="nav-item">
          <BookOpen className="nav-icon" /> Courses
        </NavLink>

        <NavLink to="/hackathons" className="nav-item">
          <Code className="nav-icon" /> Hackathons
        </NavLink>
      </div>

      {/* LOGOUT */}
      <button className="btn-logout" onClick={handleLogout}>
        <LogOut size={18} /> Logout
      </button>

    </div>
  );
}

export default Nav;