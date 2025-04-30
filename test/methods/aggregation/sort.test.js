/**
 * Unit tests for the sort method
 *
 * These tests verify the functionality of the sort method, which sorts
 * DataFrame data by a specified column in ascending order.
 *
 * @module test/methods/aggregation/sort.test
 */

import { sort } from '../../../src/methods/aggregation/sort.js';
import { DataFrame } from '../../../src/core/DataFrame.js';
import { describe, test, expect, vi, beforeEach } from 'vitest';

/**
 * Tests for the sort function
 */
describe('sort', () => {
  // Mock the validateColumn dependency
  const validateColumn = vi.fn();
  const sortFn = sort({ validateColumn });

  // Reset mocks before each test
  beforeEach(() => {
    validateColumn.mockReset();
  });

  test('should sort rows by specified column in ascending order', () => {
    const frame = {
      columns: {
        a: [3, 1, 2],
        b: ['c', 'a', 'b'],
      },
      rowCount: 3,
      columnNames: ['a', 'b'],
      dtypes: { a: 'f64', b: 'str' },
    };

    const result = sortFn(frame, 'a');

    expect(validateColumn).toHaveBeenCalledWith(frame, 'a');

    // Check that the result has the correct sorted values
    expect(result.columns.a).toEqual([1, 2, 3]);
    expect(result.columns.b).toEqual(['a', 'b', 'c']);
  });

  test('should handle duplicate values correctly', () => {
    const frame = {
      columns: {
        a: [3, 1, 3, 2],
        b: ['d', 'a', 'c', 'b'],
      },
      rowCount: 4,
      columnNames: ['a', 'b'],
      dtypes: { a: 'f64', b: 'str' },
    };

    const result = sortFn(frame, 'a');

    expect(validateColumn).toHaveBeenCalledWith(frame, 'a');

    // Check that the result has the correct sorted values
    // Note: stable sort should preserve order of equal elements
    expect(result.columns.a).toEqual([1, 2, 3, 3]);
    expect(result.columns.b).toEqual(['a', 'b', 'd', 'c']);
  });

  test('should handle empty frame correctly', () => {
    const frame = {
      columns: {
        a: [],
        b: [],
      },
      rowCount: 0,
      columnNames: ['a', 'b'],
      dtypes: { a: 'f64', b: 'str' },
    };

    const result = sortFn(frame, 'a');

    expect(validateColumn).toHaveBeenCalledWith(frame, 'a');

    // Check that the result has empty arrays
    expect(result.columns.a).toEqual([]);
    expect(result.columns.b).toEqual([]);
  });

  test('should handle NaN and null values correctly', () => {
    const frame = {
      columns: {
        a: [3, null, NaN, 1],
        b: ['d', 'b', 'c', 'a'],
      },
      rowCount: 4,
      columnNames: ['a', 'b'],
      dtypes: { a: 'f64', b: 'str' },
    };

    const result = sortFn(frame, 'a');

    expect(validateColumn).toHaveBeenCalledWith(frame, 'a');

    // NaN and null values should be placed at the end
    expect(result.columns.a.slice(0, 2)).toEqual([1, 3]);

    // The last two values should be NaN and null (in any order)
    const lastTwo = result.columns.a.slice(2);
    expect(lastTwo.length).toBe(2);
    expect(lastTwo.some((v) => v === null)).toBe(true);
    expect(lastTwo.some((v) => Number.isNaN(v))).toBe(true);

    // Check that the corresponding b values are correctly sorted
    expect(result.columns.b.slice(0, 2)).toContain('a');
    expect(result.columns.b.slice(0, 2)).toContain('d');
  });
});

/**
 * Tests for the DataFrame.sort method
 */
describe('DataFrame.sort', () => {
  test('should sort DataFrame by specified column', () => {
    // Create a DataFrame with test data
    const df = DataFrame.create({
      a: [3, 1, 2],
      b: ['c', 'a', 'b'],
    });

    // Call the sort method on the DataFrame
    const sortedDf = df.sort('a');

    // Verify the result is a new DataFrame
    expect(sortedDf).toBeInstanceOf(DataFrame);
    expect(sortedDf).not.toBe(df); // Should be a new instance

    // Verify the data is sorted correctly
    const sortedArray = sortedDf.toArray();
    expect(sortedArray).toEqual([
      { a: 1, b: 'a' },
      { a: 2, b: 'b' },
      { a: 3, b: 'c' },
    ]);
  });

  test('should handle special values via DataFrame method', () => {
    // Create a DataFrame with test data including NaN
    const df = DataFrame.create({
      a: [3, NaN, 1, 2],
      b: ['d', 'c', 'a', 'b'],
    });

    // Call the sort method on the DataFrame
    const sortedDf = df.sort('a');

    // Verify the result is a new DataFrame
    expect(sortedDf).toBeInstanceOf(DataFrame);

    // Verify the data is sorted correctly
    const sortedArray = sortedDf.toArray();
    expect(sortedArray.length).toBe(4);

    // Verify that all original values are present
    const sortedBValues = sortedArray.map((row) => row.b).sort();
    expect(sortedBValues).toEqual(['a', 'b', 'c', 'd']);

    // Check that the array contains all the expected numeric values
    const numericValues = sortedArray
      .map((row) => row.a)
      .filter((v) => !Number.isNaN(v));
    expect(numericValues).toContain(1);
    expect(numericValues).toContain(2);
    expect(numericValues).toContain(3);

    // Verify that numeric values are sorted in ascending order
    const numericIndices = sortedArray
      .map((row, index) => ({ value: row.a, index }))
      .filter((item) => !Number.isNaN(item.value))
      .map((item) => item.index);

    for (let i = 1; i < numericIndices.length; i++) {
      const prevValue = sortedArray[numericIndices[i - 1]].a;
      const currValue = sortedArray[numericIndices[i]].a;
      expect(prevValue).toBeLessThanOrEqual(currValue);
    }
  });

  test('should throw error for non-existent column via DataFrame method', () => {
    // Create a DataFrame with test data
    const df = DataFrame.create({
      a: [1, 2, 3],
      b: ['a', 'b', 'c'],
    });

    // Call the sort method with non-existent column should throw
    expect(() => df.sort('nonexistent')).toThrow();
  });
});
