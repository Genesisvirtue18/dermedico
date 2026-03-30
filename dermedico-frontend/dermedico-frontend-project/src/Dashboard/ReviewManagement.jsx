import React, { useState, useEffect } from "react";
import api from "../../src/api/api";

const ReviewsManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedReview, setSelectedReview] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchPendingReviews();
  }, [page]);

  const fetchPendingReviews = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/admin/reviews/pending", {
        params: { page, size: 10 },
      });

      setReviews(response.data.content || []);
      setTotalPages(response.data.totalPages ?? 0);
    } catch (err) {
      setError("Failed to fetch pending reviews");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const moderateReview = async (reviewId, status) => {
    try {
      setError("");
      setSuccess("");
      await api.patch(`/admin/reviews/${reviewId}/moderate`, null, {
        params: { status },
      });
      
      setSuccess(`Review ${status === "APPROVED" ? "approved" : "rejected"} successfully!`);
      fetchPendingReviews();
      closeDialog();
    } catch (err) {
      setError("Failed to update review status");
      console.error(err);
    }
  };

  const openDialog = (review, action) => {
    setSelectedReview(review);
    setActionType(action);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setSelectedReview(null);
    setActionType(null);
    setDialogOpen(false);
  };

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderStars = (rating) => {
    return "⭐".repeat(rating);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Reviews Moderation</h2>
            <p className="mt-1 text-sm text-gray-600">
              Manage and moderate customer reviews before they go live
            </p>
          </div>

          {/* Alerts */}
          <div className="px-6 py-4 space-y-3">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {success}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No pending reviews</h3>
                <p className="mt-1 text-sm text-gray-500">All reviews have been moderated.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                            {review.product?.name || "Unknown Product"}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            by {review.user?.email || "Unknown User"}
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(review.status)}`}>
                          {review.status}
                        </span>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center mb-3">
                        <div className="flex items-center">
                          <span className="text-lg mr-2">{renderStars(review.rating)}</span>
                          <span className="text-sm text-gray-600">({review.rating}/5)</span>
                        </div>
                      </div>

                      {/* Title and Comment */}
                      {review.title && (
                        <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
                      )}
                      <p className="text-gray-700 mb-4 whitespace-pre-wrap">{review.comment}</p>

                      {/* Metadata */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>
                          Created: {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                        {review.updatedAt && review.updatedAt !== review.createdAt && (
                          <span>
                            Updated: {new Date(review.updatedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-3 mt-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => openDialog(review, "APPROVED")}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Approve
                        </button>
                        <button
                          onClick={() => openDialog(review, "REJECTED")}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 0}
                  className={`inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    page === 0
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Previous
                </button>

                <div className="flex space-x-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md ${
                        page === i
                          ? "border-blue-500 bg-blue-50 text-blue-600"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages - 1}
                  className={`inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    page === totalPages - 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="mt-3 text-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Confirm Action
                </h3>
                <div className="mt-2 px-4 py-3">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to{" "}
                    <strong className="font-semibold text-gray-900">
                      {actionType === "APPROVED" ? "approve" : "reject"}
                    </strong>{" "}
                    this review?
                  </p>
                  {selectedReview && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md text-left">
                      <p className="text-sm text-gray-600">
                        <strong>Product:</strong> {selectedReview.product?.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>User:</strong> {selectedReview.user?.email}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedReview.comment}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between gap-3 px-4 py-3 mt-4">
                  <button
                    onClick={closeDialog}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => moderateReview(selectedReview?.id, actionType)}
                    className={`flex-1 px-4 py-2 text-white text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors duration-200 ${
                      actionType === "APPROVED"
                        ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                        : "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                    }`}
                  >
                    {actionType === "APPROVED" ? "Approve" : "Reject"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsManagement;