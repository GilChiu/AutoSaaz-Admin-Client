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
 * CMS & Policies Service
 * Handles all API calls for CMS content and policies management
 */
const cmsPoliciesService = {
  /**
   * Get all policies with optional filters
   */
  getPolicies: async (filters = {}) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const params = new URLSearchParams();
      if (filters.policy_type) params.append('policy_type', filters.policy_type);
      if (filters.is_published !== undefined) params.append('is_published', filters.is_published);
      if (filters.language) params.append('language', filters.language);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.offset) params.append('offset', filters.offset);

      const queryString = params.toString();
      const url = `${FUNCTIONS_URL}/admin-cms-policies${queryString ? '?' + queryString : ''}`;

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
        throw new Error(errorData.error || `Failed to fetch policies: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching policies:', error);
      throw error;
    }
  },

  /**
   * Get single policy by ID
   */
  getPolicy: async (id) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${FUNCTIONS_URL}/admin-cms-policies/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch policy: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching policy:', error);
      throw error;
    }
  },

  /**
   * Create new policy
   */
  createPolicy: async (policyData) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${FUNCTIONS_URL}/admin-cms-policies`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(policyData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create policy: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating policy:', error);
      throw error;
    }
  },

  /**
   * Update policy
   */
  updatePolicy: async (id, policyData) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${FUNCTIONS_URL}/admin-cms-policies/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(policyData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update policy: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating policy:', error);
      throw error;
    }
  },

  /**
   * Delete policy
   */
  deletePolicy: async (id) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${FUNCTIONS_URL}/admin-cms-policies/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to delete policy: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting policy:', error);
      throw error;
    }
  },

  /**
   * Publish/unpublish policy
   */
  togglePublish: async (id, isPublished) => {
    return await cmsPoliciesService.updatePolicy(id, {
      is_published: isPublished,
      published_at: isPublished ? new Date().toISOString() : null,
    });
  },
};

export default cmsPoliciesService;
