/**
 * Tests for the min method in Series
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series.js';
import {
  min,
  register,
} from '../../../../src/methods/series/aggregation/min.js';

describe('Series min', () => {
  // Register the method before running tests
  beforeAll(() => {
    register(Series);
  });

  it('should find the minimum value in a Series', () => {
    // Arrange
    const series = new Series([5, 3, 1, 4, 2]);

    // Act
    const result = series.min();

    // Assert
    expect(result).toBe(1);
    expect(typeof result).toBe('number');
  });

  it('should return null for an empty Series', () => {
    // Arrange
    const series = new Series([]);

    // Act
    const result = series.min();

    // Assert
    expect(result).toBe(null);
  });

  it('should ignore null, undefined, and NaN values', () => {
    // Arrange
    const series = new Series([10, null, 3, undefined, 5, NaN]);

    // Act
    const result = series.min();

    // Assert
    expect(result).toBe(3);
  });

  it('should convert string values to numbers when possible', () => {
    // Arrange
    const series = new Series(['10', '2', '5']);

    // Act
    const result = series.min();

    // Assert
    expect(result).toBe(2);
  });

  it('should return null when Series contains only non-numeric strings', () => {
    // Arrange
    const series = new Series(['a', 'b', 'c']);

    // Act
    const result = series.min();

    // Assert
    expect(result).toBe(null);
  });

  it('should handle negative numbers correctly', () => {
    // Arrange
    const series = new Series([-5, -3, -10, -1]);

    // Act
    const result = series.min();

    // Assert
    expect(result).toBe(-10);
  });

  // Test the direct function as well
  it('should work when called as a function', () => {
    // Arrange
    const series = new Series([5, 2, 3]);

    // Act
    const result = min(series);

    // Assert
    expect(result).toBe(2);
  });
});
