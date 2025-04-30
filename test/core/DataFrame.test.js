/**
 * Unit tests for DataFrame.js
 */

import { DataFrame } from '../../src/core/DataFrame.js';
import { describe, test, expect } from 'vitest';

/**
 * Tests for the DataFrame class
 * Verifies DataFrame creation, data access, and manipulation methods
 */
describe('DataFrame', () => {
  // Sample test data
  const sampleData = {
    a: [1, 2, 3],
    b: ['x', 'y', 'z'],
  };

  /**
   * Tests creating a DataFrame instance from object data (column-oriented)
   * Verifies that the DataFrame is created correctly with the expected properties
   */
  test('should create a DataFrame instance from object data', () => {
    const df = DataFrame.create(sampleData);

    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(3);
    expect(df.columns).toEqual(['a', 'b']);
  });

  /**
   * Tests creating a DataFrame instance from array of objects (row-oriented)
   * Verifies that the DataFrame is created correctly with the expected properties
   */
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

  /**
   * Tests creating a DataFrame instance with invalid data
   * Verifies that an error is thrown when creating a DataFrame with invalid data
   */
  test('should throw error when creating with invalid data', () => {
    expect(() => new DataFrame(null)).toThrow('Invalid TinyFrame');
    expect(() => new DataFrame({})).toThrow('Invalid TinyFrame');
    expect(() => new DataFrame({ notColumns: {} })).toThrow(
      'Invalid TinyFrame',
    );
  });

  /**
   * Tests converting a DataFrame to an array of objects
   * Verifies that the DataFrame is converted correctly to an array of objects
   */
  test('should convert DataFrame to array of objects', () => {
    const df = DataFrame.create(sampleData);
    const array = df.toArray();

    expect(array).toEqual([
      { a: 1, b: 'x' },
      { a: 2, b: 'y' },
      { a: 3, b: 'z' },
    ]);
  });

  /**
   * Tests accessing the underlying TinyFrame
   * Verifies that the underlying TinyFrame is accessible and has the expected properties
   */
  test('should access the underlying TinyFrame', () => {
    const df = DataFrame.create(sampleData);
    const frame = df.frame;

    expect(frame).toBeDefined();
    expect(frame.columns).toBeDefined();
    expect(ArrayBuffer.isView(frame.columns.a)).toBe(true);
    expect(Array.from(frame.columns.a)).toEqual([1, 2, 3]);
    expect(frame.columns.b).toEqual(['x', 'y', 'z']);
  });

  /**
   * Tests handling empty data correctly
   * Verifies that an empty DataFrame is created correctly and has the expected properties
   */
  test('should handle empty data correctly', () => {
    const df = DataFrame.create({});

    expect(df.rowCount).toBe(0);
    expect(df.columns).toEqual([]);
    expect(df.toArray()).toEqual([]);
  });
});
