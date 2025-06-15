/**
 * Unit tests for where method
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

describe('Where Method', () => {
  // Register filtering methods for DataFrame
  registerDataFrameFiltering(DataFrame);

  describe('with standard storage', () => {
    // Create DataFrame using fromRecords
    const df = DataFrame.fromRecords(testData);

    test('should filter rows using column condition with > operator', () => {
      const result = df.where('age', '>', 25);

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(2);
      expect(result.toArray()).toEqual([
        { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
        { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
      ]);
    });

    test('should filter rows using column condition with == operator', () => {
      const result = df.where('city', '==', 'Chicago');

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(1);
      expect(result.toArray()).toEqual([
        { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
      ]);
    });

    test('should filter rows using column condition with != operator', () => {
      const result = df.where('city', '!=', 'Chicago');

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(2);
      expect(result.toArray()).toEqual([
        { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
        { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
      ]);
    });

    test('should filter rows using column condition with >= operator', () => {
      const result = df.where('salary', '>=', 85000);

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(2);
      expect(result.toArray()).toEqual([
        { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
        { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
      ]);
    });

    test('should filter rows using column condition with <= operator', () => {
      const result = df.where('salary', '<=', 85000);

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(2);
      expect(result.toArray()).toEqual([
        { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
        { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
      ]);
    });

    test('should filter rows using column condition with in operator', () => {
      const result = df.where('city', 'in', ['New York', 'Chicago']);

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(2);
      expect(result.toArray()).toEqual([
        { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
        { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
      ]);
    });

    test('should filter rows using column condition with contains operator', () => {
      const result = df.where('city', 'contains', 'San');

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(1);
      expect(result.toArray()).toEqual([
        { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
      ]);
    });

    test('should filter rows using column condition with startsWith operator (camelCase)', () => {
      const result = df.where('city', 'startsWith', 'San');

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(1);
      expect(result.toArray()).toEqual([
        { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
      ]);
    });

    test('should filter rows using column condition with startswith operator (lowercase)', () => {
      const result = df.where('city', 'startswith', 'San');

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(1);
      expect(result.toArray()).toEqual([
        { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
      ]);
    });

    test('should filter rows using column condition with endsWith operator (camelCase)', () => {
      const result = df.where('city', 'endsWith', 'York');

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(1);
      expect(result.toArray()).toEqual([
        { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
      ]);
    });

    test('should filter rows using column condition with endswith operator (lowercase)', () => {
      const result = df.where('city', 'endswith', 'York');

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(1);
      expect(result.toArray()).toEqual([
        { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
      ]);
    });

    test('should filter rows using column condition with matches operator', () => {
      const result = df.where('city', 'matches', '^San');

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(1);
      expect(result.toArray()).toEqual([
        { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
      ]);
    });

    test('should return empty DataFrame when no rows match', () => {
      const result = df.where('age', '>', 100);

      // Should have all columns but no rows
      expect(result.columns.sort()).toEqual(
        ['age', 'city', 'name', 'salary'].sort(),
      );
      expect(result.rowCount).toBe(0);
    });

    test('should throw error for non-existent column', () => {
      expect(() => df.where('nonexistent', '>', 25)).toThrow();
    });

    test('should throw error for unsupported operator', () => {
      expect(() => df.where('age', 'invalid', 25)).toThrow();
    });

    test('should return a new DataFrame instance', () => {
      const result = df.where('age', '>', 25);
      expect(result).toBeInstanceOf(DataFrame);
      expect(result).not.toBe(df); // Should be a new instance
    });

    test('should preserve Float64Array for salary', () => {
      // Create DataFrame with typed arrays
      const typedDf = DataFrame.fromRecords(testData, {
        columns: {
          age: { type: 'int32' },
          salary: { type: 'float64' },
        },
      });

      // Filter data
      const result = typedDf.where('age', '>', 25);

      // Check that the result contains Float64Array for salary
      // Note: age may be converted to Float64Array during filtering
      expect(result._columns.salary.vector.__data).toBeInstanceOf(Float64Array);
    });
  });
});
