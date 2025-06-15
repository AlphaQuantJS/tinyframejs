/**
 * Tests for the max method in Series
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series.js';
import {
  max,
  register,
} from '../../../../src/methods/series/aggregation/max.js';

describe('Series max', () => {
  // Register the method before running tests
  beforeAll(() => {
    register(Series);
  });

  it('should find the maximum value in a Series', () => {
    // Arrange
    const series = new Series([1, 2, 3, 4, 5]);

    // Act
    const result = series.max();

    // Assert
    expect(result).toBe(5);
    expect(typeof result).toBe('number');
  });

  it('should return null for an empty Series', () => {
    // Arrange
    const series = new Series([]);

    // Act
    const result = series.max();

    // Assert
    expect(result).toBe(null);
  });

  it('should ignore null, undefined, and NaN values', () => {
    // Arrange
    const series = new Series([1, null, 3, undefined, 5, NaN]);

    // Act
    const result = series.max();

    // Assert
    expect(result).toBe(5);
  });

  it('should convert string values to numbers when possible', () => {
    // Arrange
    const series = new Series(['1', '2', '10']);

    // Act
    const result = series.max();

    // Assert
    expect(result).toBe(10);
  });

  it('should return null when Series contains only non-numeric strings', () => {
    // Arrange
    const series = new Series(['a', 'b', 'c']);

    // Act
    const result = series.max();

    // Assert
    expect(result).toBe(null);
  });

  it('should handle negative numbers correctly', () => {
    // Arrange
    const series = new Series([-5, -3, -10, -1]);

    // Act
    const result = series.max();

    // Assert
    expect(result).toBe(-1);
  });

  // Test the direct function as well
  it('should work when called as a function', () => {
    // Arrange
    const series = new Series([1, 5, 3]);

    // Act
    const result = max(series);

    // Assert
    expect(result).toBe(5);
  });
});
