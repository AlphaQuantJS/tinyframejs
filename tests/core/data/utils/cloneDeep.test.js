/**
 * Unit tests for cloneDeep.js
 */

import { cloneDeep } from '../../../../packages/core/src/data/utils/transform/cloneDeep.js';
import { describe, test, expect } from 'vitest';

/**
 * Tests for the cloneDeep function
 * Verifies deep cloning of various data structures
 */
describe('cloneDeep', () => {
  /**
   * Tests cloning primitive values
   */
  test('should clone primitive values', () => {
    expect(cloneDeep(42)).toBe(42);
    expect(cloneDeep('hello')).toBe('hello');
    expect(cloneDeep(true)).toBe(true);
    expect(cloneDeep(null)).toBe(null);
    expect(cloneDeep(undefined)).toBe(undefined);
  });

  /**
   * Tests cloning arrays
   */
  test('should clone arrays', () => {
    const original = [1, 2, 3];
    const clone = cloneDeep(original);

    expect(clone).toEqual(original);
    expect(clone).not.toBe(original); // Different reference

    // Modifying the clone should not affect the original
    clone.push(4);
    expect(original.length).toBe(3);
  });

  /**
   * Tests cloning nested arrays
   */
  test('should clone nested arrays', () => {
    const original = [1, [2, 3], [4, [5, 6]]];
    const clone = cloneDeep(original);

    expect(clone).toEqual(original);

    // Modifying the nested array in the clone should not affect the original
    clone[1][0] = 99;
    expect(original[1][0]).toBe(2);
  });

  /**
   * Tests cloning objects
   */
  test('should clone objects', () => {
    const original = { a: 1, b: 2 };
    const clone = cloneDeep(original);

    expect(clone).toEqual(original);
    expect(clone).not.toBe(original); // Different reference

    // Modifying the clone should not affect the original
    clone.c = 3;
    expect(original.c).toBeUndefined();
  });

  /**
   * Tests cloning nested objects
   */
  test('should clone nested objects', () => {
    const original = {
      a: 1,
      b: {
        c: 2,
        d: {
          e: 3,
        },
      },
    };
    const clone = cloneDeep(original);

    expect(clone).toEqual(original);

    // Modifying the nested object in the clone should not affect the original
    clone.b.c = 99;
    expect(original.b.c).toBe(2);

    clone.b.d.e = 100;
    expect(original.b.d.e).toBe(3);
  });

  /**
   * Tests cloning mixed structures
   */
  test('should clone mixed structures', () => {
    const original = {
      a: 1,
      b: [2, 3, { c: 4 }],
      d: { e: [5, 6] },
    };
    const clone = cloneDeep(original);

    expect(clone).toEqual(original);

    // Modifying the clone should not affect the original
    clone.b[2].c = 99;
    expect(original.b[2].c).toBe(4);

    clone.d.e.push(7);
    expect(original.d.e.length).toBe(2);
  });

  /**
   * Tests handling circular references
   */
  test('should handle circular references', () => {
    const original = { a: 1 };
    original.self = original;

    // This should not cause an infinite loop
    const clone = cloneDeep(original);

    expect(clone.a).toBe(1);
    expect(clone.self).toBe(clone); // Circular reference preserved
  });
});
