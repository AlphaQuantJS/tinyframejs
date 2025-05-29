/**
 * File system cache backend for API requests
 * Provides persistent caching using the file system
 */

import { isNodeJs } from '../../utils/environment.js';

/**
 * File system cache implementation
 */
export class FileSystemCache {
  /**
   * Create a new file system cache
   *
   * @param {Object} options - Cache options
   * @param {string} [options.directory='./cache'] - Cache directory
   * @param {number} [options.ttl=3600000] - Default TTL in milliseconds (1 hour)
   * @param {boolean} [options.createDir=true] - Whether to create the cache directory if it doesn't exist
   */
  constructor(options = {}) {
    if (!isNodeJs()) {
      throw new Error(
        'FileSystemCache is only available in Node.js environment',
      );
    }

    this.directory = options.directory || './cache';
    this.ttl = options.ttl || 3600000; // Default TTL: 1 hour
    this.createDir = options.createDir !== false;

    // Initialize cache directory
    this._initDirectory();
  }

  /**
   * Initialize cache directory
   *
   * @private
   */
  async _initDirectory() {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');

      // Create directory if it doesn't exist
      if (this.createDir) {
        await fs.mkdir(this.directory, { recursive: true });
      }

      // Store references to fs and path modules
      this.fs = fs;
      this.path = path;
    } catch (error) {
      console.error('Failed to initialize cache directory:', error);
      throw error;
    }
  }

  /**
   * Get a file path for a cache key
   *
   * @param {string} key - Cache key
   * @returns {string} - File path
   * @private
   */
  _getFilePath(key) {
    // Create a safe filename from the key
    const safeKey = Buffer.from(key).toString('base64').replace(/[/+=]/g, '_');
    return this.path.join(this.directory, safeKey);
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
      // Wait for initialization to complete
      if (!this.fs) {
        await this._initDirectory();
      }

      const filePath = this._getFilePath(key);

      // Create cache entry
      const entry = {
        value,
        expires: Date.now() + ttl,
      };

      // Write to file
      await this.fs.writeFile(filePath, JSON.stringify(entry), 'utf8');
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
      // Wait for initialization to complete
      if (!this.fs) {
        await this._initDirectory();
      }

      const filePath = this._getFilePath(key);

      // Check if file exists
      try {
        await this.fs.access(filePath);
      } catch (error) {
        return null;
      }

      // Read file
      const data = await this.fs.readFile(filePath, 'utf8');
      const entry = JSON.parse(data);

      // Check if entry has expired
      if (entry.expires < Date.now()) {
        // Remove expired entry
        await this.delete(key);
        return null;
      }

      return entry.value;
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
      // Wait for initialization to complete
      if (!this.fs) {
        await this._initDirectory();
      }

      const filePath = this._getFilePath(key);

      // Check if file exists
      try {
        await this.fs.access(filePath);
      } catch (error) {
        return false;
      }

      // Delete file
      await this.fs.unlink(filePath);
      return true;
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
      // Wait for initialization to complete
      if (!this.fs) {
        await this._initDirectory();
      }

      // Read directory
      const files = await this.fs.readdir(this.directory);

      // Delete all files
      await Promise.all(
        files.map((file) =>
          this.fs.unlink(this.path.join(this.directory, file)),
        ),
      );
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }
}

/**
 * Create a file system cache
 *
 * @param {Object} options - Cache options
 * @returns {FileSystemCache} - File system cache instance
 */
export function createFileSystemCache(options = {}) {
  return new FileSystemCache(options);
}
