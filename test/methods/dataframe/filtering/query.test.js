/**
 * Unit tests for query method
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import { registerDataFrameFiltering } from '../../../../src/methods/dataframe/filtering/register.js';

// Register filtering methods on DataFrame
registerDataFrameFiltering(DataFrame);

// Test data as array of objects for use with DataFrame.fromRows
const testData = [
  { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
  { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
  { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
];

describe('Query Method', () => {
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

    test('should filter rows using a simple query', () => {
      const result = df.query('age > 25');

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(2);
      expect(result.toArray()).toEqual([
        { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
        { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
      ]);
    });

    test('should handle string equality', () => {
      const result = df.query("city == 'New York'");

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(1);
      expect(result.toArray()).toEqual([
        { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
      ]);
    });

    test('should handle complex queries with AND/OR operators', () => {
      const result = df.query('age > 25 && salary >= 90000');

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(1);
      expect(result.toArray()).toEqual([
        { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
      ]);

      const result2 = df.query('age < 30 || salary >= 90000');
      expect(result2.rowCount).toBe(2);
      expect(result2.toArray()).toEqual([
        { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
        { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
      ]);
    });

    test('should handle string methods in queries', () => {
      const result = df.query("city.includes('San')");

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(1);
      expect(result.toArray()).toEqual([
        { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
      ]);
    });

    test('should return empty DataFrame when no rows match', () => {
      const result = df.query('age > 100');

      // Should have all columns but no rows
      expect(result.columns.sort()).toEqual(
        ['age', 'city', 'name', 'salary'].sort(),
      );
      expect(result.rowCount).toBe(0);
    });

    test('should throw error for invalid query syntax', () => {
      expect(() => df.query('age >')).toThrow();
    });

    test('should throw error for non-string query', () => {
      expect(() => df.query(123)).toThrow();
    });

    test('should return a new DataFrame instance', () => {
      const result = df.query('age > 25');
      expect(result).toBeInstanceOf(DataFrame);
      expect(result).not.toBe(df); // Should be a new instance
    });

    test('should preserve Float64Array for salary', () => {
      // Use DataFrame with typed arrays
      const result = typedDf.query('age > 25');

      // Check that the result preserves the Float64Array type for salary
      expect(result._columns.salary.vector.__data).toBeInstanceOf(Float64Array);

      // Check that the data is preserved correctly
      expect(result.toArray()).toEqual([
        { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
        { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
      ]);
    });
  });
});
