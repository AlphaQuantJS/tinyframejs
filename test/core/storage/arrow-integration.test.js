import { describe, it, expect } from 'vitest';
import { DataFrame } from '../../../src/core/dataframe/DataFrame.js';
import { VectorFactory } from '../../../src/core/storage/VectorFactory.js';
import { TypedArrayVector } from '../../../src/core/storage/TypedArrayVector.js';
import { SimpleVector } from '../../../src/core/storage/SimpleVector.js';
import { isArrowAvailable } from '../../../src/core/storage/ArrowAdapter.js';

// Импортируем регистратор методов DataFrame
import { extendDataFrame } from '../../../src/methods/dataframe/registerAll.js';

// Регистрируем методы DataFrame перед запуском тестов
extendDataFrame(DataFrame);

// Используем глобальную ссылку на ArrowVector для корректной проверки типов
const ArrowVector = globalThis.__TinyFrameArrowVector;

/**
 * Tests for Apache Arrow integration
 * These tests verify that TinyFrameJS correctly uses Apache Arrow
 * for appropriate data types and falls back to TypedArray when needed
 */
describe('Apache Arrow Integration', () => {
  // Verify that Apache Arrow is available
  const arrowAvailable = isArrowAvailable();

  // Log availability once at startup
  console.log('Arrow available (sync check):', arrowAvailable);

  // Define conditional test helper upfront
  const conditionalIt = arrowAvailable ? it : it.skip;

  describe('VectorFactory', () => {
    conditionalIt('should use Arrow for string data', () => {
      const data = ['apple', 'banana', 'cherry', 'date'];
      const vector = VectorFactory.from(data);

      expect(vector).toBeInstanceOf(ArrowVector);
      expect(vector.toArray()).toEqual(data);
    });

    conditionalIt('should use Arrow for data with null values', () => {
      const data = ['apple', null, 'cherry', undefined];
      const vector = VectorFactory.from(data);

      expect(vector).toBeInstanceOf(ArrowVector);

      // Check that nulls are preserved
      const result = vector.toArray();
      expect(result[0]).toBe('apple');
      expect(result[1]).toBeNull();
      expect(result[2]).toBe('cherry');
      // Note: Arrow might convert undefined to null
      expect([undefined, null]).toContain(result[3]);
    });

    conditionalIt('should use TypedArray for numeric data', () => {
      const data = [1, 2, 3, 4, 5];
      const vector = VectorFactory.from(data);

      expect(vector).toBeInstanceOf(TypedArrayVector);
      expect(vector.toArray()).toEqual(data);
    });

    conditionalIt('should use Arrow for very large arrays', () => {
      // Create a reasonably large array for testing (not 1M to keep tests fast)
      const largeArray = Array.from({ length: 10_000 }, (_, i) => i);
      const vector = VectorFactory.from(largeArray, { preferArrow: true });

      expect(vector).toBeInstanceOf(ArrowVector);

      // Check a few values to verify it works correctly
      expect(vector.get(0)).toBe(0);
      expect(vector.get(1000)).toBe(1000);
      expect(vector.get(9999)).toBe(9999);
    });

    conditionalIt('should respect preferArrow option', () => {
      // Even though this is numeric data (which would normally use TypedArray),
      // the preferArrow option should force it to use Arrow
      const data = [1, 2, 3, 4, 5];
      const vector = VectorFactory.from(data, { preferArrow: true });

      expect(vector).toBeInstanceOf(ArrowVector);
      expect(vector.toArray()).toEqual(data);
    });

    conditionalIt('should respect neverArrow option', () => {
      // Even though this is string data (which would normally use Arrow),
      // the neverArrow option should force it to use SimpleVector
      const data = ['apple', 'banana', 'cherry'];
      const vector = VectorFactory.from(data, { neverArrow: true });

      expect(vector).not.toBeInstanceOf(ArrowVector);
      expect(vector.toArray()).toEqual(data);
    });
  });

  describe('DataFrame with Arrow storage', () => {
    conditionalIt(
      'should create DataFrame with Arrow storage for string data',
      () => {
        const data = [
          { name: 'Alice', city: 'New York' },
          { name: 'Bob', city: 'Boston' },
          { name: 'Charlie', city: 'Chicago' },
        ];

        const df = DataFrame.fromRows(data);

        // Check that the name column uses Arrow storage
        const nameCol = df.getVector('name');
        expect(nameCol).toBeInstanceOf(ArrowVector);

        // Verify data is correct
        expect(df.getVector('name').toArray()).toEqual([
          'Alice',
          'Bob',
          'Charlie',
        ]);
        expect(df.getVector('city').toArray()).toEqual([
          'New York',
          'Boston',
          'Chicago',
        ]);
      },
    );

    conditionalIt(
      'should perform operations correctly on Arrow-backed DataFrame',
      () => {
        const data = [
          { name: 'Alice', age: 25, city: 'New York' },
          { name: 'Bob', age: 30, city: 'Boston' },
          { name: 'Charlie', age: 35, city: 'Chicago' },
          { name: 'Dave', age: 40, city: 'Denver' },
        ];

        const df = DataFrame.fromRows(data);

        // Filter the DataFrame
        const filtered = df.where('age', '>', 30);

        // Check that the result is correct
        expect(filtered.rowCount).toBe(2);
        expect(filtered.toArray()).toEqual([
          { name: 'Charlie', age: 35, city: 'Chicago' },
          { name: 'Dave', age: 40, city: 'Denver' },
        ]);

        // Select specific columns
        const selected = df.select(['name', 'city']);

        // Check that the result is correct
        expect(selected.columns).toEqual(['name', 'city']);
        expect(selected.toArray()).toEqual([
          { name: 'Alice', city: 'New York' },
          { name: 'Bob', city: 'Boston' },
          { name: 'Charlie', city: 'Chicago' },
          { name: 'Dave', city: 'Denver' },
        ]);
      },
    );
  });
});
