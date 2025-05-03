import { describe, it, expect } from 'vitest';
import { DataFrame } from '../../../src/core/DataFrame.js';
import { median } from '../../../src/methods/aggregation/median.js';

describe('median method', () => {
  // Create test data for odd number of elements
  const testDataOdd = [
    { value: 30, category: 'A', mixed: '20' },
    { value: 10, category: 'B', mixed: 30 },
    { value: 50, category: 'A', mixed: null },
    { value: 40, category: 'C', mixed: undefined },
    { value: 20, category: 'B', mixed: NaN },
  ];

  // Create test data for even number of elements
  const testDataEven = [
    { value: 30, category: 'A', mixed: '20' },
    { value: 10, category: 'B', mixed: 30 },
    { value: 50, category: 'A', mixed: null },
    { value: 40, category: 'C', mixed: undefined },
    { value: 20, category: 'B', mixed: NaN },
    { value: 60, category: 'D', mixed: 40 },
  ];

  const dfOdd = DataFrame.create(testDataOdd);
  const dfEven = DataFrame.create(testDataEven);

  it('should calculate the median for odd number of elements', () => {
    // Call median function directly
    const medianFn = median({ validateColumn: () => {} });
    const result = medianFn(dfOdd._frame, 'value');

    // Check that the median is correct
    expect(result).toBe(30); // Sorted: [10, 20, 30, 40, 50] -> median is 30
  });

  it('should calculate the median for even number of elements', () => {
    // Call median function directly
    const medianFn = median({ validateColumn: () => {} });
    const result = medianFn(dfEven._frame, 'value');

    // Check that the median is correct
    expect(result).toBe(35); // Sorted: [10, 20, 30, 40, 50, 60] -> median is (30+40)/2 = 35
  });

  it('should handle mixed data types by converting to numbers', () => {
    // Call median function directly
    const medianFn = median({ validateColumn: () => {} });
    const result = medianFn(dfEven._frame, 'mixed');

    // Check that the median is correct (only valid numbers are considered)
    expect(result).toBe(30); // Valid values: [20, 30, 40] -> median is 30
  });

  it('should return null for a column with no valid numeric values', () => {
    // Call median function directly
    const medianFn = median({ validateColumn: () => {} });
    const result = medianFn(dfOdd._frame, 'category');

    // Check that the result is null (no numeric values in 'category' column)
    expect(result).toBe(null);
  });

  it('should throw an error for non-existent column', () => {
    // Create a validator that throws an error for non-existent column
    const validateColumn = (frame, column) => {
      if (!(column in frame.columns)) {
        throw new Error(`Column '${column}' not found`);
      }
    };

    // Call median function with validator
    const medianFn = median({ validateColumn });

    // Check that it throws an error for non-existent column
    expect(() => medianFn(dfOdd._frame, 'nonexistent')).toThrow(
      "Column 'nonexistent' not found",
    );
  });

  it('should handle empty frames', () => {
    // Create an empty DataFrame
    const emptyDf = DataFrame.create([]);

    // Add an empty column
    emptyDf._frame.columns.value = [];

    // Call median function directly
    const medianFn = median({ validateColumn: () => {} });
    const result = medianFn(emptyDf._frame, 'value');

    // Check that the result is null for empty column
    expect(result).toBe(null);
  });
});
