/**
 * Unit tests for filter method
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

describe('Filter Method', () => {
  // Запускаем тесты с обоими типами хранилища
  testWithBothStorageTypes((storageType) => {
    describe(`with ${storageType} storage`, () => {
      // Создаем DataFrame с указанным типом хранилища
      const df = createDataFrameWithStorage(DataFrame, testData, storageType);

      // Sample data for testing
      const data = {
        name: ['Alice', 'Bob', 'Charlie'],
        age: [25, 30, 35],
        city: ['New York', 'San Francisco', 'Chicago'],
        salary: [70000, 85000, 90000],
      };

      test('should filter rows based on a condition', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.filter((row) => row.age > 25);

        // Check that the filtered data is correct
        expect(result.rowCount).toBe(2);
        expect(result.toArray()).toEqual([
          { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
          { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
        ]);
      });

      test('should handle complex conditions', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.filter((row) => row.age > 25 && row.salary > 85000);

        // Check that the filtered data is correct
        expect(result.rowCount).toBe(1);
        expect(result.toArray()).toEqual([
          { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
        ]);
      });

      test('should handle conditions on string columns', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.filter((row) => row.city.includes('San'));

        // Check that the filtered data is correct
        expect(result.rowCount).toBe(1);
        expect(result.toArray()).toEqual([
          { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
        ]);
      });

      test('should return empty DataFrame when no rows match', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.filter((row) => row.age > 100);

        // Should have all columns but no rows
        expect(result.columns.sort()).toEqual(
          ['age', 'city', 'name', 'salary'].sort(),
        );
        expect(result.rowCount).toBe(0);
      });

      test('should throw error for non-function input', () => {
        // df создан выше с помощью createDataFrameWithStorage
        expect(() => df.filter('age > 25')).toThrow();
      });

      test('should return a new DataFrame instance', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.filter((row) => row.age > 25);
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

        // df создан выше с помощью createDataFrameWithStorage
        const result = df.filter((row) => row.age > 25);

        // Check that the result has the same array types
        expect(result.frame.columns.age).toBeInstanceOf(Int32Array);
        expect(result.frame.columns.salary).toBeInstanceOf(Float64Array);
      });
    });
  });
});
