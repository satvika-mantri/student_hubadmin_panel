import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Briefcase, MapPin, Building2, Clock, CheckCircle, XCircle, Trash2, Shield, Calendar, Link as LinkIcon, Users, FileText, Code, Bookmark, Eye, DollarSign } from "lucide-react";
import { DetailHeader, AdminActionCard, InfoGridCard, InfoItem, AnalyticsCard, AnalyticsItem, DescriptionCard } from "../components/DetailComponents";

const API_BASE = "https://studenthub-backend-woad.vercel.app";

// 🔥 Salary Formatter
const formatSalary = (amount) => {
  if (!amount) return "Not Disclosed";
  if (amount >= 100000) return "₹" + (amount / 100000).toFixed(1).replace(".0", "") + "L";
  if (amount >= 1000) return "₹" + (amount / 1000).toFixed(0) + "K";
  return "₹" + amount;
};

function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        // Using bulk API to find job by ID as fallback, since direct endpoint might not exist
        const res = await fetch(`${API_BASE}/api/bulk?type=jobs&page=1&limit=1000`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        
        if (json.success && Array.isArray(json.data)) {
          const found = json.data.find(j => String(j.job_id) === String(id));
          setJob(found || null);
        }
      } catch (err) {
        console.error("Fetch job error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  if (loading) return <div className="page" style={{ padding: "40px", color: "var(--text-muted)", textAlign: "center" }}>Loading job details...</div>;
  if (!job) return <div className="page" style={{ padding: "40px", color: "#ef4444", textAlign: "center" }}>Job not found.</div>;

  const renderValue = (val, emptyText = "Not available") => {
    if (!val || val === "N/A" || val === "null") {
      return <span style={{ opacity: 0.5, fontStyle: "italic", fontSize: "14px" }}>{emptyText}</span>;
    }
    return val;
  };

  const isActive = job.status === 1 || job.status === "active" || job.status === "open";
  
  const salaryDisplay = job.salary_min && job.salary_max 
    ? `${formatSalary(job.salary_min)} – ${formatSalary(job.salary_max)}` 
    : job.salary_min 
      ? `${formatSalary(job.salary_min)}+` 
      : "Not Disclosed";

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
        title={job.title || "Job Detail"}
        isActive={isActive}
        activeText="ACTIVE"
        inactiveText="CLOSED"
        badges={[
          { text: job.company_name || "Unknown Company", icon: Building2, bg: "transparent", color: "rgba(255, 255, 255, 0.5)" }
        ]}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <AdminActionCard>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button className="btn" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b", border: "1px solid rgba(245, 158, 11, 0.2)", width: "100%", justifyContent: "center" }} onClick={() => showToast("Status update simulated.", "success")}>
                <Shield size={16} /> Close Job
              </button>
              <button className="btn" style={{ background: "rgba(239, 68, 68, 0.2)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.4)", width: "100%", justifyContent: "center" }} onClick={() => showToast("Deletion simulated.", "error")}>
                <Trash2 size={16} /> Delete Job
              </button>
            </div>
          </AdminActionCard>

          <AnalyticsCard>
              <AnalyticsItem label="Total Applications" value={job.total_applications || 0} icon={Users} valueColor="#3b82f6" />
              <AnalyticsItem label="Total Views" value="—" icon={Eye} />
              <AnalyticsItem label="Saved By" value="—" icon={Bookmark} borderBottom={false} />
          </AnalyticsCard>

          <div className="card" style={{ marginBottom: 0, padding: "24px" }}>
            <h2 style={{ fontSize: "16px", marginBottom: "20px", fontWeight: "600", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
              Apply
            </h2>
            {job.apply_url ? (
              <a href={job.apply_url} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", textDecoration: "none" }}>
                <LinkIcon size={16} /> View External Application
              </a>
            ) : (
              <div style={{ padding: "16px", background: "rgba(255, 255, 255, 0.05)", borderRadius: "8px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>
                No external URL provided
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <InfoGridCard columns={2}>
              <InfoItem label="Company" value={renderValue(job.company_name)} icon={Building2} />
              <InfoItem label="Location" value={renderValue(job.location)} icon={MapPin} />
              <InfoItem label="Job Type" value={job.job_type ? <span className="badge">{job.job_type}</span> : renderValue(null)} icon={Briefcase} />
              <InfoItem label="Experience Level" value={renderValue(job.experience_level)} icon={Briefcase} />
              <InfoItem label="Salary Range" value={salaryDisplay} icon={DollarSign} />
              <InfoItem label="Application Deadline" value={job.application_deadline ? new Date(job.application_deadline).toLocaleDateString() : renderValue(null)} icon={Calendar} />
              <InfoItem label="Created At" value={job.created_at ? new Date(job.created_at).toLocaleDateString() : renderValue(null)} icon={Clock} />
          </InfoGridCard>

          <DescriptionCard 
            title="Description"
            icon={FileText}
            description={renderValue(job.description, "No description provided.")}
          />

          <div className="card" style={{ marginBottom: 0, padding: "24px" }}>
            <h2 style={{ fontSize: "16px", marginBottom: "20px", fontWeight: "600", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
              <Code size={18} color="#3b82f6" /> Required Skills
            </h2>
            {job.skills && job.skills.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {job.skills.map((skill, idx) => (
                  <span key={idx} style={{ background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa", border: "1px solid rgba(59, 130, 246, 0.3)", padding: "4px 12px", borderRadius: "99px", fontSize: "12px", fontWeight: "500" }}>
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: "14px", color: "var(--text-muted)", fontStyle: "italic" }}>
                No specific skills listed.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobDetail;
