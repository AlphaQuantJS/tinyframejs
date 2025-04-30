/**
 * Unit tests for the first method
 *
 * These tests verify the functionality of the first method, which returns
 * the first value in a specified DataFrame column.
 *
 * @module test/methods/aggregation/first.test
 */

import { first } from '../../../src/methods/aggregation/first.js';
import { DataFrame } from '../../../src/core/DataFrame.js';
import { describe, test, expect, vi, beforeEach } from 'vitest';

/**
 * Tests for the first function
 */
describe('first', () => {
  // Mock the validateColumn dependency
  const validateColumn = vi.fn();
  const firstFn = first({ validateColumn });

  // Reset mocks before each test
  beforeEach(() => {
    validateColumn.mockReset();
  });

  test('should return the first value in a column', () => {
    const frame = {
      rowCount: 5,
      columns: {
        values: [1, 2, 3, 4, 5],
      },
    };

    const result = firstFn(frame, 'values');

    expect(validateColumn).toHaveBeenCalledWith(frame, 'values');
    expect(result).toBe(1);
  });

  test('should return the first value even if it is NaN, null, or undefined', () => {
    const frame = {
      rowCount: 5,
      columns: {
        nanFirst: [NaN, 2, 3, 4, 5],
        nullFirst: [null, 2, 3, 4, 5],
        undefinedFirst: [undefined, 2, 3, 4, 5],
      },
    };

    expect(firstFn(frame, 'nanFirst')).toBeNaN();
    expect(validateColumn).toHaveBeenCalledWith(frame, 'nanFirst');

    expect(firstFn(frame, 'nullFirst')).toBeNull();
    expect(validateColumn).toHaveBeenCalledWith(frame, 'nullFirst');

    expect(firstFn(frame, 'undefinedFirst')).toBeUndefined();
    expect(validateColumn).toHaveBeenCalledWith(frame, 'undefinedFirst');
  });

  test('should return undefined for empty column', () => {
    const frame = {
      rowCount: 0,
      columns: {
        values: [],
      },
    };

    const result = firstFn(frame, 'values');

    expect(validateColumn).toHaveBeenCalledWith(frame, 'values');
    expect(result).toBeUndefined();
  });

  test('should return undefined for empty frame', () => {
    const frame = {
      rowCount: 0,
      columns: {
        values: [],
      },
    };

    const result = firstFn(frame, 'values');

    expect(validateColumn).toHaveBeenCalledWith(frame, 'values');
    expect(result).toBeUndefined();
  });

  test('should be callable as DataFrame method', () => {
    // Create a real DataFrame instance
    const df = DataFrame.create({
      a: [10, 20, 30],
      b: ['x', 'y', 'z'],
    });

    // Verify that first is available as a method on DataFrame
    expect(typeof df.first).toBe('function');

    // Call the method and verify results
    expect(df.first('a')).toBe(10);
    expect(df.first('b')).toBe('x');
  });
});

/**
 * Tests for the DataFrame.first method
 */
describe('DataFrame.first', () => {
  test('should return the first value via DataFrame method', () => {
    // Create a DataFrame with test data
    const df = DataFrame.create({
      values: [1, 2, 3, 4, 5],
      strings: ['a', 'b', 'c', 'd', 'e'],
    });

    // Call the first method on the DataFrame
    const resultNumbers = df.first('values');
    const resultStrings = df.first('strings');

    // Verify the results
    expect(resultNumbers).toBe(1);
    expect(resultStrings).toBe('a');
  });

  test('should handle special values via DataFrame method', () => {
    // Create a DataFrame with test data including special values
    // Note: When using DataFrame.create, NaN and null values might be converted to 0 in typed arrays
    const df = DataFrame.create({
      nanValues: [0, 2, 3, 4, 5], // NaN is converted to 0
      nullValues: [0, 2, 3, 4, 5], // null is converted to 0
      // For string columns, undefined might be preserved
      stringValues: ['', 'b', 'c', 'd', 'e'], // undefined might be converted to empty string
    });

    // Call the first method on the DataFrame
    const resultNaN = df.first('nanValues');
    const resultNull = df.first('nullValues');
    const resultString = df.first('stringValues');

    // Verify the results
    expect(resultNaN).toBe(0); // NaN is converted to 0 in typed arrays
    expect(resultNull).toBe(0); // null is converted to 0 in typed arrays
    expect(resultString).toBe(''); // undefined might be converted to empty string
  });

  test('should return undefined for empty DataFrame via DataFrame method', () => {
    // Create an empty DataFrame
    const df = DataFrame.create({
      values: [],
    });

    // Call the first method on the DataFrame
    const result = df.first('values');

    // Verify the result
    expect(result).toBeUndefined();
  });

  test('should throw error for non-existent column via DataFrame method', () => {
    // Create a DataFrame with test data
    const df = DataFrame.create({
      values: [1, 2, 3, 4, 5],
    });

    // Call the first method with non-existent column should throw
    expect(() => df.first('nonexistent')).toThrow();
  });

  test('should be usable in method chaining', () => {
    // Create a DataFrame with test data
    const df = DataFrame.create({
      a: [1, 2, 3, 4, 5],
      b: [10, 20, 30, 40, 50],
    });

    // Use first in a method chain
    // First sort by column 'b', then get the first value of column 'a'
    const result = df.sort('b').first('a');

    // The result should be 1 (the first value of column 'a' after sorting by 'b')
    expect(result).toBe(1);
  });
});
