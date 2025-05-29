import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLoggerHook } from '../../../src/io/hooks/logger.js';
import { createCacheHook, MemoryCache } from '../../../src/io/hooks/cache.js';
import {
  createThrottleHook,
  RateLimiter,
} from '../../../src/io/hooks/throttle.js';
import { createAuthHook, KeyRotator } from '../../../src/io/hooks/auth.js';

describe('API Hooks', () => {
  describe('Logger Hook', () => {
    let logger;
    let loggerHook;
    let mockContext;
    let mockNext;

    beforeEach(() => {
      logger = vi.fn();
      loggerHook = createLoggerHook({ logger });

      mockContext = {
        request: {
          url: 'https://api.example.com/data',
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
      };

      mockNext = vi.fn().mockResolvedValue({
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
      });
    });

    it('should log request details', async () => {
      await loggerHook(mockContext, mockNext);

      expect(logger).toHaveBeenCalledWith(
        'API Request: GET https://api.example.com/data',
      );
      expect(logger).toHaveBeenCalledWith('Headers:', {
        'Content-Type': 'application/json',
      });
    });

    it('should log response details', async () => {
      await loggerHook(mockContext, mockNext);

      expect(logger).toHaveBeenCalledWith('API Response: 200 OK');
      expect(logger).toHaveBeenCalledWith('Response Headers:', {
        'Content-Type': 'application/json',
      });
    });

    it('should log errors', async () => {
      const error = new Error('API Error');
      mockNext.mockRejectedValue(error);

      await expect(loggerHook(mockContext, mockNext)).rejects.toThrow(
        'API Error',
      );

      expect(logger).toHaveBeenCalledWith('API Error: API Error');
    });

    it('should respect logger options', async () => {
      const customLoggerHook = createLoggerHook({
        logger,
        logRequest: false,
        logResponse: true,
        logErrors: true,
        logTiming: false,
      });

      await customLoggerHook(mockContext, mockNext);

      // Should not log request
      expect(logger).not.toHaveBeenCalledWith(
        'API Request: GET https://api.example.com/data',
      );

      // Should log response
      expect(logger).toHaveBeenCalledWith('API Response: 200 OK');
    });
  });

  describe('Cache Hook', () => {
    let cache;
    let cacheHook;
    let mockContext;
    let mockNext;

    beforeEach(() => {
      cache = new MemoryCache();
      cacheHook = createCacheHook({ cache });

      mockContext = {
        request: {
          url: 'https://api.example.com/data',
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
      };

      mockNext = vi.fn().mockResolvedValue({
        status: 200,
        statusText: 'OK',
        ok: true,
        headers: { 'Content-Type': 'application/json' },
        data: { result: 'test' },
      });
    });

    it('should cache responses', async () => {
      // First request should call through to next
      await cacheHook(mockContext, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);

      // Reset mock
      mockNext.mockClear();

      // Second request with same context should use cache
      const response = await cacheHook(mockContext, mockNext);

      expect(mockNext).not.toHaveBeenCalled();
      expect(response.headers['x-cache']).toBe('HIT');
    });

    it('should not cache non-GET requests', async () => {
      mockContext.request.method = 'POST';

      // First POST request
      await cacheHook(mockContext, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);

      // Reset mock
      mockNext.mockClear();

      // Second POST request should not use cache
      await cacheHook(mockContext, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should use custom cache key generator', async () => {
      const keyGenerator = vi.fn().mockReturnValue('custom-key');

      const customCacheHook = createCacheHook({
        cache,
        keyGenerator,
      });

      await customCacheHook(mockContext, mockNext);

      expect(keyGenerator).toHaveBeenCalledWith(mockContext.request);
    });

    it('should respect shouldCache option', async () => {
      const shouldCache = vi.fn().mockReturnValue(false);

      const customCacheHook = createCacheHook({
        cache,
        shouldCache,
      });

      // First request
      await customCacheHook(mockContext, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);

      // Reset mock
      mockNext.mockClear();

      // Second request should not use cache
      await customCacheHook(mockContext, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe('Throttle Hook', () => {
    let throttleHook;
    let mockContext;
    let mockNext;

    beforeEach(() => {
      vi.useFakeTimers();

      throttleHook = createThrottleHook({
        requestsPerSecond: 2,
        onThrottle: vi.fn(),
      });

      mockContext = {
        request: {
          url: 'https://api.example.com/data',
          method: 'GET',
        },
      };

      mockNext = vi.fn().mockResolvedValue({
        status: 200,
        statusText: 'OK',
      });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should allow requests under the rate limit', async () => {
      // First request
      await throttleHook(mockContext, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);

      // Second request
      mockNext.mockClear();
      await throttleHook(mockContext, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should throttle requests over the rate limit', async () => {
      // Make two requests (at the limit)
      await throttleHook(mockContext, mockNext);
      await throttleHook(mockContext, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(2);

      // Reset mock
      mockNext.mockClear();

      // Third request should be throttled
      const promise = throttleHook(mockContext, mockNext);

      // Fast-forward time
      vi.advanceTimersByTime(1000);

      // Now the request should complete
      await promise;
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should group rate limits by domain', async () => {
      const domainThrottleHook = createThrottleHook({
        requestsPerSecond: 1,
        groupByDomain: true,
      });

      // First request to domain1
      await domainThrottleHook(
        {
          request: { url: 'https://domain1.com/api' },
        },
        mockNext,
      );

      // First request to domain2 should not be throttled
      mockNext.mockClear();
      await domainThrottleHook(
        {
          request: { url: 'https://domain2.com/api' },
        },
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledTimes(1);

      // Second request to domain1 should be throttled
      mockNext.mockClear();
      const promise = domainThrottleHook(
        {
          request: { url: 'https://domain1.com/api' },
        },
        mockNext,
      );

      // Fast-forward time
      vi.advanceTimersByTime(1000);

      // Now the request should complete
      await promise;
      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe('Auth Hook', () => {
    let authHook;
    let mockContext;
    let mockNext;

    beforeEach(() => {
      authHook = createAuthHook({
        keys: [
          { id: 'key1', key: 'api-key-1' },
          { id: 'key2', key: 'api-key-2' },
        ],
        authType: 'bearer',
      });

      mockContext = {
        request: {
          url: 'https://api.example.com/data',
          method: 'GET',
          headers: {},
        },
      };

      mockNext = vi.fn().mockResolvedValue({
        status: 200,
        statusText: 'OK',
      });
    });

    it('should add authentication header', async () => {
      await authHook(mockContext, mockNext);

      expect(mockContext.request.headers.Authorization).toMatch(
        /^Bearer api-key-/,
      );
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should rotate keys on authentication error', async () => {
      // Create a KeyRotator directly to test key rotation
      const keyRotator = new KeyRotator(
        [
          { id: 'key1', key: 'api-key-1' },
          { id: 'key2', key: 'api-key-2' },
        ],
        { maxErrorsBeforeDisable: 1 },
      );

      // Get the first key
      const key1 = keyRotator.getNextKey();
      expect(key1.key).toBe('api-key-1');

      // Record an error for the first key
      keyRotator.recordError('key1', { status: 401 });

      // Get the next key, should be the second one
      const key2 = keyRotator.getNextKey();
      expect(key2.key).toBe('api-key-2');
    });

    it('should use auth hook with key rotation', async () => {
      // Create a custom isAuthError function that will mark any error as auth error
      const testAuthHook = createAuthHook({
        keys: [
          { id: 'key1', key: 'api-key-1' },
          { id: 'key2', key: 'api-key-2' },
        ],
        authType: 'bearer',
        maxErrorsBeforeDisable: 1,
        isAuthError: () => true, // Any error is auth error
      });

      // First request uses first key
      const firstContext = {
        request: { url: 'https://api.test.com', headers: {} },
      };
      await testAuthHook(firstContext, mockNext);
      expect(firstContext.request.headers.Authorization).toBe(
        'Bearer api-key-1',
      );

      // Mock an error for the next request
      const errorNext = vi.fn().mockRejectedValueOnce(new Error('Auth failed'));

      // This should fail and mark the first key as disabled
      const errorContext = {
        request: { url: 'https://api.test.com', headers: {} },
      };
      await expect(testAuthHook(errorContext, errorNext)).rejects.toThrow(
        'Auth failed',
      );

      // Next request should use the second key
      const nextContext = {
        request: { url: 'https://api.test.com', headers: {} },
      };
      await testAuthHook(nextContext, mockNext);
      expect(nextContext.request.headers.Authorization).toBe(
        'Bearer api-key-2',
      );
    });

    it('should support different auth types', async () => {
      // Test basic auth
      const basicAuthHook = createAuthHook({
        keys: [{ id: 'basic1', key: 'username:password' }],
        authType: 'basic',
      });

      await basicAuthHook(mockContext, mockNext);
      expect(mockContext.request.headers.Authorization).toBe(
        'Basic username:password',
      );

      // Test query parameter auth
      const queryAuthHook = createAuthHook({
        keys: [{ id: 'query1', key: 'api-key-query' }],
        authType: 'query',
        queryParam: 'key',
      });

      mockContext.request.headers = {};
      await queryAuthHook(mockContext, mockNext);
      expect(mockContext.request.url).toContain('key=api-key-query');
    });

    it('should throw error when no keys are available', async () => {
      const emptyAuthHook = createAuthHook({
        keys: [],
      });

      await expect(emptyAuthHook(mockContext, mockNext)).rejects.toThrow(
        'No API keys available',
      );
    });
  });
});
