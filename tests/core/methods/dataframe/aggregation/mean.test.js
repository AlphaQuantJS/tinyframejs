/**
 * Unit-tests for DataFrame.mean
 *
 * ▸ Core library:  @tinyframejs/core
 * ▸ Registration of aggregations occurs as a side effect:
 *       import '@tinyframejs/core/registerAggregation'
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
describe('DataFrame.mean()', () => {
  it('computes arithmetic mean for numeric column', () => {
    // (10+20+30+40+50) / 5 = 30
    expect(df.mean('value')).toBe(30);
  });

  it('ignores non-numeric / NaN values (mixed column)', () => {
    // '20' → 20, 30 → 30  → mean = 25
    expect(df.mean('mixed')).toBe(25);
  });

  it('returns NaN if there are no numbers in the column', () => {
    expect(Number.isNaN(df.mean('category'))).toBe(true);
  });

  it('throws an error for non-existent column', () => {
    expect(() => df.mean('nope')).toThrow("Column 'nope' not found");
  });

  it('works with empty DataFrame', () => {
    expect(Number.isNaN(emptyDf.mean('value'))).toBe(true);
  });
});
