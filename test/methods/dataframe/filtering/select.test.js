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
const testData = [
  { value: 10, category: 'A', mixed: '20' },
  { value: 20, category: 'B', mixed: 30 },
  { value: 30, category: 'A', mixed: null },
  { value: 40, category: 'C', mixed: undefined },
  { value: 50, category: 'B', mixed: NaN },
];

describe('Select Method', () => {
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

      test('should throw error for non-array input', () => {
        // df создан выше с помощью createDataFrameWithStorage
        expect(() => df.select('name')).toThrow();
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
