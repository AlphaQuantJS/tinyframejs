/**
 * Unit tests for TSV reader
 */

import { readTsv } from '../../../src/io/readers/tsv.js';
import { DataFrame } from '../../../src/core/DataFrame.js';
import { describe, test, expect, beforeAll } from 'vitest';
import fs from 'fs/promises';
import path from 'path';

/**
 * Tests for the TSV reader functionality
 * Verifies correct parsing of TSV data with various options and edge cases
 */
describe('TSV Reader', () => {
  let tsvContent;

  /**
   * Load test fixture before tests
   * Creates sample TSV content for use in multiple tests
   */
  beforeAll(async () => {
    tsvContent = await fs.readFile(
      path.resolve('./test/fixtures/sample.tsv'),
      'utf-8',
    );
  });

  /**
   * Tests basic TSV reading functionality
   * Verifies that TSV content is correctly parsed into a DataFrame
   */
  test('should read TSV content and return a DataFrame', () => {
    const df = readTsv(tsvContent);

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
   * Verifies that numeric values in TSV are correctly converted to numbers
   */
  test('should convert numeric values correctly', () => {
    const df = readTsv(tsvContent);
    const data = df.toArray();

    expect(typeof data[0].open).toBe('number');
    expect(data[0].open).toBe(100.5);
    expect(typeof data[0].volume).toBe('number');
    expect(data[0].volume).toBe(1000000);
  });

  /**
   * Tests TSV parsing without headers
   * Verifies that TSV content without headers is correctly parsed
   */
  test('should handle TSV without headers', () => {
    const noHeaderContent =
      '2023-01-01\t100.5\t105.75\t99.25\t103.5\t1000000\n' +
      '2023-01-02\t103.75\t108.25\t102.5\t107.25\t1500000';

    const df = readTsv(noHeaderContent, { header: false });

    expect(df.rowCount).toBe(2);
    expect(df.columns.length).toBe(6);
    // Column names should be numeric indices as strings
    expect(df.columns).toContain('0');
    expect(df.columns).toContain('1');
  });

  /**
   * Tests handling of empty TSV content
   * Verifies that empty TSV content results in an empty DataFrame
   */
  test('should handle empty TSV content', () => {
    const df = readTsv('');

    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(0);
    expect(df.columns.length).toBe(0);
  });

  /**
   * Tests skipping empty lines in TSV
   * Verifies that empty lines are correctly skipped when configured
   */
  test('should skip empty lines when configured', () => {
    const contentWithEmptyLines =
      'date\topen\thigh\tlow\tclose\tvolume\n' +
      '2023-01-01\t100.5\t105.75\t99.25\t103.5\t1000000\n' +
      '\n' +
      '2023-01-02\t103.75\t108.25\t102.5\t107.25\t1500000';

    const df = readTsv(contentWithEmptyLines, { skipEmptyLines: true });

    expect(df.rowCount).toBe(2);
  });

  /**
   * Tests handling of quoted fields in TSV
   * Verifies that quoted fields with tabs and escaped quotes are correctly parsed
   */
  test('should handle quoted fields correctly', () => {
    const contentWithQuotes =
      'date\tdescription\tvalue\n' +
      '2023-01-01\t"This is a\t quoted field"\t100.5\n' +
      '2023-01-02\t"Another ""quoted"" value"\t200.75';

    const df = readTsv(contentWithQuotes);
    const data = df.toArray();

    expect(data[0].description).toBe('This is a\t quoted field');
    // Модуль csv-parse сохраняет кавычки внутри цитированных полей
    expect(data[1].description).toBe('Another "quoted" value');
  });

  /**
   * Tests that tab is used as the default delimiter
   * Verifies that TSV reader uses tab as the default delimiter
   */
  test('should use tab as default delimiter', () => {
    // Create CSV content with commas but pass it to TSV reader
    const csvContent =
      'date,open,high,low,close,volume\n' +
      '2023-01-01,100.5,105.75,99.25,103.5,1000000';

    const df = readTsv(csvContent);

    // Since TSV uses tab as delimiter, this should be treated as a single column
    expect(df.rowCount).toBe(1);
    expect(df.columns.length).toBe(1);
  });
});
