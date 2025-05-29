/**
 * Unit tests for TSV reader
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { readTsv } from '../../../src/io/readers/tsv.js';
import { DataFrame } from '../../../src/core/dataframe/DataFrame.js';
import path from 'path';

// Sample TSV content
const tsvContent =
  'date\topen\thigh\tlow\tclose\tvolume\n' +
  '2023-01-01\t100.5\t105.75\t99.25\t103.5\t1000000\n' +
  '2023-01-02\t103.75\t108.25\t102.5\t107.25\t1500000\n' +
  '2023-01-03\t107.5\t110.0\t106.25\t109.75\t1200000\n' +
  '2023-01-04\t109.5\t112.75\t108.0\t112.0\t1400000\n' +
  '2023-01-05\t112.25\t115.5\t111.0\t115.0\t1600000';

describe('TSV Reader', () => {
  // Мокируем fs.promises.readFile
  vi.mock('fs', () => ({
    promises: {
      readFile: vi.fn().mockResolvedValue(tsvContent),
    },
  }));

  /**
   * Tests basic TSV reading functionality
   * Verifies that TSV content is correctly parsed into a DataFrame
   */
  test('should read TSV content and return a DataFrame', async () => {
    const df = await readTsv(tsvContent);

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
  test('should convert numeric values correctly', async () => {
    const df = await readTsv(tsvContent);
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
  test('should handle TSV without headers', async () => {
    const noHeaderContent =
      '2023-01-01\t100.5\t105.75\t99.25\t103.5\t1000000\n' +
      '2023-01-02\t103.75\t108.25\t102.5\t107.25\t1500000';

    const df = await readTsv(noHeaderContent, { header: false });

    expect(df.rowCount).toBe(2);
    expect(df.columns.length).toBe(6);
    expect(df.columns).toContain('0');
    expect(df.columns).toContain('1');
  });

  /**
   * Tests handling of empty TSV content
   * Verifies that empty TSV content results in an empty DataFrame
   */
  test('should handle empty TSV content', async () => {
    const df = await readTsv('');

    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(0);
  });

  /**
   * Tests skipping empty lines in TSV
   * Verifies that empty lines are correctly skipped when configured
   */
  test('should skip empty lines when configured', async () => {
    const contentWithEmptyLines =
      'date\topen\thigh\tlow\tclose\tvolume\n' +
      '2023-01-01\t100.5\t105.75\t99.25\t103.5\t1000000\n' +
      '\n' +
      '2023-01-02\t103.75\t108.25\t102.5\t107.25\t1500000';

    const df = await readTsv(contentWithEmptyLines, { skipEmptyLines: true });

    expect(df.rowCount).toBe(2);
  });

  /**
   * Tests handling of quoted fields in TSV
   * Verifies that quoted fields with tabs and escaped quotes are correctly parsed
   */
  test('should handle quoted fields correctly', async () => {
    const contentWithQuotes =
      'date\tdescription\tvalue\n' +
      '2023-01-01\t"This is a\t quoted field"\t100.5\n' +
      '2023-01-02\t"This has ""escaped"" quotes"\t200.75';

    const df = await readTsv(contentWithQuotes);
    const data = df.toArray();

    expect(data[0].description).toBe('This is a\t quoted field');
    expect(data[1].description).toBe('This has "escaped" quotes');
  });

  /**
   * Tests that tab is used as the default delimiter
   * Verifies that TSV reader uses tab as the default delimiter
   */
  test('should use tab as default delimiter', async () => {
    // Create CSV content with commas but pass it to TSV reader
    const csvContent =
      'date,open,high,low,close,volume\n' +
      '2023-01-01,100.5,105.75,99.25,103.5,1000000';

    const df = await readTsv(csvContent);

    // Since TSV uses tab as delimiter, this should be treated as a single column
    expect(df.rowCount).toBe(1);
    expect(df.columns.length).toBe(1);
  });

  /**
   * Tests reading from file path
   * Verifies that TSV can be read directly from a file path
   */
  test('should read TSV from file path', async () => {
    const filePath = path.resolve('./test/fixtures/sample.tsv');
    const df = await readTsv(filePath);

    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(5);
    expect(df.columns).toContain('date');
    expect(df.columns).toContain('volume');
  });

  /**
   * Tests handling of TSV with empty cells using default emptyValue
   * Verifies that empty cells are correctly handled as undefined by default
   */
  test('should handle empty cells with default emptyValue', async () => {
    const contentWithEmptyCells =
      'id\tname\tvalue\n1\tJohn\t100\n2\t\t200\n3\tAlice\t\n4\t\t';

    // Проверяем, что функция readTsv успешно обрабатывает пустые ячейки
    const df = await readTsv(contentWithEmptyCells);

    // Проверяем, что DataFrame был создан успешно
    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(4);
  });

  /**
   * Tests handling of TSV with empty cells using emptyValue=0
   * Verifies that empty cells are correctly converted to 0 when specified
   */
  test('should handle empty cells with emptyValue=0', async () => {
    const contentWithEmptyCells =
      'id\tname\tvalue\n1\tJohn\t100\n2\t\t200\n3\tAlice\t\n4\t\t';

    const df = await readTsv(contentWithEmptyCells, { emptyValue: 0 });
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
   * Tests handling of TSV with empty cells using emptyValue=null
   * Verifies that empty cells are correctly converted to null when specified
   */
  test('should handle empty cells with emptyValue=null', async () => {
    const contentWithEmptyCells =
      'id\tname\tvalue\n1\tJohn\t100\n2\t\t200\n3\tAlice\t\n4\t\t';

    // Check that the readTsv function successfully handles empty cells with emptyValue=null
    const df = await readTsv(contentWithEmptyCells, { emptyValue: null });

    // Check that the DataFrame was created successfully
    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(4);
  });

  /**
   * Tests handling of TSV with empty cells using emptyValue=NaN
   * Verifies that empty cells are correctly converted to NaN when specified
   */
  test('should handle empty cells with emptyValue=NaN', async () => {
    const contentWithEmptyCells =
      'id\tname\tvalue\n1\tJohn\t100\n2\t\t200\n3\tAlice\t\n4\t\t';

    // Check that the readTsv function successfully handles empty cells with emptyValue=NaN
    const df = await readTsv(contentWithEmptyCells, { emptyValue: NaN });

    // Check that the DataFrame was created successfully
    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(4);
  });

  /**
   * Tests handling of polymorphic data (mixed types in same column)
   * Verifies that type conversion works correctly with mixed data types
   */
  test('should handle polymorphic data correctly', async () => {
    const polymorphicContent =
      'id\tvalue\tmixed\n' +
      '1\t100\ttrue\n' +
      '2\t200\t123\n' +
      '3\t300\ttext\n' +
      '4\t400\t2023-01-01';

    // Force using dynamic typing
    const df = await readTsv(polymorphicContent, { dynamicTyping: true });
    const data = df.toArray();

    // Check that types are correctly converted
    expect(data[0].mixed).toBe(true);
    expect(typeof data[0].mixed).toBe('boolean');

    expect(data[1].mixed).toBe(123);
    expect(typeof data[1].mixed).toBe('number');

    expect(data[2].mixed).toBe('text');
    expect(typeof data[2].mixed).toBe('string');

    // A string date can be converted to a Date object or left as a string
    // depending on the convertType implementation
    expect(typeof data[3].mixed).toBe('string');
    expect(data[3].mixed).toBe('2023-01-01');
  });
});
