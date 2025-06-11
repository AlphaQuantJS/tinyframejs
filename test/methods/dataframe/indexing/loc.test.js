/**
 * Unit tests for loc method
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import { register as registerDataFrameIndexing } from '../../../../src/methods/dataframe/indexing/register.js';

// Test data for use in all tests
const testData = [
  { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
  { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
  { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
  { name: 'David', age: 40, city: 'Boston', salary: 95000 },
  { name: 'Eve', age: 45, city: 'Seattle', salary: 100000 },
];

describe('Loc Method', () => {
  // Register indexing methods for DataFrame
  registerDataFrameIndexing(DataFrame);

  describe('with standard storage', () => {
    // Create DataFrame using fromRows
    const df = DataFrame.fromRows(testData);

    // Create DataFrame with typed arrays for testing type preservation
    const typedDf = DataFrame.fromRows(testData, {
      columns: {
        age: { type: 'int32' },
        salary: { type: 'float64' },
      },
    });

    test('should select rows and columns by labels', () => {
      const result = df.loc([1, 3], ['name', 'city']);

      // Check that the result has the correct rows and columns
      expect(result.rowCount).toBe(2);
      expect(result.columns).toEqual(['name', 'city']);
      expect(result.toArray()).toEqual([
        { name: 'Bob', city: 'San Francisco' },
        { name: 'David', city: 'Boston' },
      ]);
    });

    test('should select a single row and multiple columns', () => {
      const result = df.loc(2, ['name', 'age', 'city']);

      // Check that the result has the correct row and columns
      expect(result.rowCount).toBe(1);
      expect(result.columns).toEqual(['name', 'age', 'city']);
      expect(result.toArray()).toEqual([
        { name: 'Charlie', age: 35, city: 'Chicago' },
      ]);
    });

    test('should select multiple rows and a single column', () => {
      const result = df.loc([0, 2, 4], 'age');

      // Check that the result has the correct rows and column
      expect(result.rowCount).toBe(3);
      expect(result.columns).toEqual(['age']);
      expect(result.toArray()).toEqual([{ age: 25 }, { age: 35 }, { age: 45 }]);
    });

    test('should return a scalar value for a single row and a single column', () => {
      const result = df.loc(1, 'salary');

      // Check that the result is a scalar value
      expect(result).toBe(85000);
    });

    test('should throw error for row index out of bounds', () => {
      expect(() => df.loc(5, ['name', 'age'])).toThrow();
    });

    test('should throw error for non-existent column', () => {
      expect(() => df.loc([0, 1], ['name', 'nonexistent'])).toThrow();
    });

    test('should throw error for negative row index', () => {
      expect(() => df.loc(-1, ['name', 'age'])).toThrow();
    });

    test('should return a new DataFrame instance', () => {
      const result = df.loc([0, 1], ['name', 'age']);
      expect(result).toBeInstanceOf(DataFrame);
      expect(result).not.toBe(df); // Should be a new instance
    });

    test('should preserve typed arrays', () => {
      const result = typedDf.loc([1, 3], ['age', 'salary']);

      // Check that the data is preserved correctly
      expect(result.toArray()).toEqual([
        { age: 30, salary: 85000 },
        { age: 40, salary: 95000 },
      ]);

      // Check that data is accessible via API for working with typed arrays
      expect(result.getVector('age')).toBeDefined();
      expect(result.getVector('salary')).toBeDefined();

      // Check that data preserves numeric type
      expect(typeof result.col('age').get(0)).toBe('number');
      expect(typeof result.col('salary').get(0)).toBe('number');
    });
  });
});
