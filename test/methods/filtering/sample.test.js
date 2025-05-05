/**
 * Unit tests for sample method
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../src/core/DataFrame.js';

describe('Sample Method', () => {
  // Sample data for testing
  const data = {
    name: [
      'Alice',
      'Bob',
      'Charlie',
      'David',
      'Eve',
      'Frank',
      'Grace',
      'Heidi',
      'Ivan',
      'Judy',
    ],
    age: [25, 30, 35, 40, 45, 50, 55, 60, 65, 70],
    city: [
      'New York',
      'San Francisco',
      'Chicago',
      'Boston',
      'Seattle',
      'Miami',
      'Denver',
      'Austin',
      'Portland',
      'Atlanta',
    ],
    salary: [
      70000, 85000, 90000, 95000, 100000, 105000, 110000, 115000, 120000,
      125000,
    ],
  };

  test('should select a random sample of rows', () => {
    const df = DataFrame.create(data);
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
    const df = DataFrame.create(data);
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
    const df = DataFrame.create(data);
    const sample1 = df.sample(3, { seed: 42 });
    const sample2 = df.sample(3, { seed: 42 });

    // Both samples should be identical
    expect(sample1.toArray()).toEqual(sample2.toArray());
  });

  test('should produce different samples with different seeds', () => {
    const df = DataFrame.create(data);
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
    const df = DataFrame.create(data);
    expect(() => df.sample(-1)).toThrow();
  });

  test('should throw error for zero sample size', () => {
    const df = DataFrame.create(data);
    expect(() => df.sample(0)).toThrow();
  });

  test('should throw error for sample size greater than row count', () => {
    const df = DataFrame.create(data);
    expect(() => df.sample(11)).toThrow();
  });

  test('should throw error for non-integer sample size', () => {
    const df = DataFrame.create(data);
    expect(() => df.sample(3.5)).toThrow();
  });

  test('should return a new DataFrame instance', () => {
    const df = DataFrame.create(data);
    const result = df.sample(3);
    expect(result).toBeInstanceOf(DataFrame);
    expect(result).not.toBe(df); // Should be a new instance
  });

  test('should preserve typed arrays', () => {
    // Create DataFrame with typed arrays
    const typedData = {
      name: ['Alice', 'Bob', 'Charlie', 'David', 'Eve'],
      age: new Int32Array([25, 30, 35, 40, 45]),
      salary: new Float64Array([70000, 85000, 90000, 95000, 100000]),
    };

    const df = DataFrame.create(typedData);
    const result = df.sample(3, { seed: 42 });

    // Check that the result has the same array types
    expect(result.frame.columns.age).toBeInstanceOf(Int32Array);
    expect(result.frame.columns.salary).toBeInstanceOf(Float64Array);
  });
});
