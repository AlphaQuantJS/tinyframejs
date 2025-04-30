/**
 * Unit tests for JSON reader
 */

import { readJson } from '../../../src/io/readers/json.js';
import { DataFrame } from '../../../src/core/DataFrame.js';
import { describe, test, expect, beforeAll } from 'vitest';
import fs from 'fs/promises';
import path from 'path';

/**
 * Tests for the JSON reader functionality
 * Verifies correct parsing of JSON data with various options and formats
 */
describe('JSON Reader', () => {
  let jsonContent;

  /**
   * Load test fixture before tests
   * Reads sample JSON file for use in multiple tests
   */
  beforeAll(async () => {
    jsonContent = await fs.readFile(
      path.resolve('./test/fixtures/sample.json'),
      'utf-8',
    );
  });

  /**
   * Tests basic JSON reading functionality with string input
   * Verifies that JSON string content is correctly parsed into a DataFrame
   */
  test('should read JSON content and return a DataFrame', () => {
    const df = readJson(jsonContent, { recordPath: 'data' });

    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(5);
    expect(df.columns).toContain('date');
    expect(df.columns).toContain('open');
    expect(df.columns).toContain('high');
    expect(df.columns).toContain('low');
    expect(df.columns).toContain('close');
    expect(df.columns).toContain('volume');
  });

  /**
   * Tests JSON reading functionality with object input
   * Verifies that JSON object is correctly parsed into a DataFrame
   */
  test('should accept pre-parsed JSON object', () => {
    const jsonObj = JSON.parse(jsonContent);
    const df = readJson(jsonObj, { recordPath: 'data' });

    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(5);
  });

  /**
   * Tests JSON reading with recordPath option
   * Verifies that nested JSON data is correctly accessed and parsed
   */
  test('should handle nested JSON paths', () => {
    const nestedJson = {
      response: {
        status: 'success',
        result: {
          items: [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
            { id: 3, name: 'Item 3' },
          ],
        },
      },
    };

    const df = readJson(nestedJson, { recordPath: 'response.result.items' });

    expect(df.rowCount).toBe(3);
    expect(df.columns).toContain('id');
    expect(df.columns).toContain('name');
  });

  /**
   * Tests handling of invalid path
   * Verifies that an error is thrown for invalid path
   */
  test('should throw error for invalid path', () => {
    const jsonObj = JSON.parse(jsonContent);

    expect(() => readJson(jsonObj, { recordPath: 'invalid.path' })).toThrow(
      'Invalid path',
    );
  });

  /**
   * Tests handling of column-oriented JSON data
   * Verifies that column-oriented JSON data is correctly parsed
   */
  test('should handle column-oriented JSON data', () => {
    const columnData = {
      date: ['2023-01-01', '2023-01-02', '2023-01-03'],
      value: [100, 200, 300],
    };

    const df = readJson(columnData);

    expect(df.rowCount).toBe(3);
    expect(df.columns).toContain('date');
    expect(df.columns).toContain('value');

    const rows = df.toArray();
    expect(rows[0].date).toBe('2023-01-01');
    expect(rows[0].value).toBe(100);
  });

  /**
   * Tests handling of array of arrays with headers
   * Verifies that array of arrays with headers is correctly parsed
   */
  test('should handle array of arrays with headers', () => {
    const arrayData = [
      ['date', 'value'],
      ['2023-01-01', 100],
      ['2023-01-02', 200],
      ['2023-01-03', 300],
    ];

    const df = readJson(arrayData);

    expect(df.rowCount).toBe(3);
    expect(df.columns).toContain('date');
    expect(df.columns).toContain('value');

    const rows = df.toArray();
    expect(rows[0].date).toBe('2023-01-01');
    expect(rows[0].value).toBe(100);
  });

  /**
   * Tests handling of unsupported JSON format
   * Verifies that an error is thrown for unsupported JSON format
   */
  test('should throw error for unsupported JSON format', () => {
    expect(() => readJson('not a json')).toThrow();
    expect(() => readJson(123)).toThrow();
    expect(() => readJson(null)).toThrow();
  });
});
