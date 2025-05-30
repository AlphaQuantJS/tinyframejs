/**
 * Unit tests for expr$ method
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

describe('Expr$ Method', () => {
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

      test('should filter rows based on numeric comparison', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.expr$`age > 25`;

        expect(result.rowCount).toBe(4);
        expect(result.toArray()).toEqual([
          { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
          { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
          { name: 'David', age: 40, city: 'Boston', salary: 95000 },
          { name: 'Eve', age: 45, city: 'Seattle', salary: 100000 },
        ]);
      });

      test('should filter rows based on string equality', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.expr$`name == "Alice"`;

        expect(result.rowCount).toBe(1);
        expect(result.toArray()).toEqual([
          { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
        ]);
      });

      test('should filter rows based on string includes method', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.expr$`city_includes("Francisco")`;

        expect(result.rowCount).toBe(1);
        expect(result.toArray()).toEqual([
          { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
        ]);
      });

      test('should support complex expressions with multiple conditions', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.expr$`age > 25 && salary < 90000`;

        expect(result.rowCount).toBe(1);
        expect(result.toArray()).toEqual([
          { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
        ]);
      });

      test('should support template literal interpolation', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const minAge = 30;
        const result = df.expr$`age >= ${minAge}`;

        expect(result.rowCount).toBe(4);
        expect(result.toArray()).toEqual([
          { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
          { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
          { name: 'David', age: 40, city: 'Boston', salary: 95000 },
          { name: 'Eve', age: 45, city: 'Seattle', salary: 100000 },
        ]);
      });

      test('should return empty DataFrame when no rows match', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.expr$`age > 100`;

        expect(result.rowCount).toBe(0);
        expect(result.toArray()).toEqual([]);
      });

      test('should throw error for invalid expression', () => {
        // df создан выше с помощью createDataFrameWithStorage
        expect(() => df.expr$`invalid syntax here`).toThrow();
      });

      test('should preserve data integrity with typed arrays', () => {
        // Используем DataFrame с типизированными массивами, созданный выше
        const result = typedDf.expr$`age > 25`;

        // Проверяем, что данные сохранены правильно
        expect(result.toArray()).toEqual([
          { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
          { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
          { name: 'David', age: 40, city: 'Boston', salary: 95000 },
          { name: 'Eve', age: 45, city: 'Seattle', salary: 100000 },
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
