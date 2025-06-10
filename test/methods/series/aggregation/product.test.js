/**
 * Tests for Series product method
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series.js';
import {
  product,
  register,
} from '../../../../src/methods/series/aggregation/product.js';

describe('Series product', () => {
  // Register the method before running tests
  beforeAll(() => {
    register(Series);
  });

  it('should calculate product correctly for positive numbers', () => {
    // Arrange
    const series = new Series([2, 3, 4]);

    // Act
    const result = series.product();

    // Assert
    expect(result).toBe(24); // 2 * 3 * 4 = 24
  });

  it('should calculate product correctly for mixed positive and negative numbers', () => {
    // Arrange
    const series = new Series([2, -3, 4]);

    // Act
    const result = series.product();

    // Assert
    expect(result).toBe(-24); // 2 * (-3) * 4 = -24
  });

  it('should handle zero in the series', () => {
    // Arrange
    const series = new Series([2, 0, 4]);

    // Act
    const result = series.product();

    // Assert
    expect(result).toBe(0); // 2 * 0 * 4 = 0
  });

  it('should return 1 for a Series with a single value of 1', () => {
    // Arrange
    const series = new Series([1]);

    // Act
    const result = series.product();

    // Assert
    expect(result).toBe(1);
  });

  it('should return null for an empty Series', () => {
    // Arrange
    const series = new Series([]);

    // Act
    const result = series.product();

    // Assert
    expect(result).toBe(null);
  });

  it('should convert string values to numbers when possible', () => {
    // Arrange
    const series = new Series(['2', '3', '4']);

    // Act
    const result = series.product();

    // Assert
    expect(result).toBe(24); // '2' * '3' * '4' = 24
  });

  it('should ignore null, undefined, and NaN values', () => {
    // Arrange
    const series = new Series([2, null, 3, undefined, 4, NaN]);

    // Act
    const result = series.product();

    // Assert
    expect(result).toBe(24); // 2 * 3 * 4 = 24
  });

  it('should return null when Series contains only non-numeric strings', () => {
    // Arrange
    const series = new Series(['a', 'b', 'c']);

    // Act
    const result = series.product();

    // Assert
    expect(result).toBe(null);
  });

  it('should handle decimal numbers correctly', () => {
    // Arrange
    const series = new Series([0.5, 2, 4]);

    // Act
    const result = series.product();

    // Assert
    expect(result).toBe(4); // 0.5 * 2 * 4 = 4
  });

  // Test the direct function as well
  it('should work when called as a function', () => {
    // Arrange
    const series = new Series([2, 3, 4]);

    // Act
    const result = product(series);

    // Assert
    expect(result).toBe(24); // 2 * 3 * 4 = 24
  });
});
