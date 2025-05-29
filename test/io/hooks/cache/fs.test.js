import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  FileSystemCache,
  createFileSystemCache,
} from '../../../../src/io/hooks/cache/fs.js';
import { isNodeJs } from '../../../../src/io/utils/environment.js';

// Mock environment detection
vi.mock('../../../../src/io/utils/environment.js', () => ({
  isNodeJs: vi.fn().mockReturnValue(true),
  detectEnvironment: vi.fn().mockReturnValue('node'),
}));

// Mock fs module
vi.mock('fs/promises', () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
  readFile: vi.fn().mockImplementation((path) => {
    if (path.includes('expired')) {
      return Promise.resolve(
        JSON.stringify({
          value: { data: 'expired' },
          expires: Date.now() - 10000, // Expired 10 seconds ago
        }),
      );
    }

    if (path.includes('valid')) {
      return Promise.resolve(
        JSON.stringify({
          value: { data: 'test' },
          expires: Date.now() + 3600000, // Valid for 1 hour
        }),
      );
    }

    return Promise.reject(new Error('File not found'));
  }),
  access: vi.fn().mockImplementation((path) => {
    if (path.includes('nonexistent')) {
      return Promise.reject(new Error('File not found'));
    }
    return Promise.resolve();
  }),
  unlink: vi.fn().mockResolvedValue(undefined),
  readdir: vi.fn().mockResolvedValue(['file1', 'file2']),
}));

// Mock path module
vi.mock('path', () => ({
  join: vi.fn().mockImplementation((dir, file) => `${dir}/${file}`),
}));

describe('FileSystem Cache', () => {
  let cache;

  beforeEach(() => {
    cache = new FileSystemCache({
      directory: './test-cache',
      ttl: 3600000, // 1 hour
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create cache directory on initialization', async () => {
    const fs = await import('fs/promises');

    expect(fs.mkdir).toHaveBeenCalledWith('./test-cache', { recursive: true });
  });

  it('should throw error if not in Node.js environment', () => {
    isNodeJs.mockReturnValueOnce(false);

    expect(() => new FileSystemCache()).toThrow('only available in Node.js');

    // Reset mock
    isNodeJs.mockReturnValue(true);
  });

  describe('set', () => {
    it('should write value to file', async () => {
      const fs = await import('fs/promises');
      const path = await import('path');

      await cache.set('test-key', { data: 'test' });

      expect(path.join).toHaveBeenCalledWith(
        './test-cache',
        expect.any(String),
      );
      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('"data":"test"'),
        'utf8',
      );
    });

    it('should use custom TTL if provided', async () => {
      const fs = await import('fs/promises');
      const now = Date.now();
      const customTtl = 60000; // 1 minute

      // Mock Date.now
      const originalNow = Date.now;
      Date.now = vi.fn().mockReturnValue(now);

      await cache.set('test-key', { data: 'test' }, customTtl);

      expect(fs.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining(`"expires":${now + customTtl}`),
        'utf8',
      );

      // Restore Date.now
      Date.now = originalNow;
    });

    it('should handle errors gracefully', async () => {
      const fs = await import('fs/promises');
      fs.writeFile.mockRejectedValueOnce(new Error('Write error'));

      // Should not throw
      await expect(
        cache.set('test-key', { data: 'test' }),
      ).resolves.not.toThrow();

      // Console.error should be called
      expect(console.error).toHaveBeenCalledWith(
        'Failed to set cache entry:',
        expect.any(Error),
      );
    });
  });

  describe('get', () => {
    it('should return null for non-existent key', async () => {
      const result = await cache.get('nonexistent-key');

      expect(result).toBeNull();
    });

    it('should return value for valid key', async () => {
      const result = await cache.get('valid-key');

      expect(result).toEqual({ data: 'test' });
    });

    it('should delete and return null for expired key', async () => {
      const fs = await import('fs/promises');

      const result = await cache.get('expired-key');

      expect(result).toBeNull();
      expect(fs.unlink).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const fs = await import('fs/promises');
      fs.readFile.mockRejectedValueOnce(new Error('Read error'));

      const result = await cache.get('test-key');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        'Failed to get cache entry:',
        expect.any(Error),
      );
    });
  });

  describe('has', () => {
    it('should return false for non-existent key', async () => {
      const result = await cache.has('nonexistent-key');

      expect(result).toBe(false);
    });

    it('should return true for valid key', async () => {
      const result = await cache.has('valid-key');

      expect(result).toBe(true);
    });

    it('should return false for expired key', async () => {
      const result = await cache.has('expired-key');

      expect(result).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete file for existing key', async () => {
      const fs = await import('fs/promises');

      const result = await cache.delete('valid-key');

      expect(result).toBe(true);
      expect(fs.unlink).toHaveBeenCalled();
    });

    it('should return false for non-existent key', async () => {
      const fs = await import('fs/promises');

      const result = await cache.delete('nonexistent-key');

      expect(result).toBe(false);
      expect(fs.unlink).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const fs = await import('fs/promises');
      fs.unlink.mockRejectedValueOnce(new Error('Delete error'));

      const result = await cache.delete('valid-key');

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        'Failed to delete cache entry:',
        expect.any(Error),
      );
    });
  });

  describe('clear', () => {
    it('should delete all files in cache directory', async () => {
      const fs = await import('fs/promises');

      await cache.clear();

      expect(fs.readdir).toHaveBeenCalledWith('./test-cache');
      expect(fs.unlink).toHaveBeenCalledTimes(2);
      expect(fs.unlink).toHaveBeenCalledWith('./test-cache/file1');
      expect(fs.unlink).toHaveBeenCalledWith('./test-cache/file2');
    });

    it('should handle errors gracefully', async () => {
      const fs = await import('fs/promises');
      fs.readdir.mockRejectedValueOnce(new Error('Read error'));

      // Should not throw
      await expect(cache.clear()).resolves.not.toThrow();

      expect(console.error).toHaveBeenCalledWith(
        'Failed to clear cache:',
        expect.any(Error),
      );
    });
  });

  describe('createFileSystemCache', () => {
    it('should create a FileSystemCache instance', () => {
      const cache = createFileSystemCache({
        directory: './custom-cache',
        ttl: 60000,
      });

      expect(cache).toBeInstanceOf(FileSystemCache);
      expect(cache.directory).toBe('./custom-cache');
      expect(cache.ttl).toBe(60000);
    });
  });
});
