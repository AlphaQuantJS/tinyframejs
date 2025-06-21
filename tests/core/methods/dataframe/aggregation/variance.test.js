/**
 * Unit-tests for DataFrame.variance
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
const testData = [
  { value: 10, category: 'A', mixed: '20' },
  { value: 20, category: 'B', mixed: 30 },
  { value: 30, category: 'A', mixed: null },
  { value: 40, category: 'C', mixed: undefined },
  { value: 50, category: 'B', mixed: NaN },
];

let df, emptyDf, singleValueDf;
beforeAll(() => {
  df = DataFrame.fromRecords(testData);
  emptyDf = DataFrame.fromRecords([]);
  singleValueDf = DataFrame.fromRecords([{ value: 42 }]);
});

// ---------------------------------------------
// Main test battery
// ---------------------------------------------
describe('DataFrame.variance()', () => {
  it('calculates the variance correctly', () => {
    // Expected variance for [10, 20, 30, 40, 50]
    // Mean = 30
    // Sum of squared deviations =
    // (10-30)² + (20-30)² + (30-30)² + (40-30)² + (50-30)² = 400 + 100 + 0 + 100 + 400 = 1000
    // Variance (unbiased estimate) = 1000/4 = 250
    expect(df.variance('value')).toBeCloseTo(250, 10);
  });

  it('handles mixed data types by converting to numbers', () => {
    // Expected variance for ['20', 30] (only valid numeric values)
    // Mean = 25
    // Sum of squared deviations = (20-25)² + (30-25)² = 25 + 25 = 50
    // Variance (unbiased estimate) = 50/1 = 50
    expect(df.variance('mixed')).toBeCloseTo(50, 10);
  });

  it('returns null for a column with no valid numeric values', () => {
    expect(df.variance('category')).toBe(null);
  });

  it('returns null for empty DataFrame', () => {
    expect(emptyDf.variance('value')).toBe(null);
  });

  it('returns 0 for a DataFrame with a single value', () => {
    expect(singleValueDf.variance('value')).toBe(0);
  });

  it('throws an error for non-existent column', () => {
    expect(() => df.variance('nope')).toThrow("Column 'nope' not found");
  });
});
