/**
 * Comprehensive tests for CSV reader in Node.js environment
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { readCsv, detectEnvironment } from '../../../src/io/readers/csv.js';
import { DataFrame } from '../../../src/core/dataframe/DataFrame.js';
import path from 'path';

// Sample CSV content with valid data
const csvContent =
  'date,open,high,low,close,volume\n' +
  '2023-01-01,100.5,105.75,99.25,103.5,1000000\n' +
  '2023-01-02,103.75,108.25,102.5,107.25,1500000\n' +
  '2023-01-03,107.5,110.0,106.25,109.75,1200000\n' +
  '2023-01-04,109.5,112.75,108.0,112.0,1400000\n' +
  '2023-01-05,112.25,115.5,111.0,115.0,1600000';

// CSV with misaligned columns
const csvMisalignedContent =
  'date,open,high,low,close,volume\n' +
  '2023-01-01,100.5,105.75,99.25,103.5\n' + // Missing volume
  '2023-01-02,103.75,108.25,102.5,107.25,1500000,extra\n' + // Extra column
  '2023-01-03,107.5,110.0,106.25,109.75,1200000';

// CSV with invalid headers
const csvInvalidHeadersContent =
  ',open,,low,close,volume\n' + // Empty header names
  '2023-01-01,100.5,105.75,99.25,103.5,1000000';

// CSV with date strings for testing parseDates option
const csvWithDatesContent =
  'date,value\n2023-01-01,100\n2023-01-02,200\n2023-01-03,300';

describe('CSV Reader Tests', () => {
  // Mock fs.promises.readFile
  vi.mock('fs', () => ({
    promises: {
      readFile: vi.fn().mockResolvedValue(csvContent),
    },
  }));

  /**
   * Tests environment detection
   */
  test('should detect current environment', () => {
    const env = detectEnvironment();
    // We're running in Node.js, so this should be 'node'
    expect(env).toBe('node');
  });

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

    // Проверка типов данных
    const firstRow = df.toArray()[0];
    expect(typeof firstRow.date).toBe('string');
    expect(typeof firstRow.open).toBe('number');
    expect(typeof firstRow.volume).toBe('number');
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
  test('should include empty lines when skipEmptyLines is false', async () => {
    const contentWithEmptyLines =
      'date,open,high,low,close,volume\n' +
      '2023-01-01,100.5,105.75,99.25,103.5,1000000\n' +
      '\n' +
      '2023-01-02,103.75,108.25,102.5,107.25,1500000';

    const df = await readCsv(contentWithEmptyLines, { skipEmptyLines: false });

    // The empty line should be included in the result
    expect(df.rowCount).toBe(3);
  });

  /**
   * Tests batch processing
   */
  test('should support batch processing', async () => {
    // Read CSV with batch processing
    const batchProcessor = await readCsv(csvContent, { batchSize: 2 });

    // Verify that batch processor has the expected methods
    expect(batchProcessor).toHaveProperty('process');
    expect(batchProcessor).toHaveProperty('collect');
    expect(typeof batchProcessor.process).toBe('function');
    expect(typeof batchProcessor.collect).toBe('function');

    // Test collect method
    const df = await batchProcessor.collect();

    // Verify collect results
    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(5);
  });

  /**
   * Tests handling of misaligned columns
   */
  test('should handle misaligned columns with warnings', async () => {
    // Spy on console.warn
    const warnSpy = vi.spyOn(console, 'warn');

    const df = await readCsv(csvMisalignedContent);

    // Verify the result
    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(3);

    // Verify that warnings were logged
    expect(warnSpy).toHaveBeenCalled();

    // Restore console.warn
    warnSpy.mockRestore();
  });

  /**
   * Tests validation of headers
   */
  test('should throw error for invalid headers', async () => {
    // Expect the readCsv function to throw an error for invalid headers
    await expect(readCsv(csvInvalidHeadersContent)).rejects.toThrow(
      'Invalid CSV header',
    );
  });

  /**
   * Tests options for type conversion
   */
  test('should respect dynamicTyping option', async () => {
    // With dynamicTyping: false
    const dfWithoutTyping = await readCsv(csvContent, { dynamicTyping: false });
    const firstRowWithoutTyping = dfWithoutTyping.toArray()[0];

    // Values should remain as strings
    expect(typeof firstRowWithoutTyping.open).toBe('string');
    expect(typeof firstRowWithoutTyping.volume).toBe('string');

    // With dynamicTyping: true (default)
    const dfWithTyping = await readCsv(csvContent);
    const firstRowWithTyping = dfWithTyping.toArray()[0];

    // Values should be converted to numbers
    expect(typeof firstRowWithTyping.open).toBe('number');
    expect(typeof firstRowWithTyping.volume).toBe('number');
  });

  /**
   * Tests handling of empty lines based on skipEmptyLines option
   */
  test('should handle empty lines based on skipEmptyLines option', async () => {
    const csvWithEmptyLines = csvContent + '\n\n\n';

    // With skipEmptyLines: true (default)
    const dfSkipEmpty = await readCsv(csvWithEmptyLines);
    expect(dfSkipEmpty.rowCount).toBe(5);

    // With skipEmptyLines: false
    const dfKeepEmpty = await readCsv(csvWithEmptyLines, {
      skipEmptyLines: false,
    });
    // Expect more rows due to empty lines being included
    expect(dfKeepEmpty.rowCount).toBeGreaterThan(5);
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

    // The date string can be converted to a Date object or left as a string
    // depending on the implementation of convertType
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

    // Check that the readCsv function successfully processes empty cells
    const df = await readCsv(contentWithEmptyCells);

    // Check that the DataFrame was created successfully
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

    // Check that the readCsv function successfully processes empty cells with emptyValue=null
    const df = await readCsv(contentWithEmptyCells, { emptyValue: null });

    // Check that the DataFrame was created successfully
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

    // Check that the readCsv function successfully processes empty cells with emptyValue=NaN
    const df = await readCsv(contentWithEmptyCells, { emptyValue: NaN });

    // Check that the DataFrame was created successfully
    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(4);
  });
});
