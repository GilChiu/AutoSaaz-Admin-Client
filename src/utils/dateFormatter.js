/**
 * Date Formatting Utilities with GST (Gulf Standard Time) Support
 * GST is UTC+4 - All times displayed in Gulf Standard Time
 * 
 * Provides consistent date/time formatting across the application
 * Uses industry-standard Intl.DateTimeFormat with Asia/Dubai timezone
 */

const GST_TIMEZONE = 'Asia/Dubai'; // GST +4

/**
 * Format timestamp to readable date and time in GST
 * Example: "Nov 3, 2025, 11:30 AM GST"
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} Formatted date and time
 */
export const formatDateTime = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  try {
    const date = new Date(timestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    const formatted = new Intl.DateTimeFormat('en-US', {
      timeZone: GST_TIMEZONE,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
    
    return `${formatted} GST`;
  } catch (error) {

    return 'Invalid Date';
  }
};

/**
 * Format timestamp to just date (no time) in GST
 * Example: "Nov 3, 2025"
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} Formatted date
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  try {
    const date = new Date(timestamp);
    
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    return new Intl.DateTimeFormat('en-US', {
      timeZone: GST_TIMEZONE,
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  } catch (error) {

    return 'Invalid Date';
  }
};

/**
 * Format timestamp to just time (no date) in GST
 * Example: "11:30 AM GST"
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} Formatted time
 */
export const formatTime = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  try {
    const date = new Date(timestamp);
    
    if (isNaN(date.getTime())) return 'Invalid Time';
    
    const formatted = new Intl.DateTimeFormat('en-US', {
      timeZone: GST_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
    
    return `${formatted} GST`;
  } catch (error) {

    return 'Invalid Time';
  }
};

/**
 * Get relative time (e.g., "2 hours ago") with GST awareness
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} Relative time string
 */
export const getRelativeTime = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  try {
    const date = new Date(timestamp);
    const now = new Date();
    
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return formatDate(timestamp);
  } catch (error) {

    return 'Invalid Date';
  }
};
