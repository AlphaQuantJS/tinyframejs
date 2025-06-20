/**
 * Unit-tests for DataFrame groupBy/group methods
 *
 * ▸ Библиотека ядра:  @tinyframejs/core
 *
 * ─────────────────────────────────────────────────────────
 */

import { describe, test, expect, beforeAll } from 'vitest';

import { DataFrame } from '@tinyframejs/core';

// ---------------------------------------------
// Test data
// ---------------------------------------------
const sampleData = {
  category: ['A', 'B', 'A', 'B', 'C'],
  value: [10, 20, 15, 25, 30],
  count: [1, 2, 3, 4, 5],
};

let df;
beforeAll(() => {
  df = new DataFrame(sampleData);
});

// ---------------------------------------------
// Test data
// ---------------------------------------------
describe('DataFrame Group API', () => {
  /**
   * Tests for the group/groupBy method
   */
  describe('DataFrame.group / DataFrame.groupBy', () => {
    test('returns a GroupByCore instance with all necessary methods', () => {
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

    test('performs aggregation with sum method', () => {
      const result = df.group('category').sum('value');

      expect(result).toBeInstanceOf(DataFrame);
      expect(result.columns).toContain('category');
      expect(result.columns).toContain('value');

      // Convert to array for easier testing
      const rows = result.toArray();

      // Check aggregation results
      const groupA = rows.find((r) => r.category === 'A');
      expect(groupA.value).toBe(25); // 10 + 15

      const groupB = rows.find((r) => r.category === 'B');
      expect(groupB.value).toBe(45); // 20 + 25
    });

    test('performs aggregation with mean method', () => {
      const result = df.group('category').mean('value');

      expect(result).toBeInstanceOf(DataFrame);
      expect(result.columns).toContain('category');
      expect(result.columns).toContain('value');

      // Convert to array for easier testing
      const rows = result.toArray();

      // Check aggregation results
      const groupA = rows.find((r) => r.category === 'A');
      expect(groupA.value).toBe(12.5); // (10 + 15) / 2

      const groupB = rows.find((r) => r.category === 'B');
      expect(groupB.value).toBe(22.5); // (20 + 25) / 2
    });

    test('supports custom operations with apply method', () => {
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
    test('performs group aggregation with single aggregation', () => {
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

    test('performs group aggregation with multiple aggregations', () => {
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

    test('supports custom aggregation functions', () => {
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
    test('performs aggregation with groupSum', () => {
      const result = df.groupSum('category', 'value');

      expect(result).toBeInstanceOf(DataFrame);
      expect(result.columns).toContain('category');
      expect(result.columns).toContain('value');

      // Convert to array for easier testing
      const rows = result.toArray();

      // Check aggregation results
      const groupA = rows.find((r) => r.category === 'A');
      expect(groupA.value).toBe(25);

      const groupB = rows.find((r) => r.category === 'B');
      expect(groupB.value).toBe(45);
    });

    test('performs aggregation with groupMean', () => {
      const result = df.groupMean('category', 'value');

      expect(result).toBeInstanceOf(DataFrame);
      expect(result.columns).toContain('category');
      expect(result.columns).toContain('value');

      // Convert to array for easier testing
      const rows = result.toArray();

      // Check aggregation results
      const groupA = rows.find((r) => r.category === 'A');
      expect(groupA.value).toBe(12.5);

      const groupB = rows.find((r) => r.category === 'B');
      expect(groupB.value).toBe(22.5);
    });

    test('performs aggregation with groupMin', () => {
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

    test('performs aggregation with groupMax', () => {
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

    test('performs count without specifying column', () => {
      const result = df.groupCount('category');

      expect(result).toBeInstanceOf(DataFrame);
      expect(result.columns).toContain('category');

      // Convert to array for easier testing
      const rows = result.toArray();

      // Check aggregation results
      const groupA = rows.find((r) => r.category === 'A');
      expect(groupA.count).toBe(2);

      const groupB = rows.find((r) => r.category === 'B');
      expect(groupB.count).toBe(2);
    });
  });
});
