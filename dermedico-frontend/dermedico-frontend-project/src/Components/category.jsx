import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api, { BASE_URL } from "../api/axiosConfig"; // Adjust path as needed
import facewash from "../assets/Product/facewash-combo.png";

// Static fallback data (optional, for loading/error states)
const fallbackCategories = [
  {
    id: 1,
    name: "Facewash",
    image: facewash,
    slug: "facewash",
    bgColor: "bg-gradient-to-br from-blue-50 to-blue-100"
  },
  {
    id: 2,
    name: "Serum",
    image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=400&q=80",
    slug: "serum",
    bgColor: "bg-gradient-to-br from-purple-50 to-pink-100"
  },
];

export default function Categories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to get category slug from name
  const getSlugFromName = (name) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '');
  };

  // Function to assign a gradient color based on category
  const getCategoryColor = (index) => {
    const colors = [
      "bg-gradient-to-br from-blue-50 to-blue-100",
      "bg-gradient-to-br from-purple-50 to-pink-100",
      "bg-gradient-to-br from-green-50 to-emerald-100",
      "bg-gradient-to-br from-yellow-50 to-orange-100",
      "bg-gradient-to-br from-rose-50 to-red-100",
      "bg-gradient-to-br from-amber-50 to-yellow-100",
      "bg-gradient-to-br from-teal-50 to-cyan-100",
      "bg-gradient-to-br from-indigo-50 to-blue-100",
    ];
    return colors[index % colors.length];
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await api.get("/products/getCategories");

        // Transform API data to match component structure
        const transformedCategories = response.data.map((cat, index) => ({
          id: cat.id,
          name: cat.name,
          // Use BASE_URL for the image URL if it's a relative path
          image: cat.imageUrl?.startsWith('/')
            ? `${BASE_URL}${cat.imageUrl}`
            : cat.imageUrl || `https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=400&q=80`,
          slug: getSlugFromName(cat.name),
          bgColor: getCategoryColor(index),
          description: cat.description
        }));

        setCategories(transformedCategories);
        setError(null);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories");
        // Use fallback data if API fails
        setCategories(fallbackCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-white poppins-regular">
        <div className="max-w-7xl mx-auto px-4 md:py-10">
          <div className="mb-10 text-left">
            <h2 className="poppins-regular text-[30px] font-bold text-gray-900 mb-10">
              Shop by Category
            </h2>
            <p className="text-gray-600 max-w-2xl">
              Discover our premium skincare collections
            </p>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-4 md:gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="w-full aspect-square rounded-2xl bg-gray-200 animate-pulse"></div>
                <div className="mt-3 h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && categories.length === 0) {
    return (
      <div className="w-full bg-white poppins-regular">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to load categories</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white poppins-regular">
      <div className="max-w-7xl mx-auto px-4 md:py-10">
        {/* Header Section */}
        <div className="mb-10 text-left">
          <h2 className="poppins-regular text-[30px] font-bold text-gray-900 mb-10">
            Shop by Category
          </h2>
          <p className="text-gray-600 max-w-2xl">
            Discover our premium skincare collections tailored for your unique needs
          </p>
        </div>

        {/* Categories Grid */}
        <div
          className="
            grid 
            grid-cols-4
            sm:grid-cols-4
            md:grid-cols-4
            lg:grid-cols-8
            gap-4 
            md:gap-6
          "
        >
          {categories.map((cat, index) => (
            <button
              key={cat.id || index}
              onClick={() =>
               navigate(`/products/category/${cat.slug}`, {
  state: {
    categoryId: cat.id,
    categoryName: cat.name
  }
})
              }
              className="group flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2"
            >
              {/* Category Card */}
              <div
                className={`relative w-full aspect-square rounded-2xl ${cat.bgColor} flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-gray-200/50`}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-white"></div>
                  <div className="absolute bottom-4 right-4 w-6 h-6 rounded-full bg-white"></div>
                </div>

                {/* Product Image */}
                <div className="relative z-10 p-2 w-full h-full flex items-center justify-center">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="max-h-[95%] max-w-[95%] object-contain transition-all duration-500 group-hover:scale-110 group-hover:rotate-1"
                    onError={(e) => {
                      // Fallback image if the main image fails to load
                      e.target.src = "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=400&q=80";
                    }}
                  />
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>

                {/* Corner Accent */}
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Category Name */}
              <p className="mt-3 text-xs sm:text-sm md:text-base font-medium text-gray-900 transition-colors duration-300 group-hover:text-[#60A8CA]">
                {cat.name}
              </p>

              {/* View Button */}
              <div className="mt-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 hidden md:block">
                <span className="inline-flex items-center text-xs font-medium text-[#60A8CA]">
                  View Products
                  <svg
                    className="w-3 h-3 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}