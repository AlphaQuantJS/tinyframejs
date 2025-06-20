/**
 * Unit tests for Series.js
 */

import { Series } from '../../../../packages/core/src/data/model/Series.js';
import { describe, test, expect, vi } from 'vitest';

/**
 * Tests for the Series class
 * Verifies Series creation, data access, and manipulation methods
 */
describe('Series', () => {
  // Mock the shouldUseArrow function to avoid issues with data iteration
  vi.mock(
    '../../../../packages/core/src/data/strategy/shouldUseArrow.js',
    () => ({
      shouldUseArrow: () => false,
    }),
  );
  // Sample test data
  const sampleData = [1, 2, 3, 4, 5];

  /**
   * Tests creating a Series instance from array data
   */
  test('should create a Series instance from array data', () => {
    const series = new Series(sampleData);

    expect(series).toBeInstanceOf(Series);
    expect(series.length).toBe(5);
    expect(series.values).toEqual(sampleData);
  });

  /**
   * Tests creating a Series using static factory method
   */
  test('should create a Series using static factory method', () => {
    const series = Series.create(sampleData);

    expect(series).toBeInstanceOf(Series);
    expect(series.length).toBe(5);
    expect(series.values).toEqual(sampleData);
  });

  /**
   * Tests creating a Series with a name
   */
  test('should create a Series with a name', () => {
    const series = new Series(sampleData, { name: 'test' });

    expect(series.name).toBe('test');
  });

  /**
   * Tests accessing values by index
   */
  test('should access values by index', () => {
    const series = new Series(sampleData);

    expect(series.get(0)).toBe(1);
    expect(series.get(2)).toBe(3);
    expect(series.get(4)).toBe(5);
  });

  /**
   * Tests converting Series to array
   */
  test('should convert Series to array', () => {
    const series = new Series(sampleData);
    const array = series.toArray();

    expect(array).toEqual(sampleData);
  });

  /**
   * Tests mapping values
   */
  test('should map values using a function', () => {
    const series = new Series(sampleData);
    const result = series.map((x) => x * 2);

    expect(result).toBeInstanceOf(Series);
    expect(result.values).toEqual([2, 4, 6, 8, 10]);
  });

  /**
   * Tests filtering values
   */
  test('should filter values using a predicate', () => {
    const series = new Series(sampleData);
    const result = series.filter((x) => x > 3);

    expect(result).toBeInstanceOf(Series);
    expect(result.values).toEqual([4, 5]);
  });

  /**
   * Tests string representation
   */
  test('should generate string representation', () => {
    const series = new Series(sampleData);
    const str = series.toString();

    expect(str).toBe('Series(1, 2, 3, 4, 5)');
  });

  /**
   * Tests string representation with truncation
   */
  test('should truncate string representation for long series', () => {
    const longData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const series = new Series(longData);
    const str = series.toString();

    expect(str).toContain('1, 2, 3, 4, 5');
    expect(str).toContain('10 items');
  });
});
