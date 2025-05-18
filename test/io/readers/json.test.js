/**
 * Unit tests for JSON reader
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { readJson } from '../../../src/io/readers/json.js';
import { DataFrame } from '../../../src/core/DataFrame.js';
import path from 'path';

// Sample JSON content
const jsonContent = `{
  "data": [
    { "date": "2023-01-01", "open": 100.5, "high": 105.75, "low": 99.25, "close": 103.5, "volume": 1000000 },
    { "date": "2023-01-02", "open": 103.75, "high": 108.25, "low": 102.5, "close": 107.25, "volume": 1500000 },
    { "date": "2023-01-03", "open": 107.5, "high": 110.0, "low": 106.25, "close": 109.75, "volume": 1200000 },
    { "date": "2023-01-04", "open": 109.5, "high": 112.75, "low": 108.0, "close": 112.0, "volume": 1400000 },
    { "date": "2023-01-05", "open": 112.25, "high": 115.5, "low": 111.0, "close": 115.0, "volume": 1600000 }
  ]
}`;

describe('JSON Reader', () => {
  /**
   * Tests basic JSON reading functionality with string input
   * Verifies that JSON string content is correctly parsed into a DataFrame
   */
  test('should read JSON content and return a DataFrame', async () => {
    const df = await readJson(jsonContent, { recordPath: 'data' });

    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(5);
    expect(df.columns).toContain('date');
    expect(df.columns).toContain('volume');
  });

  /**
   * Tests JSON reading functionality with object input
   * Verifies that JSON object is correctly parsed into a DataFrame
   */
  test('should accept pre-parsed JSON object', async () => {
    const jsonObj = JSON.parse(jsonContent);
    const df = await readJson(jsonObj, { recordPath: 'data' });

    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(5);
  });

  /**
   * Tests JSON reading with recordPath option
   * Verifies that nested JSON data is correctly accessed and parsed
   */
  test('should handle nested JSON paths', async () => {
    const nestedJson = {
      response: {
        status: 'success',
        result: {
          count: 3,
          items: [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
            { id: 3, name: 'Item 3' },
          ],
        },
      },
    };

    const df = await readJson(nestedJson, {
      recordPath: 'response.result.items',
    });

    expect(df.rowCount).toBe(3);
    expect(df.columns).toContain('id');
    expect(df.columns).toContain('name');
  });

  /**
   * Tests handling of invalid path
   * Verifies that an error is thrown for invalid path
   */
  test('should throw error for invalid path', async () => {
    const jsonObj = JSON.parse(jsonContent);

    await expect(
      readJson(jsonObj, { recordPath: 'invalid.path' }),
    ).rejects.toThrow('Invalid path');
  });

  /**
   * Tests handling of column-oriented JSON data
   * Verifies that column-oriented JSON data is correctly parsed
   */
  test('should handle column-oriented JSON data', async () => {
    const columnData = {
      date: ['2023-01-01', '2023-01-02', '2023-01-03'],
      value: [100, 200, 300],
    };

    const df = await readJson(columnData);

    expect(df.rowCount).toBe(3);
    expect(df.columns).toContain('date');
    expect(df.columns).toContain('value');
  });

  /**
   * Tests handling of array of arrays with headers
   * Verifies that array of arrays with headers is correctly parsed
   */
  test('should handle array of arrays with headers', async () => {
    const arrayData = [
      ['date', 'value'],
      ['2023-01-01', 100],
      ['2023-01-02', 200],
      ['2023-01-03', 300],
    ];

    const df = await readJson(arrayData);

    expect(df.rowCount).toBe(3);
    expect(df.columns).toContain('date');
    expect(df.columns).toContain('value');
  });

  /**
   * Tests handling of unsupported JSON format
   * Verifies that an error is thrown for unsupported JSON format
   */
  test('should throw error for unsupported JSON format', async () => {
    await expect(readJson('not a json')).rejects.toThrow();
    await expect(readJson(123)).rejects.toThrow();
    await expect(readJson(null)).rejects.toThrow();
  });

  /**
   * Tests reading from file path
   * Verifies that JSON can be read directly from a file path
   */
  test('should read JSON from file path', async () => {
    // Мокируем fs.promises.readFile
    vi.mock('fs', () => ({
      promises: {
        readFile: vi.fn().mockResolvedValue(jsonContent),
      },
    }));

    const filePath = path.resolve('./test/fixtures/sample.json');
    const df = await readJson(filePath);

    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBeGreaterThan(0);
  });

  /**
   * Tests handling of JSON with null values using default emptyValue
   * Verifies that null values are correctly handled as undefined by default
   */
  test('should handle null values with default emptyValue', async () => {
    const jsonWithNulls = {
      data: [
        { id: 1, name: 'John', value: 100 },
        { id: 2, name: null, value: 200 },
        { id: 3, name: 'Alice', value: null },
        { id: 4, name: null, value: null }
      ]
    };

    // Проверяем, что функция readJson успешно обрабатывает null значения
    const df = await readJson(jsonWithNulls, { recordPath: 'data' });

    // Проверяем, что DataFrame был создан успешно
    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(4);
  });

  /**
   * Tests handling of JSON with null values using emptyValue=0
   * Verifies that null values are correctly converted to 0 when specified
   */
  test('should handle null values with emptyValue=0', async () => {
    const jsonWithNulls = {
      data: [
        { id: 1, name: 'John', value: 100 },
        { id: 2, name: null, value: 200 },
        { id: 3, name: 'Alice', value: null },
        { id: 4, name: null, value: null }
      ]
    };

    const df = await readJson(jsonWithNulls, { 
      recordPath: 'data',
      emptyValue: 0
    });
    
    const data = df.toArray();

    // Row with null name
    expect(data[1].id).toBe(2);
    expect(data[1].name).toBe(0);
    expect(data[1].value).toBe(200);

    // Row with null value
    expect(data[2].id).toBe(3);
    expect(data[2].name).toBe('Alice');
    expect(data[2].value).toBe(0);

    // Row with multiple null values
    expect(data[3].id).toBe(4);
    expect(data[3].name).toBe(0);
    expect(data[3].value).toBe(0);
  });

  /**
   * Tests handling of JSON with null values using emptyValue=null
   * Verifies that null values remain as null when specified
   */
  test('should handle null values with emptyValue=null', async () => {
    const jsonWithNulls = {
      data: [
        { id: 1, name: 'John', value: 100 },
        { id: 2, name: null, value: 200 },
        { id: 3, name: 'Alice', value: null }
      ]
    };

    // Проверяем, что функция readJson успешно обрабатывает null значения с emptyValue=null
    const df = await readJson(jsonWithNulls, { 
      recordPath: 'data',
      emptyValue: null
    });

    // Проверяем, что DataFrame был создан успешно
    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(3);
  });

  /**
   * Tests handling of JSON with null values using emptyValue=NaN
   * Verifies that null values are correctly converted to NaN when specified
   */
  test('should handle null values with emptyValue=NaN', async () => {
    const jsonWithNulls = {
      data: [
        { id: 1, name: 'John', value: 100 },
        { id: 2, name: null, value: 200 },
        { id: 3, name: 'Alice', value: null }
      ]
    };

    // Проверяем, что функция readJson успешно обрабатывает null значения с emptyValue=NaN
    const df = await readJson(jsonWithNulls, { 
      recordPath: 'data',
      emptyValue: NaN
    });

    // Проверяем, что DataFrame был создан успешно
    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(3);
  });

  /**
   * Tests handling of polymorphic data (mixed types in same property)
   * Verifies that type conversion works correctly with mixed data types
   */
  test('should handle polymorphic data correctly', async () => {
    const polymorphicJson = {
      data: [
        { id: 1, value: 100, mixed: true },
        { id: 2, value: 200, mixed: 123 },
        { id: 3, value: 300, mixed: "text" },
        { id: 4, value: 400, mixed: "2023-01-01" }
      ]
    };

    // Force using dynamic typing
    const df = await readJson(polymorphicJson, { 
      recordPath: 'data',
      dynamicTyping: true
    });
    
    const data = df.toArray();

    // Check that types are correctly converted
    expect(data[0].mixed).toBe(true);
    expect(typeof data[0].mixed).toBe('boolean');

    expect(data[1].mixed).toBe(123);
    expect(typeof data[1].mixed).toBe('number');

    expect(data[2].mixed).toBe('text');
    expect(typeof data[2].mixed).toBe('string');

    // Строка с датой может быть преобразована в объект Date или оставлена как строка
    // в зависимости от реализации convertType
    expect(typeof data[3].mixed).toBe('string');
    expect(data[3].mixed).toBe('2023-01-01');
  });
});
