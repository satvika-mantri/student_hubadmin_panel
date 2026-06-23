import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, MapPin, Building2, Calendar, CheckCircle, XCircle, Trash2, Edit3, Shield, Link as LinkIcon, Users, FileText, DollarSign, Clock } from "lucide-react";
import { DetailHeader, AdminActionCard, InfoGridCard, InfoItem, AnalyticsCard, AnalyticsItem, DescriptionCard } from "../components/DetailComponents";

const API_BASE = "https://studenthub-backend-woad.vercel.app";

function HackathonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  useEffect(() => {
    const fetchHackathon = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        // Fallback: Using bulk API to find hackathon by ID
        const res = await fetch(`${API_BASE}/api/bulk?type=hackathons&page=1&limit=1000`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        
        if (json.success && Array.isArray(json.data)) {
          const found = json.data.find(h => String(h.hackathon_id) === String(id));
          setHackathon(found || null);
        }
      } catch (err) {
        console.error("Fetch hackathon error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHackathon();
  }, [id]);

  if (loading) return <div className="page" style={{ padding: "40px", color: "var(--text-muted)", textAlign: "center" }}>Loading hackathon details...</div>;
  if (!hackathon) return <div className="page" style={{ padding: "40px", color: "#ef4444", textAlign: "center" }}>Hackathon not found.</div>;

  const renderValue = (val, emptyText = "Not available") => {
    if (!val || val === "N/A" || val === "null") {
      return <span style={{ opacity: 0.5, fontStyle: "italic", fontSize: "14px" }}>{emptyText}</span>;
    }
    return val;
  };

  const isActive = hackathon.status === 1 || hackathon.status === "active";
  
  const modeStr = hackathon.mode ? hackathon.mode.toLowerCase() : "online";
  let modeColor = "#3b82f6"; // Online (blue)
  let modeBg = "rgba(59, 130, 246, 0.15)";
  if (modeStr === "offline") { modeColor = "#f59e0b"; modeBg = "rgba(245, 158, 11, 0.15)"; } // Offline (orange)
  if (modeStr === "hybrid") { modeColor = "#8b5cf6"; modeBg = "rgba(139, 92, 246, 0.15)"; } // Hybrid (purple)

  const isRegistrationOpen = new Date(hackathon.registration_deadline || hackathon.start_date) > new Date();

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
        title={hackathon.title || "Hackathon Detail"}
        isActive={isActive}
        activeText="ACTIVE"
        inactiveText="DRAFT"
        badges={[
          { text: hackathon.mode ? hackathon.mode.charAt(0).toUpperCase() + hackathon.mode.slice(1) : "Online", bg: modeBg, color: modeColor },
          { text: hackathon.organizer || "Unknown Organizer", icon: Building2, bg: "transparent", color: "rgba(255, 255, 255, 0.5)" }
        ]}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          <AdminActionCard>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button className="btn" style={{ background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa", border: "1px solid rgba(59, 130, 246, 0.3)", width: "100%", justifyContent: "center" }} onClick={() => showToast("Edit functionality simulated.", "success")}>
                <Edit3 size={16} /> Edit Hackathon
              </button>
              <button className="btn" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#f59e0b", border: "1px solid rgba(245, 158, 11, 0.2)", width: "100%", justifyContent: "center" }} onClick={() => showToast("Status update simulated.", "success")}>
                <Shield size={16} /> {isActive ? "Close Hackathon" : "Open Hackathon"}
              </button>
              <button className="btn" style={{ background: "rgba(239, 68, 68, 0.2)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.4)", width: "100%", justifyContent: "center" }} onClick={() => showToast("Deletion simulated.", "error")}>
                <Trash2 size={16} /> Delete Hackathon
              </button>
            </div>
          </AdminActionCard>

          <AnalyticsCard>
              <AnalyticsItem label="Participants" value={hackathon.participants_count || 0} icon={Users} valueColor="#3b82f6" />
              <AnalyticsItem label="Days Remaining" value="—" icon={Clock} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)" }}><CheckCircle size={16} /> Registration</span>
                {isRegistrationOpen ? (
                    <span style={{ fontSize: "14px", fontWeight: "bold", color: "#10b981" }}>Open</span>
                ) : (
                    <span style={{ fontSize: "14px", fontWeight: "bold", color: "#ef4444" }}>Closed</span>
                )}
              </div>
          </AnalyticsCard>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <InfoGridCard columns={2}>
              <InfoItem label="Organizer" value={renderValue(hackathon.organizer)} icon={Building2} />
              <InfoItem label="Location" value={renderValue(hackathon.location)} icon={MapPin} />
              <InfoItem label="Prize Pool" value={renderValue(hackathon.prize_pool)} icon={DollarSign} />
              <InfoItem label="Start Date" value={hackathon.start_date ? new Date(hackathon.start_date).toLocaleDateString() : renderValue(null)} icon={Calendar} />
              <InfoItem label="End Date" value={hackathon.end_date ? new Date(hackathon.end_date).toLocaleDateString() : renderValue(null)} icon={Calendar} />
              <InfoItem label="Registration Deadline" value={hackathon.registration_deadline ? new Date(hackathon.registration_deadline).toLocaleDateString() : renderValue(null)} icon={Calendar} />
              <InfoItem label="Created At" value={hackathon.created_at ? new Date(hackathon.created_at).toLocaleDateString() : renderValue(null)} icon={Clock} />
          </InfoGridCard>

          <div className="card" style={{ marginBottom: 0, padding: "24px", minHeight: "100px" }}>
            <h2 style={{ fontSize: "16px", marginBottom: "20px", fontWeight: "600", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
              <FileText size={18} color="#3b82f6" /> Description
            </h2>
            <div style={{ fontSize: "14px", lineHeight: "1.6", color: "#ccc", whiteSpace: "pre-wrap", marginBottom: "24px" }}>
              {renderValue(hackathon.description, "No description provided.")}
            </div>

            <h2 style={{ fontSize: "16px", marginBottom: "16px", fontWeight: "600", color: "#fff", display: "flex", alignItems: "center", gap: "8px", borderTop: "1px solid var(--border-color)", paddingTop: "24px" }}>
              Event URL
            </h2>
            {hackathon.event_url || hackathon.hackathon_url ? (
              <a href={hackathon.event_url || hackathon.hackathon_url} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ display: "inline-flex", textDecoration: "none" }}>
                <LinkIcon size={16} /> Visit Hackathon Page
              </a>
            ) : (
              <div style={{ padding: "16px", background: "rgba(255, 255, 255, 0.05)", borderRadius: "8px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px" }}>
                No external event URL provided
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HackathonDetail;
