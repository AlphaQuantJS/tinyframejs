/**
 * Error handling hook for API requests
 * Provides centralized error handling, retry with backoff, and alerting
 */

/**
 * Default backoff strategy with exponential delay
 *
 * @param {number} attempt - Current attempt number (1-based)
 * @param {number} maxDelay - Maximum delay in milliseconds
 * @returns {number} - Delay in milliseconds
 */
function defaultBackoffStrategy(attempt, maxDelay = 30000) {
  // Exponential backoff with jitter: 2^n * 100ms + random(50ms)
  const delay = Math.min(
    Math.pow(2, attempt) * 100 + Math.floor(Math.random() * 50),
    maxDelay,
  );

  return delay;
}

/**
 * Creates an error handling hook for API requests
 *
 * @param {Object} options - Error handling options
 * @param {number} [options.maxRetries=3] - Maximum number of retry attempts
 * @param {Function} [options.backoffStrategy] - Function to calculate retry delay
 * @param {Function} [options.shouldRetry] - Function to determine if request should be retried
 * @param {Function} [options.onError] - Function to call when an error occurs
 * @param {Function} [options.onRetry] - Function to call before a retry attempt
 * @param {Function} [options.onMaxRetriesExceeded] - Function to call when max retries are exceeded
 * @returns {Function} - Error handling hook function
 */
export function createErrorHook(options = {}) {
  const {
    maxRetries = 3,
    backoffStrategy = defaultBackoffStrategy,
    shouldRetry = (error) => {
      // Default retry on network errors and specific status codes
      if (!error.status) return true; // Network error
      return [408, 429, 500, 502, 503, 504].includes(error.status);
    },
    onError = (error, context) => {
      console.error(`API Error: ${error.message || 'Unknown error'}`, {
        url: context.request.url,
        method: context.request.method,
        status: error.status,
      });
    },
    onRetry = (error, attempt, delay, context) => {
      console.warn(
        `Retrying request (${attempt}/${maxRetries}) after ${delay}ms`,
        {
          url: context.request.url,
          method: context.request.method,
          error: error.message || 'Unknown error',
        },
      );
    },
    onMaxRetriesExceeded = (error, context) => {
      console.error(`Max retries (${maxRetries}) exceeded for request`, {
        url: context.request.url,
        method: context.request.method,
        error: error.message || 'Unknown error',
      });
    },
  } = options;

  return async (context, next) => {
    let attempts = 0;

    while (true) {
      try {
        attempts++;
        return await next(context);
      } catch (error) {
        // Call the error handler
        onError(error, context);

        // Check if we should retry
        if (attempts <= maxRetries && shouldRetry(error)) {
          // Calculate backoff delay
          const delay = backoffStrategy(attempts, options.maxDelay);

          // Call the retry handler
          onRetry(error, attempts, delay, context);

          // Wait for the backoff period
          await new Promise((resolve) => setTimeout(resolve, delay));

          // Continue to next attempt
          continue;
        }

        // Max retries exceeded or shouldn't retry
        if (attempts > 1) {
          onMaxRetriesExceeded(error, context);
        }

        // Re-throw the error
        throw error;
      }
    }
  };
}

/**
 * Creates an alerting hook for critical API errors
 *
 * @param {Object} options - Alerting options
 * @param {Function} [options.isCriticalError] - Function to determine if an error is critical
 * @param {Function} [options.alert] - Function to send alerts
 * @returns {Function} - Alerting hook function
 */
export function createAlertHook(options = {}) {
  const {
    isCriticalError = (error) => {
      // Default critical errors: 5xx errors or network errors
      if (!error.status) return true; // Network error
      return error.status >= 500;
    },
    alert = (error, context) => {
      console.error('CRITICAL API ERROR', {
        url: context.request.url,
        method: context.request.method,
        error: error.message || 'Unknown error',
        status: error.status,
        timestamp: new Date().toISOString(),
      });

      // Here you would typically send an alert to a monitoring system
      // For example: sendSlackAlert(), sendEmailAlert(), etc.
    },
  } = options;

  return async (context, next) => {
    try {
      return await next(context);
    } catch (error) {
      // Check if this is a critical error
      if (isCriticalError(error)) {
        // Send alert
        alert(error, context);
      }

      // Re-throw the error
      throw error;
    }
  };
}

/**
 * Default error hook with standard configuration
 */
export const errorHook = createErrorHook();

/**
 * Default alert hook with standard configuration
 */
export const alertHook = createAlertHook();
