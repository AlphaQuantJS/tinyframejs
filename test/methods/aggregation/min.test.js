import { describe, it, expect } from 'vitest';
import { DataFrame } from '../../../src/core/DataFrame.js';
import { min } from '../../../src/methods/aggregation/min.js';

describe('min method', () => {
  // Create test data
  const testData = [
    { value: 30, category: 'A', mixed: '20' },
    { value: 10, category: 'B', mixed: 30 },
    { value: 50, category: 'A', mixed: null },
    { value: 40, category: 'C', mixed: undefined },
    { value: 20, category: 'B', mixed: NaN },
  ];

  const df = DataFrame.create(testData);

  it('should find the minimum value in a numeric column', () => {
    // Call min function directly
    const minFn = min({ validateColumn: () => {} });
    const result = minFn(df._frame, 'value');

    // Check that the minimum is correct
    expect(result).toBe(10);
  });

  it('should handle mixed data types by converting to numbers', () => {
    // Call min function directly
    const minFn = min({ validateColumn: () => {} });
    const result = minFn(df._frame, 'mixed');

    // Check that the minimum is correct (only valid numbers are considered)
    expect(result).toBe(20); // '20' -> 20, 30 -> 30, null/undefined/NaN are skipped
  });

  it('should return null for a column with no valid numeric values', () => {
    // Call min function directly
    const minFn = min({ validateColumn: () => {} });
    const result = minFn(df._frame, 'category');

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

    // Call min function with validator
    const minFn = min({ validateColumn });

    // Check that it throws an error for non-existent column
    expect(() => minFn(df._frame, 'nonexistent')).toThrow(
      "Column 'nonexistent' not found",
    );
  });

  it('should handle empty frames', () => {
    // Create an empty DataFrame
    const emptyDf = DataFrame.create([]);

    // Add an empty column
    emptyDf._frame.columns.value = [];

    // Call min function directly
    const minFn = min({ validateColumn: () => {} });
    const result = minFn(emptyDf._frame, 'value');

    // Check that the result is null for empty column
    expect(result).toBe(null);
  });
});
