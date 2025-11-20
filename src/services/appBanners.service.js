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
 * App Banners Service
 * Handles all API calls for app banners management
 */
const appBannersService = {
  /**
   * Get all banners with optional filters
   */
  getBanners: async (filters = {}) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const params = new URLSearchParams();
      if (filters.is_active !== undefined) params.append('is_active', filters.is_active);
      if (filters.target_platform) params.append('target_platform', filters.target_platform);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.offset) params.append('offset', filters.offset);

      const queryString = params.toString();
      const url = `${FUNCTIONS_URL}/admin-app-banners${queryString ? '?' + queryString : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(errorData.error || `Failed to fetch banners: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching banners:', error);
      throw error;
    }
  },

  /**
   * Get single banner by ID
   */
  getBanner: async (id) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${FUNCTIONS_URL}/admin-app-banners/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch banner: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching banner:', error);
      throw error;
    }
  },

  /**
   * Create new banner
   */
  createBanner: async (bannerData) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${FUNCTIONS_URL}/admin-app-banners`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(bannerData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create banner: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating banner:', error);
      throw error;
    }
  },

  /**
   * Update banner
   */
  updateBanner: async (id, bannerData) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${FUNCTIONS_URL}/admin-app-banners/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(bannerData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update banner: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating banner:', error);
      throw error;
    }
  },

  /**
   * Delete banner
   */
  deleteBanner: async (id) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${FUNCTIONS_URL}/admin-app-banners/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to delete banner: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting banner:', error);
      throw error;
    }
  },

  /**
   * Toggle banner active status
   */
  toggleBannerStatus: async (id, isActive) => {
    return await appBannersService.updateBanner(id, { is_active: isActive });
  },
};

export default appBannersService;
