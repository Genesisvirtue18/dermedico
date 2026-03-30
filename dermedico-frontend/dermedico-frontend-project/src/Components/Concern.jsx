import { useState, useRef, useEffect } from "react";
import { FaStar, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import api, { BASE_URL } from "../api/axiosConfig";
import SecureApi from "../api/api";
import { toast } from "react-toastify";
import { useCart } from "../Context/CartContext";

export default function Concern() {
  const [concerns, setConcerns] = useState([]);
  const [activeConcern, setActiveConcern] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [error, setError] = useState(null);
  const sliderRef = useRef(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();
  const { loadCart } = useCart();
    const { addToCart } = useCart();


  // Fetch all concerns on component mount
  useEffect(() => {
    const fetchConcerns = async () => {
      try {
        setLoading(true);
        const response = await api.get("/products/getAllConcern");
        
        const activeConcerns = response.data.filter(concern => concern.active === true);
        setConcerns(activeConcerns);
        
        if (activeConcerns.length > 0) {
          setActiveConcern(activeConcerns[0]);
        }
        
        setError(null);
      } catch (err) {
        console.error("Error fetching concerns:", err);
        setError("Failed to load concerns");
        setConcerns([]);
      } finally {
        setLoading(false);
      }
    };

    fetchConcerns();
  }, []);

  const handleProductClick = (productSlug, category) => {

  
  const categorySlug =
    category?.name
      ? category.name.toLowerCase().replace(/\s+/g, '-')
      : "skin-care";

  navigate(`/product/${productSlug}/${categorySlug}/skincare`);

};

// const handleAddToCart = async (productId, e) => {
//   if (e) {
//     e.stopPropagation(); // ✅ Prevent bubbling
//     e.preventDefault();  // ✅ Prevent Link navigation
//   }

//   try {
//     // ✅ Logged-in users: add directly
//     await SecureApi.post("/cart/add", null, {
//       params: { productId, quantity: 1 },
//       withCredentials: true,
//     });

//     loadCart(); // refresh navbar cart count
//     toast.success("✅ Item added to cart!");
//     return;

//   } catch (error) {
//     console.error("Add to Cart failed", error);

//     // ❌ Not logged in
//     if (error.response?.status === 401 || error.response?.status === 403) {

//       // 🧠 Save product for after login (survives refresh)
//       localStorage.setItem(
//         "postLoginCheckoutItem",
//         JSON.stringify({
//           productId,
//           quantity: 1,
//           savedAt: Date.now(),
//         })
//       );

//       toast.info("Please login to continue. Your product is saved.", {
//         autoClose: 2500,
//       });

//       setIsRedirecting(true); // optional loader
//       setTimeout(() => navigate("/login"), 1200);
//       return;
//     }

//     toast.error("❌ Something went wrong!");
//   }
// };

  // Fetch products when active concern changes
 
   const handleAddToCart = async (product, e) => {
    e.stopPropagation();

    try {
      await addToCart(product, 1);
      toast.success("Item added to cart!");
    } catch (err) {
      toast.error("❌ Failed to add item");
    }
  };

 
  useEffect(() => {
    if (!activeConcern) return;

    const fetchProductsByConcern = async () => {
      try {
        setLoadingProducts(true);
        const response = await api.get(`/products/by-concern/${activeConcern.id}`);
        setProducts(response.data.content || []);
        
        if (sliderRef.current) {
          sliderRef.current.scrollLeft = 0;
        }
      } catch (err) {
        console.error("Error fetching products by concern:", err);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProductsByConcern();
  }, [activeConcern]);

  // Scroll logic
  const scroll = (dir) => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollBy({
      left: dir === "left" ? -320 : 320,
      behavior: "smooth",
    });
  };

  // Format price with Indian locale
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <section className="concern-outer">
        <div className="concern-inner">
          <div className="badge">Find your match</div>
          <h2>Shop by Concern</h2>
          <div className="tabs">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="tab skeleton-tab"></div>
            ))}
          </div>
          <div className="products">
            {[...Array(5)].map((_, index) => (
              <div className="product-card" key={index}>
                <div className="img-wrap skeleton-img"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text short"></div>
                <div className="skeleton-btn"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error && concerns.length === 0) {
    return (
      <section className="concern-outer">
        <div className="concern-inner">
          <div className="text-center py-8 text-gray-500">
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (concerns.length === 0) {
    return (
      <section className="concern-outer">
        <div className="concern-inner">
          <div className="text-center py-8 text-gray-500">
            <p>No concerns available</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <style>{`
        /* WHITE GAP ABOVE */
        .concern-outer {
          background: #fff;
          padding: 80px 0;
          font-family: 'Poppins', sans-serif;
        }

        /* MINT CONTAINER */
        .concern-inner {
          max-width: 1300px;
          margin: 0 auto;
          padding: 40px;
          background: #eef8f6;
          border-radius: 28px;
        }

        .badge {
          background: #1aa6a6;
          color: #fff;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 14px;
          margin-bottom: 12px;
          display: inline-block;
          font-family: 'Poppins', sans-serif;
        }

        h2 {
          font-size: 32px;
          font-weight: 600;
          margin-bottom: 28px;
          font-family: 'Poppins', sans-serif;
          text-align: left; /* Changed from center to left */
        }

        /* TABS - LEFT ALIGNED */
        .tabs {
          display: flex;
          gap: 14px;
          margin-bottom: 34px;
          flex-wrap: wrap;
          justify-content: flex-start; /* Changed from center to flex-start */
        }

        .tab {
          padding: 10px 18px;
          border-radius: 10px;
          border: 1.5px solid #ddd;
          background: #fff;
          cursor: pointer;
          font-weight: 500;
          font-family: 'Poppins', sans-serif;
          transition: all 0.3s ease;
        }

        .tab:hover {
          border-color: #61a8c9;
          color: #61a8c9;
        }

        .tab.active {
          border-color: #61a8c9;
          color: #61a8c9;
          background: #f6f2ff;
        }

        /* PRODUCTS WRAPPER */
        .products-wrapper {
          position: relative;
        }

        .products-wrapper:hover .nav-arrow {
          opacity: 1;
          pointer-events: auto;
        }

        .products {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 24px;
        }

        /* For mobile scrolling */
        @media (max-width: 768px) {
          .products {
            display: flex;
            gap: 16px;
            overflow-x: auto;
            scroll-behavior: smooth;
            padding-bottom: 10px;
          }
          
          .products::-webkit-scrollbar {
            display: none;
          }
        }

        /* PRODUCT CARD */
        .product-card {
          position: relative;
          background: #fff;
          border-radius: 16px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          text-align: center;
        }

        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
        }

        .product-card-link {
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }

        /* SAVE BADGE */
        .save {
          position: absolute;
          top: 14px;
          right: 14px;
          background: #61a8c9;
          color: #fff;
          font-size: 12px;
          padding: 5px 10px;
          border-radius: 6px;
          font-weight: 600;
          z-index: 2;
        }

        /* IMAGE CONTAINER */
        .img-wrap {
          position: relative;
          width: 100%;
          height: 180px;
          margin-bottom: 12px;
          background: #f9f9f9;
          border-radius: 8px;
          overflow: hidden;
        }

        .img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: transform 0.4s ease;
        }

        .img-wrap:hover img {
          transform: scale(1.1);
        }

        /* TEXT - ALL CENTERED */
        .product-card h4 {
          font-size: 15px;
          font-weight: 600;
          margin-bottom: 6px;
          color: #333;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.3;
          min-height: 2.6em;
          text-align: center;
          width: 100%;
        }

        /* PRODUCT DESCRIPTION */
        .product-description {
          font-size: 13px;
          color: #666;
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.4;
          text-align: center;
          width: 100%;
        }

        .rating {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          font-size: 14px;
          margin-bottom: 8px;
          text-align: center;
        }

        .rating svg {
          color: #e0e0e0;
        }

        .rating .active {
          color: #ffc107;
        }

        .rating span {
          color: #000;
          margin-left: 6px;
          font-size: 13px;
        }

        .price {
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          text-align: center;
        }

        .old {
          color: #999;
          text-decoration: line-through;
          font-size: 14px;
        }

        .new {
          color: #1a8f2b;
          font-weight: 600;
          font-size: 16px;
        }

        .cta {
          margin-top: auto;
          width: 100%;
          padding: 6px;
          border-radius: 24px;
          border: 1.5px solid #61a8c9;
          background: transparent;
          color: #61a8c9;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Poppins', sans-serif;
          transition: all 0.3s ease;
          text-align: center;
        }

        .cta:hover {
          background: #61a8c9;
          color: #fff;
        }

        /* ARROWS */
        .nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: #fff;
          border: 1.5px solid #61a8c9;
          color: #61a8c9;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          pointer-events: none;
          transition: 0.3s;
          z-index: 5;
          cursor: pointer;
        }

        .nav-arrow:hover {
          background: #61a8c9;
          color: #fff;
        }

        .nav-arrow.left {
          left: -24px;
        }

        .nav-arrow.right {
          right: -24px;
        }

        /* MOBILE */
        @media (max-width: 768px) {
          .concern-outer {
            padding: 40px 0;
          }
          
          .concern-inner {
            padding: 20px;
            border-radius: 20px;
          }
          
          h2 {
            font-size: 24px;
            margin-bottom: 20px;
            text-align: left; /* Keep left aligned on mobile */
          }
          
          .tabs {
            gap: 8px;
            margin-bottom: 24px;
            justify-content: flex-start; /* Keep left aligned on mobile */
          }
          
          .tab {
            padding: 8px 12px;
            font-size: 14px;
          }
          
          .product-card {
            min-width: 48%;
          }
          
          .img-wrap {
            height: 150px;
          }
          
          .product-card h4 {
            font-size: 14px;
            margin-bottom: 4px;
          }
          
          .product-description {
            font-size: 12px;
            margin-bottom: 6px;
          }
          
          .nav-arrow {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .product-card h4 {
            font-size: 13px;
          }
          
          .product-description {
            font-size: 11px;
            line-height: 1.3;
          }
          
          .price .new {
            font-size: 14px;
          }
          
          .cta {
            font-size: 12px;
            padding: 4px;
          }
        }

        /* Loading skeletons */
        .skeleton-tab {
          width: 100px;
          height: 40px;
          background: #e0e0e0;
          border-radius: 10px;
          animation: pulse 1.5s infinite;
        }
        
        .skeleton-img {
          background: #e0e0e0;
          animation: pulse 1.5s infinite;
        }
        
        .skeleton-text {
          width: 100%;
          height: 16px;
          background: #e0e0e0;
          border-radius: 4px;
          margin-bottom: 8px;
          animation: pulse 1.5s infinite;
        }
        
        .skeleton-text.short {
          width: 60%;
        }
        
        .skeleton-btn {
          width: 100%;
          height: 36px;
          background: #e0e0e0;
          border-radius: 24px;
          margin-top: auto;
          animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      <section className="concern-outer poppins-regular">
        <div className="concern-inner">
          <span className="badge">Find your match</span>
          <h2>Shop by Concern</h2>

          <div className="tabs">
            {concerns.map((concern) => (
              <button
                key={concern.id}
                className={`tab ${activeConcern?.id === concern.id ? "active" : ""}`}
                onClick={() => setActiveConcern(concern)}
                disabled={loadingProducts}
              >
                {concern.name.charAt(0).toUpperCase() + concern.name.slice(1)}
              </button>
            ))}
          </div>

          <div className="products-wrapper">
            {products.length > 5 && (
              <>
                <button className="nav-arrow left" onClick={() => scroll("left")}>
                  <FaChevronLeft />
                </button>
                <button className="nav-arrow right" onClick={() => scroll("right")}>
                  <FaChevronRight />
                </button>
              </>
            )}

            {loadingProducts ? (
              <div className="products">
                {[...Array(5)].map((_, index) => (
                  <div className="product-card" key={index}>
                    <div className="img-wrap skeleton-img"></div>
                    <div className="skeleton-text"></div>
                    <div className="skeleton-text short"></div>
                    <div className="skeleton-btn"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No products found for this concern</p>
              </div>
            ) : (
              <div className="products" ref={sliderRef}>
                {products.map((product) => (
                  <div className="product-card"
                      onClick={() => handleProductClick(product.slug, product.category)}
                   key={product.id}>
                   
                      {product.price > 500 && (
                        <span className="save">SAVE ₹{(product.price * 0.1).toFixed(0)}</span>
                      )}

                      <div className="img-wrap">
                        <img
                          src={product.mainImage?.startsWith('/') 
                            ? `${BASE_URL}${product.mainImage}`
                            : product.mainImage || "https://via.placeholder.com/200x200?text=No+Image"
                          }
                          alt={product.name}
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/200x200?text=No+Image";
                          }}
                        />
                      </div>

                      <h4>{product.name}</h4>
                      
                      {/* PRODUCT DESCRIPTION - CENTERED */}
                      {product.description && (
                        <p className="product-description">
                          {product.description}
                        </p>
                      )}
                      
                      <div className="price">
                        <span className="new">{formatPrice(product.price)}</span>
                      </div>

                    <button 
                      className="cta"
                      onClick={(e) => handleAddToCart(product, e)}
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}