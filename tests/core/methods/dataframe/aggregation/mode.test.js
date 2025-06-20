/**
 * Unit-tests for DataFrame.mode
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
const modeTestData = [
  { value: 30, category: 'A', mixed: '20' },
  { value: 10, category: 'B', mixed: 30 },
  { value: 30, category: 'A', mixed: null },
  { value: 40, category: 'C', mixed: undefined },
  { value: 30, category: 'B', mixed: NaN },
  { value: 20, category: 'B', mixed: '20' },
];

const multiModeData = [
  { value: 10 },
  { value: 20 },
  { value: 10 },
  { value: 30 },
  { value: 20 },
  { value: 30 },
];

const invalidData = [
  { invalid: null },
  { invalid: undefined },
  { invalid: NaN },
];

let df, multiModeDf, invalidDf, emptyDf;
beforeAll(() => {
  df = DataFrame.fromRecords(modeTestData);
  multiModeDf = DataFrame.fromRecords(multiModeData);
  invalidDf = DataFrame.fromRecords(invalidData);
  emptyDf = DataFrame.fromRecords([]);
});

// ---------------------------------------------
// Main test battery
// ---------------------------------------------
describe('DataFrame.mode()', () => {
  it('finds the most frequent value in a column', () => {
    // 30 appears 3 times, more often than any other value
    expect(df.mode('value')).toBe(30);
  });

  it('handles mixed data types by treating them as distinct', () => {
    // '20' appears twice (string '20', not number 20)
    expect(df.mode('mixed')).toBe('20');
  });

  it('returns null for a column with no valid values', () => {
    expect(invalidDf.mode('invalid')).toBe(null);
  });

  it('returns one of the values if multiple values have the same highest frequency', () => {
    // Check that one of the modal values is returned (all appear twice)
    expect([10, 20, 30]).toContain(multiModeDf.mode('value'));
  });

  it('throws an error for non-existent column', () => {
    expect(() => df.mode('nope')).toThrow("Column 'nope' not found");
  });

  it('works with empty DataFrame', () => {
    expect(emptyDf.mode('value')).toBe(null);
  });
});
