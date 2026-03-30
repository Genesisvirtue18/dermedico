import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Home from "./Components/Home";
import Product from "./Pages/productpage";
import Login from "./Auth/Login";
import Signup from "./Auth/Signup";
import Contact from "./Pages/Contact";
import Gift from "./Pages/GiftPage";
import About from "./Pages/About";
import Profile from "./Pages/ProfilePage";
import Cart from "./Pages/shoppingCart";
import AdminDashboard from "../src/Dashboard/AdminDashboard";
import Shipping from "./Pages/ShippingPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TrackOrder from "./Pages/TrackOrder";
import CancellationPolicy from "./Pages/CancellationPolicy";
import TermsAndConditions from "./Pages/TermsAndCondition";
import ShippingRefundPolicy from "./Pages/ShippingRefundPolicy";
import PrivacyPolicy from "./Pages/PrivacyPolicy";
import SingleProduct from "./Pages/SingleProduct";
import CategoryProduct from "./ShopPages/CategoryProduct";
import BrandProducts from "./ShopPages/BrandProducts";
import ConcernProducts from "./ShopPages/ConcernProducts";
import ShopAll from "./ShopPages/ShopAllProducts";
import FaqsPage from "./Pages/Faq";
import api from "../src/api/axiosConfig";
import CoalToArticle from "./Pages/CoalToArticle";
import BlogDashboard from "./Dashboard/BlogDashboard";
import AllBlogs from "./Pages/AllBlogs";




function App() {
      const [isAuthenticated, setIsAuthenticated] = useState(false);
const [authChecked, setAuthChecked] = useState(false);

useEffect(() => {
  api.get("/auth/check-auth", { withCredentials: true })
    .then(() => setIsAuthenticated(true))
    .catch(() => setIsAuthenticated(false))
    .finally(() => setAuthChecked(true));
}, []);

  return (

    <Router>
      <ToastContainer position="top-right" autoClose={2000} />

      <Routes>

        {/* Homepage */}
        <Route path="/" element={<Home />} />
        {/* <Route path="/product/:slug" element={<Product />} /> */}
        <Route path="/product/:slug/:category/skincare" element={<Product />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/gift" element={<Gift />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/Cart" element={<Cart />} />
        <Route path="/checkout" element={<Shipping />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/cancellation-policy" element={<CancellationPolicy />} />
        <Route path="/terms-conditions" element={<TermsAndConditions />} />
        <Route path="/shipping-refund" element={<ShippingRefundPolicy />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/products/single" element={<SingleProduct />} />
        <Route path="/faqs" element={<FaqsPage />} />
                <Route  path="/blog/:slug"
 element={<CoalToArticle />} />
   <Route  path="/blogs"
 element={<AllBlogs />} />

 <Route  path="/admin/blogdashboard"
 element={<BlogDashboard />} />
{/* 
        <Route
          path="/products/category/:categoryId"
          element={<CategoryProduct />}
        /> */}

        <Route
 path="/products/category/:slug"
 element={<CategoryProduct />}
/>
        {/* <Route
          path="/products/brand/:brandId"
          element={<BrandProducts />}
        /> */}

        <Route
  path="/products/brand/:slug"
  element={<BrandProducts />}
/>
        {/* <Route
          path="/products/concern/:concernId"
          element={<ConcernProducts />}
        /> */}

        <Route
  path="/products/concern/:slug"
  element={<ConcernProducts />}
/>

        <Route
          path="/AllProducts"
          element={<ShopAll />}
        />









      </Routes>
    </Router>
  );
}

export default App;
