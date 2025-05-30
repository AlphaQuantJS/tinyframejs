/**
 * Unit tests for loc method
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

describe('Loc Method', () => {
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

      test('should select rows and columns by labels', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.loc([1, 3], ['name', 'city']);

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
        const result = df.loc(2, ['name', 'age', 'city']);

        // Check that the result has the correct row and columns
        expect(result.rowCount).toBe(1);
        expect(result.columns).toEqual(['name', 'age', 'city']);
        expect(result.toArray()).toEqual([
          { name: 'Charlie', age: 35, city: 'Chicago' },
        ]);
      });

      test('should select multiple rows and a single column', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.loc([0, 2, 4], 'age');

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
        const result = df.loc(1, 'salary');

        // Проверяем, что результат - это скалярное значение
        expect(result).toBe(85000);
      });

      test('should throw error for row index out of bounds', () => {
        // df создан выше с помощью createDataFrameWithStorage
        expect(() => df.loc(5, ['name', 'age'])).toThrow();
      });

      test('should throw error for non-existent column', () => {
        // df создан выше с помощью createDataFrameWithStorage
        expect(() => df.loc([0, 1], ['name', 'nonexistent'])).toThrow();
      });

      test('should throw error for negative row index', () => {
        // df создан выше с помощью createDataFrameWithStorage
        expect(() => df.loc(-1, ['name', 'age'])).toThrow();
      });

      test('should return a new DataFrame instance', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.loc([0, 1], ['name', 'age']);
        expect(result).toBeInstanceOf(DataFrame);
        expect(result).not.toBe(df); // Should be a new instance
      });

      test('should preserve typed arrays', () => {
        // Используем DataFrame с типизированными массивами, созданный выше
        const result = typedDf.loc([1, 3], ['age', 'salary']);

        // Проверяем, что данные сохранены правильно
        expect(result.toArray()).toEqual([
          { age: 30, salary: 85000 },
          { age: 40, salary: 95000 },
        ]);
      });
    });
  });
});
