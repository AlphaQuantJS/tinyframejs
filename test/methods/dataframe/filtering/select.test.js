/**
 * Unit tests for select method
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';

import {
  testWithBothStorageTypes,
  createDataFrameWithStorage,
} from '../../../utils/storageTestUtils.js';

// Тестовые данные для использования во всех тестах
const testData = {
  name: ['Alice', 'Bob', 'Charlie'],
  age: [25, 30, 35],
  city: ['New York', 'San Francisco', 'Chicago'],
  salary: [70000, 85000, 90000],
};

describe('Select Method', () => {
  // Запускаем тесты с обоими типами хранилища
  testWithBothStorageTypes((storageType) => {
    describe(`with ${storageType} storage`, () => {
      // Создаем DataFrame с указанным типом хранилища
      const df = createDataFrameWithStorage(DataFrame, testData, storageType);

      // Создаем DataFrame с типизированными массивами для тестирования сохранения типов
      const typedData = {
        name: ['Alice', 'Bob', 'Charlie'],
        age: new Int32Array([25, 30, 35]),
        salary: new Float64Array([70000, 85000, 90000]),
      };
      const typedDf = createDataFrameWithStorage(
        DataFrame,
        typedData,
        storageType,
      );

      test('should select specific columns', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.select(['name', 'age']);

        // Check that only the selected columns exist
        expect(result.columns).toEqual(['name', 'age']);
        expect(result.columns).not.toContain('city');
        expect(result.columns).not.toContain('salary');

        // Check that the data is correct
        expect(result.toArray()).toEqual([
          { name: 'Alice', age: 25 },
          { name: 'Bob', age: 30 },
          { name: 'Charlie', age: 35 },
        ]);
      });

      test('should throw error for non-existent columns', () => {
        // df создан выше с помощью createDataFrameWithStorage
        expect(() => df.select(['name', 'nonexistent'])).toThrow();
      });

      test('should handle string input as single column', () => {
        // df создан выше с помощью createDataFrameWithStorage
        // Проверяем, что строка обрабатывается как массив из одного элемента
        const result = df.select('name');
        expect(result.columns).toEqual(['name']);
        expect(result.rowCount).toBe(df.rowCount);
      });

      test('should handle empty array input', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.select([]);
        expect(result.columns).toEqual([]);
        expect(result.rowCount).toBe(0);
      });

      test('should return a new DataFrame instance', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.select(['name', 'age']);
        expect(result).toBeInstanceOf(DataFrame);
        expect(result).not.toBe(df); // Should be a new instance
      });
    });
  });
});
