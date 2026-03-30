import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api, { BASE_URL } from '../api/api'; // Adjust the path accordingly

const BrandManagement = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    active: true,
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch all brands
  const fetchBrands = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/brands');
      setBrands(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch brands');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file
      });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      active: true,
      image: null
    });
    setImagePreview(null);
    setEditingBrand(null);
    setShowForm(false);
    setError('');
    setSuccess('');
  };

  // Create new brand
  const handleCreateBrand = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      
      // Create brand object
      const brandData = {
        name: formData.name,
        active: formData.active
      };
      
      formDataToSend.append('brand', new Blob([JSON.stringify(brandData)], {
        type: 'application/json'
      }));
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      let response;
      if (editingBrand) {
        // Update existing brand
        response = await api.put(`/admin/brands/${editingBrand.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setSuccess('Brand updated successfully!');
      } else {
        // Create new brand
        response = await api.post('/admin/brands', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setSuccess('Brand created successfully!');
      }

      fetchBrands(); // Refresh list
      resetForm();
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  // Edit brand
  const handleEditBrand = (brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      active: brand.active,
      image: null
    });
    
    if (brand.imageUrl) {
      setImagePreview(`${BASE_URL}${brand.imageUrl}`);
    } else {
      setImagePreview(null);
    }
    
    setShowForm(true);
  };

  // Delete brand
  const handleDeleteBrand = async (id) => {
    if (!window.confirm('Are you sure you want to delete this brand?')) {
      return;
    }

    setLoading(true);
    try {
      await api.delete(`/admin/brands/${id}`);
      setSuccess('Brand deleted successfully!');
      fetchBrands(); // Refresh list
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete brand');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle brand status
  const toggleBrandStatus = async (brand) => {
    try {
      const updatedBrand = {
        ...brand,
        active: !brand.active
      };
      
      const formDataToSend = new FormData();
      formDataToSend.append('brand', new Blob([JSON.stringify(updatedBrand)], {
        type: 'application/json'
      }));
      
      await api.put(`/admin/brands/${brand.id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccess(`Brand ${updatedBrand.active ? 'activated' : 'deactivated'}!`);
      fetchBrands();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update brand status');
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Brand Management</h1>
          <p className="text-gray-600">Create, update, and manage your brands</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <span className="mr-2">+</span>
          {showForm ? 'Cancel' : 'Add New Brand'}
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Brand Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingBrand ? 'Edit Brand' : 'Create New Brand'}
          </h2>
          <form onSubmit={handleCreateBrand}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Enter brand name"
                  required
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={formData.active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600"
                />
                <label htmlFor="active" className="ml-2 text-gray-700">
                  Active
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Logo
              </label>
              <div className="flex items-center space-x-4">
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload a logo for your brand (JPG, PNG, etc.)
                  </p>
                </div>
                
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-16 w-16 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingBrand ? 'Update Brand' : 'Create Brand'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Brands List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading && !showForm ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading brands...</p>
          </div>
        ) : brands.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No brands found. Create your first brand!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Logo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {brands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {brand.imageUrl ? (
                        <img
                          src={`${BASE_URL}${brand.imageUrl}`}
                          alt={brand.name}
                          className="h-10 w-10 object-cover rounded"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/40?text=Logo';
                          }}
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No logo</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {brand.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        onClick={() => toggleBrandStatus(brand)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                          brand.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {brand.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleEditBrand(brand)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBrand(brand.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Brands</h3>
          <p className="text-3xl font-bold text-blue-600">{brands.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Active Brands</h3>
          <p className="text-3xl font-bold text-green-600">
            {brands.filter(b => b.active).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Inactive Brands</h3>
          <p className="text-3xl font-bold text-red-600">
            {brands.filter(b => !b.active).length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BrandManagement;