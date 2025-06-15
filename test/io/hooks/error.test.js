import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createErrorHook,
  createAlertHook,
} from '../../../src/io/hooks/error.js';

describe('Error Hooks', () => {
  // Mock console methods
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  beforeEach(() => {
    console.error = vi.fn();
    console.warn = vi.fn();

    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

  describe('createErrorHook', () => {
    it('should pass through successful responses', async () => {
      const errorHook = createErrorHook();
      const mockContext = { request: { url: 'https://api.example.com' } };
      const mockNext = vi
        .fn()
        .mockResolvedValue({ status: 200, data: 'success' });

      const result = await errorHook(mockContext, mockNext);

      expect(mockNext).toHaveBeenCalledWith(mockContext);
      expect(result).toEqual({ status: 200, data: 'success' });
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should call onError when request fails', async () => {
      const onError = vi.fn();
      const errorHook = createErrorHook({
        maxRetries: 0, // Disable retries for this test
        onError,
      });

      const mockContext = { request: { url: 'https://api.example.com' } };
      const mockError = new Error('Network error');
      const mockNext = vi.fn().mockRejectedValue(mockError);

      await expect(errorHook(mockContext, mockNext)).rejects.toThrow(
        'Network error',
      );

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(mockError, mockContext);
    });

    it('should not retry when shouldRetry returns false', async () => {
      const shouldRetry = vi.fn().mockReturnValue(false);
      const errorHook = createErrorHook({
        maxRetries: 2,
        shouldRetry,
      });

      const mockContext = { request: { url: 'https://api.example.com' } };
      const mockError = { status: 400, message: 'Bad request' };
      const mockNext = vi.fn().mockRejectedValue(mockError);

      await expect(errorHook(mockContext, mockNext)).rejects.toEqual(mockError);

      expect(shouldRetry).toHaveBeenCalledWith(mockError);
      expect(mockNext).toHaveBeenCalledTimes(1); // No retries
    });

    it('should handle errors without retries', async () => {
      // Create a hook with disabled retries
      const errorHook = createErrorHook({
        maxRetries: 0, // Disable retries for this test
      });

      const mockContext = { request: { url: 'https://api.example.com' } };
      const mockError = new Error('Test error');
      const mockNext = vi.fn().mockRejectedValue(mockError);

      // Check that the error passes through the hook without changes
      await expect(errorHook(mockContext, mockNext)).rejects.toThrow(
        'Test error',
      );

      // Check that the request was executed only once
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should retry failed requests', async () => {
      // Create a hook with one retry
      const errorHook = createErrorHook({
        maxRetries: 1,
        backoffStrategy: () => 0, // Instant retry for simplicity
      });

      const mockContext = { request: { url: 'https://api.example.com' } };
      const mockError = new Error('Test error');
      const mockNext = vi
        .fn()
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce({ status: 200, data: 'success' });

      // Execute the request through the hook
      const result = await errorHook(mockContext, mockNext);

      // Check that the request was executed twice (first time with error, second - successfully)
      expect(mockNext).toHaveBeenCalledTimes(2);

      // Check that the result matches the expected value
      expect(result).toEqual({ status: 200, data: 'success' });
    });
  });

  describe('createAlertHook', () => {
    it('should alert on critical errors', async () => {
      const alert = vi.fn();
      const alertHook = createAlertHook({
        alert,
      });

      const mockContext = { request: { url: 'https://api.example.com' } };
      const mockError = { status: 500, message: 'Server error' };
      const mockNext = vi.fn().mockRejectedValue(mockError);

      await expect(alertHook(mockContext, mockNext)).rejects.toEqual(mockError);

      expect(alert).toHaveBeenCalledWith(mockError, mockContext);
    });

    it('should not alert on non-critical errors', async () => {
      const alert = vi.fn();
      const alertHook = createAlertHook({
        alert,
        isCriticalError: (error) => error.status >= 500,
      });

      const mockContext = { request: { url: 'https://api.example.com' } };
      const mockError = { status: 400, message: 'Bad request' };
      const mockNext = vi.fn().mockRejectedValue(mockError);

      await expect(alertHook(mockContext, mockNext)).rejects.toEqual(mockError);

      expect(alert).not.toHaveBeenCalled();
    });

    it('should pass through successful responses', async () => {
      const alert = vi.fn();
      const alertHook = createAlertHook({
        alert,
      });

      const mockContext = { request: { url: 'https://api.example.com' } };
      const mockNext = vi
        .fn()
        .mockResolvedValue({ status: 200, data: 'success' });

      const result = await alertHook(mockContext, mockNext);

      expect(result).toEqual({ status: 200, data: 'success' });
      expect(alert).not.toHaveBeenCalled();
    });
  });
});
