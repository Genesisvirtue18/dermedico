import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Edit, Trash2, Star } from "lucide-react";
import productImg from "../assets/ProductPage/main-product.png";
import api, { BASE_URL } from "../api/api";
import Navbar from "../Components/Navbar";
import { useCart } from "../Context/CartContext";
import { useNavigate, useLocation } from "react-router-dom";
import Footer from "../Components/Footer";

const AccountPage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [expanded, setExpanded] = useState(null);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    recipientName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    isDefault: false
  });
  const { loadCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");

    if (tab === "orders" || tab === "wishlist" || tab === "profile") {
      setActiveTab(tab);
    }
  }, [location]);

  // Fetch addresses when profile tab is active
  useEffect(() => {
    if (activeTab === "profile") {
      fetchAddresses();
      fetchUserProfile();
    }
  }, [activeTab]);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get(`/user`);
      setProfile(response.data);
    } catch (err) {
      setError("Failed to load profile");
      console.error("Profile fetch error:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Fetch orders when orders tab is active
  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    }
  }, [activeTab]);

  // Fetch wishlist when wishlist tab is active
  useEffect(() => {
    if (activeTab === "wishlist") {
      fetchWishlist();
    }
  }, [activeTab]);

  const fetchAddresses = async () => {
    try {
      setAddressLoading(true);
      const response = await api.get("/addresses");
      setAddresses(response.data);
    } catch (err) {
      setError("Failed to fetch addresses");
      console.error("Error fetching addresses:", err);
    } finally {
      setAddressLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/orders?page=0&size=10");
      setOrders(response.data.content || response.data);
    } catch (err) {
      setError("Failed to fetch orders");
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/wishlist");
      setWishlist(response.data);
    } catch (err) {
      setError("Failed to fetch wishlist");
      console.error("Error fetching wishlist:", err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (wishlistItemId) => {
    try {
      await api.delete(`/wishlist/${wishlistItemId}`);
      setWishlist(wishlist.filter(item => item.id !== wishlistItemId));
    } catch (err) {
      setError("Failed to remove item from wishlist");
      console.error("Error removing from wishlist:", err);
    }
  };

  const moveToCart = async (wishlistItemId) => {
    try {
      await api.post(`/wishlist/${wishlistItemId}/move-to-cart`);
      setWishlist(wishlist.filter(item => item.id !== wishlistItemId));
      loadCart();
    } catch (err) {
      setError("Failed to move item to cart");
      console.error("Error moving to cart:", err);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setFormData({
      recipientName: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      pincode: "",
      landmark: "",
      isDefault: addresses.length === 0
    });
    setShowAddressForm(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setFormData({
      recipientName: address.recipientName,
      phone: address.phone,
      street: address.street,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      landmark: address.landmark || "",
      isDefault: address.isDefault
    });
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) {
      return;
    }

    try {
      await api.delete(`/addresses/${addressId}`);
      setAddresses(addresses.filter(addr => addr.id !== addressId));
    } catch (err) {
      if (err.response?.data?.message?.includes("foreign key") ||
        err.response?.data?.message?.includes("constraint fails")) {
        alert("❌ You cannot delete this address because it is linked to previous orders.");
      } else {
        alert("❌ Failed to delete address. Try again.");
      }
      console.error("Error deleting address:", err);
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      await api.patch(`/api/addresses/${addressId}/default`);
      const updatedAddresses = addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      }));
      setAddresses(updatedAddresses);
    } catch (err) {
      setError("Failed to set default address");
      console.error("Error setting default address:", err);
    }
  };

  const handleSubmitAddress = async (e) => {
    e.preventDefault();
    try {
      setAddressLoading(true);
      if (editingAddress) {
        const response = await api.put(`/addresses/${editingAddress.id}`, formData);
        setAddresses(addresses.map(addr =>
          addr.id === editingAddress.id ? response.data : addr
        ));
        alert("Address updated successfully!");
      } else {
        const response = await api.post("/addresses", formData);
        setAddresses([...addresses, response.data]);
        alert("Address added successfully!");
      }
      setShowAddressForm(false);
      setEditingAddress(null);
      setError("");
    } catch (err) {
      setError("Failed to save address");
      console.error("Error saving address:", err);
      alert("Failed to save address. Please try again.");
    } finally {
      setAddressLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getEstimatedDeliveryDate = (orderDate) => {
    const date = new Date(orderDate);
    date.setDate(date.getDate() + 4);
    return formatDate(date);
  };

  const toggleOrderExpansion = (index) => {
    setExpanded(expanded === index ? null : index);
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout", null);
      loadCart();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen poppins-regular bg-white flex justify-center py-10 px-6">
        <div className="max-w-5xl w-full flex flex-col md:flex-row gap-12">
          {/* Sidebar */}
          <aside className="w-full md:w-1/4 space-y-2">
            {["profile", "orders", "wishlist"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left py-2 px-4 rounded-sm transition-all ${activeTab === tab
                  ? "bg-[#EAF4FA] border-b-2 border-[#5BA6D0] text-[#1E1E1E] font-medium"
                  : "text-[#333] hover:text-[#5BA6D0]"
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full text-left py-2 px-4 text-red-500 font-medium hover:text-red-600"
            >
              Logout
            </button>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-10">
                <div className="flex justify-between items-start">
                  {loadingProfile ? (
                    <p>Loading profile...</p>
                  ) : (
                    <div>
                      <h3 className="font-medium text-[#1E1E1E]">
                        {profile?.name}
                      </h3>

                      <p className="text-sm">
                        <span className="font-medium">Email :</span> {profile?.email}
                      </p>

                      <p className="text-sm">
                        <span className="font-medium">Mobile :</span> +91 {profile?.phone}
                      </p>
                    </div>
                  )}
                </div>

                <hr className="border-t border-gray-300" />

                <div className="flex justify-between items-start">
                  <div className="w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-[18px] font-medium text-[#1E1E1E]">
                        Addresses
                      </h3>
                      <button
                        onClick={handleAddAddress}
                        className="text-[#1E1E1E] font-normal hover:underline"
                      >
                        + Add new Address
                      </button>
                    </div>

                    {addressLoading && (
                      <div className="text-sm text-gray-500">Loading addresses...</div>
                    )}

                    {!addressLoading && addresses.length === 0 && (
                      <p className="text-[#4A4A4A] text-sm">No addresses saved yet.</p>
                    )}

                    <div className="space-y-4">
                      {addresses.map((address) => (
                        <div key={address.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {address.isDefault && (
                                  <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                    <Star size={12} fill="currentColor" /> Default
                                  </span>
                                )}
                                <p className="text-[#1E1E1E] font-medium">{address.recipientName}</p>
                              </div>
                              <p className="text-[#4A4A4A] text-sm leading-6">
                                {address.street} <br />
                                {address.city}, {address.state} - {address.pincode} <br />
                                {address.landmark && <>{address.landmark} <br /></>}
                                📞 {address.phone}
                              </p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => handleEditAddress(address)}
                                className="text-blue-600 hover:text-blue-800 p-1"
                                title="Edit address"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(address.id)}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Delete address"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Address Form Modal */}
                {showAddressForm && (
                  <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                      <h3 className="text-lg font-medium mb-4">
                        {editingAddress ? 'Edit Address' : 'Add New Address'}
                      </h3>
                      <form onSubmit={handleSubmitAddress} className="space-y-4">
                        {/* Recipient Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Name *</label>
                          <input
                            type="text"
                            name="recipientName"
                            value={formData.recipientName}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter recipient name"
                          />
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter phone number"
                          />
                        </div>

                        {/* Street Address */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                          <textarea
                            name="street"
                            value={formData.street}
                            onChange={handleInputChange}
                            required
                            rows="2"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter street address"
                          />
                        </div>

                        {/* Pincode */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                          <input
                            type="text"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleInputChange}
                            maxLength={6}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter pincode"
                          />
                        </div>

                        {/* City */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter city"
                          />
                        </div>

                        {/* State */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter state"
                          />
                        </div>

                        {/* Landmark */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Landmark (Optional)</label>
                          <input
                            type="text"
                            name="landmark"
                            value={formData.landmark}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter landmark"
                          />
                        </div>

                        {/* Default Address Checkbox */}
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            name="isDefault"
                            id="isDefault"
                            checked={formData.isDefault}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded"
                          />
                          <label htmlFor="isDefault" className="text-sm text-gray-700">
                            Set as default address
                          </label>
                        </div>

                        {/* Form Actions */}
                        <div className="flex gap-3 pt-4">
                          <button
                            type="submit"
                            disabled={addressLoading}
                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {addressLoading ? "Saving..." : (editingAddress ? "Update Address" : "Save Address")}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddressForm(false);
                              setEditingAddress(null);
                            }}
                            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="text-red-500 text-sm mt-2 p-2 bg-red-50 rounded">{error}</div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <h2 className="text-[20px] font-medium text-[#1E1E1E] mb-4">
                  Orders
                </h2>

                {loading && (
                  <div className="text-center py-4">Loading orders...</div>
                )}

                {error && (
                  <div className="text-red-500 text-center py-4">{error}</div>
                )}

                {!loading && !error && orders.length === 0 && (
                  <div className="text-center py-4">No orders found</div>
                )}

                {orders.map((order, index) => (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-[#1E1E1E]">
                          Order #{order.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Ordered on {formatDate(order.createdAt)}
                        </p>
                        <p className="text-sm font-medium text-[#1E1E1E]">
                          ₹{order.totalAmount}
                        </p>
                      </div>

                      <button
                        onClick={() => toggleOrderExpansion(index)}
                        className="border rounded-md p-1 hover:bg-gray-100"
                      >
                        {expanded === index ? (
                          <ChevronUp size={16} className="text-[#5BA6D0]" />
                        ) : (
                          <ChevronDown size={16} className="text-[#5BA6D0]" />
                        )}
                      </button>
                    </div>

                    {expanded === index && (
                      <>
                        <hr className="border-gray-200" />

                        {/* Order Summary */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-gray-500">Order ID</p>
                            <p className="font-medium">{order.orderNumber}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Order Date</p>
                            <p className="font-medium">{formatDate(order.createdAt)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Estimated Delivery</p>
                            <p className="font-medium">
                              {getEstimatedDeliveryDate(order.createdAt)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Payment Mode</p>
                            <p className="font-medium">
                              {order.paymentMethod === "RAZORPAY"
                                ? "Online"
                                : order.paymentMethod === "COD"
                                  ? "Cash on Delivery"
                                  : order.paymentMethod}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Status</p>
                            <p className="font-medium capitalize">{order.status.toLowerCase()}</p>
                          </div>
                          {order.trackingNumber && (
                            <div className="col-span-2">
                              <p className="text-gray-500">Tracking Number</p>
                              <p className="font-medium text-[#5BA6D0]">{order.trackingNumber}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-gray-500">Total Amount</p>
                            <p className="font-medium">₹{order.totalAmount}</p>
                          </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="mt-4">
                          <p className="text-gray-500">Delivery To</p>
                          <p className="font-medium">{order.shippingAddress.recipientName}</p>
                          <p className="text-sm text-gray-600">
                            {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
                            {order.shippingAddress.state} - {order.shippingAddress.pincode}
                          </p>
                          <p className="text-sm text-gray-600">📞 {order.shippingAddress.phone}</p>
                        </div>

                        {/* Items Table */}
                        <div className="mt-4 border border-gray-100 rounded-md overflow-hidden text-sm">
                          <table className="min-w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left">Product</th>
                                <th className="px-3 py-2 text-center">Qty</th>
                                <th className="px-3 py-2 text-right">Price</th>
                                <th className="px-3 py-2 text-right">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {(order.items || []).map((item) => (
                                <tr key={item.id}>
                                  <td className="px-3 py-2 flex items-center gap-3">
                                    <img
                                      src={`${BASE_URL}${item.productImage}`}
                                      alt={item.productName}
                                      className="w-12 h-12 object-cover rounded-md border"
                                    />
                                    <span>{item.productName}</span>
                                  </td>
                                  <td className="px-3 py-2 text-center">{item.quantity}</td>
                                  <td className="px-3 py-2 text-right">₹{item.price}</td>
                                  <td className="px-3 py-2 text-right">₹{item.subtotal}</td>
                                </tr>
                              ))}
                              {(order.items || []).length === 0 && (
                                <tr>
                                  <td colSpan={4} className="text-center text-gray-500 py-2">
                                    No items found
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === "wishlist" && (
              <div className="space-y-6">
                <h2 className="text-[20px] font-medium text-[#1E1E1E] mb-4">
                  Wishlist
                </h2>

                {loading && <div className="text-center py-4">Loading wishlist...</div>}

                {error && <div className="text-red-500 text-center py-4">{error}</div>}

                {!loading && !error && wishlist.length === 0 && (
                  <div className="text-center py-4">Your wishlist is empty</div>
                )}

                {wishlist.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <img
                        src={item.product?.mainImage ? `${BASE_URL}${item.product.mainImage}` : productImg}
                        alt={item.product?.name || "Product"}
                        className="w-20 h-20 sm:w-16 sm:h-16 object-contain rounded-md"
                      />

                      <div>
                        <h3 className="font-medium text-[#1E1E1E] text-[16px] sm:text-[17px]">
                          {item.product?.name || "Derm Range Moisturizing Facewash"}
                        </h3>

                        <p className="text-sm font-medium text-[#1E1E1E] mt-1 sm:mt-0">
                          ₹{item.product?.price}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => moveToCart(item.id)}
                        className="bg-[#5BA6D0] text-white px-4 py-2 rounded-md text-sm w-full sm:w-auto hover:opacity-90 transition"
                      >
                        Add to Cart
                      </button>

                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="border border-gray-400 text-gray-600 px-4 py-2 rounded-md text-sm w-full sm:w-auto hover:bg-gray-100 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AccountPage;