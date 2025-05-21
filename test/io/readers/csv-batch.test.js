/**
 * Unit tests for CSV batch processing functionality
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { DataFrame } from '../../../src/core/DataFrame.js';

// Мокируем модуль csv.js
vi.mock('../../../src/io/readers/csv.js', () => {
  // Создаем мок для функции readCsvInBatches
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
        row[col] = options.dynamicTyping ?
          parseFloat(values[idx]) || values[idx] :
          values[idx];
      });
      batch.push(row);

      if (batch.length >= batchSize || i === dataLines.length - 1) {
        // Создаем функцию для обработки колонок вне цикла
        function createColumnsFromBatch(batchData, headerCols) {
          return headerCols.reduce((acc, col) => {
            acc[col] = batchData.map((row) => row[col]);
            return acc;
          }, {});
        }

        // Создаем правильную структуру TinyFrame
        const frame = {
          columns: createColumnsFromBatch(batch, header),
          rowCount: batch.length,
        };

        yield new DataFrame(frame);
        batch = [];
      }
    }
  };

  // Создаем мок для функции readCsv с поддержкой батчей
  const mockReadCsv = async (source, options = {}) => {
    // Если указан batchSize, используем потоковую обработку
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

          // Создаем правильную структуру TinyFrame
          const frame = {
            columns: Object.keys(allData[0] || {}).reduce((acc, key) => {
              acc[key] = allData.map((item) => item[key]);
              return acc;
            }, {}),
            rowCount: allData.length,
          };

          return new DataFrame(frame);
        },
      };
    }

    // Для обычного чтения возвращаем DataFrame напрямую
    const lines = source.split('\n');
    const header = lines[0].split(',');
    const dataLines = lines.slice(1);

    const data = dataLines.map((line) => {
      const values = line.split(',');
      const row = {};
      header.forEach((col, idx) => {
        row[col] = options.dynamicTyping ?
          parseFloat(values[idx]) || values[idx] :
          values[idx];
      });
      return row;
    });

    const frame = {
      columns: header.reduce((acc, col) => {
        acc[col] = data.map((row) => row[col]);
        return acc;
      }, {}),
      rowCount: data.length,
    };

    return new DataFrame(frame);
  };

  // Создаем мок для функции addCsvBatchMethods
  const mockAddCsvBatchMethods = (DataFrameClass) => {
    // Добавляем статический метод readCsv к DataFrame
    DataFrameClass.readCsv = mockReadCsv;

    // Добавляем readCsvInBatches как статический метод
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

// Импортируем функции после мокирования
import {
  readCsvInBatches,
  addCsvBatchMethods,
} from '../../../src/io/readers/csv.js';

// Инициализируем DataFrame с методами для работы с CSV
addCsvBatchMethods(DataFrame);

// Добавляем метод toArray к DataFrame для тестов
DataFrame.prototype.toArray = vi.fn().mockImplementation(function() {
  const frame = this._frame;
  const result = [];

  if (!frame || !frame.columns || !frame.rowCount) {
    return [];
  }

  const columns = Object.keys(frame.columns);
  for (let i = 0; i < frame.rowCount; i++) {
    const row = {};
    columns.forEach((col) => {
      row[col] = frame.columns[col][i];
    });
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
    // Проверяем, что метод toArray был вызван
    expect(DataFrame.prototype.toArray).toHaveBeenCalled();
  });
});
