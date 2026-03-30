import { useState } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { FaEnvelope } from "react-icons/fa";
import api from "../api/axiosConfig"; // Import the common API utility

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Using the common API utility
      const response = await api.post("/contact", form);
      
      if (response.status === 200 || response.status === 201) {
        setSubmitted(true);
        setForm({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => setSubmitted(false), 3000);
      }
    } catch (err) {
      console.error("Error submitting form", err);
      setError(
        err.response?.data?.message || 
        "Failed to send message. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen poppins-regular flex flex-col bg-[#FAFAFA]">
      <Navbar />

      {/* MAIN CONTENT - COMPACT VERSION */}
      <div className="flex-grow px-4 py-4 md:px-6 md:py-6">

        {/* HEADER - Reduced spacing */}
        <div className="max-w-3xl mx-auto text-center mb-6">
          <span className="text-xs uppercase tracking-widest text-[#1ba6a6] font-semibold mb-2 block">
            Contact Us
          </span>

          <h2 className="font-raleway font-light text-3xl md:text-4xl text-[#111111] mb-3">
            Let's <span className="font-semibold">Collaborate</span>
          </h2>

          <p className="text-sm text-[#555555] poppins-regular leading-relaxed max-w-2xl mx-auto">
            Whether you're a customer, collaborator, or curious mind, we'd love
            to hear from you. Let's create healthy, radiant skin together.
          </p>
        </div>

        {/* CONTACT INFO CARDS - Compact version */}
        <div className="max-w-4xl mx-auto mb-6 flex justify-center">
          {[
            {
              icon: <FaEnvelope />,
              title: "Email",
              value: "websitedermedicoclinic@gmail.com",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm p-5 text-center hover:shadow-md transition w-full max-w-sm"
            >
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-purple-100 text-[#1ba6a6] flex items-center justify-center text-base">
                {item.icon}
              </div>
              <p className="uppercase text-xs tracking-wide text-gray-500 mb-1">
                {item.title}
              </p>
              <p className="text-sm text-gray-700 poppins-regular break-all">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* FORM SECTION - Compact grid with less gap */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">

          {/* LEFT INFO - Compact */}
          <div>
            <h3 className="font-raleway font-light text-2xl md:text-3xl text-[#111111] mb-3">
              Get In Touch
            </h3>

            <p className="text-sm text-[#555555] poppins-regular leading-relaxed">
              Have questions about our products, consultations, or
              collaborations? Fill out the form and our team will reach out.
            </p>
          </div>

          {/* FORM CARD - Compact */}
          <div className="bg-white rounded-xl shadow-md p-6">
            {submitted && (
              <div className="bg-green-100 text-green-700 px-3 py-2 rounded-lg text-xs text-center mb-3 animate-pulse">
                ✅ Message sent successfully! We'll contact you soon.
              </div>
            )}

            {error && (
              <div className="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-xs text-center mb-3">
                ❌ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm poppins-regular focus:outline-none focus:ring-1 focus:ring-purple-300"
              />

              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm poppins-regular focus:outline-none focus:ring-1 focus:ring-purple-300"
              />

              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={form.subject}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm poppins-regular focus:outline-none focus:ring-1 focus:ring-purple-300"
              />

              <textarea
                name="message"
                placeholder="Your Message (Optional)"
                rows="3"
                value={form.message}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm poppins-regular focus:outline-none focus:ring-1 focus:ring-purple-300"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1ba6a6] text-white py-2.5 rounded-full hover:bg-[#1ba6a6]/90 transition font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}