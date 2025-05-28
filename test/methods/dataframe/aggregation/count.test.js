/**
 * Unit tests for the count method
 *
 * These tests verify the functionality of the count method, which counts
 * the number of values in a specified DataFrame column.
 *
 * @module test/methods/aggregation/count.test
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import { Series } from '../../../../src/core/dataframe/Series.js';
import { count } from '../../../../src/methods/dataframe/aggregation/count.js';

import {
  testWithBothStorageTypes,
  createDataFrameWithStorage,
} from '../../../utils/storageTestUtils.js';
/**
 * Tests for the DataFrame count function
 */

// Тестовые данные для использования во всех тестах
const testData = [
  { value: 10, category: 'A', mixed: '20' },
  { value: 20, category: 'B', mixed: 30 },
  { value: 30, category: 'A', mixed: null },
  { value: 40, category: 'C', mixed: undefined },
  { value: 50, category: 'B', mixed: NaN },
];

describe('DataFrame count function', () => {
  // Тестируем функцию count напрямую
  test('should count all values in a column', () => {
    // Создаем мок для validateColumn
    const validateColumn = vi.fn();

    // Создаем серию с данными
    const series = new Series([1, 2, 3, 4, 5]);

    // Создаем фрейм с правильной структурой
    const df = {
      columns: ['testColumn'],
      col: () => series,
    };

    // Создаем функцию count с моком validateColumn
    const countFn = count({ validateColumn });

    // Вызываем функцию count
    const result = countFn(df, 'testColumn');

    // Проверяем результат
    expect(validateColumn).toHaveBeenCalledWith(df, 'testColumn');
    expect(result).toBe(5);
  });

  test('should ignore null, undefined, and NaN values', () => {
    // Создаем мок для validateColumn
    const validateColumn = vi.fn();

    // Создаем серию с данными, включая null, undefined и NaN
    const series = new Series([1, null, 3, undefined, 5, NaN]);

    // Создаем фрейм с правильной структурой
    const df = {
      columns: ['testColumn'],
      col: () => series,
    };

    // Создаем функцию count с моком validateColumn
    const countFn = count({ validateColumn });

    // Вызываем функцию count
    const result = countFn(df, 'testColumn');

    // Проверяем результат
    expect(validateColumn).toHaveBeenCalledWith(df, 'testColumn');
    expect(result).toBe(3); // Только 1, 3 и 5 являются валидными значениями
  });

  test('should return 0 for an empty column', () => {
    // Создаем мок для validateColumn
    const validateColumn = vi.fn();

    // Создаем пустую серию
    const series = new Series([]);

    // Создаем фрейм с правильной структурой
    const df = {
      columns: ['testColumn'],
      col: () => series,
    };

    // Создаем функцию count с моком validateColumn
    const countFn = count({ validateColumn });

    // Вызываем функцию count
    const result = countFn(df, 'testColumn');

    // Проверяем результат
    expect(validateColumn).toHaveBeenCalledWith(df, 'testColumn');
    expect(result).toBe(0);
  });

  test('should throw an error for non-existent column', () => {
    // Создаем валидатор, который выбрасывает ошибку для несуществующей колонки
    const validateColumn = (df, column) => {
      if (!df.columns.includes(column)) {
        throw new Error(`Column '${column}' not found`);
      }
    };

    // Создаем фрейм с колонками a, b, c
    const df = {
      columns: ['a', 'b', 'c'],
    };

    // Создаем функцию count с нашим валидатором
    const countFn = count({ validateColumn });

    // Проверяем, что функция выбрасывает ошибку для несуществующей колонки
    expect(() => countFn(df, 'z')).toThrow('Column \'z\' not found');
  });
});

// Тесты с использованием реальных DataFrame
describe('DataFrame count with real DataFrames', () => {
  // Запускаем тесты с обоими типами хранилища
  testWithBothStorageTypes((storageType) => {
    describe(`with ${storageType} storage`, () => {
      // Создаем DataFrame с указанным типом хранилища
      const df = createDataFrameWithStorage(DataFrame, testData, storageType);

      test('should count all non-null, non-undefined, non-NaN values in a column', () => {
        // Создаем валидатор, который ничего не делает
        const validateColumn = () => {};
        const countFn = count({ validateColumn });

        // Вызываем функцию count напрямую
        // В колонке value все 5 значений валидны
        expect(countFn(df, 'value')).toBe(5);
        // В колонке category все 5 значений валидны
        expect(countFn(df, 'category')).toBe(5);
        // В колонке mixed только 2 валидных значения ('20' и 30), остальные - null, undefined и NaN
        expect(countFn(df, 'mixed')).toBe(2);
      });

      test('should handle mixed data types and ignore null, undefined, and NaN', () => {
        // Создаем валидатор, который ничего не делает
        const validateColumn = () => {};
        const countFn = count({ validateColumn });

        // В колонке mixed есть строка '20', число 30, null, undefined и NaN
        // Функция count должна считать только валидные значения ('20' и 30)
        expect(countFn(df, 'mixed')).toBe(2);
      });

      test('throws on corrupted frame', () => {
        // Create a minimally valid frame but without required structure
        const broken = {};
        const validateColumn = () => {};
        const countFn = count({ validateColumn });

        expect(() => countFn(broken, 'a')).toThrow();
      });
    });
  });
});
