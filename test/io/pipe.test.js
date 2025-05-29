import { describe, it, expect, vi } from 'vitest';
import {
  compose,
  createPipeline,
  batchProcess,
  filter,
  map,
  sort,
  limit,
  toDataFrame,
  log,
} from '../../src/io/pipe.js';
import { DataFrame } from '../../src/core/dataframe/DataFrame.js';

describe('Pipe Utilities', () => {
  describe('compose', () => {
    it('should compose multiple functions', async () => {
      const add2 = (x) => x + 2;
      const multiply3 = (x) => x * 3;
      const subtract5 = (x) => x - 5;

      const composed = compose(add2, multiply3, subtract5);
      const result = await composed(10);

      // (10 + 2) * 3 - 5 = 31
      expect(result).toBe(31);
    });

    it('should handle async functions', async () => {
      const asyncAdd = async (x) => x + 2;
      const asyncMultiply = async (x) => x * 3;

      const composed = compose(asyncAdd, asyncMultiply);
      const result = await composed(10);

      // (10 + 2) * 3 = 36
      expect(result).toBe(36);
    });
  });

  describe('createPipeline', () => {
    it('should create a pipeline with reader and transformers', async () => {
      const reader = vi.fn().mockResolvedValue([1, 2, 3, 4, 5]);
      const double = vi.fn((data) => data.map((x) => x * 2));
      const addOne = vi.fn((data) => data.map((x) => x + 1));

      const pipeline = createPipeline(reader, [double, addOne]);
      const result = await pipeline('test-input');

      expect(reader).toHaveBeenCalledWith('test-input');
      expect(double).toHaveBeenCalledWith([1, 2, 3, 4, 5]);
      expect(addOne).toHaveBeenCalledWith([2, 4, 6, 8, 10]);
      expect(result).toEqual([3, 5, 7, 9, 11]);
    });

    it('should create a pipeline with reader, transformers, and writer', async () => {
      const reader = vi.fn().mockResolvedValue([1, 2, 3]);
      const double = vi.fn((data) => data.map((x) => x * 2));
      const writer = vi.fn();

      const pipeline = createPipeline(reader, [double], writer);
      const result = await pipeline('test-input');

      expect(reader).toHaveBeenCalledWith('test-input');
      expect(double).toHaveBeenCalledWith([1, 2, 3]);
      expect(writer).toHaveBeenCalledWith([2, 4, 6]);
      expect(result).toEqual([2, 4, 6]);
    });
  });

  describe('batchProcess', () => {
    it('should process data in batches', async () => {
      // Mock reader that calls onBatch with batches of data
      const reader = async ({ batchSize, onBatch }) => {
        await onBatch(
          DataFrame.fromRows([
            { id: 1, value: 10 },
            { id: 2, value: 20 },
          ]),
        );

        await onBatch(
          DataFrame.fromRows([
            { id: 3, value: 30 },
            { id: 4, value: 40 },
          ]),
        );
      };

      // Mock processor that doubles values
      const processor = vi.fn((batch) =>
        // Преобразуем батч в массив и применяем map
        batch.toArray().map((row) => ({
          ...row,
          value: row.value * 2,
        })),
      );

      // Mock progress callback
      const onProgress = vi.fn();

      // Process in batches
      const results = await batchProcess(reader, processor, {
        batchSize: 2,
        onProgress,
      });

      // Check processor was called for each batch
      expect(processor).toHaveBeenCalledTimes(2);

      // Check progress callback was called for each batch
      expect(onProgress).toHaveBeenCalledTimes(2);
      expect(onProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          processedCount: 2,
          batchCount: 1,
        }),
      );
      expect(onProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          processedCount: 4,
          batchCount: 2,
        }),
      );

      // Check results contain processed batches
      expect(results).toHaveLength(2);
      // Процессор теперь возвращает массив, а не DataFrame
      expect(results[0]).toEqual([
        { id: 1, value: 20 },
        { id: 2, value: 40 },
      ]);
      expect(results[1]).toEqual([
        { id: 3, value: 60 },
        { id: 4, value: 80 },
      ]);
    });
  });
});

