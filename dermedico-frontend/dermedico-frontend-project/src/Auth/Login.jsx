import React, { useState } from "react";
import bagImage from "../assets/Signup/login.png";
import logo from "/public/derm-logo.png";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import { useCart } from "../Context/CartContext";


export default function AuthPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("enterPhone"); // "enterPhone" or "enterOtp"
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const { onLoginSuccess } = useCart();
  const { checkAuth, loadCart } = useCart();



  /** ✅ GET OTP */
  const sendOtp = async () => {
    if (!phone) {
      setErrorMessage("Please enter your email");
      return;
    }

    setLoading(true);
    setErrorMessage(""); // clear last error

    try {
      const response = await api.post("/auth/login", { email: phone });

      alert(response.data.message || "OTP has been sent to your email");
      setStep("enterOtp");
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to send OTP";
      setErrorMessage(errorMsg); // ✅ Show message on UI

      // ✅ If user not found, show signup link (do NOT redirect)
      if (errorMsg.includes("User not found")) {
        setErrorMessage(
          "User does not exist. Please sign up to continue."
        );
      }
    } finally {
      setLoading(false);
    }
  };


  //     const verifyOtp = async () => {
  //   if (!otp) {
  //     alert("Enter OTP");
  //     return;
  //   }

  //   setLoading(true);
  //   try {
  //     const response = await api.post(
  //       "/auth/verify-otp",
  //       { email: phone, otp },
  //       { withCredentials: true }
  //     );

  //     const userData = response.data.data;

  //     // 🧠 CHECK IF USER CAME FROM ADD TO CART
  //     const pendingItem = localStorage.getItem("postLoginCheckoutItem");

  //     if (pendingItem) {
  //       const { productId, quantity } = JSON.parse(pendingItem);

  //       try {
  //         // ✅ Add product to cart AFTER login
  //         await api.post(
  //           `/cart/add?productId=${productId}&quantity=${quantity}`,
  //           null,
  //           { withCredentials: true }
  //         );

  //         localStorage.removeItem("postLoginCheckoutItem");

  //         alert("Login successful!");
  //         navigate("/Cart");
  //         return;

  //       } catch (cartError) {
  //         console.error("Failed to add product after login", cartError);
  //       }
  //     }

  //     // 🔐 Normal login flow
  //     if (userData.role === "ADMIN") {
  //       alert("Admin login successful!");
  //       navigate("/admin/dashboard");
  //     } else {
  //       alert("Login successful!");
  //       navigate("/");
  //     }

  //   } catch (err) {
  //     alert(err.response?.data?.message || "Invalid OTP");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const verifyOtp = async () => {

    if (!otp) {
      console.warn("⚠️ OTP is empty");
      alert("Enter OTP");
      return;
    }

    setLoading(true);

    try {
      console.log("📨 Sending verify-otp request:", {
        email: phone,
        otp,
      });

      // 1️⃣ Verify OTP
      const response = await api.post(
        "/auth/verify-otp",
        { email: phone, otp },
        { withCredentials: true }
      );


      const userData = response.data.data;

    await checkAuth();   // <-- THIS WAS MISSING
    await loadCart();    // <-- load DB cart


      // 2️⃣ Read guest cart
      const guestCartRaw = localStorage.getItem("cart");

      const guestCart = JSON.parse(guestCartRaw) || [];

      // 3️⃣ Merge cart
      if (guestCart.length > 0) {
        const mergePayload = guestCart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
        }));


        const mergeRes = await api.post(
          "/cart/merge",
          mergePayload,
          { withCredentials: true }
        );

        localStorage.removeItem("cart");
      } else {
        console.log("ℹ️ No guest cart to merge");
      }

      // 4️⃣ Redirect
      if (userData.role === "ADMIN") {
        navigate("/admin/dashboard");
      } else {
        navigate("/cart");
      }

    } catch (err) {
      console.error("❌ verifyOtp FAILED");

      if (err.response) {
        console.error("❌ Status:", err.response.status);
        console.error("❌ Data:", err.response.data);
        console.error("❌ Headers:", err.response.headers);
      } else {
        console.error("❌ Error:", err.message);
      }

      alert(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };



  return (
    <>
      <Navbar />
      <div className="min-h-screen poppins-regular flex flex-col items-center pt-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl w-full flex flex-col lg:flex-row overflow-hidden gap-2 lg:gap-4">

          {/* Image Section */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-2 sm:p-4 lg:p-6">
            <img
              src={bagImage}
              alt="Dermedico Bag"
              className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[260px] lg:max-w-[380px] xl:max-w-[400px] object-contain transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* Form Section */}
          <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-6 py-6 sm:py-8 lg:py-10">
            <img
              src={logo}
              alt="Dermedico Logo"
              className="w-24 sm:w-28 md:w-32 lg:w-32 mb-4 sm:mb-6"
            />

            <h2 className="font-raleway font-semibold text-xl sm:text-2xl md:text-[24px] leading-7 sm:leading-8 md:leading-[36px] text-center mb-4 sm:mb-6">
              LOGIN OR SIGNUP
            </h2>

            {/* STEP 1 — ENTER EMAIL */}
            {step === "enterPhone" && (
              <div className="w-full max-w-sm sm:max-w-md">
                <div className="flex flex-col sm:flex-row w-full mb-4 sm:mb-4 gap-3 sm:gap-3">
                  <input
                    type="email"
                    placeholder="Enter Email"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 poppins-regular border border-[#7E7E7E] rounded-lg px-4 py-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-[#60A8CA] focus:border-transparent transition-all"
                  />
                  <button
                    onClick={sendOtp}
                    disabled={loading}
                    className="bg-[#60A8CA] text-white px-6 py-3 sm:py-2 rounded-lg hover:bg-[#4a90e2] transition-colors duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                  >
                    {loading ? "Sending..." : "Get OTP"}
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 text-center mt-2">
                  Enter your email to receive OTP for verification
                </p>
                {errorMessage && (
                  <p className="text-red-500 text-center text-sm mt-2">{errorMessage}</p>
                )}

                <p
                  className="text-[#60A8CA] text-center text-xs sm:text-sm mt-2 cursor-pointer hover:text-[#4a90e2] underline"
                  onClick={() => navigate("/signup")}
                >
                  Don't have an account? Sign Up
                </p>
              </div>
            )}

            {/* STEP 2 — ENTER OTP */}
            {step === "enterOtp" && (
              <div className="w-full max-w-sm sm:max-w-md">
                <div className="flex flex-col sm:flex-row w-full mb-4 sm:mb-4 gap-3 sm:gap-3">
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    maxLength={6}
                    className="flex-1 border border-[#7E7E7E] rounded-lg px-4 py-3 sm:py-2 focus:outline-none focus:ring-2 focus:ring-[#60A8CA] focus:border-transparent transition-all text-center sm:text-left"
                  />
                  <button
                    onClick={verifyOtp}
                    disabled={loading}
                    className="bg-[#60A8CA] text-white px-6 py-3 sm:py-2 rounded-lg hover:bg-[#4a90e2] transition-colors duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">
                    OTP sent to {phone}
                  </p>
                  <button
                    onClick={() => setStep("enterPhone")}
                    className="text-[#60A8CA] text-xs sm:text-sm hover:text-[#4a90e2] transition-colors underline"
                  >
                    Change Email
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}