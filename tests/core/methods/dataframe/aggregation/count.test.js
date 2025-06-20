/**
 * Unit-tests for DataFrame.count
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
const sample = [
  { value: 10, category: 'A', mixed: '20' },
  { value: 20, category: 'B', mixed: 30 },
  { value: 30, category: 'A', mixed: null },
  { value: 40, category: 'C', mixed: undefined },
  { value: 50, category: 'B', mixed: NaN },
];

let df, emptyDf;
beforeAll(() => {
  df = DataFrame.fromRecords(sample);
  emptyDf = DataFrame.fromRecords([]);
});

// ---------------------------------------------
// Main test battery
// ---------------------------------------------
describe('DataFrame.count()', () => {
  it('counts all non-null, non-undefined, non-NaN values in a column', () => {
    // All 5 values in the value column are valid
    expect(df.count('value')).toBe(5);
    // All 5 values in the category column are valid
    expect(df.count('category')).toBe(5);
    // Only 2 valid values ('20' and 30) in the mixed column
    expect(df.count('mixed')).toBe(2);
  });

  it('throws an error for non-existent column', () => {
    expect(() => df.count('nope')).toThrow("Column 'nope' not found");
  });

  it('works with an empty DataFrame', () => {
    expect(emptyDf.count('value')).toBe(0);
  });
});
