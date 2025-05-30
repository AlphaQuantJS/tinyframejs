/**
 * Unit tests for sample method
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';

import {
  testWithBothStorageTypes,
  createDataFrameWithStorage,
} from '../../../utils/storageTestUtils.js';

// Тестовые данные для использования во всех тестах
const testData = {
  name: [
    'Alice',
    'Bob',
    'Charlie',
    'David',
    'Eve',
    'Frank',
    'Grace',
    'Heidi',
    'Ivan',
    'Judy',
  ],
  age: [25, 30, 35, 40, 45, 50, 55, 60, 65, 70],
  city: [
    'New York',
    'San Francisco',
    'Chicago',
    'Boston',
    'Seattle',
    'Miami',
    'Denver',
    'Austin',
    'Portland',
    'Atlanta',
  ],
  salary: [
    70000, 85000, 90000, 95000, 100000, 105000, 110000, 115000, 120000, 125000,
  ],
};

describe('Sample Method', () => {
  // Запускаем тесты с обоими типами хранилища
  testWithBothStorageTypes((storageType) => {
    describe(`with ${storageType} storage`, () => {
      // Создаем DataFrame с указанным типом хранилища
      const df = createDataFrameWithStorage(DataFrame, testData, storageType);

      // Создаем DataFrame с типизированными массивами для тестирования сохранения типов
      const typedData = {
        name: ['Alice', 'Bob', 'Charlie', 'David', 'Eve'],
        age: new Int32Array([25, 30, 35, 40, 45]),
        salary: new Float64Array([70000, 85000, 90000, 95000, 100000]),
      };
      const typedDf = createDataFrameWithStorage(
        DataFrame,
        typedData,
        storageType,
      );

      test('should select a random sample of rows', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.sample(3);

        // Check that the result has the correct number of rows and all columns
        expect(result.rowCount).toBe(3);
        expect(result.columns.sort()).toEqual(
          ['age', 'city', 'name', 'salary'].sort(),
        );

        // Check that each row in the result exists in the original DataFrame
        const originalRows = df.toArray();
        const resultRows = result.toArray();

        resultRows.forEach((resultRow) => {
          const matchingRow = originalRows.find(
            (originalRow) =>
              originalRow.name === resultRow.name &&
              originalRow.age === resultRow.age &&
              originalRow.city === resultRow.city &&
              originalRow.salary === resultRow.salary,
          );
          expect(matchingRow).toBeDefined();
        });
      });

      test('should select all rows when sample size equals row count', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.sample(10);

        // Check that the result has all rows
        expect(result.rowCount).toBe(10);

        // Rows might be in a different order, so we need to sort them
        const sortedOriginal = df
          .toArray()
          .sort((a, b) => a.name.localeCompare(b.name));
        const sortedResult = result
          .toArray()
          .sort((a, b) => a.name.localeCompare(b.name));
        expect(sortedResult).toEqual(sortedOriginal);
      });

      test('should produce deterministic samples with seed option', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const sample1 = df.sample(3, { seed: 42 });
        const sample2 = df.sample(3, { seed: 42 });

        // Both samples should be identical
        expect(sample1.toArray()).toEqual(sample2.toArray());
      });

      test('should produce different samples with different seeds', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const sample1 = df.sample(5, { seed: 42 });
        const sample2 = df.sample(5, { seed: 43 });

        // Samples should be different (this could theoretically fail, but it's very unlikely)
        const sample1Rows = sample1.toArray();
        const sample2Rows = sample2.toArray();

        // Check if at least one row is different
        const allRowsMatch = sample1Rows.every((row1) =>
          sample2Rows.some(
            (row2) =>
              row2.name === row1.name &&
              row2.age === row1.age &&
              row2.city === row1.city &&
              row2.salary === row1.salary,
          ),
        );

        expect(allRowsMatch).toBe(false);
      });

      test('should throw error for negative sample size', () => {
        // df создан выше с помощью createDataFrameWithStorage
        expect(() => df.sample(-1)).toThrow();
      });

      test('should throw error for zero sample size', () => {
        // df создан выше с помощью createDataFrameWithStorage
        expect(() => df.sample(0)).toThrow();
      });

      test('should throw error for sample size greater than row count', () => {
        // df создан выше с помощью createDataFrameWithStorage
        expect(() => df.sample(11)).toThrow();
      });

      test('should throw error for non-integer sample size', () => {
        // df создан выше с помощью createDataFrameWithStorage
        expect(() => df.sample(3.5)).toThrow();
      });

      test('should return a new DataFrame instance', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.sample(3);
        expect(result).toBeInstanceOf(DataFrame);
        expect(result).not.toBe(df); // Should be a new instance
      });

      test('should preserve typed arrays', () => {
        // Используем DataFrame с типизированными массивами
        const result = typedDf.sample(3, { seed: 42 });

        // Проверяем, что результат сохраняет данные и структуру
        expect(result.col('age')).toBeDefined();
        expect(result.col('salary')).toBeDefined();

        // Проверяем, что данные сохранены корректно
        const resultArray = result.toArray();
        expect(resultArray.length).toBe(3);
        expect(typeof resultArray[0].age).toBe('number');
        expect(typeof resultArray[0].salary).toBe('number');
      });
    });
  });
});
