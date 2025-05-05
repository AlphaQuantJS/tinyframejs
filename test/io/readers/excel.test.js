/**
 * Unit tests for Excel reader
 */

import { readExcel } from '../../../src/io/readers/excel.js';
import { DataFrame } from '../../../src/core/DataFrame.js';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import * as ExcelJS from 'exceljs';

// Create mock for DataFrame.create to avoid dependency on actual implementation
vi.mock('../../../src/core/DataFrame.js', () => {
  const mockColumns = {
    date: ['2023-01-01'],
    open: [100.5],
    high: [105.75],
    low: [99.25],
    close: [103.5],
    volume: [1000000],
  };

  return {
    DataFrame: {
      create: vi.fn().mockImplementation(() => ({
        columns: mockColumns,
        rowCount: 1,
        toArray: () => [
          {
            date: '2023-01-01',
            open: 100.5,
            high: 105.75,
            low: 99.25,
            close: 103.5,
            volume: 1000000,
          },
        ],
      })),
    },
  };
});

// Create mock for ExcelJS
vi.mock('exceljs', () => {
  // Mock for cell
  class Cell {
    constructor(value) {
      this.value = value;
    }
  }

  // Mock for row
  class Row {
    constructor(cells = {}) {
      this.cells = cells;
    }

    eachCell(callback) {
      Object.entries(this.cells).forEach(([colNumber, cell]) => {
        callback(cell, parseInt(colNumber));
      });
    }
  }

  // Mock for worksheet
  class Worksheet {
    constructor(name, rows = {}) {
      this.name = name;
      this.rows = rows;
    }

    eachRow(callback) {
      Object.entries(this.rows).forEach(([rowNumber, row]) => {
        callback(row, parseInt(rowNumber));
      });
    }

    getRow(rowNumber) {
      return this.rows[rowNumber] || new Row();
    }
  }

  // Mock for workbook
  class Workbook {
    constructor() {
      // Create test data
      const headerRow = new Row({
        1: new Cell('date'),
        2: new Cell('open'),
        3: new Cell('high'),
        4: new Cell('low'),
        5: new Cell('close'),
        6: new Cell('volume'),
      });

      const dataRow = new Row({
        1: new Cell('2023-01-01'),
        2: new Cell(100.5),
        3: new Cell(105.75),
        4: new Cell(99.25),
        5: new Cell(103.5),
        6: new Cell(1000000),
      });

      const worksheet = new Worksheet('Sheet1', {
        1: headerRow,
        2: dataRow,
      });

      this.worksheets = [worksheet];
    }

    getWorksheet(name) {
      return this.worksheets.find((sheet) => sheet.name === name);
    }

    xlsx = {
      readFile: vi.fn().mockResolvedValue(this),
      load: vi.fn().mockResolvedValue(this),
    };
  }

  return {
    Workbook: vi.fn().mockImplementation(() => new Workbook()),
  };
});

// Mock global fetch
global.fetch = vi.fn();

describe('Excel Reader', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup fetch mock response
    global.fetch.mockResolvedValue({
      ok: true,
      arrayBuffer: vi.fn().mockResolvedValue(Buffer.from('test')),
      statusText: 'OK',
    });
  });

  test('should read Excel buffer and return a DataFrame', async () => {
    const buffer = Buffer.from('test');

    const df = await readExcel(buffer);

    expect(df).toBeDefined();
    expect(df.columns).toHaveProperty('date');
    expect(df.columns).toHaveProperty('open');
    expect(df.rowCount).toBe(1);
  });

  test('should read Excel file path and return a DataFrame', async () => {
    const filePath = '/path/to/test.xlsx';

    const df = await readExcel(filePath);

    expect(df).toBeDefined();
    expect(df.columns).toHaveProperty('date');
    expect(df.columns).toHaveProperty('open');
  });

  test('should handle sheet name option', async () => {
    const buffer = Buffer.from('test');
    const options = { sheet: 'Sheet1' };

    const df = await readExcel(buffer, options);

    expect(df).toBeDefined();
    expect(df.columns).toHaveProperty('date');
  });

  test('should handle sheet index option', async () => {
    const buffer = Buffer.from('test');
    const options = { sheet: 0 };

    const df = await readExcel(buffer, options);

    expect(df).toBeDefined();
    expect(df.columns).toHaveProperty('date');
  });

  test('should convert numeric values correctly', async () => {
    const buffer = Buffer.from('test');

    const df = await readExcel(buffer);

    expect(df).toBeDefined();
    expect(df.columns.open[0]).toBe(100.5);
    expect(df.columns.high[0]).toBe(105.75);
    expect(typeof df.columns.open[0]).toBe('number');
  });

  test('should read Excel from URL', async () => {
    const url = 'https://example.com/test.xlsx';

    // Ensure fetch is mocked properly
    global.fetch.mockImplementationOnce((fetchUrl) => {
      expect(fetchUrl).toBe(url);
      return Promise.resolve({
        ok: true,
        arrayBuffer: () => Promise.resolve(Buffer.from('test')),
      });
    });

    const df = await readExcel(url);

    expect(df).toBeDefined();
    expect(df.columns).toHaveProperty('date');
    expect(df.columns).toHaveProperty('open');
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(url);
  });

  test('should handle URL fetch error', async () => {
    const url = 'https://example.com/nonexistent.xlsx';

    // Mock fetch to return an error
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        statusText: 'Not Found',
      }),
    );

    await expect(readExcel(url)).rejects.toThrow('Failed to fetch');
  });

  test('should read Excel from File object', async () => {
    // Mock FileReader
    class MockFileReader {
      constructor() {
        this.result = null;
        this.onload = null;
      }

      readAsArrayBuffer(blob) {
        // Simulate async file reading
        setTimeout(() => {
          this.result = Buffer.from('test');
          if (this.onload) this.onload({ target: this });
        }, 0);
      }
    }

    global.FileReader = MockFileReader;

    // Mock Blob
    class MockBlob {
      constructor(parts, options = {}) {
        this.parts = parts;
        this.options = options;
      }
    }

    // Mock File
    class MockFile extends MockBlob {
      constructor(parts, name, options = {}) {
        super(parts, options);
        this.name = name;
        this.lastModified = options.lastModified || Date.now();
      }
    }

    global.Blob = MockBlob;
    global.File = MockFile;

    // Create a mock File
    const file = new MockFile([Buffer.from('test')], 'test.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const df = await readExcel(file);

    expect(df).toBeDefined();
    expect(df.columns).toHaveProperty('date');
    expect(df.columns).toHaveProperty('open');
  });

  test('should throw error for unsupported data type', async () => {
    await expect(readExcel(123)).rejects.toThrow('Unsupported source type');
  });
});
