import { describe, it, expect, vi } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import {
  variance,
  register,
} from '../../../../src/methods/dataframe/aggregation/variance.js';

import {
  testWithBothStorageTypes,
  createDataFrameWithStorage,
} from '../../../utils/storageTestUtils.js';

// Register the variance method in DataFrame for tests
register(DataFrame);

// Test data to be used in all tests
const testData = [
  { value: 10, category: 'A', mixed: '20' },
  { value: 20, category: 'B', mixed: 30 },
  { value: 30, category: 'A', mixed: null },
  { value: 40, category: 'C', mixed: undefined },
  { value: 50, category: 'B', mixed: NaN },
];

describe('variance method', () => {
  // Run tests with both storage types
  testWithBothStorageTypes((storageType) => {
    describe(`with ${storageType} storage`, () => {
      // Create DataFrame with the specified storage type
      const df = createDataFrameWithStorage(DataFrame, testData, storageType);

      // Testing the variance function directly
      it('should calculate the variance correctly', () => {
        // Create the variance function with a mock validator
        const validateColumn = vi.fn();
        const varianceFn = variance({ validateColumn });

        // Call the variance function
        const result = varianceFn(df, 'value');

        // Expected variance for [10, 20, 30, 40, 50]
        // Mean = 30
        // Sum of squared deviations =
        // (10-30)² + (20-30)² + (30-30)² + (40-30)² + (50-30)² = 400 + 100 + 0 + 100 + 400 = 1000
        // Variance (unbiased estimate) = 1000/4 = 250
        const expected = 250;

        // Check that the result is close to the expected value
        // (accounting for floating-point precision)
        expect(result).toBeCloseTo(expected, 10);
        expect(validateColumn).toHaveBeenCalledWith(df, 'value');
      });

      it('should handle mixed data types by converting to numbers', () => {
        // Create the variance function with a mock validator
        const validateColumn = vi.fn();
        const varianceFn = variance({ validateColumn });

        // Call the variance function
        const result = varianceFn(df, 'mixed');

        // Expected variance for ['20', 30] (only valid numeric values)
        // Mean = 25
        // Sum of squared deviations = (20-25)² + (30-25)² = 25 + 25 = 50
        // Variance (unbiased estimate) = 50/1 = 50
        const expected = 50;

        // Проверяем, что результат близок к ожидаемому значению
        expect(result).toBeCloseTo(expected, 10);
        expect(validateColumn).toHaveBeenCalledWith(df, 'mixed');
      });

      it('should return null for a column with no valid numeric values', () => {
        // Create the variance function with a mock validator
        const validateColumn = vi.fn();
        const varianceFn = variance({ validateColumn });

        // Call the variance function
        const result = varianceFn(df, 'category');

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

        // Create the variance function with the validator
        const varianceFn = variance({ validateColumn });

        // Check that the function throws an error for a non-existent column
        expect(() => varianceFn(df, 'nonexistent')).toThrow(
          'Column \'nonexistent\' not found',
        );
      });

      it('should return null for empty DataFrame', () => {
        // Create an empty DataFrame
        const emptyDf = createDataFrameWithStorage(DataFrame, [], storageType);

        // Create the variance function with a mock validator
        const validateColumn = vi.fn();
        const varianceFn = variance({ validateColumn });

        // Call the variance function
        const result = varianceFn(emptyDf, 'value');

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

        // Create the variance function with a mock validator
        const validateColumn = vi.fn();
        const varianceFn = variance({ validateColumn });

        // Call the variance function
        const result = varianceFn(singleValueDf, 'value');

        // Check that the result is 0 for a DataFrame with a single value
        expect(result).toBe(0);
        expect(validateColumn).toHaveBeenCalledWith(singleValueDf, 'value');
      });
      // Testing the DataFrame.variance method
      it('should be available as a DataFrame method', () => {
        // Check that the variance method is available in DataFrame
        expect(typeof df.variance).toBe('function');

        // Call the variance method and check the result
        const result = df.variance('value');
        const expected = 250; // As calculated above
        expect(result).toBeCloseTo(expected, 10);
      });

      it('should handle empty DataFrame gracefully', () => {
        // Create an empty DataFrame
        const emptyDf = createDataFrameWithStorage(DataFrame, [], storageType);

        // Check that the variance method returns null for an empty DataFrame
        expect(emptyDf.variance('value')).toBe(null);
      });

      it('should throw error for non-existent column', () => {
        // Check that the variance method throws an error for a non-existent column
        expect(() => df.variance('nonexistent')).toThrow(
          'Column \'nonexistent\' not found',
        );
      });
    });
  });
});
