import { FUNCTIONS_URL, SUPABASE_ANON_KEY } from '../config/supabase';

/**
 * Get authentication token from localStorage
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
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['x-admin-token'] = token;
  }
  
  return headers;
};

/**
 * Analytics statistics service for Admin Dashboard
 * Provides analytics data with month-over-month growth metrics
 */
class AnalyticsService {
  /**
   * Get comprehensive analytics statistics
   * @returns {Promise<Object>} Analytics statistics with growth metrics
   */
  async getAnalyticsStats() {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      console.log('Fetching analytics stats from:', `${FUNCTIONS_URL}/admin-analytics-stats`);

      const response = await fetch(`${FUNCTIONS_URL}/admin-analytics-stats`, {
        method: 'GET',
        headers: getHeaders(),
      });

      console.log('Analytics API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Analytics API error response:', errorData);
        
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
        
        throw new Error(errorData.error || `Failed to fetch analytics stats: ${response.status}`);
      }

      const data = await response.json();
      console.log('Analytics stats loaded:', data);
      
      return data;
    } catch (error) {
      console.error('Error fetching analytics stats:', error);
      throw error;
    }
  }

  /**
   * Format currency value
   * @param {number} value - Numeric value
   * @param {string} currency - Currency code (default: SAR)
   * @returns {string} Formatted currency string
   */
  formatCurrency(value, currency = 'SAR') {
    if (typeof value !== 'number') {
      value = parseFloat(value) || 0;
    }
    
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  }

  /**
   * Format growth percentage
   * @param {number} growth - Growth percentage
   * @returns {string} Formatted percentage with sign
   */
  formatPercentage(growth) {
    if (typeof growth !== 'number') {
      growth = parseFloat(growth) || 0;
    }
    
    const sign = growth >= 0 ? '+' : '';
    return `${sign}${growth.toFixed(1)}%`;
  }

  /**
   * Format large numbers with K/L suffix
   * @param {number} num - Number to format
   * @returns {string} Formatted number string
   */
  formatNumber(num) {
    if (typeof num !== 'number') {
      num = parseFloat(num) || 0;
    }
    
    if (num >= 100000) {
      return (num / 100000).toFixed(1) + 'L'; // Lakh
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  }

  /**
   * Get trend direction from growth value
   * @param {number} growth - Growth percentage
   * @returns {string} 'up' or 'down'
   */
  getTrend(growth) {
    return growth >= 0 ? 'up' : 'down';
  }

  /**
   * Get color class based on trend
   * @param {number} growth - Growth percentage
   * @returns {string} CSS class name for trend color
   */
  getTrendColor(growth) {
    return growth >= 0 ? 'text-green-500' : 'text-red-500';
  }
}

const analyticsService = new AnalyticsService();
export default analyticsService;
