/**
 * Unit tests for filter method
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../../../packages/core/src/data/model/DataFrame.js';
import { filter } from '../../../../../packages/core/src/methods/dataframe/filtering/filter.js';

// Test data for use in all tests
const testData = [
  { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
  { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
  { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
];

describe('Filter Method', () => {
  // Add filter method to DataFrame prototype
  DataFrame.prototype.filter = function(predicate) {
    return filter(this, predicate);
  };

  describe('with standard storage', () => {
    // Create DataFrame using fromRecords
    const df = DataFrame.fromRecords(testData);

    test('should filter rows based on predicate function', () => {
      const result = df.filter(row => row.age > 25);

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(2);
      expect(result.toArray()).toEqual([
        { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
        { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
      ]);
    });

    test('should handle complex predicates', () => {
      const result = df.filter(row => row.age > 25 && row.salary > 85000);

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(1);
      expect(result.toArray()).toEqual([
        { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
      ]);
    });

    test('should return empty DataFrame when no rows match', () => {
      const result = df.filter(row => row.age > 100);

      // Should have all columns but no rows
      expect(result.columns.sort()).toEqual(
        ['age', 'city', 'name', 'salary'].sort(),
      );
      expect(result.rowCount).toBe(0);
    });

    test('should throw error for non-function predicate', () => {
      expect(() => df.filter('not a function')).toThrow('Predicate must be a function');
    });

    test('should return a new DataFrame instance', () => {
      const result = df.filter(row => row.age > 25);
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

      // Filter the data
      const result = typedDf.filter(row => row.age > 25);

      // Check that the result contains typed arrays
      expect(result._columns.age.vector.__data).toBeInstanceOf(Int32Array);
      expect(result._columns.salary.vector.__data).toBeInstanceOf(Float64Array);
    });

    test('should handle empty DataFrame', () => {
      const emptyDf = DataFrame.fromRecords([]);
      const result = emptyDf.filter(row => true);
      
      expect(result.rowCount).toBe(0);
      expect(result.columns).toEqual([]);
    });
  });
});
