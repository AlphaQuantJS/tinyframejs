/**
 * Unit tests for DataFrame.js
 */

import { DataFrame } from '../../../src/core/dataframe/DataFrame.js';
import { Series } from '../../../src/core/dataframe/Series.js';
import { describe, test, expect, vi } from 'vitest';

/**
 * Tests for the DataFrame class
 * Verifies DataFrame creation, data access, and manipulation methods
 */
describe('DataFrame', () => {
  // Sample test data
  const sampleData = {
    a: [1, 2, 3],
    b: ['x', 'y', 'z'],
  };

  // Mock the shouldUseArrow function to avoid issues with data iteration
  vi.mock('../../../src/core/strategy/shouldUseArrow.js', () => ({
    shouldUseArrow: () => false,
  }));

  /**
   * Tests creating a DataFrame instance from object data (column-oriented)
   * Verifies that the DataFrame is created correctly with the expected properties
   */
  test('should create a DataFrame instance from object data', () => {
    const df = new DataFrame(sampleData);

    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(3);
    expect(df.columns).toEqual(['a', 'b']);
  });

  /**
   * Tests creating a DataFrame instance using static factory method
   */
  test('should create a DataFrame using static factory method', () => {
    const df = DataFrame.create(sampleData);

    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(3);
    expect(df.columns).toEqual(['a', 'b']);
  });

  /**
   * Tests creating a DataFrame instance from array of objects (row-oriented)
   * Verifies that the DataFrame is created correctly with the expected properties
   */
  test('should create a DataFrame instance from array of objects', () => {
    const data = [
      { a: 1, b: 'x' },
      { a: 2, b: 'y' },
      { a: 3, b: 'z' },
    ];

    const df = DataFrame.fromRows(data);

    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(3);
    expect(df.columns).toEqual(['a', 'b']);
  });

  /**
   * Tests converting a DataFrame to an array of objects
   * Verifies that the DataFrame is converted correctly to an array of objects
   */
  test('should convert DataFrame to array of objects', () => {
    const df = new DataFrame(sampleData);
    const array = df.toArray();

    expect(array).toEqual([
      { a: 1, b: 'x' },
      { a: 2, b: 'y' },
      { a: 3, b: 'z' },
    ]);
  });

  /**
   * Tests accessing column data as Series
   */
  test('should access column data as Series', () => {
    const df = new DataFrame(sampleData);
    const seriesA = df.col('a');

    expect(seriesA).toBeInstanceOf(Series);
    expect(seriesA.length).toBe(3);
    expect(seriesA.values).toEqual([1, 2, 3]);
  });

  /**
   * Tests selecting a subset of columns
   */
  test('should select a subset of columns', () => {
    const df = new DataFrame(sampleData);
    const subset = df.select(['a']);

    expect(subset).toBeInstanceOf(DataFrame);
    expect(subset.columns).toEqual(['a']);
    expect(subset.rowCount).toBe(3);
  });

  /**
   * Tests dropping columns
   */
  test('should drop specified columns', () => {
    const df = new DataFrame({
      a: [1, 2, 3],
      b: ['x', 'y', 'z'],
      c: [true, false, true],
    });

    const result = df.drop(['b']);

    expect(result).toBeInstanceOf(DataFrame);
    expect(result.columns).toEqual(['a', 'c']);
    expect(result.rowCount).toBe(3);
  });

  /**
   * Tests assigning new columns
   */
  test('should assign new columns', () => {
    const df = new DataFrame(sampleData);
    const result = df.assign({
      c: [4, 5, 6],
    });

    expect(result).toBeInstanceOf(DataFrame);
    expect(result.columns).toEqual(['a', 'b', 'c']);
    expect(result.rowCount).toBe(3);
    expect(result.col('c').values).toEqual([4, 5, 6]);
  });

  /**
   * Tests handling empty data correctly
   * Verifies that an empty DataFrame is created correctly and has the expected properties
   */
  test('should handle empty data correctly', () => {
    const df = new DataFrame({});

    expect(df.rowCount).toBe(0);
    expect(df.columns).toEqual([]);
    expect(df.toArray()).toEqual([]);
  });

  /**
   * Tests HTML output
   */
  test('should generate HTML representation', () => {
    const df = new DataFrame(sampleData);
    const html = df.toHTML();

    expect(html).toContain('<table>');
    expect(html).toContain('<th>a</th>');
    expect(html).toContain('<th>b</th>');
    expect(html).toContain('<td>1</td>');
    expect(html).toContain('<td>x</td>');
  });

  /**
   * Tests Markdown output
   */
  test('should generate Markdown representation', () => {
    const df = new DataFrame(sampleData);
    const markdown = df.toMarkdown();

    expect(markdown).toContain('| a | b |');
    expect(markdown).toContain('| --- | --- |');
    expect(markdown).toContain('| 1 | x |');
  });
});
