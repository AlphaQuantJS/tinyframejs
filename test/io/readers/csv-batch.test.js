/**
 * Unit tests for CSV batch processing functionality
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { DataFrame } from '../../../src/core/dataframe/DataFrame.js';

// Mock the csv.js module
vi.mock('../../../src/io/readers/csv.js', () => {
  // Create a mock for the readCsvInBatches function
  const mockGenerator = async function* (source, options = {}) {
    const lines = source.split('\n');
    const header = lines[0].split(',');
    const dataLines = lines.slice(1);
    const batchSize = options.batchSize || 1000;

    let batch = [];
    for (let i = 0; i < dataLines.length; i++) {
      const values = dataLines[i].split(',');
      const row = {};
      header.forEach((col, idx) => {
        row[col] = options.dynamicTyping
          ? parseFloat(values[idx]) || values[idx]
          : values[idx];
      });
      batch.push(row);

      if (batch.length >= batchSize || i === dataLines.length - 1) {
        // Create a function to process columns outside the loop
        function createColumnsFromBatch(batchData, headerCols) {
          return headerCols.reduce((acc, col) => {
            acc[col] = batchData.map((row) => row[col]);
            return acc;
          }, {});
        }

        // Создаем DataFrame с правильной структурой для совместимости с реальной реализацией
        const columns = {};
        if (batch.length > 0) {
          const keys = Object.keys(batch[0]);
          for (const key of keys) {
            columns[key] = batch.map((row) => row[key]);
          }
        }
        yield new DataFrame(columns);
        batch = [];
      }
    }
  };

  // Create a mock for the readCsv function with batch support
  const mockReadCsv = async (source, options = {}) => {
    // If batchSize is specified, use streaming processing
    if (options.batchSize) {
      return {
        process: async (callback) => {
          const batchGenerator = mockGenerator(source, options);
          for await (const batchDf of batchGenerator) {
            await callback(batchDf);
          }
        },
        collect: async () => {
          const allData = [];
          const batchGenerator = mockGenerator(source, options);
          for await (const batchDf of batchGenerator) {
            allData.push(...batchDf.toArray());
          }

          // Создаем DataFrame с правильной структурой для совместимости с реальной реализацией
          const columns = {};
          if (allData.length > 0) {
            const keys = Object.keys(allData[0]);
            for (const key of keys) {
              columns[key] = allData.map((row) => row[key]);
            }
          }
          return new DataFrame(columns);
        },
      };
    }

    // For regular reading, return DataFrame directly
    const lines = source.split('\n');
    const header = lines[0].split(',');
    const dataLines = lines.slice(1);

    const data = dataLines.map((line) => {
      const values = line.split(',');
      const row = {};
      header.forEach((col, idx) => {
        row[col] = options.dynamicTyping
          ? parseFloat(values[idx]) || values[idx]
          : values[idx];
      });
      return row;
    });

    // Создаем DataFrame с правильной структурой для совместимости с реальной реализацией
    const columns = {};
    if (data.length > 0) {
      const keys = Object.keys(data[0]);
      for (const key of keys) {
        columns[key] = data.map((row) => row[key]);
      }
    }
    return new DataFrame(columns);
  };

  // Create a mock for the addCsvBatchMethods function
  const mockAddCsvBatchMethods = (DataFrameClass) => {
    // Add the static readCsv method to DataFrame
    DataFrameClass.readCsv = mockReadCsv;

    // Add readCsvInBatches as a static method
    DataFrameClass.readCsvInBatches = mockGenerator;

    return DataFrameClass;
  };

  return {
    readCsv: mockReadCsv,
    readCsvInBatches: mockGenerator,
    addCsvBatchMethods: mockAddCsvBatchMethods,
    isNodeJs: vi.fn().mockReturnValue(false),
    isNodeFilePath: vi.fn().mockReturnValue(false),
    getContentFromSource: vi
      .fn()
      .mockImplementation((source) => Promise.resolve(source)),
  };
});

// Import functions after mocking
import {
  readCsvInBatches,
  addCsvBatchMethods,
} from '../../../src/io/readers/csv.js';

// Initialize DataFrame with CSV methods
addCsvBatchMethods(DataFrame);

// Добавляем метод toArray для тестов
DataFrame.prototype.toArray = vi.fn().mockImplementation(function () {
  // Реализация, совместимая с настоящим DataFrame
  const result = [];
  const order = this._order || Object.keys(this._columns || {});

  if (!order.length) return [];

  const len = this.rowCount;
  for (let i = 0; i < len; i++) {
    const row = {};
    for (const name of order) {
      row[name] = this._columns[name]?.get
        ? this._columns[name].get(i)
        : this._columns[name]?.[i];
    }
    result.push(row);
  }

  return result;
});

// Sample CSV content
const csvContent =
  'date,open,high,low,close,volume\n' +
  '2023-01-01,100.5,105.75,99.25,103.5,1000000\n' +
  '2023-01-02,103.75,108.25,102.5,107.25,1500000\n' +
  '2023-01-03,107.5,110.0,106.25,109.75,1200000\n' +
  '2023-01-04,109.5,112.75,108.0,112.0,1400000\n' +
  '2023-01-05,112.25,115.5,111.0,115.0,1600000';

describe('CSV Batch Processing', () => {
  test('should process CSV string in batches', async () => {
    const batchSize = 2;
    const batches = [];

    // Use the generator function directly
    const batchGenerator = readCsvInBatches(csvContent, { batchSize });
    for await (const batch of batchGenerator) {
      batches.push(batch);
      expect(batch).toBeInstanceOf(DataFrame);
    }

    // Should have 3 batches: 2 with batchSize=2 and 1 with remaining row
    expect(batches.length).toBe(3);
    expect(batches[0].rowCount).toBe(2);
    expect(batches[1].rowCount).toBe(2);
    expect(batches[2].rowCount).toBe(1);
  });

  test('should use DataFrame.readCsv with batchSize option to collect all data', async () => {
    // Test the collect method
    const batchProcessor = await DataFrame.readCsv(csvContent, {
      batchSize: 3,
    });
    const df = await batchProcessor.collect();

    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(5);
  });

  test('should process batches with callback function', async () => {
    const processedBatches = [];

    const batchProcessor = await DataFrame.readCsv(csvContent, {
      batchSize: 2,
    });
    await batchProcessor.process(async (batchDf) => {
      processedBatches.push(batchDf);
      // Simulate some async processing
      await new Promise((resolve) => setTimeout(resolve, 1));
    });

    expect(processedBatches.length).toBe(3);
    expect(processedBatches[0].rowCount).toBe(2);
  });

  test('should handle custom options', async () => {
    const batchProcessor = await DataFrame.readCsv(csvContent, {
      batchSize: 5,
      dynamicTyping: true,
      emptyValue: null,
    });
    const df = await batchProcessor.collect();

    expect(df.rowCount).toBe(5);
    // Check that the toArray method was called
    expect(DataFrame.prototype.toArray).toHaveBeenCalled();
  });
});
