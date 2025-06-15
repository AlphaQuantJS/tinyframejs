import { describe, it, expect, vi, beforeAll } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import {
  std,
  register,
} from '../../../../src/methods/dataframe/aggregation/std.js';

// Register the std method on DataFrame prototype
beforeAll(() => register(DataFrame));

describe('std method', () => {
  describe('with standard storage', () => {
    it('should calculate the standard deviation correctly', () => {
      // Create a DataFrame with numeric values
      const numericValues = [10, 20, 30, 40, 50];
      const numericDf = DataFrame.fromRecords(
        numericValues.map((v) => ({ value: v })),
      );

      // Create a mock validator function
      const validateColumn = vi.fn();
      const stdFn = std({ validateColumn });

      // Calculate the standard deviation
      const result = stdFn(numericDf, 'value');

      // Expected standard deviation for [10, 20, 30, 40, 50] with n-1 denominator
      // = sqrt(sum((x - mean)^2) / (n - 1))
      // = sqrt(((10-30)^2 + (20-30)^2 + (30-30)^2 + (40-30)^2 + (50-30)^2) / 4)
      // = sqrt((400 + 100 + 0 + 100 + 400) / 4)
      // = sqrt(1000 / 4)
      // = sqrt(250)
      // ≈ 15.811
      const expected = Math.sqrt(1000 / 4);

      // Check that the result is close to the expected value
      // (accounting for floating-point precision)
      expect(result).toBeCloseTo(expected, 3);
      expect(validateColumn).toHaveBeenCalledWith(numericDf, 'value');
    });

    it('should handle mixed data types by converting to numbers', () => {
      // Create a DataFrame with mixed data types
      const mixedValues = [10, '20', 30, '40', 50];
      const mixedDf = DataFrame.fromRecords(
        mixedValues.map((v) => ({ value: v })),
      );

      // Create a mock validator function
      const validateColumn = vi.fn();
      const stdFn = std({ validateColumn });

      // Calculate the standard deviation
      const result = stdFn(mixedDf, 'value');

      // Expected standard deviation for [10, 20, 30, 40, 50] with n-1 denominator
      const expected = Math.sqrt(1000 / 4);

      // Check that the result is close to the expected value
      expect(result).toBeCloseTo(expected, 3);
      expect(validateColumn).toHaveBeenCalledWith(mixedDf, 'value');
    });

    it('should return null for a column with no valid numeric values', () => {
      // Create a DataFrame with non-numeric values
      const nonNumericValues = ['a', 'b', 'c', null, undefined];
      const nonNumericDf = DataFrame.fromRecords(
        nonNumericValues.map((v) => ({ value: v })),
      );

      // Create a mock validator function
      const validateColumn = vi.fn();
      const stdFn = std({ validateColumn });

      // Calculate the standard deviation
      const result = stdFn(nonNumericDf, 'value');

      // Check that the result is null for a column with no valid numeric values
      expect(result).toBe(null);
      expect(validateColumn).toHaveBeenCalledWith(nonNumericDf, 'value');
    });

    it('should return null for an empty DataFrame', () => {
      // Create an empty DataFrame
      const emptyDf = DataFrame.fromRecords([]);

      // Create a mock validator function
      const validateColumn = vi.fn();
      const stdFn = std({ validateColumn });

      // Calculate the standard deviation
      const result = stdFn(emptyDf, 'value');

      // Check that the result is null for an empty DataFrame
      expect(result).toBe(null);
      // Validator should not be called for empty DataFrame
      expect(validateColumn).not.toHaveBeenCalled();
    });

    it('should return 0 for a DataFrame with a single value', () => {
      // Create a DataFrame with a single value
      const singleValue = [42];
      const singleValueDf = DataFrame.fromRecords(
        singleValue.map((v) => ({ value: v })),
      );

      // Create a mock validator function
      const validateColumn = vi.fn();
      const stdFn = std({ validateColumn });

      // Calculate the standard deviation
      const result = stdFn(singleValueDf, 'value');

      // Check that the result is 0 for a DataFrame with a single value
      expect(result).toBe(0);
      expect(validateColumn).toHaveBeenCalledWith(singleValueDf, 'value');
    });

    it('should be available as a DataFrame method', () => {
      // Create a DataFrame with numeric values
      const values = [10, 20, 30];
      const df = DataFrame.fromRecords(values.map((v) => ({ value: v })));

      // Calculate the standard deviation using the DataFrame method
      const result = df.std('value');

      // Expected standard deviation for [10, 20, 30] with n-1 denominator
      // = sqrt(sum((x - mean)^2) / (n - 1))
      // = sqrt(((10-20)^2 + (20-20)^2 + (30-20)^2) / 2)
      // = sqrt((100 + 0 + 100) / 2)
      // = sqrt(200 / 2)
      // = sqrt(100)
      // = 10
      const expected = Math.sqrt(200 / 2);

      // Standard deviation = √200 ≈ 14.142
      expect(result).toBeCloseTo(expected, 3);
    });

    it('should handle empty DataFrame gracefully', () => {
      // Create an empty DataFrame
      const emptyDf = DataFrame.fromRecords([]);

      // Calculate the standard deviation using the DataFrame method
      const result = emptyDf.std('value');

      // Check that the result is null for an empty DataFrame
      expect(result).toBe(null);
    });

    it('should throw an error for a non-existent column', () => {
      // Create a DataFrame
      const df = DataFrame.fromRecords([{ value: 10 }, { value: 20 }]);

      // Check that an error is thrown for a non-existent column
      expect(() => df.std('non_existent')).toThrow(
        "Column 'non_existent' not found in DataFrame",
      );
    });
  });
});
