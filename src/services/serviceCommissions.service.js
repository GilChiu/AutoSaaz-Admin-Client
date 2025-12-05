// Admin Service Commissions API Service
// Handles API calls for managing service commissions

import { FUNCTIONS_URL, SUPABASE_ANON_KEY } from '../config/supabase';

const API_BASE_URL = process.env.REACT_APP_FUNCTIONS_URL || FUNCTIONS_URL;

/**
 * Gets authentication token from localStorage
 * Admin uses 'authToken' as primary storage key
 * @returns {string|null}
 */
function getAuthToken() {
  return localStorage.getItem('authToken') || localStorage.getItem('accessToken') || localStorage.getItem('token');
}

/**
 * Creates headers with authentication for admin API calls
 * Admin tokens use x-admin-token header (or x-access-token for compatibility)
 * @returns {HeadersInit}
 */
function getHeaders() {
  const token = getAuthToken();
  const headers = {
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  };
  // Send admin token in x-admin-token header (admin-specific)
  if (token) headers['x-admin-token'] = token;
  return headers;
}

/**
 * Fetch all garages with their services and commission data
 * @returns {Promise<Object>} Response with garages array
 */
export async function getAllGaragesWithServices() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin-service-commissions`, {
      method: 'GET',
      headers: getHeaders(),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch garages');
    }

    return result;
  } catch (error) {

    throw error;
  }
}

/**
 * Set or update commission percentage for a specific service
 * @param {string} garageServiceId - The ID of the garage service
 * @param {number} commissionPercentage - Commission percentage (0-100)
 * @returns {Promise<Object>} Response with updated commission data
 */
export async function setServiceCommission(garageServiceId, commissionPercentage) {
  try {
    const response = await fetch(`${API_BASE_URL}/admin-service-commissions/set-commission`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({
        garageServiceId,
        commissionPercentage,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to set commission');
    }

    return result;
  } catch (error) {

    throw error;
  }
}

/**
 * Bulk update commissions for multiple services
 * @param {Array<{garageServiceId: string, commissionPercentage: number}>} commissions
 * @returns {Promise<Object>} Response with results
 */
export async function bulkSetServiceCommissions(commissions) {
  try {
    const results = await Promise.allSettled(
      commissions.map(({ garageServiceId, commissionPercentage }) =>
        setServiceCommission(garageServiceId, commissionPercentage)
      )
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return {
      success: failed === 0,
      message: `Updated ${successful} commissions${failed > 0 ? `, ${failed} failed` : ''}`,
      data: { successful, failed, results },
    };
  } catch (error) {

    throw error;
  }
}

const serviceCommissionsAPI = {
  getAllGaragesWithServices,
  setServiceCommission,
  bulkSetServiceCommissions,
};

export default serviceCommissionsAPI;
