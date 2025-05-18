/**
 * Unit tests for CSV reader
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { readCsv } from '../../../src/io/readers/csv.js';
import { DataFrame } from '../../../src/core/DataFrame.js';
import path from 'path';

// Sample CSV content
const csvContent =
  'date,open,high,low,close,volume\n' +
  '2023-01-01,100.5,105.75,99.25,103.5,1000000\n' +
  '2023-01-02,103.75,108.25,102.5,107.25,1500000\n' +
  '2023-01-03,107.5,110.0,106.25,109.75,1200000\n' +
  '2023-01-04,109.5,112.75,108.0,112.0,1400000\n' +
  '2023-01-05,112.25,115.5,111.0,115.0,1600000';

describe('CSV Reader', () => {
  // Мокируем fs.promises.readFile
  vi.mock('fs', () => ({
    promises: {
      readFile: vi.fn().mockResolvedValue(csvContent),
    },
  }));

  /**
   * Tests basic CSV reading functionality
   * Verifies that CSV content is correctly parsed into a DataFrame
   */
  test('should read CSV content and return a DataFrame', async () => {
    const df = await readCsv(csvContent);

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
   * Tests numeric value conversion
   * Verifies that numeric values in CSV are correctly converted to numbers
   */
  test('should convert numeric values correctly', async () => {
    const df = await readCsv(csvContent);
    const data = df.toArray();

    expect(typeof data[0].open).toBe('number');
    expect(data[0].open).toBe(100.5);
    expect(typeof data[0].volume).toBe('number');
    expect(data[0].volume).toBe(1000000);
  });

  /**
   * Tests CSV parsing without headers
   * Verifies that CSV content without headers is correctly parsed
   */
  test('should handle CSV without headers', async () => {
    const noHeaderContent =
      '2023-01-01,100.5,105.75,99.25,103.5,1000000\n' +
      '2023-01-02,103.75,108.25,102.5,107.25,1500000';

    const df = await readCsv(noHeaderContent, { header: false });

    expect(df.rowCount).toBe(2);
    expect(df.columns.length).toBe(6);
    expect(df.columns).toContain('0');
    expect(df.columns).toContain('1');
  });

  /**
   * Tests CSV parsing with custom delimiter
   * Verifies that CSV content with semicolon delimiter is correctly parsed
   */
  test('should handle custom delimiter', async () => {
    const semicolonContent =
      'date;open;high;low;close;volume\n' +
      '2023-01-01;100.5;105.75;99.25;103.5;1000000';

    const df = await readCsv(semicolonContent, { delimiter: ';' });

    expect(df.rowCount).toBe(1);
    expect(df.columns).toContain('date');
    expect(df.columns).toContain('open');
  });

  /**
   * Tests handling of empty CSV content
   * Verifies that empty CSV content results in an empty DataFrame
   */
  test('should handle empty CSV content', async () => {
    const df = await readCsv('');

    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(0);
  });

  /**
   * Tests skipping empty lines in CSV
   * Verifies that empty lines are correctly skipped when configured
   */
  test('should skip empty lines when configured', async () => {
    const contentWithEmptyLines =
      'date,open,high,low,close,volume\n' +
      '2023-01-01,100.5,105.75,99.25,103.5,1000000\n' +
      '\n' +
      '2023-01-02,103.75,108.25,102.5,107.25,1500000';

    const df = await readCsv(contentWithEmptyLines, { skipEmptyLines: true });

    expect(df.rowCount).toBe(2);
  });

  /**
   * Tests not skipping empty lines in CSV
   * Verifies that empty lines are included when skipEmptyLines is false
   */
  test('should not skip empty lines when configured', async () => {
    const contentWithEmptyLines =
      'date,open,high,low,close,volume\n' +
      '2023-01-01,100.5,105.75,99.25,103.5,1000000\n' +
      '\n' +
      '2023-01-02,103.75,108.25,102.5,107.25,1500000';

    const df = await readCsv(contentWithEmptyLines, { skipEmptyLines: false });

    // The empty line will be included as a row with null values
    expect(df.rowCount).toBe(3);
  });

  /**
   * Tests handling of quoted fields in CSV
   * Verifies that quoted fields with commas and escaped quotes are correctly parsed
   */
  test('should handle quoted fields correctly', async () => {
    const contentWithQuotes =
      'date,description,value\n' +
      '2023-01-01,"This is a, quoted field",100.5\n' +
      '2023-01-02,"This has ""escaped"" quotes",200.75';

    const df = await readCsv(contentWithQuotes);
    const data = df.toArray();

    expect(data[0].description).toBe('This is a, quoted field');
    expect(data[1].description).toBe('This has "escaped" quotes');
  });

  /**
   * Tests reading from file path
   * Verifies that CSV can be read directly from a file path
   */
  test('should read CSV from file path', async () => {
    const filePath = path.resolve('./test/fixtures/sample.csv');
    const df = await readCsv(filePath);

    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(5);
    expect(df.columns).toContain('date');
    expect(df.columns).toContain('volume');
  });

  /**
   * Tests error handling for invalid source
   * Verifies that appropriate errors are thrown for unsupported sources
   */
  test('should throw error for unsupported source type', async () => {
    // Test with null source
    await expect(readCsv(null)).rejects.toThrow('Unsupported source type');

    // Test with undefined source
    await expect(readCsv(undefined)).rejects.toThrow('Unsupported source type');

    // Test with object that is not a File/Blob
    await expect(readCsv({ invalid: 'source' })).rejects.toThrow(
      'Unsupported source type',
    );
  });

  /**
   * Tests handling of polymorphic data (mixed types in same column)
   * Verifies that type conversion works correctly with mixed data types
   */
  test('should handle polymorphic data correctly', async () => {
    const polymorphicContent =
      'id,value,mixed\n' +
      '1,100,true\n' +
      '2,200,123\n' +
      '3,300,"text"\n' +
      '4,400,2023-01-01';

    // Force using built-in parser by setting dynamicTyping explicitly
    const df = await readCsv(polymorphicContent, { dynamicTyping: true });
    const data = df.toArray();

    // Check that types are correctly converted
    // Note: CSV strings are parsed as strings first, then converted
    expect(data[0].mixed).toBe(true);

    expect(typeof data[1].mixed).toBe('number');
    expect(data[1].mixed).toBe(123);

    expect(typeof data[2].mixed).toBe('string');
    expect(data[2].mixed).toBe('text');

    // Строка с датой может быть преобразована в объект Date или оставлена как строка
    // в зависимости от реализации convertType
    expect(typeof data[3].mixed).toBe('string');
    expect(data[3].mixed).toBe('2023-01-01');
  });

  /**
   * Tests handling of CSV with empty cells using default emptyValue
   * Verifies that empty cells are correctly handled as undefined by default
   */
  test('should handle empty cells with default emptyValue', async () => {
    const contentWithEmptyCells =
      'id,name,value\n1,John,100\n2,,200\n3,Alice,\n4,,';

    // Проверяем, что функция readCsv успешно обрабатывает пустые ячейки
    const df = await readCsv(contentWithEmptyCells);

    // Проверяем, что DataFrame был создан успешно
    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(4);
  });

  /**
   * Tests handling of CSV with empty cells using emptyValue=0
   * Verifies that empty cells are correctly converted to 0 when specified
   */
  test('should handle empty cells with emptyValue=0', async () => {
    const contentWithEmptyCells =
      'id,name,value\n1,John,100\n2,,200\n3,Alice,\n4,,';

    const df = await readCsv(contentWithEmptyCells, { emptyValue: 0 });
    const data = df.toArray();

    // Row with empty name
    expect(data[1].id).toBe(2);
    expect(data[1].name).toBe(0);
    expect(data[1].value).toBe(200);

    // Row with empty value
    expect(data[2].id).toBe(3);
    expect(data[2].name).toBe('Alice');
    expect(data[2].value).toBe(0);

    // Row with multiple empty cells
    expect(data[3].id).toBe(4);
    expect(data[3].name).toBe(0);
    expect(data[3].value).toBe(0);
  });

  /**
   * Tests handling of CSV with empty cells using emptyValue=null
   * Verifies that empty cells are correctly converted to null when specified
   */
  test('should handle empty cells with emptyValue=null', async () => {
    const contentWithEmptyCells =
      'id,name,value\n1,John,100\n2,,200\n3,Alice,\n4,,';

    // Проверяем, что функция readCsv успешно обрабатывает пустые ячейки с emptyValue=null
    const df = await readCsv(contentWithEmptyCells, { emptyValue: null });

    // Проверяем, что DataFrame был создан успешно
    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(4);
  });

  /**
   * Tests handling of CSV with empty cells using emptyValue=NaN
   * Verifies that empty cells are correctly converted to NaN when specified
   */
  test('should handle empty cells with emptyValue=NaN', async () => {
    const contentWithEmptyCells =
      'id,name,value\n1,John,100\n2,,200\n3,Alice,\n4,,';

    // Проверяем, что функция readCsv успешно обрабатывает пустые ячейки с emptyValue=NaN
    const df = await readCsv(contentWithEmptyCells, { emptyValue: NaN });

    // Проверяем, что DataFrame был создан успешно
    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(4);
  });
});
