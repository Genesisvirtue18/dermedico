// // src/components/admin/AdminDashboard.jsx
// import React, { useState } from "react";
// import DashboardStats from "../Dashboard/DashboardStats";
// import OrdersManagement from "../Dashboard/OrderManagement";
// import ProductsManagement from "../Dashboard/ProductManagement";
// import UsersManagement from "../Dashboard/UserManagement";
// import ReviewsManagement from "../Dashboard/ReviewManagement";
// import PincodeManagement from "../Dashboard/PinCodeManagement";
// import BrandManagement from "../Dashboard/BrandManagement";
// import ConcernManagement from "../Dashboard/ConcernManagement";
// import CategoryManagement from "../Dashboard/CategoryManagement"; // Import the new component
// import ContactManagement from "../Dashboard/AdminContact"; // Import the new component


// const AdminDashboard = () => {
//   const [activeSection, setActiveSection] = useState("dashboard");

//   const menuItems = [
//     { text: "Dashboard", section: "dashboard" },
//     { text: "Orders", section: "orders" },
//     { text: "Products", section: "products" },
//         { text: "Categories", section: "categories" }, // New menu item
//       // 🔥 NEW
//     { text: "Brands", section: "brands" },
//     { text: "Concerns", section: "concerns" },
//     { text: "Users", section: "users" },
//     { text: "Reviews", section: "reviews" },
//     { text: "Pincode Rules", section: "pincode" },
//         { text: "Contact Messages", section: "contact" }, // New menu item
        
//   ];

//   const renderSection = () => {
//     switch (activeSection) {
//       case "dashboard":
//         return <DashboardStats />;
//       case "orders":
//         return <OrdersManagement />;
//       case "categories":
//         return <CategoryManagement />;
//       case "products":
//         return <ProductsManagement />;
//         case "brands":
//         return <BrandManagement />;
//       case "concerns":
//         return <ConcernManagement />;
//       case "users":
//         return <UsersManagement />;
//       case "reviews":
//         return <ReviewsManagement />;
//       case "pincode":
//         return <PincodeManagement />;
//        case "contact":
//         return <ContactManagement />; // Add the contact management component
//       default:
//         return <DashboardStats />;
//     }
//   };

//   return (
//     <div className="flex poppins-regular flex-col md:flex-row min-h-screen bg-gray-50">
//       {/* Sidebar */}
//       <aside className="w-full md:w-64 bg-white border-r p-4">
//         <h2 className="text-2xl font-semibold mb-6">Admin Panel</h2>
//         <ul className="space-y-2">
//           {menuItems.map((item) => (
//             <li key={item.section}>
//               <button
//                 onClick={() => setActiveSection(item.section)}
//                 className={`w-full text-left px-4 py-2 rounded ${
//                   activeSection === item.section
//                     ? "bg-blue-500 text-white"
//                     : "hover:bg-gray-100"
//                 }`}
//               >
//                 {item.text}
//               </button>
//             </li>
//           ))}
//         </ul>
//       </aside>

//       {/* Main content */}
//       <main className="flex-1 p-6">{renderSection()}</main>
//     </div>
//   );
// };

// export default AdminDashboard;

// src/components/admin/AdminDashboard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import DashboardStats from "../Dashboard/DashboardStats";
import OrdersManagement from "../Dashboard/OrderManagement";
import ProductsManagement from "../Dashboard/ProductManagement";
import UsersManagement from "../Dashboard/UserManagement";
import ReviewsManagement from "../Dashboard/ReviewManagement";
import PincodeManagement from "../Dashboard/PinCodeManagement";
import BrandManagement from "../Dashboard/BrandManagement";
import ConcernManagement from "../Dashboard/ConcernManagement";
import CategoryManagement from "../Dashboard/CategoryManagement";
import ContactManagement from "../Dashboard/AdminContact";
import HeroManagement from "../Dashboard/HeroManagement";
import BannerManagement from "../Dashboard/BannerManagement"; // Import Banner Management



const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const navigate = useNavigate(); // Initialize useNavigate

  const menuItems = [
    { text: "Dashboard", section: "dashboard" },
    { text: "Orders", section: "orders" },
    { text: "Products", section: "products" },
    { text: "Categories", section: "categories" },
    { text: "Brands", section: "brands" },
    { text: "Concerns", section: "concerns" },
    { text: "Users", section: "users" },
    { text: "Reviews", section: "reviews" },
    { text: "Pincode Rules", section: "pincode" },
    { text: "Contact Messages", section: "contact" },
        { text: "Hero Section", section: "hero" },
    { text: "site Banners", section: "banner" }, // New menu item for Banner
    { text: "Blog Dashboard", section: "blog" }, // New menu item for Blog
  ];

  const handleMenuClick = (item) => {
    if (item.section === "blog") {
      // Navigate to the blog dashboard URL
      navigate("/admin/blogdashboard");
    } else {
      // Set active section for other menu items
      setActiveSection(item.section);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardStats />;
      case "orders":
        return <OrdersManagement />;
      case "categories":
        return <CategoryManagement />;
      case "products":
        return <ProductsManagement />;
      case "brands":
        return <BrandManagement />;
      case "concerns":
        return <ConcernManagement />;
      case "users":
        return <UsersManagement />;
      case "reviews":
        return <ReviewsManagement />;
      case "pincode":
        return <PincodeManagement />;
      case "contact":
        return <ContactManagement />;
      case "hero":
        return <HeroManagement />;
       case "banner":
        return <BannerManagement />; // Add Banner Management
      default:
        return <DashboardStats />;
    }
  };

  return (
    <div className="flex poppins-regular flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r p-4">
        <h2 className="text-2xl font-semibold mb-6">Admin Panel</h2>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.section}>
              <button
                onClick={() => handleMenuClick(item)}
                className={`w-full text-left px-4 py-2 rounded transition-colors ${
                  activeSection === item.section && item.section !== "blog"
                    ? "bg-blue-500 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {item.text}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">{renderSection()}</main>
    </div>
  );
};

export default AdminDashboard;
