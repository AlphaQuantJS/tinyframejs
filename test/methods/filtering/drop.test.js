/**
 * Unit tests for drop method
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../src/core/DataFrame.js';

describe('Drop Method', () => {
  // Sample data for testing
  const data = {
    name: ['Alice', 'Bob', 'Charlie'],
    age: [25, 30, 35],
    city: ['New York', 'San Francisco', 'Chicago'],
    salary: [70000, 85000, 90000],
  };

  test('should drop specified columns', () => {
    const df = DataFrame.create(data);
    const result = df.drop(['city', 'salary']);

    // Check that dropped columns don't exist
    expect(result.columns).toEqual(['name', 'age']);
    expect(result.columns).not.toContain('city');
    expect(result.columns).not.toContain('salary');

    // Check that the data is correct
    expect(result.toArray()).toEqual([
      { name: 'Alice', age: 25 },
      { name: 'Bob', age: 30 },
      { name: 'Charlie', age: 35 },
    ]);
  });

  test('should throw error for non-existent columns', () => {
    const df = DataFrame.create(data);
    expect(() => df.drop(['city', 'nonexistent'])).toThrow();
  });

  test('should throw error for non-array input', () => {
    const df = DataFrame.create(data);
    expect(() => df.drop('city')).toThrow();
  });

  test('should handle empty array input', () => {
    const df = DataFrame.create(data);
    const result = df.drop([]);

    // Should keep all columns
    expect(result.columns.sort()).toEqual(
      ['age', 'city', 'name', 'salary'].sort(),
    );
    expect(result.rowCount).toBe(3);
  });

  test('should return a new DataFrame instance', () => {
    const df = DataFrame.create(data);
    const result = df.drop(['city', 'salary']);
    expect(result).toBeInstanceOf(DataFrame);
    expect(result).not.toBe(df); // Should be a new instance
  });
});
