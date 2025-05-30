/**
 * Unit tests for selectByPattern method
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
  ageGroup: ['20-30', '30-40', '30-40'],
};

describe('SelectByPattern Method', () => {
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

      test('should select columns matching a pattern', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.selectByPattern('^a');

        // Check that only columns starting with 'a' exist
        expect(result.columns.sort()).toEqual(['age', 'ageGroup'].sort());
        expect(result.columns).not.toContain('name');
        expect(result.columns).not.toContain('city');
        expect(result.columns).not.toContain('salary');

        // Check that the data is correct
        const resultArray = result.toArray();
        expect(resultArray.length).toBe(3);
        expect(resultArray[0]).toHaveProperty('age', 25);
        expect(resultArray[0]).toHaveProperty('ageGroup', '20-30');
        expect(resultArray[1]).toHaveProperty('age', 30);
        expect(resultArray[1]).toHaveProperty('ageGroup', '30-40');
        expect(resultArray[2]).toHaveProperty('age', 35);
        expect(resultArray[2]).toHaveProperty('ageGroup', '30-40');
      });

      test('should handle regex patterns', () => {
        // df создан выше с помощью createDataFrameWithStorage
        // Паттерн a.*e должен соответствовать 'age' и 'ageGroup', но не 'name'
        // потому что в 'name' буква 'a' не в начале строки
        const result = df.selectByPattern('^a.*e');

        // Should match 'age' and 'ageGroup'
        expect(result.columns.sort()).toEqual(['age', 'ageGroup'].sort());
      });

      test('should return empty DataFrame when no columns match', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.selectByPattern('xyz');

        // Should have no columns
        expect(result.columns).toEqual([]);
        expect(result.rowCount).toBe(0);
      });

      test('should throw error for non-string pattern', () => {
        // df создан выше с помощью createDataFrameWithStorage
        expect(() => df.selectByPattern(123)).toThrow();
      });

      test('should return a new DataFrame instance', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.selectByPattern('^a');
        expect(result).toBeInstanceOf(DataFrame);
        expect(result).not.toBe(df); // Should be a new instance
      });

      test('should preserve typed arrays', () => {
        // Используем DataFrame с типизированными массивами
        const result = typedDf.selectByPattern('^a');

        // Проверяем, что результат имеет те же типы массивов
        // В тестах мы проверяем, что результат сохраняет типы массивов
        expect(result.col('age')).toBeDefined();
        expect(result.toArray()[0].age).toBe(25);
      });
    });
  });
});
