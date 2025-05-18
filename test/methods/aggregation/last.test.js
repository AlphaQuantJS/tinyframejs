import { describe, it, expect } from 'vitest';
import { DataFrame } from '../../../src/core/DataFrame.js';
import { last } from '../../../src/methods/aggregation/last.js';

describe('last method', () => {
  // Create test data
  const testData = [
    { value: 30, category: 'A', mixed: '20' },
    { value: 10, category: 'B', mixed: 30 },
    { value: 50, category: 'A', mixed: null },
    { value: 40, category: 'C', mixed: undefined },
    { value: 20, category: 'B', mixed: NaN },
  ];

  const df = DataFrame.create(testData);

  it('should return the last value in a column', () => {
    // Call last function directly
    const lastFn = last({ validateColumn: () => {} });
    const result = lastFn(df._frame, 'value');

    // Check that the last value is correct
    expect(result).toBe(20);
  });

  it('should return the last value even if it is null, undefined, or NaN', () => {
    // Call last function directly
    const lastFn = last({ validateColumn: () => {} });
    const result = lastFn(df._frame, 'mixed');

    // Check that the last value is correct
    expect(Number.isNaN(result)).toBe(true); // Last value is NaN
  });

  it('should throw an error for non-existent column', () => {
    // Create a validator that throws an error for non-existent column
    const validateColumn = (frame, column) => {
      if (!(column in frame.columns)) {
        throw new Error(`Column '${column}' not found`);
      }
    };

    // Call last function with validator
    const lastFn = last({ validateColumn });

    // Check that it throws an error for non-existent column
    expect(() => lastFn(df._frame, 'nonexistent')).toThrow(
      'Column \'nonexistent\' not found',
    );
  });

  it('should handle empty frames', () => {
    // Create an empty DataFrame
    const emptyDf = DataFrame.create([]);

    // Add an empty column
    emptyDf._frame.columns.value = [];

    // Call last function directly
    const lastFn = last({ validateColumn: () => {} });
    const result = lastFn(emptyDf._frame, 'value');

    // Check that the result is null for empty column
    expect(result).toBe(null);
  });
});
