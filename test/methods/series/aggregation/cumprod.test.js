/**
 * Tests for Series cumprod method
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series.js';
import {
  cumprod,
  register,
} from '../../../../src/methods/series/aggregation/cumprod.js';

describe('Series cumprod', () => {
  // Register the method before running tests
  beforeAll(() => {
    register(Series);
  });

  it('should calculate cumulative product correctly for positive numbers', () => {
    // Arrange
    const series = new Series([1, 2, 3, 4, 5]);

    // Act
    const result = series.cumprod();

    // Assert
    expect(result.toArray()).toEqual([1, 2, 6, 24, 120]);
  });

  it('should calculate cumulative product correctly for mixed positive and negative numbers', () => {
    // Arrange
    const series = new Series([1, -2, 3, -4, 5]);

    // Act
    const result = series.cumprod();

    // Assert
    expect(result.toArray()).toEqual([1, -2, -6, 24, 120]);
  });

  it('should return an empty Series for an empty Series', () => {
    // Arrange
    const series = new Series([]);

    // Act
    const result = series.cumprod();

    // Assert
    expect(result.toArray()).toEqual([]);
  });

  it('should convert string values to numbers when possible', () => {
    // Arrange
    const series = new Series(['1', '2', '3', '4', '5']);

    // Act
    const result = series.cumprod();

    // Assert
    expect(result.toArray()).toEqual([1, 2, 6, 24, 120]);
  });

  it('should handle null values by preserving them in the result', () => {
    // Arrange
    const series = new Series([1, null, 3, null, 5]);

    // Act
    const result = series.cumprod();

    // Assert
    expect(result.toArray()).toEqual([1, null, 3, null, 15]);
  });

  it('should handle undefined values by preserving them as null in the result', () => {
    // Arrange
    const series = new Series([1, undefined, 3, undefined, 5]);

    // Act
    const result = series.cumprod();

    // Assert
    expect(result.toArray()).toEqual([1, null, 3, null, 15]);
  });

  it('should handle NaN values by preserving them as null in the result', () => {
    // Arrange
    const series = new Series([1, NaN, 3, NaN, 5]);

    // Act
    const result = series.cumprod();

    // Assert
    expect(result.toArray()).toEqual([1, null, 3, null, 15]);
  });

  it('should handle zero values correctly', () => {
    // Arrange
    const series = new Series([1, 2, 0, 4, 5]);

    // Act
    const result = series.cumprod();

    // Assert
    expect(result.toArray()).toEqual([1, 2, 0, 0, 0]);
  });

  it('should return a Series with null values for non-numeric strings', () => {
    // Arrange
    const series = new Series(['a', 'b', 'c']);

    // Act
    const result = series.cumprod();

    // Assert
    expect(result.toArray()).toEqual([null, null, null]);
  });

  it('should handle mixed numeric and non-numeric values', () => {
    // Arrange
    const series = new Series([1, 'a', 3, 'b', 5]);

    // Act
    const result = series.cumprod();

    // Assert
    expect(result.toArray()).toEqual([1, null, 3, null, 15]);
  });

  // Test the direct function as well
  it('should work when called as a function', () => {
    // Arrange
    const series = new Series([1, 2, 3, 4, 5]);

    // Act
    const result = cumprod(series);

    // Assert
    expect(result.toArray()).toEqual([1, 2, 6, 24, 120]);
  });
});
