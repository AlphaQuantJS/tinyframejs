/**
 * Unit tests for expr$ method
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../src/core/DataFrame.js';

describe('Expr$ Method', () => {
  // Sample data for testing
  const data = {
    name: ['Alice', 'Bob', 'Charlie'],
    age: [25, 30, 35],
    city: ['New York', 'San Francisco', 'Chicago'],
    salary: [70000, 85000, 90000],
  };

  test('should filter rows based on numeric comparison', () => {
    const df = DataFrame.create(data);
    const result = df.expr$`age > 25`;

    expect(result.rowCount).toBe(2);
    expect(result.toArray()).toEqual([
      { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
      { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
    ]);
  });

  test('should filter rows based on string equality', () => {
    const df = DataFrame.create(data);
    const result = df.expr$`name == "Alice"`;

    expect(result.rowCount).toBe(1);
    expect(result.toArray()).toEqual([
      { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
    ]);
  });

  test('should filter rows based on string includes method', () => {
    const df = DataFrame.create(data);
    const result = df.expr$`city_includes("Francisco")`;

    expect(result.rowCount).toBe(1);
    expect(result.toArray()).toEqual([
      { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
    ]);
  });

  test('should support complex expressions with multiple conditions', () => {
    const df = DataFrame.create(data);
    const result = df.expr$`age > 25 && salary < 90000`;

    expect(result.rowCount).toBe(1);
    expect(result.toArray()).toEqual([
      { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
    ]);
  });

  test('should support template literal interpolation', () => {
    const df = DataFrame.create(data);
    const minAge = 30;
    const result = df.expr$`age >= ${minAge}`;

    expect(result.rowCount).toBe(2);
    expect(result.toArray()).toEqual([
      { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
      { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
    ]);
  });

  test('should return empty DataFrame when no rows match', () => {
    const df = DataFrame.create(data);
    const result = df.expr$`age > 100`;

    expect(result.rowCount).toBe(0);
    expect(result.toArray()).toEqual([]);
  });

  test('should throw error for invalid expression', () => {
    const df = DataFrame.create(data);
    expect(() => df.expr$`invalid syntax here`).toThrow();
  });

  test('should preserve typed arrays', () => {
    // Create DataFrame with typed arrays
    const typedData = {
      name: ['Alice', 'Bob', 'Charlie'],
      age: new Int32Array([25, 30, 35]),
      salary: new Float64Array([70000, 85000, 90000]),
    };

    const df = DataFrame.create(typedData);
    const result = df.expr$`age > 25`;

    // Check that the result has the same array types
    expect(result.frame.columns.age).toBeInstanceOf(Int32Array);
    expect(result.frame.columns.salary).toBeInstanceOf(Float64Array);
  });
});
