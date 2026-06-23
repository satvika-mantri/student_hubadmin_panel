import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone, MapPin, Target, FileText, Briefcase, GraduationCap, Link, Code, Award, CheckCircle } from "lucide-react";
import { calculateProfileScore } from "../utils/profileScore";
import { DetailHeader, AdminActionCard, InfoGridCard, InfoItem, AnalyticsCard, AnalyticsItem } from "../components/DetailComponents";

const API_BASE = "https://studenthub-backend-woad.vercel.app";

function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/profile/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();
        console.log("User Detail API:", json);

        console.log("DATA:", json.data);
console.log("ROLE ID:", json.data?.role_id);
console.log("USER:", json.data?.user);
console.log("USER ROLE:", json.data?.user?.role_id);

        if (json.success) {
          setData(json.data || {}); 
        } else {
          setError(json.message || "Failed to load user details");
        }
      } catch (err) {
        console.error(err);
        setError("Error connecting to server.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, refetchTrigger]);

  // Role update and status toggle logic
  // Automatically refetches data by incrementing refetchTrigger upon success
  const handleUpdateUser = async (updates) => {
    try {
      setActionLoading(true);
      console.log("Update Payload:", updates); // temp debugging
      
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      const json = await res.json();
      console.log("Update API Response:", json); // temp debugging
      
      if (res.ok && json.success) {
        showToast("User updated successfully");
        setRefetchTrigger(prev => prev + 1); // trigger automatic refetch
      } else {
        showToast(json.message || "Failed to update", "error");
      }
    } catch(err) {
      console.error(err);
      showToast("Network error updating user", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Soft delete flow
  const handleSoftDelete = () => {
    if (window.confirm("Are you sure you want to soft delete this user?")) {
      handleUpdateUser({ is_deleted: true });
    }
  };

  const renderValue = (val) => {
    if (!val || val === "N/A" || val === "null") {
      return <span style={{ opacity: 0.5, fontStyle: "italic" }}>N/A</span>;
    }
    return val;
  };

  if (loading) {
    return (
      <div className="page" style={{ padding: "32px", textAlign: "center" }}>
        <h2>Loading user {id}...</h2>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page" style={{ padding: "32px" }}>
        <button className="btn btn-secondary" onClick={() => navigate("/")} style={{ marginBottom: "24px" }}>
          <ArrowLeft size={16} /> Back to Users
        </button>
        <div className="message error">{error || "User data not found"}</div>
      </div>
    );
  }

  // Defensive extraction
  const user = data.user || data || {};
  const applications = data.applications || [];
  const courses = data.courses || [];
  const hackathons = data.hackathons || [];
  const skills = data.skills || [];
  const projects = data.projects || [];
  const certificates = data.certificates || [];
  const savedCourses = data.savedCourses || data.saved_courses || [];
  const interests = data.interests || [];
  const achievements = data.achievements || [];
  const uploads = data.uploads || [];
  const notifications = data.notifications || [];
  const devices = data.devices || [];

  const roleId = Number(user?.role_id ?? 0);

  const roleMap = {
    0: "Guest",
    1: "Admin",
    2: "School Student",
    3: "Undergraduate Student",
    4: "Postgraduate Student",
  };

  const roleDisplay =
    roleMap[roleId] ||
    (user?.role_name === "undergraduate_student" ? "Undergraduate Student" : 
     user?.role_name === "postgraduate_student" ? "Postgraduate Student" :
     user?.role_name === "school_student" ? "School Student" :
     user?.role_name) ||
    "Guest";

  const isSchoolStudent = roleId === 2 || user?.role_name === "school_student";
  const isAdmin = roleId === 1 || user?.role_name === "admin";

  const hasOptionalData = 
    applications.length > 0 ||
    courses.length > 0 ||
    hackathons.length > 0 ||
    skills.length > 0 ||
    projects.length > 0 ||
    certificates.length > 0 ||
    savedCourses.length > 0 ||
    interests.length > 0 ||
    achievements.length > 0 ||
    notifications.length > 0 ||
    devices.length > 0;

  const { percentage, missing, color } = data ? calculateProfileScore(user, data) : { percentage: 0, missing: [], color: "#ef4444" };

  return (
    <div className="page" style={{ paddingBottom: "60px", position: "relative" }}>
      
      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", padding: "12px 24px", borderRadius: "8px", background: toast.type === "success" ? "#10b981" : "#ef4444", color: "#fff", zIndex: 1000, boxShadow: "0 4px 6px rgba(0,0,0,0.1)", fontWeight: "bold" }}>
          {toast.message}
        </div>
      )}

      <DetailHeader 
        title={`User Profile - ${user.full_name || "User #" + (user.user_id || id)}`}
        isActive={user.status === 1 || user.status === "active" || user.status === "Active"}
        activeText="Active"
        inactiveText="Inactive"
        badges={[
          { text: `Role: ${roleDisplay}`, bg: "rgba(255,255,255,0.1)", color: "#fff" },
          ...(user.auth_provider ? [{ text: user.auth_provider, bg: "rgba(6, 182, 212, 0.15)", color: "#06b6d4" }] : [])
        ]}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>

        {/* SECTION A & B & C & ADMIN: TOP ROW */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
          
          {/* SECTION A - BASIC PROFILE */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
              {user.profile_image_url && user.profile_image_url !== "N/A" ? (
                <img 
                  src={user.profile_image_url} 
                  alt="avatar" 
                  style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border-color)" }} 
                />
              ) : (
                <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <User size={32} color="#fff" />
                </div>
              )}
              <div>
                <h2 style={{ margin: "0 0 8px 0", fontSize: "22px" }}>{renderValue(user.full_name)}</h2>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                  <span className="badge" style={{ color: "var(--text-muted)", border: "none" }}>{renderValue(user.email)}</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", color: "var(--text-muted)", fontSize: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><Mail size={16} /> {renderValue(user.email)}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><Phone size={16} /> {renderValue(user.phone)}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><MapPin size={16} /> {renderValue(user.address)}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><User size={16} /> Age: {renderValue(user.age)}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><Target size={16} /> Goal: {renderValue(user.goal)}</div>
            </div>

            {user.about_me && user.about_me !== "N/A" && (
              <div style={{ marginTop: "16px", padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "8px", fontSize: "14px" }}>
                <strong>About Me:</strong> <br />
                {user.about_me}
              </div>
            )}
            
            <div style={{ marginTop: "16px", fontSize: "12px", color: "var(--text-muted)" }}>
              Firebase UID: {renderValue(user.firebase_uid)}
            </div>
          </div>

          {/* SECTION: ADMIN ACTIONS */}
          <AdminActionCard>
            <div style={{ display: "flex", gap: "12px" }}>
              {user.status === 1 || user.status === "active" || user.status === "Active" ? (
                <button disabled={actionLoading} className="btn badge-warning" style={{ flex: 1, padding: "10px", textAlign: "center", borderRadius: "6px", cursor: actionLoading ? "not-allowed" : "pointer", border: "none", color: "#111", fontWeight: "bold", opacity: actionLoading ? 0.7 : 1 }} onClick={() => handleUpdateUser({ status: 0 })}>{actionLoading ? "Updating..." : "Deactivate"}</button>
              ) : (
                <button disabled={actionLoading} className="btn" style={{ flex: 1, padding: "10px", textAlign: "center", borderRadius: "6px", cursor: actionLoading ? "not-allowed" : "pointer", border: "none", background: "#22c55e", color: "#0f172a", fontWeight: "600", opacity: actionLoading ? 0.7 : 1 }} onClick={() => handleUpdateUser({ status: 1 })}>{actionLoading ? "Updating..." : "Activate"}</button>
              )}
              <button disabled={actionLoading} className="btn badge-danger" style={{ flex: 1, padding: "10px", textAlign: "center", borderRadius: "6px", cursor: actionLoading ? "not-allowed" : "pointer", border: "none", color: "#111", fontWeight: "bold", opacity: actionLoading ? 0.7 : 1 }} onClick={handleSoftDelete}>{actionLoading ? "Updating..." : "Delete"}</button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "bold" }}>Promote Role</label>
              <select 
                className="form-control" 
                value={roleId || ""} 
                onChange={(e) => handleUpdateUser({ role_id: parseInt(e.target.value) })}
                disabled={actionLoading}
                style={{ padding: "10px", borderRadius: "6px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-color)", color: "#fff", fontWeight: "bold", cursor: actionLoading ? "not-allowed" : "pointer", opacity: actionLoading ? 0.7 : 1 }}
              >
                <option value="" disabled style={{ color: "#000" }}>Select Role...</option>
                <option value="1" style={{ color: "#000" }}>Admin (1)</option>
                <option value="2" style={{ color: "#000" }}>School (2)</option>
                <option value="3" style={{ color: "#000" }}>UG Student (3)</option>
                <option value="4" style={{ color: "#000" }}>PG Student (4)</option>
              </select>
            </div>
          </AdminActionCard>
          
          {/* SECTION: PROFILE STRENGTH */}
          <div className="card" style={{ marginBottom: 0 }}>
            <h3 style={{ fontSize: "16px", marginBottom: "16px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>Profile Strength</h3>
            
            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontWeight: "bold", fontSize: "18px", color: color }}>{percentage}% Complete</span>
              </div>
              <div style={{ width: "100%", height: "12px", background: "rgba(255,255,255,0.1)", borderRadius: "6px", overflow: "hidden" }}>
                <div style={{ width: `${percentage}%`, height: "100%", background: color, transition: "width 0.5s ease" }}></div>
              </div>
            </div>

            {missing.length > 0 ? (
              <div>
                <h4 style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "12px", textTransform: "uppercase" }}>Completion Insights</h4>
                <p style={{ fontSize: "13px", color: "#f87171", marginBottom: "8px", fontWeight: "bold" }}>Missing Information:</p>
                <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                  {missing.map((item, idx) => (
                    <li key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-color)" }}>
                      <span style={{ color: "#ef4444" }}>•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#10b981", fontSize: "14px", fontWeight: "bold", marginTop: "16px" }}>
                <CheckCircle size={18} />
                Profile is 100% complete!
              </div>
            )}
          </div>

        </div>

        {/* SECTION B - EDUCATION & METADATA */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {!isAdmin && (
            <InfoGridCard title="Education">
                {!isSchoolStudent && (
                  <>
                    <InfoItem label="University" value={renderValue(user.university)} />
                    <InfoItem label="Degree" value={renderValue(user.degree)} />
                  </>
                )}
                <InfoItem label="School Name" value={renderValue(user.school_name)} />
                <InfoItem label="Class" value={renderValue(user.class)} />
                {!isSchoolStudent && (
                  <InfoItem label="Graduation Year" value={renderValue(user.graduation_year)} />
                )}
            </InfoGridCard>
            )}

            <InfoGridCard title="Account Metadata">
                <InfoItem label="User ID" value={renderValue(user.user_id)} />
                <InfoItem label="Created At" value={renderValue(user.created_at ? new Date(user.created_at).toLocaleString() : null)} />
                <InfoItem label="Updated At" value={renderValue(user.updated_at ? new Date(user.updated_at).toLocaleString() : null)} />
            </InfoGridCard>
          </div>

          {/* SECTION C - LINKS & FILES */}
          {!isSchoolStudent && !isAdmin && (
            <div className="card" style={{ marginBottom: 0 }}>
              <h3 style={{ fontSize: "16px", marginBottom: "16px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>Links & Files</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px", marginBottom: "20px" }}>
                <div>
                  <strong>Resume: </strong> 
                  {user.resume_url && user.resume_url !== "N/A" ? <a href={user.resume_url} target="_blank" rel="noreferrer" style={{ color: "#3b82f6" }}>View Resume</a> : renderValue("N/A")}
                </div>
                <div>
                  <strong>LinkedIn: </strong> 
                  {user.linkedin_url && user.linkedin_url !== "N/A" ? <a href={user.linkedin_url} target="_blank" rel="noreferrer" style={{ color: "#3b82f6" }}>View Profile</a> : renderValue("N/A")}
                </div>
                <div>
                  <strong>GitHub: </strong> 
                  {user.github_url && user.github_url !== "N/A" ? <a href={user.github_url} target="_blank" rel="noreferrer" style={{ color: "#3b82f6" }}>View GitHub</a> : renderValue("N/A")}
                </div>
              </div>

              {uploads.length > 0 && (
                <div>
                  <h4 style={{ fontSize: "14px", marginBottom: "12px" }}>Uploads ({uploads.length})</h4>
                  <div className="table-container" style={{ maxHeight: "200px" }}>
                    <table>
                      <thead>
                        <tr>
                          <th style={{ padding: "8px 12px" }}>File</th>
                          <th style={{ padding: "8px 12px" }}>URL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {uploads.map((up, i) => (
                          <tr key={i}>
                            <td style={{ padding: "8px 12px" }}>{renderValue(up.file_name || `File ${i+1}`)}</td>
                            <td style={{ padding: "8px 12px" }}>
                              {up.file_url || up.url ? <a href={up.file_url || up.url} target="_blank" rel="noreferrer" style={{ color: "#3b82f6", fontWeight: "bold" }}>Link</a> : renderValue("N/A")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECTION E - STATS CARDS */}
        {!isAdmin && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "12px", marginBottom: "8px", marginTop: "24px" }}>
          {[
            { label: "Apps", count: applications.length },
            { label: "Courses", count: courses.length },
            { label: "Hacks", count: hackathons.length },
            { label: "Skills", count: skills.length },
            { label: "Projects", count: projects.length },
            { label: "Certs", count: certificates.length },
            { label: "Saved", count: savedCourses.length },
            { label: "Trophies", count: achievements.length },
          ].map((stat, idx) => (
            <div key={idx} className="card" style={{ marginBottom: 0, padding: "12px 8px", textAlign: "center" }}>
              <div style={{ fontSize: "20px", fontWeight: "bold", color: "#fff" }}>{stat.count}</div>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", margin: "4px 0 0 0" }}>{stat.label}</div>
            </div>
          ))}
        </div>
        )}

        {!isAdmin && !hasOptionalData && (
          <div className="card" style={{ textAlign: "center", padding: "48px 24px", color: "var(--text-muted)" }}>
            <div style={{ fontSize: "16px", fontStyle: "italic" }}>
              This user has not added additional activity or portfolio information yet.
            </div>
          </div>
        )}

        {/* SECTION F - APPLICATIONS */}
        {!isSchoolStudent && !isAdmin && applications.length > 0 && (
          <div className="card" style={{ marginBottom: 0 }}>
            <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>Applications ({applications.length})</h3>
            <div className="table-container" style={{ overflowX: "auto" }}>
              <table style={{ minWidth: "800px" }}>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Title</th>
                    <th>Company</th>
                    <th>Status</th>
                    <th>Applied At</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app, i) => {
                    let type = "N/A";
                    let title = "N/A";
                    let companyName = "N/A";

                    if (app.job) {
                      type = "Job";
                      title = app.job.title;
                      companyName = app.job.company?.company_name || app.company_name || app.company;
                    } else if (app.internship) {
                      type = "Internship";
                      title = app.internship.title;
                      companyName = app.internship.company?.company_name || app.company_name || app.company;
                    } else {
                      if (app.job_title) { type = "Job"; title = app.job_title; }
                      else if (app.internship_title) { type = "Internship"; title = app.internship_title; }
                      companyName = app.company_name || app.company;
                    }

                    return (
                      <tr key={i}>
                        <td style={{ fontWeight: "bold" }}>{renderValue(type)}</td>
                        <td>{renderValue(title)}</td>
                        <td>{renderValue(companyName)}</td>
                        <td>
                          <span className="badge" style={{ background: "rgba(255,255,255,0.1)", color: "#fff" }}>{renderValue(app.status)}</span>
                        </td>
                        <td>{renderValue(app.applied_at || app.created_at ? new Date(app.applied_at || app.created_at).toLocaleDateString() : null)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION G - COURSES */}
        {!isAdmin && courses.length > 0 && (
        <div className="card" style={{ marginBottom: 0 }}>
          <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>Enrolled Courses ({courses.length})</h3>
          <div className="table-container" style={{ overflowX: "auto" }}>
            <table style={{ minWidth: "800px" }}>
              <thead>
                <tr>
                  <th>Course Title</th>
                  <th>Provider</th>
                  <th>Category</th>
                  <th>Level</th>
                  <th>Progress</th>
                  <th>Completed</th>
                  <th>Enrollment Date</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course, i) => (
                  <tr key={i}>
                    <td>{renderValue(course.course_title || course.title)}</td>
                    <td>{renderValue(course.provider)}</td>
                    <td>{renderValue(course.category)}</td>
                    <td>{renderValue(course.level)}</td>
                    <td>{course.progress != null ? `${course.progress}%` : renderValue("N/A")}</td>
                    <td>{course.is_completed ? <span className="badge badge-success" style={{ color: "#fff" }}>Yes</span> : <span className="badge badge-warning" style={{ color: "#fff" }}>No</span>}</td>
                    <td>{renderValue(course.enrollment_date || course.created_at ? new Date(course.enrollment_date || course.created_at).toLocaleDateString() : null)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* SECTION H - HACKATHONS */}
        {!isAdmin && hackathons.length > 0 && (
        <div className="card" style={{ marginBottom: 0 }}>
          <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>Hackathons ({hackathons.length})</h3>
          <div className="table-container" style={{ overflowX: "auto" }}>
            <table style={{ minWidth: "800px" }}>
              <thead>
                <tr>
                  <th>Hackathon</th>
                  <th>Organizer</th>
                  <th>Location</th>
                  <th>Team Name</th>
                  <th>Registration Date</th>
                </tr>
              </thead>
              <tbody>
                {hackathons.map((h, i) => (
                  <tr key={i}>
                    <td>{renderValue(h.hackathon_title || h.title)}</td>
                    <td>{renderValue(h.organizer)}</td>
                    <td>{renderValue(h.location || h.mode)}</td>
                    <td>{renderValue(h.team_name)}</td>
                    <td>{renderValue(h.registration_date || h.created_at ? new Date(h.registration_date || h.created_at).toLocaleDateString() : null)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* SECTION I & J: SKILLS AND PROJECTS */}
        {!isSchoolStudent && !isAdmin && (skills.length > 0 || projects.length > 0) && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px" }}>
            
            {/* SKILLS */}
            {skills.length > 0 && (
            <div className="card" style={{ marginBottom: 0 }}>
              <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>Skills ({skills.length})</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Skill Name</th>
                      <th>Proficiency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skills.map((s, i) => (
                      <tr key={i}>
                        <td>{renderValue(s.skill_name || s.name)}</td>
                        <td>{renderValue(s.proficiency || s.level)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            )}

            {/* PROJECTS */}
            {projects.length > 0 && (
            <div className="card" style={{ marginBottom: 0 }}>
              <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>Projects ({projects.length})</h3>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((p, i) => (
                      <tr key={i}>
                        <td>{renderValue(p.title || p.project_name)}</td>
                        <td><div style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={p.description}>{renderValue(p.description)}</div></td>
                        <td><span className="badge" style={{ color: "#fff" }}>{renderValue(p.status)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            )}
          </div>
        )}

        {/* SECTION K - CERTIFICATES */}
        {!isSchoolStudent && !isAdmin && certificates.length > 0 && (
          <div className="card" style={{ marginBottom: 0 }}>
            <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>Certificates ({certificates.length})</h3>
            <div className="table-container" style={{ overflowX: "auto" }}>
              <table style={{ minWidth: "800px" }}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Issuer</th>
                    <th>Issue Date</th>
                    <th>Status</th>
                    <th>File</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((c, i) => (
                    <tr key={i}>
                      <td>{renderValue(c.title || c.certificate_name)}</td>
                      <td>{renderValue(c.issuer)}</td>
                      <td>{renderValue(c.issue_date ? new Date(c.issue_date).toLocaleDateString() : null)}</td>
                      <td><span className="badge" style={{ color: "#fff" }}>{renderValue(c.status)}</span></td>
                      <td>
                        {c.file_url || c.url ? (
                          <a href={c.file_url || c.url} target="_blank" rel="noreferrer" style={{ color: "#3b82f6", fontWeight: "bold" }}>View File</a>
                        ) : renderValue("N/A")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION L & M: SAVED COURSES & INTERESTS */}
        {!isAdmin && (savedCourses.length > 0 || interests.length > 0) && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px" }}>
          
          {/* SAVED COURSES */}
          {savedCourses.length > 0 && (
          <div className="card" style={{ marginBottom: 0 }}>
            <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>Saved Courses ({savedCourses.length})</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Course Title</th>
                    <th>Provider</th>
                    <th>Saved At</th>
                  </tr>
                </thead>
                <tbody>
                  {savedCourses.map((sc, i) => (
                    <tr key={i}>
                      <td>{renderValue(sc.course_title || sc.title)}</td>
                      <td>{renderValue(sc.provider)}</td>
                      <td>{renderValue(sc.saved_at || sc.created_at ? new Date(sc.saved_at || sc.created_at).toLocaleDateString() : null)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          )}

          {/* INTERESTS */}
          {interests.length > 0 && (
          <div className="card" style={{ marginBottom: 0 }}>
            <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>Interests ({interests.length})</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {interests.map((int, i) => (
                <span key={i} className="badge" style={{ background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa", padding: "6px 12px", fontSize: "14px", fontWeight: "bold" }}>
                  {renderValue(int.interest_name || int.name || (typeof int === 'string' ? int : null))}
                </span>
              ))}
            </div>
          </div>
          )}
        </div>
        )}

        {/* SECTION N - ACHIEVEMENTS */}
        {!isAdmin && achievements.length > 0 && (
        <div className="card" style={{ marginBottom: 0 }}>
          <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>Achievements ({achievements.length})</h3>
          <div className="table-container" style={{ overflowX: "auto" }}>
            <table style={{ minWidth: "600px" }}>
              <thead>
                <tr>
                  <th>Icon</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Achieved At</th>
                </tr>
              </thead>
              <tbody>
                {achievements.map((a, i) => (
                  <tr key={i}>
                    <td>{a.icon && a.icon !== "N/A" ? <img src={a.icon} alt="icon" style={{ width: "24px", height: "24px" }} /> : "🏆"}</td>
                    <td>{renderValue(a.title)}</td>
                    <td>{renderValue(a.description)}</td>
                    <td>{renderValue(a.achieved_at || a.created_at ? new Date(a.achieved_at || a.created_at).toLocaleDateString() : null)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* SECTION O & P: NOTIFICATIONS & DEVICES */}
        {!isAdmin && (notifications.length > 0 || devices.length > 0) && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>
          
          {/* NOTIFICATIONS */}
          {notifications.length > 0 && (
          <div className="card" style={{ marginBottom: 0 }}>
            <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>Recent Notifications ({notifications.length})</h3>
            <div className="table-container" style={{ overflowX: "auto" }}>
              <table style={{ minWidth: "600px" }}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((n, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: "bold" }}>{renderValue(n.title)}</td>
                      <td><div style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={n.message}>{renderValue(n.message)}</div></td>
                      <td>
                        {n.is_read || n.read ? <span className="badge" style={{ color: "#fff" }}>Read</span> : <span className="badge badge-info" style={{ color: "#fff" }}>Unread</span>}
                      </td>
                      <td>{renderValue(n.created_at ? new Date(n.created_at).toLocaleDateString() : null)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          )}

          {/* DEVICES */}
          {devices.length > 0 && (
          <div className="card" style={{ marginBottom: 0 }}>
            <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>Registered Devices ({devices.length})</h3>
            <div className="table-container">
              <table style={{ minWidth: "400px" }}>
                <thead>
                  <tr>
                    <th>Token / ID</th>
                    <th>Registered At</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((d, i) => (
                    <tr key={i}>
                      <td><div style={{ maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={d.token || d.device_id}>{renderValue(d.token || d.device_id)}</div></td>
                      <td>{renderValue(d.created_at ? new Date(d.created_at).toLocaleString() : null)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          )}
        </div>
        )}

      </div>
  );
}

export default UserDetail;
