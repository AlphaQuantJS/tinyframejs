/**
 * Unit tests for LazyFrame.js
 */

import { DataFrame } from '../../../src/core/dataframe/DataFrame.js';
import { LazyFrame } from '../../../src/core/lazy/LazyFrame.js';
import { describe, test, expect, vi } from 'vitest';

/**
 * Tests for the LazyFrame class
 * Verifies LazyFrame creation and lazy operations
 */
describe('LazyFrame', () => {
  // Mock the shouldUseArrow function to avoid issues with data iteration
  vi.mock('../../../src/core/strategy/shouldUseArrow.js', () => ({
    shouldUseArrow: () => false,
  }));
  // Sample test data
  const sampleData = {
    a: [1, 2, 3, 4, 5],
    b: [10, 20, 30, 40, 50],
    c: ['x', 'y', 'z', 'w', 'v'],
  };

  /**
   * Tests creating a LazyFrame from a DataFrame
   */
  test('should create a LazyFrame from a DataFrame', async () => {
    const df = new DataFrame(sampleData);
    const lazy = await df.lazy();

    expect(lazy).toBeInstanceOf(LazyFrame);
  });

  /**
   * Tests static factory method
   */
  test('should create a LazyFrame using static factory method', () => {
    const df = new DataFrame(sampleData);
    const lazy = LazyFrame.fromDataFrame(df);

    expect(lazy).toBeInstanceOf(LazyFrame);
  });

  /**
   * Tests filter operation
   */
  test('should apply filter operation lazily', async () => {
    const df = new DataFrame(sampleData);
    const lazy = await df.lazy();

    const filtered = lazy.filter((row) => row.a > 3);

    // Operation should be lazy (no execution yet)
    expect(filtered).toBeInstanceOf(LazyFrame);

    // Execute the plan
    const result = filtered.collect();

    expect(result).toBeInstanceOf(DataFrame);
    expect(result.rowCount).toBe(2); // Only rows with a > 3

    const rows = result.toArray();
    expect(rows.every((row) => row.a > 3)).toBe(true);
  });

  /**
   * Tests select operation
   */
  test('should apply select operation lazily', async () => {
    const df = new DataFrame(sampleData);
    const lazy = await df.lazy();

    const selected = lazy.select(['a', 'c']);

    // Operation should be lazy (no execution yet)
    expect(selected).toBeInstanceOf(LazyFrame);

    // Execute the plan
    const result = selected.collect();

    expect(result).toBeInstanceOf(DataFrame);
    expect(result.columns).toEqual(['a', 'c']);
    expect(result.rowCount).toBe(5);
  });

  /**
   * Tests head operation
   */
  test('should apply head operation lazily', async () => {
    const df = new DataFrame(sampleData);
    const lazy = await df.lazy();

    const headRows = lazy.head(2);

    // Operation should be lazy (no execution yet)
    expect(headRows).toBeInstanceOf(LazyFrame);

    // Execute the plan
    const result = headRows.collect();

    expect(result).toBeInstanceOf(DataFrame);
    expect(result.rowCount).toBe(2);
  });

  /**
   * Tests custom apply operation
   */
  test('should apply custom function lazily', async () => {
    const df = new DataFrame(sampleData);
    const lazy = await df.lazy();

    const applied = lazy.apply((frame) =>
      // Add a new column that is the sum of a and b
      frame.assign({
        sum: frame.col('a').values.map((v, i) => v + frame.col('b').values[i]),
      }),
    );

    // Operation should be lazy (no execution yet)
    expect(applied).toBeInstanceOf(LazyFrame);

    // Execute the plan
    const result = applied.collect();

    expect(result).toBeInstanceOf(DataFrame);
    expect(result.columns).toContain('sum');

    const rows = result.toArray();
    expect(rows[0].sum).toBe(11); // 1 + 10
    expect(rows[1].sum).toBe(22); // 2 + 20
  });

  /**
   * Tests chaining multiple operations
   */
  test('should chain multiple operations lazily', async () => {
    const df = new DataFrame(sampleData);
    const lazy = await df.lazy();

    const pipeline = lazy
      .filter((row) => row.a > 2)
      .select(['a', 'b'])
      .head(2);

    // Operations should be lazy (no execution yet)
    expect(pipeline).toBeInstanceOf(LazyFrame);

    // Execute the plan
    const result = pipeline.collect();

    expect(result).toBeInstanceOf(DataFrame);
    expect(result.columns).toEqual(['a', 'b']);
    expect(result.rowCount).toBe(2);

    const rows = result.toArray();
    expect(rows.every((row) => row.a > 2)).toBe(true);
  });

  /**
   * Tests execute alias
   */
  test('should support execute as alias for collect', async () => {
    const df = new DataFrame(sampleData);
    const lazy = await df.lazy();

    const filtered = lazy.filter((row) => row.a > 3);

    // Use execute instead of collect
    const result = filtered.execute();

    expect(result).toBeInstanceOf(DataFrame);
    expect(result.rowCount).toBe(2);
  });

  /**
   * Tests string representation
   */
  test('should provide string representation', async () => {
    const df = new DataFrame(sampleData);
    const lazy = await df.lazy();

    const pipeline = lazy.filter((row) => row.a > 2).select(['a', 'b']);

    const str = pipeline.toString();

    expect(str).toContain('LazyFrame');
    expect(str).toContain('steps: 2');
  });
});
