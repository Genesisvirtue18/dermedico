// src/components/admin/OrdersManagement.jsx
import React, { useState, useEffect } from "react";
import api from "../api/api";

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const params = { page, size: 10 };
      if (statusFilter) params.status = statusFilter;

      const response = await api.get("/admin/orders", { params });
      setOrders(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to fetch orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (status) => {
    if (!status || status === "Select status") return;

    try {
      setActionLoading(true);
      await api.patch(`/admin/orders/${selectedOrder.id}/status?status=${status}`);
      setSuccessMessage(`Order status updated to ${status} successfully!`);
      await fetchOrders();
      setSelectedOrder(null);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update order status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleTrackingUpdate = async () => {
    if (!trackingNumber.trim()) {
      setError("Please enter a tracking number");
      return;
    }

    try {
      setActionLoading(true);
      await api.patch(`/admin/orders/${selectedOrder.id}/tracking?trackingNumber=${trackingNumber}`);
      
      // Show success message
      setSuccessMessage("Tracking number updated successfully!");
      
      // Reset tracking number and close modal
      setTrackingNumber("");
      setSelectedOrder(null);
      
      // Refresh orders
      await fetchOrders();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error updating tracking:", err);
      setError("Failed to update tracking number");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!window.confirm("Are you sure you want to process a refund for this order?")) {
      return;
    }

    try {
      setActionLoading(true);
      await api.post(`/admin/orders/${selectedOrder.id}/refund`);
      setSuccessMessage("Refund processed successfully!");
      setSelectedOrder(null);
      await fetchOrders();
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error processing refund:", err);
      setError("Failed to process refund");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PROCESSING: "bg-blue-100 text-blue-800",
      CONFIRMED: "bg-indigo-100 text-indigo-800",
      SHIPPED: "bg-purple-100 text-purple-800",
      DELIVERED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
      REFUNDED: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatOrderItems = (items, orderId, maxItems = 1) => {
    if (!items || items.length === 0) {
      return <span className="text-gray-400">No items</span>;
    }

    const visibleItems = expandedOrderId === orderId ? items : items.slice(0, maxItems);
    const hasMoreItems = items.length > maxItems && expandedOrderId !== orderId;

    return (
      <div className="space-y-1">
        {visibleItems.map((item, index) => (
          <div key={item.id || index} className="flex justify-between text-sm">
            <span className="text-gray-700 flex-1 truncate mr-2">
              {item.productName}
            </span>
            <span className="text-gray-900 font-medium whitespace-nowrap">
              x{item.quantity}
            </span>
          </div>
        ))}
        {hasMoreItems && (
          <button
            onClick={() => toggleOrderExpansion(orderId)}
            className="text-blue-600 hover:text-blue-800 text-xs font-medium mt-1"
          >
            +{items.length - maxItems} more items
          </button>
        )}
        {expandedOrderId === orderId && items.length > maxItems && (
          <button
            onClick={() => toggleOrderExpansion(orderId)}
            className="text-blue-600 hover:text-blue-800 text-xs font-medium mt-1"
          >
            Show less
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Orders Management</h2>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Refunded</option>
          </select>

          <button 
            onClick={fetchOrders}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => setError("")}
            className="mt-2 text-red-600 hover:text-red-800 text-sm"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-green-700">{successMessage}</p>
          </div>
          <button 
            onClick={() => setSuccessMessage("")}
            className="mt-2 text-green-600 hover:text-green-800 text-sm"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Orders Table */}
      {!loading && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tracking
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div className="font-medium text-gray-900">{order.user?.name}</div>
                        <div className="text-gray-500">{order.user?.email}</div>
                        <div className="text-gray-400 text-xs">{order.user?.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      {formatOrderItems(order.items, order.id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                      <div className="text-gray-400 text-xs">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-semibold">₹{order.totalAmount?.toFixed(2)}</div>
                      <div className="text-gray-500 text-xs">
                        Items: ₹{order.subtotal?.toFixed(2)}
                        {order.tax > 0 && ` + Tax: ₹${order.tax?.toFixed(2)}`}
                        {order.shippingCharges > 0 && ` + Shipping: ₹${order.shippingCharges?.toFixed(2)}`}
                        {order.discount > 0 && ` - Discount: ₹${order.discount?.toFixed(2)}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.trackingNumber ? (
                        <span className="font-mono text-blue-600">{order.trackingNumber}</span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {orders.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg">No orders found</div>
              <div className="text-gray-500 mt-2">
                {statusFilter ? `No orders with status "${statusFilter}"` : "No orders in the system"}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-4">
          <button 
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-700">
            Page <span className="font-semibold">{page + 1}</span> of <span className="font-semibold">{totalPages}</span>
          </span>
          
          <button 
            disabled={page === totalPages - 1}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Manage Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Manage Order #{selectedOrder.id}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedOrder.orderNumber}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={actionLoading}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Order Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Customer Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-3">Customer Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Name:</span>
                      <p className="text-gray-900">{selectedOrder.user?.name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Email:</span>
                      <p className="text-gray-900">{selectedOrder.user?.email}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Phone:</span>
                      <p className="text-gray-900">{selectedOrder.user?.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-3">Shipping Address</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Recipient:</span>
                      <p className="text-gray-900">{selectedOrder.shippingAddress?.recipientName}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Address:</span>
                      <p className="text-gray-900">
                        {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city}
                      </p>
                      <p className="text-gray-900">
                        {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                      </p>
                    </div>
                    {selectedOrder.shippingAddress?.landmark && (
                      <div>
                        <span className="font-medium text-gray-600">Landmark:</span>
                        <p className="text-gray-900">{selectedOrder.shippingAddress.landmark}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-white rounded border">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{item.productName}</div>
                        <div className="text-sm text-gray-500">Product ID: {item.productId}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">₹{item.price?.toFixed(2)}</div>
                        <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                        <div className="text-sm font-medium text-gray-700">
                          Subtotal: ₹{item.subtotal?.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Order Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Subtotal:</span>
                    <p className="text-gray-900">₹{selectedOrder.subtotal?.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Tax:</span>
                    <p className="text-gray-900">₹{selectedOrder.tax?.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Shipping:</span>
                    <p className="text-gray-900">₹{selectedOrder.shippingCharges?.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Total:</span>
                    <p className="text-lg font-bold text-gray-900">₹{selectedOrder.totalAmount?.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Management Actions */}
              <div className="space-y-4">
                {/* Update Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Update Status
                  </label>
                  <select 
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                    disabled={actionLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                  >
                    <option>Select status</option>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </div>

                {/* Update Tracking */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Update Tracking Number
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Enter tracking number"
                      disabled={actionLoading}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                    />
                    <button 
                      onClick={handleTrackingUpdate}
                      disabled={actionLoading || !trackingNumber.trim()}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                    >
                      {actionLoading ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Updating...
                        </div>
                      ) : (
                        "Update Tracking"
                      )}
                    </button>
                  </div>
                </div>

                {/* Refund Section */}
                <div className="border-t border-gray-200 pt-4">
                  <label className="block text-sm font-medium text-red-700 mb-2">
                    Refund Actions
                  </label>
                  <button 
                    onClick={handleRefund}
                    disabled={actionLoading}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      "Process Refund"
                    )}
                  </button>
                  <p className="text-xs text-red-600 mt-2">
                    This will initiate a refund for the entire order amount of ₹{selectedOrder.totalAmount?.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;