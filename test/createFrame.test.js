/**
 * Unit tests for createFrame.js
 */

import {
  createFrame,
  getColumn,
  validateColumn,
} from '../src/primitives/createFrame.js';
import { describe, test, expect } from 'vitest';

describe('createFrame', () => {
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

  test('should handle empty data', () => {
    const data = {};

    const frame = createFrame(data);

    expect(frame.rowCount).toBe(0);
    expect(Object.keys(frame.columns)).toEqual([]);
  });

  test('should throw error for invalid data', () => {
    expect(() => createFrame(null)).toThrow(
      'Input data cannot be null or undefined',
    );
    expect(() => createFrame(undefined)).toThrow(
      'Input data cannot be null or undefined',
    );
  });

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

  test('should not use TypedArrays when disabled', () => {
    const data = {
      a: [1, 2, 3],
      b: [4, 5, 6],
    };

    const frame = createFrame(data, { useTypedArrays: false });

    expect(Array.isArray(frame.columns.a)).toBe(true);
    expect(Array.isArray(frame.columns.b)).toBe(true);
  });

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

describe('getColumn', () => {
  test('should return column data', () => {
    const data = {
      a: [1, 2, 3],
      b: ['a', 'b', 'c'],
    };

    const frame = createFrame(data);

    expect(getColumn(frame, 'a')).toEqual(frame.columns.a);
    expect(getColumn(frame, 'b')).toEqual(frame.columns.b);
  });

  test('should throw error for non-existent column', () => {
    const data = {
      a: [1, 2, 3],
    };

    const frame = createFrame(data);

    expect(() => getColumn(frame, 'b')).toThrow(
      'Column \u0027b\u0027 not found',
    );
  });
});

describe('validateColumn', () => {
  test('should not throw for valid column', () => {
    const data = {
      a: [1, 2, 3],
      b: ['a', 'b', 'c'],
    };

    const frame = createFrame(data);

    expect(() => validateColumn(frame, 'a')).not.toThrow();
    expect(() => validateColumn(frame, 'b')).not.toThrow();
  });

  test('should throw for non-existent column', () => {
    const data = {
      a: [1, 2, 3],
    };

    const frame = createFrame(data);

    expect(() => validateColumn(frame, 'b')).toThrow(
      'Column \u0027b\u0027 not found',
    );
  });
});
