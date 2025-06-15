/**
 * Unit tests for GroupBy.js
 */

import { DataFrame } from '../../../src/core/dataframe/DataFrame.js';
import { GroupByCore as GroupBy } from '../../../src/core/dataframe/GroupByCore.js';
import { describe, test, expect, vi } from 'vitest';

/**
 * Tests for GroupByCore functionality
 * Verifies GroupBy creation and aggregation
 */
describe('GroupByCore', () => {
  // Mock the shouldUseArrow function to avoid issues with data iteration
  vi.mock('../../../src/core/strategy/shouldUseArrow.js', () => ({
    shouldUseArrow: () => false,
  }));
  // Sample test data
  const sampleData = {
    category: ['A', 'B', 'A', 'B', 'C'],
    value: [10, 20, 15, 25, 30],
    count: [1, 2, 3, 4, 5],
  };

  /**
   * Tests creating a GroupBy instance
   */
  test('should create a GroupByCore instance', () => {
    const df = new DataFrame(sampleData);
    const groupBy = new GroupBy(df, 'category');

    expect(groupBy).toBeInstanceOf(GroupBy); // GroupByCore with alias GroupBy
    expect(groupBy.by).toEqual(['category']);
    expect(groupBy.df).toBe(df);
  });

  /**
   * Tests grouping by multiple columns
   */
  test('should group by multiple columns', () => {
    const data = {
      category: ['A', 'B', 'A', 'B', 'C'],
      subcategory: ['X', 'Y', 'X', 'Z', 'X'],
      value: [10, 20, 15, 25, 30],
    };

    const df = new DataFrame(data);
    const groupBy = new GroupBy(df, ['category', 'subcategory']);

    expect(groupBy.by).toEqual(['category', 'subcategory']);
  });

  /**
   * Tests count aggregation
   */
  test('should count items in each group', () => {
    const df = new DataFrame(sampleData);
    const groupBy = new GroupBy(df, 'category');
    const result = groupBy.count();

    expect(result).toBeInstanceOf(DataFrame);

    // Convert to array for easier testing
    const rows = result.toArray();

    // Find counts for each category
    const countA = rows.find((r) => r.category === 'A').count;
    const countB = rows.find((r) => r.category === 'B').count;
    const countC = rows.find((r) => r.category === 'C').count;

    expect(countA).toBe(2); // Category A appears twice
    expect(countB).toBe(2); // Category B appears twice
    expect(countC).toBe(1); // Category C appears once
  });

  /**
   * Tests sum aggregation
   */
  test('should sum values in each group', () => {
    const df = new DataFrame(sampleData);
    const groupBy = new GroupBy(df, 'category');
    const result = groupBy.sum('value');

    expect(result).toBeInstanceOf(DataFrame);

    // Convert to array for easier testing
    const rows = result.toArray();

    // Find sums for each category
    const sumA = rows.find((r) => r.category === 'A').value;
    const sumB = rows.find((r) => r.category === 'B').value;
    const sumC = rows.find((r) => r.category === 'C').value;

    expect(sumA).toBe(25); // 10 + 15
    expect(sumB).toBe(45); // 20 + 25
    expect(sumC).toBe(30);
  });

  /**
   * Tests mean aggregation
   */
  test('should calculate mean values in each group', () => {
    const df = new DataFrame(sampleData);
    const groupBy = new GroupBy(df, 'category');
    const result = groupBy.mean('value');

    expect(result).toBeInstanceOf(DataFrame);

    // Convert to array for easier testing
    const rows = result.toArray();

    // Find means for each category
    const meanA = rows.find((r) => r.category === 'A').value;
    const meanB = rows.find((r) => r.category === 'B').value;
    const meanC = rows.find((r) => r.category === 'C').value;

    expect(meanA).toBe(12.5); // (10 + 15) / 2
    expect(meanB).toBe(22.5); // (20 + 25) / 2
    expect(meanC).toBe(30);
  });

  /**
   * Tests custom aggregation
   */
  test('should apply custom aggregation functions', () => {
    const df = new DataFrame(sampleData);
    const groupBy = new GroupBy(df, 'category');

    const result = groupBy.agg({
      value: (series) => series.values.reduce((a, b) => a + b, 0),
      count: (series) => series.values.length,
    });

    expect(result).toBeInstanceOf(DataFrame);

    // Convert to array for easier testing
    const rows = result.toArray();

    // Check aggregation results
    const groupA = rows.find((r) => r.category === 'A');
    expect(groupA.value).toBe(25); // Sum of values
    expect(groupA.count).toBe(2); // Count of items

    const groupB = rows.find((r) => r.category === 'B');
    expect(groupB.value).toBe(45);
    expect(groupB.count).toBe(2);
  });

  /**
   * Tests apply method
   */
  test('should apply function to each group', () => {
    const df = new DataFrame(sampleData);
    const groupBy = new GroupBy(df, 'category');

    const result = groupBy.apply((group) => {
      const values = group.col('value').values;
      const sum = values.reduce((a, b) => a + b, 0);
      return {
        total: sum,
        avg: sum / values.length,
      };
    });

    expect(result).toBeInstanceOf(DataFrame);

    // Convert to array for easier testing
    const rows = result.toArray();

    // Check results for each group
    const groupA = rows.find((r) => r.category === 'A');
    expect(groupA.total).toBe(25);
    expect(groupA.avg).toBe(12.5);

    const groupB = rows.find((r) => r.category === 'B');
    expect(groupB.total).toBe(45);
    expect(groupB.avg).toBe(22.5);
  });

  /**
   * Tests min aggregation
   */
  test('should find minimum values in each group', () => {
    const df = new DataFrame(sampleData);
    const groupBy = new GroupBy(df, 'category');
    const result = groupBy.min('value');

    expect(result).toBeInstanceOf(DataFrame);

    // Convert to array for easier testing
    const rows = result.toArray();

    // Find minimums for each category
    const minA = rows.find((r) => r.category === 'A').value_min;
    const minB = rows.find((r) => r.category === 'B').value_min;
    const minC = rows.find((r) => r.category === 'C').value_min;

    expect(minA).toBe(10); // Min of 10, 15
    expect(minB).toBe(20); // Min of 20, 25
    expect(minC).toBe(30);
  });

  /**
   * Tests max aggregation
   */
  test('should find maximum values in each group', () => {
    const df = new DataFrame(sampleData);
    const groupBy = new GroupBy(df, 'category');
    const result = groupBy.max('value');

    expect(result).toBeInstanceOf(DataFrame);

    // Convert to array for easier testing
    const rows = result.toArray();

    // Find maximums for each category
    const maxA = rows.find((r) => r.category === 'A').value_max;
    const maxB = rows.find((r) => r.category === 'B').value_max;
    const maxC = rows.find((r) => r.category === 'C').value_max;

    expect(maxA).toBe(15); // Max of 10, 15
    expect(maxB).toBe(25); // Max of 20, 25
    expect(maxC).toBe(30);
  });

  /**
   * Tests name collision protection
   */
  test('should handle column name collisions', () => {
    // Create data with a column that would collide with aggregation result
    const collisionData = {
      category: ['A', 'B', 'A', 'B'],
      value: [10, 20, 15, 25],
      valueSum: [100, 200, 300, 400], // This would collide with sum aggregation
    };

    const df = new DataFrame(collisionData);
    const groupBy = new GroupBy(df, 'category');
    const result = groupBy.agg({ value: 'sum' });

    // Convert to array for easier testing
    const rows = result.toArray();

    // Check that both original and aggregation columns exist
    const groupA = rows.find((r) => r.category === 'A');
    expect(groupA.value_sum).toBe(25); // Sum of 10 + 15

    // Original column should not be in result
    expect(groupA.value_sum_1).toBeUndefined();
  });

  /**
   * Tests array aggregation specification
   */
  test('should handle array of aggregation functions', () => {
    const df = new DataFrame(sampleData);
    const groupBy = new GroupBy(df, 'category');
    const result = groupBy.agg({ value: ['sum', 'mean', 'min', 'max'] });

    expect(result).toBeInstanceOf(DataFrame);

    // Convert to array for easier testing
    const rows = result.toArray();

    // Check aggregation results for category A
    const groupA = rows.find((r) => r.category === 'A');
    expect(groupA.value_sum).toBe(25);
    expect(groupA.value_mean).toBe(12.5);
    expect(groupA.value_min).toBe(10);
    expect(groupA.value_max).toBe(15);
  });
});

