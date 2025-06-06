/**
 * Unit tests for where method
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

describe('Where Method', () => {
  // Запускаем тесты с обоими типами хранилища
  testWithBothStorageTypes((storageType) => {
    describe(`with ${storageType} storage`, () => {
      // Создаем DataFrame с указанным типом хранилища
      const df = createDataFrameWithStorage(DataFrame, testData, storageType);

      test('should filter rows using column condition with > operator', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.where('age', '>', 25);

        // Check that the filtered data is correct
        expect(result.rowCount).toBe(2);
        expect(result.toArray()).toEqual([
          { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
          { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
        ]);
      });

      test('should filter rows using column condition with == operator', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.where('city', '==', 'Chicago');

        // Check that the filtered data is correct
        expect(result.rowCount).toBe(1);
        expect(result.toArray()).toEqual([
          { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
        ]);
      });

      test('should filter rows using column condition with != operator', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.where('city', '!=', 'Chicago');

        // Check that the filtered data is correct
        expect(result.rowCount).toBe(2);
        expect(result.toArray()).toEqual([
          { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
          { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
        ]);
      });

      test('should filter rows using column condition with >= operator', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.where('salary', '>=', 85000);

        // Check that the filtered data is correct
        expect(result.rowCount).toBe(2);
        expect(result.toArray()).toEqual([
          { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
          { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
        ]);
      });

      test('should filter rows using column condition with <= operator', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.where('salary', '<=', 85000);

        // Check that the filtered data is correct
        expect(result.rowCount).toBe(2);
        expect(result.toArray()).toEqual([
          { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
          { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
        ]);
      });

      test('should filter rows using column condition with in operator', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.where('city', 'in', ['New York', 'Chicago']);

        // Check that the filtered data is correct
        expect(result.rowCount).toBe(2);
        expect(result.toArray()).toEqual([
          { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
          { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
        ]);
      });

      test('should filter rows using column condition with contains operator', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.where('city', 'contains', 'San');

        // Check that the filtered data is correct
        expect(result.rowCount).toBe(1);
        expect(result.toArray()).toEqual([
          { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
        ]);
      });

      test('should filter rows using column condition with startsWith operator (camelCase)', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.where('city', 'startsWith', 'San');

        // Check that the filtered data is correct
        expect(result.rowCount).toBe(1);
        expect(result.toArray()).toEqual([
          { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
        ]);
      });

      test('should filter rows using column condition with startswith operator (lowercase)', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.where('city', 'startswith', 'San');

        // Check that the filtered data is correct
        expect(result.rowCount).toBe(1);
        expect(result.toArray()).toEqual([
          { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
        ]);
      });

      test('should filter rows using column condition with endsWith operator (camelCase)', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.where('city', 'endsWith', 'York');

        // Check that the filtered data is correct
        expect(result.rowCount).toBe(1);
        expect(result.toArray()).toEqual([
          { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
        ]);
      });

      test('should filter rows using column condition with endswith operator (lowercase)', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.where('city', 'endswith', 'York');

        // Check that the filtered data is correct
        expect(result.rowCount).toBe(1);
        expect(result.toArray()).toEqual([
          { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
        ]);
      });

      test('should filter rows using column condition with matches operator', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.where('city', 'matches', '^San');

        // Check that the filtered data is correct
        expect(result.rowCount).toBe(1);
        expect(result.toArray()).toEqual([
          { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
        ]);
      });

      test('should return empty DataFrame when no rows match', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.where('age', '>', 100);

        // Should have all columns but no rows
        expect(result.columns.sort()).toEqual(
          ['age', 'city', 'name', 'salary'].sort(),
        );
        expect(result.rowCount).toBe(0);
      });

      test('should throw error for non-existent column', () => {
        // df создан выше с помощью createDataFrameWithStorage
        expect(() => df.where('nonexistent', '>', 25)).toThrow();
      });

      test('should throw error for unsupported operator', () => {
        // df создан выше с помощью createDataFrameWithStorage
        expect(() => df.where('age', 'invalid', 25)).toThrow();
      });

      test('should return a new DataFrame instance', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.where('age', '>', 25);
        expect(result).toBeInstanceOf(DataFrame);
        expect(result).not.toBe(df); // Should be a new instance
      });

      test('should preserve typed arrays', () => {
        // Create DataFrame with typed arrays
        const typedData = {
          name: ['Alice', 'Bob', 'Charlie'],
          age: new Int32Array([25, 30, 35]),
          salary: new Float64Array([70000, 85000, 90000]),
        };

        // Создаем новый DataFrame с типизированными массивами
        const typedDf = createDataFrameWithStorage(
          DataFrame,
          typedData,
          storageType,
        );

        // Фильтруем данные
        const result = typedDf.where('age', '>', 25);

        // Check that the result has the same array types
        expect(result._columns.age.vector.__data).toBeInstanceOf(Int32Array);
        expect(result._columns.salary.vector.__data).toBeInstanceOf(
          Float64Array,
        );
      });
    });
  });
});
