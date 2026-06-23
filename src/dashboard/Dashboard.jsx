import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { dashboardMockData } from '../utils/dashboardMockData';

const API_BASE = "https://studenthub-backend-woad.vercel.app";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "40px", color: "red", background: "#fee2e2", borderRadius: "8px", margin: "20px" }}>
          <h2>Dashboard Crashed!</h2>
          <pre>{this.state.error?.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function Dashboard() {
  const [total, setTotal] = useState(0);
  const [adminCount, setAdminCount] = useState(0);
  const [schoolCount, setSchoolCount] = useState(0);
  const [collegeCount, setCollegeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const url = `${API_BASE}/api/bulk?type=users&page=1&limit=1000`;
        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();
        
        if (json.success) {
          const usersData = Array.isArray(json.data) ? json.data : [];
          setTotal(json.total || usersData.length || 0);
          
          const stats = json.stats || null;
          
          setAdminCount(stats?.admins ?? usersData.filter(u => u.role_name?.toLowerCase() === "admin").length);
          setSchoolCount(stats?.schoolStudents ?? usersData.filter(u => u.school_name).length);
          setCollegeCount(stats?.collegeStudents ?? usersData.filter(u => u.university || u.degree).length);
        }
      } catch (err) {
        console.error("Fetch dashboard stats error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <ErrorBoundary>
      <div className="page" style={{ position: "relative" }}>
        
        {/* HEADER */}
        <div className="page-header" style={{ marginBottom: "24px" }}>
          <div>
            <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>Dashboard Overview</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              Monitor key metrics, user activity, and platform growth.
            </p>
          </div>
        </div>

        {/* ANALYTICS CHARTS SECTION */}

        {/* ANALYTICS CHARTS SECTION */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", marginBottom: "24px" }}>
          
          {/* LINE CHART: MONTHLY REGISTRATIONS */}
          <div className="card" style={{ padding: "24px", marginBottom: 0, display: "flex", flexDirection: "column" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "20px", fontWeight: "600", color: "#fff" }}>Monthly User Registrations</h3>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardMockData.monthlyRegistrations} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "8px", color: "#fff" }}
                    itemStyle={{ color: "#3b82f6" }}
                  />
                  <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PIE CHART: ROLE DISTRIBUTION */}
          <div className="card" style={{ padding: "24px", marginBottom: 0, display: "flex", flexDirection: "column" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "20px", fontWeight: "600", color: "#fff" }}>Role Distribution</h3>
            <div style={{ width: "100%", height: 300, display: "flex", justifyContent: "center", alignItems: "center" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardMockData.roleDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {dashboardMockData.roleDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "8px", color: "#fff" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* SECOND ROW: BAR CHART & ACTIVITY FEED */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", marginBottom: "40px" }}>
          
          {/* BAR CHART: ACTIVE VS INACTIVE */}
          <div className="card" style={{ padding: "24px", marginBottom: 0, display: "flex", flexDirection: "column" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "20px", fontWeight: "600", color: "#fff" }}>Weekly Activity (Active vs Inactive)</h3>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardMockData.activeInactiveStats} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "8px", color: "#fff" }}
                    cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                  <Bar dataKey="active" name="Active Users" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                  <Bar dataKey="inactive" name="Inactive Users" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RECENT ACTIVITY FEED */}
          <div className="card" style={{ padding: "24px", marginBottom: 0, display: "flex", flexDirection: "column" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "20px", fontWeight: "600", color: "#fff" }}>Recent Platform Activity</h3>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px", overflowY: "auto", paddingRight: "8px" }}>
              {dashboardMockData.recentActivity.map((activity) => (
                <div key={activity.id} style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  <div style={{ 
                    minWidth: "12px", 
                    width: "12px", 
                    height: "12px", 
                    borderRadius: "50%", 
                    background: activity.iconColor,
                    marginTop: "6px"
                  }}></div>
                  <div>
                    <h4 style={{ fontSize: "14px", color: "#fff", margin: "0 0 4px 0", fontWeight: "600" }}>{activity.title}</h4>
                    <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 6px 0" }}>{activity.description}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#64748b" }}>
                      <Clock size={12} /> {activity.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </ErrorBoundary>
  );
}

export default Dashboard;
