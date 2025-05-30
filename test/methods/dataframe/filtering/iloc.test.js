/**
 * Unit tests for iloc method
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';

import {
  testWithBothStorageTypes,
  createDataFrameWithStorage,
} from '../../../utils/storageTestUtils.js';

// Тестовые данные для использования во всех тестах
const testData = {
  name: ['Alice', 'Bob', 'Charlie', 'David', 'Eve'],
  age: [25, 30, 35, 40, 45],
  city: ['New York', 'San Francisco', 'Chicago', 'Boston', 'Seattle'],
  salary: [70000, 85000, 90000, 95000, 100000],
};

describe('ILoc Method', () => {
  // Запускаем тесты с обоими типами хранилища
  testWithBothStorageTypes((storageType) => {
    describe(`with ${storageType} storage`, () => {
      // Создаем DataFrame с указанным типом хранилища
      const df = createDataFrameWithStorage(DataFrame, testData, storageType);

      // Создаем DataFrame с типизированными массивами для тестирования сохранения типов
      const typedData = {
        name: ['Alice', 'Bob', 'Charlie', 'David', 'Eve'],
        age: new Int32Array([25, 30, 35, 40, 45]),
        city: ['New York', 'San Francisco', 'Chicago', 'Boston', 'Seattle'],
        salary: new Float64Array([70000, 85000, 90000, 95000, 100000]),
      };
      const typedDf = createDataFrameWithStorage(
        DataFrame,
        typedData,
        storageType,
      );

      test('should select rows and columns by integer positions', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.iloc([1, 3], [0, 2]);

        // Check that the result has the correct rows and columns
        expect(result.rowCount).toBe(2);
        expect(result.columns).toEqual(['name', 'city']);
        expect(result.toArray()).toEqual([
          { name: 'Bob', city: 'San Francisco' },
          { name: 'David', city: 'Boston' },
        ]);
      });

      test('should select a single row and multiple columns', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.iloc(2, [0, 1, 2]);

        // Check that the result has the correct row and columns
        expect(result.rowCount).toBe(1);
        expect(result.columns).toEqual(['name', 'age', 'city']);
        expect(result.toArray()).toEqual([
          { name: 'Charlie', age: 35, city: 'Chicago' },
        ]);
      });

      test('should select multiple rows and a single column', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.iloc([0, 2, 4], 1);

        // Check that the result has the correct rows and column
        expect(result.rowCount).toBe(3);
        expect(result.columns).toEqual(['age']);
        expect(result.toArray()).toEqual([
          { age: 25 },
          { age: 35 },
          { age: 45 },
        ]);
      });

      test('should return a scalar value for a single row and a single column', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.iloc(1, 3);

        // Проверяем, что результат - это скалярное значение
        expect(result).toBe(85000);
      });

      test('should throw error for row index out of bounds', () => {
        // df создан выше с помощью createDataFrameWithStorage
        expect(() => df.iloc(5, [0, 1])).toThrow();
      });

      test('should throw error for column index out of bounds', () => {
        // df создан выше с помощью createDataFrameWithStorage
        expect(() => df.iloc([0, 1], 4)).toThrow();
      });

      test('should support negative row indices for indexing from the end', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.iloc(-1, [0, 1]);

        // Проверяем, что выбрана последняя строка
        expect(result.rowCount).toBe(1);
        expect(result.columns).toEqual(['name', 'age']);
        expect(result.toArray()).toEqual([{ name: 'Eve', age: 45 }]);
      });

      test('should support negative column indices for indexing from the end', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.iloc([0, 1], -1);

        // Проверяем, что выбрана последняя колонка
        expect(result.rowCount).toBe(2);
        expect(result.columns).toEqual(['salary']);
        expect(result.toArray()).toEqual([
          { salary: 70000 },
          { salary: 85000 },
        ]);
      });

      test('should return a new DataFrame instance', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.iloc([0, 1], [0, 1]);
        expect(result).toBeInstanceOf(DataFrame);
        expect(result).not.toBe(df); // Should be a new instance
      });

      test('should preserve data integrity with typed arrays', () => {
        // Используем DataFrame с типизированными массивами, созданный выше
        const result = typedDf.iloc([1, 3], [1, 3]);

        // Проверяем, что данные сохранены правильно
        expect(result.toArray()).toEqual([
          { age: 30, salary: 85000 },
          { age: 40, salary: 95000 },
        ]);

        // Проверяем, что данные доступны через API для работы с типизированными массивами
        expect(result.getVector('age')).toBeDefined();
        expect(result.getVector('salary')).toBeDefined();

        // Проверяем, что данные сохраняют числовой тип
        expect(typeof result.col('age').get(0)).toBe('number');
        expect(typeof result.col('salary').get(0)).toBe('number');
      });
    });
  });
});
