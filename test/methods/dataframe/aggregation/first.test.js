/**
 * Unit tests for the first method
 *
 * These tests verify the functionality of the first method, which returns
 * the first value in a specified DataFrame column.
 *
 * @module test/methods/aggregation/first.test
 */

import {
  first,
  register,
} from '../../../../src/methods/dataframe/aggregation/first.js';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  testWithBothStorageTypes,
  createDataFrameWithStorage,
} from '../../../utils/storageTestUtils.js';

// Регистрируем метод first в DataFrame для тестов
register(DataFrame);

// Тестовые данные для использования во всех тестах
const testData = [
  { value: 10, category: 'A', mixed: '20' },
  { value: 20, category: 'B', mixed: 30 },
  { value: 30, category: 'A', mixed: null },
  { value: 40, category: 'C', mixed: undefined },
  { value: 50, category: 'B', mixed: NaN },
];

describe('first method', () => {
  // Запускаем тесты с обоими типами хранилища
  testWithBothStorageTypes((storageType) => {
    describe(`with ${storageType} storage`, () => {
      // Создаем DataFrame с указанным типом хранилища
      const df = createDataFrameWithStorage(DataFrame, testData, storageType);

      // Тестирование функции first напрямую
      it('should return the first value in a column', () => {
        // Создаем функцию first с мок-валидатором
        const validateColumn = vi.fn();
        const firstFn = first({ validateColumn });

        // Вызываем функцию first
        const result = firstFn(df, 'value');

        // Проверяем результат
        expect(result).toBe(10);
        expect(validateColumn).toHaveBeenCalledWith(df, 'value');
      });

      it('should handle special values (null, undefined, NaN)', () => {
        // Создаем функцию first с мок-валидатором
        const validateColumn = vi.fn();
        const firstFn = first({ validateColumn });

        // Проверяем, что первые значения возвращаются правильно
        expect(firstFn(df, 'mixed')).toBe('20');
        expect(validateColumn).toHaveBeenCalledWith(df, 'mixed');
      });

      it('should return undefined for empty DataFrame', () => {
        // Создаем пустой DataFrame
        const emptyDf = createDataFrameWithStorage(DataFrame, [], storageType);

        // Создаем функцию first с мок-валидатором
        const validateColumn = vi.fn();
        const firstFn = first({ validateColumn });

        // Вызываем функцию first
        const result = firstFn(emptyDf, 'value');

        // Проверяем результат
        expect(result).toBeUndefined();
        // Для пустого DataFrame валидатор не вызывается, так как мы сразу возвращаем undefined
      });

      it('should throw error for non-existent column', () => {
        // Создаем валидатор, который выбрасывает ошибку
        const validateColumn = (df, column) => {
          if (!df.columns.includes(column)) {
            throw new Error(`Column '${column}' not found`);
          }
        };

        // Создаем функцию first с валидатором
        const firstFn = first({ validateColumn });

        // Проверяем, что функция выбрасывает ошибку для несуществующей колонки
        expect(() => firstFn(df, 'nonexistent')).toThrow(
          'Column \'nonexistent\' not found',
        );
      });

      // Тестирование метода DataFrame.first
      it('should be available as a DataFrame method', () => {
        // Проверяем, что метод first доступен в DataFrame
        expect(typeof df.first).toBe('function');

        // Вызываем метод first и проверяем результат
        expect(df.first('value')).toBe(10);
        expect(df.first('category')).toBe('A');
      });
      it('should handle empty DataFrame gracefully', () => {
        // Создаем пустой DataFrame
        const emptyDf = createDataFrameWithStorage(DataFrame, [], storageType);

        // Проверяем, что метод first возвращает undefined для пустого DataFrame
        expect(emptyDf.first('value')).toBeUndefined();
      });

      it('should throw error for non-existent column', () => {
        // Проверяем, что метод first выбрасывает ошибку для несуществующей колонки
        expect(() => df.first('nonexistent')).toThrow(
          'Column \'nonexistent\' not found',
        );
      });
    });
  });
});
