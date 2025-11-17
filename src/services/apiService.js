import { FUNCTIONS_URL, SUPABASE_ANON_KEY } from '../config/supabase';
import cache from '../utils/cache';
import { retryApiCall } from '../utils/retry';

// API Base URL - Admin uses Supabase Functions
const API_BASE_URL = process.env.REACT_APP_FUNCTIONS_URL || FUNCTIONS_URL;

// Helper function to handle API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  // Check cache for GET requests only
  const useCache = !options.method || options.method === 'GET';
  if (useCache) {
    const cached = cache.get(endpoint, options.params || {});
    if (cached) {
      return cached;
    }
  }
  
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

    // Cache successful GET requests
    if (useCache) {
      cache.set(endpoint, options.params || {}, data);
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
    
    const endpoint = `/users?${queryParams}`;
    
    // Check cache first
    const cached = cache.get(endpoint);
    if (cached) return cached;
    
    // Wrap in retry logic for resilience against transient errors
    return retryApiCall(async () => {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      
      if (!response.ok) {
        const result = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
        throw new Error(result.message || `Failed to fetch users (${response.status})`);
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch users');
      }
      
      // Cache the result
      cache.set(endpoint, {}, result);
      
      return result;
    }, `GET ${endpoint}`);
  },

  getUserDetail: async (userId) => {
    const endpoint = `/user-detail/${userId}`;
    
    // Check cache first
    const cached = cache.get(endpoint);
    if (cached) return cached;
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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
    
    // Cache the result
    cache.set(endpoint, {}, result.data);
    
    return result.data;
  },

  createUser: async (userData) => {
    const result = await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    // Invalidate users cache
    cache.invalidatePattern('users');
    return result;
  },

  updateUser: async (userId, userData) => {
    const result = await apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
    // Invalidate users and user detail cache
    cache.invalidatePattern('users');
    cache.invalidate(`/user-detail/${userId}`);
    return result;
  },

  deleteUser: async (userId) => {
    const result = await apiRequest(`/users/${userId}`, {
      method: 'DELETE'
    });
    // Invalidate users and user detail cache
    cache.invalidatePattern('users');
    cache.invalidate(`/user-detail/${userId}`);
    return result;
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
    
    const endpoint = `/garages?${queryParams}`;
    
    // Check cache first
    const cached = cache.get(endpoint);
    if (cached) return cached;
    
    // Wrap in retry logic for resilience against transient errors
    return retryApiCall(async () => {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      
      if (!response.ok) {
        const result = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
        throw new Error(result.message || `Failed to fetch garages (${response.status})`);
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch garages');
      }
      
      // Cache the result
      cache.set(endpoint, {}, result);
      
      return result;
    }, `GET ${endpoint}`);
  },

  getGarageDetail: async (garageId) => {
    const endpoint = `/garage-detail/${garageId}`;
    
    // Check cache first
    const cached = cache.get(endpoint);
    if (cached) return cached;
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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
    
    // Cache the result
    cache.set(endpoint, {}, result.data);
    
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
    
    // Invalidate garages cache
    cache.invalidatePattern('garages');
    cache.invalidate(`/garage-detail/${garageId}`);
    
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
    
    // Invalidate garages cache
    cache.invalidatePattern('garages');
    cache.invalidate(`/garage-detail/${garageId}`);
    
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
    
    // Invalidate garages cache
    cache.invalidatePattern('garages');
    cache.invalidate(`/garage-detail/${garageId}`);
    
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
  getOrders: async (params = {}) => {
    const { page = 1, limit = 10, search = '', status = '' } = params;
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);
    if (search) queryParams.append('search', search);
    if (status) queryParams.append('status', status);
    
    const endpoint = `/orders?${queryParams}`;
    
    // Check cache first
    const cached = cache.get(endpoint);
    if (cached) return cached;
    
    // Wrap in retry logic for resilience against transient errors
    return retryApiCall(async () => {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(error.error || `Failed to fetch orders (${response.status})`);
      }
      
      const result = await response.json();
      
      // Cache the result
      cache.set(endpoint, {}, result);
      
      return result;
    }, `GET ${endpoint}`);
  },

  getOrderDetail: async (orderId) => {
    const endpoint = `/order-detail/${orderId}`;
    
    // Check cache first
    const cached = cache.get(endpoint);
    if (cached) return cached;
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch order details');
    }
    
    const result = await response.json();
    
    // Cache the result
    cache.set(endpoint, {}, result);
    
    return result;
  },

  assignGarage: async (orderId, garageId, adminId = null, status = null) => {
    const body = { garageId, adminId };
    if (status) body.status = status;
    
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to assign garage');
    }
    
    // Invalidate orders cache
    cache.invalidatePattern('orders');
    cache.invalidate(`/order-detail/${orderId}`);
    
    return await response.json();
  },

  getActiveGarages: async () => {
    const endpoint = '/active-garages';
    
    // Check cache first
    const cached = cache.get(endpoint);
    if (cached) return cached;
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch active garages');
    }
    
    const result = await response.json();
    
    // Cache the result
    cache.set(endpoint, {}, result);
    
    return result;
  },

  updateOrderStatus: async (orderId, status) => {
    const result = await apiRequest(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    // Invalidate orders cache
    cache.invalidatePattern('orders');
    cache.invalidate(`/order-detail/${orderId}`);
    return result;
  },

  // Payments
  getPayments: async (params = {}) => {
    const { page = 1, limit = 10, search = '', status = '', type = '' } = params;
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);
    if (search) queryParams.append('search', search);
    if (status) queryParams.append('status', status);
    if (type) queryParams.append('type', type);
    
    const endpoint = `/payments?${queryParams}`;
    
    // Check cache first
    const cached = cache.get(endpoint);
    if (cached) return cached;
    
    // Wrap in retry logic for resilience against transient errors
    return retryApiCall(async () => {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(error.error || `Failed to fetch payments (${response.status})`);
      }
      
      const result = await response.json();
      
      // Cache the result
      cache.set(endpoint, {}, result);
      
      return result;
    }, `GET ${endpoint}`);
  },

  getPaymentDetail: async (transactionId) => {
    const endpoint = `/payment-detail/${transactionId}`;
    
    // Check cache first
    const cached = cache.get(endpoint);
    if (cached) return cached;
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch payment details');
    }
    
    const result = await response.json();
    
    // Cache the result
    cache.set(endpoint, {}, result);
    
    return result;
  },

  releasePayment: async (transactionId, adminId = null) => {
    const response = await fetch(`${API_BASE_URL}/payments/${transactionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        action: 'release',
        adminId
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to release payment');
    }
    
    // Invalidate payments cache
    cache.invalidatePattern('payments');
    cache.invalidate(`/payment-detail/${transactionId}`);
    
    return await response.json();
  },

  flagPayment: async (transactionId, reason, adminId = null) => {
    const response = await fetch(`${API_BASE_URL}/payments/${transactionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        action: 'flag',
        reason,
        adminId
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to flag payment');
    }
    
    // Invalidate payments cache
    cache.invalidatePattern('payments');
    cache.invalidate(`/payment-detail/${transactionId}`);
    
    return await response.json();
  },

  // Disputes & Revisions
  getDisputes: async (params = {}) => {
    const { page = 1, limit = 10, search = '', status = '', type = '' } = params;
    const queryParams = new URLSearchParams();
    if (page) queryParams.append('page', page);
    if (limit) queryParams.append('limit', limit);
    if (search) queryParams.append('search', search);
    if (status) queryParams.append('status', status);
    if (type) queryParams.append('type', type);
    
    const endpoint = `/disputes?${queryParams}`;
    
    // Check cache first
    const cached = cache.get(endpoint);
    if (cached) return cached;
    
    // Wrap in retry logic for resilience against transient errors
    return retryApiCall(async () => {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(error.error || `Failed to fetch disputes (${response.status})`);
      }
      
      const result = await response.json();
      
      // Cache the result
      cache.set(endpoint, {}, result);
      
      return result;
    }, `GET ${endpoint}`);
  },

  getDisputeDetail: async (disputeId) => {
    const endpoint = `/dispute-detail/${disputeId}`;
    
    // Check cache first
    const cached = cache.get(endpoint);
    if (cached) return cached;
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch dispute details');
    }
    
    const result = await response.json();
    
    // Cache the result
    cache.set(endpoint, {}, result);
    
    return result;
  },

  requestEvidence: async (disputeId, message, adminId = null) => {
    const response = await fetch(`${API_BASE_URL}/disputes/${disputeId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        action: 'request_evidence',
        message,
        adminId
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to request evidence');
    }
    
    // Invalidate disputes cache
    cache.invalidatePattern('disputes');
    cache.invalidate(`/dispute-detail/${disputeId}`);
    
    return await response.json();
  },

  resolveCase: async (disputeId, message, notes, adminId = null) => {
    const response = await fetch(`${API_BASE_URL}/disputes/${disputeId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        action: 'resolve',
        message,
        notes,
        adminId
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to resolve case');
    }
    
    // Invalidate disputes cache
    cache.invalidatePattern('disputes');
    cache.invalidate(`/dispute-detail/${disputeId}`);
    
    return await response.json();
  },

  escalateCase: async (disputeId, reason, message, adminId = null) => {
    const response = await fetch(`${API_BASE_URL}/disputes/${disputeId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        action: 'escalate',
        reason,
        message,
        adminId
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to escalate case');
    }
    
    // Invalidate disputes cache
    cache.invalidatePattern('disputes');
    cache.invalidate(`/dispute-detail/${disputeId}`);
    
    return await response.json();
  },

  addDisputeMessage: async (disputeId, senderId, body, attachmentUrl = null, attachmentType = null, attachmentName = null) => {
    const payload = {
      senderId,
      body
    };
    
    if (attachmentUrl) {
      payload.attachmentUrl = attachmentUrl;
      payload.attachmentType = attachmentType;
      payload.attachmentName = attachmentName;
    }
    
    const response = await fetch(`${API_BASE_URL}/dispute-detail/${disputeId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add message');
    }
    
    // Invalidate dispute detail cache
    cache.invalidate(`/dispute-detail/${disputeId}`);
    
    return await response.json();
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    const endpoint = '/dashboard/stats';
    
    // Check cache first
    const cached = cache.get(endpoint);
    if (cached) return cached;
    
    const result = await apiRequest(endpoint);
    
    // Cache the result
    cache.set(endpoint, {}, result);
    
    return result;
  },

  // Support Tickets
  getSupportTickets: async (senderType = null, status = null) => {
    let url = '/support-tickets?';
    if (senderType) url += `senderType=${senderType}&`;
    if (status) url += `status=${status}`;
    
    // Check cache first
    const cached = cache.get(url);
    if (cached) return cached;
    
    // Wrap in retry logic for resilience against transient errors
    return retryApiCall(async () => {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(error.error || `Failed to get support tickets (${response.status})`);
      }
      
      const data = await response.json();
      const result = data.tickets || [];
      
      // Cache the result
      cache.set(url, {}, result);
      
      return result;
    }, `GET ${url}`);
  },

  getSupportTicketDetail: async (ticketId) => {
    const endpoint = `/support-tickets/${ticketId}`;
    
    // Check cache first
    const cached = cache.get(endpoint);
    if (cached) return cached;
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get ticket detail');
    }
    
    const result = await response.json();
    
    // Cache the result
    cache.set(endpoint, {}, result);
    
    return result;
  },

  addSupportTicketMessage: async (ticketId, senderId, message) => {
    const response = await fetch(`${API_BASE_URL}/support-tickets/${ticketId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        action: 'add_message',
        senderId,
        senderType: 'admin',
        message
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add message');
    }
    
    // Invalidate support tickets cache
    cache.invalidatePattern('support-tickets');
    
    return await response.json();
  },

  updateSupportTicketStatus: async (ticketId, status, adminId, resolutionNotes = null) => {
    const response = await fetch(`${API_BASE_URL}/support-tickets/${ticketId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        action: 'update_status',
        status,
        adminId,
        resolutionNotes
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update ticket status');
    }
    
    // Invalidate support tickets cache
    cache.invalidatePattern('support-tickets');
    
    return await response.json();
  },
};
