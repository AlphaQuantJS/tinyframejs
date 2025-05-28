/**
 * Unit tests for shouldUseArrow.js
 */

import { shouldUseArrow } from '../../../src/core/strategy/shouldUseArrow.js';
import { describe, test, expect } from 'vitest';

/**
 * Tests for the shouldUseArrow function
 * Verifies that the function correctly determines when to use Arrow format
 */
describe('shouldUseArrow', () => {
  /**
   * Tests explicit user flags
   */
  test('should respect explicit user flags', () => {
    const data = [1, 2, 3];

    // alwaysArrow flag should override everything else
    expect(shouldUseArrow(data, { alwaysArrow: true })).toBe(true);
    expect(shouldUseArrow(data, { alwaysArrow: true, neverArrow: true })).toBe(
      true,
    );

    // neverArrow flag should override everything except alwaysArrow
    expect(shouldUseArrow(data, { neverArrow: true })).toBe(false);

    // preferArrow flag should be respected
    expect(shouldUseArrow(data, { preferArrow: true })).toBe(true);
    expect(shouldUseArrow(data, { preferArrow: false })).toBe(false);
  });

  /**
   * Tests detection of Arrow vectors
   */
  test('should detect Arrow vectors', () => {
    // Mock Arrow vector
    const arrowVector = { _isArrowVector: true };
    const arrowNativeVector = { isArrow: true };

    expect(shouldUseArrow(arrowVector)).toBe(true);
    expect(shouldUseArrow(arrowNativeVector)).toBe(true);
  });

  /**
   * Tests handling of TypedArrays
   */
  test('should not use Arrow for TypedArrays', () => {
    const typedArray = new Float64Array([1.1, 2.2, 3.3]);

    expect(shouldUseArrow(typedArray)).toBe(false);
  });

  /**
   * Tests analysis of array content
   */
  test('should analyze array content', () => {
    // Numeric arrays
    const numericArray = [1, 2, 3, 4, 5];
    expect(shouldUseArrow(numericArray)).toBe(false);

    // String arrays should use Arrow
    const stringArray = ['a', 'b', 'c'];
    expect(shouldUseArrow(stringArray)).toBe(true);

    // Mixed arrays with strings should use Arrow
    const mixedArray = [1, 'b', 3];
    expect(shouldUseArrow(mixedArray)).toBe(true);

    // Arrays with nulls but numeric should not use Arrow
    const nullArray = [1, null, 3];
    expect(shouldUseArrow(nullArray)).toBe(false);

    // Arrays with nulls and strings should use Arrow
    const nullStringArray = ['a', null, 'c'];
    expect(shouldUseArrow(nullStringArray)).toBe(true);
  });

  /**
   * Tests handling of large arrays
   */
  test('should use Arrow for very large arrays', () => {
    // Create a mock large array
    const largeArray = {
      length: 2_000_000,
      *[Symbol.iterator]() {
        for (let i = 0; i < 10; i++) yield i;
      },
    };

    expect(shouldUseArrow(largeArray)).toBe(true);
  });
});
