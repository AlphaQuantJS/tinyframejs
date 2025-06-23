/**
 * Unit tests for iloc method
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../../../packages/core/src/data/model/DataFrame.js';
import { iloc } from '../../../../../packages/core/src/methods/dataframe/filtering/iloc.js';

// Test data for use in all tests
const testData = [
  { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
  { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
  { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
  { name: 'David', age: 40, city: 'Boston', salary: 95000 },
  { name: 'Eve', age: 45, city: 'Seattle', salary: 100000 },
];

describe('Iloc Method', () => {
  // Add iloc method to DataFrame prototype
  DataFrame.prototype.iloc = function(rowSelector, columnSelector) {
    return iloc(this, rowSelector, columnSelector);
  };

  describe('with standard storage', () => {
    // Create DataFrame using fromRecords
    const df = DataFrame.fromRecords(testData);

    test('should select rows by integer index', () => {
      const result = df.iloc(1);

      // Check that the result is a DataFrame with one row
      expect(result.rowCount).toBe(1);
      expect(result.toArray()).toEqual([testData[1]]);
    });

    test('should select rows by array of indices', () => {
      const result = df.iloc([0, 2, 4]);

      // Check that the result contains the selected rows
      expect(result.rowCount).toBe(3);
      expect(result.toArray()).toEqual([
        testData[0],
        testData[2],
        testData[4],
      ]);
    });

    test('should select rows by predicate function', () => {
      const result = df.iloc((i) => i % 2 === 0);

      // Should select rows at indices 0, 2, 4
      expect(result.rowCount).toBe(3);
      expect(result.toArray()).toEqual([
        testData[0],
        testData[2],
        testData[4],
      ]);
    });

    test('should select columns by integer index', () => {
      const result = df.iloc(null, 1);

      // Should select the 'age' column for all rows
      expect(result.columns).toEqual(['age']);
      expect(result.rowCount).toBe(5);
      expect(result.col('age').toArray()).toEqual([25, 30, 35, 40, 45]);
    });

    test('should select columns by array of indices', () => {
      const result = df.iloc(null, [0, 2]);

      // Should select the 'name' and 'city' columns
      expect(result.columns.sort()).toEqual(['city', 'name'].sort());
      expect(result.rowCount).toBe(5);
    });

    test('should select rows and columns by indices', () => {
      const result = df.iloc([1, 3], [0, 2]);

      // Should select rows 1 and 3, columns 'name' and 'city'
      expect(result.rowCount).toBe(2);
      expect(result.columns.sort()).toEqual(['city', 'name'].sort());
      expect(result.toArray()).toEqual([
        { name: 'Bob', city: 'San Francisco' },
        { name: 'David', city: 'Boston' },
      ]);
    });

    test('should handle null for rows to select all rows', () => {
      const result = df.iloc(null, 1);

      // Should select all rows, but only the 'age' column
      expect(result.rowCount).toBe(5);
      expect(result.columns).toEqual(['age']);
    });

    test('should handle null for columns to select all columns', () => {
      const result = df.iloc(2, null);

      // Should select row 2, all columns
      expect(result.rowCount).toBe(1);
      expect(result.columns.sort()).toEqual(['age', 'city', 'name', 'salary'].sort());
      expect(result.toArray()).toEqual([testData[2]]);
    });

    test('should throw error for out of bounds row index', () => {
      expect(() => df.iloc(10)).toThrow('Row index out of bounds');
    });

    test('should throw error for out of bounds column index', () => {
      expect(() => df.iloc(null, 10)).toThrow('Column index out of bounds');
    });

    test('should throw error for invalid row selector type', () => {
      expect(() => df.iloc('invalid')).toThrow('Invalid row selector type');
    });

    test('should throw error for invalid column selector type', () => {
      expect(() => df.iloc(null, 'invalid')).toThrow('Invalid column selector type');
    });

    test('should preserve typed arrays', () => {
      // Create DataFrame with typed arrays
      const typedDf = DataFrame.fromRecords(testData, {
        columns: {
          age: { type: 'int32' },
          salary: { type: 'float64' },
        },
      });

      // Select rows and columns
      const result = typedDf.iloc([1, 3], [1, 3]);

      // Check that the result contains typed arrays
      expect(result._columns.age.vector.__data).toBeInstanceOf(Int32Array);
      expect(result._columns.salary.vector.__data).toBeInstanceOf(Float64Array);
    });

    test('should handle empty DataFrame', () => {
      const emptyDf = DataFrame.fromRecords([]);
      
      expect(() => emptyDf.iloc(0)).toThrow('Row index out of bounds');
    });
  });
});
