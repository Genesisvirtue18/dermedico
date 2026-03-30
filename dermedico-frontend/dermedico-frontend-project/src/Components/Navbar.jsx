import { useState, useEffect } from "react";
import {
  FaChevronDown,
  FaSearch,
  FaUser,
  FaShoppingCart,
  FaVideo,
  FaTimes,
  FaBars,
  FaPlus,
  FaMinus,
  FaFacebookF,
  FaWhatsapp,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
  FaPhoneAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import logo from "/public/derm-logo.png";
import Secureapi from "../api/api"; // For secure API calls (cart, auth)
import api, { BASE_URL } from "../api/axiosConfig"; // For public API calls (concerns, brands)
import { useCart } from "../Context/CartContext";

const OFFERS = [
  "Flat ₹125 OFF above ₹2999! Use CLK125",
  "Get Derma Consult NOW @ ₹249 (Was ₹499)",
];

/* ================= MEGA DATA ================= */
const DEFAULT_MEGA_MENU_DATA = {
  SKIN: {
    image: "/images/skin-default.jpg",
    title: "Skin Concerns",
    description: "Comprehensive dermatologist-backed solutions for all your skin concerns",
    concerns: []
  },
  HAIR: {
    image: "/images/hair-default.jpg",
    title: "Hair Concerns",
    description: "Specialized treatments for hair fall, scalp issues, and hair care",
    concerns: []
  },
  SUPPLEMENT: {
    image: "/images/supplement-default.jpg",
    title: "Supplement Concerns",
    description: "Clinically curated supplements for complete wellness and nutrition",
    concerns: []
  }
};

const MORE_ITEMS = [
  // { label: "About Us", path: "/about" },
  { label: "Blog", path: "/blogs" },
  { label: "FAQs", path: "/faqs" },
  { label: "Contact Us", path: "/contact" },
];

export default function Navbar() {
  const [openMenu, setOpenMenu] = useState(null);
  const [activeConcern, setActiveConcern] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(null);
  const [offerIndex, setOfferIndex] = useState(0);
  const [isProfileDropdown, setIsProfileDropdown] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [dropdownTimeout, setDropdownTimeout] = useState(null);

  // New state for dynamic concerns and brands
  const [concernGroups, setConcernGroups] = useState([]);
  const [concernData, setConcernData] = useState(DEFAULT_MEGA_MENU_DATA);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState({
    brands: false,
    concerns: false
  });

  // ✅ Use cart context - getting cartItems, isAuthenticated, and loadCart
  const { cartItems, isAuthenticated, loadCart, logout } = useCart();


  const isMegaOpen = Boolean(openMenu && concernGroups.includes(openMenu));

  /* Rotate mobile offer */
  useEffect(() => {
    const t = setInterval(
      () => setOfferIndex((p) => (p + 1) % OFFERS.length),
      3000
    );
    return () => clearInterval(t);
  }, []);

  // Fetch concern groups and brands on component mount
  useEffect(() => {
    fetchConcernGroups();
    fetchAllBrands();
  }, []);

  // ✅ Load cart on component mount - CartContext handles authentication check
  useEffect(() => {
    loadCart();
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 768;
      setIsDesktop(desktop);

      if (desktop && mobileMenu) {
        setMobileMenu(false);
      }

      if (desktop && searchOpen) {
        setSearchOpen(false);
      }

      if (desktop && isProfileDropdown) {
        setIsProfileDropdown(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileMenu, searchOpen, isProfileDropdown]);

  // Fetch all brands from API (public call)
  const fetchAllBrands = async () => {
    try {
      setLoading(prev => ({ ...prev, brands: true }));
      const response = await api.get("/products/getAllBrands");
      // console.log("Brands fetched:", response.data);
      setBrands(response.data);
    } catch (error) {
      console.error("Failed to fetch brands:", error);
      setBrands([]);
    } finally {
      setLoading(prev => ({ ...prev, brands: false }));
    }
  };

  // Fetch concern groups (public API call)
  const fetchConcernGroups = async () => {
    try {
      setLoading(prev => ({ ...prev, concerns: true }));
      const response = await api.get("/products/concerns/groups");
      setConcernGroups(response.data);

      // Initialize data for each group
      const initialData = { ...DEFAULT_MEGA_MENU_DATA };
      response.data.forEach(group => {
        initialData[group] = {
          image: DEFAULT_MEGA_MENU_DATA[group]?.image || "/images/default.jpg",
          title: `${group.charAt(0) + group.slice(1).toLowerCase()} Concerns`,
          description: DEFAULT_MEGA_MENU_DATA[group]?.description || `Browse ${group.toLowerCase()} concerns`,
          concerns: []
        };
      });
      setConcernData(initialData);
    } catch (error) {
      console.error("Failed to fetch concern groups:", error);
    } finally {
      setLoading(prev => ({ ...prev, concerns: false }));
    }
  };

  // Fetch concerns for a specific group (public API call)
  const fetchConcernsByGroup = async (group) => {
    if (!group || concernData[group]?.concerns?.length > 0) return;

    try {
      const response = await api.get(`/products/concerns/group/${group}`);
      if (response.data && response.data.length > 0) {
        // Update concern data
        setConcernData(prev => ({
          ...prev,
          [group]: {
            ...prev[group],
            concerns: response.data.map(concern => concern.name),
            activeConcerns: response.data // Store full data for display
          }
        }));

        // If no random concern selected yet, pick one
        if (!concernData[group]?.selectedConcern) {
          const randomIndex = Math.floor(Math.random() * response.data.length);
          setConcernData(prev => ({
            ...prev,
            [group]: {
              ...prev[group],
              selectedConcern: response.data[randomIndex]
            }
          }));
        }
      }
    } catch (error) {
      console.error(`Failed to fetch ${group} concerns:`, error);
    }
  };

  // Handle dropdown hover
  const handleMouseEnter = (menu) => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
    }

    setOpenMenu(menu);

    // Fetch concerns if not already loaded
    if (concernGroups.includes(menu)) {
      fetchConcernsByGroup(menu);
    }
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setOpenMenu(null);
    }, 200);
    setDropdownTimeout(timeout);
  };

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeout) {
        clearTimeout(dropdownTimeout);
      }
    };
  }, [dropdownTimeout]);

  // ✅ CORRECT LOGOUT HANDLER
  // const handleLogout = async () => {
  //   try {
  //     await Secureapi.post("/auth/logout", null, {
  //       withCredentials: true,
  //     });

  //     // ✅ Clear local storage (guest cart) and reload cart
  //     localStorage.removeItem("cart");
  //     loadCart(); // This will reload guest cart from localStorage

  //     // Close profile dropdown
  //     setIsProfileDropdown(false);
  //   } catch (err) {
  //     console.error("Logout failed", err);
  //   }
  // };


  const handleLogout = async () => {
    await logout();
    setIsProfileDropdown(false);
  };


  // Get full image URL using BASE_URL from axiosConfig
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return "/images/default-concern.jpg";

    // Full URL already
    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    // Ensure /uploads is present
    if (imagePath.startsWith("/uploads")) {
      return `${BASE_URL}${imagePath}`;
    }

    const finalUrl = `${BASE_URL}/uploads${imagePath}`;

    return finalUrl;
  };

  // Handle concern hover in mega menu
  const handleConcernHover = (index) => {
    setActiveConcern(index);
    if (openMenu && concernData[openMenu]?.activeConcerns?.[index]) {
      setConcernData(prev => ({
        ...prev,
        [openMenu]: {
          ...prev[openMenu],
          selectedConcern: prev[openMenu].activeConcerns[index]
        }
      }));
    }
  };

  // Get random concern from group
  const getRandomConcern = (group) => {
    if (!group || !concernData[group]?.activeConcerns?.length) return null;
    const concerns = concernData[group].activeConcerns;
    const randomIndex = Math.floor(Math.random() * concerns.length);
    return concerns[randomIndex];
  };

  // Update random concern when group is hovered
  useEffect(() => {
    if (isMegaOpen && concernData[openMenu]?.activeConcerns?.length > 0) {
      const randomConcern = getRandomConcern(openMenu);
      if (randomConcern) {
        setConcernData(prev => ({
          ...prev,
          [openMenu]: {
            ...prev[openMenu],
            selectedConcern: randomConcern
          }
        }));
      }
    }
  }, [openMenu, isMegaOpen]);

  return (
    <>
      {/* ================= MOBILE OFFER ================= */}
      <div className="md:hidden bg-[#1ba6a6] poppins-regular text-white text-xs text-center py-1">
        ⭐ {OFFERS[offerIndex]}
      </div>

      {/* ================= HEADER ================= */}
      <header className="w-full bg-white poppins-regular sticky top-0 z-50">

        {/* ===== DESKTOP TOP ===== */}
        <div className="hidden md:block border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-2 grid grid-cols-3 items-center text-sm">
            <div className="flex gap-2 text-[#1ba6a6] poppins-regular">
              <span>
                🚚 Free delivery on orders above
                <strong className="ml-1">₹2000</strong>
              </span>
            </div>

            <div className="flex justify-center">
              <Link to="/">
                <img src={logo} alt="Dermedico" className="h-14 cursor-pointer" />
              </Link>
            </div>

            <div className="flex justify-end gap-6 items-center poppins-regular">
              {/* ✅ Use isAuthenticated from CartContext */}
              {!isAuthenticated ? (
                <Link to="/login" className="flex gap-2 items-center hover:text-[#1ba6a6] transition-colors poppins-regular">
                  <FaUser /> Login
                </Link>
              ) : (
                <>
                  {/* Profile Dropdown for Desktop */}
                  <div
                    className="relative"
                    onMouseEnter={() => setIsProfileDropdown(true)}
                    onMouseLeave={() => setIsProfileDropdown(false)}
                  >
                    <div className="flex gap-2 items-center cursor-pointer hover:text-[#1ba6a6] transition-colors poppins-regular">
                      <FaUser /> Account
                    </div>

                    {isProfileDropdown && (
                      <div
                        className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-1 z-50 border border-gray-200 poppins-regular"
                        onMouseEnter={() => setIsProfileDropdown(true)}
                        onMouseLeave={() => setIsProfileDropdown(false)}
                      >
                        <Link
                          to="/profile?tab=profile"
                          className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm poppins-regular"
                          onClick={() => setIsProfileDropdown(false)}
                        >
                          Profile
                        </Link>
                        <Link
                          to="/profile?tab=orders"
                          className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm poppins-regular"
                          onClick={() => setIsProfileDropdown(false)}
                        >
                          Orders
                        </Link>
                        <Link
                          to="/profile?tab=wishlist"
                          className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm poppins-regular"
                          onClick={() => setIsProfileDropdown(false)}
                        >
                          Wishlist
                        </Link>
                        <div className="border-t border-gray-200 my-1"></div>
                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-600 poppins-regular"
                          onClick={handleLogout}
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              <Link to="/cart" className="relative flex gap-2 items-center hover:text-[#1ba6a6] transition-colors poppins-regular">
                <FaShoppingCart /> Cart
                {/* ✅ Cart badge shows count from context (works for both guest and logged-in) */}
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-3 bg-[#1ba6a6] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center poppins-regular">
                    {cartItems.length}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* ===== DESKTOP NAV ===== */}
        <div className="hidden md:block border-b border-gray-200">
          <nav className="max-w-7xl mx-auto px-6 py-3 flex gap-10 text-sm font-medium poppins-regular">
            {/* Brands Menu */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter("Brands")}
              onMouseLeave={handleMouseLeave}
            >
              <span className="flex gap-1 items-center cursor-pointer hover:text-[#1ba6a6] transition-colors poppins-regular">
                Brands
                <FaChevronDown className="text-[10px]" />
              </span>

              {/* BRANDS DROPDOWN FROM API */}
              {openMenu === "Brands" && (
                <div
                  className="absolute top-8 bg-white border shadow-md rounded-md p-4 w-48 z-50 poppins-regular"
                  onMouseEnter={() => handleMouseEnter("Brands")}
                  onMouseLeave={handleMouseLeave}
                >
                  {loading.brands ? (
                    <div className="py-2 text-center">
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-[#1ba6a6]"></div>
                      <p className="text-xs text-gray-500 mt-1">Loading brands...</p>
                    </div>
                  ) : brands.length > 0 ? (
                    brands.map((brand) => (
                     <Link
  key={brand.id}
  to={`/products/brand/${brand.slug}`}
  state={{ brandId: brand.id }}
  className="block py-1 hover:text-[#1ba6a6] transition-colors poppins-regular"
  onClick={() => setOpenMenu(null)}
>
  {brand.name}
</Link>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No brands found</p>
                  )}
                </div>
              )}
            </div>

            {/* Dynamic Concern Groups from API */}
            {concernGroups.map((group) => (
              <div
                key={group}
                className="relative"
                onMouseEnter={() => handleMouseEnter(group)}
                onMouseLeave={handleMouseLeave}
              >
                <span className="flex gap-1 items-center cursor-pointer hover:text-[#1ba6a6] transition-colors poppins-regular">
                  {group.charAt(0) + group.slice(1).toLowerCase()}
                  <FaChevronDown className="text-[10px]" />
                </span>
              </div>
            ))}

            {/* Shop All Link */}
            <Link
              to="/AllProducts"
              className="flex gap-1 items-center cursor-pointer hover:text-[#1ba6a6] transition-colors poppins-regular"
              onClick={() => setOpenMenu(null)}
            >
              Shop All
            </Link>

            {/* MORE */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter("More")}
              onMouseLeave={handleMouseLeave}
            >
              <span className="flex gap-1 items-center cursor-pointer hover:text-[#1ba6a6] transition-colors poppins-regular">
                More <FaChevronDown className="text-[10px]" />
              </span>
              {openMenu === "More" && (
                <div
                  className="absolute top-8 bg-white border shadow-md rounded-md p-4 w-40 z-50 poppins-regular"
                  onMouseEnter={() => handleMouseEnter("More")}
                  onMouseLeave={handleMouseLeave}
                >
                  {MORE_ITEMS.map((item) => (
                    <Link
                      key={item.label}
                      to={item.path}
                      className="block py-1 hover:text-[#1ba6a6] poppins-regular"
                      onClick={() => setOpenMenu(null)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div
              className="ml-auto cursor-pointer hover:text-[#1ba6a6] transition-colors poppins-regular"
              onClick={() => setSearchOpen(true)}
            >
              <FaSearch />
            </div>
          </nav>
        </div>

        {/* ===== MOBILE HEADER ===== */}
        <div className="md:hidden flex justify-between items-center px-4 py-3 border-b border-gray-100 poppins-regular">
          <div className="flex gap-4">
            <FaBars onClick={() => setMobileMenu(true)} className="cursor-pointer" />
            <FaSearch onClick={() => setSearchOpen(true)} className="cursor-pointer" />
          </div>
          <Link to="/">
            <img src={logo} className="h-8 cursor-pointer" alt="Dermedico Logo" />
          </Link>
          <div className="flex gap-4 items-center">
            {/* ✅ Use isAuthenticated from CartContext */}
            {isAuthenticated ? (
              <>
                <Link to="/cart" className="relative">
                  <FaShoppingCart className="cursor-pointer" />
                  {/* ✅ Cart badge for mobile */}
                  {cartItems.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#1ba6a6] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center poppins-regular">
                      {cartItems.length}
                    </span>
                  )}
                </Link>
                <div
                  className="relative"
                  onClick={() => setIsProfileDropdown(!isProfileDropdown)}
                >
                  <FaUser className="cursor-pointer" />

                  {/* Mobile Profile Dropdown */}
                  {isProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md py-1 z-50 border border-gray-200 poppins-regular">
                      <Link
                        to="/profile?tab=profile"
                        className="block px-3 py-2 hover:bg-gray-50 text-xs poppins-regular"
                        onClick={() => {
                          setIsProfileDropdown(false);
                          setMobileMenu(false);
                        }}
                      >
                        Profile
                      </Link>
                      <Link
                        to="/profile?tab=orders"
                        className="block px-3 py-2 hover:bg-gray-50 text-xs poppins-regular"
                        onClick={() => {
                          setIsProfileDropdown(false);
                          setMobileMenu(false);
                        }}
                      >
                        Orders
                      </Link>
                      <Link
                        to="/profile?tab=wishlist"
                        className="block px-3 py-2 hover:bg-gray-50 text-xs poppins-regular"
                        onClick={() => {
                          setIsProfileDropdown(false);
                          setMobileMenu(false);
                        }}
                      >
                        Wishlist
                      </Link>
                      <div className="border-t border-gray-200 my-1"></div>
                      <button
                        className="block w-full text-left px-3 py-2 hover:bg-gray-50 text-xs text-red-600 poppins-regular"
                        onClick={() => {
                          handleLogout();
                          setIsProfileDropdown(false);
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/cart" className="relative">
                  <FaShoppingCart className="cursor-pointer" />
                  {/* ✅ Cart badge for guest users too */}
                  {cartItems.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#1ba6a6] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center poppins-regular">
                      {cartItems.length}
                    </span>
                  )}
                </Link>
                <Link to="/login">
                  <FaUser className="cursor-pointer" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ================= DESKTOP MEGA MENU ================= */}
      {isMegaOpen && concernGroups.includes(openMenu) && (
        <div
          className="fixed left-0 right-0 bg-white z-40 border-t shadow-lg poppins-regular"
          style={{ top: "128px" }}
          onMouseEnter={() => handleMouseEnter(openMenu)}
          onMouseLeave={handleMouseLeave}
        >
          <div className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-[260px_360px_1fr] gap-12">
            {/* Left: Concerns List */}
            <div>
              <h4 className="font-bold mb-4 poppins-regular">
                Concerns Related to {openMenu}
              </h4>
              {loading.concerns ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : concernData[openMenu]?.concerns?.length > 0 ? (
                concernData[openMenu].concerns.map((concern, i) => (
                  <div
                    key={i}
                    onMouseEnter={() => handleConcernHover(i)}
                    className={`block py-1 cursor-pointer poppins-regular ${activeConcern === i
                      ? "text-[#1ba6a6] font-medium"
                      : ""
                      }`}
                  >
                    {concern}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No concerns found</p>
              )}
            </div>

            {/* Middle: Selected Concern Image */}
            {concernData[openMenu]?.selectedConcern ? (
              <div className="relative">
                <img
                  src={getFullImageUrl(concernData[openMenu].selectedConcern.imageUrl)}
                  className="rounded-xl object-cover w-full h-64"
                  alt={concernData[openMenu].selectedConcern.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/images/default-concern.jpg";
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-xl">
                  <h3 className="text-white font-bold text-lg poppins-regular">
                    {concernData[openMenu].selectedConcern.name}
                  </h3>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-gray-100 w-full h-64 flex items-center justify-center">
                <p className="text-gray-500">Select a concern to view details</p>
              </div>
            )}

            {/* Right: Concern Details */}
            <div>
              {concernData[openMenu]?.selectedConcern ? (
                <>
                  <h3 className="text-xl font-bold mb-2 poppins-regular">
                    {concernData[openMenu].selectedConcern.name}
                  </h3>
                  <p className="text-gray-600 mb-5 poppins-regular line-clamp-3">
                    {concernData[openMenu].selectedConcern.description ||
                      `Explore our specialized treatments for ${concernData[openMenu].selectedConcern.name.toLowerCase()}`}
                  </p>

                  <div className="flex gap-4 mb-6">
                    <Link
                      to={`/products/concern/${concernData[openMenu].selectedConcern.slug}`}
                      state={{
                        concernId: concernData[openMenu].selectedConcern.id
                      }}
                      className="bg-[#1ba6a6] text-white px-6 py-2 rounded-full hover:bg-[#158787] transition-colors poppins-regular"
                      onClick={() => setOpenMenu(null)}
                    >
                      View Products
                    </Link>
                    <Link
                      to="/consultation"
                      className="text-[#1ba6a6] font-medium hover:text-[#158787] transition-colors poppins-regular"
                      onClick={() => setOpenMenu(null)}
                    >
                      Consult Experts
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-bold mb-2 poppins-regular">
                    {concernData[openMenu]?.title}
                  </h3>
                  <p className="text-gray-600 mb-5 poppins-regular">
                    {concernData[openMenu]?.description}
                  </p>
                  <p className="text-gray-500 text-sm">
                    Hover over a concern to see details
                  </p>
                </>
              )}

              <hr className="my-4" />

              <div className="grid grid-cols-[1fr_auto_1fr] gap-6 mt-4 poppins-regular">
                <div>
                  <p className="text-sm text-gray-600 poppins-regular">
                    Contact · Mon–Sat · 10am – 6pm
                  </p>
                  <div className="flex gap-2 mt-2 poppins-regular">
                    <FaPhoneAlt /> +91 98992 34707
                  </div>
                </div>

                <div className="w-px bg-gray-300" />

                <div>
                  <p className="text-sm text-gray-600 mb-2 poppins-regular">Find us on</p>
                  <div className="flex gap-4 text-xl">
                    <a
                      href="https://www.facebook.com/p/Dermedico-100063917561024"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaFacebookF className="cursor-pointer hover:text-[#1ba6a6] transition-colors" />
                    </a>

                    <a
                      href="https://wa.me/9899234707"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaWhatsapp className="cursor-pointer hover:text-[#1ba6a6] transition-colors" />
                    </a>

                    <a
                      href="https://www.instagram.com/dermedico/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaInstagram className="cursor-pointer hover:text-[#1ba6a6] transition-colors" />
                    </a>

                    <a
                      href="https://www.youtube.com/@drpallavichandnarohatgi"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FaYoutube className="cursor-pointer hover:text-[#1ba6a6] transition-colors" />
                    </a>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MOBILE MENU ================= */}
      {mobileMenu && (
        <div className="fixed inset-0 z-[999]">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileMenu(false)}
          />

          <div className="absolute right-0 top-0 h-full w-[85%] bg-white p-5 overflow-y-auto">
            <div className="flex justify-between mb-6">
              <Link to="/" onClick={() => setMobileMenu(false)}>
                <img src={logo} className="h-8" alt="Dermedico Logo" />
              </Link>
              <FaTimes
                onClick={() => setMobileMenu(false)}
                className="cursor-pointer text-lg"
              />
            </div>

            {/* ✅ Use isAuthenticated from CartContext */}
            {!isAuthenticated && (
              <div className="mb-4 pb-4 border-b">
                <Link
                  to="/login"
                  className="bg-[#1ba6a6] text-white px-4 py-2 rounded-md text-sm poppins-regular"
                  onClick={() => setMobileMenu(false)}
                >
                  Login to Your Account
                </Link>
              </div>
            )}

            {/* <Accordion
              title="Brands"
              items={brands.map(b => b.name)}
              links={brands.map(b => `/products/brand/${b.id}`)}
              loading={loading.brands}
            /> */}

<Accordion
  title="Brands"
  items={brands.map(b => b.name)}
  links={brands.map(b => `/products/brand/${b.slug}`)}
  states={brands.map(b => ({ brandId: b.id }))}
  loading={loading.brands}
/>
            {concernGroups.map(group => (
              <Accordion
  key={group}
  title={group.charAt(0) + group.slice(1).toLowerCase()}
  items={concernData[group]?.concerns || []}
  links={
    concernData[group]?.activeConcerns?.map(
      c => `/products/concern/${c.slug}`
    ) || []
  }
  states={
    concernData[group]?.activeConcerns?.map(
      c => ({ concernId: c.id })
    ) || []
  }
  onOpen={() => fetchConcernsByGroup(group)}
/>
            ))}

            <Link
              to="/AllProducts"
              className="block py-4 border-b text-lg poppins-regular"
              onClick={() => setMobileMenu(false)}
            >
              Shop All
            </Link>

            <Accordion
              title="More"
              items={MORE_ITEMS.map(m => m.label)}
              links={MORE_ITEMS.map(m => m.path)}
            />
          </div>
        </div>
      )}

      {/* ================= SEARCH ================= */}
      {searchOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-20">
          <div className="bg-white w-full max-w-3xl mx-4 rounded-lg shadow-xl poppins-regular">
            <div className="p-4 flex gap-4 items-center border-b">
              <FaSearch className="text-gray-400" />
              <input
                autoFocus
                placeholder="Search for products, brands & concerns"
                className="flex-1 outline-none text-lg poppins-regular"
              />
              <FaTimes
                onClick={() => setSearchOpen(false)}
                className="cursor-pointer text-gray-500 hover:text-gray-700 transition-colors"
              />
            </div>
            <div className="p-4">
              <p className="text-gray-500 text-sm poppins-regular">Popular searches: Cetaphil, Minimalist, Acne, Hair Fall</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ================= ACCORDION ================= */
function Accordion({ title, items, links, states, loading, onOpen }) {  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    if (!open && onOpen) {
      onOpen();
    }
    setOpen(!open);
  };

  return (
    <div className="border-b border-gray-100 py-4 poppins-regular">
      <div
        className="flex justify-between items-center cursor-pointer poppins-regular"
        onClick={handleToggle}
      >
        <span className="text-lg font-medium poppins-regular">{title}</span>
        {open ? <FaMinus /> : <FaPlus />}
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ${open ? "max-h-96 mt-3" : "max-h-0"
          }`}
      >
        <div className="ml-3 space-y-2 text-sm text-gray-600 poppins-regular">
          {loading ? (
            <div className="py-2 text-center">
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-[#1ba6a6]"></div>
              <p className="text-xs text-gray-500 mt-1">Loading...</p>
            </div>
          ) : items.length > 0 ? (
            items.map((item, index) => {
              const link = links && links[index] ? links[index] :
                `/${title.toLowerCase().replace(/\s+/g, '-')}/${item.toLowerCase().replace(/[&\s]+/g, '-')}`;

              return (
                <Link
  key={index}
  to={link}
  state={states?.[index]}
  className="block hover:text-[#1ba6a6] cursor-pointer transition-colors poppins-regular"
>
  {item}
</Link>
              );
            })
          ) : (
            <p className="text-gray-400 text-sm">No items found</p>
          )}
        </div>
      </div>
    </div>
  );
}