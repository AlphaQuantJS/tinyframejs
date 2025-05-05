/**
 * Unit tests for loc method
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../src/core/DataFrame.js';

describe('Loc Method', () => {
  // Sample data for testing
  const data = {
    name: ['Alice', 'Bob', 'Charlie', 'David', 'Eve'],
    age: [25, 30, 35, 40, 45],
    city: ['New York', 'San Francisco', 'Chicago', 'Boston', 'Seattle'],
    salary: [70000, 85000, 90000, 95000, 100000],
  };

  test('should select rows and columns by labels', () => {
    const df = DataFrame.create(data);
    const result = df.loc([1, 3], ['name', 'city']);

    // Check that the result has the correct rows and columns
    expect(result.rowCount).toBe(2);
    expect(result.columns).toEqual(['name', 'city']);
    expect(result.toArray()).toEqual([
      { name: 'Bob', city: 'San Francisco' },
      { name: 'David', city: 'Boston' },
    ]);
  });

  test('should select a single row and multiple columns', () => {
    const df = DataFrame.create(data);
    const result = df.loc(2, ['name', 'age', 'city']);

    // Check that the result has the correct row and columns
    expect(result.rowCount).toBe(1);
    expect(result.columns).toEqual(['name', 'age', 'city']);
    expect(result.toArray()).toEqual([
      { name: 'Charlie', age: 35, city: 'Chicago' },
    ]);
  });

  test('should select multiple rows and a single column', () => {
    const df = DataFrame.create(data);
    const result = df.loc([0, 2, 4], 'age');

    // Check that the result has the correct rows and column
    expect(result.rowCount).toBe(3);
    expect(result.columns).toEqual(['age']);
    expect(result.toArray()).toEqual([{ age: 25 }, { age: 35 }, { age: 45 }]);
  });

  test('should select a single row and a single column', () => {
    const df = DataFrame.create(data);
    const result = df.loc(1, 'salary');

    // Check that the result has the correct row and column
    expect(result.rowCount).toBe(1);
    expect(result.columns).toEqual(['salary']);
    expect(result.toArray()).toEqual([{ salary: 85000 }]);
  });

  test('should throw error for row index out of bounds', () => {
    const df = DataFrame.create(data);
    expect(() => df.loc(5, ['name', 'age'])).toThrow();
  });

  test('should throw error for non-existent column', () => {
    const df = DataFrame.create(data);
    expect(() => df.loc([0, 1], ['name', 'nonexistent'])).toThrow();
  });

  test('should throw error for negative row index', () => {
    const df = DataFrame.create(data);
    expect(() => df.loc(-1, ['name', 'age'])).toThrow();
  });

  test('should return a new DataFrame instance', () => {
    const df = DataFrame.create(data);
    const result = df.loc([0, 1], ['name', 'age']);
    expect(result).toBeInstanceOf(DataFrame);
    expect(result).not.toBe(df); // Should be a new instance
  });

  test('should preserve typed arrays', () => {
    // Create DataFrame with typed arrays
    const typedData = {
      name: ['Alice', 'Bob', 'Charlie', 'David', 'Eve'],
      age: new Int32Array([25, 30, 35, 40, 45]),
      salary: new Float64Array([70000, 85000, 90000, 95000, 100000]),
    };

    const df = DataFrame.create(typedData);
    const result = df.loc([1, 3], ['age', 'salary']);

    // Check that the result has the same array types
    expect(result.frame.columns.age).toBeInstanceOf(Int32Array);
    expect(result.frame.columns.salary).toBeInstanceOf(Float64Array);
  });
});
