/**
 * Unit-tests for DataFrame.std
 *
 * ▸ Core library:  @tinyframejs/core
 *
 * ─────────────────────────────────────────────────────────
 */

import { describe, it, expect, beforeAll } from 'vitest';

import { DataFrame } from '@tinyframejs/core';

// ---------------------------------------------
// Test data
// ---------------------------------------------
let numericDf, mixedDf, nonNumericDf, emptyDf, singleValueDf, smallDatasetDf;
beforeAll(() => {
  // DataFrame with numeric values [10, 20, 30, 40, 50]
  numericDf = DataFrame.fromRecords(
    [10, 20, 30, 40, 50].map((v) => ({ value: v })),
  );

  // DataFrame with mixed data types [10, '20', 30, '40', 50]
  mixedDf = DataFrame.fromRecords(
    [10, '20', 30, '40', 50].map((v) => ({ value: v })),
  );

  // DataFrame with non-numeric values
  nonNumericDf = DataFrame.fromRecords(
    ['a', 'b', 'c', null, undefined].map((v) => ({ value: v })),
  );

  // Empty DataFrame
  emptyDf = DataFrame.fromRecords([]);

  // DataFrame with a single value
  singleValueDf = DataFrame.fromRecords([{ value: 42 }]);

  // DataFrame with a small dataset [10, 20, 30]
  smallDatasetDf = DataFrame.fromRecords(
    [10, 20, 30].map((v) => ({ value: v })),
  );
});

// ---------------------------------------------
// Main test battery
// ---------------------------------------------
describe('DataFrame.std()', () => {
  it('calculates standard deviation correctly', () => {
    // Expected std for [10, 20, 30, 40, 50] with n-1 denominator
    // = sqrt(sum((x - mean)^2) / (n - 1))
    // = sqrt(((10-30)^2 + (20-30)^2 + (30-30)^2 + (40-30)^2 + (50-30)^2) / 4)
    // = sqrt((400 + 100 + 0 + 100 + 400) / 4)
    // = sqrt(1000 / 4)
    // = sqrt(250)
    // ≈ 15.811
    const expected = Math.sqrt(1000 / 4);
    expect(numericDf.std('value')).toBeCloseTo(expected, 3);
  });

  it('handles mixed data types by converting to numbers', () => {
    const expected = Math.sqrt(1000 / 4);
    expect(mixedDf.std('value')).toBeCloseTo(expected, 3);
  });

  it('returns null for a column with no valid numeric values', () => {
    expect(nonNumericDf.std('value')).toBe(null);
  });

  it('returns null for an empty DataFrame', () => {
    expect(emptyDf.std('value')).toBe(null);
  });

  it('returns 0 for a DataFrame with a single value', () => {
    expect(singleValueDf.std('value')).toBe(0);
  });

  it('calculates standard deviation for another dataset', () => {
    // Expected std for [10, 20, 30] with n-1 denominator
    // = sqrt(sum((x - mean)^2) / (n - 1))
    // = sqrt(((10-20)^2 + (20-20)^2 + (30-20)^2) / 2)
    // = sqrt((100 + 0 + 100) / 2)
    // = sqrt(200 / 2)
    // = sqrt(100)
    // = 10
    const expected = Math.sqrt(200 / 2);
    expect(smallDatasetDf.std('value')).toBeCloseTo(expected, 3);
  });

  it('throws an error for non-existent column', () => {
    expect(() => numericDf.std('nope')).toThrow("Column 'nope' not found");
  });
});
