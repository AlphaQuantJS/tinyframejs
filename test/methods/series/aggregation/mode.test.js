/**
 * Tests for Series mode method
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series.js';
import {
  mode,
  register,
} from '../../../../src/methods/series/aggregation/mode.js';

describe('Series mode', () => {
  // Register the method before running tests
  beforeAll(() => {
    register(Series);
  });

  it('should find the most frequent value in a Series', () => {
    // Arrange
    const series = new Series([1, 2, 2, 3, 2, 4, 5]);

    // Act
    const result = series.mode();

    // Assert
    expect(result).toBe(2);
  });

  it('should return the first encountered mode if multiple values have the same frequency', () => {
    // Arrange
    const series = new Series([1, 2, 2, 3, 3, 4]);

    // Act
    const result = series.mode();

    // Assert
    expect(result).toBe(2); // 2 appears first, so it's returned as the mode
  });

  it('should return null for an empty Series', () => {
    // Arrange
    const series = new Series([]);

    // Act
    const result = series.mode();

    // Assert
    expect(result).toBe(null);
  });

  it('should ignore null, undefined, and NaN values', () => {
    // Arrange
    const series = new Series([10, null, 3, undefined, 10, NaN]);

    // Act
    const result = series.mode();

    // Assert
    expect(result).toBe(10); // Mode of [10, 3, 10] is 10
  });

  it('should handle string values', () => {
    // Arrange
    const series = new Series(['apple', 'banana', 'apple', 'cherry']);

    // Act
    const result = series.mode();

    // Assert
    expect(result).toBe('apple');
  });

  it('should return null when Series contains only null/undefined/NaN values', () => {
    // Arrange
    const series = new Series([null, undefined, NaN]);

    // Act
    const result = series.mode();

    // Assert
    expect(result).toBe(null);
  });

  it('should handle object values', () => {
    // Arrange
    const obj1 = { id: 1 };
    const obj2 = { id: 2 };
    const series = new Series([obj1, obj2, obj1]);

    // Act
    const result = series.mode();

    // Assert
    expect(result).toBe(obj1);
  });

  // Test the direct function as well
  it('should work when called as a function', () => {
    // Arrange
    const series = new Series([1, 2, 2, 3, 2, 4, 5]);

    // Act
    const result = mode(series);

    // Assert
    expect(result).toBe(2);
  });
});
