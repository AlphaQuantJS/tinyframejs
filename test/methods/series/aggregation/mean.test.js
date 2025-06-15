/**
 * Tests for the mean method in Series
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series.js';
import {
  mean,
  register,
} from '../../../../src/methods/series/aggregation/mean.js';

describe('Series mean', () => {
  // Register the method before running tests
  beforeAll(() => {
    register(Series);
  });

  it('should calculate the mean of values in a Series', () => {
    // Arrange
    const series = new Series([1, 2, 3, 4, 5]);

    // Act
    const result = series.mean();

    // Assert
    expect(result).toBe(3);
    expect(typeof result).toBe('number');
  });

  it('should return null for an empty Series', () => {
    // Arrange
    const series = new Series([]);

    // Act
    const result = series.mean();

    // Assert
    expect(result).toBeNull();
  });

  it('should handle null and undefined values', () => {
    // Arrange
    const series = new Series([1, null, 3, undefined, 5]);

    // Act
    const result = series.mean();

    // Assert
    expect(result).toBe(3); // (1 + 3 + 5) / 3 = 3
  });

  it('should convert string values to numbers when possible', () => {
    // Arrange
    const series = new Series(['1', '2', '3']);

    // Act
    const result = series.mean();

    // Assert
    expect(result).toBe(2);
  });

  it('should return null when Series contains only non-numeric strings', () => {
    // Arrange
    const series = new Series(['a', 'b', 'c']);

    // Act
    const result = series.mean();

    // Assert
    expect(result).toBeNull();
  });

  // Test the direct function as well
  it('should work when called as a function', () => {
    // Arrange
    const series = new Series([1, 2, 3]);

    // Act
    const result = mean(series);

    // Assert
    expect(result).toBe(2);
  });
});
