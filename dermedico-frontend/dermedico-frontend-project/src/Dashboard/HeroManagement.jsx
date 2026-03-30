// src/components/Dashboard/HeroManagement.jsx
import React, { useState, useEffect } from "react";
import api, { BASE_URL } from "../api/api"; // Fixed import path
import { toast } from "react-hot-toast";

const HeroManagement = () => {
  const [heroes, setHeroes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // Fetch all heroes on component mount
  useEffect(() => {
    fetchHeroes();
  }, []);

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const fetchHeroes = async () => {
    try {
      setLoading(true);
      // Use the common api instance instead of axios directly
      const response = await api.get("/admin/hero");
      setHeroes(response.data);
    } catch (error) {
      console.error("Error fetching heroes:", error);
      toast.error("Failed to fetch heroes");
    } finally {
      setLoading(false);
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

      // Use the common api instance for upload
      const response = await api.post("/admin/hero/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Hero image uploaded successfully");
      
      // Reset form
      setSelectedFile(null);
      setPreviewUrl("");
      
      // Refresh the list
      fetchHeroes();
    } catch (error) {
      console.error("Error uploading hero:", error);
      toast.error(error.response?.data?.message || "Failed to upload hero image");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this hero image?")) {
      return;
    }

    try {
      // Use the common api instance for delete
      const response = await api.delete(`/admin/hero/${id}`);
      toast.success("Hero image deleted successfully");
      fetchHeroes();
    } catch (error) {
      console.error("Error deleting hero:", error);
      toast.error(error.response?.data?.message || "Failed to delete hero image");
    }
  };

  const cancelUpload = () => {
    setSelectedFile(null);
    setPreviewUrl("");
  };

  // Function to get the correct image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return "https://via.placeholder.com/400x200?text=No+Image";
    
    // If the path already starts with http, use it as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // If the path starts with /, just append to BASE_URL
    if (imagePath.startsWith('/')) {
      return `${BASE_URL}${imagePath}`;
    }
    
    // Otherwise, assume it's a relative path
    return `${BASE_URL}/${imagePath}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Hero Banner Management</h2>
      </div>

      {/* Upload Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm ">
        <h3 className="text-lg font-medium mb-4">Add New Hero Banner</h3>
        
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

          {/* Preview */}
          {previewUrl && (
            <div className="relative w-full max-w-md">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg "
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
                "Upload Hero Image"
              )}
            </button>
          )}
        </div>
      </div>

      {/* Heroes List */}
      <div className="bg-white p-6 rounded-lg shadow-sm ">
        <h3 className="text-lg font-medium mb-4">Current Hero Banners</h3>
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : heroes.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hero banners found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {heroes.map((hero) => (
              <div
                key={hero.id}
                className="relative group rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <img
                  src={getImageUrl(hero.image)}
                  alt={`Hero ${hero.id}`}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    console.error("Image failed to load:", hero.image);
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/400x200?text=Image+Not+Found";
                  }}
                />
                
                {/* Overlay with delete button */}
                <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                  <button
                    onClick={() => handleDelete(hero.id)}
                    className="opacity-0 group-hover:opacity-100 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-all transform group-hover:scale-100 scale-90"
                  >
                    Delete
                  </button>
                </div>
                
                {/* Image info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                  <p className="text-white text-sm">
                    ID: {hero.id}
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

export default HeroManagement;