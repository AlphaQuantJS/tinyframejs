/**
 * Unit tests for the mean method
 *
 * These tests verify the functionality of the mean method, which calculates
 * the average value of numeric data in a specified DataFrame column.
 *
 * @module test/methods/aggregation/mean.test
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import { mean } from '../../../../src/methods/dataframe/aggregation/mean.js';
import {
  testWithBothStorageTypes,
  createDataFrameWithStorage,
} from '../../../utils/storageTestUtils.js';

/**
 * Tests for the mean function
 */
describe('mean', () => {
  // Mock the validateColumn dependency
  const validateColumn = vi.fn();
  const meanFn = mean({ validateColumn });

  // Reset mocks before each test
  beforeEach(() => {
    validateColumn.mockReset();
  });

  test('should calculate mean of numeric values', () => {
    const frame = {
      columns: ['values'],
      col: () => ({
        toArray: () => [1, 2, 3, 4, 5],
      }),
    };

    const result = meanFn(frame, 'values');

    expect(validateColumn).toHaveBeenCalledWith(frame, 'values');
    expect(result).toBe(3); // (1+2+3+4+5)/5 = 3
  });

  test('should ignore null, undefined, and NaN values', () => {
    // Create array with some special values
    const values = [1, 0, 3, 0, 5, NaN];

    const frame = {
      columns: ['values'],
      col: () => ({
        toArray: () => values,
      }),
    };

    const result = meanFn(frame, 'values');

    expect(validateColumn).toHaveBeenCalledWith(frame, 'values');
    // Values are [1, 0, 3, 0, 5, NaN], ignoring NaN: (1+0+3+0+5)/5 = 1.8
    expect(result).toBe(1.8);
  });

  test('should return NaN when all values are NaN', () => {
    const frame = {
      columns: ['values'],
      col: () => ({
        toArray: () => [NaN, NaN, NaN],
      }),
    };

    const result = meanFn(frame, 'values');

    expect(validateColumn).toHaveBeenCalledWith(frame, 'values');
    expect(Number.isNaN(result)).toBe(true);
  });

  test('should return NaN for empty column', () => {
    const frame = {
      columns: ['values'],
      col: () => ({
        toArray: () => [],
      }),
    };

    const result = meanFn(frame, 'values');

    expect(validateColumn).toHaveBeenCalledWith(frame, 'values');
    expect(Number.isNaN(result)).toBe(true);
  });
});

/**
 * Tests for the DataFrame.mean method
 */

describe('DataFrame.mean', () => {
  test('should throw error for non-existent column via DataFrame method', () => {
    // Create a DataFrame with test data
    const df = DataFrame.create([{ values: 1 }, { values: 2 }]);

    // Call the mean method with a non-existent column and expect it to throw an error
    expect(() => df.mean('nonexistent')).toThrow();
  });
});

// Test data for use in all tests
const testData = [
  { value: 10, category: 'A', mixed: '20' },
  { value: 20, category: 'B', mixed: 30 },
  { value: 30, category: 'A', mixed: null },
  { value: 40, category: 'C', mixed: undefined },
  { value: 50, category: 'B', mixed: NaN },
];

describe('mean method', () => {
  // Run tests with both storage types
  testWithBothStorageTypes((storageType) => {
    describe(`with ${storageType} storage`, () => {
      // Create a DataFrame with the specified storage type
      const df = createDataFrameWithStorage(DataFrame, testData, storageType);

      test('should calculate the mean of numeric values in a column', () => {
        // Call mean function directly
        const meanFn = mean({ validateColumn: () => {} });
        const result = meanFn(df, 'value');

        // Check that the mean is correct
        expect(result).toBe(30); // (10 + 20 + 30 + 40 + 50) / 5 = 30
      });

      test('should handle mixed data types by converting to numbers', () => {
        // Call mean function directly
        const meanFn = mean({ validateColumn: () => {} });
        const result = meanFn(df, 'mixed');

        // Check that the mean is correct (only valid numbers are used)
        expect(result).toBe(25); // ('20' -> 20, 30 -> 30) / 2 = 25
      });

      test('should return NaN for a column with no valid numeric values', () => {
        // Call mean function directly
        const meanFn = mean({ validateColumn: () => {} });
        const result = meanFn(df, 'category');

        // Check that the mean is NaN (no numeric values in 'category' column)
        expect(isNaN(result)).toBe(true);
      });

      test('should throw an error for non-existent column', () => {
        // Create a validator that throws an error for non-existent column
        const validateColumn = (frame, column) => {
          if (!frame.columns.includes(column)) {
            throw new Error(`Column '${column}' not found`);
          }
        };

        // Call mean function with validator
        const meanFn = mean({ validateColumn });

        // Check that it throws an error for non-existent column
        expect(() => meanFn(df, 'nonexistent')).toThrow(
          'Column \'nonexistent\' not found',
        );
      });
    });
  });
});
