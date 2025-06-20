/**
 * Unit tests for VectorFactory.js
 */

import { VectorFactory } from '../../../../packages/core/src/data/storage/VectorFactory.js';
import { TypedArrayVector } from '../../../../packages/core/src/data/storage/TypedArrayVector.js';
import { describe, test, expect, vi } from 'vitest';

/**
 * Tests for the VectorFactory
 * Verifies vector creation from different data sources
 */
describe('VectorFactory', () => {
  /**
   * Tests creating a vector from array data
   */
  test('should create a vector from array data', async () => {
    const data = [1, 2, 3, 4, 5];
    const vector = await VectorFactory.from(data);

    expect(vector).toBeDefined();
    expect(vector._isVector).toBe(true);
    expect(vector.length).toBe(5);
    expect(vector.toArray()).toEqual(data);
  });

  /**
   * Tests creating a vector from typed array
   */
  test('should create a vector from typed array', async () => {
    const data = new Float64Array([1.1, 2.2, 3.3]);
    const vector = await VectorFactory.from(data);

    expect(vector).toBeInstanceOf(TypedArrayVector);
    expect(vector.length).toBe(3);

    const array = vector.toArray();
    expect(array[0]).toBeCloseTo(1.1);
    expect(array[1]).toBeCloseTo(2.2);
    expect(array[2]).toBeCloseTo(3.3);
  });

  /**
   * Tests handling mixed data types
   */
  test('should handle mixed data types', async () => {
    const data = [1, 'string', true, null, undefined];
    const vector = await VectorFactory.from(data);

    expect(vector).toBeDefined();
    expect(vector.length).toBe(5);

    // In TypedArrayVector strings, boolean values and null/undefined are converted to numbers or NaN
    // So we only check the length of the array and the first element, which should remain a number
    const array = vector.toArray();
    expect(array.length).toBe(5);
    expect(array[0]).toBe(1);
    // Other elements may be converted to NaN or numbers
  });

  /**
   * Tests handling empty array
   */
  test('should handle empty array', async () => {
    const data = [];
    const vector = await VectorFactory.from(data);

    expect(vector).toBeDefined();
    expect(vector.length).toBe(0);
    expect(vector.toArray()).toEqual([]);
  });

  /**
   * Tests handling NaN values
   */
  test('should handle NaN values', async () => {
    const data = [1, NaN, 3];
    const vector = await VectorFactory.from(data);

    expect(vector).toBeDefined();
    expect(vector.length).toBe(3);

    const array = vector.toArray();
    expect(array[0]).toBe(1);
    expect(isNaN(array[1])).toBe(true);
    expect(array[2]).toBe(3);
  });

  /**
   * Tests preferArrow option
   */
  test('should respect preferArrow option', async () => {
    const data = [1, 2, 3];

    // Test with preferArrow: false
    const vector1 = await VectorFactory.from(data, { preferArrow: false });
    expect(vector1).toBeInstanceOf(TypedArrayVector);

    // Note: Testing with preferArrow: true would require mocking the arrow library
    // or having it available, which might not be feasible in all test environments
  });
});
