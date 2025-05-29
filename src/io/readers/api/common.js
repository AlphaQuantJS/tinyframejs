/**
 * Common API utilities for fetching JSON, CSV and other data formats
 * Provides unified interface with retries, caching, and authentication
 */

/**
 * Default fetch options
 */
const DEFAULT_OPTIONS = {
  retries: 3,
  retryDelay: 1000,
  timeout: 30000,
  cache: false,
  cacheExpiry: 3600000, // 1 hour in milliseconds
  headers: {},
  auth: null,
};

/**
 * In-memory cache for API responses
 */
const responseCache = new Map();

/**
 * Fetches data from a URL with support for retries, caching and authentication
 *
 * @param {string} url - URL to fetch data from
 * @param {Object} options - Fetch options
 * @param {number} [options.retries=3] - Number of retry attempts
 * @param {number} [options.retryDelay=1000] - Delay between retries in milliseconds
 * @param {number} [options.timeout=30000] - Request timeout in milliseconds
 * @param {boolean} [options.cache=false] - Whether to cache the response
 * @param {number} [options.cacheExpiry=3600000] - Cache expiry time in milliseconds
 * @param {Object} [options.headers={}] - Request headers
 * @param {Object} [options.auth=null] - Authentication configuration
 * @param {string} [options.auth.type] - Auth type: 'basic', 'bearer', 'apikey'
 * @param {string} [options.auth.username] - Username for basic auth
 * @param {string} [options.auth.password] - Password for basic auth
 * @param {string} [options.auth.token] - Token for bearer auth
 * @param {string} [options.auth.apiKey] - API key
 * @param {string} [options.auth.apiKeyName='api_key'] - API key parameter name
 * @param {string} [options.auth.apiKeyLocation='query'] - API key location: 'query', 'header'
 * @returns {Promise<Response>} - Fetch response
 */
export async function fetchWithRetry(url, options = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const { retries, retryDelay, timeout, cache, cacheExpiry, headers, auth } =
    config;

  // Check cache if enabled
  if (cache) {
    const cacheKey = getCacheKey(url, config);
    const cachedResponse = responseCache.get(cacheKey);

    if (cachedResponse && Date.now() < cachedResponse.expiry) {
      return cachedResponse.response.clone();
    }
  }

  // Prepare headers with authentication if provided
  const requestHeaders = { ...headers };

  if (auth) {
    applyAuthentication(url, requestHeaders, auth);
  }

  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Attempt to fetch with retries
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        ...config,
        headers: requestHeaders,
        signal: controller.signal,
      });

      // Clear timeout
      clearTimeout(timeoutId);

      // Check if response is ok
      if (!response.ok) {
        throw new Error(
          `HTTP error: ${response.status} ${response.statusText}`,
        );
      }

      // Cache response if enabled
      if (cache) {
        const cacheKey = getCacheKey(url, config);
        responseCache.set(cacheKey, {
          response: response.clone(),
          expiry: Date.now() + cacheExpiry,
        });
      }

      return response;
    } catch (error) {
      lastError = error;

      // Don't retry if we've reached the maximum number of retries
      if (attempt >= retries) {
        break;
      }

      // Don't retry if the request was aborted due to timeout
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }

  // Clear timeout if we've exhausted all retries
  clearTimeout(timeoutId);

  throw new Error(`Failed after ${retries} retries: ${lastError.message}`);
}

/**
 * Applies authentication to the request
 *
 * @param {string} url - URL to fetch data from
 * @param {Object} headers - Request headers
 * @param {Object} auth - Authentication configuration
 */
function applyAuthentication(url, headers, auth) {
  const {
    type,
    username,
    password,
    token,
    apiKey,
    apiKeyName = 'api_key',
    apiKeyLocation = 'query',
  } = auth;

  switch (type) {
    case 'basic':
      if (username && password) {
        const credentials = btoa(`${username}:${password}`);
        headers['Authorization'] = `Basic ${credentials}`;
      }
      break;

    case 'bearer':
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      break;

    case 'apikey':
      if (apiKey) {
        if (apiKeyLocation === 'header') {
          headers[apiKeyName] = apiKey;
        } else if (apiKeyLocation === 'query') {
          // Modify the URL to include the API key
          const separator = url.includes('?') ? '&' : '?';
          url += `${separator}${apiKeyName}=${apiKey}`;
        }
      }
      break;
  }
}

/**
 * Generates a cache key for a request
 *
 * @param {string} url - URL to fetch data from
 * @param {Object} options - Fetch options
 * @returns {string} - Cache key
 */
function getCacheKey(url, options) {
  // Create a simplified version of options for the cache key
  const keyOptions = {
    headers: options.headers,
    auth: options.auth,
  };

  return `${url}:${JSON.stringify(keyOptions)}`;
}

/**
 * Fetches JSON data from a URL
 *
 * @param {string} url - URL to fetch JSON from
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - Parsed JSON response
 */
export async function fetchJson(url, options = {}) {
  const response = await fetchWithRetry(url, options);
  return await response.json();
}

/**
 * Fetches CSV data from a URL
 *
 * @param {string} url - URL to fetch CSV from
 * @param {Object} options - Fetch options
 * @param {Object} [options.csvOptions] - CSV parsing options
 * @returns {Promise<string>} - CSV text response
 */
export async function fetchCsv(url, options = {}) {
  const response = await fetchWithRetry(url, options);
  return await response.text();
}

/**
 * Clears the response cache
 *
 * @param {string} [urlPattern] - Optional URL pattern to clear specific cache entries
 */
export function clearCache(urlPattern) {
  if (urlPattern) {
    // Clear specific cache entries matching the pattern
    const regex = new RegExp(urlPattern);
    for (const key of responseCache.keys()) {
      if (regex.test(key)) {
        responseCache.delete(key);
      }
    }
  } else {
    // Clear all cache
    responseCache.clear();
  }
}

/**
 * Creates a rate-limited fetch function
 *
 * @param {number} requestsPerMinute - Maximum number of requests per minute
 * @returns {Function} - Rate-limited fetch function
 */
export function createRateLimitedFetch(requestsPerMinute) {
  const intervalMs = 60000 / requestsPerMinute;
  let lastRequestTime = 0;

  return async function rateLimitedFetch(url, options = {}) {
    const now = Date.now();
    const timeToWait = Math.max(0, intervalMs - (now - lastRequestTime));

    if (timeToWait > 0) {
      await new Promise((resolve) => setTimeout(resolve, timeToWait));
    }

    lastRequestTime = Date.now();
    return fetchWithRetry(url, options);
  };
}

/**
 * Creates an API client with predefined configuration
 *
 * @param {Object} defaultOptions - Default options for all requests
 * @returns {Object} - API client with fetch methods
 */
export function createApiClient(defaultOptions = {}) {
  return {
    fetchJson: (url, options = {}) =>
      fetchJson(url, { ...defaultOptions, ...options }),
    fetchCsv: (url, options = {}) =>
      fetchCsv(url, { ...defaultOptions, ...options }),
    fetch: (url, options = {}) =>
      fetchWithRetry(url, { ...defaultOptions, ...options }),
  };
}
