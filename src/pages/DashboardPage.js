import React, { useState, useEffect } from "react";
import { Users, Building, Calendar, DollarSign, TrendingUp, Clock } from "lucide-react";
import DirhamIcon from "../components/DirhamIcon";
import dashboardStatsService from "../services/dashboardStats.service";

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGarages: 0,
    pendingOrders: 0,
    revenue: 0,
    userGrowth: 0,
    garageGrowth: 0,
    newOrdersToday: 0,
    conversionRate: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardStatsService.getDashboardStats();
      
      console.log('Dashboard API Response:', data);

      // Map API response to state
      setStats({
        totalUsers: data.users?.total || 0,
        totalGarages: data.garages?.active || 0,
        pendingOrders: data.orders?.pending || 0,
        revenue: data.revenue?.monthly || 0,
        newOrdersToday: data.orders?.newToday || 0,
        conversionRate: data.conversionRate?.rate || 0,
        userGrowth: 0, // TODO: Calculate growth from historical data
        garageGrowth: 0, // TODO: Calculate growth from historical data
      });

      // Map recent orders with proper structure
      const mappedOrders = (data.recentOrders || []).map(order => ({
        id: order.id,
        customer: order.customer_profile?.full_name || order.customer?.email || order.customer_name || 'Unknown',
        garage: order.garage_profile?.garage_name || order.garage?.email || 'Unknown Garage',
        service: order.service_type || 'N/A',
        amount: parseFloat(order.commission_amount || order.actual_cost || 0),
        status: order.status || 'unknown',
        bookingNumber: order.booking_number,
        createdAt: order.created_at,
      }));

      setRecentOrders(mappedOrders);
      setLoading(false);
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
      setError(err.message || 'Failed to load dashboard statistics');
      setLoading(false);
    }
  };

  // Format numbers for display, without embedding currency so we can prepend a custom AED symbol icon.
  const formatAED = (value) => {
    try {
      return new Intl.NumberFormat('en-AE', {
        style: 'decimal',
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }).format(value);
    } catch (err) {
      // Fallback to a simple prefix if Intl locale isn't available
      return Number(value || 0).toLocaleString('en');
    }
  };

  const StatsCard = ({ title, value, icon: Icon, change, changeType }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-8 w-8 text-primary-600" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="text-lg font-medium text-gray-900">{value}</dd>
          </dl>
        </div>
        {change && (
          <div className={`flex items-center text-sm ${
            changeType === 'increase' ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className="h-4 w-4 mr-1" />
            {change}%
          </div>
        )}
      </div>
    </div>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'in-progress':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">Loading dashboard statistics...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <button
                onClick={loadDashboardStats}
                className="mt-2 text-sm font-medium text-red-800 hover:text-red-900 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <StatsCard
              title="Total Users"
              value={stats.totalUsers.toLocaleString()}
              icon={Users}
              change={stats.userGrowth}
              changeType="increase"
            />
            <StatsCard
              title="Active Garages"
              value={stats.totalGarages}
              icon={Building}
              change={stats.garageGrowth}
              changeType="increase"
            />
            <StatsCard
              title="Pending Orders"
              value={stats.pendingOrders}
              icon={Clock}
            />
            <StatsCard
              title="Monthly Revenue"
              value={(
                <span className="inline-flex items-center gap-1">
                  <DirhamIcon />
                  {formatAED(stats.revenue)}
                </span>
              )}
              icon={DollarSign}
              change={15.3}
              changeType="increase"
            />
            <StatsCard
              title="New Orders Today"
              value={stats.newOrdersToday.toString()}
              icon={Calendar}
            />
            <StatsCard
              title="Conversion Rate"
              value={`${stats.conversionRate.toFixed(1)}%`}
              icon={TrendingUp}
              change={3.2}
              changeType="increase"
            />
          </div>

          {/* Recent Orders */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Recent Orders
              </h3>
              {recentOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No recent orders found</p>
                  <p className="text-sm mt-1">Orders will appear here once customers start booking services</p>
                </div>
              ) : (
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Garage
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Service
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.customer}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.garage}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.service}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="inline-flex items-center gap-1">
                              <DirhamIcon />
                              {formatAED(order.amount)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
