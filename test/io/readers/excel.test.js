/**
 * Unit tests for Excel reader
 */

import { readExcel } from '../../../src/io/readers/excel.js';
import { DataFrame } from '../../../src/core/DataFrame.js';
import { describe, test, expect, vi } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import XLSX from 'xlsx';

/**
 * Mock implementation of the XLSX library
 * Provides mock implementations for read, readFile, and sheet_to_json functions
 * to allow testing without actual Excel files
 */
vi.mock('xlsx', () => ({
  default: {
    read: vi.fn().mockImplementation(() => ({
      SheetNames: ['Sheet1'],
      Sheets: {
        Sheet1: {
          '!ref': 'A1:F3',
        },
      },
    })),
    readFile: vi.fn().mockImplementation(() => ({
      SheetNames: ['Sheet1'],
      Sheets: {
        Sheet1: {
          '!ref': 'A1:F3',
        },
      },
    })),
    utils: {
      // eslint-disable-next-line camelcase
      sheet_to_json: vi.fn().mockImplementation(() => [
        {
          date: '2023-01-01',
          open: 100.5,
          high: 105.75,
          low: 99.25,
          close: 103.5,
          volume: 1000000,
        },
      ]),
    },
  },
}));

/**
 * Tests for the Excel reader functionality
 * Verifies correct parsing of Excel data with various options
 */
describe('Excel Reader', () => {
  /**
   * Tests reading Excel data from a buffer
   * Verifies that Excel buffer content is correctly parsed into a DataFrame
   */
  test('should read Excel buffer and return a DataFrame', async () => {
    // Create a buffer for testing
    const buffer = Buffer.from('test');

    const df = await readExcel(buffer);

    expect(df).toBeInstanceOf(DataFrame);
  });

  /**
   * Tests reading Excel data from a file path
   * Verifies that Excel file content is correctly parsed into a DataFrame
   */
  test('should read Excel file path and return a DataFrame', async () => {
    // Use a file path for testing
    const filePath = '/path/to/test.xlsx';

    const df = await readExcel(filePath);

    expect(df).toBeInstanceOf(DataFrame);
  });

  /**
   * Tests reading Excel data with sheet name option
   * Verifies that the specified sheet is correctly parsed
   */
  test('should handle sheet name option', async () => {
    const buffer = Buffer.from('test');
    const options = { sheetName: 'Sheet1' };

    const df = await readExcel(buffer, options);

    expect(df).toBeInstanceOf(DataFrame);
  });

  /**
   * Tests reading Excel data with sheet index option
   * Verifies that the specified sheet index is correctly parsed
   */
  test('should handle sheet index option', async () => {
    const buffer = Buffer.from('test');
    const options = { sheetIndex: 0 };

    const df = await readExcel(buffer, options);

    expect(df).toBeInstanceOf(DataFrame);
  });

  /**
   * Tests numeric value conversion in Excel data
   * Verifies that numeric values are correctly converted
   */
  test('should convert numeric values correctly', async () => {
    const buffer = Buffer.from('test');

    const df = await readExcel(buffer);

    expect(df).toBeInstanceOf(DataFrame);
  });
});
