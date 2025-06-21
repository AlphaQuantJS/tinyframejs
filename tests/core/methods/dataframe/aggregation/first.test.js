/**
 * Unit-tests for DataFrame.first
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
    { value: null },
    { value: 20 },
    { value: 30 },
  ]);
  undefinedDf = DataFrame.fromRecords([
    { value: undefined },
    { value: 20 },
    { value: 30 },
  ]);
  nanDf = DataFrame.fromRecords([{ value: NaN }, { value: 20 }, { value: 30 }]);
});

// ---------------------------------------------
// Main test battery
// ---------------------------------------------
describe('DataFrame.first()', () => {
  it('returns the first value in a column', () => {
    expect(df.first('value')).toBe(10);
    expect(df.first('category')).toBe('A');
  });

  it('handles mixed data types', () => {
    expect(df.first('mixed')).toBe('20');
  });

  it('returns undefined for empty DataFrame', () => {
    expect(emptyDf.first('value')).toBeUndefined();
  });

  it('throws an error for non-existent column', () => {
    expect(() => df.first('nope')).toThrow("Column 'nope' not found");
  });

  it('handles null and undefined values', () => {
    expect(nullDf.first('value')).toBeNull();
    expect(undefinedDf.first('value')).toBeUndefined();
  });

  it('handles NaN values', () => {
    expect(nanDf.first('value')).toBeNaN();
  });
});
