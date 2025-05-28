import { describe, it, expect, vi } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import {
  std,
  register,
} from '../../../../src/methods/dataframe/aggregation/std.js';

import {
  testWithBothStorageTypes,
  createDataFrameWithStorage,
} from '../../../utils/storageTestUtils.js';

// Register the std method in DataFrame for tests
register(DataFrame);

// Test data to be used in all tests
const testData = [
  { value: 10, category: 'A', mixed: '20' },
  { value: 20, category: 'B', mixed: 30 },
  { value: 30, category: 'A', mixed: null },
  { value: 40, category: 'C', mixed: undefined },
  { value: 50, category: 'B', mixed: NaN },
];

describe('std method', () => {
  // Run tests with both storage types
  testWithBothStorageTypes((storageType) => {
    describe(`with ${storageType} storage`, () => {
      // Create DataFrame with the specified storage type
      const df = createDataFrameWithStorage(DataFrame, testData, storageType);

      // Testing the std function directly
      it('should calculate the standard deviation correctly', () => {
        // Create the std function with a mock validator
        const validateColumn = vi.fn();
        const stdFn = std({ validateColumn });

        // Call the std function
        const result = stdFn(df, 'value');

        // Expected standard deviation for [10, 20, 30, 40, 50]
        // Mean = 30
        // Sum of squared deviations =
        // (10-30)² + (20-30)² + (30-30)² + (40-30)² + (50-30)² = 400 + 100 + 0 + 100 + 400 = 1000
        // Variance (unbiased estimate) = 1000/4 = 250
        // Standard deviation = √250 ≈ 15.811
        const expected = Math.sqrt(250);

        // Check that the result is close to the expected value
        // (accounting for floating-point precision)
        expect(result).toBeCloseTo(expected, 10);
        expect(validateColumn).toHaveBeenCalledWith(df, 'value');
      });

      it('should handle mixed data types by converting to numbers', () => {
        // Create a std function with a mock validator
        const validateColumn = vi.fn();
        const stdFn = std({ validateColumn });

        // Call the std function
        const result = stdFn(df, 'mixed');

        // Expected standard deviation for ['20', 30] (only valid numeric values)
        // Mean = 25
        // Sum of squared deviations = (20-25)² + (30-25)² = 25 + 25 = 50
        // Variance (unbiased estimate) = 50/1 = 50
        // Standard deviation = √50 ≈ 7.071
        const expected = Math.sqrt(50);

        // Check that the result is close to the expected value
        expect(result).toBeCloseTo(expected, 10);
        expect(validateColumn).toHaveBeenCalledWith(df, 'mixed');
      });

      it('should return null for a column with no valid numeric values', () => {
        // Create the std function with a mock validator
        const validateColumn = vi.fn();
        const stdFn = std({ validateColumn });

        // Call the std function
        const result = stdFn(df, 'category');

        // Check that the result is null (no numeric values in the 'category' column)
        expect(result).toBe(null);
        expect(validateColumn).toHaveBeenCalledWith(df, 'category');
      });

      it('should throw an error for non-existent column', () => {
        // Create a validator that throws an error
        const validateColumn = (df, column) => {
          if (!df.columns.includes(column)) {
            throw new Error(`Column '${column}' not found`);
          }
        };

        // Create the std function with the validator
        const stdFn = std({ validateColumn });

        // Check that the function throws an error for a non-existent column
        expect(() => stdFn(df, 'nonexistent')).toThrow(
          'Column \'nonexistent\' not found',
        );
      });

      it('should return null for empty DataFrame', () => {
        // Create an empty DataFrame
        const emptyDf = createDataFrameWithStorage(DataFrame, [], storageType);

        // Create the std function with a mock validator
        const validateColumn = vi.fn();
        const stdFn = std({ validateColumn });

        // Call the std function
        const result = stdFn(emptyDf, 'value');

        // Check that the result is null for an empty DataFrame
        expect(result).toBe(null);
        // For an empty DataFrame, the validator is not called because we immediately return null
      });

      it('should return 0 for a DataFrame with a single value', () => {
        // Create a DataFrame with a single value
        const singleValueDf = createDataFrameWithStorage(
          DataFrame,
          [{ value: 42 }],
          storageType,
        );

        // Create the std function with a mock validator
        const validateColumn = vi.fn();
        const stdFn = std({ validateColumn });

        // Call the std function
        const result = stdFn(singleValueDf, 'value');

        // Check that the result is 0 for a DataFrame with a single value
        expect(result).toBe(0);
        expect(validateColumn).toHaveBeenCalledWith(singleValueDf, 'value');
      });

      // Testing the DataFrame.std method
      it('should be available as a DataFrame method', () => {
        // Check that the std method is available in DataFrame
        expect(typeof df.std).toBe('function');

        // Call the std method and check the result
        const result = df.std('value', { population: true });

        // Expected standard deviation for [10, 20, 30, 40, 50] with population: true
        // Mean = 30
        // Sum of squared deviations =
        // (10-30)² + (20-30)² + (30-30)² + (40-30)² + (50-30)² = 400 + 100 + 0 + 100 + 400 = 1000
        // Variance (biased estimate) = 1000/5 = 200
        // Standard deviation = √200 ≈ 14.142
        const expected = Math.sqrt(200);
        expect(result).toBeCloseTo(expected, 5);
      });

      it('should handle empty DataFrame gracefully', () => {
        // Create an empty DataFrame
        const emptyDf = createDataFrameWithStorage(DataFrame, [], storageType);

        // Check that the std method returns null for an empty DataFrame
        expect(emptyDf.std('value')).toBe(null);
      });

      it('should throw error for non-existent column', () => {
        // Check that the std method throws an error for a non-existent column
        expect(() => df.std('nonexistent')).toThrow(
          'Column \'nonexistent\' not found in DataFrame',
        );
      });
    });
  });
});
