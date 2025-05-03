import { describe, it, expect } from 'vitest';
import { DataFrame } from '../../../src/core/DataFrame.js';
import { max } from '../../../src/methods/aggregation/max.js';

describe('max method', () => {
  // Create test data
  const testData = [
    { value: 30, category: 'A', mixed: '20' },
    { value: 10, category: 'B', mixed: 30 },
    { value: 50, category: 'A', mixed: null },
    { value: 40, category: 'C', mixed: undefined },
    { value: 20, category: 'B', mixed: NaN },
  ];

  const df = DataFrame.create(testData);

  it('should find the maximum value in a numeric column', () => {
    // Call max function directly
    const maxFn = max({ validateColumn: () => {} });
    const result = maxFn(df._frame, 'value');

    // Check that the maximum is correct
    expect(result).toBe(50);
  });

  it('should handle mixed data types by converting to numbers', () => {
    // Call max function directly
    const maxFn = max({ validateColumn: () => {} });
    const result = maxFn(df._frame, 'mixed');

    // Check that the maximum is correct (only valid numbers are considered)
    expect(result).toBe(30); // '20' -> 20, 30 -> 30, null/undefined/NaN are skipped
  });

  it('should return null for a column with no valid numeric values', () => {
    // Call max function directly
    const maxFn = max({ validateColumn: () => {} });
    const result = maxFn(df._frame, 'category');

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

    // Call max function with validator
    const maxFn = max({ validateColumn });

    // Check that it throws an error for non-existent column
    expect(() => maxFn(df._frame, 'nonexistent')).toThrow(
      "Column 'nonexistent' not found",
    );
  });

  it('should handle empty frames', () => {
    // Create an empty DataFrame
    const emptyDf = DataFrame.create([]);

    // Add an empty column
    emptyDf._frame.columns.value = [];

    // Call max function directly
    const maxFn = max({ validateColumn: () => {} });
    const result = maxFn(emptyDf._frame, 'value');

    // Check that the result is null for empty column
    expect(result).toBe(null);
  });
});
