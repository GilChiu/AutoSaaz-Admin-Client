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
 * Push Notifications Service
 * Handles all API calls for push notifications management
 */
const pushNotificationsService = {
  /**
   * Get all push notifications with optional filters
   */
  getNotifications: async (filters = {}) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.target_audience) params.append('target_audience', filters.target_audience);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.offset) params.append('offset', filters.offset);

      const queryString = params.toString();
      const url = `${FUNCTIONS_URL}/admin-push-notifications${queryString ? '?' + queryString : ''}`;

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
        throw new Error(errorData.error || `Failed to fetch notifications: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  /**
   * Get single notification by ID
   */
  getNotification: async (id) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${FUNCTIONS_URL}/admin-push-notifications/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch notification: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching notification:', error);
      throw error;
    }
  },

  /**
   * Create new notification
   */
  createNotification: async (notificationData) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${FUNCTIONS_URL}/admin-push-notifications`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(notificationData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create notification: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  /**
   * Update notification
   */
  updateNotification: async (id, notificationData) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${FUNCTIONS_URL}/admin-push-notifications/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(notificationData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update notification: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating notification:', error);
      throw error;
    }
  },

  /**
   * Delete notification
   */
  deleteNotification: async (id) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${FUNCTIONS_URL}/admin-push-notifications/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to delete notification: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  /**
   * Send notification (update status to 'sent')
   */
  sendNotification: async (id) => {
    return await pushNotificationsService.updateNotification(id, {
      status: 'sent',
      sent_at: new Date().toISOString(),
    });
  },
};

export default pushNotificationsService;
