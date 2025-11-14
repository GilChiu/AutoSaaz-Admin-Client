import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://lblcjyeiwgyanadssqac.supabase.co/functions/v1';

/**
 * Admin Notifications Service
 * Handles all API calls for admin notification system
 */
class AdminNotificationsService {
  /**
   * Get authorization headers with JWT token
   */
  getHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'x-access-token': token || '',
    };
  }

  /**
   * Get all notifications for admin
   * @param {Object} params - Query parameters
   * @param {number} params.limit - Maximum number of notifications to return
   * @param {boolean} params.unread - Only return unread notifications
   * @returns {Promise<Object>} Notifications data
   */
  async getNotifications(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.unread) queryParams.append('unread', 'true');

      const response = await axios.get(
        `${API_BASE_URL}/admin-notifications?${queryParams.toString()}`,
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching admin notifications:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get unread notification count
   * @returns {Promise<Object>} Unread count with breakdown
   */
  async getUnreadCount() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin-notifications/unread-count`,
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Mark a notification as read
   * @param {string} id - Notification ID
   * @returns {Promise<Object>} Success response
   */
  async markAsRead(id) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin-notifications/${id}/read`,
        {},
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Mark all notifications as read
   * @returns {Promise<Object>} Success response
   */
  async markAllAsRead() {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin-notifications/read-all`,
        {},
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Navigate to notification source
   * @param {Object} notification - Notification object
   * @param {Function} navigate - React Router navigate function
   */
  navigateToSource(notification, navigate) {
    const { type } = notification;

    switch (type) {
      case 'ticket':
        navigate(`/support`);
        break;
      case 'dispute':
        navigate(`/disputes`);
        break;
      case 'push_notification':
        navigate(`/content/push-notification`);
        break;
      default:
        console.warn('Unknown notification type:', type);
    }
  }

  /**
   * Get icon for notification type
   * @param {string} type - Notification type
   * @returns {string} Emoji icon
   */
  getNotificationIcon(type) {
    const icons = {
      ticket: '🎫',
      dispute: '⚖️',
      push_notification: '📢',
    };
    return icons[type] || '🔔';
  }

  /**
   * Get priority color
   * @param {string} priority - Priority level
   * @returns {string} Tailwind color class
   */
  getPriorityColor(priority) {
    const colors = {
      low: 'text-gray-500',
      normal: 'text-blue-500',
      high: 'text-orange-500',
      urgent: 'text-red-500',
    };
    return colors[priority] || 'text-gray-500';
  }

  /**
   * Get priority badge style
   * @param {string} priority - Priority level
   * @returns {string} Tailwind class string
   */
  getPriorityBadge(priority) {
    const badges = {
      low: 'bg-gray-100 text-gray-700',
      normal: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700',
    };
    return badges[priority] || 'bg-gray-100 text-gray-700';
  }
}

const adminNotificationsServiceInstance = new AdminNotificationsService();
export default adminNotificationsServiceInstance;
