import React, { useState } from "react";
import bagImage from "../assets/Signup/login.png";
import logo from "/public/derm-logo.png";
import api from "../api/axiosConfig"; // ✅ common API file
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";

export default function SignupDetails() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/auth/register", form);
      alert(response.data.message || "Registration successful!");
      navigate("/login"); // redirect user to login page
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed. Try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col md:flex-row justify-start md:justify-center px-4 sm:px-6 lg:px-8 pt-4 md:pt-10 pb-10">
        <div className="max-w-5xl w-full flex flex-col md:flex-row overflow-hidden gap-4 md:gap-6">

          {/* Left Image */}
          <div className="hidden md:flex w-1/2 items-center justify-center">
            <img
              src={bagImage}
              alt="Dermedico Bag"
              className="max-w-full h-auto object-contain"
            />
          </div>

          {/* Right Form */}
          <div className="w-full md:w-1/2 flex flex-col items-center justify-start md:justify-center px-6 py-6 md:py-10">
            <img src={logo} alt="Dermedico Logo" className="w-32 mb-3" />

            <h2 className="font-raleway font-semibold text-[24px] leading-[36px] text-center mb-4">
              Basic Details
            </h2>

            <form className="w-full max-w-sm space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="name"
                  className="font-medium poppins-regular text-[14px] text-gray-700"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full poppins-regular border border-[#7E7E7E] rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#60A8CA]"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="font-medium poppins-regular text-[14px] text-gray-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full poppins-regular border border-[#7E7E7E] rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#60A8CA]"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="font-medium poppins-regular text-[14px] text-gray-700"
                >
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className="w-full poppins-regular border border-[#7E7E7E] rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#60A8CA]"
                />
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-[200px] poppins-regular bg-[#60A8CA] text-white py-3 rounded-lg hover:bg-[#4a90e2] transition disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save and Continue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
