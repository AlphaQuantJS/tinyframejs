import { describe, it, expect } from 'vitest';
import { DataFrame } from '../../../src/core/DataFrame.js';
import { sum } from '../../../src/methods/aggregation/sum.js';

describe('sum method', () => {
  // Create test data
  const testData = [
    { value: 10, category: 'A', mixed: '20' },
    { value: 20, category: 'B', mixed: 30 },
    { value: 30, category: 'A', mixed: null },
    { value: 40, category: 'C', mixed: undefined },
    { value: 50, category: 'B', mixed: NaN },
  ];

  const df = DataFrame.create(testData);

  it('should calculate the sum of numeric values in a column', () => {
    // Call sum function directly
    const sumFn = sum({ validateColumn: () => {} });
    const result = sumFn(df._frame, 'value');

    // Check that the sum is correct
    expect(result).toBe(150); // 10 + 20 + 30 + 40 + 50 = 150
  });

  it('should handle mixed data types by converting to numbers', () => {
    // Call sum function directly
    const sumFn = sum({ validateColumn: () => {} });
    const result = sumFn(df._frame, 'mixed');

    // Check that the sum is correct (only valid numbers are summed)
    expect(result).toBe(50); // '20' -> 20, 30 -> 30, null/undefined/NaN are skipped
  });

  it('should return 0 for a column with no valid numeric values', () => {
    // Call sum function directly
    const sumFn = sum({ validateColumn: () => {} });
    const result = sumFn(df._frame, 'category');

    // Check that the sum is 0 (no numeric values in 'category' column)
    expect(result).toBe(0);
  });

  it('should throw an error for non-existent column', () => {
    // Create a validator that throws an error for non-existent column
    const validateColumn = (frame, column) => {
      if (!(column in frame.columns)) {
        throw new Error(`Column '${column}' not found`);
      }
    };

    // Call sum function with validator
    const sumFn = sum({ validateColumn });

    // Check that it throws an error for non-existent column
    expect(() => sumFn(df._frame, 'nonexistent')).toThrow(
      "Column 'nonexistent' not found",
    );
  });
});
