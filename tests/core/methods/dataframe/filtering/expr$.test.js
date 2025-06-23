/**
 * Unit tests for expr$ method
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../../../packages/core/src/data/model/DataFrame.js';
import { expr$ } from '../../../../../packages/core/src/methods/dataframe/filtering/expr$.js';

// Test data for use in all tests
const testData = [
  { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
  { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
  { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
];

describe('Expr$ Method', () => {
  // Add expr$ method to DataFrame prototype
  DataFrame.prototype.expr$ = function(expression) {
    return expr$(this, expression);
  };

  describe('with standard storage', () => {
    // Create DataFrame using fromRecords
    const df = DataFrame.fromRecords(testData);

    test('should filter rows based on a simple expression', () => {
      const result = df.expr$('age > 25');

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(2);
      expect(result.toArray()).toEqual([
        { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
        { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
      ]);
    });

    test('should handle complex expressions with logical operators', () => {
      const result = df.expr$('age > 25 && salary > 85000');

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(1);
      expect(result.toArray()).toEqual([
        { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
      ]);
    });

    test('should handle string methods', () => {
      const result = df.expr$('city.includes("Francisco")');

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(1);
      expect(result.toArray()).toEqual([
        { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
      ]);
    });

    test('should return empty DataFrame when no rows match', () => {
      const result = df.expr$('age > 100');

      // Should have all columns but no rows
      expect(result.columns.sort()).toEqual(
        ['age', 'city', 'name', 'salary'].sort(),
      );
      expect(result.rowCount).toBe(0);
    });

    test('should throw error for invalid expression', () => {
      expect(() => df.expr$('age >< 25')).toThrow();
    });

    test('should return a new DataFrame instance', () => {
      const result = df.expr$('age > 25');
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
      const result = typedDf.expr$('age > 25');

      // Check that the result contains typed arrays
      expect(result._columns.age.vector.__data).toBeInstanceOf(Int32Array);
      expect(result._columns.salary.vector.__data).toBeInstanceOf(Float64Array);
    });

    test('should handle empty DataFrame', () => {
      const emptyDf = DataFrame.fromRecords([]);
      const result = emptyDf.expr$('age > 25');
      
      expect(result.rowCount).toBe(0);
      expect(result.columns).toEqual([]);
    });

    test('should handle expressions with variables', () => {
      const minAge = 30;
      const result = df.expr$(`age >= ${minAge}`);

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(2);
      expect(result.toArray()).toEqual([
        { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
        { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
      ]);
    });
  });
});
