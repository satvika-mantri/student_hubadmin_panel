import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, X, BookOpen, GraduationCap, School, Tag } from "lucide-react";
import StatCard from "../components/StatCard";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import SearchFilter from "../components/SearchFilter";
import Modal from "../components/Modal";

const API_BASE = "https://studenthub-backend-woad.vercel.app";

const initialForm = {
    title: "",
    description: "",
    provider: "",
    instructor: "",
    category: "",
    level: "",
    duration: "",
    course_url: "",
    price: "",
    rating: "",
    target_group: "college",
};

function Courses() {
    const [courses, setCourses] = useState([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [search, setSearch] = useState("");
    const [searchColumn, setSearchColumn] = useState("Title");
    const [activeTab, setActiveTab] = useState("all");
    const [loading, setLoading] = useState(false);
    const limit = 10;

    const [form, setForm] = useState(initialForm);
    const [formLoading, setFormLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editCourseId, setEditCourseId] = useState(null);

    const [searchInput, setSearchInput] = useState("");

    // ================= FETCH =================
    useEffect(() => {
        fetchCourses();
    }, [page, search, searchColumn]);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");

            const res = await fetch(
                `${API_BASE}/api/bulk?type=courses&page=${page}&limit=${limit}&search=${search}&searchColumn=${searchColumn}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const json = await res.json();

            if (json.success) {
                setCourses(json.data);
                setTotal(json.total);
                setTotalPages(json.totalPages);
            }

        } catch (err) {
            console.error("Fetch courses error:", err);
        } finally {
            setLoading(false);
        }
    };

    // ================= SEARCH & TABS =================
    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        setSearch(searchInput);
    };

    const handleClear = () => {
        setSearch("");
        setSearchInput("");
        setPage(1);
    };

    // ================= FORM =================
    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleEdit = (course) => {
        setIsEditing(true);
        setEditCourseId(course.course_id);
        setForm({
            title: course.title || "",
            description: course.description || "",
            provider: course.provider || "",
            instructor: course.instructor || "",
            category: course.category || "",
            level: course.level || "",
            duration: course.duration || "",
            course_url: course.course_url || "",
            price: course.price || "",
            rating: course.rating || "",
            target_group: course.target_group || "college",
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ================= SUBMIT =================
    const handleSubmit = async (e) => {
        e.preventDefault();

        setFormLoading(true);
        setSuccess(null);
        setError(null);

        try {
            const token = localStorage.getItem("token");
            
            const url = isEditing ? `${API_BASE}/api/courses/${editCourseId}` : `${API_BASE}/api/getCourses`;
            const method = isEditing ? "PUT" : "POST";

            const res = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });

            const json = await res.json();

            if (json.success) {
                setSuccess(isEditing ? "Course updated successfully!" : "Course created successfully!");
                setForm(initialForm);
                setShowForm(false);
                setIsEditing(false);
                setEditCourseId(null);
                fetchCourses();
            } else {
                setError(json.message);
            }

        } catch (err) {
            console.error(isEditing ? "Update course error:" : "Create course error:", err);
            setError("Server error");
        } finally {
            setFormLoading(false);
        }
    };

    // ================= DATA LOGIC =================
    const schoolCourses = courses.filter(c => c.target_group === "school").length;
    const collegeCourses = courses.filter(c => c.target_group === "college").length;
    const freeCourses = courses.filter(c => !c.price || c.price === "0" || c.price.toLowerCase() === "free").length;

    const filteredCourses = courses.filter(c => {
        if (activeTab === "all") return true;
        return c.target_group === activeTab;
    });

    return (
        <div className="page" style={{ position: "relative" }}>

            {/* HEADER */}
            <div className="page-header" style={{ marginBottom: "32px" }}>
                <div>
                    <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>Courses</h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Manage platform educational courses</p>
                </div>

                <button
                    className={showForm ? "btn btn-secondary" : "btn btn-primary"}
                    onClick={() => {
                        setShowForm(!showForm);
                        if (showForm) {
                            setIsEditing(false);
                            setEditCourseId(null);
                            setForm(initialForm);
                        }
                    }}
                >
                    {showForm ? (
                        <><X size={16} /> Cancel</>
                    ) : (
                        <><Plus size={16} /> Add Course</>
                    )}
                </button>
            </div>

            {/* STATS ROW */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px", marginBottom: "32px" }}>
                <StatCard loading={loading} title="Total Courses" value={total} color="#3b82f6" icon={<BookOpen size={20} color="#3b82f6" />} />
                <StatCard loading={loading} title="School Courses" value={schoolCourses} color="#f59e0b" icon={<School size={20} color="#f59e0b" />} />
                <StatCard loading={loading} title="College Courses" value={collegeCourses} color="#06b6d4" icon={<GraduationCap size={20} color="#06b6d4" />} />
                <StatCard loading={loading} title="Free Courses" value={freeCourses} color="#10b981" icon={<Tag size={20} color="#10b981" />} />
            </div>

            {/* SEGMENTED TABS */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "24px", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                {["all", "school", "college"].map(tab => (
                    <button
                        key={tab}
                        onClick={() => { setActiveTab(tab); setPage(1); }}
                        style={{
                            background: "transparent",
                            border: "none",
                            color: activeTab === tab ? "var(--text-main)" : "var(--text-muted)",
                            fontWeight: activeTab === tab ? "600" : "400",
                            padding: "8px 16px",
                            cursor: "pointer",
                            borderBottom: activeTab === tab ? "2px solid #3b82f6" : "2px solid transparent",
                            transition: "all 0.2s ease"
                        }}
                    >
                        {tab === "all" ? "All Courses" : tab === "school" ? "School Courses" : "College Courses"}
                    </button>
                ))}
            </div>

            {/* FORM */}
            <Modal isOpen={showForm} onClose={() => {
                setShowForm(false);
                setIsEditing(false);
                setEditCourseId(null);
                setForm(initialForm);
            }} title={isEditing ? "Edit Course" : "Create Course"}>
                    <form onSubmit={handleSubmit}>
                        {error && <div className="message error">{error}</div>}
                        {success && <div className="message success">{success}</div>}

                        <div className="form-grid">
                            <input name="title" value={form.title} onChange={handleChange} placeholder="Title" required />
                            <input name="provider" value={form.provider} onChange={handleChange} placeholder="Provider" />
                            <input name="instructor" value={form.instructor} onChange={handleChange} placeholder="Instructor" />
                            <input name="category" value={form.category} onChange={handleChange} placeholder="Category" />
                            <input name="level" value={form.level} onChange={handleChange} placeholder="Level" />
                            <input name="duration" value={form.duration} onChange={handleChange} placeholder="Duration" />
                            <input name="course_url" value={form.course_url} onChange={handleChange} placeholder="Course URL" />
                            <input name="price" value={form.price} onChange={handleChange} placeholder="Price" />
                            <input name="rating" value={form.rating} onChange={handleChange} placeholder="Rating" />

                            <select name="target_group" value={form.target_group} onChange={handleChange} required>
                                <option value="college">College</option>
                                <option value="school">School</option>
                            </select>

                            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" />
                        </div>

                        <button className="btn btn-primary" disabled={formLoading} style={{ marginTop: "16px", width: "100%" }}>
                            {formLoading ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Course" : "Create Course")}
                        </button>
                    </form>
            </Modal>

            {/* SEARCH */}
            <SearchFilter
                searchColumn={searchColumn}
                setSearchColumn={setSearchColumn}
                searchInput={searchInput}
                setSearchInput={setSearchInput}
                handleSearch={handleSearch}
                handleClear={handleClear}
                isSearchActive={!!search}
                options={[
                    { value: "Title", label: "Title" },
                    { value: "Provider", label: "Provider" },
                    { value: "Category", label: "Category" },
                    { value: "Level", label: "Level" },
                    { value: "Duration", label: "Duration" },
                    { value: "Price", label: "Price" },
                    { value: "Rating", label: "Rating" },
                    { value: "Target Group", label: "Target Group" },
                    { value: "Status", label: "Status" }
                ]}
            />

            <style>{`
                .table-row-hover:hover td {
                    background-color: rgba(255, 255, 255, 0.04) !important;
                    transition: background-color 0.2s ease;
                }
                .table-row-hover:hover td a {
                    color: #60a5fa !important;
                    transition: color 0.2s ease;
                }
                .table-row-hover td a {
                    transition: color 0.2s ease;
                }
            `}</style>

            {/* TABLE */}
            <div className="table-container" style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", minWidth: "800px" }}>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Title</th>
                            <th>Provider</th>
                            <th>Category</th>
                            <th>Level</th>
                            <th>Duration</th>
                            <th>Price</th>
                            <th>Rating</th>
                            <th>Target Group</th>
                            <th>Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={10} style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                                    Loading courses...
                                </td>
                            </tr>
                        ) : filteredCourses.length === 0 ? (
                            <EmptyState icon={BookOpen} title="No courses found" description="Try adjusting your search or filters." colSpan={10} />
                        ) : (
                            filteredCourses.map((c, index) => {
                                let statusText = c.status === 1 || c.status === "active" || c.status === "published" ? "Active" : "Draft";
                                return (
                                <tr key={c.course_id} className="table-row-hover">
                                    <td>{(page - 1) * limit + index + 1}</td>
                                    <td style={{ fontWeight: 600 }}>
                                        <Link to={`/courses/${c.course_id}`} style={{ color: "#3b82f6", textDecoration: "none", display: "inline-block" }}>
                                            {c.title || "N/A"}
                                        </Link>
                                    </td>
                                    <td>{c.provider || "N/A"}</td>
                                    <td>{c.category ? <span className="badge">{c.category}</span> : <span style={{ opacity: 0.5 }}>—</span>}</td>
                                    <td>{c.level || "N/A"}</td>
                                    <td>{c.duration || "N/A"}</td>
                                    <td>{c.price || "Free"}</td>
                                    <td>{c.rating ? `⭐ ${c.rating}` : "N/A"}</td>
                                    <td>
                                        <span className={`badge ${c.target_group === 'school' ? 'badge-warning' : 'badge-info'}`} style={c.target_group === 'school' ? { color: "#f59e0b", background: "rgba(245, 158, 11, 0.15)" } : { color: "#06b6d4", background: "rgba(6, 182, 212, 0.15)" }}>
                                            {c.target_group ? c.target_group.charAt(0).toUpperCase() + c.target_group.slice(1) : "N/A"}
                                        </span>
                                    </td>
                                    <td>
                                        {statusText === "Active" ? (
                                            <span className="badge badge-success" style={{ color: "#10b981", background: "rgba(16, 185, 129, 0.15)", padding: "4px 12px", borderRadius: "99px", fontSize: "12px", fontWeight: "600", border: "1px solid rgba(16, 185, 129, 0.3)" }}>Active</span>
                                        ) : (
                                            <span className="badge badge-warning" style={{ color: "#94a3b8", background: "rgba(100, 116, 139, 0.15)", padding: "4px 12px", borderRadius: "99px", fontSize: "12px", fontWeight: "600", border: "1px solid rgba(100, 116, 139, 0.3)" }}>Draft</span>
                                        )}
                                    </td>
                                </tr>
                            )})
                        )}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION */}
            <Pagination page={page} totalPages={totalPages} setPage={setPage} />

        </div>
    );
}

export default Courses;