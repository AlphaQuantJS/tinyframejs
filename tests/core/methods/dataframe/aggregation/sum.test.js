/**
 * Unit-tests for DataFrame.sum
 *
 * ▸ Core library:  @tinyframejs/core
 *
 * ─────────────────────────────────────────────────────────
 */

import { describe, it, expect, beforeAll, vi } from 'vitest';
import { DataFrame } from '@tinyframejs/core';
import { validateColumn } from '@tinyframejs/core/data/utils';

// Mock validateColumn for error testing
vi.mock('@tinyframejs/core/data/utils', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    validateColumn: vi.fn(actual.validateColumn),
  };
});

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
describe('DataFrame.sum()', () => {
  it('computes sum for numeric column', () => {
    // 10+20+30+40+50 = 150
    expect(df.sum('value')).toBe(150);
  });

  it('ignores non-numeric / NaN values (mixed column)', () => {
    // '20' → 20, 30 → 30  → sum = 50
    expect(df.sum('mixed')).toBe(50);
  });

  it('returns 0 if there are no numbers in the column', () => {
    expect(df.sum('category')).toBe(0);
  });

  it('throws an error for non-existent column', () => {
    // Configure mock to throw error
    validateColumn.mockImplementationOnce(() => {
      throw new Error("Column 'nope' not found");
    });

    expect(() => df.sum('nope')).toThrow("Column 'nope' not found");
  });

  it('works with empty DataFrame', () => {
    expect(emptyDf.sum('value')).toBe(0);
  });
});
