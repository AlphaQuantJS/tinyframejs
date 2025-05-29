/**
 * IndexedDB cache backend for API requests
 * Provides persistent caching using browser's IndexedDB
 */

import { isBrowser } from '../../utils/environment.js';

/**
 * IndexedDB cache implementation
 */
export class IndexedDBCache {
  /**
   * Create a new IndexedDB cache
   *
   * @param {Object} options - Cache options
   * @param {string} [options.dbName='tinyframe-cache'] - Database name
   * @param {string} [options.storeName='api-cache'] - Object store name
   * @param {number} [options.ttl=3600000] - Default TTL in milliseconds (1 hour)
   * @param {number} [options.version=1] - Database version
   */
  constructor(options = {}) {
    if (!isBrowser()) {
      throw new Error(
        'IndexedDBCache is only available in browser environment',
      );
    }

    this.dbName = options.dbName || 'tinyframe-cache';
    this.storeName = options.storeName || 'api-cache';
    this.ttl = options.ttl || 3600000; // Default TTL: 1 hour
    this.version = options.version || 1;

    // Initialize database
    this._dbPromise = this._initDatabase();
  }

  /**
   * Initialize database
   *
   * @returns {Promise<IDBDatabase>} - IndexedDB database
   * @private
   */
  async _initDatabase() {
    return new Promise((resolve, reject) => {
      // Check if IndexedDB is available
      if (!window.indexedDB) {
        reject(new Error('IndexedDB is not supported in this browser'));
        return;
      }

      // Open database
      const request = window.indexedDB.open(this.dbName, this.version);

      // Handle errors
      request.onerror = (event) => {
        reject(new Error(`Failed to open IndexedDB: ${event.target.error}`));
      };

      // Create object store if needed
      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'key' });
        }
      };

      // Success handler
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
    });
  }

  /**
   * Get a transaction and object store
   *
   * @param {string} mode - Transaction mode ('readonly' or 'readwrite')
   * @returns {Promise<IDBObjectStore>} - IndexedDB object store
   * @private
   */
  async _getStore(mode) {
    const db = await this._dbPromise;
    const transaction = db.transaction(this.storeName, mode);
    return transaction.objectStore(this.storeName);
  }

  /**
   * Set a value in the cache
   *
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} [ttl] - Time to live in milliseconds
   * @returns {Promise<void>}
   */
  async set(key, value, ttl = this.ttl) {
    try {
      const store = await this._getStore('readwrite');

      // Create cache entry
      const entry = {
        key,
        value,
        expires: Date.now() + ttl,
      };

      // Store entry
      return new Promise((resolve, reject) => {
        const request = store.put(entry);

        request.onerror = (event) => {
          reject(new Error(`Failed to set cache entry: ${event.target.error}`));
        };

        request.onsuccess = () => {
          resolve();
        };
      });
    } catch (error) {
      console.error('Failed to set cache entry:', error);
    }
  }

  /**
   * Get a value from the cache
   *
   * @param {string} key - Cache key
   * @returns {Promise<*|null>} - Cached value or null if not found
   */
  async get(key) {
    try {
      const store = await this._getStore('readonly');

      // Get entry
      return new Promise((resolve, reject) => {
        const request = store.get(key);

        request.onerror = (event) => {
          reject(new Error(`Failed to get cache entry: ${event.target.error}`));
        };

        request.onsuccess = (event) => {
          const entry = event.target.result;

          // Check if entry exists
          if (!entry) {
            resolve(null);
            return;
          }

          // Check if entry has expired
          if (entry.expires < Date.now()) {
            // Remove expired entry
            this.delete(key).catch(console.error);
            resolve(null);
            return;
          }

          resolve(entry.value);
        };
      });
    } catch (error) {
      console.error('Failed to get cache entry:', error);
      return null;
    }
  }

  /**
   * Check if a key exists in the cache
   *
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} - Whether the key exists
   */
  async has(key) {
    const value = await this.get(key);
    return value !== null;
  }

  /**
   * Delete a value from the cache
   *
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} - Whether the key was deleted
   */
  async delete(key) {
    try {
      const store = await this._getStore('readwrite');

      // Delete entry
      return new Promise((resolve, reject) => {
        const request = store.delete(key);

        request.onerror = (event) => {
          reject(
            new Error(`Failed to delete cache entry: ${event.target.error}`),
          );
        };

        request.onsuccess = () => {
          resolve(true);
        };
      });
    } catch (error) {
      console.error('Failed to delete cache entry:', error);
      return false;
    }
  }

  /**
   * Clear the cache
   *
   * @returns {Promise<void>}
   */
  async clear() {
    try {
      const store = await this._getStore('readwrite');

      // Clear store
      return new Promise((resolve, reject) => {
        const request = store.clear();

        request.onerror = (event) => {
          reject(new Error(`Failed to clear cache: ${event.target.error}`));
        };

        request.onsuccess = () => {
          resolve();
        };
      });
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }
}

/**
 * Create an IndexedDB cache
 *
 * @param {Object} options - Cache options
 * @returns {IndexedDBCache} - IndexedDB cache instance
 */
export function createIndexedDBCache(options = {}) {
  return new IndexedDBCache(options);
}
