import { describe, it, expect, vi } from 'vitest';
import {
  IndexedDBCache,
  createIndexedDBCache,
} from '../../../../src/io/hooks/cache/indexeddb.js';
import { isNodeJs } from '../../../../src/io/utils/environment.js';

// Check if we are running in Node.js
const isRunningInNode = isNodeJs();

// If we are in Node.js, skip all tests
if (isRunningInNode) {
  describe('IndexedDB Cache (skipped in Node.js)', () => {
    it('skips IndexedDB tests in Node.js environment', () => {
      // This test always passes
      expect(true).toBe(true);
    });
  });
} else {
  // If we are in a browser, run full tests
  // This block won't be executed in Node.js
  describe('IndexedDB Cache', () => {
    it('should create an IndexedDBCache instance', () => {
      const cache = createIndexedDBCache({
        dbName: 'custom-cache',
        storeName: 'custom-store',
        ttl: 60000,
      });

      expect(cache).toBeInstanceOf(IndexedDBCache);
      expect(cache.dbName).toBe('custom-cache');
      expect(cache.storeName).toBe('custom-store');
      expect(cache.ttl).toBe(60000);
    });
  });
}
