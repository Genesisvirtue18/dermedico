// src/components/admin/DashboardStats.jsx
import React, { useState, useEffect } from 'react';
import api from '../../src/api/api';

const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
    additionalData: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('week'); // week, month, quarter

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError('');

      // Calculate date range based on selected time period
      const endDate = new Date();
      const startDate = new Date();

      switch (timeRange) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7);
      }

      const response = await api.get('/admin/analytics/summary', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });

      setStats(response.data);
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      confirmed: 'bg-blue-50 border-blue-200 text-blue-800',
      shipped: 'bg-purple-50 border-purple-200 text-purple-800',
      delivered: 'bg-green-50 border-green-200 text-green-800',
      cancelled: 'bg-red-50 border-red-200 text-red-800',
      total: 'bg-indigo-50 border-indigo-200 text-indigo-800',
      revenue: 'bg-emerald-50 border-emerald-200 text-emerald-800'
    };
    return colors[status] || colors.total;
  };

  const handleGenerateReport = async () => {
    try {
      // Determine date range based on selected timeRange
      const endDate = new Date();
      const startDate = new Date();

      switch (timeRange) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7);
      }

      // Call the backend API
      const response = await api.get('/admin/analytics/sales-report', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        },
        responseType: 'blob' // important for file download
      });

      // Download the CSV
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales_report_${timeRange}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      console.log('Report generated successfully');
    } catch (err) {
      console.error('Error generating report:', err);
      alert('Failed to generate report');
    }
  };


  const getStatusIcon = (status) => {
    const icons = {
      total: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      pending: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      confirmed: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      shipped: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
      delivered: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      cancelled: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      revenue: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    };
    return icons[status] || icons.total;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateCompletionRate = () => {
    if (stats.totalOrders === 0) return 0;
    return ((stats.deliveredOrders / stats.totalOrders) * 100).toFixed(1);
  };

  const calculateCancellationRate = () => {
    if (stats.totalOrders === 0) return 0;
    return ((stats.cancelledOrders / stats.totalOrders) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">⚠️ {error}</div>
          <button
            onClick={fetchAnalyticsData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      status: 'total',
      description: 'All time orders'
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      status: 'pending',
      description: 'Awaiting processing'
    },
    {
      title: 'Confirmed Orders',
      value: stats.confirmedOrders,
      status: 'confirmed',
      description: 'Orders confirmed'
    },
    {
      title: 'Shipped Orders',
      value: stats.shippedOrders,
      status: 'shipped',
      description: 'Out for delivery'
    },
    {
      title: 'Delivered Orders',
      value: stats.deliveredOrders,
      status: 'delivered',
      description: 'Successfully delivered'
    },
    {
      title: 'Cancelled Orders',
      value: stats.cancelledOrders,
      status: 'cancelled',
      description: 'Orders cancelled'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      status: 'revenue',
      description: 'Gross revenue'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Analytics Dashboard</h2>
          <p className="mt-1 text-sm text-gray-600">
            Comprehensive overview of your business performance
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="mt-4 sm:mt-0">
          <label htmlFor="timeRange" className="sr-only">Time Range</label>
          <select
            id="timeRange"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 3 Months</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Completion Rate</p>
              <p className="text-3xl font-bold mt-1">{calculateCompletionRate()}%</p>
              <p className="text-blue-100 text-sm mt-2">Orders successfully delivered</p>
            </div>
            <div className="bg-blue-400 rounded-full p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold mt-1">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-green-100 text-sm mt-2">Gross sales amount</p>
            </div>
            <div className="bg-green-400 rounded-full p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Cancellation Rate</p>
              <p className="text-3xl font-bold mt-1">{calculateCancellationRate()}%</p>
              <p className="text-purple-100 text-sm mt-2">Orders cancelled by customers</p>
            </div>
            <div className="bg-purple-400 rounded-full p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Order Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className={`bg-white rounded-xl border-2 p-6 shadow-sm hover:shadow-md transition-all duration-200 ${getOrderStatusColor(stat.status)}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-75">{stat.title}</p>
                <p className="text-2xl font-bold mt-2">{stat.value}</p>
                <p className="text-xs opacity-60 mt-1">{stat.description}</p>
              </div>
              <div className="opacity-70">
                {getStatusIcon(stat.status)}
              </div>
            </div>

            {/* Progress bar for order status cards */}
            {stat.status !== 'revenue' && stat.status !== 'total' && (
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progress</span>
                  <span>
                    {stats.totalOrders > 0
                      ? `${((stat.value / stats.totalOrders) * 100).toFixed(1)}%`
                      : '0%'
                    }
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-current opacity-30"
                    style={{
                      width: `${stats.totalOrders > 0 ? (stat.value / stats.totalOrders) * 100 : 0}%`
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Additional Analytics Data */}
      {stats.additionalData && Object.keys(stats.additionalData).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats.additionalData).map(([key, value], index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-600 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {typeof value === 'number' ? value.toLocaleString() : String(value)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={fetchAnalyticsData}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Data
          </button>
          <button
            onClick={handleGenerateReport}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Generate Report
          </button>

        </div>
      </div>
    </div>
  );
};

export default DashboardStats;