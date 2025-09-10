// API Base URL - Update this to match your backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

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

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
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
    // Mock login for development - replace with actual API call
    if (credentials.email === 'admin@autosaaz.com' && credentials.password === 'admin123') {
      return {
        user: {
          id: 1,
          name: 'Admin User',
          email: 'admin@autosaaz.com',
          role: 'admin'
        },
        token: 'mock-jwt-token'
      };
    }
    throw new Error('Invalid credentials');
  },

  logout: async () => {
    return apiRequest('/auth/logout', {
      method: 'POST'
    });
  },

  // Users
  getUsers: async () => {
    return apiRequest('/users');
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
  getGarages: async () => {
    return apiRequest('/garages');
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

  deleteGarage: async (garageId) => {
    return apiRequest(`/garages/${garageId}`, {
      method: 'DELETE'
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
