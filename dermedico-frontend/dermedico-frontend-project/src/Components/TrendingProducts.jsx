import { useState, useEffect, useRef } from "react";
import { FaStar, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import api, { BASE_URL } from "../api/axiosConfig"; // Adjust path as needed
import SecureApi from "../api/api";
import { toast } from "react-toastify";
import { useCart } from "../Context/CartContext";

export default function TrendingProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sliderRef = useRef(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();
  const { loadCart } = useCart();
      const { addToCart } = useCart();


  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get("/products/trending");
        setProducts(response.data.content || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching trending products:", err);
        setError("Failed to load trending products");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingProducts();
  }, []);

  const scroll = (direction) => {
    if (!sliderRef.current) return;
    const scrollAmount = 300;
    sliderRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

const handleProductClick = (productSlug, category) => {

  
  const categorySlug =
    category?.name
      ? category.name.toLowerCase().replace(/\s+/g, '-')
      : "skin-care";

  navigate(`/product/${productSlug}/${categorySlug}/skincare`);

};



 
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
    const isMobile = window.innerWidth <= 480;
    if (!isMobile || !sliderRef.current || products.length === 0) return;

    const slider = sliderRef.current;

    const autoScroll = setInterval(() => {
      const cardWidth = slider.firstChild?.offsetWidth || 0;
      const gap = 20;
      const scrollAmount = cardWidth * 2 + gap * 2;

      if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 5) {
        slider.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        slider.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }, 3000);

    const stopAutoScroll = () => clearInterval(autoScroll);
    slider.addEventListener("touchstart", stopAutoScroll);

    return () => {
      clearInterval(autoScroll);
      slider.removeEventListener("touchstart", stopAutoScroll);
    };
  }, [products]);

  if (loading) {
    return (
      <section className="trending-products poppins-regular">
        <div className="trending-products-inner">
          <h2>Trending Products</h2>
          <div className="slider-wrapper">
            <div className="product-list" ref={sliderRef}>
              {[...Array(4)].map((_, index) => (
                <div className="product-card" key={index}>
                  <div className="img-box">
                    <div className="w-full h-full bg-gray-200 animate-pulse rounded"></div>
                  </div>
                  <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded mb-1"></div>
                  <div className="h-8 w-32 bg-gray-200 animate-pulse rounded mt-2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="trending-products poppins-regular">
        <div className="trending-products-inner">
          <h2>Trending Products</h2>
          <div className="text-center py-8 text-gray-500">
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="trending-products poppins-regular">
        <div className="trending-products-inner">
          <h2>Trending Products</h2>
          <div className="text-center py-8 text-gray-500">
            <p>No trending products found</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <style>{`
        .trending-products {
          padding: 50px 0;
          background: #fff;
          font-family: 'Poppins', sans-serif;
        }

        .trending-products-inner {
          max-width: 1300px;
          margin: 0 auto;
          padding: 0 30px;
        }

        .trending-products h2 {
          font-size: 30px;
          font-weight: 500;
          margin-bottom: 40px;
          font-family: 'Poppins', sans-serif;
        }

        .slider-wrapper {
          position: relative;
        }

        .product-list {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          scroll-behavior: smooth;
          padding-bottom: 10px;
        }

        .product-list::-webkit-scrollbar {
          display: none;
        }

        .product-card {
          min-width: 240px;
          max-width: 240px;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          position: relative;
        }

        .img-box {
          width: 180px;
          height: 180px;
          overflow: hidden;
          margin-bottom: 15px;
          background: #f9f9f9;
          border-radius: 8px;
        }

        .img-box img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: transform 0.4s ease;
        }

        .img-box:hover img {
          transform: scale(1.1);
        }

        .product-card h3 {
          font-size: 15.9px;
          font-weight: 600;
          text-align: center;
          margin: 0 auto 6px;
          max-width: 180px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.3;
          min-height: calc(1.3em * 3);
          color: #333;
        }

        .price-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-bottom: 15px;
        }

        .price-new {
          color: #1a8f2b;
          font-weight: 600;
          font-size: 16px;
        }

        .add-btn {
          margin-top: auto;
          border: 1.5px solid #61a8c9;
          background: transparent;
          color: #61a8c9;
          padding: 7px 24px;
          border-radius: 30px;
          cursor: pointer;
          font-weight: 500;
          transition: 0.3s ease;
          font-family: 'Poppins', sans-serif;
          font-size: 14px;
          z-index: 1;
          position: relative;
        }

        .add-btn:hover {
          background: #61a8c9;
          color: #fff;
        }

        .nav-btn {
          position: absolute;
          top: 45%;
          background: none;
          border: none;
          font-size: 22px;
          cursor: pointer;
          z-index: 2;
          color: #61a8c9;
          background: white;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .nav-btn:hover {
          background: #f5f5f5;
        }

        .nav-btn.left {
          left: -20px;
        }

        .nav-btn.right {
          right: -20px;
        }

        @media (max-width: 1280px) {
          .trending-products-inner {
            padding: 0 40px;
          }
          .product-card {
            min-width: 230px;
            max-width: 230px;
          }
        }

        @media (max-width: 1024px) {
          .product-list {
            gap: 36px;
          }
          .product-card {
            min-width: 220px;
            max-width: 220px;
          }
          .img-box {
            width: 165px;
            height: 165px;
          }
          .product-card h3 {
            font-size: 15px;
            margin-bottom: 5px;
          }
          .price-new {
            font-size: 15px;
          }
        }

        @media (max-width: 768px) {
          .trending-products-inner {
            padding: 0 30px;
          }
          .product-list {
            gap: 28px;
          }
          .product-card {
            min-width: 200px;
            max-width: 200px;
          }
          .img-box {
            width: 150px;
            height: 150px;
          }
          .product-card h3 {
            font-size: 14.5px;
            margin-bottom: 4px;
          }
          .price-new {
            font-size: 15px;
          }
        }

        @media (max-width: 480px) {
          .trending-products {
            padding: 40px 0;
          }
          .trending-products h2 {
            font-size: 22px;
            margin-bottom: 25px;
          }
          .trending-products-inner {
            padding: 0 16px;
          }
          .product-list {
            gap: 20px;
          }
          .product-card {
            min-width: 48%;
            max-width: 48%;
          }
          .img-box {
            width: 135px;
            height: 135px;
          }
          .product-card h3 {
            font-size: 13px;
            margin-bottom: 3px;
            line-height: 1.2;
            min-height: calc(1.2em * 3);
          }
          .price-new {
            font-size: 14px;
          }
          .add-btn {
            padding: 6px 16px;
            font-size: 12px;
          }
          .nav-btn {
            top: 40%;
            font-size: 20px;
            width: 36px;
            height: 36px;
          }
          .nav-btn.left {
            left: -10px;
          }
          .nav-btn.right {
            right: -10px;
          }
        }
      `}</style>

      <section className="trending-products poppins-regular">
        <div className="trending-products-inner">
          <h2>Trending Products</h2>

          <div className="slider-wrapper">
            {products.length > 4 && (
              <>
                <button className="nav-btn left" onClick={() => scroll("left")}>
                  <FaChevronLeft />
                </button>
                <button className="nav-btn right" onClick={() => scroll("right")}>
                  <FaChevronRight />
                </button>
              </>
            )}

            <div className="product-list" ref={sliderRef}>
              {products.map((product) => (
                <div 
                  className="product-card" 
                  key={product.id}
                  onClick={() => handleProductClick(product.slug, product.category)}

                >
                  <div className="img-box">
                    <img
                      src={product.mainImage?.startsWith('/') 
                        ? `${BASE_URL}${product.mainImage}`
                        : product.mainImage || "https://via.placeholder.com/180x180?text=No+Image"
                      }
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/180x180?text=No+Image";
                      }}
                    />
                  </div>

                  <h3>{product.name}</h3>
{product.description && (
  <h6 className="text-sm text-gray-700 line-clamp-2">
    {product.description}
  </h6>
)}

                  <div className="price-container">
                    <span className="price-new">₹ {product.price?.toLocaleString('en-IN') || "0"}</span>
                  </div>

                  <button
                    className="add-btn"
                      onClick={(e) => handleAddToCart(product, e)}
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}