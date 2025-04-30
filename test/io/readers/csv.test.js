/**
 * Unit tests for CSV reader
 */

import { readCsv } from '../../../src/io/readers/csv.js';
import { DataFrame } from '../../../src/core/DataFrame.js';
import { describe, test, expect, beforeAll } from 'vitest';
import fs from 'fs/promises';
import path from 'path';

/**
 * Tests for the CSV reader functionality
 * Verifies correct parsing of CSV data with various options and edge cases
 */
describe('CSV Reader', () => {
  let csvContent;

  /**
   * Load test fixture before tests
   * Reads sample CSV file for use in multiple tests
   */
  beforeAll(async () => {
    csvContent = await fs.readFile(
      path.resolve('./test/fixtures/sample.csv'),
      'utf-8',
    );
  });

  /**
   * Tests basic CSV reading functionality
   * Verifies that CSV content is correctly parsed into a DataFrame
   */
  test('should read CSV content and return a DataFrame', () => {
    const df = readCsv(csvContent);

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
  test('should convert numeric values correctly', () => {
    const df = readCsv(csvContent);
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
  test('should handle CSV without headers', () => {
    const noHeaderContent =
      '2023-01-01,100.5,105.75,99.25,103.5,1000000\n' +
      '2023-01-02,103.75,108.25,102.5,107.25,1500000';

    const df = readCsv(noHeaderContent, { header: false });

    expect(df.rowCount).toBe(2);
    expect(df.columns.length).toBe(6);
    // Column names should be numeric indices as strings
    expect(df.columns).toContain('0');
    expect(df.columns).toContain('1');
  });

  /**
   * Tests CSV parsing with custom delimiter
   * Verifies that CSV content with semicolon delimiter is correctly parsed
   */
  test('should handle custom delimiter', () => {
    const semicolonContent =
      'date;open;high;low;close;volume\n' +
      '2023-01-01;100.5;105.75;99.25;103.5;1000000';

    const df = readCsv(semicolonContent, { delimiter: ';' });

    expect(df.rowCount).toBe(1);
    expect(df.columns).toContain('date');
    expect(df.columns).toContain('open');
  });

  /**
   * Tests handling of empty CSV content
   * Verifies that empty CSV content results in an empty DataFrame
   */
  test('should handle empty CSV content', () => {
    const df = readCsv('');

    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(0);
    expect(df.columns.length).toBe(0);
  });

  /**
   * Tests skipping empty lines in CSV
   * Verifies that empty lines are correctly skipped when configured
   */
  test('should skip empty lines when configured', () => {
    const contentWithEmptyLines =
      'date,open,high,low,close,volume\n' +
      '2023-01-01,100.5,105.75,99.25,103.5,1000000\n' +
      '\n' +
      '2023-01-02,103.75,108.25,102.5,107.25,1500000';

    const df = readCsv(contentWithEmptyLines, { skipEmptyLines: true });

    expect(df.rowCount).toBe(2);
  });

  /**
   * Tests not skipping empty lines in CSV
   * Verifies that empty lines are included when skipEmptyLines is false
   */
  test('should not skip empty lines when configured', () => {
    const contentWithEmptyLines =
      'date,open,high,low,close,volume\n' +
      '2023-01-01,100.5,105.75,99.25,103.5,1000000\n' +
      '\n' +
      '2023-01-02,103.75,108.25,102.5,107.25,1500000';

    const df = readCsv(contentWithEmptyLines, { skipEmptyLines: false });

    // The empty line will be included as a row with null values
    expect(df.rowCount).toBe(3);
  });

  /**
   * Tests handling of quoted fields in CSV
   * Verifies that quoted fields with commas and escaped quotes are correctly parsed
   */
  test('should handle quoted fields correctly', () => {
    const contentWithQuotes =
      'date,description,value\n' +
      '2023-01-01,"This is a, quoted field",100.5\n' +
      '2023-01-02,"Another ""quoted"" value",200.75';

    const df = readCsv(contentWithQuotes);
    const data = df.toArray();

    expect(data[0].description).toBe('This is a, quoted field');
    expect(data[1].description).toBe('Another "quoted" value');
  });
});
