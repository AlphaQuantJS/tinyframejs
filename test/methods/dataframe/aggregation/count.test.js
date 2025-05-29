/**
 * Unit tests for the count method
 *
 * These tests verify the functionality of the count method, which counts
 * the number of values in a specified DataFrame column.
 *
 * @module test/methods/aggregation/count.test
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import { Series } from '../../../../src/core/dataframe/Series.js';
import { count } from '../../../../src/methods/dataframe/aggregation/count.js';

import {
  testWithBothStorageTypes,
  createDataFrameWithStorage,
} from '../../../utils/storageTestUtils.js';
/**
 * Tests for the DataFrame count function
 */

// Test data for use in all tests
const testData = [
  { value: 10, category: 'A', mixed: '20' },
  { value: 20, category: 'B', mixed: 30 },
  { value: 30, category: 'A', mixed: null },
  { value: 40, category: 'C', mixed: undefined },
  { value: 50, category: 'B', mixed: NaN },
];

describe('DataFrame count function', () => {
  // Test the count function directly
  test('should count all values in a column', () => {
    // Create a mock for validateColumn
    const validateColumn = vi.fn();

    // Create a series with data
    const series = new Series([1, 2, 3, 4, 5]);

    // Create a frame with the correct structure
    const df = {
      columns: ['testColumn'],
      col: () => series,
    };

    // Create a count function with the mock validateColumn
    const countFn = count({ validateColumn });

    // Call the count function
    const result = countFn(df, 'testColumn');

    // Check the result
    expect(validateColumn).toHaveBeenCalledWith(df, 'testColumn');
    expect(result).toBe(5);
  });

  test('should ignore null, undefined, and NaN values', () => {
    // Create a mock for validateColumn
    const validateColumn = vi.fn();

    // Create a series with data, including null, undefined and NaN
    const series = new Series([1, null, 3, undefined, 5, NaN]);

    // Create a frame with the correct structure
    const df = {
      columns: ['testColumn'],
      col: () => series,
    };

    // Create a count function with the mock validateColumn
    const countFn = count({ validateColumn });

    // Call the count function
    const result = countFn(df, 'testColumn');

    // Check the result
    expect(validateColumn).toHaveBeenCalledWith(df, 'testColumn');
    expect(result).toBe(3); // Only 1, 3 and 5 are valid values
  });

  test('should return 0 for an empty column', () => {
    // Create a mock for validateColumn
    const validateColumn = vi.fn();

    // Create an empty series
    const series = new Series([]);

    // Create a frame with the correct structure
    const df = {
      columns: ['testColumn'],
      col: () => series,
    };

    // Create a count function with the mock validateColumn
    const countFn = count({ validateColumn });

    // Call the count function
    const result = countFn(df, 'testColumn');

    // Check the result
    expect(validateColumn).toHaveBeenCalledWith(df, 'testColumn');
    expect(result).toBe(0);
  });

  test('should throw an error for non-existent column', () => {
    // Create a validator that throws an error for non-existent columns
    const validateColumn = (df, column) => {
      if (!df.columns.includes(column)) {
        throw new Error(`Column '${column}' not found`);
      }
    };

    // Create a frame with columns a, b, c
    const df = {
      columns: ['a', 'b', 'c'],
    };

    // Create a count function with our validator
    const countFn = count({ validateColumn });

    // Check that the function throws an error for non-existent columns
    expect(() => countFn(df, 'z')).toThrow('Column \'z\' not found');
  });
});

// Tests with real DataFrames
describe('DataFrame count with real DataFrames', () => {
  // Run tests with both storage types
  testWithBothStorageTypes((storageType) => {
    describe(`with ${storageType} storage`, () => {
      // Create a DataFrame with the specified storage type
      const df = createDataFrameWithStorage(DataFrame, testData, storageType);

      test('should count all non-null, non-undefined, non-NaN values in a column', () => {
        // Create a validator that does nothing
        const validateColumn = () => {};
        const countFn = count({ validateColumn });

        // Call the count function directly
        // All 5 values in the value column are valid
        expect(countFn(df, 'value')).toBe(5);
        // All 5 values in the category column are valid
        expect(countFn(df, 'category')).toBe(5);
        // Only 2 valid values ('20' and 30) in the mixed column, others are null, undefined and NaN
        expect(countFn(df, 'mixed')).toBe(2);
      });

      test('should handle mixed data types and ignore null, undefined, and NaN', () => {
        // Create a validator that does nothing
        const validateColumn = () => {};
        const countFn = count({ validateColumn });

        // In the mixed column there is a string '20', a number 30, null, undefined and NaN
        // The count function should only count valid values ('20' and 30)
        expect(countFn(df, 'mixed')).toBe(2);
      });

      test('throws on corrupted frame', () => {
        // Create a minimally valid frame but without required structure
        const broken = {};
        const validateColumn = () => {};
        const countFn = count({ validateColumn });

        expect(() => countFn(broken, 'a')).toThrow();
      });
    });
  });
});
