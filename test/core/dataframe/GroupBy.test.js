/**
 * Unit tests for GroupBy.js
 */

import { DataFrame } from '../../../src/core/dataframe/DataFrame.js';
import { GroupBy } from '../../../src/core/dataframe/GroupBy.js';
import { describe, test, expect, vi } from 'vitest';

/**
 * Tests for the GroupBy class
 * Verifies GroupBy creation and aggregation methods
 */
describe('GroupBy', () => {
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
  test('should create a GroupBy instance', () => {
    const df = new DataFrame(sampleData);
    const groupBy = new GroupBy(df, 'category');

    expect(groupBy).toBeInstanceOf(GroupBy);
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

    const result = groupBy.apply((group) => ({
      total: group.col('value').values.reduce((a, b) => a + b, 0),
      avg:
        group.col('value').values.reduce((a, b) => a + b, 0) / group.rowCount,
    }));

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
});
