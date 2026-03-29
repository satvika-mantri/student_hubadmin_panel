import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Users from "./users/Users";
import Companies from "./companies/Companies";
import Internships from "./internships/Internships";
import Jobs from "./jobs/Jobs";
import Nav from "./nav/Nav";
import Login from "./login/Login";

// ✅ check login
const isLoggedIn = () => {
  return localStorage.getItem("token");
};

// ✅ protect routes
const ProtectedRoute = ({ children }) => {
  return isLoggedIn() ? children : <Navigate to="/login" />;
};

export default function App() {
  const location = useLocation();

  return (
    <>
      {/* ✅ Hide navbar on login page */}
      {location.pathname !== "/login" && <Nav />}

      <Routes>
        {/* 🔐 Login Route */}
        <Route path="/login" element={<Login />} />

        {/* 🔒 Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />

        <Route
          path="/companies"
          element={
            <ProtectedRoute>
              <Companies />
            </ProtectedRoute>
          }
        />

        <Route
          path="/internships"
          element={
            <ProtectedRoute>
              <Internships />
            </ProtectedRoute>
          }
        />

        <Route
          path="/jobs"
          element={
            <ProtectedRoute>
              <Jobs />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
