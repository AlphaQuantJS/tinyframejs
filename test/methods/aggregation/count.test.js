import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../src/core/DataFrame.js';

describe('DataFrame.count', () => {
  const df = DataFrame.create({
    a: [1, 2, 3, 4, 5],
    b: [10, 20, 30, 40, 50],
    c: ['x', 'y', 'z', 'w', 'v'],
  });

  const dfWithNaN = DataFrame.create({
    a: [1, NaN, 3, null, 5, undefined],
    b: [10, 20, NaN, 40, null, 60],
  });

  test('counts all values in column', () => {
    expect(df.count('a')).toBe(5);
    expect(df.count('b')).toBe(5);
    expect(df.count('c')).toBe(5);
  });

  test('includes NaN, null, undefined in count', () => {
    expect(dfWithNaN.count('a')).toBe(6);
    expect(dfWithNaN.count('b')).toBe(6);
  });

  test('returns 0 for empty column', () => {
    const empty = DataFrame.create({ a: [] });
    expect(empty.count('a')).toBe(0);
  });

  test('throws on missing column', () => {
    expect(() => df.count('z')).toThrow(/not found/i);
  });

  test('throws on corrupted frame', () => {
    // Create a minimally valid frame but without column 'a'
    const broken = new DataFrame({ columns: {} });
    expect(() => broken.count('a')).toThrow();
  });
});
