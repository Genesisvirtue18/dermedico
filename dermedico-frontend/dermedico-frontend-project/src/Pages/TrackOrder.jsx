import React, { useState } from "react";
import api from "../api/axiosConfig";
import { CheckCircle2, Circle } from "lucide-react";
import Navbar from "../Components/Navbar";
import trackImage from "../assets/Track/track-image.png"; // ✅ Import your image

const statuses = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];

const statusLabels = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

const TrackOrder = () => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTrack = async () => {
    if (!trackingNumber.trim()) return;
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const response = await api.get(`/order/track?trackingNumber=${trackingNumber}`);
      setOrder(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Order not found");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (status) => statuses.indexOf(status);

  return (
    <>
      <Navbar />
      {/* ✅ Background Image Section */}
      <div
        className="min-h-screen poppins-regular flex flex-col items-center justify-center px-4 py-10 bg-cover bg-center relative"
        style={{
          backgroundImage: `url(${trackImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Optional overlay for readability */}
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="relative z-10 w-full flex flex-col items-center">
          {/* Track Form */}
          <div className="bg-white/90 shadow-lg rounded-2xl p-6 md:p-8 w-full max-w-md mb-8 backdrop-blur-sm">
            <h2 className="text-center text-lg md:text-xl font-semibold mb-6 text-gray-800">
              Track Your Order
            </h2>
            <input
              type="text"
              placeholder="Enter Tracking Number"
              className="w-full border border-gray-300 rounded-md px-4 py-2 mb-4 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
            <button
              onClick={handleTrack}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md transition-all"
            >
              {loading ? "Tracking..." : "Track Now"}
            </button>
            {error && <p className="text-red-500 text-center mt-3">{error}</p>}
          </div>

          {/* Order Details */}
          {order && (
            <div className="bg-white/90 shadow-lg rounded-2xl p-8 w-full max-w-3xl backdrop-blur-sm">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold">Order ID: #{order.id}</h3>
                <p className="text-gray-500 text-sm">
                  Tracking No: {order.trackingNumber}
                </p>
                <p className="mt-2 text-gray-600">
                  Status:{" "}
                  <span className="font-medium text-green-600">
                    {statusLabels[order.status]}
                  </span>
                </p>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center justify-between relative mb-8">
                {statuses.slice(0, 4).map((status, index) => {
                  const completed = getStatusIndex(order.status) >= index;
                  return (
                    <div
                      key={status}
                      className="flex flex-col items-center text-center w-full relative"
                    >
                      <div
                        className={`${
                          completed ? "bg-green-500" : "bg-gray-300"
                        } w-8 h-8 flex items-center justify-center rounded-full mb-2`}
                      >
                        {completed ? (
                          <CheckCircle2 className="text-white w-6 h-6" />
                        ) : (
                          <Circle className="text-white w-6 h-6" />
                        )}
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          completed ? "text-green-600" : "text-gray-400"
                        }`}
                      >
                        {statusLabels[status]}
                      </span>
                      {index < 3 && (
                        <div
                          className={`absolute top-4 left-1/2 w-full h-[2px] ${
                            completed ? "bg-green-500" : "bg-gray-300"
                          }`}
                          style={{ zIndex: -1 }}
                        ></div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Shipping Address */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Shipping Address</h4>
                <p className="text-sm text-gray-600">
                  {order.shippingAddress.recipientName},{" "}
                  {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
                  {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </p>
                <p className="text-sm text-gray-600">
                  Phone: {order.shippingAddress.phone}
                </p>
              </div>

              {/* Items */}
              <div className="border-t mt-4 pt-4">
                <h4 className="font-semibold mb-2">Items</h4>
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between border-b py-2">
                    <span className="text-gray-700">{item.productName}</span>
                    <span className="text-gray-700">
                      {item.quantity} × ₹{item.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Payment Summary */}
              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>₹{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>₹{order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping:</span>
                  <span>₹{order.shippingCharges.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-gray-800 mt-2">
                  <span>Total:</span>
                  <span>₹{order.totalAmount.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Payment Method: {order.paymentMethod}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TrackOrder;
