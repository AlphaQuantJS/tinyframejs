/**
 * Logger hook for API requests
 * Provides logging functionality for API requests and responses
 */

/**
 * Creates a logger hook for API requests
 *
 * @param {Object} options - Logger options
 * @param {boolean} [options.logRequest=true] - Whether to log request details
 * @param {boolean} [options.logResponse=true] - Whether to log response details
 * @param {boolean} [options.logErrors=true] - Whether to log errors
 * @param {boolean} [options.logTiming=true] - Whether to log request timing
 * @param {Function} [options.logger=console.log] - Logger function
 * @returns {Function} - Logger hook function
 */
export function createLoggerHook(options = {}) {
  const {
    logRequest = true,
    logResponse = true,
    logErrors = true,
    logTiming = true,
    logger = console.log,
  } = options;

  return async (context, next) => {
    const { url, method, headers, body } = context.request;

    // Log request details
    if (logRequest) {
      logger(`API Request: ${method || 'GET'} ${url}`);

      if (headers && Object.keys(headers).length > 0) {
        logger('Headers:', { ...headers });
      }

      if (body) {
        logger('Body:', body);
      }
    }

    // Track timing
    const startTime = logTiming ? Date.now() : null;

    try {
      // Execute the next middleware or the actual request
      const result = await next(context);

      // Log response details
      if (logResponse) {
        logger(`API Response: ${result.status} ${result.statusText}`);

        // Log response headers
        if (result.headers && Object.keys(result.headers).length > 0) {
          logger('Response Headers:', { ...result.headers });
        }

        // Log timing
        if (logTiming) {
          const duration = Date.now() - startTime;
          logger(`Request Duration: ${duration}ms`);
        }
      }

      return result;
    } catch (error) {
      // Log errors
      if (logErrors) {
        logger(`API Error: ${error.message}`);

        if (logTiming) {
          const duration = Date.now() - startTime;
          logger(`Failed Request Duration: ${duration}ms`);
        }
      }

      throw error;
    }
  };
}

/**
 * Default logger hook with standard configuration
 */
export const loggerHook = createLoggerHook();
