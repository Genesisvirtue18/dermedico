import React, { useState, useEffect } from "react";
import api from "../../src/api/api";

const PincodeManagement = () => {
  const [pincodes, setPincodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPincode, setEditingPincode] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [formData, setFormData] = useState({
    pincode: "",
    city: "",
    state: "",
    deliveryAvailable: true,
    estimatedDays: "",
    codAvailable: true,
    charge: "",
    notes: ""
  });


  useEffect(() => {
    fetchPincodes();
  }, []);

  const fetchPincodes = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/admin/pincode");
      setPincodes(response.data);
    } catch (err) {
      setError("Failed to fetch pincode rules");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pincodeId) => {
    try {
      setError("");
      await api.delete(`/admin/pincode/${pincodeId}`);
      setSuccess("Pincode rule deleted successfully!");
      fetchPincodes();
      setDeleteConfirm(null);
    } catch (err) {
      setError("Failed to delete pincode rule");
      console.error(err);
    }
  };

  const handleEdit = (pincode) => {
    setEditingPincode(pincode);
    setFormData({
      pincode: pincode.pincode,
      city: pincode.city || "",
      state: pincode.state || "",
      deliveryAvailable: pincode.deliveryAvailable,
      estimatedDays: pincode.estimatedDays,
      codAvailable: pincode.codAvailable,
      charge: pincode.shippingCharges,
      notes: pincode.notes || ""
    });

    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError("");
      setSuccess("");

      const payload = {
        pincode: formData.pincode,
        city: formData.city,
        state: formData.state,
        deliveryAvailable: formData.deliveryAvailable,
        estimatedDays: parseInt(formData.estimatedDays),
        codAvailable: formData.codAvailable,
        shippingCharges: parseFloat(formData.charge),
        notes: formData.notes
      };


      if (editingPincode) {
        await api.put(`/admin/pincode/${editingPincode.id}`, payload);
        setSuccess("Pincode rule updated successfully!");
      } else {
        await api.post("/admin/pincode", payload);
        setSuccess("Pincode rule created successfully!");
      }

      fetchPincodes();
      closeDialog();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save pincode rule");
      console.error(err);
    }
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingPincode(null);
    setFormData({
      pincode: "",
      city: "",
      state: "",
      deliveryAvailable: true,
      estimatedDays: "",
      codAvailable: true,
      charge: "",
      notes: ""
    });

  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
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

  const getStatusBadge = (available) => {
    return available ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        ✅ Yes
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        ❌ No
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Pincode Management</h2>
              <p className="mt-1 text-sm text-gray-600">
                Manage delivery availability and charges for different pincodes
              </p>
            </div>
            <button
              onClick={() => setDialogOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Pincode Rule
            </button>
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
            ) : pincodes.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No pincode rules</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating a new pincode rule.</p>
                <div className="mt-6">
                  <button
                    onClick={() => setDialogOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Pincode Rule
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pincode
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        City
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        State
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Delivery
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estimated Days
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        COD Available
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Shipping Charge
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pincodes.map((pin) => (
                      <tr key={pin.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{pin.pincode}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{pin.city || "-"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{pin.state || "-"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(pin.deliveryAvailable)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{pin.estimatedDays} days</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(pin.codAvailable)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">₹{pin.shippingCharges}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {pin.notes || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(pin)}
                              className="inline-flex items-center px-3 py-1 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 transition-colors duration-200"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(pin)}
                              className="inline-flex items-center px-3 py-1 border border-red-600 text-sm font-medium rounded-md text-red-600 bg-white hover:bg-red-50 transition-colors duration-200"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center pb-3 border-b">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {editingPincode ? "Edit Pincode Rule" : "Add New Pincode Rule"}
                </h3>
                <button
                  onClick={closeDialog}
                  className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">

                <div>
                  <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    required
                    maxLength={6}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                    placeholder="Enter 6-digit pincode"
                  />
                </div>

                {/* New fields City + State */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                      placeholder="Enter city"
                    />
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                      State *
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                      placeholder="Enter state"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="deliveryAvailable"
                      name="deliveryAvailable"
                      checked={formData.deliveryAvailable}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="deliveryAvailable" className="ml-2 block text-sm text-gray-700">
                      Delivery Available
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="codAvailable"
                      name="codAvailable"
                      checked={formData.codAvailable}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="codAvailable" className="ml-2 block text-sm text-gray-700">
                      COD Available
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor="estimatedDays" className="block text-sm font-medium text-gray-700">
                    Estimated Delivery Days *
                  </label>
                  <input
                    type="number"
                    id="estimatedDays"
                    name="estimatedDays"
                    value={formData.estimatedDays}
                    onChange={handleInputChange}
                    required
                    min="1"
                    max="30"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                    placeholder="Enter estimated days"
                  />
                </div>

                <div>
                  <label htmlFor="charge" className="block text-sm font-medium text-gray-700">
                    Shipping Charges (₹) *
                  </label>
                  <input
                    type="number"
                    id="charge"
                    name="charge"
                    value={formData.charge}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                    placeholder="Enter shipping charges"
                  />
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                    placeholder="Additional notes (optional)"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeDialog}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    {editingPincode ? "Update" : "Create"}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="mt-3 text-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Delete Pincode Rule
                </h3>
                <div className="mt-2 px-4 py-3">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete the pincode rule for{" "}
                    <strong className="font-semibold text-gray-900">{deleteConfirm.pincode}</strong>?
                    This action cannot be undone.
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3 px-4 py-3 mt-4">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm.id)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                  >
                    Delete
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

export default PincodeManagement;