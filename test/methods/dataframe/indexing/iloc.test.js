/**
 * Unit tests for iloc method
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import { registerDataFrameIndexing } from '../../../../src/methods/dataframe/indexing/register.js';

// Test data for use in all tests
const testData = [
  { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
  { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
  { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
  { name: 'David', age: 40, city: 'Boston', salary: 95000 },
  { name: 'Eve', age: 45, city: 'Seattle', salary: 100000 },
];

describe('ILoc Method', () => {
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

    test('should select rows and columns by integer positions', () => {
      const result = df.iloc([1, 3], [0, 2]);

      // Check that the result has the correct rows and columns
      expect(result.rowCount).toBe(2);
      expect(result.columns).toEqual(['name', 'city']);
      expect(result.toArray()).toEqual([
        { name: 'Bob', city: 'San Francisco' },
        { name: 'David', city: 'Boston' },
      ]);
    });

    test('should select a single row and multiple columns', () => {
      const result = df.iloc(2, [0, 1, 2]);

      // Check that the result has the correct row and columns
      expect(result.rowCount).toBe(1);
      expect(result.columns).toEqual(['name', 'age', 'city']);
      expect(result.toArray()).toEqual([
        { name: 'Charlie', age: 35, city: 'Chicago' },
      ]);
    });

    test('should select multiple rows and a single column', () => {
      const result = df.iloc([0, 2, 4], 1);

      // Check that the result has the correct rows and column
      expect(result.rowCount).toBe(3);
      expect(result.columns).toEqual(['age']);
      expect(result.toArray()).toEqual([{ age: 25 }, { age: 35 }, { age: 45 }]);
    });

    test('should return a scalar value for a single row and a single column', () => {
      const result = df.iloc(1, 3);

      // Check that the result is a scalar value
      expect(result).toBe(85000);
    });

    test('should throw error for row index out of bounds', () => {
      expect(() => df.iloc(5, [0, 1])).toThrow();
    });

    test('should throw error for column index out of bounds', () => {
      expect(() => df.iloc([0, 1], 4)).toThrow();
    });

    test('should support negative row indices for indexing from the end', () => {
      const result = df.iloc(-1, [0, 1]);

      // Check that the last row is selected
      expect(result.rowCount).toBe(1);
      expect(result.columns).toEqual(['name', 'age']);
      expect(result.toArray()).toEqual([{ name: 'Eve', age: 45 }]);
    });

    test('should support negative column indices for indexing from the end', () => {
      const result = df.iloc([0, 1], -1);

      // Check that the last column is selected
      expect(result.rowCount).toBe(2);
      expect(result.columns).toEqual(['salary']);
      expect(result.toArray()).toEqual([{ salary: 70000 }, { salary: 85000 }]);
    });

    test('should return a new DataFrame instance', () => {
      const result = df.iloc([0, 1], [0, 1]);
      expect(result).toBeInstanceOf(DataFrame);
      expect(result).not.toBe(df); // Should be a new instance
    });

    test('should preserve data integrity with typed arrays', () => {
      const result = typedDf.iloc([1, 3], [1, 3]);

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
