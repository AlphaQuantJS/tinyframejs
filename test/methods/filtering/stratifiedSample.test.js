/**
 * Unit tests for stratifiedSample method
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../src/core/DataFrame.js';

describe('StratifiedSample Method', () => {
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
      'New York',
      'San Francisco',
      'Chicago',
      'Boston',
      'Seattle',
    ],
    category: ['A', 'B', 'A', 'B', 'C', 'A', 'B', 'A', 'B', 'C'],
    salary: [
      70000, 85000, 90000, 95000, 100000, 105000, 110000, 115000, 120000,
      125000,
    ],
  };

  test('should select a stratified sample maintaining category proportions', () => {
    const df = DataFrame.create(data);
    const result = df.stratifiedSample('category', 0.5);

    // Check that the result has approximately half the rows
    expect(result.rowCount).toBe(5);

    // Check that the proportions of categories are maintained
    const originalCounts = {};
    const resultCounts = {};

    // Count categories in original data
    df.toArray().forEach((row) => {
      originalCounts[row.category] = (originalCounts[row.category] || 0) + 1;
    });

    // Count categories in result
    result.toArray().forEach((row) => {
      resultCounts[row.category] = (resultCounts[row.category] || 0) + 1;
    });

    // Check that each category has approximately half the original count
    Object.keys(originalCounts).forEach((category) => {
      expect(resultCounts[category]).toBe(
        Math.round(originalCounts[category] * 0.5),
      );
    });
  });

  test('should produce deterministic samples with seed option', () => {
    const df = DataFrame.create(data);
    const sample1 = df.stratifiedSample('category', 0.5, { seed: 42 });
    const sample2 = df.stratifiedSample('category', 0.5, { seed: 42 });

    // Both samples should be identical
    expect(sample1.toArray()).toEqual(sample2.toArray());
  });

  test('should produce different samples with different seeds', () => {
    const df = DataFrame.create(data);
    const sample1 = df.stratifiedSample('category', 0.5, { seed: 42 });
    const sample2 = df.stratifiedSample('category', 0.5, { seed: 43 });

    // Samples should be different (this could theoretically fail, but it's very unlikely)
    const sample1Rows = sample1.toArray();
    const sample2Rows = sample2.toArray();

    // Check if at least one row is different
    const allRowsMatch = sample1Rows.every((row1) =>
      sample2Rows.some(
        (row2) =>
          row2.name === row1.name &&
          row2.age === row1.age &&
          row2.category === row1.category &&
          row2.salary === row1.salary,
      ),
    );

    expect(allRowsMatch).toBe(false);
  });

  test('should throw error for non-existent stratify column', () => {
    const df = DataFrame.create(data);
    expect(() => df.stratifiedSample('nonexistent', 0.5)).toThrow();
  });

  test('should throw error for negative fraction', () => {
    const df = DataFrame.create(data);
    expect(() => df.stratifiedSample('category', -0.5)).toThrow();
  });

  test('should throw error for zero fraction', () => {
    const df = DataFrame.create(data);
    expect(() => df.stratifiedSample('category', 0)).toThrow();
  });

  test('should throw error for fraction greater than 1', () => {
    const df = DataFrame.create(data);
    expect(() => df.stratifiedSample('category', 1.5)).toThrow();
  });

  test('should return a new DataFrame instance', () => {
    const df = DataFrame.create(data);
    const result = df.stratifiedSample('category', 0.5);
    expect(result).toBeInstanceOf(DataFrame);
    expect(result).not.toBe(df); // Should be a new instance
  });

  test('should preserve typed arrays', () => {
    // Create DataFrame with typed arrays
    const typedData = {
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
      age: new Int32Array([25, 30, 35, 40, 45, 50, 55, 60, 65, 70]),
      category: ['A', 'B', 'A', 'B', 'C', 'A', 'B', 'A', 'B', 'C'],
      salary: new Float64Array([
        70000, 85000, 90000, 95000, 100000, 105000, 110000, 115000, 120000,
        125000,
      ]),
    };

    const df = DataFrame.create(typedData);
    const result = df.stratifiedSample('category', 0.5, { seed: 42 });

    // Check that the result has the same array types
    expect(result.frame.columns.age).toBeInstanceOf(Int32Array);
    expect(result.frame.columns.salary).toBeInstanceOf(Float64Array);
  });

  test('should handle the case where a category has only one item', () => {
    const singleItemData = {
      name: ['Alice', 'Bob', 'Charlie'],
      category: ['A', 'B', 'C'],
    };

    const df = DataFrame.create(singleItemData);
    const result = df.stratifiedSample('category', 0.5);

    // Each category should still have at least one item
    const categories = result.toArray().map((row) => row.category);
    expect(categories).toContain('A');
    expect(categories).toContain('B');
    expect(categories).toContain('C');
    expect(result.rowCount).toBe(3); // All items should be included
  });
});
