/**
 * Tests for Series filter method
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series.js';
import {
  filter,
  register,
} from '../../../../src/methods/series/filtering/filter.js';

describe('Series filter', () => {
  // Register the method before running tests
  beforeAll(() => {
    register(Series);
  });

  it('should filter values based on a predicate', () => {
    // Arrange
    const series = new Series([1, 2, 3, 4, 5]);

    // Act
    const filtered = series.filter((value) => value > 3);

    // Assert
    expect(filtered.toArray()).toEqual([4, 5]);
  });

  it('should return an empty Series when no values match the predicate', () => {
    // Arrange
    const series = new Series([1, 2, 3]);

    // Act
    const filtered = series.filter((value) => value > 5);

    // Assert
    expect(filtered.toArray()).toEqual([]);
  });

  it('should handle null and undefined values', () => {
    // Arrange
    const series = new Series([1, null, 3, undefined, 5]);

    // Act
    const filtered = series.filter(
      (value) => value !== null && value !== undefined,
    );

    // Assert
    expect(filtered.toArray()).toEqual([1, 3, 5]);
  });

  it('should handle string values', () => {
    // Arrange
    const series = new Series(['apple', 'banana', 'cherry']);

    // Act
    const filtered = series.filter((value) => value.startsWith('a'));

    // Assert
    expect(filtered.toArray()).toEqual(['apple']);
  });

  it('should return a new Series instance', () => {
    // Arrange
    const series = new Series([1, 2, 3]);

    // Act
    const filtered = series.filter((value) => value > 1);

    // Assert
    expect(filtered).toBeInstanceOf(Series);
    expect(filtered).not.toBe(series);
  });

  // Test the direct function as well
  it('should work when called as a function', () => {
    // Arrange
    const series = new Series([1, 2, 3, 4, 5]);

    // Act
    const filtered = filter(series, (value) => value > 3);

    // Assert
    expect(filtered.toArray()).toEqual([4, 5]);
    expect(filtered).toBeInstanceOf(Series);
    expect(filtered).not.toBe(series);
  });
});
