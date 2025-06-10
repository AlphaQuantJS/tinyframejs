/**
 * Tests for Series cumsum method
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series.js';
import {
  cumsum,
  register,
} from '../../../../src/methods/series/aggregation/cumsum.js';

describe('Series cumsum', () => {
  // Register the method before running tests
  beforeAll(() => {
    register(Series);
  });

  it('should calculate cumulative sum correctly for positive numbers', () => {
    // Arrange
    const series = new Series([1, 2, 3, 4, 5]);

    // Act
    const result = series.cumsum();

    // Assert
    expect(result.toArray()).toEqual([1, 3, 6, 10, 15]);
  });

  it('should calculate cumulative sum correctly for mixed positive and negative numbers', () => {
    // Arrange
    const series = new Series([1, -2, 3, -4, 5]);

    // Act
    const result = series.cumsum();

    // Assert
    expect(result.toArray()).toEqual([1, -1, 2, -2, 3]);
  });

  it('should return an empty Series for an empty Series', () => {
    // Arrange
    const series = new Series([]);

    // Act
    const result = series.cumsum();

    // Assert
    expect(result.toArray()).toEqual([]);
  });

  it('should convert string values to numbers when possible', () => {
    // Arrange
    const series = new Series(['1', '2', '3', '4', '5']);

    // Act
    const result = series.cumsum();

    // Assert
    expect(result.toArray()).toEqual([1, 3, 6, 10, 15]);
  });

  it('should handle null values by preserving them in the result', () => {
    // Arrange
    const series = new Series([1, null, 3, null, 5]);

    // Act
    const result = series.cumsum();

    // Assert
    expect(result.toArray()).toEqual([1, null, 4, null, 9]);
  });

  it('should handle undefined values by preserving them as null in the result', () => {
    // Arrange
    const series = new Series([1, undefined, 3, undefined, 5]);

    // Act
    const result = series.cumsum();

    // Assert
    expect(result.toArray()).toEqual([1, null, 4, null, 9]);
  });

  it('should handle NaN values by preserving them as null in the result', () => {
    // Arrange
    const series = new Series([1, NaN, 3, NaN, 5]);

    // Act
    const result = series.cumsum();

    // Assert
    expect(result.toArray()).toEqual([1, null, 4, null, 9]);
  });

  it('should return a Series with null values for non-numeric strings', () => {
    // Arrange
    const series = new Series(['a', 'b', 'c']);

    // Act
    const result = series.cumsum();

    // Assert
    expect(result.toArray()).toEqual([null, null, null]);
  });

  it('should handle mixed numeric and non-numeric values', () => {
    // Arrange
    const series = new Series([1, 'a', 3, 'b', 5]);

    // Act
    const result = series.cumsum();

    // Assert
    expect(result.toArray()).toEqual([1, null, 4, null, 9]);
  });

  // Test the direct function as well
  it('should work when called as a function', () => {
    // Arrange
    const series = new Series([1, 2, 3, 4, 5]);

    // Act
    const result = cumsum(series);

    // Assert
    expect(result.toArray()).toEqual([1, 3, 6, 10, 15]);
  });
});
