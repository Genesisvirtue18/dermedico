import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import api, { BASE_URL } from "../api/axiosConfig"; // Adjust path as needed

// Static fallback brands (optional)
const fallbackBrands = [
  "/public/brands/Cerave.webp",
  "/public/brands/Cetaphil.webp",
  "/public/brands/derm-logo.png",
  "/public/brands/Dot_Key.webp",
  "/public/brands/Foxtale.webp",
  "/public/brands/Minimalist.webp",
  "/public/brands/Olaplex.webp",
  "/public/brands/Plum.webp",
  "/public/brands/Reequil.webp",
  "/public/brands/Scalpe.webp",
  "/public/brands/Schwarzkopf.webp",
  "/public/brands/Sebamed_Baby.webp",
  "/public/brands/Sesderma.webp"
];

const PAGE_SIZE = 8;

export default function BrandShop() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
    const navigate = useNavigate();
  
  const desktopRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const response = await api.get("/products/getAllBrands");
        
        // Filter only active brands and transform data
        const activeBrands = response.data
          .filter(brand => brand.active === true)
          .map(brand => ({
            id: brand.id,
                slug: brand.slug,   // ⭐ IMPORTANT

            name: brand.name,
            // Use BASE_URL for relative image paths
            imageUrl: brand.imageUrl?.startsWith('/') 
              ? `${BASE_URL}${brand.imageUrl}`
              : brand.imageUrl,
          }));
        
        setBrands(activeBrands);
        setError(null);
      } catch (err) {
        console.error("Error fetching brands:", err);
        setError("Failed to load brands");
        // Use fallback data as image URLs
        setBrands(fallbackBrands.map((img, index) => ({
          id: index + 1,
          name: `Brand ${index + 1}`,
          imageUrl: img
        })));
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const pages = Math.ceil(brands.length / PAGE_SIZE);

  const scrollDesktop = (dir) => {
    desktopRef.current?.scrollBy({
      left: dir === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (pages <= 1) return; // Don't swipe if only one page
    
    const swipeDistance = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (swipeDistance > threshold && page < pages - 1) {
      setPage(page + 1);
    } else if (swipeDistance < -threshold && page > 0) {
      setPage(page - 1);
    }
  };

  if (loading) {
    return (
      <section className="brand-shop">
        <div className="brand-shop-inner">
          <h2>Shop by Brand</h2>
          <div className="desktop">
            <div className="desktop-list">
              {[...Array(8)].map((_, index) => (
                <div className="brand-card" key={index}>
                  <div className="w-full h-full bg-gray-200 animate-pulse rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error && brands.length === 0) {
    return (
      <section className="brand-shop">
        <div className="brand-shop-inner">
          <h2>Shop by Brand</h2>
          <div className="text-center py-8 text-gray-500">
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (brands.length === 0) {
    return (
      <section className="brand-shop">
        <div className="brand-shop-inner">
          <h2>Shop by Brand</h2>
          <div className="text-center py-8 text-gray-500">
            <p>No brands available</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <style>{`
        .brand-shop {
          background: #f6f7f8;
          padding: 60px 0;
        }

        .brand-shop-inner {
          max-width: 1500px;
          margin: 0 auto;
          padding: 0 60px;
        }

        .brand-shop h2 {
          font-size: 30px;
          font-weight: 500;
          margin-bottom: 40px;
          font-family: 'Poppins', sans-serif;
        }

        .brand-card {
          background: #fff;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 15px;
          transition: all 0.3s ease;
          cursor: pointer;
          border: 1px solid #f0f0f0;
        }

        .brand-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
          border-color: #ddd;
        }

        .brand-card img {
          max-width: 120px;
          max-height: 80px;
          object-fit: contain;
        }

        /* ================= DESKTOP ================= */
        .desktop {
          position: relative;
        }

        .desktop-list {
          display: flex;
          gap: 28px;
          overflow-x: auto;
          scroll-behavior: smooth;
        }

        .desktop-list::-webkit-scrollbar {
          display: none;
        }

        .desktop .brand-card {
          min-width: 145px;
          height: 110px;
        }

        .arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #fff;
          border: none;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          cursor: pointer;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #333;
          transition: all 0.3s ease;
        }

        .arrow:hover {
          background: #f5f5f5;
          transform: translateY(-50%) scale(1.05);
        }

        .arrow.left { left: -20px; }
        .arrow.right { right: -20px; }

        /* ================= MOBILE ================= */
        .mobile {
          display: none;
        }

        @media (max-width: 768px) {
          .brand-shop {
            padding: 40px 0;
          }

          .brand-shop-inner {
            padding: 0 16px;
          }

          .brand-shop h2 {
            font-size: 24px;
            margin-bottom: 30px;
          }

          .desktop {
            display: none;
          }

          .mobile {
            display: block;
          }

          .mobile-viewport {
            overflow: hidden;
            width: 100%;
          }

          .mobile-track {
            display: flex;
            width: ${pages * 100}%;
            transform: translateX(-${(100 / pages) * page}%);
            transition: transform 0.35s ease;
          }

          .mobile-page {
            width: ${100 / pages}%;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            grid-template-rows: repeat(2, 80px);
            gap: 12px;
            padding: 0 5px 10px;
          }

          .brand-card {
            height: 80px;
            padding: 10px;
          }

          .brand-card img {
            max-width: 90px;
            max-height: 60px;
          }

          .indicator {
            display: flex;
            justify-content: center;
            margin-top: 20px;
          }

          .indicator-track {
            width: 80px;
            height: 4px;
            background: #e5e5e5;
            border-radius: 8px;
            position: relative;
            overflow: hidden;
          }

          .indicator-thumb {
            width: ${80 / pages}px;
            height: 4px;
            background: #7c3aed;
            border-radius: 8px;
            position: absolute;
            left: ${(80 / pages) * page}px;
            transition: left 0.3s ease;
          }

          /* Hide indicators if only one page */
          .indicator[style*="display: none"] {
            display: none !important;
          }
        }

        /* Image error fallback */
        .brand-card img {
          filter: grayscale(0);
          transition: filter 0.3s ease;
        }

        .brand-card img:hover {
          filter: grayscale(0);
        }

        .brand-card img[src*="placeholder"] {
          filter: grayscale(1);
          opacity: 0.7;
        }
      `}</style>

      <section className="brand-shop poppins-regular">
        <div className="brand-shop-inner">
          <h2>Shop by Brand</h2>

          {/* ---------- DESKTOP ---------- */}
          <div className="desktop">
            {brands.length > 8 && (
              <>
                <button className="arrow left" onClick={() => scrollDesktop("left")}>
                  <FaChevronLeft />
                </button>
                <button className="arrow right" onClick={() => scrollDesktop("right")}>
                  <FaChevronRight />
                </button>
              </>
            )}

            <div className="desktop-list" ref={desktopRef}>
              {brands.map((brand) => (
                <div 
                  className="brand-card" 
                  key={brand.id}
                  onClick={() => {
  navigate(`/products/brand/${brand.slug}`, {
    state: { brandId: brand.id }
  });
}}
                  // onClick={() => {
                  //   // Optional: Navigate to brand products page
                  //   // navigate(`/brand/${brand.id}`);
                  //   //navigate(`/products/brand/${brand.id}`);
                    
                  // }}
                >
                  <img
                    src={brand.imageUrl}
                    alt={brand.name}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/120x80?text=Brand";
                      e.target.style.filter = "grayscale(1)";
                      e.target.style.opacity = "0.7";
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ---------- MOBILE ---------- */}
          {pages > 0 && (
            <div
              className="mobile"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="mobile-viewport">
                <div className="mobile-track">
                  {Array.from({ length: pages }).map((_, p) => (
                    <div className="mobile-page" key={p}>
                      {brands
                        .slice(p * PAGE_SIZE, p * PAGE_SIZE + PAGE_SIZE)
                        .map((brand) => (
                          <div 
                            className="brand-card" 
                            key={brand.id}
                            onClick={() => {
                              // Optional: Navigate to brand products page
                              // navigate(`/brand/${brand.id}`);
                            }}
                          >
                            <img
                              src={brand.imageUrl}
                              alt={brand.name}
                              onError={(e) => {
                                e.target.src = "https://via.placeholder.com/90x60?text=Brand";
                                e.target.style.filter = "grayscale(1)";
                                e.target.style.opacity = "0.7";
                              }}
                            />
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Show indicators only if more than one page */}
              {pages > 1 && (
                <div className="indicator">
                  <div className="indicator-track">
                    <div className="indicator-thumb" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}