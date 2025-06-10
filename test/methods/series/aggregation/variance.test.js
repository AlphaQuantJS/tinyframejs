/**
 * Tests for Series variance method
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series.js';
import {
  variance,
  register,
} from '../../../../src/methods/series/aggregation/variance.js';

describe('Series variance', () => {
  // Register the method before running tests
  beforeAll(() => {
    register(Series);
  });

  it('should calculate variance correctly', () => {
    // Arrange
    const series = new Series([2, 4, 4, 4, 5, 5, 7, 9]);

    // Act
    const result = series.variance();

    // Assert
    expect(result).toBeCloseTo(4.571, 3); // Sample variance
  });

  it('should calculate population variance when population=true', () => {
    // Arrange
    const series = new Series([2, 4, 4, 4, 5, 5, 7, 9]);

    // Act
    const result = series.variance({ population: true });

    // Assert
    expect(result).toBeCloseTo(4, 3); // Population variance
  });

  it('should return 0 for a Series with a single value', () => {
    // Arrange
    const series = new Series([5]);

    // Act
    const result = series.variance();

    // Assert
    expect(result).toBe(0);
  });

  it('should return null for an empty Series', () => {
    // Arrange
    const series = new Series([]);

    // Act
    const result = series.variance();

    // Assert
    expect(result).toBe(null);
  });

  it('should convert string values to numbers when possible', () => {
    // Arrange
    const series = new Series(['2', '4', '6']);

    // Act
    const result = series.variance();

    // Assert
    expect(result).toBeCloseTo(4, 3);
  });

  it('should ignore null, undefined, and NaN values', () => {
    // Arrange
    const series = new Series([2, null, 4, undefined, 6, NaN]);

    // Act
    const result = series.variance();

    // Assert
    expect(result).toBeCloseTo(4, 3); // Variance of [2, 4, 6]
  });

  it('should return null when Series contains only non-numeric strings', () => {
    // Arrange
    const series = new Series(['a', 'b', 'c']);

    // Act
    const result = series.variance();

    // Assert
    expect(result).toBe(null);
  });

  // Test the direct function as well
  it('should work when called as a function', () => {
    // Arrange
    const series = new Series([2, 4, 6]);

    // Act
    const result = variance(series);

    // Assert
    expect(result).toBeCloseTo(4, 3);
  });
});
