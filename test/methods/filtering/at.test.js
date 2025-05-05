/**
 * Unit tests for at method
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../src/core/DataFrame.js';

describe('At Method', () => {
  // Sample data for testing
  const data = {
    name: ['Alice', 'Bob', 'Charlie'],
    age: [25, 30, 35],
    city: ['New York', 'San Francisco', 'Chicago'],
    salary: [70000, 85000, 90000],
  };

  test('should select a row by index', () => {
    const df = DataFrame.create(data);
    const result = df.at(1);

    // Check that the result is an object with the correct values
    expect(result).toEqual({
      name: 'Bob',
      age: 30,
      city: 'San Francisco',
      salary: 85000,
    });
  });

  test('should select the first row with index 0', () => {
    const df = DataFrame.create(data);
    const result = df.at(0);

    // Check that the result is an object with the correct values
    expect(result).toEqual({
      name: 'Alice',
      age: 25,
      city: 'New York',
      salary: 70000,
    });
  });

  test('should select the last row with the last index', () => {
    const df = DataFrame.create(data);
    const result = df.at(2);

    // Check that the result is an object with the correct values
    expect(result).toEqual({
      name: 'Charlie',
      age: 35,
      city: 'Chicago',
      salary: 90000,
    });
  });

  test('should throw error for negative index', () => {
    const df = DataFrame.create(data);
    expect(() => df.at(-1)).toThrow();
  });

  test('should throw error for index out of bounds', () => {
    const df = DataFrame.create(data);
    expect(() => df.at(3)).toThrow();
  });

  test('should throw error for non-integer index', () => {
    const df = DataFrame.create(data);
    expect(() => df.at(1.5)).toThrow();
    expect(() => df.at('1')).toThrow();
  });

  test('should handle empty DataFrame', () => {
    const df = DataFrame.create({
      name: [],
      age: [],
      city: [],
      salary: [],
    });
    expect(() => df.at(0)).toThrow();
  });

  test('should handle typed arrays', () => {
    // Create DataFrame with typed arrays
    const typedData = {
      name: ['Alice', 'Bob', 'Charlie'],
      age: new Int32Array([25, 30, 35]),
      salary: new Float64Array([70000, 85000, 90000]),
    };

    const df = DataFrame.create(typedData);
    const result = df.at(1);

    // Check that the result has the correct values
    expect(result).toEqual({
      name: 'Bob',
      age: 30,
      salary: 85000,
    });
  });
});
