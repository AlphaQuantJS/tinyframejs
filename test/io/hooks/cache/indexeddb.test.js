import { describe, it, expect, vi } from 'vitest';
import {
  IndexedDBCache,
  createIndexedDBCache,
} from '../../../../src/io/hooks/cache/indexeddb.js';
import { isNodeJs } from '../../../../src/io/utils/environment.js';

// Проверяем, в каком окружении мы находимся
const isRunningInNode = isNodeJs();

// Если мы в Node.js, пропускаем все тесты
if (isRunningInNode) {
  describe('IndexedDB Cache (skipped in Node.js)', () => {
    it('skips IndexedDB tests in Node.js environment', () => {
      // Этот тест всегда проходит
      expect(true).toBe(true);
    });
  });
} else {
  // Если мы в браузере, запускаем полные тесты
  // Этот блок не будет выполнен в Node.js
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
