import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, MapPin, Calendar, Clock, DollarSign, Briefcase, FileText, Code, CheckCircle, Eye, Bookmark, XCircle, Trash2, Users } from "lucide-react";
import { DetailHeader, AdminActionCard, InfoGridCard, InfoItem, AnalyticsCard, AnalyticsItem, DescriptionCard } from "../components/DetailComponents";

const API_BASE = "https://studenthub-backend-woad.vercel.app";

function InternshipDetail() {
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
    const fetchInternship = async () => {
      try {
        const token = localStorage.getItem("token");
        // Try specific endpoint first
        let res = await fetch(`${API_BASE}/api/internships/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        let json = await res.json();
        
        // Fallback to bulk search if specific endpoint doesn't exist or returns weird structure
        if (!json.success || !res.ok) {
           res = await fetch(`${API_BASE}/api/bulk?type=internships&page=1&limit=10000`, {
              headers: { Authorization: `Bearer ${token}` }
           });
           const bulkJson = await res.json();
           if (bulkJson.success) {
              const found = bulkJson.data.find(i => String(i.internship_id) === String(id));
              if (found) {
                 json = { success: true, data: found };
              } else {
                 throw new Error("Internship not found");
              }
           }
        }

        if (json.success) {
          setData(json.data || {}); 
        } else {
          setError(json.message || "Failed to load internship details");
        }
      } catch (err) {
        console.error(err);
        setError("Error connecting to server.");
      } finally {
        setLoading(false);
      }
    };
    fetchInternship();
  }, [id, refetchTrigger]);

  const handleUpdateStatus = async (newStatus) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/internships/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const json = await res.json();
      
      if (res.ok && json.success) {
        showToast(`Internship ${newStatus === 1 ? 'reopened' : 'closed'} successfully`);
        setRefetchTrigger(prev => prev + 1);
      } else {
        showToast(json.message || "Failed to update", "error");
      }
    } catch(err) {
      console.error(err);
      showToast("Network error updating status", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to completely delete this internship? This cannot be undone.")) return;
    
    try {
      setActionLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/internships/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      const json = await res.json();
      
      if (res.ok && json.success) {
        alert("Internship deleted successfully");
        navigate("/internships");
      } else {
        showToast(json.message || "Failed to delete", "error");
      }
    } catch(err) {
      console.error(err);
      showToast("Network error deleting internship", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const renderValue = (val, emptyText = "Not available") => {
    if (!val || val === "N/A" || val === "null") {
      return <span style={{ opacity: 0.5, fontStyle: "italic", fontSize: "14px" }}>{emptyText}</span>;
    }
    return val;
  };

  if (loading) {
    return (
      <div className="page" style={{ padding: "32px", textAlign: "center" }}>
        <h2>Loading internship {id}...</h2>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page" style={{ padding: "32px" }}>
        <button className="btn btn-secondary" onClick={() => navigate("/internships")} style={{ marginBottom: "24px" }}>
          <ArrowLeft size={16} /> Back to Internships
        </button>
        <div className="message error">{error || "Internship data not found"}</div>
      </div>
    );
  }

  // Defensive extraction
  const internship = data;
  
  // Parse skills safely
  let skills = [];
  if (Array.isArray(internship.skills)) {
     skills = internship.skills;
  } else if (typeof internship.skills === 'string') {
     try {
       skills = JSON.parse(internship.skills);
     } catch(e) {
       // if it's a comma separated string
       skills = internship.skills.split(',').map(s => ({ name: s.trim() }));
     }
  }

  const isClosed = internship.status === 0;
  const isExpired = internship.application_deadline && new Date(internship.application_deadline) < new Date();
  let currentStatus = "Active";
  if (isClosed) currentStatus = "Closed";
  else if (isExpired) currentStatus = "Expired";

  const statusStyles = {
    Active: { background: "rgba(16, 185, 129, 0.15)", color: "#10b981", padding: "6px 16px", borderRadius: "99px", fontSize: "14px", fontWeight: "600", border: "1px solid rgba(16, 185, 129, 0.3)", boxShadow: "0 0 10px rgba(16, 185, 129, 0.15)" },
    Expired: { background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", padding: "6px 16px", borderRadius: "99px", fontSize: "14px", fontWeight: "600", border: "1px solid rgba(239, 68, 68, 0.3)", boxShadow: "0 0 10px rgba(239, 68, 68, 0.15)" },
    Closed: { background: "rgba(100, 116, 139, 0.15)", color: "#94a3b8", padding: "6px 16px", borderRadius: "99px", fontSize: "14px", fontWeight: "600", border: "1px solid rgba(100, 116, 139, 0.3)", boxShadow: "0 0 10px rgba(100, 116, 139, 0.15)" }
  };

  return (
    <div className="page" style={{ paddingBottom: "60px", position: "relative" }}>
      
      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", padding: "12px 24px", borderRadius: "8px", background: toast.type === "success" ? "#10b981" : "#ef4444", color: "#fff", zIndex: 1000, boxShadow: "0 4px 6px rgba(0,0,0,0.1)", fontWeight: "bold" }}>
          {toast.message}
        </div>
      )}

      {/* STICKY BACK BUTTON */}
      <div style={{ position: "sticky", top: "16px", zIndex: 100, marginBottom: "24px", display: "inline-block" }}>
        <button className="btn btn-secondary" onClick={() => navigate("/internships")} style={{ padding: "8px 16px", background: "var(--card-bg)", border: "1px solid var(--border-color)", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", color: "#fff", cursor: "pointer" }}>
          <ArrowLeft size={16} style={{ marginRight: "8px" }} /> Back to Internships
        </button>
      </div>

      <DetailHeader 
        title={internship.title || "Internship Detail"}
        isActive={currentStatus === "Active"}
        activeText="Active"
        inactiveText={currentStatus}
        badges={[
          { text: internship.company_name || "Unknown Company", bg: "rgba(59, 130, 246, 0.15)", color: "#60a5fa" }
        ]}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }}>

        {/* SECTION A - ADMIN ACTIONS */}
        <AdminActionCard>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {internship.status === 0 ? (
               <button className="btn" style={{ background: "#10b981", color: "#fff" }} onClick={() => handleUpdateStatus(1)} disabled={actionLoading}>
                 <CheckCircle size={16} /> Reopen Internship
               </button>
            ) : (
               <button className="btn" style={{ background: "#f59e0b", color: "#fff" }} onClick={() => handleUpdateStatus(0)} disabled={actionLoading}>
                 <XCircle size={16} /> Close Internship
               </button>
            )}
            
            <button className="btn btn-secondary" style={{ color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.3)" }} onClick={handleDelete} disabled={actionLoading}>
              <Trash2 size={16} /> Delete Internship
            </button>
          </div>
        </AdminActionCard>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
          {/* SECTION B - INFORMATION */}
          <InfoGridCard>
              <InfoItem label="Company" value={renderValue(internship.company_name, "No company listed")} />
              <InfoItem label="Location" value={renderValue(internship.location, "No location set")} icon={MapPin} />
              <InfoItem label="Stipend" value={renderValue(internship.stipend, "Unpaid / Not specified")} icon={DollarSign} />
              <InfoItem label="Duration" value={renderValue(internship.duration, "No duration provided")} icon={Clock} />
              <InfoItem label="Type" value={renderValue(internship.internship_type, "N/A")} icon={Briefcase} />
              <InfoItem label="Start Date" value={internship.start_date ? new Date(internship.start_date).toLocaleDateString() : <span style={{ opacity: 0.5, fontStyle: "italic" }}>No start date available</span>} icon={Calendar} />
              <InfoItem label="Deadline" value={internship.application_deadline ? new Date(internship.application_deadline).toLocaleDateString() : <span style={{ opacity: 0.5, fontStyle: "italic" }}>No deadline set</span>} icon={Calendar} />
              <InfoItem label="Created At" value={internship.created_at ? new Date(internship.created_at).toLocaleDateString() : <span style={{ opacity: 0.5, fontStyle: "italic" }}>Unknown</span>} />
          </InfoGridCard>

          {/* SECTION C - DESCRIPTION & URL */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <DescriptionCard 
              title="Description"
              icon={FileText}
              description={renderValue(internship.description, "No description provided.")}
            />
            {internship.apply_url && (
              <div className="card" style={{ marginBottom: 0, padding: "24px" }}>
                <h2 style={{ fontSize: "16px", marginBottom: "20px", fontWeight: "600", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                   Application Link
                </h2>
                <a href={internship.apply_url} target="_blank" rel="noreferrer" style={{ color: "#3b82f6", textDecoration: "underline", wordBreak: "break-all", fontSize: "14px" }}>
                  {internship.apply_url}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* SECTION D - SKILLS & ANALYTICS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
          
          <div className="card" style={{ marginBottom: 0, padding: "24px" }}>
            <h2 style={{ fontSize: "16px", marginBottom: "20px", fontWeight: "600", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
              <Code size={18} color="#3b82f6" /> Required Skills
            </h2>
            {skills.length > 0 ? (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {skills.map((s, i) => (
                  <span key={i} style={{ background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", padding: "6px 12px", borderRadius: "16px", fontSize: "12px", fontWeight: "500", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
                    {s.name || s}
                  </span>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: "14px", color: "var(--text-muted)", fontStyle: "italic", opacity: 0.5 }}>No skills added</div>
            )}
          </div>

          <AnalyticsCard>
              <AnalyticsItem label="Total Applications" value={internship.applications_count ?? 0} icon={Users} />
              <AnalyticsItem label="Total Views" value={internship.views_count ?? "N/A"} icon={Eye} />
              <AnalyticsItem label="Saved By" value={internship.saves_count ?? "N/A"} icon={Bookmark} borderBottom={false} />
          </AnalyticsCard>

        </div>
        
      </div>
    </div>
  );
}

export default InternshipDetail;
