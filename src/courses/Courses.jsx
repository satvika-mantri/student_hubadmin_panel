import { useState, useEffect } from "react";
import { Search, Plus, X } from "lucide-react";

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
    const [searchInput, setSearchInput] = useState("");
    const [loading, setLoading] = useState(false);
    const limit = 10;

    const [form, setForm] = useState(initialForm);
    const [formLoading, setFormLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editCourseId, setEditCourseId] = useState(null);

    // ================= FETCH =================
    useEffect(() => {
        fetchCourses();
    }, [page, search]);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");

            const res = await fetch(
                `${API_BASE}/api/bulk?type=courses&page=${page}&limit=${limit}&search=${search}`,
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

    // ================= SEARCH =================
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

    return (
        <div>

            {/* HEADER */}
            <div className="page-header">
                <div>
                    <h1>Courses</h1>
                    <p>Manage {total} courses</p>
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

            {/* FORM */}
            {showForm && (
                <div className="form-container">
                    <form onSubmit={handleSubmit}>
                        <h2 className="form-title">{isEditing ? "Edit Course" : "Create Course"}</h2>

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

                        <button className="btn btn-primary" disabled={formLoading}>
                            {formLoading ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Course" : "Create Course")}
                        </button>
                    </form>
                </div>
            )}

            {/* SEARCH */}
            <form onSubmit={handleSearch} className="search-form">
                <input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search courses..."
                />
                <button type="submit" className="btn btn-primary">
                    <Search size={16} /> Search
                </button>

                {search && (
                    <button type="button" onClick={handleClear} className="btn btn-secondary">
                        Clear
                    </button>
                )}
            </form>

            {/* TABLE */}
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Title</th>
                            <th>Provider</th>
                            <th>Level</th>
                            <th>Duration</th>
                            <th>Target Group</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: "center" }}>
                                    Loading courses...
                                </td>
                            </tr>
                        ) : courses.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: "center" }}>
                                    No courses found.
                                </td>
                            </tr>
                        ) : (
                            courses.map((c, index) => (
                                <tr key={c.course_id}>
                                    <td>{(page - 1) * limit + index + 1}</td>
                                    <td style={{ fontWeight: 500 }}>{c.title}</td>
                                    <td>{c.provider || "N/A"}</td>
                                    <td>{c.level || "N/A"}</td>
                                    <td>{c.duration || "N/A"}</td>
                                    <td>
                                        <span className={`badge ${c.target_group === 'school' ? 'badge-warning' : 'badge-info'}`}>
                                            {c.target_group ? c.target_group.charAt(0).toUpperCase() + c.target_group.slice(1) : "N/A"}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            className="badge badge-info" 
                                            style={{ border: "none", cursor: "pointer" }} 
                                            onClick={() => handleEdit(c)}
                                            type="button"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    );
}

export default Courses;