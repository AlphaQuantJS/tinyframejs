/**
 * Unit-tests for DataFrame.max
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
describe('DataFrame.max()', () => {
  it('finds maximum value in numeric column', () => {
    expect(df.max('value')).toBe(50);
  });

  it('ignores non-numeric / NaN values (mixed column)', () => {
    // '20' → 20, 30 → 30  → max = 30
    expect(df.max('mixed')).toBe(30);
  });

  it('returns null if there are no numbers in the column', () => {
    expect(df.max('category')).toBe(null);
  });

  it('throws an error for non-existent column', () => {
    expect(() => df.max('nope')).toThrow("Column 'nope' not found");
  });

  it('works with empty DataFrame', () => {
    expect(emptyDf.max('value')).toBe(null);
  });
});