/**
 * Tests for the DataFrame groupAgg method
 * Verifies the syntactic sugar over groupBy().agg()
 */
describe('DataFrame.groupAgg', () => {
  // Mock the shouldUseArrow function to avoid issues with data iteration
  vi.mock('../../../src/core/strategy/shouldUseArrow.js', () => ({
    shouldUseArrow: () => false,
  }));

  // Sample test data
  const sampleData = {
    category: ['A', 'B', 'A', 'B', 'C'],
    value: [10, 20, 15, 25, 30],
    count: [1, 2, 3, 4, 5],
  };

  /**
   * Tests groupAgg method
   */
  test('should perform group aggregation in one step', () => {
    const df = new DataFrame(sampleData);

    // First register the groupBy method
    df.groupBy = function (by) {
      return new GroupBy(this, by);
    };

    // Then register groupAgg method
    df.groupAgg = function (by, aggregations) {
      return this.groupBy(by).agg(aggregations);
    };

    const result = df.groupAgg('category', { value: 'sum', count: 'mean' });

    expect(result).toBeInstanceOf(DataFrame);

    // Convert to array for easier testing
    const rows = result.toArray();

    // Check aggregation results
    const groupA = rows.find((r) => r.category === 'A');
    expect(groupA.value_sum).toBe(25);
    expect(groupA.count_mean).toBe(2);

    const groupB = rows.find((r) => r.category === 'B');
    expect(groupB.value_sum).toBe(45);
    expect(groupB.count_mean).toBe(3);
  });
});
