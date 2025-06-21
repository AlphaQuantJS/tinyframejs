/**
 * Unit-tests for DataFrame.last
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

let df, emptyDf, nullDf, undefinedDf, nanDf;
beforeAll(() => {
  df = DataFrame.fromRecords(sample);
  emptyDf = DataFrame.fromRecords([]);
  nullDf = DataFrame.fromRecords([
    { value: 10 },
    { value: 20 },
    { value: null },
  ]);
  undefinedDf = DataFrame.fromRecords([
    { value: 10 },
    { value: 20 },
    { value: undefined },
  ]);
  nanDf = DataFrame.fromRecords([{ value: 10 }, { value: 20 }, { value: NaN }]);
});

// ---------------------------------------------
// Main test battery
// ---------------------------------------------
describe('DataFrame.last()', () => {
  it('returns the last value in a column', () => {
    expect(df.last('value')).toBe(50);
    expect(df.last('category')).toBe('B');
  });

  it('handles mixed data types', () => {
    expect(df.last('mixed')).toBeNaN();
  });

  it('returns undefined for empty DataFrame', () => {
    expect(emptyDf.last('value')).toBeUndefined();
  });

  it('throws an error for non-existent column', () => {
    expect(() => df.last('nope')).toThrow("Column 'nope' not found");
  });

  it('handles null and undefined values', () => {
    expect(nullDf.last('value')).toBeNull();
    expect(undefinedDf.last('value')).toBeUndefined();
  });

  it('handles NaN values', () => {
    expect(nanDf.last('value')).toBeNaN();
  });
});
