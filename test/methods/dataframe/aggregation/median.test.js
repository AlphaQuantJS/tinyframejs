import { describe, it, expect, vi } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import { median } from '../../../../src/methods/dataframe/aggregation/median.js';

describe('median method', () => {
  describe('with standard storage', () => {
    // Test data for odd number of elements (5 elements)
    const testDataOdd = [
      { value: 10, category: 'A', mixed: '20' },
      { value: 20, category: 'B', mixed: 30 },
      { value: 30, category: 'A', mixed: null },
      { value: 40, category: 'C', mixed: undefined },
      { value: 50, category: 'B', mixed: NaN },
    ];

    // Test data for even number of elements (6 elements)
    const testDataEven = [
      { value: 10, category: 'A', mixed: '20' },
      { value: 20, category: 'B', mixed: 30 },
      { value: 30, category: 'A', mixed: null },
      { value: 40, category: 'C', mixed: undefined },
      { value: 50, category: 'B', mixed: NaN },
      { value: 60, category: 'D', mixed: 40 },
    ];

    // Create DataFrames using fromRows for proper column names
    const dfOdd = DataFrame.fromRows(testDataOdd);
    const dfEven = DataFrame.fromRows(testDataEven);

    it('should calculate the median for odd number of elements', () => {
      // Call median function directly with a mock validator
      const validateColumn = vi.fn();
      const medianFn = median({ validateColumn });
      const result = medianFn(dfOdd, 'value');

      // Check that the median is correct
      expect(result).toBe(30); // Sorted: [10, 20, 30, 40, 50] -> median is 30
      expect(validateColumn).toHaveBeenCalledWith(dfOdd, 'value');
    });

    it('should calculate the median for even number of elements', () => {
      // Call median function directly with a mock validator
      const validateColumn = vi.fn();
      const medianFn = median({ validateColumn });
      const result = medianFn(dfEven, 'value');

      // Check that the median is correct
      expect(result).toBe(35); // Sorted: [10, 20, 30, 40, 50, 60] -> median is (30+40)/2 = 35
      expect(validateColumn).toHaveBeenCalledWith(dfEven, 'value');
    });

    it('should handle mixed data types by converting to numbers', () => {
      // Call median function directly with a mock validator
      const validateColumn = vi.fn();
      const medianFn = median({ validateColumn });
      const result = medianFn(dfEven, 'mixed');

      // Check that the median is correct (only valid numbers are considered)
      expect(result).toBe(30); // Valid values: [20, 30, 40] -> median is 30
      expect(validateColumn).toHaveBeenCalledWith(dfEven, 'mixed');
    });

    it('should return null for a column with no valid numeric values', () => {
      // Call median function directly with a mock validator
      const validateColumn = vi.fn();
      const medianFn = median({ validateColumn });
      const result = medianFn(dfOdd, 'category');

      // Check that the result is null (no numeric values in 'category' column)
      expect(result).toBe(null);
      expect(validateColumn).toHaveBeenCalledWith(dfOdd, 'category');
    });

    it('should throw an error for non-existent column', () => {
      // Create a validator that throws an error for non-existent column
      const validateColumn = (frame, column) => {
        if (!frame.columns.includes(column)) {
          throw new Error(`Column '${column}' not found`);
        }
      };

      // Call median function with validator
      const medianFn = median({ validateColumn });

      // Check that it throws an error for non-existent column
      expect(() => medianFn(dfOdd, 'nonexistent')).toThrow(
        "Column 'nonexistent' not found",
      );
    });

    it('should handle empty frames', () => {
      // Create an empty DataFrame using fromRows
      const emptyDf = DataFrame.fromRows([]);

      // Call median function directly with a validator that doesn't throw for empty frames
      const validateColumn = vi.fn(); // Mock validator that doesn't check anything
      const medianFn = median({ validateColumn });

      // Check that for an empty DataFrame the result is null
      expect(medianFn(emptyDf, 'value')).toBe(null);
      // For an empty DataFrame, the validator is not called, as we immediately return null
    });
  });
});
