import { FUNCTIONS_URL } from '../config/supabase';

/**
 * Get authentication token from localStorage
 * Checks multiple possible token keys in order of preference
 */
const getAuthToken = () => {
  return localStorage.getItem('authToken') || 
         localStorage.getItem('accessToken') || 
         localStorage.getItem('token') ||
         null;
};

/**
 * Get headers with authentication token
 */
const getHeaders = () => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['x-admin-token'] = token; // Admin-specific token header
  }
  
  return headers;
};

/**
 * Dashboard Statistics Service
 * Handles all API calls for dashboard statistics
 */
const dashboardStatsService = {
  /**
   * Get comprehensive dashboard statistics
   * Returns: {
   *   users: { total, label },
   *   garages: { active, total, label },
   *   orders: { pending, total, completed, newToday, label },
   *   revenue: { monthly, currency, label },
   *   conversionRate: { rate, label },
   *   recentOrders: [...],
   *   statusBreakdown: {...},
   *   paymentBreakdown: {...},
   *   disputes: { total, open, label },
   *   tickets: { total, open, label }
   * }
   */
  getDashboardStats: async () => {
    try {
      const response = await fetch(`${FUNCTIONS_URL}/admin-dashboard-stats`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch dashboard stats: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  /**
   * Format currency value for display (Saudi Riyal)
   */
  formatCurrency: (value) => {
    try {
      return new Intl.NumberFormat('en-AE', {
        style: 'decimal',
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }).format(value || 0);
    } catch (err) {
      return Number(value || 0).toLocaleString('en');
    }
  },

  /**
   * Format percentage value
   */
  formatPercentage: (value) => {
    return `${Number(value || 0).toFixed(1)}%`;
  },

  /**
   * Format number with thousands separator
   */
  formatNumber: (value) => {
    return Number(value || 0).toLocaleString('en');
  },
};

export default dashboardStatsService;
