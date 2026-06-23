import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Star, Building2, Clock, CheckCircle, XCircle, Trash2, Edit3, Shield, Calendar, Link as LinkIcon, Users, FileText, Code, Eye, Tag, Award, Heart } from "lucide-react";
import { DetailHeader, AdminActionCard, InfoGridCard, InfoItem, AnalyticsCard, AnalyticsItem, DescriptionCard } from "../components/DetailComponents";

const API_BASE = "https://studenthub-backend-woad.vercel.app";

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        // Using bulk API to find course by ID as fallback
        const res = await fetch(`${API_BASE}/api/bulk?type=courses&page=1&limit=1000`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        
        if (json.success && Array.isArray(json.data)) {
          const found = json.data.find(c => String(c.course_id) === String(id));
          setCourse(found || null);
        }
      } catch (err) {
        console.error("Fetch course error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  if (loading) return <div className="page" style={{ padding: "40px", color: "var(--text-muted)", textAlign: "center" }}>Loading course details...</div>;
  if (!course) return <div className="page" style={{ padding: "40px", color: "#ef4444", textAlign: "center" }}>Course not found.</div>;

  const renderValue = (val, emptyText = "Not available") => {
    if (!val || val === "N/A" || val === "null") {
      return <span style={{ opacity: 0.5, fontStyle: "italic", fontSize: "14px" }}>{emptyText}</span>;
    }
    return val;
  };

  const isActive = course.status === 1 || course.status === "active" || course.status === "published";
  const isSchool = course.target_group === "school";

  // Parse skills or interests if they are strings (some backends return stringified arrays)
  const parseJSON = (str) => {
    if (!str) return [];
    if (Array.isArray(str)) return str;
    try {
      return JSON.parse(str);
    } catch {
      return typeof str === 'string' ? str.split(',').map(s => s.trim()) : [];
    }
  };

  const skills = parseJSON(course.courseSkills || course.skills);
  const interests = parseJSON(course.courseInterests || course.interests);

  return (
    <div className="page" style={{ position: "relative", paddingBottom: "40px" }}>
      {toast.show && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", padding: "12px 24px", borderRadius: "8px", background: toast.type === "success" ? "#10b981" : "#ef4444", color: "#fff", zIndex: 1000, boxShadow: "0 4px 6px rgba(0,0,0,0.1)", fontWeight: "bold" }}>
          {toast.message}
        </div>
      )}

      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "var(--bg-color)", paddingBottom: "16px", paddingTop: "16px", borderBottom: "1px solid var(--border-color)", marginBottom: "32px", display: "flex", alignItems: "center" }}>
        <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ border: "none", background: "transparent", color: "var(--text-muted)", padding: "8px" }}>
          <ArrowLeft size={20} />
        </button>
      </div>

      <DetailHeader 
        title={course.title || "Course Detail"}
        isActive={isActive}
        activeText="ACTIVE"
        inactiveText="DRAFT"
        badges={[
          ...(course.target_group ? [{ 
            text: course.target_group.charAt(0).toUpperCase() + course.target_group.slice(1), 
            bg: isSchool ? "rgba(245, 158, 11, 0.15)" : "rgba(6, 182, 212, 0.15)", 
            color: isSchool ? "#f59e0b" : "#06b6d4" 
          }] : []),
          ...(course.category ? [{ text: course.category, bg: "rgba(255, 255, 255, 0.1)", color: "#fff" }] : []),
          { text: course.provider || "Unknown Provider", icon: Building2, bg: "transparent", color: "rgba(255, 255, 255, 0.5)" }
        ]}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          <AdminActionCard>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button className="btn" style={{ background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa", border: "1px solid rgba(59, 130, 246, 0.3)", width: "100%", justifyContent: "center" }} onClick={() => showToast("Edit functionality simulated.", "success")}>
                <Edit3 size={16} /> Edit Course
              </button>
              <button className="btn" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b", border: "1px solid rgba(245, 158, 11, 0.2)", width: "100%", justifyContent: "center" }} onClick={() => showToast("Status update simulated.", "success")}>
                <Shield size={16} /> {isActive ? "Unpublish Course" : "Publish Course"}
              </button>
              <button className="btn" style={{ background: "rgba(239, 68, 68, 0.2)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.4)", width: "100%", justifyContent: "center" }} onClick={() => showToast("Deletion simulated.", "error")}>
                <Trash2 size={16} /> Delete Course
              </button>
            </div>
          </AdminActionCard>

          <AnalyticsCard>
              <AnalyticsItem label="Total Enrollments" value={course.total_enrollments || 0} icon={Users} valueColor="#3b82f6" />
              <AnalyticsItem label="Saved By" value="—" icon={Heart} />
              <AnalyticsItem label="Completion Rate" value="—" icon={CheckCircle} borderBottom={false} />
          </AnalyticsCard>

          <div className="card" style={{ marginBottom: 0, padding: "24px" }}>
            <h2 style={{ fontSize: "16px", marginBottom: "20px", fontWeight: "600", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
              Course URL
            </h2>
            {course.course_url ? (
              <a href={course.course_url} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", textDecoration: "none" }}>
                <LinkIcon size={16} /> Go to Course
              </a>
            ) : (
              <div style={{ padding: "16px", background: "rgba(255, 255, 255, 0.05)", borderRadius: "8px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>
                No external course URL provided
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <InfoGridCard columns={2}>
              <InfoItem label="Provider" value={renderValue(course.provider)} icon={Building2} />
              <InfoItem label="Instructor" value={renderValue(course.instructor)} icon={Users} />
              <InfoItem label="Category" value={renderValue(course.category)} icon={Tag} />
              <InfoItem label="Level" value={renderValue(course.level)} icon={Award} />
              <InfoItem label="Duration" value={renderValue(course.duration)} icon={Clock} />
              <InfoItem label="Price" value={course.price || "Free"} />
              <InfoItem label="Rating" value={renderValue(course.rating)} icon={Star} />
              <InfoItem label="Created At" value={course.created_at ? new Date(course.created_at).toLocaleDateString() : renderValue(null)} icon={Calendar} />
          </InfoGridCard>

          <DescriptionCard 
            title="Description"
            icon={FileText}
            description={renderValue(course.description, "No description provided.")}
          />

          {skills.length > 0 && (
            <div className="card" style={{ marginBottom: 0, padding: "24px" }}>
              <h2 style={{ fontSize: "16px", marginBottom: "20px", fontWeight: "600", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                <Code size={18} color="#3b82f6" /> Taught Skills
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {skills.map((skill, idx) => (
                  <span key={idx} style={{ background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa", border: "1px solid rgba(59, 130, 246, 0.3)", padding: "4px 12px", borderRadius: "99px", fontSize: "12px", fontWeight: "500" }}>
                    {skill.name || skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {interests.length > 0 && (
            <div className="card" style={{ marginBottom: 0, padding: "24px" }}>
              <h2 style={{ fontSize: "16px", marginBottom: "20px", fontWeight: "600", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                <Tag size={18} color="#10b981" /> Related Interests
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {interests.map((interest, idx) => (
                  <span key={idx} style={{ background: "rgba(16, 185, 129, 0.15)", color: "#34d399", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "4px 12px", borderRadius: "99px", fontSize: "12px", fontWeight: "500" }}>
                    {interest.name || interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;
