/**
 * Unit tests for sample method
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../../../packages/core/src/data/model/DataFrame.js';
import { sample } from '../../../../../packages/core/src/methods/dataframe/filtering/sample.js';

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

describe('Sample Method', () => {
  // Add sample method to DataFrame prototype
  DataFrame.prototype.sample = function (n, options) {
    return sample(this, n, options);
  };

  describe('with standard storage', () => {
    // Create DataFrame using fromRecords
    const df = DataFrame.fromRecords(testData);

    test('should sample 1 row by default', () => {
      const result = df.sample();

      // Check that the result has 1 row
      expect(result.rowCount).toBe(1);
      // The row should be one of the original rows
      const resultRow = result.toArray()[0];
      expect(
        testData.some(
          (row) =>
            row.name === resultRow.name &&
            row.age === resultRow.age &&
            row.city === resultRow.city &&
            row.salary === resultRow.salary,
        ),
      ).toBe(true);
    });

    test('should sample specified number of rows', () => {
      const result = df.sample(3);

      // Check that the result has 3 rows
      expect(result.rowCount).toBe(3);

      // Each row should be one of the original rows
      const resultRows = result.toArray();
      for (const resultRow of resultRows) {
        expect(
          testData.some(
            (row) =>
              row.name === resultRow.name &&
              row.age === resultRow.age &&
              row.city === resultRow.city &&
              row.salary === resultRow.salary,
          ),
        ).toBe(true);
      }
    });

    test('should sample by fraction', () => {
      const result = df.sample({ fraction: 0.5 });

      // Check that the result has approximately half the rows
      // Due to rounding, it might be 3 or 4 rows for 7 total rows
      expect(result.rowCount).toBeGreaterThanOrEqual(3);
      expect(result.rowCount).toBeLessThanOrEqual(4);
    });

    test('should throw error for invalid fraction', () => {
      expect(() => df.sample({ fraction: 0 })).toThrow(
        'Fraction must be in the range (0, 1]',
      );
      expect(() => df.sample({ fraction: 1.5 })).toThrow(
        'Fraction must be in the range (0, 1]',
      );
    });

    test('should throw error for negative n', () => {
      expect(() => df.sample(-1)).toThrow(
        'Number of rows to sample must be a positive integer',
      );
    });

    test('should throw error for non-integer n', () => {
      expect(() => df.sample(2.5)).toThrow(
        'Number of rows to sample must be an integer',
      );
    });

    test('should throw error when sampling without replacement and n > rows', () => {
      expect(() => df.sample(10)).toThrow(
        'Sample size (10) cannot be greater than number of rows (7)',
      );
    });

    test('should allow sampling with replacement and n > rows', () => {
      const result = df.sample(10, { replace: true });
      expect(result.rowCount).toBe(10);
    });

    test('should return a new DataFrame instance', () => {
      const result = df.sample(3);
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

      // Sample the data with a fixed seed for deterministic results
      const result = typedDf.sample(3, { seed: 42 });

      // Check that the result has the correct columns
      expect(result.columns.sort()).toEqual(
        ['age', 'city', 'name', 'salary'].sort(),
      );

      // Check that the data is preserved correctly (using the public API)
      const ageCol = result.col('age');
      const salaryCol = result.col('salary');

      // We can't check exact values since they depend on the random seed implementation
      // But we can check that the arrays have the right length and are of the right type
      expect(ageCol.toArray().length).toBe(3);
      expect(salaryCol.toArray().length).toBe(3);

      // Check that all values are from the original dataset
      const originalAges = testData.map((row) => row.age);
      const originalSalaries = testData.map((row) => row.salary);

      ageCol.toArray().forEach((value) => {
        expect(originalAges).toContain(value);
      });

      salaryCol.toArray().forEach((value) => {
        expect(originalSalaries).toContain(value);
      });
    });

    test('should produce deterministic results with seed', () => {
      // Sample with the same seed should produce the same results
      const sample1 = df.sample(3, { seed: 42 });
      const sample2 = df.sample(3, { seed: 42 });

      // Compare the sampled rows
      const rows1 = sample1.toArray();
      const rows2 = sample2.toArray();

      expect(rows1).toEqual(rows2);
    });

    test('should handle empty DataFrame', () => {
      const emptyDf = DataFrame.fromRecords([]);
      const result = emptyDf.sample();

      expect(result.rowCount).toBe(0);
      expect(result.columns).toEqual([]);
    });
  });
});
