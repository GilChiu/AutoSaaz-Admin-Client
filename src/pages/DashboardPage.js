import React, { useState } from "react";
import { Users, Building, Calendar, DollarSign, TrendingUp, Clock } from "lucide-react";
import DirhamIcon from "../components/DirhamIcon";

const DashboardPage = () => {
  const [stats] = useState({
    totalUsers: 2847,
    totalGarages: 156,
    pendingOrders: 23,
    revenue: 45678,
    userGrowth: 12.5,
    garageGrowth: 8.2
  });

  const recentOrders = [
    { id: 1, customer: "John Doe", garage: "Quick Fix Garage", service: "Oil Change", amount: 45, status: "completed" },
    { id: 2, customer: "Jane Smith", garage: "Auto Care Center", service: "Brake Repair", amount: 280, status: "pending" },
    { id: 3, customer: "Mike Johnson", garage: "Super Service", service: "Tire Rotation", amount: 60, status: "in-progress" },
  ];

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

      {/* Stats Grid */}
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
          value="12"
          icon={Calendar}
        />
        <StatsCard
          title="Conversion Rate"
          value="68.4%"
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
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
