// src/Pages/Home.jsx
import Hero from "../Components/Hero";
import TopSellers from "../Components/TopSellers";
import BrandBanners from "../Components/BrandBanners";
import BrandShop from "../Components/BrandShop";
import Concern from "../Components/Concern";
import TrendingProducts from "../Components/TrendingProducts";
import BlogSection from "../Components/BlogSection";
import Faq from "../Components/Faq";
import Category from "../Components/category";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";


export default function Home() {
  return (
    <div className="font-sans text-gray-800">
      <Navbar />
      <Hero />
            <Category />

      <TopSellers />
      <BrandBanners />
      <BrandShop />
      <Concern />
      <TrendingProducts />
      <Faq />
      <BlogSection />
      <Footer />
    </div>
  );
}
