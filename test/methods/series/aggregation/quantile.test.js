/**
 * Tests for Series quantile method
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series.js';
import {
  quantile,
  register,
} from '../../../../src/methods/series/aggregation/quantile.js';

describe('Series quantile', () => {
  // Register the method before running tests
  beforeAll(() => {
    register(Series);
  });

  it('should calculate median (0.5 quantile) correctly', () => {
    // Arrange
    const series = new Series([1, 3, 5, 7, 9]);

    // Act
    const result = series.quantile(0.5);

    // Assert
    expect(result).toBe(5);
  });

  it('should calculate first quartile (0.25 quantile) correctly', () => {
    // Arrange
    const series = new Series([1, 3, 5, 7, 9]);

    // Act
    const result = series.quantile(0.25);

    // Assert
    // Q1 = 1 + 0.25 * (9 - 1) = 1 + 2 = 3
    expect(result).toBe(3);
  });

  it('should calculate third quartile (0.75 quantile) correctly', () => {
    // Arrange
    const series = new Series([1, 3, 5, 7, 9]);

    // Act
    const result = series.quantile(0.75);

    // Assert
    // Q3 = 1 + 0.75 * (9 - 1) = 1 + 6 = 7
    expect(result).toBe(7);
  });

  it('should handle 0 quantile (minimum)', () => {
    // Arrange
    const series = new Series([1, 3, 5, 7, 9]);

    // Act
    const result = series.quantile(0);

    // Assert
    expect(result).toBe(1);
  });

  it('should handle 1 quantile (maximum)', () => {
    // Arrange
    const series = new Series([1, 3, 5, 7, 9]);

    // Act
    const result = series.quantile(1);

    // Assert
    expect(result).toBe(9);
  });

  it('should use 0.5 as default quantile if not specified', () => {
    // Arrange
    const series = new Series([1, 3, 5, 7, 9]);

    // Act
    const result = series.quantile();

    // Assert
    expect(result).toBe(5);
  });

  it('should throw error for quantile outside [0,1] range', () => {
    // Arrange
    const series = new Series([1, 3, 5, 7, 9]);

    // Act & Assert
    expect(() => series.quantile(-0.1)).toThrow(
      'Quantile must be between 0 and 1 inclusive',
    );
    expect(() => series.quantile(1.1)).toThrow(
      'Quantile must be between 0 and 1 inclusive',
    );
  });

  it('should return null for an empty Series', () => {
    // Arrange
    const series = new Series([]);

    // Act
    const result = series.quantile(0.5);

    // Assert
    expect(result).toBe(null);
  });

  it('should convert string values to numbers when possible', () => {
    // Arrange
    const series = new Series(['1', '3', '5', '7', '9']);

    // Act
    const result = series.quantile(0.5);

    // Assert
    expect(result).toBe(5);
  });

  it('should ignore null, undefined, and NaN values', () => {
    // Arrange
    const series = new Series([1, null, 5, undefined, 9, NaN]);

    // Act
    const result = series.quantile(0.5);

    // Assert
    expect(result).toBe(5);
  });

  it('should return null when Series contains only non-numeric strings', () => {
    // Arrange
    const series = new Series(['a', 'b', 'c']);

    // Act
    const result = series.quantile(0.5);

    // Assert
    expect(result).toBe(null);
  });

  // Test the direct function as well
  it('should work when called as a function', () => {
    // Arrange
    const series = new Series([1, 3, 5, 7, 9]);

    // Act
    const result = quantile(series, 0.5);

    // Assert
    expect(result).toBe(5);
  });
});
