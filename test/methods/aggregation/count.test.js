/**
 * Tests for agg/count.js
 */

import { describe, test, expect } from 'vitest';
import { createFrame } from '../../../src/primitives/createFrame.js';
import { count } from '../../../src/methods/aggregation/count.js';

describe('count', () => {
  // Common test frame for all tests
  const frame = createFrame({
    a: [1, 2, 3, 4, 5],
    b: [10, 20, 30, 40, 50],
    c: ['x', 'y', 'z', 'w', 'v'],
  });

  // Frame with NaN, null and undefined values
  const frameWithNaN = createFrame({
    a: [1, NaN, 3, null, 5, undefined],
    b: [10, 20, NaN, 40, null, 60],
  });

  test('should count all values in column', () => {
    expect(count(frame, 'a')).toBe(5);
    expect(count(frame, 'b')).toBe(5);
    expect(count(frame, 'c')).toBe(5);
  });

  test('should include NaN, null and undefined in count', () => {
    expect(count(frameWithNaN, 'a')).toBe(6);
    expect(count(frameWithNaN, 'b')).toBe(6);
  });

  test('should return 0 for empty frame', () => {
    const emptyFrame = createFrame({
      a: [],
    });

    expect(count(emptyFrame, 'a')).toBe(0);
  });

  test('should throw error for non-existent column', () => {
    expect(() => count(frame, 'd')).toThrow("Column 'd' not found");
  });

  test('should throw error for invalid frame', () => {
    expect(() => count(null, 'a')).toThrow();
    expect(() => count({}, 'a')).toThrow();
    expect(() => count({ columns: {} }, 'a')).toThrow();
  });
});
