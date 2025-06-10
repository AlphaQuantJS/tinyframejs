/**
 * Tests for Series std method
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series.js';
import {
  std,
  register,
} from '../../../../src/methods/series/aggregation/std.js';

describe('Series std', () => {
  // Register the method before running tests
  beforeAll(() => {
    register(Series);
  });

  it('should calculate standard deviation correctly', () => {
    // Arrange
    const series = new Series([2, 4, 4, 4, 5, 5, 7, 9]);

    // Act
    const result = series.std();

    // Assert
    expect(result).toBeCloseTo(2.138, 3); // Sample standard deviation
  });

  it('should calculate population standard deviation when population=true', () => {
    // Arrange
    const series = new Series([2, 4, 4, 4, 5, 5, 7, 9]);

    // Act
    const result = series.std({ population: true });

    // Assert
    expect(result).toBeCloseTo(2, 3); // Population standard deviation
  });

  it('should return 0 for a Series with a single value', () => {
    // Arrange
    const series = new Series([5]);

    // Act
    const result = series.std();

    // Assert
    expect(result).toBe(0);
  });

  it('should return null for an empty Series', () => {
    // Arrange
    const series = new Series([]);

    // Act
    const result = series.std();

    // Assert
    expect(result).toBe(null);
  });

  it('should convert string values to numbers when possible', () => {
    // Arrange
    const series = new Series(['2', '4', '6']);

    // Act
    const result = series.std();

    // Assert
    expect(result).toBeCloseTo(2, 3);
  });

  it('should ignore null, undefined, and NaN values', () => {
    // Arrange
    const series = new Series([2, null, 4, undefined, 6, NaN]);

    // Act
    const result = series.std();

    // Assert
    expect(result).toBeCloseTo(2, 3); // Standard deviation of [2, 4, 6]
  });

  it('should return null when Series contains only non-numeric strings', () => {
    // Arrange
    const series = new Series(['a', 'b', 'c']);

    // Act
    const result = series.std();

    // Assert
    expect(result).toBe(null);
  });

  // Test the direct function as well
  it('should work when called as a function', () => {
    // Arrange
    const series = new Series([2, 4, 6]);

    // Act
    const result = std(series);

    // Assert
    expect(result).toBeCloseTo(2, 3);
  });
});
