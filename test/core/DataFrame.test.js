/**
 * Unit tests for DataFrame.js
 */

import { DataFrame } from '../../src/core/DataFrame.js';
import { describe, test, expect } from 'vitest';

describe('DataFrame', () => {
  // Sample test data
  const sampleData = {
    a: [1, 2, 3],
    b: ['x', 'y', 'z'],
  };

  test('should create a DataFrame instance from object data', () => {
    const df = DataFrame.create(sampleData);

    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(3);
    expect(df.columns).toEqual(['a', 'b']);
  });

  test('should create a DataFrame instance from array of objects', () => {
    const data = [
      { a: 1, b: 'x' },
      { a: 2, b: 'y' },
      { a: 3, b: 'z' },
    ];

    const df = DataFrame.create(data);

    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(3);
    expect(df.columns).toEqual(['a', 'b']);
  });

  test('should throw error when creating with invalid data', () => {
    expect(() => new DataFrame(null)).toThrow('Invalid TinyFrame');
    expect(() => new DataFrame({})).toThrow('Invalid TinyFrame');
    expect(() => new DataFrame({ notColumns: {} })).toThrow(
      'Invalid TinyFrame',
    );
  });

  test('should convert DataFrame to array of objects', () => {
    const df = DataFrame.create(sampleData);
    const array = df.toArray();

    expect(array).toEqual([
      { a: 1, b: 'x' },
      { a: 2, b: 'y' },
      { a: 3, b: 'z' },
    ]);
  });

  test('should access the underlying TinyFrame', () => {
    const df = DataFrame.create(sampleData);
    const frame = df.frame;

    expect(frame).toBeDefined();
    expect(frame.columns).toBeDefined();
    expect(ArrayBuffer.isView(frame.columns.a)).toBe(true);
    expect(Array.from(frame.columns.a)).toEqual([1, 2, 3]);
    expect(frame.columns.b).toEqual(['x', 'y', 'z']);
  });

  test('should handle empty data correctly', () => {
    const df = DataFrame.create({});

    expect(df.rowCount).toBe(0);
    expect(df.columns).toEqual([]);
    expect(df.toArray()).toEqual([]);
  });
});
