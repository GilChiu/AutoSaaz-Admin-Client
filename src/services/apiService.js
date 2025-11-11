import { FUNCTIONS_URL, SUPABASE_ANON_KEY } from '../config/supabase';

// API Base URL - Admin uses Supabase Functions
const API_BASE_URL = process.env.REACT_APP_FUNCTIONS_URL || FUNCTIONS_URL;

// Helper function to handle API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // For Supabase Functions: include anon key + x-access-token
  if (API_BASE_URL.includes('.functions.supabase.co')) {
    config.headers['Authorization'] = `Bearer ${SUPABASE_ANON_KEY}`;
    if (token) {
      config.headers['x-access-token'] = token;
    }
  } else if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
};

export const apiService = {
  // Authentication
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Login failed');
      }

      // Store tokens
      if (result.data) {
        localStorage.setItem('authToken', result.data.accessToken);
        localStorage.setItem('refreshToken', result.data.refreshToken);
        localStorage.setItem('userData', JSON.stringify(result.data.user));
        localStorage.setItem('userProfile', JSON.stringify(result.data.profile));
      }

      return {
        user: result.data.user,
        profile: result.data.profile,
        token: result.data.accessToken,
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: async () => {
    return apiRequest('/auth/logout', {
      method: 'POST'
    });
  },

  // Users
  getUsers: async (params = {}) => {
    const { page = 1, limit = 10, search = '', role = '', status = '' } = params;
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);
    if (search) queryParams.append('search', search);
    if (role) queryParams.append('role', role);
    if (status) queryParams.append('status', status);
    
    const response = await fetch(`${API_BASE_URL}/users?${queryParams}`, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to fetch users');
    }
    
    return result;
  },

  getUserDetail: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/user-detail/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to fetch user details');
    }
    
    return result.data;
  },

  createUser: async (userData) => {
    return apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  updateUser: async (userId, userData) => {
    return apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },

  deleteUser: async (userId) => {
    return apiRequest(`/users/${userId}`, {
      method: 'DELETE'
    });
  },

  // Garages
  getGarages: async (params = {}) => {
    const { page = 1, limit = 10, search = '', status = '', includeDeleted = false } = params;
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);
    if (search) queryParams.append('search', search);
    if (status) queryParams.append('status', status);
    if (includeDeleted) queryParams.append('includeDeleted', 'true');
    
    const response = await fetch(`${API_BASE_URL}/garages?${queryParams}`, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to fetch garages');
    }
    
    return result;
  },

  getGarageDetail: async (garageId) => {
    const response = await fetch(`${API_BASE_URL}/garage-detail/${garageId}`, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to fetch garage details');
    }
    
    return result.data;
  },

  suspendGarage: async (garageId, reason = '', adminId = null) => {
    const response = await fetch(`${API_BASE_URL}/garages`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        garageId,
        action: 'suspend',
        reason,
        adminId
      }),
    });
    
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to suspend garage');
    }
    
    return result;
  },

  unsuspendGarage: async (garageId, adminId = null) => {
    const response = await fetch(`${API_BASE_URL}/garages`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        garageId,
        action: 'unsuspend',
        adminId
      }),
    });
    
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to unsuspend garage');
    }
    
    return result;
  },

  deleteGarage: async (garageId, adminId = null) => {
    const response = await fetch(`${API_BASE_URL}/garages?garageId=${garageId}&adminId=${adminId || ''}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to delete garage');
    }
    
    return result;
  },

  createGarage: async (garageData) => {
    return apiRequest('/garages', {
      method: 'POST',
      body: JSON.stringify(garageData)
    });
  },

  updateGarage: async (garageId, garageData) => {
    return apiRequest(`/garages/${garageId}`, {
      method: 'PUT',
      body: JSON.stringify(garageData)
    });
  },

  // Orders
  getOrders: async () => {
    return apiRequest('/orders');
  },

  updateOrderStatus: async (orderId, status) => {
    return apiRequest(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    return apiRequest('/dashboard/stats');
  },
};
