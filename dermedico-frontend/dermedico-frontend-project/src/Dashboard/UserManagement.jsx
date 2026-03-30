import React, { useState, useEffect } from "react";
import api from "../../src/api/api";

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [selectedUser, setSelectedUser] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/admin/users", {
        params: { page, size: 10 },
      });
      setUsers(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError("Failed to fetch users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to suspend user ${userEmail}?`)) {
      return;
    }

    try {
      setError("");
      setSuccess("");
      await api.patch(`/admin/users/${userId}/suspend`);
      setSuccess(`User ${userEmail} suspended successfully`);
      fetchUsers();
    } catch (err) {
      setError("Failed to suspend user");
      console.error("Error suspending user:", err);
    }
  };

  const handleUnblockUser = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to unblock user ${userEmail}?`)) {
      return;
    }

    try {
      setError("");
      setSuccess("");
      await api.patch(`/admin/users/${userId}/unblock`);
      setSuccess(`User ${userEmail} activated successfully`);
      fetchUsers();
    } catch (err) {
      setError("Failed to unblock user");
      console.error("Error unblocking user:", err);
    }
  };

  const fetchUserOrders = async (userId) => {
    try {
      setOrdersLoading(true);
      setError("");
      const response = await api.get(`/admin/users/${userId}/orders`);
      console.log("Orders API Response:", response.data);

      // Fixed: Handle both array response and paginated response
      const orders = Array.isArray(response.data) ? response.data :
        response.data.content || response.data || [];

      setUserOrders(orders);
      setSelectedUser(users.find((u) => u.id === userId));
      setModalOpen(true);
    } catch (err) {
      setError("Failed to fetch orders");
      console.error("Error fetching orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
    setUserOrders([]);
  };

  // Close modal when clicking on backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && modalOpen) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [modalOpen]);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
      case 'REFUNDED':
        return 'bg-red-100 text-red-800';
      case 'SHIPPED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600 mt-2">Manage user accounts and view their order history</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-xs text-gray-400">ID: #{user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === "ADMIN"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                          }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                          }`}
                      >
                        {user.active ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => fetchUserOrders(user.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Orders
                        </button>
                        {user.active ? (
                          <button
                            onClick={() => handleSuspendUser(user.id, user.email)}
                            className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Suspend
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnblockUser(user.id, user.email)}
                            className="inline-flex items-center px-3 py-1.5 border border-green-300 text-xs font-medium rounded-md text-green-700 bg-white hover:bg-green-50 transition-colors"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">There are currently no users in the system.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 bg-white px-4 py-3 rounded-lg border border-gray-200">
            <div className="flex justify-between flex-1 sm:hidden">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${page === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages - 1}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${page === totalPages - 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{page + 1}</span> of{" "}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 0}
                    className={`relative inline-flex items-center px-3 py-2 rounded-l-md text-sm font-medium ${page === 0
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-500 hover:bg-gray-50"
                      }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages - 1}
                    className={`relative inline-flex items-center px-3 py-2 rounded-r-md text-sm font-medium ${page === totalPages - 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-white text-gray-500 hover:bg-gray-50"
                      }`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Orders Modal - FIXED VERSION */}
        {modalOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={handleBackdropClick}
          >
            <div 
              className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Order History
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Orders for {selectedUser?.firstName} {selectedUser?.lastName} ({selectedUser?.email})
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-500 transition-colors p-1 rounded-full hover:bg-gray-100"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mt-4">
                  {ordersLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {userOrders.length === 0 ? (
                        <div className="text-center py-12">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
                          <p className="mt-1 text-sm text-gray-500">This user hasn't placed any orders yet.</p>
                        </div>
                      ) : (
                        userOrders.map((order) => (
                          <div key={order.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="text-sm font-semibold text-gray-900">
                                  Order #{order.orderNumber || order.id}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">
                                  Placed on {order.createdAt ? formatDate(order.createdAt) : '-'}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                  {order.status || 'UNKNOWN'}
                                </span>
                                <p className="text-sm font-semibold text-gray-900 mt-1">
                                  {formatCurrency(order.totalAmount || 0)}
                                </p>
                              </div>
                            </div>

                            {/* Shipping */}
                            {order.shippingAddress && (
                              <div className="mb-4">
                                <h5 className="font-medium text-gray-700 mb-1">Shipping Address</h5>
                                <p className="text-gray-600 text-xs">
                                  {order.shippingAddress.recipientName || '-'}<br />
                                  {order.shippingAddress.street || '-'}<br />
                                  {order.shippingAddress.city || '-'}, {order.shippingAddress.state || '-'} - {order.shippingAddress.pincode || '-'}<br />
                                  {order.shippingAddress.landmark ? `Landmark: ${order.shippingAddress.landmark}` : ''}<br />
                                  Phone: {order.shippingAddress.phone || '-'}
                                </p>
                              </div>
                            )}

                            {/* Items */}
                            <div className="border border-gray-100 rounded-md overflow-hidden text-xs">
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
                                      <td className="px-3 py-2">{item.productName || '-'}</td>
                                      <td className="px-3 py-2 text-center">{item.quantity || 0}</td>
                                      <td className="px-3 py-2 text-right">{formatCurrency(item.price || 0)}</td>
                                      <td className="px-3 py-2 text-right">{formatCurrency(item.subtotal || 0)}</td>
                                    </tr>
                                  ))}
                                  {(order.items || []).length === 0 && (
                                    <tr>
                                      <td colSpan={4} className="text-center text-gray-500 py-2">No items found</td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>

                            {/* Order summary */}
                            <div className="mt-2 text-xs text-gray-600">
                              <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>{formatCurrency(order.subtotal || 0)}</span>
                              </div>
                              {order.tax > 0 && (
                                <div className="flex justify-between">
                                  <span>Tax:</span>
                                  <span>{formatCurrency(order.tax)}</span>
                                </div>
                              )}
                              {order.shippingCharges > 0 && (
                                <div className="flex justify-between">
                                  <span>Shipping:</span>
                                  <span>{formatCurrency(order.shippingCharges)}</span>
                                </div>
                              )}
                              {order.discount > 0 && (
                                <div className="flex justify-between">
                                  <span>Discount:</span>
                                  <span>-{formatCurrency(order.discount)}</span>
                                </div>
                              )}
                              <div className="flex justify-between font-semibold border-t pt-1">
                                <span>Total:</span>
                                <span>{formatCurrency(order.totalAmount || 0)}</span>
                              </div>
                              <div className="flex justify-between mt-1">
                                <span>Payment Method:</span>
                                <span className="font-medium">{order.paymentMethod || '-'}</span>
                              </div>
                              {order.trackingNumber && (
                                <div className="flex justify-between mt-1">
                                  <span>Tracking Number:</span>
                                  <span className="font-medium">{order.trackingNumber}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersManagement;