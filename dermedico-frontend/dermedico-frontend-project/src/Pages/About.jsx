import React from "react";
import Navbar from "../Components/Navbar"; // adjust path if needed
import heroImage from "../assets/About/about-main.jpg"; // replace with your hero image path
import visionImage from "../assets/About/about-1.jpg"; // replace with your image path
import valuesImage from "../assets/About/about-2.jpg"; // replace with your image path
import Footer from "../Components/Footer";
import Blog from "../Components/BlogSection";
export default function AboutPage() {
    return (
        <div className="bg-white poppins-regular min-h-screen">
            {/* Navbar */}
            <Navbar />

        
           {/*HERO SECTION */}
<section className="bg-[#1ba6a6] py-20">
  <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
    
    {/* Left Content */}
    <div className="text-white">
      <p className="uppercase tracking-widest text-sm text-purple-200 mb-3">
        More Than Just Marketable Ingredients
      </p>

      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        We're Dermedico!
      </h1>

      <p className="text-purple-100 leading-relaxed max-w-lg">
        Save time and money by finding everything for your skin & hair care under
        one roof – powered by science, facts, and real dermatological expertise.
      </p>

      {/* Stats */}
      <div className="flex gap-10 mt-8">
        <div>
          <h3 className="text-2xl font-bold">1000+</h3>
          <p className="text-sm text-purple-200">Happy Users</p>
        </div>
        <div>
          <h3 className="text-2xl font-bold">5+</h3>
          <p className="text-sm text-purple-200">Years of Expertise</p>
        </div>
      </div>
    </div>

    {/* Right Image */}
    <div className="bg-white rounded-xl p-2 shadow-xl">
      <img
        src={heroImage}
        alt="About Dermedico"
        className="rounded-lg w-full h-[380px] object-cover"
      />
    </div>
  </div>
</section>


            {/* About Us Section */}
<section className="max-w-5xl mx-auto px-6 mt-12 md:mt-16 text-center">

  {/* Small Label */}
  <span className="inline-block mb-3 text-sm tracking-widest uppercase text-[#1ba6a6] font-bold">
    About Us
  </span>

  {/* Main Heading */}
  <h2 className="font-raleway font-light text-[34px] md:text-[38px] leading-tight text-[#111111] mb-6">
    Where Science Meets <span className="font-semibold">Skin Harmony</span>
  </h2>

  {/* Divider */}
  <div className="w-16 h-[2px] bg-[#1ba6a6] mx-auto mb-8"></div>

  {/* Content */}
  <div className="max-w-4xl mx-auto space-y-5">
    <p className="font-poppins text-[16px] leading-[30px] text-[#4A4A4A]">
      At Dermedico, we believe skincare should go beyond surface-level beauty —
      it’s about restoring balance, building resilience, and enhancing your skin’s
      natural vitality. Every formula we create is rooted in dermatological science
      and ingredient integrity, designed to deliver real results you can see and feel.
    </p>

    <p className="font-poppins text-[16px] leading-[30px] text-[#4A4A4A]">
      Crafted with skin-identical ceramides, soothing botanicals, powerful
      antioxidants, and proven sun filters, our products work in synergy to
      hydrate, protect, and repair.
    </p>

    <p className="font-poppins text-[16px] leading-[30px] text-[#4A4A4A]">
      We don’t believe in shortcuts — just thoughtful, high-performance skincare
      that respects your skin’s needs. Whether you're restoring moisture,
      shielding from UV rays, or calming sensitivity, every Dermedico product is a
      step toward healthier, more resilient skin.
    </p>
  </div>

</section>
  

{/* OUR PRODUCT APPROACH */}
<section className="max-w-6xl mx-auto px-6 py-24">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center">

    {/* LEFT IMAGE */}
    <div className="relative bg-white rounded-xl p-2 shadow-xl">
      <img
        src={visionImage}
        alt="Dermedico Product Approach"
        className="rounded-2xl shadow-lg w-full object-cover"
      />
    </div>

    {/* RIGHT CONTENT */}
    <div>
      <h2 className="font-raleway font-semibold text-[32px] text-[#111111] mb-10">
        Our Product Approach
      </h2>

      <div className="space-y-8">

        {/* ITEM 1 */}
        <div className="flex gap-5">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#1ba6a6] text-white flex items-center justify-center font-semibold">
            1
          </div>
          <div>
            <h4 className="font-semibold text-[#1ba6a6] mb-1">
              Identifying the Concern :
            </h4>
            <p className="text-[#4A4A4A] leading-[28px]">
              We work closely with dermatologists to develop unique formulations
              that target a multitude of underlying skin & hair conditions.
            </p>
          </div>
        </div>

        {/* ITEM 2 */}
        <div className="flex gap-5">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#1ba6a6] text-white flex items-center justify-center font-semibold">
            2
          </div>
          <div>
            <h4 className="font-semibold text-[#1ba6a6] mb-1">
              Targeting Basal Pathogenesis :
            </h4>
            <p className="text-[#4A4A4A] leading-[28px]">
              Our team of dermatologists studies the interaction between active
              ingredients and skin/hair follicles in order to bring about desired
              & effective results.
            </p>
          </div>
        </div>

        {/* ITEM 3 */}
        {/* <div className="flex gap-5">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center font-semibold">
            3
          </div>
          <div>
            <h4 className="font-semibold text-[#111111] mb-1">
              Sourcing High-Quality Ingredients
            </h4>
            <p className="text-[#4A4A4A] leading-[28px]">
              We source patented & next-generation ingredients of the highest
              efficacy from Europe and USA.
            </p>
          </div>
        </div> */}

        {/* ITEM 4 */}
        <div className="flex gap-5">
          <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#1ba6a6] text-white flex items-center justify-center font-semibold">
            3
          </div>
          <div>
            <h4 className="font-semibold text-[#1ba6a6] mb-1">
              Assured by Science :
            </h4>
            <p className="text-[#4A4A4A] leading-[28px]">
              We invest in clinical studies on Indian participants to assess the
              potency of our medical-grade products.
            </p>
          </div>
        </div>

      </div>
    </div>
  </div>
</section>



{/* OUR MISSION */}

<section className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-14 items-center">

  {/* CONTENT – LEFT */}
  <div>
    <h2 className="text-3xl font-semibold mb-8 text-[#111111]">
      Our Mission
    </h2>

    <ul className="space-y-8 text-gray-700">

      <li className="flex gap-5">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1ba6a6] text-white flex items-center justify-center font-semibold">
          1
        </div>
        <p className="leading-[28px]">
          To bring clinically-backed skin & hair care solutions to every
          doorstep, making expert dermatology accessible to all.
        </p>
      </li>

      <li className="flex gap-5">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1ba6a6] text-white flex items-center justify-center font-semibold">
          2
        </div>
        <p className="leading-[28px]">
          To blend science, research, and dermatological expertise into
          thoughtfully crafted formulations that deliver real results.
        </p>
      </li>

      <li className="flex gap-5">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1ba6a6] text-white flex items-center justify-center font-semibold">
          3
        </div>
        <p className="leading-[28px]">
          To empower individuals with effective products and expert guidance,
          helping them build confident, consistent self-care routines.
        </p>
      </li>

      <li className="flex gap-5">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1ba6a6] text-white flex items-center justify-center font-semibold">
          4
        </div>
        <p className="leading-[28px]">
          To raise the standard of everyday skincare through transparency,
          innovation, and science-led development.
        </p>
      </li>

    </ul>

    {/* CTA */}
    <button className="mt-10 bg-[#1ba6a6] text-white px-7 py-3 rounded-full hover:bg-[#1ba6a6] transition">
      Consult Now @ ₹249
    </button>
  </div>

  {/* IMAGE – RIGHT */}
<div className="bg-white rounded-xl p-2 shadow-xl">
      <img
        src={valuesImage}
        alt="About Dermedico"
        className="rounded-lg w-full h-[380px] object-cover"
      />
    </div>

</section>



{/* OUR VALUES */}
<section className="max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
  
  {/* Image */}
  <div className="bg-white rounded-xl p-2 shadow-xl">
    <img
      src={valuesImage}
      alt="Our Values"
      className="rounded-lg w-full h-[380px] object-cover"
    />
  </div>

  {/* Text */}
  <div>
    <h3 className="text-3xl font-semibold mb-6">Our Values</h3>

    <ul className="space-y-4 text-gray-700 ">
      <li><strong>Clean Formulation:</strong> Only pure, safe & effective ingredients.</li>
      <li><strong>Cruelty-Free:</strong> No animal testing, ever.</li>
      <li><strong>Dermatologist Approved:</strong> Tested with care.</li>
      <li><strong>Made in India:</strong> Crafted locally with pride.</li>
      <li><strong>Free From Nasties:</strong> No sulphates, silicones or parabens.</li>
    </ul>
  </div>
</section>

<Blog />
<Footer />

        </div>
    );
}
