import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import Users from "./users/Users";
import UserDetail from "./users/UserDetail";
import Companies from "./companies/Companies";
import CompanyDetail from "./companies/CompanyDetail";
import Internships from "./internships/Internships";
import InternshipDetail from "./internships/InternshipDetail";
import Jobs from "./jobs/Jobs";
import JobDetail from "./jobs/JobDetail";

import Courses from "./courses/Courses";
import CourseDetail from "./courses/CourseDetail";
import Hackathons from "./hackathons/Hackathons";
import HackathonDetail from "./hackathons/HackathonDetail";
import Nav from "./nav/Nav";
import Login from "./login/Login";
import "./App.css";
import "./sidebar.css";
const isLoggedIn = () => localStorage.getItem("token");

const ProtectedRoute = ({ children }) => {
  return isLoggedIn() ? children : <Navigate to="/login" />;
};

export default function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  if (isLoginPage) {
    return <Login />;
  }

  return (
    <div className="layout">

      <Nav />

      <div className="main-content">
        <Routes>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
          <Route path="/users/:id" element={<ProtectedRoute><UserDetail /></ProtectedRoute>} />
          <Route path="/companies" element={<ProtectedRoute><Companies /></ProtectedRoute>} />
          <Route path="/companies/:id" element={<ProtectedRoute><CompanyDetail /></ProtectedRoute>} />
          <Route path="/internships" element={<ProtectedRoute><Internships /></ProtectedRoute>} />
          <Route path="/internships/:id" element={<ProtectedRoute><InternshipDetail /></ProtectedRoute>} />
          <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
          <Route path="/jobs/:id" element={<ProtectedRoute><JobDetail /></ProtectedRoute>} />
    
          
          <Route path="/courses" element={<ProtectedRoute><Courses /></ProtectedRoute>} />
          <Route path="/courses/:id" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
          <Route path="/hackathons" element={<ProtectedRoute><Hackathons /></ProtectedRoute>} />
          <Route path="/hackathons/:id" element={<ProtectedRoute><HackathonDetail /></ProtectedRoute>} />
        </Routes>
      </div>

    </div>
  );
}