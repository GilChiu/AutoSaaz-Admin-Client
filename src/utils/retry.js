/**
 * Retry utility with exponential backoff
 * Implements industry-standard retry patterns for API calls
 */

/**
 * Check if error is retryable
 * @param {Error} error - The error to check
 * @returns {boolean} - Whether the error should trigger a retry
 */
function isRetryableError(error) {
  // Network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return true;
  }
  
  // 5xx server errors (transient)
  if (error.message && (
    error.message.includes('500') ||
    error.message.includes('502') ||
    error.message.includes('503') ||
    error.message.includes('504') ||
    error.message.includes('Internal server error') ||
    error.message.includes('Bad Gateway') ||
    error.message.includes('Service Unavailable') ||
    error.message.includes('Gateway Timeout')
  )) {
    return true;
  }
  
  // Cloudflare errors
  if (error.message && error.message.includes('Cloudflare')) {
    return true;
  }
  
  // Timeout errors
  if (error.name === 'AbortError' || error.message.includes('timeout')) {
    return true;
  }
  
  return false;
}

/**
 * Calculate exponential backoff delay
 * @param {number} attempt - Current attempt number (0-indexed)
 * @param {number} baseDelay - Base delay in milliseconds
 * @param {number} maxDelay - Maximum delay in milliseconds
 * @returns {number} - Delay in milliseconds
 */
function calculateBackoff(attempt, baseDelay = 1000, maxDelay = 10000) {
  // Exponential backoff: baseDelay * 2^attempt with jitter
  const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  
  // Add jitter (±25%) to prevent thundering herd
  const jitter = exponentialDelay * 0.25 * (Math.random() * 2 - 1);
  
  return Math.floor(exponentialDelay + jitter);
}

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.baseDelay - Base delay in ms (default: 1000)
 * @param {number} options.maxDelay - Maximum delay in ms (default: 10000)
 * @param {Function} options.shouldRetry - Custom function to determine if error is retryable
 * @param {Function} options.onRetry - Callback on retry (receives attempt, error, delay)
 * @returns {Promise<any>} - Result of the function
 */
export async function retry(fn, options = {}) {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    shouldRetry = isRetryableError,
    onRetry = null,
  } = options;
  
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry if we've exhausted retries
      if (attempt === maxRetries) {
        break;
      }
      
      // Don't retry if error is not retryable
      if (!shouldRetry(error)) {
        throw error;
      }
      
      // Calculate delay and wait
      const delay = calculateBackoff(attempt, baseDelay, maxDelay);
      
      // Call onRetry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, error, delay);
      }

      await sleep(delay);
    }
  }
  
  // All retries exhausted

  throw lastError;
}

/**
 * Retry with custom configuration for API calls
 * @param {Function} fn - Async function to retry
 * @param {string} endpoint - Endpoint name for logging
 * @returns {Promise<any>}
 */
export async function retryApiCall(fn, endpoint = 'API') {
  return retry(fn, {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 5000,
    onRetry: (attempt, error, delay) => {
      console.log(
        `[API Retry] ${endpoint} - Attempt ${attempt}/3 - ` +
        `Waiting ${Math.round(delay / 1000)}s before retry`
      );
    },
  });
}

export default retry;
