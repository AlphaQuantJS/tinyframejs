/**
 * Unit tests for at method
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

describe('At Method', () => {
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

      test('should select a row by index', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.at(1);

        // Check that the result is an object with the correct values
        expect(result).toEqual({
          name: 'Bob',
          age: 30,
          city: 'San Francisco',
          salary: 85000,
        });
      });

      test('should select the first row with index 0', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.at(0);

        // Check that the result is an object with the correct values
        expect(result).toEqual({
          name: 'Alice',
          age: 25,
          city: 'New York',
          salary: 70000,
        });
      });

      test('should select the last row with the last index', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.at(2);

        // Check that the result is an object with the correct values
        expect(result).toEqual({
          name: 'Charlie',
          age: 35,
          city: 'Chicago',
          salary: 90000,
        });
      });

      test('should throw error for negative index', () => {
        // df создан выше с помощью createDataFrameWithStorage
        expect(() => df.at(-1)).toThrow();
      });

      test('should throw error for index out of bounds', () => {
        // df создан выше с помощью createDataFrameWithStorage
        expect(() => df.at(3)).toThrow();
      });

      test('should throw error for non-integer index', () => {
        // df создан выше с помощью createDataFrameWithStorage
        expect(() => df.at(1.5)).toThrow();
        expect(() => df.at('1')).toThrow();
      });

      test('should handle empty DataFrame', () => {
        // df создан выше с помощью createDataFrameWithStorage
        expect(() => df.at(0)).toThrow();
      });

      test('should handle typed arrays', () => {
        // Create DataFrame with typed arrays
        const typedData = {
          name: ['Alice', 'Bob', 'Charlie'],
          age: new Int32Array([25, 30, 35]),
          salary: new Float64Array([70000, 85000, 90000]),
        };

        // df создан выше с помощью createDataFrameWithStorage
        const result = df.at(1);

        // Check that the result has the correct values
        expect(result).toEqual({
          name: 'Bob',
          age: 30,
          salary: 85000,
        });
      });
    });
  });
});
