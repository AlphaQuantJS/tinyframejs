/**
 * Unit tests for sample method
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
  { name: 'David', age: 40, city: 'Boston', salary: 95000 },
  { name: 'Eve', age: 45, city: 'Seattle', salary: 100000 },
  { name: 'Frank', age: 50, city: 'Miami', salary: 105000 },
  { name: 'Grace', age: 55, city: 'Denver', salary: 110000 },
  { name: 'Heidi', age: 60, city: 'Austin', salary: 115000 },
  { name: 'Ivan', age: 65, city: 'Portland', salary: 120000 },
  { name: 'Judy', age: 70, city: 'Atlanta', salary: 125000 },
];

describe('Sample Method', () => {
  describe('with standard storage', () => {
    // Create DataFrame using fromRows
    const df = DataFrame.fromRows(testData);

    // Create DataFrame with typed arrays for testing type preservation
    const typedDf = DataFrame.fromRows(testData.slice(0, 5), {
      columns: {
        age: { type: 'int32' },
        salary: { type: 'float64' },
      },
    });

    test('should select a random sample of rows', () => {
      const result = df.sample(3);

      // Check that the result has the correct number of rows and all columns
      expect(result.rowCount).toBe(3);
      expect(result.columns.sort()).toEqual(
        ['age', 'city', 'name', 'salary'].sort(),
      );

      // Check that each row in the result exists in the original DataFrame
      const originalRows = df.toArray();
      const resultRows = result.toArray();

      resultRows.forEach((resultRow) => {
        const matchingRow = originalRows.find(
          (originalRow) =>
            originalRow.name === resultRow.name &&
            originalRow.age === resultRow.age &&
            originalRow.city === resultRow.city &&
            originalRow.salary === resultRow.salary,
        );
        expect(matchingRow).toBeDefined();
      });
    });

    test('should select all rows when sample size equals row count', () => {
      const result = df.sample(10);

      // Check that the result has all rows
      expect(result.rowCount).toBe(10);

      // Rows might be in a different order, so we need to sort them
      const sortedOriginal = df
        .toArray()
        .sort((a, b) => a.name.localeCompare(b.name));
      const sortedResult = result
        .toArray()
        .sort((a, b) => a.name.localeCompare(b.name));
      expect(sortedResult).toEqual(sortedOriginal);
    });

    test('should produce deterministic samples with seed option', () => {
      const sample1 = df.sample(3, { seed: 42 });
      const sample2 = df.sample(3, { seed: 42 });

      // Both samples should be identical
      expect(sample1.toArray()).toEqual(sample2.toArray());
    });

    test('should produce different samples with different seeds', () => {
      const sample1 = df.sample(5, { seed: 42 });
      const sample2 = df.sample(5, { seed: 43 });

      // Samples should be different (this could theoretically fail, but it's very unlikely)
      const sample1Rows = sample1.toArray();
      const sample2Rows = sample2.toArray();

      // Check if at least one row is different
      const allRowsMatch = sample1Rows.every((row1) =>
        sample2Rows.some(
          (row2) =>
            row2.name === row1.name &&
            row2.age === row1.age &&
            row2.city === row1.city &&
            row2.salary === row1.salary,
        ),
      );

      expect(allRowsMatch).toBe(false);
    });

    test('should throw error for negative sample size', () => {
      expect(() => df.sample(-1)).toThrow();
    });

    test('should throw error for zero sample size', () => {
      expect(() => df.sample(0)).toThrow();
    });

    test('should throw error for sample size greater than row count', () => {
      expect(() => df.sample(11)).toThrow();
    });

    test('should throw error for non-integer sample size', () => {
      expect(() => df.sample(3.5)).toThrow();
    });

    test('should return a new DataFrame instance', () => {
      const result = df.sample(3);
      expect(result).toBeInstanceOf(DataFrame);
      expect(result).not.toBe(df); // Should be a new instance
    });

    test('should preserve Float64Array for salary', () => {
      // Use DataFrame with typed arrays
      const result = typedDf.sample(3, { seed: 42 });

      // Check that the result preserves the Float64Array type for salary
      expect(result._columns.salary.vector.__data).toBeInstanceOf(Float64Array);

      // Check that the data is preserved correctly
      const resultArray = result.toArray();
      expect(resultArray.length).toBe(3);
      expect(typeof resultArray[0].age).toBe('number');
      expect(typeof resultArray[0].salary).toBe('number');
    });
  });
});
