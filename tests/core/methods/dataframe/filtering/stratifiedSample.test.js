/**
 * Unit tests for stratifiedSample method
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../../../packages/core/src/data/model/DataFrame.js';
import { stratifiedSample } from '../../../../../packages/core/src/methods/dataframe/filtering/stratifiedSample.js';

// Test data for use in all tests
const testData = [
  { category: 'A', value: 1 },
  { category: 'A', value: 2 },
  { category: 'A', value: 3 },
  { category: 'A', value: 4 },
  { category: 'B', value: 5 },
  { category: 'B', value: 6 },
  { category: 'C', value: 7 },
  { category: 'C', value: 8 },
  { category: 'C', value: 9 },
];

describe('StratifiedSample Method', () => {
  // Add stratifiedSample method to DataFrame prototype
  DataFrame.prototype.stratifiedSample = function(column, n, options) {
    return stratifiedSample(this, column, n, options);
  };

  describe('with standard storage', () => {
    // Create DataFrame using fromRecords
    const df = DataFrame.fromRecords(testData);

    test('should sample proportionally from each category', () => {
      const result = df.stratifiedSample('category', 4);

      // Check that the result has 4 rows
      expect(result.rowCount).toBe(4);
      
      // Check that each category is represented proportionally
      const categoryCounts = {};
      result.toArray().forEach(row => {
        categoryCounts[row.category] = (categoryCounts[row.category] || 0) + 1;
      });
      
      // Category A should have ~2 rows (4/9 * 4 ~= 1.78)
      // Category B should have ~1 row (2/9 * 4 ~= 0.89)
      // Category C should have ~1 row (3/9 * 4 ~= 1.33)
      // Due to rounding and randomness, we can't check exact counts,
      // but we can check that all categories are represented
      expect(Object.keys(categoryCounts).sort()).toEqual(['A', 'B', 'C']);
    });

    test('should sample with fixed seed for deterministic results', () => {
      const sample1 = df.stratifiedSample('category', 4, { seed: 42 });
      const sample2 = df.stratifiedSample('category', 4, { seed: 42 });

      // Compare the sampled rows
      const rows1 = sample1.toArray();
      const rows2 = sample2.toArray();

      expect(rows1).toEqual(rows2);
    });

    test('should throw error for non-existent column', () => {
      expect(() => df.stratifiedSample('nonexistent', 4)).toThrow('Column not found');
    });

    test('should throw error for negative n', () => {
      expect(() => df.stratifiedSample('category', -1)).toThrow('Number of rows to sample must be a positive number');
    });

    test('should throw error for non-integer n', () => {
      expect(() => df.stratifiedSample('category', 2.5)).toThrow('Number of rows to sample must be an integer');
    });

    test('should throw error when n > rows', () => {
      expect(() => df.stratifiedSample('category', 10)).toThrow('Sample size (10) cannot be greater than number of rows (9)');
    });

    test('should return a new DataFrame instance', () => {
      const result = df.stratifiedSample('category', 4);
      expect(result).toBeInstanceOf(DataFrame);
      expect(result).not.toBe(df); // Should be a new instance
    });

    test('should preserve typed arrays', () => {
      // Create DataFrame with typed arrays
      const typedDf = DataFrame.fromRecords(testData, {
        columns: {
          value: { type: 'int32' },
        },
      });

      // Sample the data with a fixed seed for deterministic results
      const result = typedDf.stratifiedSample('category', 4, { seed: 42 });

      // Check that the result contains typed arrays
      expect(result._columns.value.vector.__data).toBeInstanceOf(Int32Array);
    });

    test('should handle empty DataFrame', () => {
      const emptyDf = DataFrame.fromRecords([]);
      
      expect(() => emptyDf.stratifiedSample('category', 1)).toThrow('DataFrame is empty');
    });

    test('should handle DataFrame with single category', () => {
      const singleCategoryData = [
        { category: 'A', value: 1 },
        { category: 'A', value: 2 },
        { category: 'A', value: 3 },
      ];
      const singleCategoryDf = DataFrame.fromRecords(singleCategoryData);
      
      const result = singleCategoryDf.stratifiedSample('category', 2);
      
      expect(result.rowCount).toBe(2);
      expect(result.toArray().every(row => row.category === 'A')).toBe(true);
    });

    test('should handle frac option instead of n', () => {
      const result = df.stratifiedSample('category', { frac: 0.5 });
      
      // Should sample approximately half the rows
      expect(result.rowCount).toBeGreaterThanOrEqual(4);
      expect(result.rowCount).toBeLessThanOrEqual(5);
      
      // All categories should be represented
      const categories = new Set(result.toArray().map(row => row.category));
      expect([...categories].sort()).toEqual(['A', 'B', 'C']);
    });
  });
});
