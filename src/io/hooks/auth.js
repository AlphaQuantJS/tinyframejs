/**
 * Authentication hook for API requests
 * Provides authentication rotation and management for API keys
 */

/**
 * Key rotation strategy implementation
 */
class KeyRotator {
  /**
   * Create a new key rotator
   *
   * @param {Object[]} keys - Array of API keys with their limits
   * @param {Object} options - Rotator options
   */
  constructor(keys = [], options = {}) {
    this.keys = keys.map((key) => ({
      ...key,
      usageCount: 0,
      lastUsed: 0,
      errors: 0,
      disabled: false,
    }));

    this.options = {
      maxErrorsBeforeDisable: options.maxErrorsBeforeDisable || 3,
      resetErrorsAfter: options.resetErrorsAfter || 3600000, // 1 hour
      rotationStrategy: options.rotationStrategy || 'round-robin', // 'round-robin', 'least-used', 'random'
      ...options,
    };

    this.currentKeyIndex = 0;
  }

  /**
   * Get the next available API key
   *
   * @returns {Object|null} - Next available API key or null if none available
   */
  getNextKey() {
    if (this.keys.length === 0) {
      return null;
    }

    // Filter out disabled keys
    const availableKeys = this.keys.filter((key) => !key.disabled);

    if (availableKeys.length === 0) {
      return null;
    }

    let selectedKey;

    switch (this.options.rotationStrategy) {
    case 'round-robin':
      // Move to the next key in the list
      this.currentKeyIndex =
          (this.currentKeyIndex + 1) % availableKeys.length;
      selectedKey = availableKeys[this.currentKeyIndex];
      break;

    case 'least-used':
      // Use the key with the least usage count
      selectedKey = availableKeys.reduce(
        (least, current) =>
          (current.usageCount < least.usageCount ? current : least),
        availableKeys[0],
      );
      break;

    case 'random':
      // Select a random key
      selectedKey =
          availableKeys[Math.floor(Math.random() * availableKeys.length)];
      break;

    default:
      // Default to round-robin
      this.currentKeyIndex =
          (this.currentKeyIndex + 1) % availableKeys.length;
      selectedKey = availableKeys[this.currentKeyIndex];
    }

    // Update key usage
    selectedKey.usageCount++;
    selectedKey.lastUsed = Date.now();

    return selectedKey;
  }

  /**
   * Record a successful request for a key
   *
   * @param {string} keyId - ID of the key
   */
  recordSuccess(keyId) {
    const key = this.keys.find((k) => k.id === keyId);

    if (key) {
      // Reset errors after successful request
      key.errors = 0;
    }
  }

  /**
   * Record an error for a key
   *
   * @param {string} keyId - ID of the key
   * @param {Object} error - Error object
   */
  recordError(keyId, error) {
    const key = this.keys.find((k) => k.id === keyId);

    if (key) {
      key.errors++;

      // Disable key if too many errors
      if (key.errors >= this.options.maxErrorsBeforeDisable) {
        key.disabled = true;

        // Schedule key re-enabling
        setTimeout(() => {
          key.disabled = false;
          key.errors = 0;
        }, this.options.resetErrorsAfter);
      }
    }
  }

  /**
   * Add a new API key
   *
   * @param {Object} key - API key object
   */
  addKey(key) {
    this.keys.push({
      ...key,
      usageCount: 0,
      lastUsed: 0,
      errors: 0,
      disabled: false,
    });
  }

  /**
   * Remove an API key
   *
   * @param {string} keyId - ID of the key to remove
   */
  removeKey(keyId) {
    this.keys = this.keys.filter((key) => key.id !== keyId);

    // Reset current index if needed
    if (this.currentKeyIndex >= this.keys.length) {
      this.currentKeyIndex = 0;
    }
  }

  /**
   * Get all API keys
   *
   * @returns {Object[]} - Array of API keys
   */
  getAllKeys() {
    return this.keys.map((key) => ({
      ...key,
      // Don't expose the actual key value
      key: key.key ? '***' : undefined,
    }));
  }
}

/**
 * Creates an authentication hook for API requests
 *
 * @param {Object} options - Authentication options
 * @param {Object[]} [options.keys] - Array of API keys
 * @param {string} [options.authType='bearer'] - Authentication type (bearer, basic, header, query)
 * @param {string} [options.headerName='Authorization'] - Header name for authentication
 * @param {string} [options.queryParam='api_key'] - Query parameter name for authentication
 * @param {Function} [options.authFormatter] - Function to format authentication value
 * @param {Function} [options.isAuthError] - Function to determine if an error is an authentication error
 * @returns {Function} - Authentication hook function
 */
export function createAuthHook(options = {}) {
  const {
    keys = [],
    authType = 'bearer',
    headerName = 'Authorization',
    queryParam = 'api_key',
    authFormatter,
    isAuthError = (error) => error.status === 401 || error.status === 403,
  } = options;

  // Create key rotator
  const keyRotator = new KeyRotator(keys, options);

  // Format authentication value based on type
  const formatAuth = (key) => {
    if (authFormatter) {
      return authFormatter(key);
    }

    switch (authType.toLowerCase()) {
    case 'bearer':
      return `Bearer ${key}`;
    case 'basic':
      return `Basic ${key}`;
    default:
      return key;
    }
  };

  return async (context, next) => {
    const { request } = context;

    // Get the next available key
    const keyObj = keyRotator.getNextKey();

    if (!keyObj) {
      throw new Error('No API keys available');
    }

    const { id, key } = keyObj;

    // Apply authentication based on type
    switch (authType.toLowerCase()) {
    case 'bearer':
    case 'basic':
    case 'header':
      // Add authentication header
      request.headers = {
        ...request.headers,
        [headerName]: formatAuth(key),
      };
      break;

    case 'query':
      // Add authentication query parameter
      const url = new URL(request.url);
      url.searchParams.set(queryParam, key);
      request.url = url.toString();
      break;
    }

    try {
      // Execute the next middleware or the actual request
      const response = await next(context);

      // Record successful request
      keyRotator.recordSuccess(id);

      return response;
    } catch (error) {
      // Check if it's an authentication error
      if (isAuthError(error)) {
        // Record authentication error
        keyRotator.recordError(id, error);
      }

      throw error;
    }
  };
}

/**
 * Creates a key rotation manager
 *
 * @param {Object[]} keys - Array of API keys
 * @param {Object} options - Rotation options
 * @returns {KeyRotator} - Key rotator instance
 */
export function createKeyRotator(keys = [], options = {}) {
  return new KeyRotator(keys, options);
}

/**
 * Export the KeyRotator class for direct usage
 */
export { KeyRotator };
