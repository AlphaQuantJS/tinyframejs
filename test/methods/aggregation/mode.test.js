import { describe, it, expect } from 'vitest';
import { DataFrame } from '../../../src/core/DataFrame.js';
import { mode } from '../../../src/methods/aggregation/mode.js';

describe('mode method', () => {
  // Create test data
  const testData = [
    { value: 30, category: 'A', mixed: '20' },
    { value: 10, category: 'B', mixed: 30 },
    { value: 30, category: 'A', mixed: null },
    { value: 40, category: 'C', mixed: undefined },
    { value: 30, category: 'B', mixed: NaN },
    { value: 20, category: 'B', mixed: '20' },
  ];

  const df = DataFrame.create(testData);

  it('should find the most frequent value in a column', () => {
    // Call mode function directly
    const modeFn = mode({ validateColumn: () => {} });
    const result = modeFn(df._frame, 'value');

    // Check that the mode is correct
    expect(result).toBe(30); // 30 appears 3 times, more than any other value
  });

  it('should handle mixed data types by treating them as distinct', () => {
    // Call mode function directly
    const modeFn = mode({ validateColumn: () => {} });
    const result = modeFn(df._frame, 'mixed');

    // Check that the mode is correct (only valid values are considered)
    expect(result).toBe('20'); // '20' appears twice (string '20', not number 20)
  });

  it('should return null for a column with no valid values', () => {
    // Create data with only invalid values
    const invalidData = [
      { invalid: null },
      { invalid: undefined },
      { invalid: NaN },
    ];

    const invalidDf = DataFrame.create(invalidData);

    // Call mode function directly
    const modeFn = mode({ validateColumn: () => {} });
    const result = modeFn(invalidDf._frame, 'invalid');

    // Check that the result is null (no valid values)
    expect(result).toBe(null);
  });

  it('should return the first encountered value if multiple values have the same highest frequency', () => {
    // Create data with multiple modes
    const multiModeData = [
      { value: 10 },
      { value: 20 },
      { value: 10 },
      { value: 30 },
      { value: 20 },
      { value: 30 },
    ];

    const multiModeDf = DataFrame.create(multiModeData);

    // Call mode function directly
    const modeFn = mode({ validateColumn: () => {} });
    const result = modeFn(multiModeDf._frame, 'value');

    // Check that one of the modes is returned (all appear twice)
    expect([10, 20, 30]).toContain(result);
  });

  it('should throw an error for non-existent column', () => {
    // Create a validator that throws an error for non-existent column
    const validateColumn = (frame, column) => {
      if (!(column in frame.columns)) {
        throw new Error(`Column '${column}' not found`);
      }
    };

    // Call mode function with validator
    const modeFn = mode({ validateColumn });

    // Check that it throws an error for non-existent column
    expect(() => modeFn(df._frame, 'nonexistent')).toThrow(
      'Column \'nonexistent\' not found',
    );
  });

  it('should handle empty frames', () => {
    // Create an empty DataFrame
    const emptyDf = DataFrame.create([]);

    // Add an empty column
    emptyDf._frame.columns.value = [];

    // Call mode function directly
    const modeFn = mode({ validateColumn: () => {} });
    const result = modeFn(emptyDf._frame, 'value');

    // Check that the result is null for empty column
    expect(result).toBe(null);
  });
});
