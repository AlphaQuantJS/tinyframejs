import { describe, it, expect, vi } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import {
  last,
  register,
} from '../../../../src/methods/dataframe/aggregation/last.js';

// Register the last method in DataFrame for tests
register(DataFrame);

// Test data to be used in all tests
const testData = [
  { value: 10, category: 'A', mixed: '20' },
  { value: 20, category: 'B', mixed: 30 },
  { value: 30, category: 'A', mixed: null },
  { value: 40, category: 'C', mixed: undefined },
  { value: 50, category: 'B', mixed: NaN },
];

describe('last method', () => {
  describe('with standard storage', () => {
    // Create DataFrame directly
    const df = DataFrame.fromRows(testData);

    // Testing the last function directly
    it('should return the last value in a column', () => {
      // Create last function with a mock validator
      const validateColumn = vi.fn();
      const lastFn = last({ validateColumn });

      // Call the last function
      const result = lastFn(df, 'value');

      // Check the result
      expect(result).toBe(50);
      expect(validateColumn).toHaveBeenCalledWith(df, 'value');
    });

    it('should return the last value even if it is null, undefined, or NaN', () => {
      // Create last function with a mock validator
      const validateColumn = vi.fn();
      const lastFn = last({ validateColumn });

      // Call the last function
      const result = lastFn(df, 'mixed');

      // Check the result
      expect(Number.isNaN(result)).toBe(true); // The last value is NaN
      expect(validateColumn).toHaveBeenCalledWith(df, 'mixed');
    });

    it('should throw an error for non-existent column', () => {
      // Create a validator that throws an error
      const validateColumn = (df, column) => {
        if (!df.columns.includes(column)) {
          throw new Error(`Column '${column}' not found`);
        }
      };

      // Create a last function with our validator
      const lastFn = last({ validateColumn });

      // Check that the function throws an error for a non-existent column
      expect(() => lastFn(df, 'nonexistent')).toThrow(
        "Column 'nonexistent' not found",
      );
    });

    it('should return undefined for empty DataFrame', () => {
      // Create an empty DataFrame
      const emptyDf = DataFrame.fromRows([]);

      // Create last function with a mock validator
      const validateColumn = vi.fn();
      const lastFn = last({ validateColumn });

      // Call the last function
      const result = lastFn(emptyDf, 'value');

      // Check the result
      expect(result).toBeUndefined();
      // For an empty DataFrame, the validator is not called because we immediately return undefined
    });
    // Testing the DataFrame.last method
    it('should be available as a DataFrame method', () => {
      // Check that the last method is available in DataFrame
      expect(typeof df.last).toBe('function');

      // Call the last method and check the result
      expect(df.last('value')).toBe(50);
      expect(df.last('category')).toBe('B');
    });

    it('should handle empty DataFrame gracefully', () => {
      // Create an empty DataFrame
      const emptyDf = DataFrame.fromRows([]);

      // Check that the last method returns undefined for an empty DataFrame
      expect(emptyDf.last('value')).toBeUndefined();
    });

    it('should throw error for non-existent column', () => {
      // Check that the last method throws an error for a non-existent column
      expect(() => df.last('nonexistent')).toThrow(
        "Column 'nonexistent' not found",
      );
    });
  });
});
