/**
 * Unit tests for query$ method
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../../../packages/core/src/data/model/DataFrame.js';
import { query$ } from '../../../../../packages/core/src/methods/dataframe/filtering/query$.js';

// Test data for use in all tests
const testData = [
  { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
  { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
  { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
];

describe('Query$ Method', () => {
  // Add query$ method to DataFrame prototype
  DataFrame.prototype.query$ = function(strings, ...values) {
    return query$(this, strings, ...values);
  };

  describe('with standard storage', () => {
    // Create DataFrame using fromRecords
    const df = DataFrame.fromRecords(testData);

    test('should filter rows based on a simple condition', () => {
      const result = df.query$`age > 25`;

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(2);
      expect(result.toArray()).toEqual([
        { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
        { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
      ]);
    });

    test('should handle complex conditions with logical operators', () => {
      const result = df.query$`age > 25 && salary > 85000`;

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(1);
      expect(result.toArray()).toEqual([
        { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
      ]);
    });

    test('should handle string methods with _includes syntax', () => {
      const result = df.query$`city_includes("Francisco")`;

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(1);
      expect(result.toArray()).toEqual([
        { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
      ]);
    });

    test('should handle string methods with _startsWith syntax', () => {
      const result = df.query$`city_startsWith("Chi")`;

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(1);
      expect(result.toArray()).toEqual([
        { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
      ]);
    });

    test('should handle string methods with _endsWith syntax', () => {
      const result = df.query$`city_endsWith("York")`;

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(1);
      expect(result.toArray()).toEqual([
        { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
      ]);
    });

    test('should return empty DataFrame when no rows match', () => {
      const result = df.query$`age > 100`;

      // Should have all columns but no rows
      expect(result.columns.sort()).toEqual(
        ['age', 'city', 'name', 'salary'].sort(),
      );
      expect(result.rowCount).toBe(0);
    });

    test('should throw error for invalid expression', () => {
      expect(() => df.query$`age >< 25`).toThrow();
    });

    test('should return a new DataFrame instance', () => {
      const result = df.query$`age > 25`;
      expect(result).toBeInstanceOf(DataFrame);
      expect(result).not.toBe(df); // Should be a new instance
    });

    test('should preserve typed arrays', () => {
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
      const result = typedDf.query$`age > 25`;

      // Check that the result contains Float64Array for salary
      expect(result._columns.salary.vector.__data).toBeInstanceOf(Float64Array);
    });

    test('should handle template literal interpolation', () => {
      const minAge = 30;
      const result = df.query$`age >= ${minAge}`;

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(2);
      expect(result.toArray()).toEqual([
        { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
        { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
      ]);
    });
  });
});
