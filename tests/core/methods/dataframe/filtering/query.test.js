/**
 * Unit tests for query method
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../../../packages/core/src/data/model/DataFrame.js';
import { query } from '../../../../../packages/core/src/methods/dataframe/filtering/query.js';

// Test data for use in all tests
const testData = [
  { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
  { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
  { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
];

describe('Query Method', () => {
  // Add query method to DataFrame prototype
  DataFrame.prototype.query = function(queryString) {
    return query(this, queryString);
  };

  describe('with standard storage', () => {
    // Create DataFrame using fromRecords
    const df = DataFrame.fromRecords(testData);

    test('should filter rows based on a simple SQL-like query', () => {
      const result = df.query('SELECT * WHERE age > 25');

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(2);
      expect(result.toArray()).toEqual([
        { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
        { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
      ]);
    });

    test('should handle complex conditions with logical operators', () => {
      const result = df.query('SELECT * WHERE age > 25 AND salary > 85000');

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(1);
      expect(result.toArray()).toEqual([
        { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
      ]);
    });

    test('should handle string operations', () => {
      const result = df.query("SELECT * WHERE city LIKE '%Francisco%'");

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(1);
      expect(result.toArray()).toEqual([
        { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
      ]);
    });

    test('should handle column selection', () => {
      const result = df.query('SELECT name, age WHERE age > 25');

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(2);
      expect(result.columns.sort()).toEqual(['age', 'name'].sort());
      expect(result.toArray()).toEqual([
        { name: 'Bob', age: 30 },
        { name: 'Charlie', age: 35 },
      ]);
    });

    test('should handle ORDER BY clause', () => {
      const result = df.query('SELECT * ORDER BY age DESC');

      // Check that the data is sorted correctly
      expect(result.rowCount).toBe(3);
      expect(result.toArray()).toEqual([
        { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
        { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
        { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
      ]);
    });

    test('should handle LIMIT clause', () => {
      const result = df.query('SELECT * ORDER BY age DESC LIMIT 2');

      // Check that the result is limited correctly
      expect(result.rowCount).toBe(2);
      expect(result.toArray()).toEqual([
        { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
        { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
      ]);
    });

    test('should return empty DataFrame when no rows match', () => {
      const result = df.query('SELECT * WHERE age > 100');

      // Should have all columns but no rows
      expect(result.columns.sort()).toEqual(
        ['age', 'city', 'name', 'salary'].sort(),
      );
      expect(result.rowCount).toBe(0);
    });

    test('should throw error for invalid query', () => {
      expect(() => df.query('INVALID QUERY')).toThrow();
    });

    test('should return a new DataFrame instance', () => {
      const result = df.query('SELECT * WHERE age > 25');
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
      const result = typedDf.query('SELECT * WHERE age > 25');

      // Check that the result contains typed arrays
      expect(result._columns.age.vector.__data).toBeInstanceOf(Int32Array);
      expect(result._columns.salary.vector.__data).toBeInstanceOf(Float64Array);
    });

    test('should handle empty DataFrame', () => {
      const emptyDf = DataFrame.fromRecords([]);
      const result = emptyDf.query('SELECT * WHERE age > 25');
      
      expect(result.rowCount).toBe(0);
      expect(result.columns).toEqual([]);
    });
  });
});
