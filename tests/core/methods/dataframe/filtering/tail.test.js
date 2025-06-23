/**
 * Unit tests for tail method
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../../../packages/core/src/data/model/DataFrame.js';
import { tail } from '../../../../../packages/core/src/methods/dataframe/filtering/tail.js';

// Test data for use in all tests
const testData = [
  { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
  { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
  { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
  { name: 'David', age: 40, city: 'Boston', salary: 95000 },
  { name: 'Eve', age: 45, city: 'Seattle', salary: 100000 },
  { name: 'Frank', age: 50, city: 'Denver', salary: 105000 },
  { name: 'Grace', age: 55, city: 'Miami', salary: 110000 },
];

describe('Tail Method', () => {
  // Add tail method to DataFrame prototype
  DataFrame.prototype.tail = function(n, options) {
    return tail(this, n, options);
  };

  describe('with standard storage', () => {
    // Create DataFrame using fromRecords
    const df = DataFrame.fromRecords(testData);

    test('should return last 5 rows by default', () => {
      const result = df.tail();

      // Check that the result has 5 rows
      expect(result.rowCount).toBe(5);
      expect(result.toArray()).toEqual(testData.slice(-5));
    });

    test('should return specified number of rows from the end', () => {
      const result = df.tail(3);

      // Check that the result has 3 rows
      expect(result.rowCount).toBe(3);
      expect(result.toArray()).toEqual(testData.slice(-3));
    });

    test('should handle n greater than number of rows', () => {
      const result = df.tail(10);

      // Should return all rows
      expect(result.rowCount).toBe(testData.length);
      expect(result.toArray()).toEqual(testData);
    });

    test('should throw error for negative n', () => {
      expect(() => df.tail(-1)).toThrow('Number of rows must be a positive integer');
    });

    test('should throw error for non-integer n', () => {
      expect(() => df.tail(2.5)).toThrow('Number of rows must be an integer');
    });

    test('should return a new DataFrame instance', () => {
      const result = df.tail(3);
      expect(result).toBeInstanceOf(DataFrame);
      expect(result).not.toBe(df); // Should be a new instance
    });

    test('should preserve typed arrays', () => {
      // Create DataFrame with typed arrays
      const typedDf = DataFrame.fromRecords(testData, {
        columns: {
          age: { type: 'int32' },
          salary: { type: 'float64' },
        },
      });

      // Get tail of the data
      const result = typedDf.tail(3);

      // Check that the result has the correct columns and data
      expect(result.columns.sort()).toEqual(['age', 'city', 'name', 'salary'].sort());
      
      // Check that the data is preserved correctly (using the public API)
      const ageCol = result.col('age');
      const salaryCol = result.col('salary');
      expect(ageCol.toArray()).toEqual([45, 50, 55]);
      expect(salaryCol.toArray()).toEqual([100000, 105000, 110000]);
    });

    test('should accept options object', () => {
      // The print option is for API compatibility and doesn't affect the result
      const result = df.tail(3, { print: true });
      expect(result.rowCount).toBe(3);
    });
  });
});
