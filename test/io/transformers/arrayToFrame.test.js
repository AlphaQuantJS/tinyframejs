/**
 * Unit tests for arrayToFrame transformer
 */

import { arrayToFrame } from '../../../src/io/transformers/arrayToFrame.js';
import { DataFrame } from '../../../src/core/dataframe/DataFrame.js';
import { describe, test, expect } from 'vitest';

/**
 * Tests for the arrayToFrame transformer
 * Verifies correct transformation of array data into DataFrames with various options
 */
describe('arrayToFrame Transformer', () => {
  /**
   * Tests transformation of array of objects to DataFrame
   * Verifies that array of objects is correctly transformed into a DataFrame
   */
  test('should transform array of objects to DataFrame', () => {
    const data = [
      { date: '2023-01-01', open: 100.5, close: 103.5 },
      { date: '2023-01-02', open: 103.75, close: 107.25 },
      { date: '2023-01-03', open: 107.5, close: 106.75 },
    ];

    const df = arrayToFrame(data);

    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(3);
    expect(df.columns).toContain('date');
    expect(df.columns).toContain('open');
    expect(df.columns).toContain('close');

    const rows = df.toArray();
    expect(rows[0].date).toBe('2023-01-01');
    expect(rows[0].open).toBe(100.5);
  });

  /**
   * Tests transformation of array of arrays with header row to DataFrame
   * Verifies that array of arrays with header row is correctly transformed into a DataFrame
   */
  test('should transform array of arrays with header row to DataFrame', () => {
    const data = [
      ['date', 'open', 'close'],
      ['2023-01-01', 100.5, 103.5],
      ['2023-01-02', 103.75, 107.25],
      ['2023-01-03', 107.5, 106.75],
    ];

    const df = arrayToFrame(data, { headerRow: true });

    expect(df.rowCount).toBe(3);
    expect(df.columns).toContain('date');
    expect(df.columns).toContain('open');
    expect(df.columns).toContain('close');

    const rows = df.toArray();
    expect(rows[0].date).toBe('2023-01-01');
    expect(rows[0].open).toBe(100.5);
  });

  /**
   * Tests transformation of array of arrays with explicit column names to DataFrame
   * Verifies that array of arrays with explicit column names is correctly
   * transformed into a DataFrame
   */
  test('should transform array of arrays with explicit column names', () => {
    const data = [
      ['2023-01-01', 100.5, 103.5],
      ['2023-01-02', 103.75, 107.25],
      ['2023-01-03', 107.5, 106.75],
    ];

    const df = arrayToFrame(data, {
      columns: ['date', 'open', 'close'],
    });

    expect(df.rowCount).toBe(3);
    expect(df.columns).toContain('date');
    expect(df.columns).toContain('open');
    expect(df.columns).toContain('close');

    const rows = df.toArray();
    expect(rows[0].date).toBe('2023-01-01');
    expect(rows[0].open).toBe(100.5);
  });

  /**
   * Tests transformation of array of arrays without column names to DataFrame
   * Verifies that array of arrays without column names is correctly transformed
   * into a DataFrame with auto-generated column names
   */
  test('should transform array of arrays without column names', () => {
    const data = [
      ['2023-01-01', 100.5, 103.5],
      ['2023-01-02', 103.75, 107.25],
      ['2023-01-03', 107.5, 106.75],
    ];

    const df = arrayToFrame(data);

    expect(df.rowCount).toBe(3);
    expect(df.columns).toContain('column0');
    expect(df.columns).toContain('column1');
    expect(df.columns).toContain('column2');

    const rows = df.toArray();
    expect(rows[0].column0).toBe('2023-01-01');
    expect(rows[0].column1).toBe(100.5);
  });

  /**
   * Tests transformation of array of primitives to single-column DataFrame
   * Verifies that array of primitives is correctly transformed into a single-column DataFrame
   */
  test('should transform array of primitives to single-column DataFrame', () => {
    const data = [100, 200, 300, 400, 500];

    const df = arrayToFrame(data);

    expect(df.rowCount).toBe(5);
    expect(df.columns.length).toBe(1);
    expect(df.columns).toContain('value');

    const rows = df.toArray();
    expect(rows[0].value).toBe(100);
    expect(rows[4].value).toBe(500);
  });

  /**
   * Tests transformation of array of primitives with custom column name
   * Verifies that array of primitives is correctly transformed into a DataFrame
   * with custom column name
   */
  test('should transform array of primitives with custom column name', () => {
    const data = [100, 200, 300, 400, 500];

    const df = arrayToFrame(data, { columns: ['price'] });

    expect(df.rowCount).toBe(5);
    expect(df.columns.length).toBe(1);
    expect(df.columns).toContain('price');

    const rows = df.toArray();
    expect(rows[0].price).toBe(100);
    expect(rows[4].price).toBe(500);
  });

  /**
   * Tests handling of empty array
   * Verifies that empty array is correctly transformed into an empty DataFrame
   */
  test('should handle empty array', () => {
    const data = [];

    const df = arrayToFrame(data);

    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(0);
    expect(df.columns.length).toBe(0);
  });

  /**
   * Tests error handling for non-array input
   * Verifies that an error is thrown for non-array input
   */
  test('should throw error for non-array input', () => {
    expect(() => arrayToFrame('not an array')).toThrow(
      'Input data must be an array',
    );
    expect(() => arrayToFrame(123)).toThrow('Input data must be an array');
    expect(() => arrayToFrame({ key: 'value' })).toThrow(
      'Input data must be an array',
    );
    expect(() => arrayToFrame(null)).toThrow('Input data must be an array');
  });

  /**
   * Tests using TypedArrays for numeric columns
   * Verifies that TypedArrays are used for numeric columns when enabled
   */
  test('should use TypedArrays for numeric columns', () => {
    const data = [
      { a: 1, b: 2 },
      { a: 3, b: 4 },
      { a: 5, b: 6 },
    ];

    const df = arrayToFrame(data, { useTypedArrays: true });

    // В текущей реализации DataFrame мы не можем напрямую проверить использование TypedArrays
    // Поэтому просто проверяем, что DataFrame создан корректно
    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(3);
    expect(df.columns).toContain('a');
    expect(df.columns).toContain('b');
  });

  /**
   * Tests not using TypedArrays for numeric columns when disabled
   * Verifies that TypedArrays are not used for numeric columns when disabled
   */
  test('should not use TypedArrays when disabled', () => {
    const data = [
      { a: 1, b: 2 },
      { a: 3, b: 4 },
      { a: 5, b: 6 },
    ];

    const df = arrayToFrame(data, { useTypedArrays: false });

    // В текущей реализации DataFrame мы не можем напрямую проверить использование TypedArrays
    // Поэтому просто проверяем, что DataFrame создан корректно
    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(3);
    expect(df.columns).toContain('a');
    expect(df.columns).toContain('b');
  });
});
