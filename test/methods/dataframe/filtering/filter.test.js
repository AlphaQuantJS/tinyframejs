/**
 * Unit tests for filter method
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import registerDataFrameFiltering from '../../../../src/methods/dataframe/filtering/register.js';

// Test data for use in all tests
const testData = [
  { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
  { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
  { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
];

describe('Filter Method', () => {
  // Register filtering methods for DataFrame
  registerDataFrameFiltering(DataFrame);

  describe('with standard storage', () => {
    // Create DataFrame using fromRecords
    const df = DataFrame.fromRecords(testData);

    test('should filter rows based on a condition', () => {
      const result = df.filter((row) => row.age > 25);

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(2);
      expect(result.toArray()).toEqual([
        { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
        { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
      ]);
    });

    test('should handle complex conditions', () => {
      const result = df.filter((row) => row.age > 25 && row.salary > 85000);

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(1);
      expect(result.toArray()).toEqual([
        { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
      ]);
    });

    test('should handle conditions on string columns', () => {
      const result = df.filter((row) => row.city.includes('San'));

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(1);
      expect(result.toArray()).toEqual([
        { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
      ]);
    });

    test('should return empty DataFrame when no rows match', () => {
      const result = df.filter((row) => row.age > 100);

      // Should have all columns but no rows
      expect(result.columns.sort()).toEqual(
        ['age', 'city', 'name', 'salary'].sort(),
      );
      expect(result.rowCount).toBe(0);
    });

    test('should throw error for non-function input', () => {
      expect(() => df.filter('age > 25')).toThrow();
    });

    test('should return a new DataFrame instance', () => {
      const result = df.filter((row) => row.age > 25);
      expect(result).toBeInstanceOf(DataFrame);
      expect(result).not.toBe(df); // Should be a new instance
    });

    test('should preserve Float64Array for salary', () => {
      // Create DataFrame with typed arrays
      const typedData = [
        { name: 'Alice', age: 25, salary: 70000 },
        { name: 'Bob', age: 30, salary: 85000 },
        { name: 'Charlie', age: 35, salary: 90000 },
      ];

      // Use Int32Array for age and Float64Array for salary
      const typedDf = DataFrame.fromRecords(typedData, {
        columns: {
          age: { type: 'int32' },
          salary: { type: 'float64' },
        },
      });

      // Filter the data
      const result = typedDf.filter((row) => row.age > 25);

      // Check that the result contains Float64Array for salary
      // Note: age may be converted to Float64Array during filtering
      expect(result._columns.salary.vector.__data).toBeInstanceOf(Float64Array);
    });
  });
});
