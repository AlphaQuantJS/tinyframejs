/**
 * Tests for the median method in Series
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series.js';
import {
  median,
  register,
} from '../../../../src/methods/series/aggregation/median.js';

describe('Series median', () => {
  // Register the method before running tests
  beforeAll(() => {
    register(Series);
  });

  it('should find the median value in a Series with odd number of elements', () => {
    // Arrange
    const series = new Series([1, 3, 2, 5, 4]);

    // Act
    const result = series.median();

    // Assert
    expect(result).toBe(3);
    expect(typeof result).toBe('number');
  });

  it('should find the median value in a Series with even number of elements', () => {
    // Arrange
    const series = new Series([1, 3, 2, 4]);

    // Act
    const result = series.median();

    // Assert
    expect(result).toBe(2.5); // (2 + 3) / 2 = 2.5
  });

  it('should return null for an empty Series', () => {
    // Arrange
    const series = new Series([]);

    // Act
    const result = series.median();

    // Assert
    expect(result).toBe(null);
  });

  it('should ignore null, undefined, and NaN values', () => {
    // Arrange
    const series = new Series([10, null, 3, undefined, 5, NaN]);

    // Act
    const result = series.median();

    // Assert
    expect(result).toBe(5); // Median of [10, 3, 5] is 5
  });

  it('should convert string values to numbers when possible', () => {
    // Arrange
    const series = new Series(['10', '2', '5']);

    // Act
    const result = series.median();

    // Assert
    expect(result).toBe(5);
  });

  it('should return null when Series contains only non-numeric strings', () => {
    // Arrange
    const series = new Series(['a', 'b', 'c']);

    // Act
    const result = series.median();

    // Assert
    expect(result).toBe(null);
  });

  it('should handle negative numbers correctly', () => {
    // Arrange
    const series = new Series([-5, -3, -10, -1]);

    // Act
    const result = series.median();

    // Assert
    expect(result).toBe(-4); // Median of [-10, -5, -3, -1] is (-5 + -3) / 2 = -4
  });

  // Test the direct function as well
  it('should work when called as a function', () => {
    // Arrange
    const series = new Series([1, 2, 3, 4, 5]);

    // Act
    const result = median(series);

    // Assert
    expect(result).toBe(3);
  });
});
