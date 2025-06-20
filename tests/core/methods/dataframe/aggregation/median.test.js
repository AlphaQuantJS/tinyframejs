/**
 * Unit-tests for DataFrame.median
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
const sampleOdd = [
  { value: 10, category: 'A', mixed: '20' },
  { value: 20, category: 'B', mixed: 30 },
  { value: 30, category: 'A', mixed: null },
  { value: 40, category: 'C', mixed: undefined },
  { value: 50, category: 'B', mixed: NaN },
];

const sampleEven = [
  { value: 10, category: 'A', mixed: '20' },
  { value: 20, category: 'B', mixed: 30 },
  { value: 30, category: 'A', mixed: null },
  { value: 40, category: 'C', mixed: undefined },
  { value: 50, category: 'B', mixed: NaN },
  { value: 60, category: 'D', mixed: 40 },
];

let dfOdd, dfEven, emptyDf;
beforeAll(() => {
  dfOdd = DataFrame.fromRecords(sampleOdd);
  dfEven = DataFrame.fromRecords(sampleEven);
  emptyDf = DataFrame.fromRecords([]);
});

// ---------------------------------------------
// Main test battery
// ---------------------------------------------
describe('DataFrame.median()', () => {
  it('calculates median for odd number of elements', () => {
    // Sorted: [10, 20, 30, 40, 50] -> median is 30
    expect(dfOdd.median('value')).toBe(30);
  });

  it('calculates median for even number of elements', () => {
    // Sorted: [10, 20, 30, 40, 50, 60] -> median is (30+40)/2 = 35
    expect(dfEven.median('value')).toBe(35);
  });

  it('handles mixed data types by converting to numbers', () => {
    // Valid values: [20, 30, 40] -> median is 30
    expect(dfEven.median('mixed')).toBe(30);
  });

  it('returns null for a column with no valid numeric values', () => {
    expect(dfOdd.median('category')).toBe(null);
  });

  it('throws an error for non-existent column', () => {
    expect(() => dfOdd.median('nope')).toThrow("Column 'nope' not found");
  });

  it('works with empty DataFrame', () => {
    expect(emptyDf.median('value')).toBe(null);
  });
});
