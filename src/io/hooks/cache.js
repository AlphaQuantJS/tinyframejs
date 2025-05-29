/**
 * Cache hook for API requests
 * Provides caching functionality to avoid redundant API calls
 */

/**
 * Simple in-memory cache implementation
 */
class MemoryCache {
  constructor(options = {}) {
    this.cache = new Map();
    this.ttl = options.ttl || 3600000; // Default TTL: 1 hour
    this.maxSize = options.maxSize || 100; // Default max items: 100
  }

  /**
   * Set a value in the cache
   *
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} [ttl] - Time to live in milliseconds
   */
  set(key, value, ttl = this.ttl) {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      value,
      expires: Date.now() + ttl,
    });
  }

  /**
   * Get a value from the cache
   *
   * @param {string} key - Cache key
   * @returns {*|null} - Cached value or null if not found
   */
  get(key) {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // Check if the item has expired
    if (item.expires < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    // Move the item to the end of the Map to implement LRU
    this.cache.delete(key);
    this.cache.set(key, item);

    return item.value;
  }

  /**
   * Check if a key exists in the cache
   *
   * @param {string} key - Cache key
   * @returns {boolean} - Whether the key exists
   */
  has(key) {
    const item = this.cache.get(key);

    if (!item) {
      return false;
    }

    // Check if the item has expired
    if (item.expires < Date.now()) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a value from the cache
   *
   * @param {string} key - Cache key
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Clear the cache
   */
  clear() {
    this.cache.clear();
  }
}

/**
 * Creates a cache key from request details
 *
 * @param {Object} request - Request object
 * @returns {string} - Cache key
 */
function createCacheKey(request) {
  const { url, method = 'GET', headers = {}, body } = request;

  // Create a string representation of the request
  const parts = [method.toUpperCase(), url];

  // Add headers that might affect the response
  const cacheableHeaders = ['accept', 'content-type'];
  const headerStr = cacheableHeaders
    .filter((key) => headers[key])
    .map((key) => `${key}:${headers[key]}`)
    .join(',');

  if (headerStr) {
    parts.push(headerStr);
  }

  // Add body if present
  if (body) {
    parts.push(typeof body === 'string' ? body : JSON.stringify(body));
  }

  return parts.join('|');
}

/**
 * Creates a cache hook for API requests
 *
 * @param {Object} options - Cache options
 * @param {Object} [options.cache] - Cache implementation (must have get, set, has methods)
 * @param {number} [options.ttl] - Time to live in milliseconds
 * @param {Function} [options.keyGenerator] - Function to generate cache keys
 * @param {Function} [options.shouldCache] - Function to determine if a request should be cached
 * @returns {Function} - Cache hook function
 */
export function createCacheHook(options = {}) {
  const {
    cache = new MemoryCache(options),
    ttl = 3600000, // Default TTL: 1 hour
    keyGenerator = createCacheKey,
    shouldCache = (request) =>
      request.method === 'GET' || request.method === undefined,
  } = options;

  return async (context, next) => {
    const { request } = context;

    // Skip caching for non-GET requests by default
    if (!shouldCache(request)) {
      return next(context);
    }

    // Generate cache key
    const cacheKey = keyGenerator(request);

    // Check if response is in cache
    if (cache.has(cacheKey)) {
      const cachedResponse = cache.get(cacheKey);

      // Add cache hit information
      cachedResponse.headers = {
        ...cachedResponse.headers,
        'x-cache': 'HIT',
      };

      return cachedResponse;
    }

    // Execute the next middleware or the actual request
    const response = await next(context);

    // Cache the response
    if (response.ok) {
      // Clone the response to cache it
      const clonedResponse = {
        ...response,
        headers: { ...response.headers, 'x-cache': 'MISS' },
      };

      // Store in cache
      cache.set(cacheKey, clonedResponse, ttl);
    }

    return response;
  };
}

/**
 * Default cache hook with standard configuration
 */
export const cacheHook = createCacheHook();

/**
 * Export the MemoryCache class for direct usage
 */
export { MemoryCache };
