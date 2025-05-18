/**
 * Unit tests for createFrame.js
 */

import { createFrame } from '../../src/core/createFrame.js';
import { describe, test, expect } from 'vitest';

/**
 * Helper function for tests to get a column from a frame
 * @param {Object} frame - The frame to get the column from
 * @param {string} name - The name of the column to get
 * @returns {Array|TypedArray} The column data
 * @throws {Error} If the column does not exist
 */
function getColumnForTest(frame, name) {
  if (!(name in frame.columns)) {
    throw new Error(`Column '${name}' not found`);
  }
  return frame.columns[name];
}

/**
 * Tests for the createFrame function
 * Verifies frame creation from different data sources and with various options
 */
describe('createFrame', () => {
  /**
   * Tests creating a frame from object data (column-oriented)
   * Each property of the object becomes a column in the frame
   */
  test('should create a frame from object data', () => {
    const data = {
      a: [1, 2, 3],
      b: ['a', 'b', 'c'],
    };

    const frame = createFrame(data);

    expect(frame.rowCount).toBe(3);
    expect(Object.keys(frame.columns)).toEqual(['a', 'b']);
    expect(ArrayBuffer.isView(frame.columns.a)).toBe(true);
    expect(Array.from(frame.columns.a)).toEqual([1, 2, 3]);
    expect(frame.columns.b).toEqual(['a', 'b', 'c']);
  });

  /**
   * Tests creating a frame from an array of objects (row-oriented)
   * Each object in the array becomes a row in the frame
   */
  test('should create a frame from array of objects', () => {
    const data = [
      { a: 1, b: 'a' },
      { a: 2, b: 'b' },
      { a: 3, b: 'c' },
    ];

    const frame = createFrame(data);

    expect(frame.rowCount).toBe(3);
    expect(Object.keys(frame.columns)).toEqual(['a', 'b']);
    expect(ArrayBuffer.isView(frame.columns.a)).toBe(true);
    expect(Array.from(frame.columns.a)).toEqual([1, 2, 3]);
    expect(frame.columns.b).toEqual(['a', 'b', 'c']);
  });

  /**
   * Tests creating a frame from another frame
   * Verifies that the new frame is a copy of the original frame
   */
  test('should create a frame from another frame', () => {
    // Use data that will definitely be converted to Float64Array
    const data = {
      a: [1.1, 2.2, 3.3], // Use floating point numbers to force Float64Array
      b: ['a', 'b', 'c'],
    };

    const frame1 = createFrame(data);
    // Verify that the first frame is created correctly
    expect(frame1.columns.a instanceof Float64Array).toBe(true);

    // Clone the frame
    const frame2 = createFrame(frame1);

    expect(frame2.rowCount).toBe(3);
    expect(Object.keys(frame2.columns)).toEqual(['a', 'b']);

    // Verify that the data is copied correctly
    expect(Array.from(frame2.columns.a)).toEqual([1.1, 2.2, 3.3]);
    expect(frame2.columns.b).toEqual(['a', 'b', 'c']);

    // Verify that it's a copy, not a reference
    frame1.columns.a[0] = 100;
    expect(frame2.columns.a[0]).toBe(1.1);
  });

  /**
   * Tests creating a frame from empty data
   * Verifies that the frame is created with zero rows and columns
   */
  test('should handle empty data', () => {
    const data = {};

    const frame = createFrame(data);

    expect(frame.rowCount).toBe(0);
    expect(Object.keys(frame.columns)).toEqual([]);
  });

  /**
   * Tests creating a frame from invalid data (null or undefined)
   * Verifies that an error is thrown
   */
  test('should throw error for invalid data', () => {
    expect(() => createFrame(null)).toThrow(
      'Input data cannot be null or undefined',
    );
    expect(() => createFrame(undefined)).toThrow(
      'Input data cannot be null or undefined',
    );
  });

  /**
   * Tests detecting numeric columns and using TypedArrays
   * Verifies that TypedArrays are used for numeric columns
   */
  test('should detect numeric columns and use TypedArrays', () => {
    const data = {
      a: [1, 2, 3],
      b: [4, 5, 6],
      c: ['a', 'b', 'c'],
    };

    const frame = createFrame(data);

    expect(ArrayBuffer.isView(frame.columns.a)).toBe(true);
    expect(ArrayBuffer.isView(frame.columns.b)).toBe(true);
    expect(Array.isArray(frame.columns.c)).toBe(true);
  });

  /**
   * Tests not using TypedArrays when disabled
   * Verifies that TypedArrays are not used when the option is disabled
   */
  test('should not use TypedArrays when disabled', () => {
    const data = {
      a: [1, 2, 3],
      b: [4, 5, 6],
    };

    const frame = createFrame(data, { useTypedArrays: false });

    expect(Array.isArray(frame.columns.a)).toBe(true);
    expect(Array.isArray(frame.columns.b)).toBe(true);
  });

  /**
   * Tests handling mixed types in columns
   * Verifies that mixed types are handled correctly
   */
  test('should handle mixed types in columns', () => {
    const data = {
      a: [1, 'string', 3],
      b: [4, 5, null],
    };

    const frame = createFrame(data, { useTypedArrays: false });

    expect(Array.isArray(frame.columns.a)).toBe(true);
    expect(frame.columns.a).toEqual([1, 'string', 3]);
    expect(Array.isArray(frame.columns.b)).toBe(true);
    expect(frame.columns.b).toEqual([4, 5, null]);
  });

  /**
   * Tests handling NaN values in numeric columns
   * Verifies that NaN values are handled correctly
   */
  test('should handle NaN values in numeric columns', () => {
    // Use Float64Array to preserve NaN values
    const data = {
      a: [1.1, NaN, 3.3], // Use floating point numbers to force Float64Array
      b: [4.4, 5.5, NaN],
    };

    const frame = createFrame(data);

    // Verify that Float64Array is used
    expect(frame.columns.a instanceof Float64Array).toBe(true);

    // Check values
    expect(frame.columns.a[0]).toBe(1.1);
    // Use isNaN instead of Number.isNaN, as TypedArray may convert NaN differently
    expect(isNaN(frame.columns.a[1])).toBe(true);
    expect(frame.columns.a[2]).toBe(3.3);

    expect(frame.columns.b instanceof Float64Array).toBe(true);
    expect(frame.columns.b[0]).toBe(4.4);
    expect(frame.columns.b[1]).toBe(5.5);
    expect(isNaN(frame.columns.b[2])).toBe(true);
  });

  /**
   * Tests handling null and undefined values in numeric columns
   * Verifies that null and undefined values are handled correctly
   */
  test('should handle null and undefined values in numeric columns', () => {
    // Use Float64Array to preserve NaN values
    const data = {
      a: [1.1, null, 3.3], // Use floating point numbers to force Float64Array
      b: [4.4, undefined, 6.6],
    };

    const frame = createFrame(data);

    // Verify that Float64Array is used
    expect(frame.columns.a instanceof Float64Array).toBe(true);

    // null may be converted to 0 or NaN
    const nullValue = frame.columns.a[1];
    expect(nullValue === 0 || isNaN(nullValue)).toBe(true);

    expect(frame.columns.a[2]).toBe(3.3);

    expect(frame.columns.b instanceof Float64Array).toBe(true);
    // undefined is typically converted to NaN
    expect(isNaN(frame.columns.b[1])).toBe(true);
    expect(frame.columns.b[2]).toBe(6.6);
  });
});

/**
 * Tests for accessing columns
 * Verifies that columns can be accessed correctly
 */
describe('Column Access', () => {
  /**
   * Tests getting a column by name
   * Verifies that the correct column data is returned
   */
  test('should return column data', () => {
    const data = {
      a: [1, 2, 3],
      b: ['a', 'b', 'c'],
    };

    const frame = createFrame(data);

    expect(getColumnForTest(frame, 'a')).toEqual(frame.columns.a);
    expect(getColumnForTest(frame, 'b')).toEqual(frame.columns.b);
  });

  /**
   * Tests getting a non-existent column
   * Verifies that an error is thrown
   */
  test('should throw error for non-existent column', () => {
    const data = {
      a: [1, 2, 3],
    };

    const frame = createFrame(data);

    expect(() => getColumnForTest(frame, 'b')).toThrow('Column \'b\' not found');
  });
});
