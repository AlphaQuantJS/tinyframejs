import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  ApiClient,
  createApiClient,
} from '../../../../src/io/readers/api/client.js';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';

// Mock fetch globally
global.fetch = vi.fn();

describe('ApiClient', () => {
  let client;

  beforeEach(() => {
    // Create a new client for each test
    client = new ApiClient({
      baseUrl: 'https://api.example.com',
      defaultHeaders: {
        'Content-Type': 'application/json',
      },
      // Disable default hooks for testing
      logger: false,
      cache: false,
      throttle: false,
    });

    // Reset fetch mock
    fetch.mockReset();

    // Mock successful fetch response
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve({ data: 'test' }),
      text: () => Promise.resolve('test,data\n1,2'),
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('request', () => {
    it('should make a request with the correct URL and headers', async () => {
      await client.request('https://api.example.com/data', {
        method: 'GET',
        headers: {
          'X-API-Key': 'test-key',
        },
      });

      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/data',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-API-Key': 'test-key',
          }),
        }),
      );
    });

    it('should apply base URL to relative paths', async () => {
      await client.request('/data');

      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/data',
        expect.anything(),
      );
    });

    it('should apply hooks in sequence', async () => {
      const hook1 = vi.fn((context, next) => {
        context.request.headers['X-Hook-1'] = 'applied';
        return next(context);
      });

      const hook2 = vi.fn((context, next) => {
        context.request.headers['X-Hook-2'] = 'applied';
        return next(context);
      });

      client.addHook(hook1);
      client.addHook(hook2);

      await client.request('/data');

      expect(hook1).toHaveBeenCalled();
      expect(hook2).toHaveBeenCalled();

      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/data',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Hook-1': 'applied',
            'X-Hook-2': 'applied',
          }),
        }),
      );
    });
  });

  describe('HTTP methods', () => {
    it('should make a GET request', async () => {
      await client.get('/data');

      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/data',
        expect.objectContaining({
          method: 'GET',
        }),
      );
    });

    it('should make a POST request with JSON data', async () => {
      const data = { name: 'test' };

      await client.post('/data', data);

      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/data',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(data),
        }),
      );
    });

    it('should make a PUT request', async () => {
      const data = { name: 'updated' };

      await client.put('/data/1', data);

      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/data/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(data),
        }),
      );
    });

    it('should make a DELETE request', async () => {
      await client.delete('/data/1');

      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/data/1',
        expect.objectContaining({
          method: 'DELETE',
        }),
      );
    });
  });

  describe('Data fetching', () => {
    it('should fetch and parse JSON data', async () => {
      const result = await client.fetchJson('/data');

      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/data',
        expect.anything(),
      );

      expect(result).toEqual({ data: 'test' });
    });

    it('should fetch JSON data and apply schema transformation', async () => {
      // Mock schema transformation
      vi.mock('../../../../src/io/transformers/apiSchemas/index.js', () => ({
        applySchema: vi.fn((data, schema) => ({
          transformed: true,
          originalData: data,
          schema,
        })),
      }));

      const { applySchema } = await import(
        '../../../../src/io/transformers/apiSchemas/index.js'
      );

      const result = await client.fetchJson('/data', {}, 'testSchema');

      expect(applySchema).toHaveBeenCalledWith({ data: 'test' }, 'testSchema');
      expect(result).toEqual({
        transformed: true,
        originalData: { data: 'test' },
        schema: 'testSchema',
      });
    });

    it('should fetch data and convert to DataFrame', async () => {
      // Mock response data
      fetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve([
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
          ]),
      });

      const result = await client.fetchDataFrame('/data');

      expect(result).toBeInstanceOf(DataFrame);
      expect(result.rowCount).toBe(2);
      expect(result.columns).toEqual(['id', 'name']);
    });

    it('should fetch CSV data and parse to DataFrame', async () => {
      // Mock CSV module
      vi.mock('../../../../src/io/readers/csv.js', () => ({
        readCSV: vi.fn(() =>
          DataFrame.fromRows([
            { column1: 'test', column2: 'data' },
            { column1: '1', column2: '2' },
          ]),
        ),
      }));

      const result = await client.fetchCsv('/data.csv');

      const { readCSV } = await import('../../../../src/io/readers/csv.js');

      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/data.csv',
        expect.objectContaining({
          headers: expect.objectContaining({
            Accept: 'text/csv',
          }),
        }),
      );

      expect(readCSV).toHaveBeenCalled();
      expect(result).toBeInstanceOf(DataFrame);
      expect(result.rowCount).toBe(2);
    });
  });

  describe('Factory function', () => {
    it('should create an ApiClient instance', () => {
      const client = createApiClient({
        baseUrl: 'https://api.test.com',
      });

      expect(client).toBeInstanceOf(ApiClient);
      expect(client.baseUrl).toBe('https://api.test.com');
    });
  });
});
