/**
 * Tests for the count method in Series
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series.js';
import {
  count,
  register,
} from '../../../../src/methods/series/aggregation/count.js';

describe('Series count', () => {
  // Register the method before running tests
  beforeAll(() => {
    register(Series);
  });

  it('should count non-null, non-undefined, non-NaN values in a Series', () => {
    // Arrange
    const series = new Series([1, 2, 3, 4, 5]);

    // Act
    const result = series.count();

    // Assert
    expect(result).toBe(5);
    expect(typeof result).toBe('number');
  });

  it('should return 0 for an empty Series', () => {
    // Arrange
    const series = new Series([]);

    // Act
    const result = series.count();

    // Assert
    expect(result).toBe(0);
  });

  it('should ignore null, undefined, and NaN values', () => {
    // Arrange
    const series = new Series([1, null, 3, undefined, 5, NaN]);

    // Act
    const result = series.count();

    // Assert
    expect(result).toBe(3); // Only 1, 3, and 5 are valid values
  });

  it('should count string values', () => {
    // Arrange
    const series = new Series(['a', 'b', 'c']);

    // Act
    const result = series.count();

    // Assert
    expect(result).toBe(3);
  });

  it('should count mixed values', () => {
    // Arrange
    const series = new Series([1, 'a', true, {}, []]);

    // Act
    const result = series.count();

    // Assert
    expect(result).toBe(5); // All values are valid
  });

  // Test the direct function as well
  it('should work when called as a function', () => {
    // Arrange
    const series = new Series([1, 2, 3, null, undefined]);

    // Act
    const result = count(series);

    // Assert
    expect(result).toBe(3);
  });
});
