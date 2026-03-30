import React, { useState, useEffect } from "react";
import api from "../api/api";

export default function ShippingPage() {
  const [addresses, setAddresses] = useState([]);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentVerifying, setPaymentVerifying] = useState(false);

  // Step management
  const [currentStep, setCurrentStep] = useState(1); // 1: Address, 2: Summary, 3: Payment
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [orderSummary, setOrderSummary] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("RAZORPAY");

  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [orderId, setOrderId] = useState(null);

  // Flag to prevent duplicate submissions
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    recipientName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    isDefault: false,
  });

  // Fetch addresses on component mount
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await api.get("/addresses");
      setAddresses(response.data);

      // Auto-select default address if available
      const defaultAddress = response.data.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      } else if (response.data.length > 0) {
        // Select first address if no default exists
        setSelectedAddress(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      alert("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (editingAddress) {
        await api.put(`/addresses/${editingAddress.id}`, formData);
        setEditingAddress(null);
      } else {
        await api.post("/addresses", formData);
      }

      resetForm();
      await fetchAddresses();
      alert(editingAddress ? "Address updated successfully!" : "Address added successfully!");
    } catch (error) {
      console.error("Error saving address:", error);
      alert("Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData({
      recipientName: address.recipientName,
      phone: address.phone,
      street: address.street,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      landmark: address.landmark || "",
      isDefault: address.isDefault,
    });
    setShowForm(true);
  };

  const handleDelete = async (addressId) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        setLoading(true);
        await api.delete(`/addresses/${addressId}`);
        await fetchAddresses();

        // If deleted address was selected, clear selection
        if (selectedAddress && selectedAddress.id === addressId) {
          setSelectedAddress(null);
        }

        alert("Address deleted successfully!");
      } catch (error) {
        console.error("Error deleting address:", error);
        alert("Failed to delete address");
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      recipientName: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      pincode: "",
      landmark: "",
      isDefault: false,
    });
    setEditingAddress(null);
    setShowForm(false);
  };

  // Step 1: Address Selection
  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
  };

  const proceedToSummary = () => {
    if (!selectedAddress) {
      alert("Please select a shipping address");
      return;
    }
    setCurrentStep(2);
  };

  // Step 2: Checkout Summary - For RAZORPAY only, create order
  const handleCheckout = async () => {
    if (paymentMethod === "COD") {
      // For COD, just go to payment step without creating order
      setCurrentStep(3);
      return;
    }

    try {
      setCheckoutLoading(true);
      const response = await api.post("/orders/checkout", {
        shippingAddressId: selectedAddress.id,
        paymentMethod: paymentMethod
      });

      setOrderSummary(response.data);
      setCurrentStep(3);
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Checkout failed: " + (error.response?.data?.message || error.message));
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Step 3: Payment - Initialize Razorpay
  const initializeRazorpay = () => {
    if (!orderSummary) {
      alert("Order summary not available");
      return;
    }

    const options = {
      key: orderSummary.razorpayKeyId,
      amount: orderSummary.totalAmount * 100, // in paise
      currency: "INR",
      name: "Dermedicostore",
      description: "Order Payment",
      order_id: orderSummary.razorpayOrderId,
      handler: async function (response) {
        await verifyPayment(response);
      },
      prefill: {
        name: selectedAddress.recipientName,
        contact: selectedAddress.phone,
      },
      theme: {
        color: "#5CB8C9"
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const verifyPayment = async (paymentResponse) => {
    try {
      setPaymentVerifying(true);
      const verificationResponse = await api.post("/payments/verify", {
        razorpayOrderId: paymentResponse.razorpay_order_id,
        razorpayPaymentId: paymentResponse.razorpay_payment_id,
        razorpaySignature: paymentResponse.razorpay_signature
      });

      setSuccessMessage("Payment successful! Your order has been placed.");
      setOrderId(verificationResponse.data.orderId || "N/A");
      setShowSuccessModal(true);

    } catch (error) {
      console.error("Payment verification failed:", error);
      alert("Payment verification failed: " + (error.response?.data?.message || error.message));
    } finally {
      setPaymentVerifying(false);
    }
  };

  // Handle COD order placement - ONLY CREATE ORDER HERE, NOT IN STEP 2
  const handlePlaceOrderCOD = async () => {
    // Prevent double submission
    if (isProcessing || checkoutLoading) {
      console.log("Already processing, preventing duplicate");
      return;
    }

    if (!selectedAddress) {
      alert("Please select a shipping address");
      return;
    }

    try {
      setIsProcessing(true);
      setCheckoutLoading(true);

      console.log("Creating COD order...");
      const response = await api.post("/orders/checkout", {
        shippingAddressId: selectedAddress.id,
        paymentMethod: "COD"
      });

      console.log("COD order created:", response.data);

      setSuccessMessage("Order placed successfully with Cash on Delivery!");
      setOrderId(response.data.orderNumber || response.data.id || "N/A");
      setShowSuccessModal(true);

    } catch (error) {
      console.error("Order placement failed:", error);

      // Show specific error message if available
      const errorMsg = error.response?.data?.message || error.message;
      alert("Order placement failed: " + errorMsg);

    } finally {
      setCheckoutLoading(false);
      setIsProcessing(false);
    }
  };

  const handleSuccessRedirect = () => {
    setShowSuccessModal(false);
    // Reset states
    setIsProcessing(false);
    // Redirect to profile orders page
    window.location.href = "/profile?tab=orders";
  };

  // Success Modal Component
  const SuccessModal = () => {
    if (!showSuccessModal) return null;

    return (
      <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6 transform transition-all mx-4 sm:mx-auto">
          <div className="text-center">
            {/* Success Icon */}
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {/* Success Message */}
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Order Placed Successfully!</h3>
            <p className="text-gray-600 mb-4">{successMessage}</p>

            {/* Order ID */}
            {orderId && orderId !== "N/A" && (
              <p className="text-sm text-gray-500 mb-4">Order ID: {orderId}</p>
            )}

            {/* Redirect Button */}
            <button
              onClick={handleSuccessRedirect}
              className="w-full bg-[#5CB8C9] text-white py-3 rounded-md hover:bg-[#4da6b5] transition font-medium"
            >
              View My Orders
            </button>

            {/* Auto-redirect notice */}
            <p className="text-xs text-gray-500 mt-3">
              Redirecting automatically in 5 seconds...
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Auto-redirect after success modal shows
  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        handleSuccessRedirect();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showSuccessModal]);

  // Reset processing state when component unmounts
  useEffect(() => {
    return () => {
      setIsProcessing(false);
    };
  }, []);

  // Stepper Component - Responsive
  const Stepper = () => (
    <div className="flex items-center justify-center mb-6 sm:mb-8 px-2">
      <div className="flex items-center w-full max-w-md">
        {/* Step 1 */}
        <div className="flex flex-col items-center flex-1">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base ${currentStep >= 1 ? 'bg-[#5CB8C9] text-white' : 'bg-gray-200 text-gray-500'
            }`}>
            1
          </div>
          <span className={`mt-2 text-xs sm:text-sm text-center ${currentStep >= 1 ? 'text-[#5CB8C9] font-medium' : 'text-gray-500'}`}>
            Address
          </span>
        </div>

        {/* Line 1 */}
        <div className={`flex-1 h-1 mx-1 sm:mx-2 ${currentStep >= 2 ? 'bg-[#5CB8C9]' : 'bg-gray-200'}`}></div>

        {/* Step 2 */}
        <div className="flex flex-col items-center flex-1">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base ${currentStep >= 2 ? 'bg-[#5CB8C9] text-white' : 'bg-gray-200 text-gray-500'
            }`}>
            2
          </div>
          <span className={`mt-2 text-xs sm:text-sm text-center ${currentStep >= 2 ? 'text-[#5CB8C9] font-medium' : 'text-gray-500'}`}>
            Summary
          </span>
        </div>

        {/* Line 2 */}
        <div className={`flex-1 h-1 mx-1 sm:mx-2 ${currentStep >= 3 ? 'bg-[#5CB8C9]' : 'bg-gray-200'}`}></div>

        {/* Step 3 */}
        <div className="flex flex-col items-center flex-1">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base ${currentStep >= 3 ? 'bg-[#5CB8C9] text-white' : 'bg-gray-200 text-gray-500'
            }`}>
            3
          </div>
          <span className={`mt-2 text-xs sm:text-sm text-center ${currentStep >= 3 ? 'text-[#5CB8C9] font-medium' : 'text-gray-500'}`}>
            Payment
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <section className="max-w-6xl mx-auto mt-6 sm:mt-10 lg:mt-20 mb-6 sm:mb-10 lg:mb-20 px-3 sm:px-4 lg:px-6 font-[Poppins]">
      {/* Success Modal */}
      <SuccessModal />

      {/* PAGE HEADER */}
      <div className="text-center mb-6 sm:mb-8 px-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#333] mb-2">Checkout</h1>
        <p className="text-sm sm:text-base text-gray-600">Complete your purchase in 3 simple steps</p>
      </div>

      {/* STEPPER */}
      <Stepper />

      <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
        {/* LEFT SIDE - MAIN CONTENT */}
        <div className="flex-1">
          {/* STEP 1: ADDRESS SELECTION */}
          {currentStep === 1 && (
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-[#333]">
                  Select Shipping Address
                </h2>
                {!showForm && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-[#5CB8C9] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-md hover:bg-[#4da6b5] transition font-medium flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    <span>+</span>
                    <span>Add New Address</span>
                  </button>
                )}
              </div>

              {/* ADDRESS LIST */}
              {!showForm && (
                <div className="space-y-4 sm:space-y-6">
                  {loading ? (
                    <div className="text-center py-8 sm:py-12">
                      <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-[#5CB8C9] mx-auto"></div>
                      <p className="text-gray-500 mt-3 sm:mt-4 text-sm sm:text-base">Loading addresses...</p>
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 mx-2 sm:mx-0">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No addresses yet</h3>
                      <p className="text-gray-500 mb-4 text-sm sm:text-base">Add your first shipping address to get started</p>
                      <button
                        onClick={() => setShowForm(true)}
                        className="bg-[#5CB8C9] text-white px-6 py-2 rounded-md hover:bg-[#4da6b5] transition font-medium"
                      >
                        Add Your First Address
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:gap-6 px-2 sm:px-0">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className={`border rounded-lg p-4 sm:p-6 transition-all cursor-pointer ${selectedAddress?.id === address.id
                            ? 'border-[#5CB8C9] bg-blue-50 ring-2 ring-[#5CB8C9]'
                            : 'border-gray-200 hover:border-[#5CB8C9] hover:shadow-md'
                            }`}
                          onClick={() => handleAddressSelect(address)}
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="selectedAddress"
                                checked={selectedAddress?.id === address.id}
                                onChange={() => handleAddressSelect(address)}
                                className="w-4 h-4 text-[#5CB8C9] focus:ring-[#5CB8C9]"
                              />
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                                  {address.recipientName}
                                </h3>
                                {address.isDefault && (
                                  <span className="bg-[#5CB8C9] text-white text-xs px-2 py-1 rounded-full font-medium w-fit">
                                    Default
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 sm:gap-3 ml-6 sm:ml-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(address);
                                }}
                                className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium px-2 sm:px-3 py-1 border border-blue-600 rounded hover:bg-blue-600 hover:text-white transition flex-1 sm:flex-none"
                              >
                                Edit
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(address.id);
                                }}
                                className="text-xs sm:text-sm text-red-600 hover:text-red-800 font-medium px-2 sm:px-3 py-1 border border-red-600 rounded hover:bg-red-600 hover:text-white transition flex-1 sm:flex-none"
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2 text-gray-700 text-sm sm:text-base">
                            <p className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {address.phone}
                            </p>
                            <p className="flex items-start gap-2">
                              <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>
                                {address.street}, {address.city}, {address.state} - {address.pincode}
                                {address.landmark && <span className="block text-gray-500 mt-1 text-sm">Landmark: {address.landmark}</span>}
                              </span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* CONTINUE BUTTON */}
              {!showForm && addresses.length > 0 && (
                <div className="mt-6 sm:mt-8 flex justify-end px-2 sm:px-0">
                  <button
                    onClick={proceedToSummary}
                    disabled={!selectedAddress}
                    className="bg-[#5CB8C9] text-white px-6 sm:px-8 py-3 rounded-md hover:bg-[#4da6b5] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                  >
                    Continue to Summary
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: ORDER SUMMARY */}
          {currentStep === 2 && (
            <div className="px-2 sm:px-0">
              <h2 className="text-lg sm:text-xl font-semibold text-[#333] mb-6">Order Summary</h2>

              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Shipping Address</h3>
                {selectedAddress && (
                  <div className="space-y-2 text-gray-700 text-sm sm:text-base">
                    <p><strong>{selectedAddress.recipientName}</strong></p>
                    <p>{selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}</p>
                    <p>Phone: {selectedAddress.phone}</p>
                    {selectedAddress.landmark && <p>Landmark: {selectedAddress.landmark}</p>}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Payment Method</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="RAZORPAY"
                      checked={paymentMethod === "RAZORPAY"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-[#5CB8C9] focus:ring-[#5CB8C9]"
                    />
                    <span className="text-sm sm:text-base">Razorpay (Credit/Debit Card, UPI, Net Banking)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-[#5CB8C9] focus:ring-[#5CB8C9]"
                    />
                    <span className="text-sm sm:text-base">Cash on Delivery (COD)</span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="bg-gray-300 text-gray-700 px-4 sm:px-6 py-3 rounded-md hover:bg-gray-400 transition font-medium order-2 sm:order-1 w-full sm:w-auto"
                >
                  Back to Address
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="bg-[#5CB8C9] text-white px-6 sm:px-8 py-3 rounded-md hover:bg-[#4da6b5] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2 w-full sm:w-auto"
                >
                  {checkoutLoading ? "Processing..." : paymentMethod === "COD" ? "Continue to Payment" : "Proceed to Payment"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT */}
          {currentStep === 3 && (
            <div className="px-2 sm:px-0">
              <h2 className="text-lg sm:text-xl font-semibold text-[#333] mb-6">Payment</h2>

              {/* Show order summary only for Razorpay (since order is already created) */}
              {paymentMethod === "RAZORPAY" && orderSummary && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
                  <div className="space-y-3 text-sm sm:text-base">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{orderSummary.subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>
                        ₹{orderSummary?.tax
                          ? Number(orderSummary.tax).toFixed(2)
                          : "0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping Charges:</span>
                      <span>₹{orderSummary.shippingCharges}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span>-₹{orderSummary.discount}</span>
                    </div>
                    <div className="flex justify-between text-base sm:text-lg font-semibold border-t pt-3">
                      <span>Total Amount:</span>
                      <span>
                        ₹{orderSummary?.totalAmount
                          ? Number(orderSummary.totalAmount).toFixed(2)
                          : "0.00"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "RAZORPAY" ? (
                <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Complete Payment</h3>
                  <p className="text-gray-600 mb-4 text-sm sm:text-base">
                    Click the button below to complete your payment securely via Razorpay.
                  </p>
                  <button
                    onClick={initializeRazorpay}
                    disabled={paymentVerifying || !orderSummary}
                    className="bg-[#5CB8C9] text-white px-6 sm:px-8 py-3 rounded-md hover:bg-[#4da6b5] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                  >
                    {paymentVerifying ? "Verifying Payment..." : "Pay with Razorpay"}
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Cash on Delivery</h3>
                  <p className="text-gray-600 mb-4 text-sm sm:text-base">
                    Your order will be delivered to your address. Please keep the exact amount ready for payment upon delivery.
                  </p>
                  <button
                    onClick={handlePlaceOrderCOD}
                    disabled={checkoutLoading || isProcessing}
                    className="bg-[#5CB8C9] text-white px-6 sm:px-8 py-3 rounded-md hover:bg-[#4da6b5] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                  >
                    {checkoutLoading ? "Placing Order..." : "Confirm COD Order"}
                  </button>
                </div>
              )}

              <div className="flex justify-between gap-4">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="bg-gray-300 text-gray-700 px-4 sm:px-6 py-3 rounded-md hover:bg-gray-400 transition font-medium w-full sm:w-auto"
                >
                  Back to Summary
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDE - ADDRESS FORM (Only in Step 1) */}
        {currentStep === 1 && showForm && (
          <div className="w-full lg:w-96">
            <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 lg:sticky lg:top-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-[#333]">
                  {editingAddress ? "Edit Address" : "Add New Address"}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700 transition"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Recipient Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Name *</label>
                  <input
                    type="text"
                    name="recipientName"
                    placeholder="Enter recipient name"
                    value={formData.recipientName}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#F3F3F3] rounded-md px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0074A8] focus:bg-white transition-colors"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    name="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#F3F3F3] rounded-md px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0074A8] focus:bg-white transition-colors"
                  />
                </div>

                {/* Street Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                  <textarea
                    name="street"
                    placeholder="Enter street address"
                    value={formData.street}
                    onChange={handleChange}
                    required
                    rows="3"
                    className="w-full bg-[#F3F3F3] rounded-md px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0074A8] focus:bg-white transition-colors resize-none"
                  />
                </div>

                {/* Pincode, City, State & Landmark */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      placeholder="Enter pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      maxLength={6}
                      required
                      className="w-full bg-[#F3F3F3] rounded-md px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0074A8] focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      placeholder="Enter city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full bg-[#F3F3F3] rounded-md px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0074A8] focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <input
                      type="text"
                      name="state"
                      placeholder="Enter state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      className="w-full bg-[#F3F3F3] rounded-md px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0074A8] focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Landmark (Optional)</label>
                    <input
                      type="text"
                      name="landmark"
                      placeholder="Enter landmark"
                      value={formData.landmark}
                      onChange={handleChange}
                      className="w-full bg-[#F3F3F3] rounded-md px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0074A8] focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                {/* Default Address Checkbox */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isDefault"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={handleChange}
                    className="w-4 h-4 text-[#5CB8C9] focus:ring-[#5CB8C9] rounded"
                  />
                  <label htmlFor="isDefault" className="text-sm text-gray-700">
                    Set as default address
                  </label>
                </div>

                {/* Save / Submit Action */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#5CB8C9] text-white font-medium py-3 px-6 rounded-md hover:bg-[#4da6b5] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Saving..." : editingAddress ? "Update Address" : "Save Address"}
                  </button>
                  {editingAddress && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-md hover:bg-gray-400 transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}