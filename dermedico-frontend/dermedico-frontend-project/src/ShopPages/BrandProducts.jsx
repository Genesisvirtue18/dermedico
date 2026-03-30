import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCart } from "../Context/CartContext";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import api, { BASE_URL } from "../api/axiosConfig";
import SecureApi from "../api/api";
import { toast } from "react-toastify";
  import { useLocation } from "react-router-dom";


// Default images
import FacewashHero from "../assets/ShopByCategory/category.jpeg";
import Face1 from "../assets/ShopByCategory/category.jpeg";
import Face2 from "../assets/ShopByCategory/category.jpeg";

/* ================= MAIN ================= */
export default function Facewash() {
const { slug } = useParams();
  const { loadCart } = useCart();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();

  /* DATA */
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [brand, setBrand] = useState(null);
  const [allCategories, setAllCategories] = useState([]);
  const [allConcerns, setAllConcerns] = useState([]);
  const [globalBanner, setGlobalBanner] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState({
    initial: true,
    filter: false
  });
  const [error, setError] = useState(null);

  /* FILTER STATES */
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedConcerns, setSelectedConcerns] = useState([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [sortBy, setSortBy] = useState("featured");
  const { addToCart } = useCart();

const location = useLocation();

const brandId = location.state?.brandId;


  /* MOBILE FILTER DRAWER */
  const [filterOpen, setFilterOpen] = useState(false);


  /* ================= FETCH ALL DATA ================= */
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading({ initial: true, filter: false });
        setError(null);

        // Fetch brand details
        try {
          const brandResponse = await api.get(`/products/getBrandById/${brandId}`);
          setBrand(brandResponse.data);
        } catch (brandErr) {
          console.error("Failed to fetch brand details:", brandErr);
        }

        // Fetch global banner
try {

  const bannerResponse =
    await api.get("/banner/global");

  setGlobalBanner(bannerResponse.data);

} catch (err) {

  console.log("Banner not found");

}

        // Fetch all categories
        try {
          const categoriesResponse = await api.get("/products/getCategories");
          setAllCategories(categoriesResponse.data);
        } catch (categoriesErr) {
          console.error("Failed to fetch categories:", categoriesErr);
        }

        // Fetch all concerns
        try {
          const concernsResponse = await api.get("/products/getAllConcern");
          setAllConcerns(concernsResponse.data);
        } catch (concernsErr) {
          console.error("Failed to fetch concerns:", concernsErr);
        }

        // Fetch products by brand
        await fetchProductsWithFilter();

      } catch (err) {
        setError("An error occurred. Please try again.");
        toast.error("Failed to load products");
      } finally {
        setLoading({ initial: false, filter: false });
      }
    };

    if (brandId) {
      fetchAllData();
    } else {
      setError("No brand ID provided");
      setLoading({ initial: false, filter: false });
    }
  }, [brandId]);





    /* ================= FETCH PRODUCTS WITH FILTER ================= */
  const fetchProductsWithFilter = async () => {
    try {
      setLoading(prev => ({ ...prev, filter: true }));

      // Prepare filter parameters
      const params = new URLSearchParams();
      params.append('page', '0');
      params.append('size', '20');
      params.append('sortBy', 'createdAt');
      params.append('sortDirection', 'DESC');

      // Always filter by the main brand ID
      if (brandId) {
        params.append('brandId', brandId);
      }

      // Add categories filter if selected
      if (selectedCategories.length > 0) {
        // Use single categoryId parameter (not categoryIds)
        params.append('categoryId', selectedCategories[0]); // Backend expects single categoryId
      }

      // Add concerns filter if selected
      if (selectedConcerns.length > 0) {
        // Send multiple concerns as comma-separated values
        params.append('concernIds', selectedConcerns.join(','));
      }

      // Add price filter
      if (minPrice > 0) {
        params.append('minPrice', minPrice.toString());
      }
      if (maxPrice < 10000) {
        params.append('maxPrice', maxPrice.toString());
      }

      // Use the filter API
      const response = await api.get(`/products/filter?${params.toString()}`);

      const productsData = response.data.content || [];

      const transformed = productsData.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
          slug: p.slug,                // ✅ ADD THIS
  category: p.category?.name, 
        description: p.description,
        stockQuantity: p.stockQuantity || 0,
        brand: p.brand?.name || "Unknown Brand",
        image: p.mainImage ? `${BASE_URL}${p.mainImage}` : Face1,
        hoverImage: p.thumbnailImages ? `${BASE_URL}${p.thumbnailImages}` : Face2,
        category: p.category?.name,
        categoryId: p.category?.id,
        concerns: p.concerns?.map(c => ({ id: c.id, name: c.name })) || [],
        specifications: p.specifications,
        size: p.size || "N/A",
        active: p.active,
        trending: p.trending
      }));

      setProducts(transformed);
      setFilteredProducts(transformed);

    } catch (err) {
      console.error("Filter API error:", err);

      // Fallback: fetch by brand and filter client-side
      try {
        const fallbackResponse = await api.get(`/products/by-brand/${brandId}?page=0&size=20`);
        const productsData = fallbackResponse.data.content || [];

        // Apply client-side filtering
        let filteredData = productsData;

        // Filter by categories if selected
        if (selectedCategories.length > 0) {
          filteredData = filteredData.filter(product =>
            selectedCategories.includes(product.category?.id)
          );
        }

        // Filter by concerns if selected
        if (selectedConcerns.length > 0) {
          filteredData = filteredData.filter(product => {
            const productConcernIds = product.concerns?.map(c => c.id) || [];
            return selectedConcerns.some(concernId => productConcernIds.includes(concernId));
          });
        }

        // Filter by price range
        filteredData = filteredData.filter(product =>
          product.price >= minPrice && product.price <= maxPrice
        );

        const transformedFallback = filteredData.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          description: p.description,
          stockQuantity: p.stockQuantity || 0,
          brand: p.brand?.name || "Unknown Brand",
          image: p.mainImage ? `${BASE_URL}${p.mainImage}` : Face1,
          hoverImage: p.thumbnailImages ? `${BASE_URL}${p.thumbnailImages}` : Face2,
          category: p.category?.name,
          categoryId: p.category?.id,
          concerns: p.concerns?.map(c => ({ id: c.id, name: c.name })) || [],
          specifications: p.specifications,
          active: p.active,
          trending: p.trending
        }));

        setProducts(transformedFallback);
        setFilteredProducts(transformedFallback);
      } catch (fallbackErr) {
        console.error("Fallback API error:", fallbackErr);
        setProducts([]);
        setFilteredProducts([]);
        setError("Failed to load products. Please try again.");
      }
    } finally {
      setLoading(prev => ({ ...prev, filter: false }));
    }
  };

  /* ================= SEARCH ================= */
  useEffect(() => {
    if (search.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(search.toLowerCase())) ||
        (p.description && p.description.toLowerCase().includes(search.toLowerCase()))
      );
      setFilteredProducts(filtered);
    }
  }, [search, products]);

  /* ================= CLEAR ALL ================= */
  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedConcerns([]);
    setMinPrice(0);
    setMaxPrice(10000);
    setSortBy("featured");
    setSearch("");
    // Refetch products without filters
    fetchProductsWithFilter();
  };

  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleConcern = (concernId) => {
    setSelectedConcerns(prev =>
      prev.includes(concernId)
        ? prev.filter(id => id !== concernId)
        : [...prev, concernId]
    );
  };

  // Apply filters
  const applyFilters = () => {
    fetchProductsWithFilter();
    setFilterOpen(false); // Close mobile drawer
  };

  // Format price in Indian Rupees
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  // Handle product click to navigate to product details
const handleProductClick = (productSlug, category) => {

  
  const categorySlug =
    category?.name
      ? category.name.toLowerCase().replace(/\s+/g, '-')
      : "skin-care";

  navigate(`/product/${productSlug}/${categorySlug}/skincare`);

};




  //   const handleAddToCart = async (productId, e) => {
  //   e.stopPropagation();

  //   try {
  //     // ✅ Logged-in user: add directly
  //     await SecureApi.post("/cart/add", null, {
  //       params: { productId, quantity: 1 },
  //       withCredentials: true,
  //     });

  //     loadCart();
  //     toast.success("✅ Item added to cart!");
  //     return;

  //   } catch (error) {

  //     // ❌ User not logged in
  //     if (error.response?.status === 401 || error.response?.status === 403) {

  //       // 🧠 Save product so it survives refresh & login
  //       localStorage.setItem(
  //         "postLoginCheckoutItem",
  //         JSON.stringify({
  //           productId,
  //           quantity: 1,
  //           savedAt: Date.now(),
  //         })
  //       );

  //       toast.info("Please login to continue. Your Product is saved.", {
  //         autoClose: 2500,
  //       });

  //       setIsRedirecting(true);
  //       setTimeout(() => navigate("/login"), 1200);
  //       return;
  //     }

  //     toast.error("❌ Something went wrong!");
  //   }
  // };


  // Sort products based on selected option

  const handleAddToCart = async (product, e) => {
    e.stopPropagation();

    try {
      await addToCart(product, 1);
      toast.success("Item added to cart!");
    } catch (err) {
      toast.error("❌ Failed to add item");
    }
  };

  const getSortedProducts = (products) => {
    const sorted = [...products];

    switch (sortBy) {
      case "price_low":
        return sorted.sort((a, b) => a.price - b.price);
      case "price_high":
        return sorted.sort((a, b) => b.price - a.price);
      case "newest":
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case "featured":
      default:
        return sorted.sort((a, b) => {
          if (a.trending && !b.trending) return -1;
          if (!a.trending && b.trending) return 1;
          return 0;
        });
    }
  };

  const sortedProducts = getSortedProducts(filteredProducts);

  return (
    <div className="font-poppins">
      <Navbar />

      {/* ================= HERO ================= */}
      <div className="w-full bg-gray-100">
        <div className="relative w-full aspect-[16/7] sm:aspect-[16/6] md:aspect-[16/5]">
          {/* <img
            src={FacewashHero}
            alt="Brand Banner"
            className="absolute inset-0 w-full h-full object-cover"
          /> */}
{globalBanner && (

<img
  src={BASE_URL + globalBanner.image}
  alt="Brand Banner"
  className="absolute inset-0 w-full h-full object-cover"
/>

)}
        </div>
      </div>

      {/* Brand Info */}
      {brand && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">{brand.name}</h1>
              {brand.description && (
                <p className="text-gray-600 mt-2 max-w-3xl">{brand.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${brand.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                {brand.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading.initial ? (
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="flex flex-col justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1ba6a6] mb-4"></div>
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      ) : error ? (
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Error Loading Products
            </h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-[#1ba6a6] text-white rounded-full hover:bg-[#158787] transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* MOBILE FILTER BUTTON */}
          {products.length > 0 && (
            <div className="lg:hidden poppins-regular px-4 mt-4">
              <button
                onClick={() => setFilterOpen(true)}
                className="w-full py-2 rounded-lg border border-[#1ba6a6] text-[#1ba6a6] font-medium"
              >
                Filter & Sort {(selectedCategories.length > 0 || selectedConcerns.length > 0) ?
                  `(${selectedCategories.length + selectedConcerns.length})` : ''}
              </button>
            </div>
          )}

          {/* ================= CONTENT ================= */}
          <div className="max-w-7xl mx-auto poppins-regular px-4 py-10 flex gap-8">
            {/* ================= DESKTOP FILTER SIDEBAR ================= */}
            {products.length > 0 && (
              <aside className="hidden lg:block w-72 bg-gray-100 rounded-xl p-5 h-fit sticky top-24">
                <FilterHeader
                  onClear={clearFilters}
                  onApply={applyFilters}
                  loading={loading.filter}
                />

                {/* Categories Filter */}
                <FilterSection title="Categories">
                  {allCategories.length > 0 ? (
                    allCategories.slice(0, 10).map((category) => (
                      <Checkbox
                        key={category.id}
                        label={category.name}
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => toggleCategory(category.id)}
                      />
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">No categories available</p>
                  )}
                </FilterSection>

                {/* Concerns Filter */}
                <FilterSection title="Skin Concerns">
                  {allConcerns.slice(0, 8).map((concern) => (
                    <Checkbox
                      key={concern.id}
                      label={concern.name}
                      checked={selectedConcerns.includes(concern.id)}
                      onChange={() => toggleConcern(concern.id)}
                    />
                  ))}
                </FilterSection>

                {/* Price Filter */}
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Price Range</h4>
                  <div className="flex gap-3 mb-2">
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(Number(e.target.value))}
                      className="w-24 p-2 border rounded text-sm"
                      placeholder="Min"
                    />
                    <span className="self-center">to</span>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-24 p-2 border rounded text-sm"
                      placeholder="Max"
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-[#1ba6a6]"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>₹{minPrice}</span>
                    <span>₹{maxPrice}</span>
                  </div>
                </div>

                {/* Sort Options */}
                <div className="mt-6">
                  <h4 className="font-medium mb-2">Sort By</h4>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                  >
                    <option value="featured">Featured</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>

                {/* Apply Filters Button */}
                <button
                  onClick={applyFilters}
                  disabled={loading.filter}
                  className="mt-6 w-full py-2 rounded-lg bg-[#1ba6a6] text-white font-medium hover:bg-[#158787] transition-colors disabled:opacity-50"
                >
                  {loading.filter ? 'Applying...' : 'Apply Filters'}
                </button>
              </aside>
            )}

            {/* ================= PRODUCTS ================= */}
            <div className={`${products.length > 0 ? 'flex-1' : 'w-full'}`}>
              {/* Active Filters Display */}
              {(selectedCategories.length > 0 || selectedConcerns.length > 0 || minPrice > 0 || maxPrice < 10000) && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-medium">Active filters:</span>
                    {selectedCategories.map(categoryId => {
                      const category = allCategories.find(c => c.id === categoryId);
                      return category && (
                        <span key={categoryId} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center gap-1">
                          Category: {category.name}
                          <button onClick={() => toggleCategory(categoryId)} className="ml-1 text-blue-600 hover:text-blue-800">
                            ×
                          </button>
                        </span>
                      );
                    })}
                    {selectedConcerns.map(concernId => {
                      const concern = allConcerns.find(c => c.id === concernId);
                      return concern && (
                        <span key={concernId} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full flex items-center gap-1">
                          Concern: {concern.name}
                          <button onClick={() => toggleConcern(concernId)} className="ml-1 text-purple-600 hover:text-purple-800">
                            ×
                          </button>
                        </span>
                      );
                    })}
                    {(minPrice > 0 || maxPrice < 10000) && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center gap-1">
                        Price: ₹{minPrice} - ₹{maxPrice}
                        <button onClick={() => { setMinPrice(0); setMaxPrice(10000); }} className="ml-1 text-green-600 hover:text-green-800">
                          ×
                        </button>
                      </span>
                    )}
                    <button
                      onClick={clearFilters}
                      className="ml-auto text-sm text-[#1ba6a6] hover:text-[#158787]"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
              )}

              {/* No Products Message */}
              {products.length === 0 ? (
                <div className="text-center py-20">
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No Products Found
                  </h3>
                  <p className="text-gray-500 mb-4">
                    There are no products available for this brand yet.
                  </p>
                  <button
                    onClick={() => navigate('/')}
                    className="px-6 py-2 bg-[#1ba6a6] text-white rounded-full hover:bg-[#158787] transition-colors"
                  >
                    Browse All Products
                  </button>
                </div>
              ) : (
                <>
                  {/* TOP BAR */}
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mb-6">
                    <p className="text-sm text-gray-600">
                      Showing {sortedProducts.length} of {products.length} items
                      {brand?.name && ` for ${brand.name}`}
                    </p>

                    <div className="flex gap-3 w-full sm:w-auto">
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm w-full sm:w-56 font-poppins"
                      />

                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm font-poppins"
                      >
                        <option value="featured">Featured</option>
                        <option value="price_low">Price: Low to High</option>
                        <option value="price_high">Price: High to Low</option>
                        <option value="newest">Newest</option>
                      </select>
                    </div>
                  </div>

                  {/* Loading overlay for filtering */}
                  {loading.filter && (
                    <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1ba6a6]"></div>
                    </div>
                  )}

                  {/* GRID */}
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
                    {sortedProducts.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => handleProductClick(product.slug, product.category)}

                        className="
                          bg-gray-100 rounded-2xl
                          p-3 sm:p-4 md:p-5
                          min-h-auto md:min-h-[420px]
                          hover:-translate-y-1 hover:shadow-xl
                          transition
                          flex flex-col
                          cursor-pointer
                          relative
                        "
                      >
                        {/* Product Image */}
                       <div className="relative h-40 sm:h-48 md:h-56 flex justify-center items-center mb-4">
  <img
    src={product.image}
    alt={product.name}
    className="h-full w-full object-contain rounded-lg transition duration-300"
  />

  {/* Trending Badge */}
  {product.trending && (
    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
      Trending
    </div>
  )}
</div>

                        {/* Product Info */}
                        <div className="flex-1">
                          {product.brand && product.brand !== "Unknown Brand" && (
                            <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
                          )}

                          <h4 className="text-sm font-semibold text-gray-800 mb-2 line-clamp-2">
                            {product.name}
                          </h4>

                          {product.size && product.size !== "N/A" && (
                            <p className="text-xs text-gray-500 mb-1">Size: {product.size}</p>
                          )}


                          <p className="text-xs text-gray-600 mb-3 leading-snug line-clamp-2">
                            {product.description}
                          </p>

                          {/* Concerns Badges */}
                          {product.concerns && product.concerns.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {product.concerns.slice(0, 3).map((c) => (
                                <span key={c.id} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                                  {c.name}
                                </span>
                              ))}
                              {product.concerns.length > 3 && (
                                <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                                  +{product.concerns.length - 3} more
                                </span>
                              )}
                            </div>
                          )}

                          {/* Price Section */}
                          <div className="mt-auto">
                            <div className="flex gap-2 items-center mb-2">
                              <span className="font-semibold text-green-700">
                                {formatPrice(product.price)}
                              </span>
                            </div>

                            {/* Stock Status */}
                            <p className={`text-xs mb-3 ${product.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
                            </p>
                          </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          disabled={product.stockQuantity <= 0}
                          className={`
                            mt-2 w-full rounded-full py-2 text-sm font-medium
                            border border-[#1ba6a6] transition
                            ${product.stockQuantity <= 0
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'text-[#1ba6a6] hover:bg-[#1ba6a6] hover:text-white'
                            }
                          `}
                        >
                          {product.stockQuantity <= 0 ? 'Out of Stock' : 'Add To Cart'}
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* ================= MOBILE FILTER DRAWER ================= */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 font-poppins">
          <div className="absolute right-0 top-0 h-full w-[85%] bg-white p-5 overflow-y-auto">
            <button
              onClick={() => setFilterOpen(false)}
              className="absolute top-4 right-4 text-2xl text-gray-600 hover:text-black"
              aria-label="Close filters"
            >
              &times;
            </button>

            <FilterHeader
              onClear={clearFilters}
              onApply={applyFilters}
              loading={loading.filter}
            />

            {/* Categories Filter */}
            <FilterSection title="Categories">
              {allCategories.length > 0 ? (
                allCategories.slice(0, 10).map((category) => (
                  <Checkbox
                    key={category.id}
                    label={category.name}
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => toggleCategory(category.id)}
                  />
                ))
              ) : (
                <p className="text-gray-400 text-sm">No categories available</p>
              )}
            </FilterSection>

            {/* Concerns Filter */}
            <FilterSection title="Skin Concerns">
              {allConcerns.slice(0, 8).map((concern) => (
                <Checkbox
                  key={concern.id}
                  label={concern.name}
                  checked={selectedConcerns.includes(concern.id)}
                  onChange={() => toggleConcern(concern.id)}
                />
              ))}
            </FilterSection>

            {/* Price Filter */}
            <div className="mt-6">
              <h4 className="font-medium mb-2">Price Range</h4>
              <div className="flex gap-3 mb-2">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                  className="w-24 p-2 border rounded text-sm"
                  placeholder="Min"
                />
                <span className="self-center">to</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-24 p-2 border rounded text-sm"
                  placeholder="Max"
                />
              </div>
              <input
                type="range"
                min="0"
                max="10000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#1ba6a6]"
              />
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>₹{minPrice}</span>
                <span>₹{maxPrice}</span>
              </div>
            </div>

            {/* Sort Options */}
            <div className="mt-6">
              <h4 className="font-medium mb-2">Sort By</h4>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2 border rounded text-sm"
              >
                <option value="featured">Featured</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="newest">Newest</option>
              </select>
            </div>

            <button
              onClick={applyFilters}
              disabled={loading.filter}
              className="mt-6 w-full py-2 rounded-lg bg-[#1ba6a6] text-white font-medium hover:bg-[#158787] transition-colors disabled:opacity-50"
            >
              {loading.filter ? 'Applying...' : 'Apply Filters'}
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

/* ================= REUSABLE UI ================= */

function FilterHeader({ onClear, onApply, loading }) {
  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-semibold text-lg">Filters</h3>
      <div className="flex gap-2">
        <button onClick={onClear} className="text-sm text-[#1ba6a6] hover:text-[#158787]">
          Clear All
        </button>
      </div>
    </div>
  );
}

function FilterSection({ title, children }) {
  return (
    <div className="mb-6">
      <h4 className="font-medium mb-2">{title}</h4>
      {children}
    </div>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm mb-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-[#1ba6a6]"
      />
      {label}
    </label>
  );
}