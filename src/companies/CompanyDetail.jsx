import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, MapPin, Globe, Clock, FileText, CheckCircle, XCircle, Trash2, Shield, Users, Briefcase } from "lucide-react";
import { DetailHeader, AdminActionCard, InfoGridCard, InfoItem, AnalyticsCard, AnalyticsItem, DescriptionCard } from "../components/DetailComponents";

const API_BASE = "https://studenthub-backend-woad.vercel.app";

function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        // Using bulk API to find company by ID as fallback, since direct endpoint might not exist
        const res = await fetch(`${API_BASE}/api/bulk?type=companies&page=1&limit=1000`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        
        if (json.success && Array.isArray(json.data)) {
          const found = json.data.find(c => String(c.company_id) === String(id));
          setCompany(found || null);
        }
      } catch (err) {
        console.error("Fetch company error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [id]);

  if (loading) return <div className="page" style={{ padding: "40px", color: "var(--text-muted)", textAlign: "center" }}>Loading company details...</div>;
  if (!company) return <div className="page" style={{ padding: "40px", color: "#ef4444", textAlign: "center" }}>Company not found.</div>;

  const renderValue = (val, emptyText = "Not available") => {
    if (!val || val === "N/A" || val === "null") {
      return <span style={{ opacity: 0.5, fontStyle: "italic", fontSize: "14px" }}>{emptyText}</span>;
    }
    return val;
  };

  const isActive = company.status === 1 || company.status === "active";
  
  const internshipsCount = company.internships_count || 0;
  const jobsCount = company.jobs_count || 0;
  const totalRoles = internshipsCount + jobsCount;

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
        title={company.name || "Company Detail"}
        isActive={isActive}
        activeText="ACTIVE"
        inactiveText="INACTIVE"
        avatarUrl={company.logo_url}
        avatarFallback={company.name ? company.name.charAt(0).toUpperCase() : "?"}
        badges={[
          ...(company.industry ? [{ text: company.industry, bg: "rgba(255, 255, 255, 0.1)", color: "#fff" }] : []),
          { text: company.location || "Location not specified", icon: MapPin, bg: "transparent", color: "rgba(255, 255, 255, 0.5)" }
        ]}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px", alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <AdminActionCard>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button className="btn" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.2)", width: "100%", justifyContent: "center" }} onClick={() => showToast("Status update simulated.", "success")}>
                <Shield size={16} /> Disable Company
              </button>
              <button className="btn" style={{ background: "rgba(239, 68, 68, 0.2)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.4)", width: "100%", justifyContent: "center" }} onClick={() => showToast("Deletion simulated.", "error")}>
                <Trash2 size={16} /> Delete Company
              </button>
            </div>
          </AdminActionCard>

          <AnalyticsCard>
              <AnalyticsItem label="Total Internships" value={internshipsCount} icon={Briefcase} />
              <AnalyticsItem label="Total Jobs" value={jobsCount} icon={Briefcase} />
              <AnalyticsItem label="Total Open Roles" value={totalRoles} icon={Users} borderBottom={false} valueColor="#3b82f6" />
          </AnalyticsCard>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <InfoGridCard columns={2}>
              <InfoItem label="Industry" value={renderValue(company.industry, "No industry listed")} icon={Building2} />
              <InfoItem label="Location" value={renderValue(company.location, "No location set")} icon={MapPin} />
              <InfoItem label="Company Size" value={renderValue(company.company_size, "Not specified")} icon={Users} />
              <InfoItem label="Founded Year" value={renderValue(company.founded_year, "Not available")} icon={Clock} />
              <InfoItem label="Created At" value={company.created_at ? new Date(company.created_at).toLocaleDateString() : <span style={{ opacity: 0.5, fontStyle: "italic", fontSize: "14px" }}>Unknown</span>} />
              <div>
                <strong style={{ display: "block", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>Website</strong> 
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Globe size={14} />
                  {company.website ? (
                    <a href={company.website} target="_blank" rel="noreferrer" style={{ color: "#3b82f6", textDecoration: "underline", wordBreak: "break-all" }}>
                      Visit Website
                    </a>
                  ) : (
                    <span style={{ opacity: 0.5, fontStyle: "italic", fontSize: "14px" }}>No website provided</span>
                  )}
                </div>
              </div>
          </InfoGridCard>

          <DescriptionCard 
            title="Description"
            icon={FileText}
            description={renderValue(company.description, "No description provided.")}
          />

          {/* LISTINGS SECTION */}
          <div className="card" style={{ marginBottom: 0, padding: "24px" }}>
            <h2 style={{ fontSize: "16px", marginBottom: "20px", fontWeight: "600", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
               Posted Listings
            </h2>
            
            {totalRoles === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--text-muted)", fontSize: "14px", fontStyle: "italic", border: "1px dashed var(--border-color)", borderRadius: "8px" }}>
                This company currently has no active listings.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {internshipsCount > 0 && (
                  <div style={{ padding: "16px", borderRadius: "8px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h3 style={{ margin: "0 0 4px 0", fontSize: "14px", color: "#fff" }}>Internships</h3>
                      <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>{internshipsCount} active internship postings</p>
                    </div>
                    <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>View All</button>
                  </div>
                )}
                
                {jobsCount > 0 && (
                  <div style={{ padding: "16px", borderRadius: "8px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h3 style={{ margin: "0 0 4px 0", fontSize: "14px", color: "#fff" }}>Jobs</h3>
                      <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>{jobsCount} active job postings</p>
                    </div>
                    <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>View All</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyDetail;
