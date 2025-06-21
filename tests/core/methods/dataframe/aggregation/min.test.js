/**
 * Unit-tests for DataFrame.min
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
describe('DataFrame.min()', () => {
  it('finds minimum value in numeric column', () => {
    expect(df.min('value')).toBe(10);
  });

  it('ignores non-numeric / NaN values (mixed column)', () => {
    // '20' → 20, 30 → 30  → min = 20
    expect(df.min('mixed')).toBe(20);
  });

  it('returns null if there are no numbers in the column', () => {
    expect(df.min('category')).toBe(null);
  });

  it('throws an error for non-existent column', () => {
    expect(() => df.min('nope')).toThrow("Column 'nope' not found");
  });

  it('works with empty DataFrame', () => {
    expect(emptyDf.min('value')).toBe(null);
  });
});
