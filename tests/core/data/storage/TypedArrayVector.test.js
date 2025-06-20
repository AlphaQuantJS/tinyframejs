/**
 * Unit tests for TypedArrayVector.js
 */

import { TypedArrayVector } from '../../../../packages/core/src/data/storage/TypedArrayVector.js';
import { describe, test, expect } from 'vitest';

/**
 * Tests for the TypedArrayVector class
 * Verifies vector creation and data access methods
 */
describe('TypedArrayVector', () => {
  /**
   * Tests creating a vector from array data
   */
  test('should create a vector from array data', () => {
    const data = new Float64Array([1.1, 2.2, 3.3]);
    const vector = new TypedArrayVector(data);

    expect(vector).toBeDefined();
    expect(vector._isVector).toBe(true);
    expect(vector.length).toBe(3);
  });

  /**
   * Tests accessing data by index
   */
  test('should access data by index', () => {
    const data = new Float64Array([1.1, 2.2, 3.3]);
    const vector = new TypedArrayVector(data);

    expect(vector.get(0)).toBeCloseTo(1.1);
    expect(vector.get(1)).toBeCloseTo(2.2);
    expect(vector.get(2)).toBeCloseTo(3.3);
  });

  /**
   * Tests converting to array
   */
  test('should convert to array', () => {
    const data = new Float64Array([1.1, 2.2, 3.3]);
    const vector = new TypedArrayVector(data);
    const array = vector.toArray();

    expect(Array.isArray(array)).toBe(true);
    expect(array.length).toBe(3);
    expect(array[0]).toBeCloseTo(1.1);
    expect(array[1]).toBeCloseTo(2.2);
    expect(array[2]).toBeCloseTo(3.3);
  });

  /**
   * Tests handling out of bounds access
   */
  test('should handle out of bounds access', () => {
    const data = new Float64Array([1.1, 2.2, 3.3]);
    const vector = new TypedArrayVector(data);

    expect(vector.get(-1)).toBeUndefined();
    expect(vector.get(3)).toBeUndefined();
  });

  /**
   * Tests handling different typed arrays
   */
  test('should handle different typed arrays', () => {
    // Int32Array
    const int32Data = new Int32Array([1, 2, 3]);
    const int32Vector = new TypedArrayVector(int32Data);
    expect(int32Vector.get(0)).toBe(1);

    // Uint8Array
    const uint8Data = new Uint8Array([10, 20, 30]);
    const uint8Vector = new TypedArrayVector(uint8Data);
    expect(uint8Vector.get(0)).toBe(10);

    // Float32Array
    const float32Data = new Float32Array([1.5, 2.5, 3.5]);
    const float32Vector = new TypedArrayVector(float32Data);
    expect(float32Vector.get(0)).toBeCloseTo(1.5);
  });

  /**
   * Tests slice method
   */
  test('should slice the vector', () => {
    const data = new Float64Array([1.1, 2.2, 3.3, 4.4, 5.5]);
    const vector = new TypedArrayVector(data);

    const sliced = vector.slice(1, 4);
    expect(sliced.length).toBe(3);
    expect(sliced.get(0)).toBeCloseTo(2.2);
    expect(sliced.get(1)).toBeCloseTo(3.3);
    expect(sliced.get(2)).toBeCloseTo(4.4);
  });
});
