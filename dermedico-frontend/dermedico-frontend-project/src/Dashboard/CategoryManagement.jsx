import React, { useEffect, useState } from "react";
import api, { BASE_URL } from "../api/api";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const [image, setImage] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  /* ================= FETCH CATEGORIES ================= */
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* ================= HANDLE INPUT ================= */
  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= CREATE / UPDATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();

      data.append(
        "category",
        new Blob([JSON.stringify(form)], { type: "application/json" })
      );

      if (image) {
        data.append("image", image);
      }

      if (editingCategory) {
        await api.put(`/admin/categories/${editingCategory.id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/admin/categories", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      resetForm();
      fetchCategories();
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (cat) => {
    setEditingCategory(cat);
    setForm({
      name: cat.name,
      description: cat.description || "",
    });
    setImage(null);
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      await api.delete(`/admin/categories/${id}`);
      fetchCategories();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  /* ================= RESET ================= */
  const resetForm = () => {
    setForm({ name: "", description: "" });
    setImage(null);
    setEditingCategory(null);
  };

  /* ================= UI ================= */
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Category Management</h1>

      {/* ===== FORM ===== */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded shadow mb-8 max-w-lg"
      >
        <h2 className="font-semibold mb-4">
          {editingCategory ? "Edit Category" : "Create Category"}
        </h2>

        <div className="mb-3">
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleInput}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleInput}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium">Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>

        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            {editingCategory ? "Update" : "Create"}
          </button>

          {editingCategory && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* ===== LIST ===== */}
      <div className="bg-white rounded shadow">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">Image</th>
              <th className="p-3">Name</th>
              <th className="p-3">Description</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading &&
              categories.map((cat) => (
                <tr key={cat.id} className="border-t">
                  <td className="p-3">
                    {cat.imageUrl && (
                      <img
                        src={`${BASE_URL}${cat.imageUrl}`}
                        alt={cat.name}
                        className="h-12 w-12 object-cover rounded"
                      />
                    )}
                  </td>
                  <td className="p-3 font-medium">{cat.name}</td>
                  <td className="p-3">{cat.description}</td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => handleEdit(cat)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {!loading && categories.length === 0 && (
          <p className="p-4 text-center text-gray-500">
            No categories found
          </p>
        )}
      </div>
    </div>
  );
};

export default CategoryManagement;
