/**
 * Tests for the sum method in Series
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series.js';
import {
  sum,
  register,
} from '../../../../src/methods/series/aggregation/sum.js';

describe('Series sum', () => {
  // Register the method before running tests
  beforeAll(() => {
    register(Series);
  });

  it('should calculate the sum of values in a Series', () => {
    // Arrange
    const series = new Series([1, 2, 3, 4, 5]);

    // Act
    const result = series.sum();

    // Assert
    expect(result).toBe(15);
    expect(typeof result).toBe('number');
  });

  it('should return 0 for an empty Series', () => {
    // Arrange
    const series = new Series([]);

    // Act
    const result = series.sum();

    // Assert
    expect(result).toBe(0);
  });

  it('should ignore null and undefined values', () => {
    // Arrange
    const series = new Series([1, null, 3, undefined, 5]);

    // Act
    const result = series.sum();

    // Assert
    expect(result).toBe(9);
  });

  it('should convert string values to numbers when possible', () => {
    // Arrange
    const series = new Series(['1', '2', '3']);

    // Act
    const result = series.sum();

    // Assert
    expect(result).toBe(6);
  });

  it('should return 0 when Series contains non-numeric strings', () => {
    // Arrange
    const series = new Series(['a', 'b', 'c']);

    // Act
    const result = series.sum();

    // Assert
    expect(result).toBe(0);
  });

  // Test the direct function as well
  it('should work when called as a function', () => {
    // Arrange
    const series = new Series([1, 2, 3]);

    // Act
    const result = sum(series);

    // Assert
    expect(result).toBe(6);
  });
});
