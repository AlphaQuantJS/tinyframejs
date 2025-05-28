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
const testData = [
  { value: 10, category: 'A', mixed: '20' },
  { value: 20, category: 'B', mixed: 30 },
  { value: 30, category: 'A', mixed: null },
  { value: 40, category: 'C', mixed: undefined },
  { value: 50, category: 'B', mixed: NaN },
];

describe('ILoc Method', () => {
  // Запускаем тесты с обоими типами хранилища
  testWithBothStorageTypes((storageType) => {
    describe(`with ${storageType} storage`, () => {
      // Создаем DataFrame с указанным типом хранилища
      const df = createDataFrameWithStorage(DataFrame, testData, storageType);

      // Sample data for testing
      const data = {
        name: ['Alice', 'Bob', 'Charlie', 'David', 'Eve'],
        age: [25, 30, 35, 40, 45],
        city: ['New York', 'San Francisco', 'Chicago', 'Boston', 'Seattle'],
        salary: [70000, 85000, 90000, 95000, 100000],
      };

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

      test('should select a single row and a single column', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.iloc(1, 3);

        // Check that the result has the correct row and column
        expect(result.rowCount).toBe(1);
        expect(result.columns).toEqual(['salary']);
        expect(result.toArray()).toEqual([{ salary: 85000 }]);
      });

      test('should throw error for row index out of bounds', () => {
        // df создан выше с помощью createDataFrameWithStorage
        expect(() => df.iloc(5, [0, 1])).toThrow();
      });

      test('should throw error for column index out of bounds', () => {
        // df создан выше с помощью createDataFrameWithStorage
        expect(() => df.iloc([0, 1], 4)).toThrow();
      });

      test('should throw error for negative row index', () => {
        // df создан выше с помощью createDataFrameWithStorage
        expect(() => df.iloc(-1, [0, 1])).toThrow();
      });

      test('should throw error for negative column index', () => {
        // df создан выше с помощью createDataFrameWithStorage
        expect(() => df.iloc([0, 1], -1)).toThrow();
      });

      test('should return a new DataFrame instance', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.iloc([0, 1], [0, 1]);
        expect(result).toBeInstanceOf(DataFrame);
        expect(result).not.toBe(df); // Should be a new instance
      });

      test('should preserve typed arrays', () => {
        // Create DataFrame with typed arrays
        const typedData = {
          name: ['Alice', 'Bob', 'Charlie', 'David', 'Eve'],
          age: new Int32Array([25, 30, 35, 40, 45]),
          salary: new Float64Array([70000, 85000, 90000, 95000, 100000]),
        };

        // df создан выше с помощью createDataFrameWithStorage
        const result = df.iloc([1, 3], [1, 2]);

        // Check that the result has the same array types
        expect(result.frame.columns.age).toBeInstanceOf(Int32Array);
        expect(result.frame.columns.salary).toBeInstanceOf(Float64Array);
      });
    });
  });
});
