import React, { useEffect, useState } from "react";
import api, { BASE_URL } from "../api/axiosConfig";
import { useParams, Link } from "react-router-dom";
import Footer from "../Components/Footer";
import Navbar from "../Components/Navbar";

const CoalTarArticle = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get(`/blogs/slug/${slug}`)
      .then(res => {
        setBlog(res.data);

        // Fetch products using categoryId
        if (res.data.category?.id) {
          api.get(`/products/by-category/${res.data.category.id}`)
            .then(p => {
              setProducts(p.data);
            });
        }
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // Function to handle smooth scroll to sections
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading)
    return <div className="p-10 text-center">Loading...</div>;

  if (!blog)
    return <div className="p-10 text-center">Blog Not Found</div>;

  return (
    <div style={{ fontFamily: "Manrope" }} className="min-h-screen bg-white text-gray-800">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-10">

        {/* Breadcrumb - Responsive text */}
        <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">

          <Link to="/" className="hover:text-blue-600">
            Home
          </Link>

          {" > "}

          <Link to="/blogs" className="hover:text-blue-600">
            Blogs
          </Link>

          {" > "}

          <span className="text-gray-700 font-medium">
            {blog.slug || "Article"}
          </span>

        </p>

        {/* Badge */}
        <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium inline-block">
          MEDICALLY REVIEWED
        </span>

        {/* Title - Responsive font sizes */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mt-4 sm:mt-6 leading-tight">
          {blog.title}
        </h1>

        {/* Subtitle if available */}
        {blog.subtitle && (
          <p className="text-sm sm:text-base text-gray-600 mt-2 sm:mt-3">
            {blog.subtitle}
          </p>
        )}

        {/* Author Section - Stack on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 sm:mt-6 border-b border-gray-200 pb-4 sm:pb-6 gap-4 sm:gap-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <img
              src={BASE_URL + blog.authorPhoto}
              alt={blog.authorName || "doctor"}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-gray-900 text-sm sm:text-base">
                {blog.authorName || "Dr. Sarah Chen, MD, FAAD"}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                {blog.authorDescription || "Board Certified Dermatologist"}
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-500">
            Updated {new Date(blog.updatedAt || blog.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Main Grid - Stack on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 mt-6 sm:mt-8 lg:mt-10">

          {/* LEFT CONTENT */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">

            {/* Featured Image - Responsive height */}
            {blog.mainImage && (
              <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <img
                  src={BASE_URL + blog.mainImage}
                  alt={blog.title}
                  className="w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] object-cover"
                />
                {blog.imageCaption && (
                  <div className="bg-gray-50 px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-500">
                    {blog.imageCaption}
                  </div>
                )}
              </div>
            )}

            {/* Heading if available */}
            {blog.heading && (
              <h2 id="what-is" className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                {blog.heading}
              </h2>
            )}

            {/* Content */}
            <div className="text-sm sm:text-base leading-relaxed text-gray-700 space-y-4">
              {blog.content ? (
                <p>{blog.content}</p>
              ) : (
                <>
                  <p>
                    Coal tar has been used in dermatology for over a century. While
                    its name might sound industrial, this byproduct of coal processing
                    remains one of the most effective treatments for stubborn scalp
                    conditions like psoriasis and seborrheic dermatitis.
                  </p>

                  {/* Section */}
                  <div>
                    <h2 id="what-is" className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                      What is Coal Tar?
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      Coal tar is a keratolytic agent. It works by slowing rapid skin
                      cell growth and restoring normal skin appearance. It also helps
                      reduce inflammation, itching, and scaling.
                    </p>
                  </div>

                  {/* Key Takeaways - Responsive padding */}
                  <div className="bg-blue-50 p-4 sm:p-6 rounded-xl border border-blue-100">
                    <h3 className="text-blue-700 font-semibold mb-2 sm:mb-3 text-base sm:text-lg">
                      Key Takeaways
                    </h3>
                    <ul className="space-y-2 text-gray-700 text-xs sm:text-sm">
                      <li>• FDA-approved for dandruff and psoriasis.</li>
                      <li>• Slows excess skin cell production.</li>
                      <li>• Available in 0.5%–5% concentrations.</li>
                    </ul>
                  </div>

                  {/* Mechanism */}
                  <div>
                    <h2 id="mechanism" className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                      Mechanism of Action
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      Coal tar is anti-proliferative and anti-inflammatory. It
                      suppresses excessive DNA synthesis in skin cells.
                    </p>
                  </div>

                  {/* Clinical Efficacy */}
                  <div>
                    <h2 id="efficacy" className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                      Clinical Efficacy
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      Studies show coal tar is effective in reducing scaling, itching,
                      and inflammation associated with scalp conditions.
                    </p>
                  </div>

                  {/* Safety */}
                  <div>
                    <h2 id="safety" className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                      Safety & Side Effects
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      Coal tar can increase sun sensitivity. Some users may experience
                      mild irritation.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Tags - Wrap on mobile */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 sm:gap-3 border-t border-gray-200 pt-4 sm:pt-6">
                {blog.tags.map(tag => (
                  <span
                    key={tag.id}
                    className="bg-gray-100 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm"
                  >
                    #{tag.tagName}
                  </span>
                ))}
              </div>
            )}

            {/* FAQ Section - Responsive padding and margins */}
            {blog.faqs && blog.faqs.length > 0 && (
              <div id="faq" className="pt-8 sm:pt-8 md:pt-12 border-t border-gray-200">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#0f172a] mb-6 sm:mb-8 md:mb-10">
                  Frequently Asked Questions
                </h2>

                <div className="space-y-6 sm:space-y-8 md:space-y-10">
                  {blog.faqs.map(faq => (
                    <div key={faq.id}>
                      <h4 className="text-base sm:text-lg font-semibold text-[#0f172a]">
                        {faq.question}
                      </h4>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed mt-2 sm:mt-3">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR - Responsive grid for mobile */}
          <div className="space-y-4 sm:space-y-6 mt-6 sm:mt-8 lg:mt-0">

            {/* On This Page - Full width cards */}
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
              <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
                ON THIS PAGE
              </h4>

              <ul className="space-y-2 text-xs sm:text-sm text-gray-600">

                <li>
                  <button
                    onClick={() => scrollToSection('overview')}
                    className="text-blue-600 font-medium hover:underline text-left w-full"
                  >
                    {blog.heading || "Overview"}
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => scrollToSection('details')}
                    className="hover:text-blue-600 transition-colors text-left w-full"
                  >
                    Details
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => scrollToSection('usage')}
                    className="hover:text-blue-600 transition-colors text-left w-full"
                  >
                    How to Use
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => scrollToSection('safety')}
                    className="hover:text-blue-600 transition-colors text-left w-full"
                  >
                    Safety & Side Effects
                  </button>
                </li>

                {blog.faqs && blog.faqs.length > 0 && (
                  <li>
                    <button
                      onClick={() => scrollToSection('faq')}
                      className="hover:text-blue-600 transition-colors text-left w-full"
                    >
                      FAQ
                    </button>
                  </li>
                )}

              </ul>
            </div>
            {/* CTA */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-500 p-5 sm:p-6 rounded-xl text-white shadow-lg">
              <h4 className="font-semibold mb-2 text-base sm:text-lg">
                Personalized Haircare Plan
              </h4>
              <p className="text-xs sm:text-sm mb-3 sm:mb-4">
                Not sure if {blog.title?.split(' ')[0] || 'Coal Tar'} is right for you?
              </p>
              <button
                onClick={() => window.location.href = "/contact"}
                className="bg-white text-blue-600 w-full py-2 sm:py-2.5 rounded-lg font-medium text-sm sm:text-base hover:bg-gray-50 transition-colors"
              >
                Book Consultation
              </button>
            </div>

            {/* Recommended Products */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">

              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-gray-900">
                  Recommended Products
                </h4>

                <Link
                  to={`/products/category/${blog.category?.slug}`}
                  state={{ categoryId: blog.category?.id }}
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-5">
                {products.slice(0, 2).map(product => (
                  <Link
                    key={product.id}
                    to={`/product/${product.slug}/${product.category?.slug || "skin-care"}/skincare`}
                    className="flex gap-4 items-center hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  >
                    <div className="w-16 h-16 border border-[#E2E8F0] rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                      <img
                        src={BASE_URL + product.mainImage}
                        alt={product.name}
                        className="object-contain h-12"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {product.name}
                      </p>
                      <p className="text-gray-500 text-xs truncate">
                        {product.size || product.description?.substring(0, 30)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-semibold text-gray-900">
                          ₹{product.price}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <Link
                to={`/products/category/${blog.category?.id}`}
                className="mt-5 w-full border border-[#E2E8F0] rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 transition block text-center"
              >
                View All
              </Link>

            </div>



          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CoalTarArticle;