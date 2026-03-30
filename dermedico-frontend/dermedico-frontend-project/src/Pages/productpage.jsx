import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Star } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../Components/Navbar";
import PublicApi, { BASE_URL } from "../api/axiosConfig";
import SecureApi from "../api/api";
import { useCart } from "../Context/CartContext";
import { toast } from "react-toastify";
import Footer from "../Components/Footer";


// Create axios instance

export default function ProductPage() {
  const [size, setSize] = useState("50 ml");
  const [pincode, setPincode] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [openIndex, setOpenIndex] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const { loadCart } = useCart();
const { slug } = useParams();
  const navigate = useNavigate();

  // Review states
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });
  const [reviewLoading, setReviewLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    title: "",
    comment: ""
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const { addToCart } = useCart();

  // Fetch product data
  // useEffect(() => {
  //   const fetchProduct = async () => {
  //     try {
  //       const response = await PublicApi.get(`/products/${id}`);
  //       setProduct(response.data);

  //       // Set initial selected image to main image
  //       if (response.data.mainImage) {
  //         setSelectedImage(`${BASE_URL}${response.data.mainImage}`);
  //       }

  //       setLoading(false);
  //     } catch (err) {
  //       setError("Failed to fetch product data");
  //       setLoading(false);
  //       console.error("Error fetching product:", err);
  //     }
  //   };

  //   fetchProduct();
  // }, [id]);


  useEffect(() => {
  const fetchProduct = async () => {
    try {

      // CALL SLUG API
 const response = await PublicApi.get(
        `/products/slug/${slug}`
      );
      setProduct(response.data);

      // Set main image
      if (response.data.mainImage) {
        setSelectedImage(`${BASE_URL}${response.data.mainImage}`);
      }

      setLoading(false);

    } catch (err) {

      setError("Failed to fetch product data");
      setLoading(false);

      console.error("Error fetching product:", err);

    }
  };

  fetchProduct();

}, [slug]);

  // Fetch reviews
  // useEffect(() => {
  //   const fetchReviews = async () => {
  //     try {
  //       setReviewLoading(true);
  //       const response = await SecureApi.get(`/reviews/product/${id}?page=0&size=10`);
  //       setReviews(response.data.content || []);

  //       // Calculate review statistics
  //       calculateReviewStats(response.data.content || []);
  //       setReviewLoading(false);
  //     } catch (err) {
  //       console.error("Error fetching reviews:", err);
  //       setReviewLoading(false);
  //     }
  //   };

  //   if (id) {
  //     fetchReviews();
  //   }
  // }, [id]);

  useEffect(() => {

  const fetchReviews = async () => {

    if (!product?.id) return;

    try {

      setReviewLoading(true);

      const response = await SecureApi.get(
        `/reviews/product/${product.id}?page=0&size=10`
      );

      setReviews(response.data.content || []);

      calculateReviewStats(response.data.content || []);

      setReviewLoading(false);

    } catch (err) {

      console.error("Error fetching reviews:", err);
      setReviewLoading(false);

    }

  };

  fetchReviews();

}, [product]);

  const calculateReviewStats = (reviews) => {
    if (!reviews.length) {
      setReviewStats({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      });
      return;
    }

    const total = reviews.length;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / total;

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating]++;
    });

    setReviewStats({
      averageRating: average,
      totalReviews: total,
      ratingDistribution: distribution
    });
  };

  // Prepare thumbnails array
  const getThumbnails = () => {
    if (!product) return [];

    const thumbnails = [];

    // Add main image as first thumbnail
    if (product.mainImage) {
      thumbnails.push({
        id: 0,
        src: `${BASE_URL}${product.mainImage}`,
        alt: product.name
      });
    }

    // Add thumbnail images
    if (product.thumbnailImages) {
      const thumbnailArray = product.thumbnailImages.split(',');
      thumbnailArray.forEach((thumb, index) => {
        thumbnails.push({
          id: index + 1,
          src: `${BASE_URL}${thumb}`,
          alt: `${product.name} - View ${index + 1}`
        });
      });
    }

    return thumbnails;
  };

  // Prepare bottom banner images
  const getBottomBanners = () => {
    if (!product || !product.bannerImages) return [];

    const bannerArray = product.bannerImages.split(',');
    return bannerArray.map(banner => `${BASE_URL}${banner}`);
  };

  // Prepare specifications for accordion
  const getSpecifications = () => {
    if (!product || !product.specifications) return [];

    const specs = product.specifications;
    return [
      { title: "Description", content: specs.detailedDescription },
      { title: "Directions for use", content: specs.directionsForUse },
      { title: "Features", content: specs.features },
      { title: "Benefits", content: specs.benefits },
      { title: "Ingredients", content: specs.ingredients },
    ];
  };

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handlePincodeCheck = async () => {
    if (!pincode.trim()) {
      setDeliveryMessage("⚠️ Please enter a pincode.");
      return;
    }

    try {
      const response = await PublicApi.get(`/pincode/check/${pincode}`);
      console.log("✅ API Response:", response.data);

      if (response.data.deliveryAvailable === true) {
        setDeliveryMessage(`✅ Delivery available in ${response.data.estimatedDays} days`);
      } else {
        setDeliveryMessage(`❌ Delivery not available to ${pincode}`);
      }

    } catch (error) {
      console.error("❌ Error checking pincode:", error);
      setDeliveryMessage("⚠️ Something went wrong. Try again.");
    }
  };


  //     const handleAddToCart = async () => {
  //   try {
  //     // ✅ Try adding directly (user logged in)
  //     await SecureApi.post(
  //       `/cart/add?productId=${product.id}&quantity=1`,
  //       null,
  //       { withCredentials: true }
  //     );

  //     loadCart();
  //     toast.success("Added to cart!");

  //     // ✅ Logged in users stay on page
  //     return;

  //   } catch (error) {

  //     // ❌ User NOT logged in
  //     if (error.response?.status === 401 || error.response?.status === 403) {

  //       // 🧠 Save product temporarily
  //       localStorage.setItem(
  //         "postLoginCheckoutItem",
  //         JSON.stringify({
  //           productId: product.id,
  //           quantity: 1
  //         })
  //       );

  // toast.info("Please login to continue. Your product is saved.", {
  //   autoClose: 2500
  // });
  //       navigate("/login");
  //       return;
  //     }

  //     toast.error("Something went wrong");
  //   }
  // };



  const handleAddToCart = async (product, e) => {
    e.stopPropagation();

    try {
      await addToCart(product, 1);
      toast.success("Item added to cart!");
    } catch (err) {
      toast.error("❌ Failed to add item");
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!reviewForm.rating) {
      toast.error("Please select a rating");
      return;
    }

    setSubmittingReview(true);
    try {
      await SecureApi.post('/reviews', {
  productId: product.id,
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment
      }, {
        withCredentials: true
      });

      toast.success("Review submitted successfully!");
      setReviewForm({ rating: 0, title: "", comment: "" });
      setShowReviewForm(false);

      // Refresh reviews
      const response = await SecureApi.get(`/reviews/product/${id}?page=0&size=10`);
      setReviews(response.data.content || []);
      calculateReviewStats(response.data.content || []);

    } catch (error) {
      console.error("❌ Review submission error:", error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.warning("⚠️ Please login to write a review!");
        setTimeout(() => {
          navigate("/login");
        }, 1200);
        return;
      }

      toast.error("❌ Failed to submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating, size = 16) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={`${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
              }`}
          />
        ))}
      </div>
    );
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="max-w-5xl mx-auto px-6 py-10 flex justify-center items-center h-64">
          <p className="text-lg">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="max-w-5xl mx-auto px-6 py-10 flex justify-center items-center h-64">
          <p className="text-lg text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <Navbar />
        <div className="max-w-5xl mx-auto px-6 py-10 flex justify-center items-center h-64">
          <p className="text-lg">Product not found</p>
        </div>
      </div>
    );
  }

  const thumbnails = getThumbnails();
  const bottomImages = getBottomBanners();
  const specifications = getSpecifications();

  return (
    <div>
      {/* Navbar */}
      <Navbar />

      {/* Page Wrapper */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left Image Gallery */}
          <div className="flex flex-col items-center">
            {/* Main Product Image */}
            <div className="w-full max-w-[436px] h-[436px] flex items-center justify-center mb-4">
              <img
                src={selectedImage}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {/* Thumbnails Grid */}
            <div className="flex flex-wrap justify-center gap-3 mt-1 max-w-[436px]">
              {thumbnails.map((thumb) => (
                <div
                  key={thumb.id}
                  className={`w-18 h-18 flex items-center justify-center cursor-pointer transition-all duration-200 ${selectedImage === thumb.src
                      ? "opacity-100"
                      : "opacity-70 hover:opacity-100"
                    }`}
                  onClick={() => setSelectedImage(thumb.src)}
                >
                  <img
                    src={thumb.src}
                    alt={thumb.alt}
                    className="object-contain max-h-full max-w-full"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right Product Details */}
          <div>
            {/* Breadcrumb */}
            <p className="font-raleway font-medium text-[14px] leading-[18px] text-[#7E7E7E] mb-2">
              HOME / PRODUCTS / {product.name.toUpperCase()}
            </p>

            <h1 className="font-raleway font-medium text-[25px] leading-[48px] text-black mb-2">
              {product.name}
            </h1>

            {/* Reviews */}
            <div className="flex items-center poppins-regular gap-2 mb-3">
              {renderStars(Math.round(reviewStats.averageRating))}
              <p className="text-gray-600 text-sm">
                {reviewStats.totalReviews} Review{reviewStats.totalReviews !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Short Description */}
            <p className="font-poppins text-[16px] text-[#4A4A4A] mb-4">
              {product.description}
            </p>

            {/* Price */}
            <p className="text-2xl text-[#1E1E1E] poppins-regular font-bold mb-1">
              ₹{product.price}
            </p>

            {/* Stock Status */}
            <div className="mb-4">
              <p className={`text-sm font-medium ${product.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                {product.stockQuantity > 0
                  ? `In Stock (${product.stockQuantity} available)`
                  : 'Out of Stock'
                }
              </p>
            </div>

            {/* Delivery Option */}
            {/* <div className="mb-4 poppins-regular">
              <p className="mb-2 text-[#4A4A4A] font-medium">Delivery Option</p>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Enter Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="border-[#7E7E7E] border rounded-lg px-2 py-1 w-50 text-sm poppins-regular"
                />
                <button
                  onClick={handlePincodeCheck}
                  className="bg-[#DF6C52] text-white px-4 py-1 rounded-lg"
                >
                  Check Now
                </button>
              </div>

              {deliveryMessage && (
                <p className="mt-2 text-sm">
                  {deliveryMessage}
                </p>
              )}
            </div> */}

            {/* Add to Cart */}
            <button
              onClick={(e) => handleAddToCart(product, e)}
              disabled={product.stockQuantity <= 0}
              className="w-[150px] h-[40px] poppins-regular bg-[#60A8CA] hover:bg-[#4a90e2] text-white font-medium px-4 py-2 rounded-md text-sm mb-8 disabled:bg-gray-400 disabled:cursor-not-allowed"

            >
              {product.stockQuantity > 0 ? "Add to Cart" : "Out of Stock"}
            </button>

            {/* Specifications Section */}
            <div className="poppins-regular">
              <h2 className="text-xl text-[#4A4A4A] font-semibold mb-4">
                SPECIFICATIONS
              </h2>
              <div className="divide-y divide-[#CFCFCF]">
                {specifications.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col cursor-pointer"
                    onClick={() => toggleAccordion(index)}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-center px-4 py-3">
                      <span className="font-poppins text-[16px] text-[#4A4A4A]">
                        {item.title}
                      </span>
                      {openIndex === index ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </div>

                    {/* Content */}
                    {openIndex === index && (
                      <div className="px-4 pb-4 text-gray-600 text-sm whitespace-pre-line">
                        {item.content}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Banners */}
        <div className="mt-12 flex flex-col items-center">
          {bottomImages.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Bottom Banner ${index + 1}`}
              className="max-w-[600px] w-full object-contain"
            />
          ))}
        </div>

        {/* Customer Reviews Section */}
        <div className="mt-16 poppins-regular">
          <h2 className="text-center text-[#4A4A4A] text-2xl font-semibold mb-8">
            Customer Reviews
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left - Ratings Summary */}
            <div>
              <div className="flex items-center gap-2 text-2xl font-bold">
                {reviewStats.averageRating.toFixed(1)}
                <span className="text-yellow-500">
                  {renderStars(Math.round(reviewStats.averageRating), 20)}
                </span>
              </div>
              <p className="text-gray-600 mb-4">
                {reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? 's' : ''}
              </p>

              {/* Rating Bars */}
              {[5, 4, 3, 2, 1].map((star) => {
                const percentage = reviewStats.totalReviews > 0
                  ? (reviewStats.ratingDistribution[star] / reviewStats.totalReviews) * 100
                  : 0;

                return (
                  <div key={star} className="flex items-center gap-2 mb-1">
                    <span className="text-yellow-500 text-sm w-6">
                      {star}★
                    </span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full">
                      <div
                        className="h-full bg-yellow-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8">
                      {reviewStats.ratingDistribution[star]}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Right - Write a Review */}
            <div className="text-center md:text-left">
              <p className="text-gray-600 mb-3">
                Share your experience <br />
                Every review helps us make skincare better. Let us know how it
                worked for you.
              </p>
              <button
                onClick={() => setShowReviewForm(true)}
                className="bg-[#60A8CA] text-white px-4 py-2 rounded-xl hover:bg-[#4a90e2] transition-colors"
              >
                Write a Review
              </button>
            </div>
          </div>

          {/* Review Form Modal */}
          {showReviewForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
                <form onSubmit={handleReviewSubmit}>
                  {/* Star Rating */}
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Rating</label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                          className="text-2xl focus:outline-none"
                        >
                          <Star
                            className={`${star <= reviewForm.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                              } hover:text-yellow-400 hover:fill-yellow-400 transition-colors`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Review Title */}
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={reviewForm.title}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#60A8CA]"
                      placeholder="Give your review a title"
                      required
                    />
                  </div>

                  {/* Review Comment */}
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2">Review</label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#60A8CA]"
                      rows="4"
                      placeholder="Share your experience with this product..."
                      required
                    ></textarea>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-4 py-2 bg-[#60A8CA] text-white rounded-lg hover:bg-[#4a90e2] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Individual Reviews */}
          <div className="mt-10 space-y-6">
            {reviewLoading ? (
              <div className="text-center py-8">
                <p>Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#60A8CA] text-white font-semibold">
                    {getInitials(review.user?.firstName)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <p className="font-semibold">
                        {review.user?.firstName} {review.user?.lastName}
                      </p>
                      <div className="flex items-center">
                        {renderStars(review.rating, 16)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    {review.title && (
                      <p className="font-medium text-lg mb-2">{review.title}</p>
                    )}
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}