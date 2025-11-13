import React, { useState, useEffect } from "react";
import DirhamIcon from "../components/DirhamIcon";
import analyticsService from "../services/analytics.service";

const DashboardAnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getAnalyticsStats();
      setAnalyticsData(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-800">Analytics</h2>
        <div className="grid gap-4 md:grid-cols-4 sm:grid-cols-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="bg-white border border-gray-200 rounded-md p-4 animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-800">Analytics</h2>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center gap-2">
            <span className="text-red-500">⚠️</span>
            <div>
              <p className="text-sm font-medium text-red-800">Failed to load analytics</p>
              <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchAnalyticsData}
            className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-800">Analytics</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center">
          <p className="text-gray-500">No analytics data available</p>
        </div>
      </div>
    );
  }

  const cards = [
    {
      label: analyticsData.totalUsers.label,
      value: analyticsData.totalUsers.formatted,
      change: analyticsService.formatPercentage(analyticsData.totalUsers.growth) + ' from last month',
      growth: analyticsData.totalUsers.growth,
      symbol: false,
    },
    {
      label: analyticsData.totalGarages.label,
      value: analyticsData.totalGarages.formatted,
      change: analyticsService.formatPercentage(analyticsData.totalGarages.growth) + ' from last month',
      growth: analyticsData.totalGarages.growth,
      symbol: false,
    },
    {
      label: analyticsData.totalBookings.label,
      value: analyticsData.totalBookings.formatted,
      change: analyticsService.formatPercentage(analyticsData.totalBookings.growth) + ' from last month',
      growth: analyticsData.totalBookings.growth,
      symbol: false,
    },
    {
      label: analyticsData.totalRevenue.label,
      value: analyticsData.totalRevenue.formatted,
      change: analyticsService.formatPercentage(analyticsData.totalRevenue.growth) + ' from last month',
      growth: analyticsData.totalRevenue.growth,
      symbol: true,
    },
    {
      label: analyticsData.activeBookings.label,
      value: analyticsData.activeBookings.formatted,
      change: analyticsData.activeBookings.period,
      growth: null,
      symbol: false,
    },
    {
      label: analyticsData.averageBookingValue.label,
      value: analyticsData.averageBookingValue.formatted,
      change: '',
      growth: null,
      symbol: true,
    },
    {
      label: analyticsData.escrowBalance.label,
      value: analyticsData.escrowBalance.formatted,
      change: '',
      growth: null,
      symbol: true,
    },
    {
      label: analyticsData.pendingDisputes.label,
      value: analyticsData.pendingDisputes.formatted,
      change: '',
      growth: null,
      symbol: false,
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Analytics</h2>
        <button
          onClick={fetchAnalyticsData}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-4 sm:grid-cols-2">
        {cards.map(card => (
          <div key={card.label} className="bg-white border border-gray-200 rounded-md p-4">
            <div className="text-[11px] font-medium text-gray-500 mb-1">{card.label}</div>
            <div className="text-base font-semibold text-gray-800">
              {card.symbol ? (
                <span className="inline-flex items-center gap-1">
                  <DirhamIcon />
                  {card.value}
                </span>
              ) : (
                card.value
              )}
            </div>
            {card.change && (
              <div className={`mt-1 text-[11px] font-medium flex items-center gap-1 ${
                card.growth !== null && card.growth >= 0 ? 'text-green-600' : 
                card.growth !== null && card.growth < 0 ? 'text-red-600' : 
                'text-gray-600'
              }`}>
                {card.growth !== null && (
                  <span className={`inline-block px-1.5 py-0.5 rounded ${
                    card.growth >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {card.growth >= 0 ? '↗' : '↘'}
                  </span>
                )}
                {card.change}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardAnalyticsPage;