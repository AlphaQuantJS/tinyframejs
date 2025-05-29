/**
 * Enhanced API client with support for schemas, hooks, and transformers
 * Provides a unified interface for making API requests with advanced features
 */

import { fetchWithRetry } from './common.js';
import { DataFrame } from '../../../core/dataframe/DataFrame.js';
import { applySchema } from '../../transformers/apiSchemas/index.js';
import {
  createLoggerHook,
  createCacheHook,
  createThrottleHook,
  createAuthHook,
} from '../../hooks/index.js';

/**
 * API Client class for making API requests with advanced features
 */
export class ApiClient {
  /**
   * Create a new API client
   *
   * @param {Object} options - Client options
   * @param {string} [options.baseUrl] - Base URL for all requests
   * @param {Object} [options.defaultHeaders] - Default headers for all requests
   * @param {Object} [options.auth] - Authentication options
   * @param {Object} [options.cache] - Cache options
   * @param {Object} [options.throttle] - Throttle options
   * @param {Object} [options.retry] - Retry options
   * @param {Object[]} [options.hooks] - Additional middleware hooks
   */
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || '';
    this.defaultHeaders = options.defaultHeaders || {};
    this.hooks = [];

    // Add default hooks
    if (options.auth) {
      this.hooks.push(createAuthHook(options.auth));
    }

    if (options.cache !== false) {
      this.hooks.push(createCacheHook(options.cache || {}));
    }

    if (options.throttle !== false) {
      this.hooks.push(createThrottleHook(options.throttle || {}));
    }

    // Add logger hook last to see the final request
    if (options.logger !== false) {
      this.hooks.push(createLoggerHook(options.logger || {}));
    }

    // Add additional hooks
    if (Array.isArray(options.hooks)) {
      this.hooks.push(...options.hooks);
    }

    this.retryOptions = options.retry || {};
  }

  /**
   * Add a hook to the client
   *
   * @param {Function} hook - Hook function
   * @returns {ApiClient} - This client instance for chaining
   */
  addHook(hook) {
    this.hooks.push(hook);
    return this;
  }

  /**
   * Make an API request
   *
   * @param {string|Object} urlOrOptions - URL or request options
   * @param {Object} [options] - Request options
   * @returns {Promise<Response>} - Response object
   */
  async request(urlOrOptions, options = {}) {
    // Handle different argument formats
    const requestOptions =
      typeof urlOrOptions === 'string' ?
        { ...options, url: urlOrOptions } :
        { ...urlOrOptions };

    // Apply base URL if relative URL is provided
    if (this.baseUrl && !requestOptions.url.startsWith('http')) {
      requestOptions.url = `${this.baseUrl}${requestOptions.url}`;
    }

    // Apply default headers
    requestOptions.headers = {
      ...this.defaultHeaders,
      ...requestOptions.headers,
    };

    // Create request context
    const context = {
      request: requestOptions,
      client: this,
    };

    // Apply hooks in sequence
    const executeRequest = async (ctx) => fetchWithRetry(ctx.request.url, {
      method: ctx.request.method,
      headers: ctx.request.headers,
      body: ctx.request.body,
      ...this.retryOptions,
    });

    // Chain hooks together
    const chainedRequest = this.hooks.reduceRight(
      (next, hook) => (ctx) => hook(ctx, next),
      executeRequest,
    );

    // Execute the request with all hooks
    return chainedRequest(context);
  }

  /**
   * Make a GET request
   *
   * @param {string} url - URL to request
   * @param {Object} [options] - Request options
   * @returns {Promise<Response>} - Response object
   */
  async get(url, options = {}) {
    return this.request(url, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * Make a POST request
   *
   * @param {string} url - URL to request
   * @param {Object|string} data - Data to send
   * @param {Object} [options] - Request options
   * @returns {Promise<Response>} - Response object
   */
  async post(url, data, options = {}) {
    const isJson = typeof data === 'object';

    return this.request(url, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': isJson ?
          'application/json' :
          'application/x-www-form-urlencoded',
        ...options.headers,
      },
      body: isJson ? JSON.stringify(data) : data,
    });
  }

  /**
   * Make a PUT request
   *
   * @param {string} url - URL to request
   * @param {Object|string} data - Data to send
   * @param {Object} [options] - Request options
   * @returns {Promise<Response>} - Response object
   */
  async put(url, data, options = {}) {
    const isJson = typeof data === 'object';

    return this.request(url, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': isJson ?
          'application/json' :
          'application/x-www-form-urlencoded',
        ...options.headers,
      },
      body: isJson ? JSON.stringify(data) : data,
    });
  }

  /**
   * Make a DELETE request
   *
   * @param {string} url - URL to request
   * @param {Object} [options] - Request options
   * @returns {Promise<Response>} - Response object
   */
  async delete(url, options = {}) {
    return this.request(url, {
      ...options,
      method: 'DELETE',
    });
  }

  /**
   * Fetch JSON data from an API
   *
   * @param {string} url - URL to request
   * @param {Object} [options] - Request options
   * @param {string|Object} [schema] - Schema name or mapping for transformation
   * @returns {Promise<Object|Array>} - Parsed JSON data
   */
  async fetchJson(url, options = {}, schema = null) {
    const response = await this.get(url, options);
    const data = await response.json();

    // Apply schema transformation if provided
    if (schema) {
      return applySchema(data, schema);
    }

    return data;
  }

  /**
   * Fetch data and convert to DataFrame
   *
   * @param {string} url - URL to request
   * @param {Object} [options] - Request options
   * @param {string|Object} [schema] - Schema name or mapping for transformation
   * @param {Object} [dfOptions] - DataFrame creation options
   * @returns {Promise<DataFrame>} - DataFrame with the fetched data
   */
  async fetchDataFrame(url, options = {}, schema = null, dfOptions = {}) {
    const data = await this.fetchJson(url, options, schema);

    // Handle array or object data
    if (Array.isArray(data)) {
      return DataFrame.fromRows(data, dfOptions);
    } else if (typeof data === 'object' && data !== null) {
      // Check if it's a columns object
      const firstValue = Object.values(data)[0];
      if (Array.isArray(firstValue)) {
        return DataFrame.fromColumns(data, dfOptions);
      }

      // Single row object
      return DataFrame.fromRows([data], dfOptions);
    }

    throw new Error('Cannot convert API response to DataFrame');
  }

  /**
   * Fetch CSV data from an API
   *
   * @param {string} url - URL to request
   * @param {Object} [options] - Request options
   * @param {Object} [csvOptions] - CSV parsing options
   * @returns {Promise<DataFrame>} - DataFrame with the parsed CSV data
   */
  async fetchCsv(url, options = {}, csvOptions = {}) {
    const response = await this.get(url, {
      ...options,
      headers: {
        Accept: 'text/csv',
        ...options.headers,
      },
    });

    const text = await response.text();

    // Import CSV reader dynamically to avoid circular dependencies
    const { readCSV } = await import('../csv.js');

    // Parse CSV text
    return readCSV(text, csvOptions);
  }
}

/**
 * Create a new API client
 *
 * @param {Object} options - Client options
 * @returns {ApiClient} - API client instance
 */
export function createApiClient(options = {}) {
  return new ApiClient(options);
}

/**
 * Default API client with standard configuration
 */
export const defaultClient = createApiClient();
