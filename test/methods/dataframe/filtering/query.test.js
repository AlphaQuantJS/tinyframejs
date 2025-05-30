/**
 * Unit tests for query method
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

describe('Query Method', () => {
  // Запускаем тесты с обоими типами хранилища
  testWithBothStorageTypes((storageType) => {
    describe(`with ${storageType} storage`, () => {
      // Создаем DataFrame с указанным типом хранилища
      const df = createDataFrameWithStorage(DataFrame, testData, storageType);

      // Создаем DataFrame с типизированными массивами для тестирования сохранения типов
      const typedData = {
        name: ['Alice', 'Bob', 'Charlie'],
        age: new Int32Array([25, 30, 35]),
        city: ['New York', 'San Francisco', 'Chicago'],
        salary: new Float64Array([70000, 85000, 90000]),
      };
      const typedDf = createDataFrameWithStorage(
        DataFrame,
        typedData,
        storageType,
      );

      test('should filter rows using a simple query', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.query('age > 25');

        // Check that the filtered data is correct
        expect(result.rowCount).toBe(2);
        expect(result.toArray()).toEqual([
          { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
          { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
        ]);
      });

      test('should handle string equality', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.query("city == 'New York'");

        // Check that the filtered data is correct
        expect(result.rowCount).toBe(1);
        expect(result.toArray()).toEqual([
          { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
        ]);
      });

      test('should handle complex queries with AND/OR operators', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.query('age > 25 && salary >= 90000');

        // Check that the filtered data is correct
        expect(result.rowCount).toBe(1);
        expect(result.toArray()).toEqual([
          { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
        ]);

        const result2 = df.query('age < 30 || salary >= 90000');
        expect(result2.rowCount).toBe(2);
        expect(result2.toArray()).toEqual([
          { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
          { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
        ]);
      });

      test('should handle string methods in queries', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.query("city.includes('San')");

        // Check that the filtered data is correct
        expect(result.rowCount).toBe(1);
        expect(result.toArray()).toEqual([
          { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
        ]);
      });

      test('should return empty DataFrame when no rows match', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.query('age > 100');

        // Should have all columns but no rows
        expect(result.columns.sort()).toEqual(
          ['age', 'city', 'name', 'salary'].sort(),
        );
        expect(result.rowCount).toBe(0);
      });

      test('should throw error for invalid query syntax', () => {
        // df создан выше с помощью createDataFrameWithStorage
        expect(() => df.query('age >')).toThrow();
      });

      test('should throw error for non-string query', () => {
        // df создан выше с помощью createDataFrameWithStorage
        expect(() => df.query(123)).toThrow();
      });

      test('should return a new DataFrame instance', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.query('age > 25');
        expect(result).toBeInstanceOf(DataFrame);
        expect(result).not.toBe(df); // Should be a new instance
      });

      test('should preserve typed arrays', () => {
        // Используем DataFrame с типизированными массивами, созданный выше
        const result = typedDf.query('age > 25');

        // Проверяем, что результат сохраняет типизированные массивы
        // Проверяем, что данные сохранены правильно
        expect(result.toArray()).toEqual([
          { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
          { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
        ]);
      });
    });
  });
});
