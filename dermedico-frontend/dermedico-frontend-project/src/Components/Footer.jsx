import { useState } from "react";
import {
  FaFacebookF,
  FaWhatsapp,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import logo from "/public/white-logo.png";
import auth from "/public/auth.png";
import Payment from "/public/images/Payment.png";

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setEmail("");
      alert("Subscribed successfully!");
    } catch {
      alert("Subscription failed");
    }
  };

  return (
    <footer className="bg-gradient-to-br from-[#1f2937] to-[#0b0f19] text-slate-300 poppins-regular">
      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* ================= TOP ROW ================= */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">

          {/* LOGO + AUTH */}
          <div className="flex items-center gap-6">
            <Link to="/">
              <img src={logo} alt="Dermedico" className="h-24 w-auto" />
            </Link>
            <Link to="/authentic">
              <img src={auth} alt="Authentic" className="h-22 w-auto" />
            </Link>
          </div>

          {/* SOCIAL ICONS */}
          <div className="flex gap-6 text-white text-2xl">
            <a
              href="https://www.facebook.com/p/Dermedico-100063917561024"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Dermedico Facebook"
              className="hover:scale-125 transition"
            >
              <FaFacebookF />
            </a>

            <a
              href="https://wa.me/9899234707"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Dermedico WhatsApp"
              className="hover:scale-125 transition"
            >
              <FaWhatsapp />
            </a>

            <a
              href="https://www.instagram.com/dermedico/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Dermedico Instagram"
              className="hover:scale-125 transition"
            >
              <FaInstagram />
            </a>

            <a
              href="https://www.youtube.com/@drpallavichandnarohatgi"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Dermedico YouTube"
              className="hover:scale-125 transition"
            >
              <FaYoutube />
            </a>
          </div>
        </div>

        {/* ================= LINKS + NEWSLETTER ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mt-4">

          {/* GET STARTED */}
          <div>
            <h4 className="text-white font-semibold mb-4">Get Started</h4>
            <ul className="space-y-3">
              <li><Link to="/allproducts" className="hover:text-white">Products</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            </ul>
          </div>

          {/* ABOUT */}
          <div>
            <h4 className="text-white font-semibold mb-4">About Us</h4>
            <ul className="space-y-3">
              <li><Link to="/faqs" className="hover:text-white">FAQs</Link></li>
              <li><Link to="/blogs" className="hover:text-white">Blog</Link></li>
            </ul>
          </div>

          {/* LEGAL */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><Link to="/terms-conditions" className="hover:text-white">Terms of Service</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/shipping-refund" className="hover:text-white">Shipping & Refunds</Link></li>
            </ul>
          </div>

          {/* SPACER DIV - Takes up space to push newsletter to the right */}
          <div className="hidden lg:block"></div>

          {/* NEWSLETTER - Positioned on the right */}
          <div className="lg:col-start-5">
            <p className="text-white font-medium mb-4">
              Our best skin & hair tips straight to your inbox!
            </p>

            <form
              onSubmit={handleSubscribe}
              className="flex items-center bg-white rounded-sm overflow-hidden h-12"
            >
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 text-sm text-black outline-none h-full"
              />
              <button
                type="submit"
                className="w-12 h-full flex items-center justify-center text-[#5CB8C9] hover:bg-purple-50"
              >
                →
              </button>
            </form>
          </div>
        </div>

        {/* ================= DIVIDER ================= */}
        <div className="border-t border-white/10 my-10"></div>

        {/* ================= BOTTOM ================= */}
        <div className="flex flex-col lg:flex-row justify-between gap-8 text-sm">
          <p className="max-w-3xl">
            © 2025, Dermedico. All rights reserved.
          </p>

          {/* PAYMENT ICONS */}
          <div>
            <img
              src={Payment}
              alt="Payment Methods"
              className="h-20 bg-[#171e2b] p-2 rounded"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}