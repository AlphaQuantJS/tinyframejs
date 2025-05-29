/**
 * Throttle hook for API requests
 * Limits the rate of API requests to avoid rate limiting
 */

/**
 * Simple rate limiter implementation
 */
class RateLimiter {
  constructor(options = {}) {
    this.requestsPerSecond = options.requestsPerSecond || 5;
    this.requestsPerMinute = options.requestsPerMinute || 100;
    this.requestsPerHour = options.requestsPerHour || 1000;

    this.requestTimestamps = {
      second: [],
      minute: [],
      hour: [],
    };
  }

  /**
   * Check if a request can be made
   *
   * @returns {boolean} - Whether the request can be made
   */
  canMakeRequest() {
    const now = Date.now();

    // Clean up old timestamps
    this._cleanTimestamps(now);

    // Check rate limits
    if (this.requestTimestamps.second.length >= this.requestsPerSecond) {
      return false;
    }

    if (this.requestTimestamps.minute.length >= this.requestsPerMinute) {
      return false;
    }

    if (this.requestTimestamps.hour.length >= this.requestsPerHour) {
      return false;
    }

    return true;
  }

  /**
   * Record a request
   */
  recordRequest() {
    const now = Date.now();

    this.requestTimestamps.second.push(now);
    this.requestTimestamps.minute.push(now);
    this.requestTimestamps.hour.push(now);
  }

  /**
   * Get the time to wait before making a request
   *
   * @returns {number} - Time to wait in milliseconds
   */
  getWaitTime() {
    const now = Date.now();

    // Clean up old timestamps
    this._cleanTimestamps(now);

    if (
      this.requestTimestamps.second.length < this.requestsPerSecond &&
      this.requestTimestamps.minute.length < this.requestsPerMinute &&
      this.requestTimestamps.hour.length < this.requestsPerHour
    ) {
      return 0;
    }

    // Calculate wait time for each limit
    const waitTimes = [];

    if (this.requestTimestamps.second.length >= this.requestsPerSecond) {
      const oldestTimestamp = this.requestTimestamps.second[0];
      waitTimes.push(oldestTimestamp + 1000 - now);
    }

    if (this.requestTimestamps.minute.length >= this.requestsPerMinute) {
      const oldestTimestamp = this.requestTimestamps.minute[0];
      waitTimes.push(oldestTimestamp + 60000 - now);
    }

    if (this.requestTimestamps.hour.length >= this.requestsPerHour) {
      const oldestTimestamp = this.requestTimestamps.hour[0];
      waitTimes.push(oldestTimestamp + 3600000 - now);
    }

    // Return the maximum wait time
    return Math.max(0, ...waitTimes);
  }

  /**
   * Clean up old timestamps
   *
   * @param {number} now - Current timestamp
   * @private
   */
  _cleanTimestamps(now) {
    this.requestTimestamps.second = this.requestTimestamps.second.filter(
      (timestamp) => now - timestamp < 1000,
    );

    this.requestTimestamps.minute = this.requestTimestamps.minute.filter(
      (timestamp) => now - timestamp < 60000,
    );

    this.requestTimestamps.hour = this.requestTimestamps.hour.filter(
      (timestamp) => now - timestamp < 3600000,
    );
  }
}

/**
 * Creates a throttle hook for API requests
 *
 * @param {Object} options - Throttle options
 * @param {number} [options.requestsPerSecond] - Maximum requests per second
 * @param {number} [options.requestsPerMinute] - Maximum requests per minute
 * @param {number} [options.requestsPerHour] - Maximum requests per hour
 * @param {boolean} [options.groupByDomain=true] - Whether to group rate limits by domain
 * @param {Function} [options.onThrottle] - Function to call when a request is throttled
 * @returns {Function} - Throttle hook function
 */
export function createThrottleHook(options = {}) {
  const {
    requestsPerSecond,
    requestsPerMinute,
    requestsPerHour,
    groupByDomain = true,
    onThrottle = (waitTime) =>
      console.log(`Request throttled. Waiting ${waitTime}ms`),
  } = options;

  // Create rate limiters
  const rateLimiters = new Map();

  // Get or create a rate limiter for a domain
  const getRateLimiter = (domain) => {
    if (!rateLimiters.has(domain)) {
      rateLimiters.set(
        domain,
        new RateLimiter({
          requestsPerSecond,
          requestsPerMinute,
          requestsPerHour,
        }),
      );
    }

    return rateLimiters.get(domain);
  };

  // Extract domain from URL
  const getDomain = (url) => {
    try {
      return new URL(url).hostname;
    } catch (error) {
      return 'default';
    }
  };

  return async (context, next) => {
    const { url } = context.request;

    // Get the appropriate rate limiter
    const domain = groupByDomain ? getDomain(url) : 'default';
    const rateLimiter = getRateLimiter(domain);

    // Check if the request can be made
    if (!rateLimiter.canMakeRequest()) {
      const waitTime = rateLimiter.getWaitTime();

      // Call the onThrottle callback
      onThrottle(waitTime);

      // Wait for the specified time
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    // Record the request
    rateLimiter.recordRequest();

    // Execute the next middleware or the actual request
    return next(context);
  };
}

/**
 * Default throttle hook with standard configuration
 */
export const throttleHook = createThrottleHook();

/**
 * Export the RateLimiter class for direct usage
 */
export { RateLimiter };
