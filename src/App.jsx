import { Routes, Route } from "react-router-dom";
import Users       from "./users/Users";
import Companies   from "./companies/Companies";
import Internships from "./internships/Internships";
import Jobs        from "./jobs/Jobs";
import Nav from "./nav/Nav"

export default function App() {
  return (
    <>
    <Nav/>
    <Routes>
      <Route path="/"       element={<Users />} />
      <Route path="/companies"   element={<Companies />} />
      <Route path="/internships" element={<Internships />} />
      <Route path="/jobs"        element={<Jobs />} />
    </Routes>
    </>
  );
}
