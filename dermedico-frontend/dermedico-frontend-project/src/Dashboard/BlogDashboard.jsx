import React, { useEffect, useMemo, useState } from "react";
import {
    Bell,
    Eye,
    FileText,
    Filter,
    Folder,
    LayoutDashboard, // Added for dashboard icon
    Pencil,
    PlusCircle,
    Search,
    Tag,
    Trash2,
    UserCircle2,
    X,
    Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import api, { BASE_URL } from "../api/api";

const EMPTY_FORM = {
    title: "",
    subtitle: "",
    heading: "",
    content: "",
    slug: "",
    authorName: "",
    authorDescription: "",
    categoryId: "",
    metaTitle: "",
    metaDescription: "",
    tagIds: [],
    faqs: [],
};

const EMPTY_FAQ = { question: "", answer: "" };

function getInitials(name = "") {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
}

function formatDate(dateValue) {
    if (!dateValue) return "-";
    return new Date(dateValue).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

const BlogDashboard = () => {
    const navigate = useNavigate(); // Initialize useNavigate
    const [blogs, setBlogs] = useState([]);
    const [categories, setCategories] = useState([]);
    const [allTags, setAllTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [showEditor, setShowEditor] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showTagManager, setShowTagManager] = useState(false);
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [mainImage, setMainImage] = useState(null);
    const [authorPhoto, setAuthorPhoto] = useState(null);
    const [mainImagePreview, setMainImagePreview] = useState("");
    const [authorPhotoPreview, setAuthorPhotoPreview] = useState("");
    const [toast, setToast] = useState({ show: false, type: "success", message: "" });

    // Tag management states
    const [newTagName, setNewTagName] = useState("");
    const [editingTag, setEditingTag] = useState(null);
    const [tagSearch, setTagSearch] = useState("");

    // Category management states - simplified (only add)
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryDescription, setNewCategoryDescription] = useState("");
    const [categoryImage, setCategoryImage] = useState(null);
    const [categoryImagePreview, setCategoryImagePreview] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [blogRes, categoryRes, tagsRes] = await Promise.all([
                api.get("/admin/blogs"),
                api.get("/admin/categories"),
                api.get("/admin/blog-tags"),
            ]);
            setBlogs(Array.isArray(blogRes.data) ? blogRes.data : []);
            setCategories(Array.isArray(categoryRes.data) ? categoryRes.data : []);
            setAllTags(Array.isArray(tagsRes.data) ? tagsRes.data : []);
        } catch (error) {
            console.error("Load error:", error);
            showToast("Could not fetch dashboard data.", "error");
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message, type = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: "", type: "success" });
        }, 3000);
    };

    const resetEditorState = () => {
        setFormData(EMPTY_FORM);
        setMainImage(null);
        setAuthorPhoto(null);
        setMainImagePreview("");
        setAuthorPhotoPreview("");
    };

    const handleOpenEditor = (blog) => {
        setSelectedBlog(blog);
        setFormData({
            title: blog.title || "",
            subtitle: blog.subtitle || "",
            heading: blog.heading || "",
            content: blog.content || "",
            slug: blog.slug || "",
            authorName: blog.authorName || "",
            authorDescription: blog.authorDescription || "",
            categoryId: blog.category?.id || "",
            metaTitle: blog.metaTitle || "",
            metaDescription: blog.metaDescription || "",
            tagIds: (blog.tags || []).map((tag) => tag.id),
            faqs: (blog.faqs || []).map((faq) => ({
                id: faq.id,
                question: faq.question || "",
                answer: faq.answer || "",
            })),
        });
        setMainImagePreview(blog.mainImage ? `${BASE_URL}${blog.mainImage}` : "");
        setAuthorPhotoPreview(blog.authorPhoto ? `${BASE_URL}${blog.authorPhoto}` : "");
        setMainImage(null);
        setAuthorPhoto(null);
        setShowEditor(true);
    };

    const handleCreateNewBlog = () => {
        setSelectedBlog(null);
        resetEditorState();
        setShowEditor(true);
    };

    const handleDeleteBlog = async () => {
        if (!selectedBlog?.id) return;
        try {
            await api.delete(`/admin/blogs/${selectedBlog.id}`);
            setBlogs((prev) => prev.filter((item) => item.id !== selectedBlog.id));
            setShowDeleteConfirm(false);
            setSelectedBlog(null);
            showToast("Blog deleted successfully.");
        } catch (error) {
            console.error("Delete error:", error);
            showToast("Failed to delete blog.", "error");
        }
    };

    // Tag Management Functions
    const handleCreateTag = async () => {
        if (!newTagName.trim()) return;
        try {
            const response = await api.post("/admin/blog-tags", { tagName: newTagName.trim() });
            setAllTags([...allTags, response.data]);
            setNewTagName("");
            showToast("Tag created successfully.");
        } catch (error) {
            console.error("Create tag error:", error);
            showToast("Failed to create tag.", "error");
        }
    };

    const handleUpdateTag = async () => {
        if (!editingTag || !newTagName.trim()) return;
        try {
            await api.put(`/admin/blog-tags/${editingTag.id}`, { tagName: newTagName.trim() });
            setAllTags(allTags.map(tag =>
                tag.id === editingTag.id ? { ...tag, tagName: newTagName.trim() } : tag
            ));
            setEditingTag(null);
            setNewTagName("");
            showToast("Tag updated successfully.");
        } catch (error) {
            console.error("Update tag error:", error);
            showToast("Failed to update tag.", "error");
        }
    };

    const handleDeleteTag = async (tagId) => {
        try {
            await api.delete(`/admin/blog-tags/${tagId}`);
            setAllTags(allTags.filter(tag => tag.id !== tagId));
            setFormData(prev => ({
                ...prev,
                tagIds: prev.tagIds.filter(id => id !== tagId)
            }));
            showToast("Tag deleted successfully.");
        } catch (error) {
            console.error("Delete tag error:", error);
            showToast("Failed to delete tag.", "error");
        }
    };

    // Category Management Functions - REMOVED EDIT & DELETE, only add
    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return;
        try {
            const formData = new FormData();
            const categoryData = {
                name: newCategoryName.trim(),
                description: newCategoryDescription.trim() || "Category description"
            };
            formData.append("category", new Blob([JSON.stringify(categoryData)], { type: "application/json" }));
            if (categoryImage) {
                formData.append("image", categoryImage);
            }

            const response = await api.post("/admin/categories", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setCategories([...categories, response.data]);
            setNewCategoryName("");
            setNewCategoryDescription("");
            setCategoryImage(null);
            setCategoryImagePreview("");
            setShowCategoryManager(false);
            showToast("Category created successfully.");
        } catch (error) {
            console.error("Create category error:", error);
            showToast("Failed to create category.", "error");
        }
    };

    const handleAddTagToBlog = (tagId) => {
        if (!formData.tagIds.includes(tagId)) {
            setFormData(prev => ({
                ...prev,
                tagIds: [...prev.tagIds, tagId]
            }));
        }
    };

    const handleRemoveTagFromBlog = (tagId) => {
        setFormData(prev => ({
            ...prev,
            tagIds: prev.tagIds.filter(id => id !== tagId)
        }));
    };

    // FAQ Management Functions
    const handleAddFaq = () => {
        setFormData(prev => ({
            ...prev,
            faqs: [...prev.faqs, { ...EMPTY_FAQ }]
        }));
    };

    const handleUpdateFaq = (index, field, value) => {
        const updatedFaqs = [...formData.faqs];
        updatedFaqs[index] = { ...updatedFaqs[index], [field]: value };
        setFormData(prev => ({ ...prev, faqs: updatedFaqs }));
    };

    const handleRemoveFaq = (index) => {
        setFormData(prev => ({
            ...prev,
            faqs: prev.faqs.filter((_, i) => i !== index)
        }));
    };

    const handleSaveBlog = async () => {
        if (!formData.title.trim() || !formData.content.trim() || !formData.categoryId) {
            showToast("Title, content and category are required.", "error");
            return;
        }

        const tags = formData.tagIds
            .map(id => {
                const tag = allTags.find(t => t.id === id);
                return tag?.tagName;
            })
            .filter(Boolean);

        const faqs = formData.faqs
            .map((faq) => ({
                question: faq.question.trim(),
                answer: faq.answer.trim(),
            }))
            .filter((faq) => faq.question && faq.answer);

        const blogRequest = {
            title: formData.title,
            subtitle: formData.subtitle,
            heading: formData.heading,
            content: formData.content,
            slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-'),
            authorName: formData.authorName || "Admin",
            authorDescription: formData.authorDescription || "",
            categoryId: Number(formData.categoryId),
            metaTitle: formData.metaTitle || formData.title,
            metaDescription: formData.metaDescription || formData.subtitle || formData.title,
            tags,
            faqs,
        };

        try {
            setSaving(true);
            const payload = new FormData();
            payload.append("data", new Blob([JSON.stringify(blogRequest)], { type: "application/json" }));

            if (mainImage) {
                payload.append("mainImage", mainImage);
            }
            if (authorPhoto) {
                payload.append("authorPhoto", authorPhoto);
            }

            if (selectedBlog) {
                await api.put(`/admin/blogs/update/${selectedBlog.id}`, payload, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                showToast("Blog updated successfully.");
            } else {
                await api.post("/admin/blogs/create", payload, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                showToast("Blog created successfully.");
            }

            await loadData();
            setShowEditor(false);
            resetEditorState();
        } catch (error) {
            console.error("Save error:", error);
            showToast("Failed to save blog.", "error");
        } finally {
            setSaving(false);
        }
    };

    const filteredBlogs = useMemo(() => {
        const query = search.toLowerCase().trim();
        return blogs.filter((blog) => {
            if (!query) return true;
            return (
                String(blog.title || "").toLowerCase().includes(query) ||
                String(blog.authorName || "").toLowerCase().includes(query) ||
                String(blog.category?.name || "").toLowerCase().includes(query)
            );
        });
    }, [blogs, search]);

    const filteredTags = useMemo(() => {
        const query = tagSearch.toLowerCase().trim();
        return allTags.filter(tag =>
            tag.tagName.toLowerCase().includes(query)
        );
    }, [allTags, tagSearch]);

    return (
        <div style={{ fontFamily: "Manrope" }} className="min-h-screen bg-[#f4f7fb] text-slate-800">
            {toast.show && (
                <div
                    className={`fixed right-4 top-4 z-[80] rounded-lg px-4 py-2 text-sm font-medium text-white shadow-lg ${toast.type === "error" ? "bg-red-500" : "bg-blue-600"
                        }`}
                >
                    {toast.message}
                </div>
            )}

            <div className="flex min-h-screen">
                <aside className="hidden w-64 border-r border-slate-200 bg-white lg:block">
                    <div className="px-5 py-6">
                        <h2 className="text-2xl font-bold text-slate-900">Dermadico Admin</h2>
                        <p className="mt-1 text-sm text-slate-500">Blog Content Management</p>
                    </div>

                    <nav className="space-y-1 px-4">
                        {/* Dashboard Link - Redirects to main admin dashboard */}
                        <button
                            onClick={() => navigate("/admin/dashboard")}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[17px] text-slate-600 hover:bg-slate-100"
                        >
                            <LayoutDashboard size={18} />
                            Dashboard
                            <span className="ml-auto text-xs text-slate-400">↗</span>
                        </button>

                        <button className="flex w-full items-center gap-3 rounded-xl bg-blue-50 px-3 py-2 text-left text-[17px] font-semibold text-blue-700">
                            <FileText size={18} />
                            Posts
                        </button>
                        <button
                            onClick={() => setShowCategoryManager(true)}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[17px] text-slate-600 hover:bg-slate-100"
                        >
                            <Folder size={18} />
                            Categories
                        </button>
                        <button
                            onClick={() => setShowTagManager(true)}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[17px] text-slate-600 hover:bg-slate-100"
                        >
                            <Tag size={18} />
                            Manage Tags
                        </button>
                    </nav>

                    <div className="mt-6 px-4">
                        <button
                            onClick={handleCreateNewBlog}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-base font-semibold text-white hover:bg-blue-700"
                        >
                            <PlusCircle size={18} />
                            Create New Post
                        </button>
                    </div>

                    {/* Quick Links Section */}
                    <div className="mt-8 px-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Quick Links</p>
                        <button
                            onClick={() => navigate("/admin/dashboard")}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
                        >
                            <LayoutDashboard size={16} />
                            Main Dashboard
                        </button>
                    </div>
                </aside>

                <main className="flex-1">
                    <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-8">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="relative w-full max-w-md">
                                <Search
                                    size={16}
                                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search blog posts..."
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-blue-500"
                                />
                            </div>

                            {/* Optional: Add a quick nav button for mobile */}
                            <button
                                onClick={() => navigate("/admin/dashboard")}
                                className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700 hover:bg-slate-200 lg:hidden"
                            >
                                <LayoutDashboard size={16} />
                                Dashboard
                            </button>
                        </div>
                    </header>

                    <section className="px-3 py-4 sm:px-6">

                        {/* Compact Header */}
                        <div className="mb-3 flex items-center justify-between">
                            <h1 className="text-xl font-semibold text-slate-900">
                                Blog Posts
                            </h1>

                            <span className="text-xs text-slate-500">
                                {filteredBlogs.length} posts
                            </span>
                        </div>


                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

                            <div className="overflow-x-auto">

                                <table className="min-w-full">

                                    <thead className="bg-slate-50">

                                        <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">

                                            <th className="px-4 py-3">Title</th>

                                            <th className="px-4 py-3">Author</th>

                                            <th className="px-4 py-3">Category</th>

                                            <th className="px-4 py-3">Date</th>

                                            <th className="px-4 py-3 text-right">Actions</th>

                                        </tr>

                                    </thead>


                                    <tbody className="divide-y divide-slate-200">

                                        {loading ? (

                                            <tr>
                                                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                                                    Loading posts...
                                                </td>
                                            </tr>

                                        ) : filteredBlogs.length === 0 ? (

                                            <tr>
                                                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                                                    No blogs found.
                                                </td>
                                            </tr>

                                        ) : (

                                            filteredBlogs.map((blog) => (

                                                <tr key={blog.id} className="hover:bg-slate-50">

                                                    {/* Title */}

                                                    <td className="px-4 py-3">

                                                        <div className="flex items-center gap-2">

                                                            <img
                                                                src={
                                                                    blog.mainImage
                                                                        ? `${BASE_URL}${blog.mainImage}`
                                                                        : "https://placehold.co/80x80?text=Blog"
                                                                }
                                                                alt={blog.title || "Blog"}
                                                                className="h-8 w-8 rounded-md object-cover"
                                                            />

                                                            <div>

                                                                <p className="text-sm font-semibold text-slate-900 leading-tight">
                                                                    {blog.title || "Untitled"}
                                                                </p>

                                                                <p className="text-xs text-slate-500 truncate max-w-[200px]">
                                                                    {blog.subtitle || "No subtitle"}
                                                                </p>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    {/* Author */}

                                                    <td className="px-4 py-3">

                                                        <div className="flex items-center gap-2">

                                                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                                                                {getInitials(blog.authorName) || "AU"}
                                                            </span>

                                                            <span className="text-sm text-slate-700">
                                                                {blog.authorName || "Admin"}
                                                            </span>

                                                        </div>

                                                    </td>


                                                    {/* Category */}

                                                    <td className="px-4 py-3">

                                                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                                            {blog.category?.name || "Uncategorized"}
                                                        </span>

                                                    </td>


                                                    {/* Date */}

                                                    <td className="px-4 py-3 text-sm text-slate-600">

                                                        {formatDate(blog.updatedAt || blog.createdAt)}

                                                    </td>


                                                    {/* Actions */}

                                                    <td className="px-4 py-3">

                                                        <div className="flex justify-end gap-1">

                                                            <button
                                                                onClick={() => handleOpenEditor(blog)}
                                                                className="rounded p-1.5 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                                                            >
                                                                <Pencil size={15} />
                                                            </button>


                                                            <a
                                                                href={blog.slug ? `/blog/${blog.slug}` : "#"}
                                                                target={blog.slug ? "_blank" : "_self"}
                                                                rel="noreferrer"
                                                                className="rounded p-1.5 text-slate-600 hover:bg-slate-100"
                                                            >
                                                                <Eye size={15} />
                                                            </a>


                                                            <button
                                                                onClick={() => {
                                                                    setSelectedBlog(blog);
                                                                    setShowDeleteConfirm(true);
                                                                }}
                                                                className="rounded p-1.5 text-red-500 hover:bg-red-50"
                                                            >
                                                                <Trash2 size={15} />
                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>

                                            ))

                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    </section>
                </main>
            </div>

            {/* Blog Editor Modal - unchanged */}
            {showEditor && (
                <div className="fixed inset-0 z-[70] bg-black/45 p-3 sm:p-8 overflow-y-auto">
                    <div className="mx-auto flex h-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <h2 className="text-2xl font-bold text-slate-900">
                                {selectedBlog ? "Edit Post" : "Create New Post"}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowEditor(false);
                                    resetEditorState();
                                }}
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="grid flex-1 overflow-y-auto lg:grid-cols-[1fr_340px]">
                            <div className="space-y-4 border-r border-slate-200 px-6 py-5">
                                <input
                                    value={formData.title}
                                    onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
                                    placeholder="Post title"
                                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-3xl font-bold outline-none focus:border-blue-500"
                                />
                                <input
                                    value={formData.subtitle}
                                    onChange={(event) => setFormData((prev) => ({ ...prev, subtitle: event.target.value }))}
                                    placeholder="Subtitle"
                                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-lg outline-none focus:border-blue-500"
                                />
                                <input
                                    value={formData.heading}
                                    onChange={(event) => setFormData((prev) => ({ ...prev, heading: event.target.value }))}
                                    placeholder="Heading"
                                    className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                                />
                                <textarea
                                    value={formData.content}
                                    onChange={(event) => setFormData((prev) => ({ ...prev, content: event.target.value }))}
                                    placeholder="Write blog content..."
                                    rows={16}
                                    className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm leading-7 outline-none focus:border-blue-500"
                                />

                                {/* FAQ Section */}
                                <div className="rounded-xl border border-slate-200 p-4">
                                    <div className="mb-3 flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-slate-900">FAQ Schema</h3>
                                        <button
                                            onClick={handleAddFaq}
                                            className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                                        >
                                            <Plus size={16} />
                                            Add Question
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {formData.faqs.length === 0 && (
                                            <p className="text-sm text-slate-500">No FAQ items added. Click "Add Question" to create one.</p>
                                        )}
                                        {formData.faqs.map((faq, idx) => (
                                            <div key={idx} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                                                <div className="mb-3 flex items-center justify-between">
                                                    <span className="text-xs font-semibold uppercase text-slate-500">Question {idx + 1}</span>
                                                    <button
                                                        onClick={() => handleRemoveFaq(idx)}
                                                        className="text-xs font-semibold text-red-500 hover:text-red-600"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                                <input
                                                    value={faq.question}
                                                    onChange={(event) => handleUpdateFaq(idx, "question", event.target.value)}
                                                    placeholder="Enter question"
                                                    className="mb-3 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                                />
                                                <textarea
                                                    value={faq.answer}
                                                    onChange={(event) => handleUpdateFaq(idx, "answer", event.target.value)}
                                                    placeholder="Enter answer"
                                                    rows={3}
                                                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <aside className="space-y-4 bg-slate-50 px-5 py-5">
                                <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
                                    <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">Category</h3>
                                    <select
                                        value={formData.categoryId}
                                        onChange={(event) =>
                                            setFormData((prev) => ({ ...prev, categoryId: event.target.value }))
                                        }
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                    >
                                        <option value="">Select category</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Tags Section */}
                                <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                                    <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">Tags</h3>

                                    {/* Selected tags */}
                                    <div className="flex flex-wrap gap-2">
                                        {formData.tagIds.map(tagId => {
                                            const tag = allTags.find(t => t.id === tagId);
                                            return tag ? (
                                                <span
                                                    key={tagId}
                                                    className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700"
                                                >
                                                    {tag.tagName}
                                                    <button
                                                        onClick={() => handleRemoveTagFromBlog(tagId)}
                                                        className="ml-1 rounded-full hover:bg-blue-200 p-0.5"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </span>
                                            ) : null;
                                        })}
                                    </div>

                                    {/* Tag selector */}
                                    <div className="relative">
                                        <select
                                            value=""
                                            onChange={(event) => {
                                                const tagId = parseInt(event.target.value);
                                                if (tagId && !formData.tagIds.includes(tagId)) {
                                                    handleAddTagToBlog(tagId);
                                                }
                                            }}
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                        >
                                            <option value="">Select a tag to add...</option>
                                            {allTags
                                                .filter(tag => !formData.tagIds.includes(tag.id))
                                                .map(tag => (
                                                    <option key={tag.id} value={tag.id}>
                                                        {tag.tagName}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>

                                    <button
                                        onClick={() => setShowTagManager(true)}
                                        className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700"
                                    >
                                        + Manage all tags
                                    </button>
                                </div>

                                <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
                                    <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">SEO</h3>
                                    <input
                                        value={formData.slug}
                                        onChange={(event) => setFormData((prev) => ({ ...prev, slug: event.target.value }))}
                                        placeholder="Slug (auto-generated if empty)"
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                    />
                                    <input
                                        value={formData.metaTitle}
                                        onChange={(event) =>
                                            setFormData((prev) => ({ ...prev, metaTitle: event.target.value }))
                                        }
                                        placeholder="Meta title"
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                    />
                                    <textarea
                                        value={formData.metaDescription}
                                        onChange={(event) =>
                                            setFormData((prev) => ({ ...prev, metaDescription: event.target.value }))
                                        }
                                        rows={3}
                                        placeholder="Meta description"
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
                                    <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">Author</h3>
                                    <input
                                        value={formData.authorName}
                                        onChange={(event) =>
                                            setFormData((prev) => ({ ...prev, authorName: event.target.value }))
                                        }
                                        placeholder="Author name"
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                    />
                                    <textarea
                                        value={formData.authorDescription}
                                        onChange={(event) =>
                                            setFormData((prev) => ({ ...prev, authorDescription: event.target.value }))
                                        }
                                        rows={2}
                                        placeholder="Author description"
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                                    <h3 className="text-sm font-bold uppercase tracking-wide text-slate-600">Images</h3>
                                    <div>
                                        <p className="mb-1 text-xs font-semibold text-slate-500">Main image</p>
                                        {mainImagePreview && (
                                            <img
                                                src={mainImagePreview}
                                                alt="Main preview"
                                                className="mb-2 h-24 w-full rounded-lg object-cover"
                                            />
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(event) => {
                                                const file = event.target.files?.[0];
                                                if (!file) return;
                                                setMainImage(file);
                                                setMainImagePreview(URL.createObjectURL(file));
                                            }}
                                            className="w-full text-sm"
                                        />
                                    </div>
                                    <div>
                                        <p className="mb-1 text-xs font-semibold text-slate-500">Author photo</p>
                                        {authorPhotoPreview && (
                                            <img
                                                src={authorPhotoPreview}
                                                alt="Author preview"
                                                className="mb-2 h-16 w-16 rounded-full object-cover"
                                            />
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(event) => {
                                                const file = event.target.files?.[0];
                                                if (!file) return;
                                                setAuthorPhoto(file);
                                                setAuthorPhotoPreview(URL.createObjectURL(file));
                                            }}
                                            className="w-full text-sm"
                                        />
                                    </div>
                                </div>
                            </aside>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
                            <button
                                onClick={() => setShowEditor(false)}
                                className="rounded-lg border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveBlog}
                                disabled={saving}
                                className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {saving ? "Saving..." : (selectedBlog ? "Save Changes" : "Create Post")}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tag Management Modal - unchanged */}
          {showTagManager && (
  <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/45 p-3">

    <div className="w-full max-w-xl rounded-xl bg-white shadow-lg">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">

        <h3 className="text-lg font-semibold text-slate-900">
          Manage Tags
        </h3>

        <button
          onClick={() => {
            setShowTagManager(false);
            setNewTagName("");
            setEditingTag(null);
            setTagSearch("");
          }}
          className="rounded p-1.5 text-slate-500 hover:bg-slate-100"
        >
          <X size={16}/>
        </button>

      </div>


      <div className="p-4">

        {/* Add/Edit Tag */}

        <div className="mb-4 flex gap-2">

          <input
            type="text"
            value={newTagName}
            onChange={(e)=>setNewTagName(e.target.value)}
            placeholder={editingTag ? "Edit tag..." : "New tag..."}
            className="flex-1 rounded-md border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-blue-500"
          />


          {editingTag ? (

            <>
              <button
                onClick={handleUpdateTag}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Update
              </button>


              <button
                onClick={()=>{
                  setEditingTag(null);
                  setNewTagName("");
                }}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

            </>

          ) : (

            <button
              onClick={handleCreateTag}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Add
            </button>

          )}

        </div>


        {/* Search */}

        <div className="relative mb-3">

          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={tagSearch}
            onChange={(e)=>setTagSearch(e.target.value)}
            placeholder="Search..."
            className="w-full rounded-md border border-slate-200 py-1.5 pl-8 pr-3 text-sm outline-none focus:border-blue-500"
          />

        </div>


        {/* Tags List */}

        <div className="max-h-64 overflow-y-auto">

          {filteredTags.length===0 ? (

            <p className="text-center text-xs text-slate-500 py-6">
              No tags found
            </p>

          ) : (

            <div className="space-y-1">

              {filteredTags.map(tag=>(

                <div
                  key={tag.id}
                  className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 hover:bg-slate-50"
                >

                  <span className="text-sm font-medium">
                    {tag.tagName}
                  </span>


                  <div className="flex gap-1">

                    <button
                      onClick={()=>{
                        setEditingTag(tag);
                        setNewTagName(tag.tagName);
                      }}
                      className="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
                    >
                      Edit
                    </button>


                    <button
                      onClick={()=>handleDeleteTag(tag.id)}
                      className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

    </div>

  </div>
)}
            {/* Category Management Modal - SIMPLIFIED: only add, no edit/delete */}
            {showCategoryManager && (
                <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/45 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                            <h3 className="text-xl font-bold text-slate-900">Add Category</h3>
                            <button
                                onClick={() => {
                                    setShowCategoryManager(false);
                                    setNewCategoryName("");
                                    setNewCategoryDescription("");
                                    setCategoryImage(null);
                                    setCategoryImagePreview("");
                                }}
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Add Category Form - No edit/delete options */}
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="Category name"
                                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-blue-500"
                                />
                                <textarea
                                    value={newCategoryDescription}
                                    onChange={(e) => setNewCategoryDescription(e.target.value)}
                                    placeholder="Category description"
                                    rows={2}
                                    className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-blue-500"
                                />
                                <div>
                                    {categoryImagePreview && (
                                        <img
                                            src={categoryImagePreview}
                                            alt="Category preview"
                                            className="mb-2 h-20 w-20 rounded-lg object-cover"
                                        />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setCategoryImage(file);
                                                setCategoryImagePreview(URL.createObjectURL(file));
                                            }
                                        }}
                                        className="w-full text-sm"
                                    />
                                </div>
                                <button
                                    onClick={handleCreateCategory}
                                    className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                                >
                                    Add Category
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal - unchanged */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/45 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <h3 className="text-xl font-bold text-slate-900">Delete Blog?</h3>
                        <p className="mt-2 text-slate-600">
                            This will permanently delete <span className="font-semibold">{selectedBlog?.title}</span>.
                        </p>
                        <div className="mt-5 flex justify-end gap-2">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteBlog}
                                className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlogDashboard;