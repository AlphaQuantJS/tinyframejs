import { describe, it, expect, vi } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import { max } from '../../../../src/methods/dataframe/aggregation/max.js';

describe('max method', () => {
  describe('with standard storage', () => {
    // Test data for use in all tests
    const testData = [
      { value: 10, category: 'A', mixed: '20' },
      { value: 20, category: 'B', mixed: 30 },
      { value: 30, category: 'A', mixed: null },
      { value: 40, category: 'C', mixed: undefined },
      { value: 50, category: 'B', mixed: NaN },
    ];

    // Create DataFrame using fromRecords for proper column names
    const df = DataFrame.fromRecords(testData);

    it('should find the maximum value in a numeric column', () => {
      // Call max function directly with a mock validator
      const validateColumn = vi.fn();
      const maxFn = max({ validateColumn });
      const result = maxFn(df, 'value');

      // Check that the maximum is correct
      expect(result).toBe(50);
      expect(validateColumn).toHaveBeenCalledWith(df, 'value');
    });

    it('should handle mixed data types by converting to numbers', () => {
      // Call max function directly with a mock validator
      const validateColumn = vi.fn();
      const maxFn = max({ validateColumn });
      const result = maxFn(df, 'mixed');

      // Check that the maximum is correct (only valid numbers are considered)
      expect(result).toBe(30); // '20' -> 20, 30 -> 30, null/undefined/NaN are skipped
      expect(validateColumn).toHaveBeenCalledWith(df, 'mixed');
    });

    it('should return null for a column with no valid numeric values', () => {
      // Call max function directly with a mock validator
      const validateColumn = vi.fn();
      const maxFn = max({ validateColumn });
      const result = maxFn(df, 'category');

      // Check that the result is null (no numeric values in 'category' column)
      expect(result).toBe(null);
      expect(validateColumn).toHaveBeenCalledWith(df, 'category');
    });

    it('should throw an error for non-existent column', () => {
      // Create a validator that throws an error for non-existent column
      const validateColumn = (frame, column) => {
        if (!frame.columns.includes(column)) {
          throw new Error(`Column '${column}' not found`);
        }
      };

      // Call max function with validator
      const maxFn = max({ validateColumn });

      // Check that it throws an error for non-existent column
      expect(() => maxFn(df, 'nonexistent')).toThrow(
        "Column 'nonexistent' not found",
      );
    });

    it('should handle empty frames', () => {
      // Create an empty DataFrame using fromRecords
      const emptyDf = DataFrame.fromRecords([]);

      // Call max function directly with a validator that doesn't throw for empty frames
      const validateColumn = vi.fn(); // Mock validator that doesn't check anything
      const maxFn = max({ validateColumn });

      // Check that for an empty DataFrame the result is null
      expect(maxFn(emptyDf, 'value')).toBe(null);
      // For an empty DataFrame, the validator is not called, as we immediately return null
    });
  });
});
