/**
 * Unit tests for expr$ method
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import registerDataFrameFiltering from '../../../../src/methods/dataframe/filtering/register.js';

// Test data for use in all tests
const testData = [
  { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
  { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
  { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
  { name: 'David', age: 40, city: 'Boston', salary: 95000 },
  { name: 'Eve', age: 45, city: 'Seattle', salary: 100000 },
];

describe('Expr$ Method', () => {
  // Register filtering methods for DataFrame
  registerDataFrameFiltering(DataFrame);

  describe('with standard storage', () => {
    // Create DataFrame using fromRecords
    const df = DataFrame.fromRecords(testData);

    // Create DataFrame with typed arrays for testing type preservation
    const typedDf = DataFrame.fromRecords(testData, {
      columns: {
        age: { type: 'int32' },
        salary: { type: 'float64' },
      },
    });

    test('should filter rows based on numeric comparison', () => {
      const result = df.expr$`age > 25`;

      expect(result.rowCount).toBe(4);
      expect(result.toArray()).toEqual([
        { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
        { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
        { name: 'David', age: 40, city: 'Boston', salary: 95000 },
        { name: 'Eve', age: 45, city: 'Seattle', salary: 100000 },
      ]);
    });

    test('should filter rows based on string equality', () => {
      const result = df.expr$`name == "Alice"`;

      expect(result.rowCount).toBe(1);
      expect(result.toArray()).toEqual([
        { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
      ]);
    });

    test('should filter rows based on string includes method', () => {
      const result = df.expr$`city_includes("Francisco")`;

      expect(result.rowCount).toBe(1);
      expect(result.toArray()).toEqual([
        { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
      ]);
    });

    test('should support complex expressions with multiple conditions', () => {
      const result = df.expr$`age > 25 && salary < 90000`;

      expect(result.rowCount).toBe(1);
      expect(result.toArray()).toEqual([
        { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
      ]);
    });

    test('should support template literal interpolation', () => {
      const minAge = 30;
      const result = df.expr$`age >= ${minAge}`;

      expect(result.rowCount).toBe(4);
      expect(result.toArray()).toEqual([
        { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
        { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
        { name: 'David', age: 40, city: 'Boston', salary: 95000 },
        { name: 'Eve', age: 45, city: 'Seattle', salary: 100000 },
      ]);
    });

    test('should return empty DataFrame when no rows match', () => {
      const result = df.expr$`age > 100`;

      expect(result.rowCount).toBe(0);
      expect(result.toArray()).toEqual([]);
    });

    test('should throw error for invalid expression', () => {
      expect(() => df.expr$`invalid syntax here`).toThrow();
    });

    test('should preserve data integrity with typed arrays', () => {
      const result = typedDf.expr$`age > 25`;

      // Check that the data is preserved correctly
      expect(result.toArray()).toEqual([
        { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
        { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
        { name: 'David', age: 40, city: 'Boston', salary: 95000 },
        { name: 'Eve', age: 45, city: 'Seattle', salary: 100000 },
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
