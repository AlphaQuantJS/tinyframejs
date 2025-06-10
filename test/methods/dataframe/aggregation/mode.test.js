import { describe, it, expect, vi } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import {
  mode,
  register,
} from '../../../../src/methods/dataframe/aggregation/mode.js';

// Register the mode method in DataFrame for tests
register(DataFrame);

describe('mode method', () => {
  describe('with standard storage', () => {
    // Test data for modal value
    const modeTestData = [
      { value: 30, category: 'A', mixed: '20' },
      { value: 10, category: 'B', mixed: 30 },
      { value: 30, category: 'A', mixed: null },
      { value: 40, category: 'C', mixed: undefined },
      { value: 30, category: 'B', mixed: NaN },
      { value: 20, category: 'B', mixed: '20' },
    ];

    // Create DataFrame using fromRows for proper column names
    const df = DataFrame.fromRows(modeTestData);

    // Test the mode function directly
    it('should find the most frequent value in a column', () => {
      // Create the mode function with a mock validator
      const validateColumn = vi.fn();
      const modeFn = mode({ validateColumn });

      // Call the mode function
      const result = modeFn(df, 'value');

      // Check the result
      expect(result).toBe(30); // 30 appears 3 times, more often than any other value
      expect(validateColumn).toHaveBeenCalledWith(df, 'value');
    });

    it('should handle mixed data types by treating them as distinct', () => {
      // Create the mode function with a mock validator
      const validateColumn = vi.fn();
      const modeFn = mode({ validateColumn });

      // Call the mode function
      const result = modeFn(df, 'mixed');

      // Check the result (only valid values are considered)
      expect(result).toBe('20'); // '20' appears twice (string '20', not number 20)
      expect(validateColumn).toHaveBeenCalledWith(df, 'mixed');
    });

    it('should return null for a column with no valid values', () => {
      // Create data with only invalid values
      const invalidData = [
        { invalid: null },
        { invalid: undefined },
        { invalid: NaN },
      ];

      // Create DataFrame using fromRows
      const invalidDf = DataFrame.fromRows(invalidData);

      // Create the mode function with a mock validator
      const validateColumn = vi.fn();
      const modeFn = mode({ validateColumn });

      // Call the mode function
      const result = modeFn(invalidDf, 'invalid');

      // Check the result
      expect(result).toBe(null); // no valid values
      expect(validateColumn).toHaveBeenCalledWith(invalidDf, 'invalid');
    });

    it('should return one of the values if multiple values have the same highest frequency', () => {
      // Create data with multiple modal values
      const multiModeData = [
        { value: 10 },
        { value: 20 },
        { value: 10 },
        { value: 30 },
        { value: 20 },
        { value: 30 },
      ];

      // Create DataFrame using fromRows
      const multiModeDf = DataFrame.fromRows(multiModeData);

      // Create the mode function with a mock validator
      const validateColumn = vi.fn();
      const modeFn = mode({ validateColumn });

      // Call the mode function
      const result = modeFn(multiModeDf, 'value');

      // Check that one of the modal values is returned (all appear twice)
      expect([10, 20, 30]).toContain(result);
      expect(validateColumn).toHaveBeenCalledWith(multiModeDf, 'value');
    });

    it('should throw an error for non-existent column', () => {
      // Create a validator that throws an error
      const validateColumn = (df, column) => {
        if (!df.columns.includes(column)) {
          throw new Error(`Column '${column}' not found`);
        }
      };

      // Create the mode function with a validator
      const modeFn = mode({ validateColumn });

      // Check that the function throws an error for a non-existent column
      expect(() => modeFn(df, 'nonexistent')).toThrow(
        "Column 'nonexistent' not found",
      );
    });

    it('should return null for empty DataFrame', () => {
      // Create an empty DataFrame using fromRows
      const emptyDf = DataFrame.fromRows([]);

      // Create the mode function with a mock validator
      const validateColumn = vi.fn();
      const modeFn = mode({ validateColumn });

      // Call the mode function
      const result = modeFn(emptyDf, 'value');

      // Check the result
      expect(result).toBe(null);
      // For an empty DataFrame, the validator is not called, as we immediately return null
    });

    // Test the DataFrame.mode method
    it('should be available as a DataFrame method', () => {
      // Check that the mode method is available in DataFrame
      expect(typeof df.mode).toBe('function');

      // Call the mode method and check the result
      expect(df.mode('value')).toBe(30);
      expect(df.mode('category')).toBe('B'); // 'B' appears more often than 'A' or 'C'
    });

    it('should handle empty DataFrame gracefully', () => {
      // Create an empty DataFrame using fromRows
      const emptyDf = DataFrame.fromRows([]);

      // Check that the mode method returns null for an empty DataFrame
      expect(emptyDf.mode('value')).toBe(null);
    });

    it('should throw error for non-existent column', () => {
      // Check that the mode method throws an error for a non-existent column
      expect(() => df.mode('nonexistent')).toThrow(
        "Column 'nonexistent' not found",
      );
    });
  });
});
