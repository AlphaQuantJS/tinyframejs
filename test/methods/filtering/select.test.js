/**
 * Unit tests for select method
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../src/core/DataFrame.js';

describe('Select Method', () => {
  // Sample data for testing
  const data = {
    name: ['Alice', 'Bob', 'Charlie'],
    age: [25, 30, 35],
    city: ['New York', 'San Francisco', 'Chicago'],
    salary: [70000, 85000, 90000],
  };

  test('should select specific columns', () => {
    const df = DataFrame.create(data);
    const result = df.select(['name', 'age']);

    // Check that only the selected columns exist
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
    expect(() => df.select(['name', 'nonexistent'])).toThrow();
  });

  test('should throw error for non-array input', () => {
    const df = DataFrame.create(data);
    expect(() => df.select('name')).toThrow();
  });

  test('should handle empty array input', () => {
    const df = DataFrame.create(data);
    const result = df.select([]);
    expect(result.columns).toEqual([]);
    expect(result.rowCount).toBe(0);
  });

  test('should return a new DataFrame instance', () => {
    const df = DataFrame.create(data);
    const result = df.select(['name', 'age']);
    expect(result).toBeInstanceOf(DataFrame);
    expect(result).not.toBe(df); // Should be a new instance
  });
});
