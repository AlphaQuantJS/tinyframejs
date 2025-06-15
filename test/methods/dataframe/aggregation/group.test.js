/**
 * Unit tests for group.js
 */

import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import { register } from '../../../../src/methods/dataframe/aggregation/register.js';
import { describe, test, expect, vi, beforeEach } from 'vitest';

/**
 * Tests for the DataFrame group and groupAgg methods
 * Verifies the functionality of the new unified API for group operations
 */
describe('DataFrame Group API', () => {
  // Mock the shouldUseArrow function to avoid issues with data iteration
  vi.mock('../../../../src/core/strategy/shouldUseArrow.js', () => ({
    shouldUseArrow: () => false,
  }));

  // Sample test data
  const sampleData = {
    category: ['A', 'B', 'A', 'B', 'C'],
    value: [10, 20, 15, 25, 30],
    count: [1, 2, 3, 4, 5],
  };

  beforeEach(() => {
    // Register the methods before each test
    register(DataFrame);
  });

  /**
   * Tests for the group method
   */
  describe('DataFrame.group', () => {
    test('should return a GroupByCore instance with all necessary methods', () => {
      const df = new DataFrame(sampleData);
      const group = df.group('category');

      // Check that the group object has all the expected methods
      expect(typeof group.agg).toBe('function');
      expect(typeof group.apply).toBe('function');
      expect(typeof group.sum).toBe('function');
      expect(typeof group.mean).toBe('function');
      expect(typeof group.min).toBe('function');
      expect(typeof group.max).toBe('function');
      expect(typeof group.count).toBe('function');
    });

    test('should perform aggregation with sum method', () => {
      const df = new DataFrame(sampleData);
      const result = df.group('category').sum('value');

      expect(result).toBeInstanceOf(DataFrame);
      expect(result.columns).toContain('category');
      expect(result.columns).toContain('value_sum');

      // Convert to array for easier testing
      const rows = result.toArray();

      // Check aggregation results
      const groupA = rows.find((r) => r.category === 'A');
      expect(groupA.value_sum).toBe(25); // 10 + 15

      const groupB = rows.find((r) => r.category === 'B');
      expect(groupB.value_sum).toBe(45); // 20 + 25
    });

    test('should perform aggregation with mean method', () => {
      const df = new DataFrame(sampleData);
      const result = df.group('category').mean('value');

      expect(result).toBeInstanceOf(DataFrame);
      expect(result.columns).toContain('category');
      expect(result.columns).toContain('value_mean');

      // Convert to array for easier testing
      const rows = result.toArray();

      // Check aggregation results
      const groupA = rows.find((r) => r.category === 'A');
      expect(groupA.value_mean).toBe(12.5); // (10 + 15) / 2

      const groupB = rows.find((r) => r.category === 'B');
      expect(groupB.value_mean).toBe(22.5); // (20 + 25) / 2
    });

    test('should support custom operations with apply method', () => {
      const df = new DataFrame(sampleData);
      const result = df.group('category').apply((group) => {
        // group is a DataFrame for the current group
        const valueSum = group
          .col('value')
          .values.reduce((sum, val) => sum + val, 0);
        const countSum = group
          .col('count')
          .values.reduce((sum, val) => sum + val, 0);
        return {
          ratio: valueSum / countSum,
          total: valueSum,
        };
      });

      expect(result).toBeInstanceOf(DataFrame);
      expect(result.columns).toContain('category');
      expect(result.columns).toContain('ratio');
      expect(result.columns).toContain('total');

      // Convert to array for easier testing
      const rows = result.toArray();

      // Check aggregation results
      const groupA = rows.find((r) => r.category === 'A');
      expect(groupA.total).toBe(25);
      expect(groupA.ratio).toBe(25 / 4); // (10 + 15) / (1 + 3)

      const groupB = rows.find((r) => r.category === 'B');
      expect(groupB.total).toBe(45);
      expect(groupB.ratio).toBe(45 / 6); // (20 + 25) / (2 + 4)
    });
  });

  /**
   * Tests for the groupAgg method
   */
  describe('DataFrame.groupAgg', () => {
    test('should perform group aggregation with single aggregation', () => {
      const df = new DataFrame(sampleData);
      const result = df.groupAgg('category', { value: 'sum' });

      expect(result).toBeInstanceOf(DataFrame);
      expect(result.columns).toContain('category');
      expect(result.columns).toContain('value_sum');

      // Convert to array for easier testing
      const rows = result.toArray();

      // Check aggregation results
      const groupA = rows.find((r) => r.category === 'A');
      expect(groupA.value_sum).toBe(25); // 10 + 15

      const groupB = rows.find((r) => r.category === 'B');
      expect(groupB.value_sum).toBe(45); // 20 + 25
    });

    test('should perform group aggregation with multiple aggregations', () => {
      const df = new DataFrame(sampleData);
      const result = df.groupAgg('category', {
        value: ['sum', 'mean'],
        count: 'sum',
      });

      expect(result).toBeInstanceOf(DataFrame);
      expect(result.columns).toContain('category');
      expect(result.columns).toContain('value_sum');
      expect(result.columns).toContain('value_mean');
      expect(result.columns).toContain('count_sum');

      // Convert to array for easier testing
      const rows = result.toArray();

      // Check aggregation results
      const groupA = rows.find((r) => r.category === 'A');
      expect(groupA.value_sum).toBe(25);
      expect(groupA.value_mean).toBe(12.5);
      expect(groupA.count_sum).toBe(4);

      const groupB = rows.find((r) => r.category === 'B');
      expect(groupB.value_sum).toBe(45);
      expect(groupB.value_mean).toBe(22.5);
      expect(groupB.count_sum).toBe(6);
    });

    test('should support custom aggregation functions', () => {
      const df = new DataFrame(sampleData);
      const result = df.groupAgg('category', {
        value: (series) => series.values.reduce((a, b) => a + b, 0),
        count: (series) => series.values.length,
      });

      expect(result).toBeInstanceOf(DataFrame);

      // Convert to array for easier testing
      const rows = result.toArray();

      // Check aggregation results
      const groupA = rows.find((r) => r.category === 'A');
      expect(groupA.value).toBe(25); // Custom sum
      expect(groupA.count).toBe(2); // Custom count

      const groupB = rows.find((r) => r.category === 'B');
      expect(groupB.value).toBe(45);
      expect(groupB.count).toBe(2);
    });
  });

  /**
   * Tests for the helper methods (groupSum, groupMean, etc.)
   */
  describe('DataFrame Helper Methods', () => {
    test('should perform aggregation with groupSum', () => {
      const df = new DataFrame(sampleData);
      const result = df.groupSum('category', 'value');

      expect(result).toBeInstanceOf(DataFrame);
      expect(result.columns).toContain('category');
      expect(result.columns).toContain('value_sum');

      // Convert to array for easier testing
      const rows = result.toArray();

      // Check aggregation results
      const groupA = rows.find((r) => r.category === 'A');
      expect(groupA.value_sum).toBe(25);

      const groupB = rows.find((r) => r.category === 'B');
      expect(groupB.value_sum).toBe(45);
    });

    test('should perform aggregation with groupMean', () => {
      const df = new DataFrame(sampleData);
      const result = df.groupMean('category', 'value');

      expect(result).toBeInstanceOf(DataFrame);
      expect(result.columns).toContain('category');
      expect(result.columns).toContain('value_mean');

      // Convert to array for easier testing
      const rows = result.toArray();

      // Check aggregation results
      const groupA = rows.find((r) => r.category === 'A');
      expect(groupA.value_mean).toBe(12.5);

      const groupB = rows.find((r) => r.category === 'B');
      expect(groupB.value_mean).toBe(22.5);
    });

    test('should perform aggregation with groupMin', () => {
      const df = new DataFrame(sampleData);
      const result = df.groupMin('category', 'value');

      expect(result).toBeInstanceOf(DataFrame);
      expect(result.columns).toContain('category');
      expect(result.columns).toContain('value_min');

      // Convert to array for easier testing
      const rows = result.toArray();

      // Check aggregation results
      const groupA = rows.find((r) => r.category === 'A');
      expect(groupA.value_min).toBe(10);

      const groupB = rows.find((r) => r.category === 'B');
      expect(groupB.value_min).toBe(20);
    });

    test('should perform aggregation with groupMax', () => {
      const df = new DataFrame(sampleData);
      const result = df.groupMax('category', 'value');

      expect(result).toBeInstanceOf(DataFrame);
      expect(result.columns).toContain('category');
      expect(result.columns).toContain('value_max');

      // Convert to array for easier testing
      const rows = result.toArray();

      // Check aggregation results
      const groupA = rows.find((r) => r.category === 'A');
      expect(groupA.value_max).toBe(15);

      const groupB = rows.find((r) => r.category === 'B');
      expect(groupB.value_max).toBe(25);
    });

    test('should perform aggregation with groupCount', () => {
      const df = new DataFrame(sampleData);
      const result = df.groupCount('category', 'value');

      expect(result).toBeInstanceOf(DataFrame);
      expect(result.columns).toContain('category');
      expect(result.columns).toContain('value_count');

      // Convert to array for easier testing
      const rows = result.toArray();

      // Check aggregation results
      const groupA = rows.find((r) => r.category === 'A');
      expect(groupA.value_count).toBe(2);

      const groupB = rows.find((r) => r.category === 'B');
      expect(groupB.value_count).toBe(2);
    });

    test('should perform count without specifying column', () => {
      const df = new DataFrame(sampleData);
      const result = df.groupCount('category');

      expect(result).toBeInstanceOf(DataFrame);
      expect(result.columns).toContain('category');

      // Convert to array for easier testing
      const rows = result.toArray();

      // Check aggregation results
      const groupA = rows.find((r) => r.category === 'A');
      expect(groupA.category_count).toBe(2);

      const groupB = rows.find((r) => r.category === 'B');
      expect(groupB.category_count).toBe(2);
    });
  });
});
