import React, { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import { useNavigate } from "react-router-dom";
import PublicApi, { BASE_URL } from "../api/axiosConfig";  
import { useCart } from "../Context/CartContext";
import api from "../api/api";
import { FaHeart } from "react-icons/fa";   
import { toast } from "react-toastify";
import Footer from "../Components/Footer";

export default function GiftingPage() {
  const [products, setProducts] = useState([]);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();
  const { loadCart } = useCart();

  useEffect(() => {
    fetchGiftProducts();
  }, []);

  const fetchGiftProducts = async () => {
    try {
      const res = await PublicApi.get(
        "/products/list?page=0&size=20&sortBy=createdAt&sortDirection=DESC"
      );

      const gifts = res.data.content.filter((item) => item.type === "GIFT");
      setProducts(gifts);
    } catch (err) {
      console.error("Error fetching gift products", err);
    }
  };

  // ✅ ADD TO CART
  const handleAddToCart = async (productId) => {
    try {
      await api.post("/cart/add", null, {
        params: { productId, quantity: 1 },
      });

      loadCart(); // ✅ refresh cart count on Navbar

      toast.success("✅ Item added to cart!");
    } catch (error) {
      console.error("Add to Cart failed", error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.warn("⚠️ Please login to continue!");
        
        setIsRedirecting(true); // ✅ show loader
        setTimeout(() => navigate("/login"), 1200);

        return;
      }

      toast.error("❌ Something went wrong!");
    }
  };

  // ✅ ADD TO WISHLIST
  const handleAddToWishlist = async (productId) => {
    try {
      await api.post(`/wishlist/add`, null, {
        params: { productId },
        withCredentials: true,
      });

      toast.success("❤️ Added to Wishlist!");
    } catch (error) {
      console.error("Wishlist add failed", error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.warn("⚠️ Please login to continue!");
        
        setIsRedirecting(true); // ✅ show loader
        setTimeout(() => navigate("/login"), 1200);

        return;
      }

      toast.error("❌ Failed to add to wishlist");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Loader Overlay */}
      {isRedirecting && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mb-4"></div>
            <p className="text-gray-700">Redirecting to login...</p>
          </div>
        </div>
      )}

      <Navbar />

      <div className="text-center mt-16">
        <h2 className="font-raleway font-light text-[40px] leading-[100%] text-[#111111]">
          GIFTING
        </h2>
      </div>

      <div className="max-w-6xl mx-auto mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 px-6 md:px-0">
        {products.map((product) => (
          <div key={product.id} className="text-center group relative">

            {/* ❤️ Wishlist Icon */}
            <FaHeart
              className="absolute top-3 right-3 z-10 text-gray-300 hover:text-red-500 cursor-pointer text-[22px] transition"
              onClick={() => handleAddToWishlist(product.id)}
            />

            {/* ⭐ IMAGE - Click to navigate */}
            <img
              src={`${BASE_URL}${product.mainImage}`}
              alt={product.name}
              className="w-full h-[350px] object-cover transition-transform duration-300 group-hover:scale-105"
            />

            <div className="mt-2 space-y-1 mb-8">
              <p
                className="poppins-regular font-medium text-[16px] text-[#3A3939] cursor-pointer"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                {product.name}
              </p>

              <p className="text-[#1E1E1E] poppins-regular font-semibold text-[16px]">
                ₹{product.price}
              </p>

              {/* ✅ Add to Cart */}
              <button
                onClick={() => handleAddToCart(product.id)}
                className="mt-1 poppins-regular border border-[#000000] px-5 py-2 text-sm uppercase tracking-wide hover:bg-black hover:text-white transition"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
}