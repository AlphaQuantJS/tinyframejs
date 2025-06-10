/**
 * Unit tests for the first method
 *
 * These tests verify the functionality of the first method, which returns
 * the first value in a specified DataFrame column.
 *
 * @module test/methods/aggregation/first.test
 */

import {
  first,
  register,
} from '../../../../src/methods/dataframe/aggregation/first.js';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import { describe, it, expect, vi } from 'vitest';

// Register the first method in DataFrame for tests
register(DataFrame);

describe('first method', () => {
  describe('with standard storage', () => {
    // Test data for use in all tests
    const testData = [
      { value: 10, category: 'A', mixed: '20' },
      { value: 20, category: 'B', mixed: 30 },
      { value: 30, category: 'A', mixed: null },
      { value: 40, category: 'C', mixed: undefined },
      { value: 50, category: 'B', mixed: NaN },
    ];

    // Create DataFrame using fromRows for proper column names
    const df = DataFrame.fromRows(testData);

    // Test the first function directly
    it('should return the first value in a column', () => {
      // Create a first function with a mock validator
      const validateColumn = vi.fn();
      const firstFn = first({ validateColumn });

      // Call the first function
      const result = firstFn(df, 'value');

      // Check the result
      expect(result).toBe(10);
      expect(validateColumn).toHaveBeenCalledWith(df, 'value');
    });

    it('should handle special values (null, undefined, NaN)', () => {
      // Create a first function with a mock validator
      const validateColumn = vi.fn();
      const firstFn = first({ validateColumn });

      // Check that the first values are returned correctly
      expect(firstFn(df, 'mixed')).toBe('20');
      expect(validateColumn).toHaveBeenCalledWith(df, 'mixed');
    });

    it('should return undefined for empty DataFrame', () => {
      // Create an empty DataFrame using fromRows
      const emptyDf = DataFrame.fromRows([]);

      // Create a first function with a mock validator
      const validateColumn = vi.fn();
      const firstFn = first({ validateColumn });

      // Call the first function
      const result = firstFn(emptyDf, 'value');

      // Check the result
      expect(result).toBeUndefined();
      // For an empty DataFrame, the validator is not called, as we immediately return undefined
    });

    it('should throw error for non-existent column', () => {
      // Create a validator that throws an error
      const validateColumn = (df, column) => {
        if (!df.columns.includes(column)) {
          throw new Error(`Column '${column}' not found`);
        }
      };

      // Create a first function with our validator
      const firstFn = first({ validateColumn });

      // Check that the function throws an error for non-existent columns
      expect(() => firstFn(df, 'nonexistent')).toThrow(
        "Column 'nonexistent' not found",
      );
    });

    // Test the DataFrame.first method
    it('should be available as a DataFrame method', () => {
      // Check that the first method is available in DataFrame
      expect(typeof df.first).toBe('function');

      // Call the first method and check the result
      expect(df.first('value')).toBe(10);
      expect(df.first('category')).toBe('A');
    });

    it('should handle empty DataFrame gracefully', () => {
      // Create an empty DataFrame using fromRows
      const emptyDf = DataFrame.fromRows([]);

      // Check that the first method returns undefined for an empty DataFrame
      expect(emptyDf.first('value')).toBeUndefined();
    });

    it('should throw error for non-existent column', () => {
      // Check that the first method throws an error for non-existent columns
      expect(() => df.first('nonexistent')).toThrow(
        "Column 'nonexistent' not found",
      );
    });
  });
});
