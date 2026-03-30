// src/components/Dashboard/BannerManagement.jsx
import React, { useState, useEffect } from "react";
import api, { BASE_URL } from "../api/api";
import { toast } from "react-hot-toast";

const BannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showOnAllPages, setShowOnAllPages] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [globalBanner, setGlobalBanner] = useState(null);

  // Fetch all banners on component mount
  useEffect(() => {
    fetchBanners();
    fetchGlobalBanner();
  }, []);

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/banner");
      setBanners(response.data);
    } catch (error) {
      console.error("Error fetching banners:", error);
      toast.error("Failed to fetch banners");
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalBanner = async () => {
    try {
      const response = await api.get("/admin/banner/global");
      setGlobalBanner(response.data);
    } catch (error) {
      console.error("Error fetching global banner:", error);
      // Don't show error toast for global banner as it might be 404 if none exists
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select an image");
      return;
    }

    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("showOnAllPages", showOnAllPages);

      const response = await api.post("/admin/banner/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Banner uploaded successfully");
      
      // Reset form
      setSelectedFile(null);
      setShowOnAllPages(false);
      setPreviewUrl("");
      
      // Refresh the lists
      fetchBanners();
      fetchGlobalBanner();
    } catch (error) {
      console.error("Error uploading banner:", error);
      toast.error(error.response?.data?.message || "Failed to upload banner");
    } finally {
      setUploading(false);
    }
  };

  const handleToggleGlobal = async (id) => {
    try {
      const response = await api.put(`/admin/banner/toggle/${id}`);
      toast.success("Banner global status updated");
      fetchBanners();
      fetchGlobalBanner();
    } catch (error) {
      console.error("Error toggling banner:", error);
      toast.error(error.response?.data?.message || "Failed to toggle banner");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) {
      return;
    }

    try {
      const response = await api.delete(`/admin/banner/${id}`);
      toast.success("Banner deleted successfully");
      fetchBanners();
      fetchGlobalBanner();
    } catch (error) {
      console.error("Error deleting banner:", error);
      toast.error(error.response?.data?.message || "Failed to delete banner");
    }
  };

  const cancelUpload = () => {
    setSelectedFile(null);
    setShowOnAllPages(false);
    setPreviewUrl("");
  };

  // Function to get the correct image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/400x200?text=No+Image";
    
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    if (imagePath.startsWith('/')) {
      return `${BASE_URL}${imagePath}`;
    }
    
    return `${BASE_URL}/${imagePath}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Banner Management</h2>
      </div>

      {/* Global Banner Info */}
      {globalBanner && (
        <div className="bg-blue-50  border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-blue-800">Global Banner Active</h3>
              <p className="text-sm text-blue-600">
                This banner is currently showing on all pages
              </p>
            </div>
            <div className="w-20 h-20 overflow-hidden rounded">
              <img
                src={getImageUrl(globalBanner.image)}
                alt="Global Banner"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/400x200?text=Image+Error";
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-4">Add New Banner</h3>
        
        <div className="space-y-4">
          {/* File Input */}
          <div className="flex items-center space-x-4">
            <label className="relative cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
              <div className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                Choose Image
              </div>
            </label>
            
            {selectedFile && (
              <span className="text-sm text-gray-600">
                Selected: {selectedFile.name}
              </span>
            )}
          </div>

          {/* Show on all pages checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showOnAllPages"
              checked={showOnAllPages}
              onChange={(e) => setShowOnAllPages(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="showOnAllPages" className="text-sm text-gray-700">
              Show on all pages (Global Banner)
            </label>
          </div>

          {/* Preview */}
          {previewUrl && (
            <div className="relative w-full max-w-md">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                onClick={cancelUpload}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                title="Cancel"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Upload Button */}
          {selectedFile && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </span>
              ) : (
                "Upload Banner"
              )}
            </button>
          )}
        </div>
      </div>

      {/* Banners List */}
      <div className="bg-white p-6 rounded-lg shadow-sm ">
        <h3 className="text-lg font-medium mb-4">All Banners</h3>
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : banners.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No banners found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="relative group rounded-lg overflow-hidden  hover:shadow-lg transition-shadow"
              >
                <img
                  src={getImageUrl(banner.image)}
                  alt={`Banner ${banner.id}`}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/400x200?text=Image+Error";
                  }}
                />
                
                {/* Status badges */}
                <div className="absolute top-2 left-2 space-x-2">
                  {banner.showOnAllPages && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      Global
                    </span>
                  )}
                  {banner.active ? (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                      Active
                    </span>
                  ) : (
                    <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded">
                      Inactive
                    </span>
                  )}
                </div>
                
                {/* Overlay with action buttons */}
                <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center space-x-2">
                  {!banner.showOnAllPages && (
                    <button
                      onClick={() => handleToggleGlobal(banner.id)}
                      className="opacity-0 group-hover:opacity-100 bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition-all transform group-hover:scale-100 scale-90 text-sm"
                    >
                      Make Global
                    </button>
                  )}
                  {banner.showOnAllPages && (
                    <button
                      onClick={() => handleToggleGlobal(banner.id)}
                      className="opacity-0 group-hover:opacity-100 bg-yellow-500 text-white px-3 py-2 rounded-md hover:bg-yellow-600 transition-all transform group-hover:scale-100 scale-90 text-sm"
                    >
                      Remove Global
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="opacity-0 group-hover:opacity-100 bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 transition-all transform group-hover:scale-100 scale-90 text-sm"
                  >
                    Delete
                  </button>
                </div>
                
                {/* Image info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                  <p className="text-white text-sm">
                    ID: {banner.id}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerManagement;