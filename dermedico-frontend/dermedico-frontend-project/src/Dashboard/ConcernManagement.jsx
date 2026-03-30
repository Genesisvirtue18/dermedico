import React, { useState, useEffect } from 'react';
import api, { BASE_URL } from '../api/api';

const ConcernManagement = () => {
  const [concerns, setConcerns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingConcern, setEditingConcern] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    group: 'SKIN', // Default group
    description: '',
    active: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Concern groups for dropdown
  const concernGroups = [
    { value: 'SKIN', label: 'Skin Concern' },
    { value: 'HAIR', label: 'Hair Concern' },
    { value: 'SUPPLEMENT', label: 'Supplement Concern' }
  ];

  // Helper function to get full image URL
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    // If it's already a full URL (starts with http), return as-is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    // Otherwise, prepend BASE_URL
    return `${BASE_URL}${imagePath}`;
  };

  // Fetch all concerns
  const fetchConcerns = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/concerns');
      // Ensure active field is properly converted to boolean
      const concernsWithBooleanActive = response.data.map(concern => ({
        ...concern,
        active: Boolean(concern.active)
      }));
      setConcerns(concernsWithBooleanActive);
      setError('');
    } catch (err) {
      setError('Failed to fetch concerns');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConcerns();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create preview URL
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
      group: 'SKIN',
      description: '',
      active: true
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingConcern(null);
    setShowForm(false);
    setError('');
    setSuccess('');
  };

  // Create FormData for multipart/form-data
  const createFormData = () => {
    const formDataObj = new FormData();
    
    // Always append all fields for both create and update
    formDataObj.append('name', formData.name);
    formDataObj.append('group', formData.group);
    formDataObj.append('description', formData.description || '');
    formDataObj.append('active', formData.active.toString());
    
    if (imageFile) {
      formDataObj.append('image', imageFile);
    }
    
    return formDataObj;
  };

  // Create or update concern
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let response;
      const requestData = createFormData();
      
      if (editingConcern) {
        // Update existing concern
        console.log('Updating concern with ID:', editingConcern.id);
        console.log('Form data:', {
          name: formData.name,
          group: formData.group,
          description: formData.description,
          active: formData.active,
          hasImage: !!imageFile
        });
        
        response = await api.put(`/admin/concerns/${editingConcern.id}`, requestData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log('Update response:', response.data);
        setSuccess('Concern updated successfully!');
      } else {
        // Create new concern
        console.log('Creating new concern:', formData);
        response = await api.post('/admin/concerns', requestData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log('Create response:', response.data);
        setSuccess('Concern created successfully!');
      }

      fetchConcerns(); // Refresh list
      resetForm();
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error details:', err);
      console.error('Error response:', err.response);
      setError(err.response?.data?.message || err.response?.data?.error || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  // Edit concern
  const handleEditConcern = (concern) => {
    console.log('Editing concern:', concern);
    setEditingConcern(concern);
    setFormData({
      name: concern.name || '',
      group: concern.group || 'SKIN',
      description: concern.description || '',
      active: Boolean(concern.active) // Ensure it's a boolean
    });
    // Use getFullImageUrl for existing images
    const fullImageUrl = getFullImageUrl(concern.imageUrl);
    setImagePreview(fullImageUrl || null);
    setImageFile(null);
    setShowForm(true);
  };

  // Delete concern
  const handleDeleteConcern = async (id) => {
    if (!window.confirm('Are you sure you want to delete this concern?')) {
      return;
    }

    setLoading(true);
    try {
      await api.delete(`/admin/concerns/${id}`);
      setSuccess('Concern deleted successfully!');
      fetchConcerns(); // Refresh list
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete concern');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle concern status
  const toggleConcernStatus = async (concern) => {
    try {
      const formData = new FormData();
      formData.append('name', concern.name || '');
      formData.append('group', concern.group || 'SKIN');
      formData.append('description', concern.description || '');
      formData.append('active', (!Boolean(concern.active)).toString()); // Toggle boolean
      
      console.log('Toggling status for concern:', concern.id, 'New active:', !concern.active);
      
      const response = await api.put(`/admin/concerns/${concern.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Toggle response:', response.data);
      setSuccess(`Concern ${response.data.active ? 'activated' : 'deactivated'}!`);
      fetchConcerns();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Toggle error:', err);
      setError('Failed to update concern status');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Concern Management</h1>
          <p className="text-gray-600">Create, update, and manage skin, hair, and supplement concerns</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <span className="mr-2">+</span>
          {showForm ? 'Cancel' : 'Add New Concern'}
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

      {/* Concern Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingConcern ? `Edit Concern (ID: ${editingConcern.id})` : 'Create New Concern'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Concern Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="e.g., Acne, Dandruff, Vitamin Deficiency"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Concern Group *
                  </label>
                  <select
                    name="group"
                    value={formData.group}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  >
                    {concernGroups.map(group => (
                      <option key={group.value} value={group.value}>
                        {group.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded h-32"
                    placeholder="Describe the concern, symptoms, and recommended treatments..."
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
                    Active (Visible to users)
                  </label>
                </div>
              </div>

              {/* Right Column - Image Upload */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Concern Image
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      {imagePreview ? (
                        <div className="mb-4">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="mx-auto h-48 object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImageFile(null);
                              setImagePreview(null);
                            }}
                            className="mt-2 text-sm text-red-600 hover:text-red-800"
                          >
                            Remove Image
                          </button>
                        </div>
                      ) : (
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="image-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>Upload an image</span>
                          <input
                            id="image-upload"
                            name="image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 2MB
                      </p>
                    </div>
                  </div>
                </div>

                {editingConcern?.imageUrl && !imagePreview && (
                  <div className="text-sm text-gray-500">
                    <p>Current image:</p>
                    <div className="mt-2">
                      <img
                        src={getFullImageUrl(editingConcern.imageUrl)}
                        alt="Current"
                        className="h-32 object-cover rounded-md"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                        }}
                      />
                      <p className="mt-1 text-xs">
                        Upload new image to replace this one
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
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
                {loading ? 'Saving...' : editingConcern ? 'Update Concern' : 'Create Concern'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Concerns List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading && !showForm ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading concerns...</p>
          </div>
        ) : concerns.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No concerns found. Create your first concern!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Group
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
                {concerns.map((concern) => (
                  <tr key={concern.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      #{concern.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {concern.imageUrl ? (
                        <img
                          src={getFullImageUrl(concern.imageUrl)}
                          alt={concern.name}
                          className="h-10 w-10 object-cover rounded-full"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/placeholder.png";
                          }}
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-gray-500 text-xs">No Image</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {concern.name}
                      </div>
                      {concern.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {concern.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        concern.group === 'SKIN' ? 'bg-blue-100 text-blue-800' :
                        concern.group === 'HAIR' ? 'bg-purple-100 text-purple-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {concern.group || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        onClick={() => toggleConcernStatus(concern)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                          concern.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {concern.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleEditConcern(concern)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteConcern(concern.id)}
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
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Concerns</h3>
          <p className="text-3xl font-bold text-blue-600">{concerns.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Skin Concerns</h3>
          <p className="text-3xl font-bold text-blue-600">
            {concerns.filter(c => c.group === 'SKIN').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Hair Concerns</h3>
          <p className="text-3xl font-bold text-purple-600">
            {concerns.filter(c => c.group === 'HAIR').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Supplement Concerns</h3>
          <p className="text-3xl font-bold text-amber-600">
            {concerns.filter(c => c.group === 'SUPPLEMENT').length}
          </p>
        </div>
      </div>

      {/* Debug Info (Remove in production) */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Debug Info</h3>
        <pre className="text-xs bg-gray-800 text-gray-100 p-3 rounded overflow-auto">
          {JSON.stringify({
            concernsCount: concerns.length,
            editingConcern: editingConcern,
            formData: formData,
            showForm: showForm,
            loading: loading
          }, null, 2)}
        </pre>
      </div>

      {/* Quick Tips */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">💡 Tips for Managing Concerns</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Skin Concerns:</strong> Acne, Aging, Dryness, Oily Skin, Sensitivity, Dark Spots</li>
          <li>• <strong>Hair Concerns:</strong> Dandruff, Hair Loss, Dry Scalp, Frizz, Split Ends</li>
          <li>• <strong>Supplement Concerns:</strong> Vitamin Deficiency, Energy, Immunity, Hair Growth, Skin Health</li>
          <li>• Use descriptive images to help users identify concerns</li>
          <li>• Add detailed descriptions with symptoms and recommendations</li>
          <li>• Use "Inactive" to hide concerns without deleting them</li>
        </ul>
      </div>
    </div>
  );
};

export default ConcernManagement;