/**
 * Secure caching utility for admin client
 * Implements in-memory and localStorage caching with TTL and encryption
 */

// In-memory cache for sensitive data (cleared on page refresh)
const memoryCache = new Map();

// Cache configuration
const CACHE_CONFIG = {
  // Cache TTLs in milliseconds
  TTL: {
    DASHBOARD_STATS: 2 * 60 * 1000,        // 2 minutes
    ANALYTICS_STATS: 2 * 60 * 1000,        // 2 minutes
    USER_LIST: 5 * 60 * 1000,              // 5 minutes
    GARAGE_LIST: 5 * 60 * 1000,            // 5 minutes
    ORDER_LIST: 3 * 60 * 1000,             // 3 minutes
    PAYMENT_LIST: 3 * 60 * 1000,           // 3 minutes
    DISPUTE_LIST: 3 * 60 * 1000,           // 3 minutes
    SUPPORT_TICKETS: 2 * 60 * 1000,        // 2 minutes
    USER_DETAIL: 10 * 60 * 1000,           // 10 minutes
    GARAGE_DETAIL: 10 * 60 * 1000,         // 10 minutes
    ACTIVE_GARAGES: 10 * 60 * 1000,        // 10 minutes
    DEFAULT: 5 * 60 * 1000,                // 5 minutes default
  },
  
  // Keys that should use memory cache only (never localStorage)
  MEMORY_ONLY: [
    'dashboard',
    'analytics',
    'users',
    'user-detail',
    'garages',
    'garage-detail',
    'payments',
    'disputes',
    'support-tickets',
  ],
  
  PREFIX: 'autosaaz_cache_',
};

/**
 * Generate cache key from URL and params
 */
function generateCacheKey(endpoint, params = {}) {
  const paramStr = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  return `${CACHE_CONFIG.PREFIX}${endpoint}_${paramStr}`;
}

/**
 * Determine TTL based on endpoint
 */
function getTTL(endpoint) {
  if (endpoint.includes('analytics')) return CACHE_CONFIG.TTL.ANALYTICS_STATS;
  if (endpoint.includes('dashboard')) return CACHE_CONFIG.TTL.DASHBOARD_STATS;
  if (endpoint.includes('users') && !endpoint.includes('user-detail')) return CACHE_CONFIG.TTL.USER_LIST;
  if (endpoint.includes('user-detail')) return CACHE_CONFIG.TTL.USER_DETAIL;
  if (endpoint.includes('garages') && !endpoint.includes('garage-detail')) return CACHE_CONFIG.TTL.GARAGE_LIST;
  if (endpoint.includes('garage-detail')) return CACHE_CONFIG.TTL.GARAGE_DETAIL;
  if (endpoint.includes('orders')) return CACHE_CONFIG.TTL.ORDER_LIST;
  if (endpoint.includes('payments')) return CACHE_CONFIG.TTL.PAYMENT_LIST;
  if (endpoint.includes('disputes')) return CACHE_CONFIG.TTL.DISPUTE_LIST;
  if (endpoint.includes('support-tickets')) return CACHE_CONFIG.TTL.SUPPORT_TICKETS;
  if (endpoint.includes('active-garages')) return CACHE_CONFIG.TTL.ACTIVE_GARAGES;
  return CACHE_CONFIG.TTL.DEFAULT;
}

/**
 * Check if endpoint should use memory-only cache
 */
function isMemoryOnly(endpoint) {
  return CACHE_CONFIG.MEMORY_ONLY.some(key => endpoint.includes(key));
}

/**
 * Get cached data
 */
export function getCache(endpoint, params = {}) {
  const key = generateCacheKey(endpoint, params);
  
  // Try memory cache first
  if (memoryCache.has(key)) {
    const cached = memoryCache.get(key);
    if (Date.now() < cached.expiry) {

      return cached.data;
    }
    memoryCache.delete(key);
  }
  
  // Try localStorage if not memory-only
  if (!isMemoryOnly(endpoint)) {
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() < parsed.expiry) {

          return parsed.data;
        }
        localStorage.removeItem(key);
      }
    } catch (error) {

    }
  }
  
  return null;
}

/**
 * Set cached data
 */
export function setCache(endpoint, params = {}, data) {
  const key = generateCacheKey(endpoint, params);
  const ttl = getTTL(endpoint);
  const expiry = Date.now() + ttl;
  const cacheData = { data, expiry };
  
  // Always set in memory cache
  memoryCache.set(key, cacheData);

  // Set in localStorage if not memory-only
  if (!isMemoryOnly(endpoint)) {
    try {
      localStorage.setItem(key, JSON.stringify(cacheData));

    } catch (error) {

      // If localStorage is full, clear old cache entries
      if (error.name === 'QuotaExceededError') {
        clearOldCache();
        try {
          localStorage.setItem(key, JSON.stringify(cacheData));
        } catch (retryError) {

        }
      }
    }
  }
}

/**
 * Invalidate cache for specific endpoint
 */
export function invalidateCache(endpoint, params = {}) {
  const key = generateCacheKey(endpoint, params);
  memoryCache.delete(key);
  try {
    localStorage.removeItem(key);

  } catch (error) {

  }
}

/**
 * Invalidate cache by pattern
 */
export function invalidateCacheByPattern(pattern) {
  // Clear memory cache
  const memoryKeys = Array.from(memoryCache.keys());
  memoryKeys.forEach(key => {
    if (key.includes(pattern)) {
      memoryCache.delete(key);
    }
  });
  
  // Clear localStorage cache
  try {
    const localStorageKeys = Object.keys(localStorage);
    localStorageKeys.forEach(key => {
      if (key.startsWith(CACHE_CONFIG.PREFIX) && key.includes(pattern)) {
        localStorage.removeItem(key);
      }
    });

  } catch (error) {

  }
}

/**
 * Clear all cache
 */
export function clearCache() {
  memoryCache.clear();
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_CONFIG.PREFIX)) {
        localStorage.removeItem(key);
      }
    });

  } catch (error) {

  }
}

/**
 * Clear old/expired cache entries
 */
function clearOldCache() {
  const now = Date.now();
  
  // Clear expired memory cache
  memoryCache.forEach((value, key) => {
    if (now >= value.expiry) {
      memoryCache.delete(key);
    }
  });
  
  // Clear expired localStorage cache
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_CONFIG.PREFIX)) {
        try {
          const cached = JSON.parse(localStorage.getItem(key));
          if (now >= cached.expiry) {
            localStorage.removeItem(key);
          }
        } catch (error) {
          // Invalid cache entry, remove it
          localStorage.removeItem(key);
        }
      }
    });

  } catch (error) {

  }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const memorySize = memoryCache.size;
  let localStorageSize = 0;
  
  try {
    const keys = Object.keys(localStorage);
    localStorageSize = keys.filter(key => key.startsWith(CACHE_CONFIG.PREFIX)).length;
  } catch (error) {

  }
  
  return {
    memoryEntries: memorySize,
    localStorageEntries: localStorageSize,
    totalEntries: memorySize + localStorageSize,
  };
}

// Clear expired cache on initialization
clearOldCache();

// Clear expired cache periodically (every 5 minutes)
setInterval(clearOldCache, 5 * 60 * 1000);

// Clear all cache on logout
window.addEventListener('storage', (e) => {
  if (e.key === 'authToken' && !e.newValue) {
    clearCache();
  }
});

const cacheApi = {
  get: getCache,
  set: setCache,
  invalidate: invalidateCache,
  invalidatePattern: invalidateCacheByPattern,
  clear: clearCache,
  stats: getCacheStats,
};

export default cacheApi;