describe('DataFrame Transformers', () => {
  // Sample data for testing
  const sampleData = [
    { id: 1, name: 'Alice', age: 30, score: 85 },
    { id: 2, name: 'Bob', age: 25, score: 90 },
    { id: 3, name: 'Charlie', age: 35, score: 75 },
    { id: 4, name: 'David', age: 28, score: 95 },
    { id: 5, name: 'Eve', age: 22, score: 80 },
  ];

  const sampleDataFrame = DataFrame.fromRows(sampleData);

  describe('filter', () => {
    it('should filter DataFrame rows', () => {
      const filterFn = filter((row) => row.age > 25);
      const result = filterFn(sampleDataFrame);

      expect(result).toBeInstanceOf(DataFrame);
      expect(result.rowCount).toBe(3);
      expect(result.toArray()).toEqual([
        { id: 1, name: 'Alice', age: 30, score: 85 },
        { id: 3, name: 'Charlie', age: 35, score: 75 },
        { id: 4, name: 'David', age: 28, score: 95 },
      ]);
    });

    it('should filter array data', () => {
      const filterFn = filter((item) => item.score >= 85);
      const result = filterFn(sampleData);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(3);
      expect(result).toEqual([
        { id: 1, name: 'Alice', age: 30, score: 85 },
        { id: 2, name: 'Bob', age: 25, score: 90 },
        { id: 4, name: 'David', age: 28, score: 95 },
      ]);
    });
  });

  describe('map', () => {
    it('should map DataFrame rows', () => {
      const mapFn = map((row) => ({
        ...row,
        score: row.score + 5,
      }));

      const result = mapFn(sampleDataFrame);

      expect(result).toBeInstanceOf(DataFrame);
      expect(result.rowCount).toBe(5);
      expect(result.toArray()[0].score).toBe(90); // 85 + 5
      expect(result.toArray()[1].score).toBe(95); // 90 + 5
    });

    it('should map array data', () => {
      const mapFn = map((item) => ({
        ...item,
        category: item.age < 30 ? 'young' : 'senior',
      }));

      const result = mapFn(sampleData);

      expect(Array.isArray(result)).toBe(true);
      expect(result[0].category).toBe('senior');
      expect(result[1].category).toBe('young');
    });
  });

  describe('sort', () => {
    it('should sort DataFrame by key', () => {
      const sortFn = sort('age');
      const result = sortFn(sampleDataFrame);

      expect(result).toBeInstanceOf(DataFrame);
      expect(result.toArray()[0].age).toBe(22); // Youngest first
      expect(result.toArray()[4].age).toBe(35); // Oldest last
    });

    it('should sort DataFrame by key in descending order', () => {
      const sortFn = sort('score', false);
      const result = sortFn(sampleDataFrame);

      expect(result).toBeInstanceOf(DataFrame);
      expect(result.toArray()[0].score).toBe(95); // Highest first
      expect(result.toArray()[4].score).toBe(75); // Lowest last
    });

    it('should sort array data by comparator', () => {
      const sortFn = sort((a, b) => a.name.localeCompare(b.name));
      const result = sortFn(sampleData);

      expect(Array.isArray(result)).toBe(true);
      expect(result[0].name).toBe('Alice');
      expect(result[4].name).toBe('Eve');
    });
  });

  describe('limit', () => {
    it('should limit DataFrame rows', () => {
      const limitFn = limit(3);
      const result = limitFn(sampleDataFrame);

      expect(result).toBeInstanceOf(DataFrame);
      expect(result.rowCount).toBe(3);
      expect(result.toArray()).toEqual(sampleData.slice(0, 3));
    });

    it('should limit array data', () => {
      const limitFn = limit(2);
      const result = limitFn(sampleData);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(result).toEqual(sampleData.slice(0, 2));
    });
  });

  describe('toDataFrame', () => {
    it('should convert array to DataFrame', () => {
      const convertFn = toDataFrame();
      const result = convertFn(sampleData);

      expect(result).toBeInstanceOf(DataFrame);
      expect(result.rowCount).toBe(5);
      expect(result.columns).toEqual(['id', 'name', 'age', 'score']);
    });

    it('should return DataFrame if already a DataFrame', () => {
      const convertFn = toDataFrame();
      const result = convertFn(sampleDataFrame);

      expect(result).toBe(sampleDataFrame);
    });

    it('should convert single object to DataFrame', () => {
      const convertFn = toDataFrame();
      const result = convertFn({ id: 1, name: 'Test' });

      expect(result).toBeInstanceOf(DataFrame);
      expect(result.rowCount).toBe(1);
      expect(result.toArray()).toEqual([{ id: 1, name: 'Test' }]);
    });
  });

  describe('log', () => {
    it('should log DataFrame and return it unchanged', () => {
      // Mock console.log
      const originalConsoleLog = console.log;
      console.log = vi.fn();

      const logFn = log('Test DataFrame:');
      const result = logFn(sampleDataFrame);

      expect(console.log).toHaveBeenCalledWith('Test DataFrame:');
      expect(result).toBe(sampleDataFrame);

      // Restore console.log
      console.log = originalConsoleLog;
    });
  });
});
