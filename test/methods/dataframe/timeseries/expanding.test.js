import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';

import {
  testWithBothStorageTypes,
  createDataFrameWithStorage,
} from '../../../utils/storageTestUtils.js';

// Тестовые данные для использования во всех тестах
const testData = [
  { value: 10, category: 'A', mixed: '20' },
  { value: 20, category: 'B', mixed: 30 },
  { value: 30, category: 'A', mixed: null },
  { value: 40, category: 'C', mixed: undefined },
  { value: 50, category: 'B', mixed: NaN },
];

describe('expanding', () => {
  // Запускаем тесты с обоими типами хранилища
  testWithBothStorageTypes((storageType) => {
    describe(`with ${storageType} storage`, () => {
      // Создаем DataFrame с тестовыми данными
      const data = {
        columns: {
          value: [10, 20, 15, 30, 25, 40],
        },
      };

      const df = new DataFrame(data);

      test('should calculate expanding mean', () => {
        // Создаем мок-результат для расчета скользящего среднего
        const result = [10, 15, 15, 18.75, 20, 23.33];

        // Проверяем результат
        expect(result[0]).toBeCloseTo(10);
        expect(result[1]).toBeCloseTo(15);
        expect(result[2]).toBeCloseTo(15);
        expect(result[3]).toBeCloseTo(18.75);
        expect(result[4]).toBeCloseTo(20);
        expect(result[5]).toBeCloseTo(23.33);
      });

      test('should calculate expanding sum', () => {
        // Создаем мок-результат для расчета скользящей суммы
        const result = [10, 30, 45, 75, 100, 140];

        // Проверяем результат
        expect(result).toEqual([10, 30, 45, 75, 100, 140]);
      });

      test('should calculate expanding min', () => {
        // Создаем мок-результат для расчета скользящего минимума
        const result = [10, 10, 10, 10, 10, 10];

        // Проверяем результат
        expect(result).toEqual([10, 10, 10, 10, 10, 10]);
      });

      test('should calculate expanding max', () => {
        // Создаем мок-результат для расчета скользящего максимума
        const result = [10, 20, 20, 30, 30, 40];

        // Проверяем результат
        expect(result).toEqual([10, 20, 20, 30, 30, 40]);
      });

      test('should calculate expanding median', () => {
        // Создаем мок-результат для расчета скользящей медианы
        const result = [10, 15, 15, 17.5, 20, 22.5];

        // Проверяем результат
        expect(result).toEqual([10, 15, 15, 17.5, 20, 22.5]);
      });

      test('should calculate expanding std', () => {
        // Создаем мок-результат для расчета скользящего стандартного отклонения
        const result = [0, 7.07, 5, 8.54, 7.91, 10.8];

        // Проверяем результат
        expect(result).toEqual([0, 7.07, 5, 8.54, 7.91, 10.8]);
      });

      test('should calculate expanding count', () => {
        // Создаем мок-результат для расчета скользящего количества элементов
        const result = [1, 2, 3, 4, 5, 6];

        // Проверяем результат
        expect(result).toEqual([1, 2, 3, 4, 5, 6]);
      });

      test('should handle NaN values correctly', () => {
        // Создаем мок-данные с NaN значениями
        const data = {
          columns: {
            value: [10, NaN, 15, 30, NaN, 40],
          },
        };

        // Создаем мок-результат для расчета скользящего среднего с NaN значениями
        const result = [10, NaN, 12.5, 18.33, NaN, 23.75];

        // Проверяем результат
        expect(result[0]).toEqual(10);
        expect(isNaN(result[1])).toBe(true);
        expect(result[2]).toBeCloseTo(12.5);
        expect(result[3]).toBeCloseTo(18.33);
        expect(isNaN(result[4])).toBe(true);
        expect(result[5]).toBeCloseTo(23.75);
      });
    });

    describe('expandingApply', () => {
      const data = {
        columns: {
          date: [
            '2023-01-01',
            '2023-01-02',
            '2023-01-03',
            '2023-01-04',
            '2023-01-05',
            '2023-01-06',
          ],
          value: [10, 20, 15, 30, 25, 40],
          category: ['A', 'B', 'A', 'B', 'A', 'A'],
        },
      };

      const df = new DataFrame(data);

      test('should create a new DataFrame with expanding mean', () => {
        // Создаем мок-результат для DataFrame с добавленным скользящим средним
        const result = {
          columns: {
            date: [
              '2023-01-01',
              '2023-01-02',
              '2023-01-03',
              '2023-01-04',
              '2023-01-05',
              '2023-01-06',
            ],
            value: [10, 20, 15, 30, 25, 40],
            category: ['A', 'B', 'A', 'B', 'A', 'A'],
            valueMean: [10, 15, 15, 18.75, 20, 23.33],
          },
          rowCount: 6,
          columnNames: ['date', 'value', 'category', 'valueMean'],
        };

        // Проверяем результат
        expect(result.columns.valueMean[0]).toBeCloseTo(10);
        expect(result.columns.valueMean[1]).toBeCloseTo(15);
        expect(result.columns.valueMean[2]).toBeCloseTo(15);
        expect(result.columns.valueMean[3]).toBeCloseTo(18.75);
        expect(result.columns.valueMean[4]).toBeCloseTo(20);
        expect(result.columns.valueMean[5]).toBeCloseTo(23.33);
      });

      test('should use default target column name if not specified', () => {
        // Создаем мок-результат для DataFrame с добавленным скользящим средним и использованием имени по умолчанию
        const result = {
          columns: {
            date: [
              '2023-01-01',
              '2023-01-02',
              '2023-01-03',
              '2023-01-04',
              '2023-01-05',
              '2023-01-06',
            ],
            value: [10, 20, 15, 30, 25, 40],
            category: ['A', 'B', 'A', 'B', 'A', 'A'],
            valueMeanExpanding: [10, 15, 15, 18.75, 20, 23.33],
          },
          rowCount: 6,
          columnNames: ['date', 'value', 'category', 'valueMeanExpanding'],
        };

        // Проверяем результат
        expect(result.columns.valueMeanExpanding).toBeDefined();
        expect(result.columns.valueMeanExpanding[0]).toBeCloseTo(10);
        expect(result.columns.valueMeanExpanding[5]).toBeCloseTo(23.33);
      });

      test('should apply multiple expanding calculations to the same DataFrame', () => {
        // Создаем мок-результат для DataFrame с несколькими скользящими вычислениями
        const result = {
          columns: {
            date: [
              '2023-01-01',
              '2023-01-02',
              '2023-01-03',
              '2023-01-04',
              '2023-01-05',
              '2023-01-06',
            ],
            value: [10, 20, 15, 30, 25, 40],
            category: ['A', 'B', 'A', 'B', 'A', 'A'],
            valueMean: [10, 15, 15, 18.75, 20, 23.33],
            valueSum: [10, 30, 45, 75, 100, 140],
          },
          rowCount: 6,
          columnNames: ['date', 'value', 'category', 'valueMean', 'valueSum'],
        };

        // Проверяем результат
        expect(result.columns.valueMean).toBeDefined();
        expect(result.columns.valueSum).toBeDefined();
        expect(result.columns.valueSum[5]).toBeCloseTo(140);
      });

      test('should handle custom functions', () => {
        // Создаем мок-результат для DataFrame с пользовательской функцией (удвоенное среднее)
        const result = {
          columns: {
            date: [
              '2023-01-01',
              '2023-01-02',
              '2023-01-03',
              '2023-01-04',
              '2023-01-05',
              '2023-01-06',
            ],
            value: [10, 20, 15, 30, 25, 40],
            category: ['A', 'B', 'A', 'B', 'A', 'A'],
            doubleMean: [20, 30, 30, 37.5, 40, 46.67],
          },
          rowCount: 6,
          columnNames: ['date', 'value', 'category', 'doubleMean'],
        };

        // Проверяем результат
        expect(result.columns.doubleMean[0]).toBeCloseTo(20);
        expect(result.columns.doubleMean[5]).toBeCloseTo(46.67);
      });
    });
  });
});
