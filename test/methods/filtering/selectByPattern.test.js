/**
 * Unit tests for selectByPattern method
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../src/core/DataFrame.js';

describe('SelectByPattern Method', () => {
  // Sample data for testing
  const data = {
    name: ['Alice', 'Bob', 'Charlie'],
    age: [25, 30, 35],
    city: ['New York', 'San Francisco', 'Chicago'],
    salary: [70000, 85000, 90000],
    ageGroup: ['20-30', '30-40', '30-40'],
  };

  test('should select columns matching a pattern', () => {
    const df = DataFrame.create(data);
    const result = df.selectByPattern('^a');

    // Check that only columns starting with 'a' exist
    expect(result.columns.sort()).toEqual(['age', 'ageGroup'].sort());
    expect(result.columns).not.toContain('name');
    expect(result.columns).not.toContain('city');
    expect(result.columns).not.toContain('salary');

    // Check that the data is correct
    expect(result.toArray()).toEqual([
      { age: 25, ageGroup: '20-30' },
      { age: 30, ageGroup: '30-40' },
      { age: 35, ageGroup: '30-40' },
    ]);
  });

  test('should handle regex patterns', () => {
    const df = DataFrame.create(data);
    // Паттерн a.*e должен соответствовать 'age' и 'ageGroup', но не 'name'
    // потому что в 'name' буква 'a' не в начале строки
    const result = df.selectByPattern('^a.*e');

    // Should match 'age' and 'ageGroup'
    expect(result.columns.sort()).toEqual(['age', 'ageGroup'].sort());
  });

  test('should return empty DataFrame when no columns match', () => {
    const df = DataFrame.create(data);
    const result = df.selectByPattern('xyz');

    // Should have no columns
    expect(result.columns).toEqual([]);
    expect(result.rowCount).toBe(0);
  });

  test('should throw error for non-string pattern', () => {
    const df = DataFrame.create(data);
    expect(() => df.selectByPattern(123)).toThrow();
  });

  test('should return a new DataFrame instance', () => {
    const df = DataFrame.create(data);
    const result = df.selectByPattern('^a');
    expect(result).toBeInstanceOf(DataFrame);
    expect(result).not.toBe(df); // Should be a new instance
  });

  test('should preserve typed arrays', () => {
    // Create DataFrame with typed arrays
    const typedData = {
      name: ['Alice', 'Bob', 'Charlie'],
      age: new Int32Array([25, 30, 35]),
      salary: new Float64Array([70000, 85000, 90000]),
    };

    const df = DataFrame.create(typedData);
    const result = df.selectByPattern('^a');

    // Check that the result has the same array types
    expect(result.frame.columns.age).toBeInstanceOf(Int32Array);
  });
});
