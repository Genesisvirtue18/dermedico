import React, { useState, useEffect } from "react";
import api, { BASE_URL } from "../../src/api/api";
import "../Dashboard/ProductManagement.css";

const ProductsManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newStock, setNewStock] = useState(0);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [concerns, setConcerns] = useState([]);

  const [imagePreviews, setImagePreviews] = useState({
    mainImage: null,
    thumbnailImages: [],
    bannerImages: []
  });

  const [imageFiles, setImageFiles] = useState({
    mainImage: null,
    thumbnailImages: [],
    bannerImages: []
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
    size: "",
    type: "SINGLE",
    active: true,
    trending: false,
    topSeller: false,
    categoryId: "",
    brandId: "",
    concernIds: [],
    specifications: {
      detailedDescription: "",
      directionsForUse: "",
      features: "",
      benefits: "",
      ingredients: "",
      tags: "",
      skinType: ""
    }
  });

  useEffect(() => {
    fetchProducts();
    fetchLookups();
  }, [page]);

  const fetchLookups = async () => {
    try {
      const [catRes, brandRes, concernRes] = await Promise.all([
        api.get("/admin/categories"),
        api.get("/admin/brands"),
        api.get("/admin/concerns"),
      ]);

      setCategories(catRes.data);
      setBrands(brandRes.data);
      setConcerns(concernRes.data);
    } catch (err) {
      console.error("Failed to load lookup data", err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/products", {
        params: { page, size: 10, sortBy: "createdAt", sortDirection: "DESC" }
      });
      setProducts(response.data.content);
      setTotalPages(response.data.totalPages);
      setError("");
    } catch (err) {
      setError("Failed to fetch products");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const submitData = new FormData();

      // Create product data object with all required fields
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity || 0),
        size: formData.size,
        type: formData.type,
        active: formData.active,
        trending: formData.trending,
        topSeller: formData.topSeller,
        specifications: formData.specifications
      };

      // Append product data as JSON
      submitData.append("product", new Blob([JSON.stringify(productData)], { 
        type: "application/json" 
      }));

      // Append category and brand IDs
      if (formData.categoryId) {
        submitData.append("categoryId", formData.categoryId);
      }

      if (formData.brandId) {
        submitData.append("brandId", formData.brandId);
      }

      // Append concern IDs if any selected
      if (formData.concernIds.length > 0) {
        formData.concernIds.forEach(concernId => {
          submitData.append("concernIds", concernId);
        });
      }

      // Append images
      if (imageFiles.mainImage) {
        submitData.append("mainImage", imageFiles.mainImage);
      }

      if (imageFiles.thumbnailImages.length > 0) {
        imageFiles.thumbnailImages.forEach(file => {
          submitData.append("thumbnailImages", file);
        });
      }

      if (imageFiles.bannerImages.length > 0) {
        imageFiles.bannerImages.forEach(file => {
          submitData.append("bannerImages", file);
        });
      }

      let response;
      if (editingProduct) {
        // Update existing product
        response = await api.put(`/admin/products/${editingProduct.id}`, submitData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setSuccess("Product updated successfully!");
      } else {
        // Create new product
        response = await api.post("/admin/products", submitData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setSuccess("Product created successfully!");
      }

      closeModal();
      fetchProducts();
    } catch (err) {
      setError("Failed to save product: " + (err.response?.data?.message || err.message));
      console.error("Error saving product:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await api.delete(`/admin/products/${id}`);
      setSuccess("Product deleted successfully!");
      fetchProducts();
    } catch (err) {
      setError("Failed to delete product");
      console.error("Error deleting product:", err);
    }
  };

  const openStockModal = (product) => {
    setSelectedProduct(product);
    setNewStock(product.stockQuantity);
    setStockModalOpen(true);
  };

  const handleStockUpdate = async () => {
    try {
      await api.patch(`/admin/products/${selectedProduct.id}/stock?quantity=${newStock}`);
      setSuccess("Stock updated successfully!");
      setStockModalOpen(false);
      fetchProducts();
    } catch (err) {
      setError("Failed to update stock");
      console.error("Error updating stock:", err);
    }
  };

  const toggleProductStatus = async (product) => {
    try {
      const updatedProduct = {
        ...product,
        active: !product.active
      };

      const submitData = new FormData();
      submitData.append("product", new Blob([JSON.stringify(updatedProduct)], {
        type: "application/json"
      }));

      await api.put(`/admin/products/${product.id}`, submitData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setSuccess(`Product ${!product.active ? 'activated' : 'deactivated'} successfully!`);
      fetchProducts();
    } catch (err) {
      setError("Failed to update product status");
      console.error("Error updating product status:", err);
    }
  };

  const openModal = (product = null) => {
    setEditingProduct(product);

    if (product) {
      // Set form data from existing product
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        stockQuantity: product.stockQuantity || "",
        size: product.size || "",
        type: product.type || "SINGLE",
        active: product.active !== undefined ? product.active : true,
        trending: product.trending || false,
        topSeller: product.topSeller || false,
        categoryId: product.category?.id || "",
        brandId: product.brand?.id || "",
        concernIds: product.concerns?.map(c => c.id) || [],
        specifications: product.specifications || {
          detailedDescription: "",
          directionsForUse: "",
          features: "",
          benefits: "",
          ingredients: "",
          tags: "",
          skinType: ""
        }
      });

      // Set image previews using BASE_URL
      setImagePreviews({
        mainImage: product.mainImage ? `${BASE_URL}${product.mainImage}` : null,
        thumbnailImages: product.thumbnailImages
          ? product.thumbnailImages.split(",").map(img => `${BASE_URL}${img.trim()}`).filter(img => img)
          : [],
        bannerImages: product.bannerImages
          ? product.bannerImages.split(",").map(img => `${BASE_URL}${img.trim()}`).filter(img => img)
          : []
      });

      // Reset image files (no new uploads yet)
      setImageFiles({
        mainImage: null,
        thumbnailImages: [],
        bannerImages: []
      });
    } else {
      // Reset for new product
      setFormData({
        name: "",
        description: "",
        price: "",
        stockQuantity: "",
        size: "",
        type: "SINGLE",
        active: true,
        trending: false,
        topSeller: false,
        categoryId: "",
        brandId: "",
        concernIds: [],
        specifications: {
          detailedDescription: "",
          directionsForUse: "",
          features: "",
          benefits: "",
          ingredients: "",
          tags: "",
          skinType: ""
        }
      });
      setImagePreviews({
        mainImage: null,
        thumbnailImages: [],
        bannerImages: []
      });
      setImageFiles({
        mainImage: null,
        thumbnailImages: [],
        bannerImages: []
      });
    }

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
    setError("");
  };

  const handleInput = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("specifications.")) {
      const specField = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value
      }));
    }
  };

  const handleConcernToggle = (concernId) => {
    setFormData(prev => {
      const isSelected = prev.concernIds.includes(concernId);
      return {
        ...prev,
        concernIds: isSelected
          ? prev.concernIds.filter(id => id !== concernId)
          : [...prev.concernIds, concernId]
      };
    });
  };

  const handleImageUpload = (e, imageType) => {
    const files = Array.from(e.target.files);

    if (imageType === "mainImage") {
      const file = files[0];
      setImageFiles(prev => ({ ...prev, mainImage: file }));
      setImagePreviews(prev => ({
        ...prev,
        mainImage: URL.createObjectURL(file)
      }));
    } else {
      setImageFiles(prev => ({
        ...prev,
        [imageType]: [...prev[imageType], ...files]
      }));

      const previews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => ({
        ...prev,
        [imageType]: [...prev[imageType], ...previews]
      }));
    }
  };

  const removeImage = (imageType, index = null) => {
    if (imageType === "mainImage") {
      setImageFiles(prev => ({ ...prev, mainImage: null }));
      setImagePreviews(prev => ({ ...prev, mainImage: null }));
    } else {
      const updatedFiles = [...imageFiles[imageType]];
      const updatedPreviews = [...imagePreviews[imageType]];

      updatedFiles.splice(index, 1);
      updatedPreviews.splice(index, 1);

      setImageFiles(prev => ({ ...prev, [imageType]: updatedFiles }));
      setImagePreviews(prev => ({ ...prev, [imageType]: updatedPreviews }));
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="products-management">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Products Management</h1>
          <p>Manage your skincare products inventory</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => openModal()}
        >
          <span className="btn-icon">+</span>
          Add New Product
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span className="alert-icon">✅</span>
          {success}
        </div>
      )}

      {/* Products Table */}
      <div className="table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Details</th>
              <th>Category/Brand</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="product-row">
                <td className="product-cell">
                  <div className="product-info">
                    <div className="product-image">
                      {product.mainImage ? (
                        <img
                          src={`${BASE_URL}${product.mainImage}`}
                          alt={product.name}
                          className="product-img"
                        />
                      ) : (
                        <div className="image-placeholder">No Image</div>
                      )}
                    </div>
                    <div className="product-meta">
                      <span className="product-type">{product.type}</span>
                      {product.size && (
                        <span className="product-size">{product.size}</span>
                      )}
                    </div>
                  </div>
                </td>

                <td className="details-cell">
                  <h4 className="product-name">{product.name}</h4>
                  <p className="product-description">
                    {product.description?.substring(0, 80)}
                    {product.description?.length > 80 && "..."}
                  </p>
                  <div className="product-tags">
                    {product.trending && <span className="trending-tag">🔥 Trending</span>}
                    {product.topSeller && <span className="topseller-tag">⭐ Top Seller</span>}
                  </div>
                </td>

                <td className="category-cell">
                  <div className="category-info">
                    {product.category && (
                      <div className="category-badge">
                        {product.category.name}
                      </div>
                    )}
                    {product.brand && (
                      <div className="brand-badge">
                        {product.brand.name}
                      </div>
                    )}
                  </div>
                  {product.concerns && product.concerns.length > 0 && (
                    <div className="concerns-list">
                      {product.concerns.slice(0, 2).map(concern => (
                        <span key={concern.id} className="concern-tag">
                          {concern.name}
                        </span>
                      ))}
                      {product.concerns.length > 2 && (
                        <span className="concern-more">
                          +{product.concerns.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </td>

                <td className="price-cell">
                  <span className="price">₹{product.price}</span>
                </td>

                <td className="stock-cell">
                  <div className="stock-controls">
                    <span
                      className={`stock-badge ${product.stockQuantity > 10
                          ? "stock-high"
                          : product.stockQuantity > 0
                            ? "stock-medium"
                            : "stock-low"
                        }`}
                    >
                      {product.stockQuantity}
                    </span>
                    <button
                      onClick={() => openStockModal(product)}
                      className="stock-edit-btn"
                    >
                      Edit
                    </button>
                  </div>
                </td>

                <td className="status-cell">
                  <div className="status-toggle">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={product.active}
                        onChange={() => toggleProductStatus(product)}
                      />
                      <span className="slider"></span>
                    </label>
                    <span className="status-text">
                      {product.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </td>

                <td className="actions-cell">
                  <div className="action-buttons">
                    <button
                      onClick={() => openModal(product)}
                      className="btn-edit"
                    >
                      <span className="btn-icon">✏️</span>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="btn-delete"
                    >
                      <span className="btn-icon">🗑️</span>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No Products Found</h3>
            <p>Get started by adding your first product</p>
            <button
              className="btn-primary"
              onClick={() => openModal()}
            >
              Add Product
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            ← Previous
          </button>

          <div className="pagination-info">
            Page <strong>{page + 1}</strong> of <strong>{totalPages}</strong>
          </div>

          <button
            className="pagination-btn"
            disabled={page === totalPages - 1}
            onClick={() => setPage(page + 1)}
          >
            Next →
          </button>
        </div>
      )}

      {/* Product Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content large-modal">
            <div className="modal-header">
              <h2>{editingProduct ? "Edit Product" : "Add New Product"}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-grid">
                {/* Basic Information */}
                <div className="form-section">
                  <h3>Basic Information</h3>
                  
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInput}
                      required
                      placeholder="Enter product name"
                    />
                  </div>

                  <div className="form-group">
                    <label>Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInput}
                      required
                      rows="3"
                      placeholder="Enter product description"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Price (₹) *</label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInput}
                        required
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>

                    <div className="form-group">
                      <label>Stock Quantity *</label>
                      <input
                        type="number"
                        name="stockQuantity"
                        value={formData.stockQuantity}
                        onChange={handleInput}
                        required
                        min="0"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Size</label>
                      <input
                        type="text"
                        name="size"
                        value={formData.size}
                        onChange={handleInput}
                        placeholder="e.g., 50ml, 100g"
                      />
                    </div>

                    <div className="form-group">
                      <label>Product Type</label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInput}
                      >
                        <option value="SINGLE">Single</option>
                        <option value="COMBO">Combo</option>
                        <option value="GIFT">Gift</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          name="trending"
                          checked={formData.trending}
                          onChange={handleInput}
                        />
                        Trending Product
                      </label>
                    </div>

                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          name="topSeller"
                          checked={formData.topSeller}
                          onChange={handleInput}
                        />
                        Top Seller
                      </label>
                    </div>
                  </div>
                </div>

                {/* Category, Brand & Concerns */}
                <div className="form-section">
                  <h3>Category & Brand</h3>
                  
                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInput}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Brand</label>
                    <select
                      name="brandId"
                      value={formData.brandId}
                      onChange={handleInput}
                    >
                      <option value="">Select Brand</option>
                      {brands.map(brand => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Shop by Concern</label>
                    <div className="concerns-selector">
                      {concerns.map(concern => (
                        <div key={concern.id} className="concern-option">
                          <input
                            type="checkbox"
                            id={`concern-${concern.id}`}
                            checked={formData.concernIds.includes(concern.id)}
                            onChange={() => handleConcernToggle(concern.id)}
                          />
                          <label htmlFor={`concern-${concern.id}`}>
                            {concern.name}
                          </label>
                        </div>
                      ))}
                    </div>
                    <p className="selected-concerns">
                      Selected: {formData.concernIds.length} concerns
                    </p>
                  </div>
                </div>

                {/* Specifications */}
                <div className="form-section">
                  <h3>Specifications</h3>

                  <div className="form-group">
                    <label>Detailed Description</label>
                    <textarea
                      name="specifications.detailedDescription"
                      value={formData.specifications.detailedDescription}
                      onChange={handleInput}
                      rows="3"
                      placeholder="Detailed product description"
                    />
                  </div>

                  <div className="form-group">
                    <label>Directions for Use</label>
                    <textarea
                      name="specifications.directionsForUse"
                      value={formData.specifications.directionsForUse}
                      onChange={handleInput}
                      rows="2"
                      placeholder="How to use the product"
                    />
                  </div>

                  <div className="form-group">
                    <label>Features</label>
                    <textarea
                      name="specifications.features"
                      value={formData.specifications.features}
                      onChange={handleInput}
                      rows="2"
                      placeholder="Key features"
                    />
                  </div>

                  <div className="form-group">
                    <label>Benefits</label>
                    <textarea
                      name="specifications.benefits"
                      value={formData.specifications.benefits}
                      onChange={handleInput}
                      rows="2"
                      placeholder="Product benefits"
                    />
                  </div>

                  <div className="form-group">
                    <label>Ingredients</label>
                    <textarea
                      name="specifications.ingredients"
                      value={formData.specifications.ingredients}
                      onChange={handleInput}
                      rows="2"
                      placeholder="List of ingredients"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Skin Type</label>
                      <input
                        type="text"
                        name="specifications.skinType"
                        value={formData.specifications.skinType}
                        onChange={handleInput}
                        placeholder="e.g., Oily, Dry, Combination"
                      />
                    </div>

                    <div className="form-group">
                      <label>Tags (comma separated)</label>
                      <input
                        type="text"
                        name="specifications.tags"
                        value={formData.specifications.tags}
                        onChange={handleInput}
                        placeholder="tag1, tag2, tag3"
                      />
                    </div>
                  </div>
                </div>

                {/* Image Uploads */}
                <div className="form-section">
                  <h3>Product Images</h3>

                  <div className="form-group">
                    <label>Main Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "mainImage")}
                    />
                    {imagePreviews.mainImage && (
                      <div className="image-preview">
                        <img src={imagePreviews.mainImage} alt="Main preview" />
                        <button
                          type="button"
                          onClick={() => removeImage("mainImage")}
                          className="remove-image"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Thumbnail Images (Multiple)</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageUpload(e, "thumbnailImages")}
                    />
                    <div className="image-previews">
                      {imagePreviews.thumbnailImages.map((preview, index) => (
                        <div key={index} className="image-preview">
                          <img src={preview} alt={`Thumbnail ${index + 1}`} />
                          <button
                            type="button"
                            onClick={() => removeImage("thumbnailImages", index)}
                            className="remove-image"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Banner Images (Multiple)</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageUpload(e, "bannerImages")}
                    />
                    <div className="image-previews">
                      {imagePreviews.bannerImages.map((preview, index) => (
                        <div key={index} className="image-preview">
                          <img src={preview} alt={`Banner ${index + 1}`} />
                          <button
                            type="button"
                            onClick={() => removeImage("bannerImages", index)}
                            className="remove-image"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleInput}
                  />
                  <span className="checkmark"></span>
                  Active Product
                </label>

                <div className="action-buttons">
                  <button type="button" onClick={closeModal} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingProduct ? "Update Product" : "Create Product"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Update Modal */}
      {stockModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Update Stock - {selectedProduct?.name}</h3>
              <button className="modal-close" onClick={() => setStockModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Stock Quantity</label>
                <input
                  type="number"
                  value={newStock}
                  onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
            </div>
            <div className="modal-actions">
              <button
                onClick={() => setStockModalOpen(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleStockUpdate}
                className="btn-primary"
              >
                Update Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsManagement;