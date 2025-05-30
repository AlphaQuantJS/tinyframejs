/**
 * Unit tests for stratifiedSample method
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
    'New York',
    'San Francisco',
    'Chicago',
    'Boston',
    'Seattle',
  ],
  category: ['A', 'B', 'A', 'B', 'C', 'A', 'B', 'A', 'B', 'C'],
  salary: [
    70000, 85000, 90000, 95000, 100000, 105000, 110000, 115000, 120000, 125000,
  ],
};

describe('StratifiedSample Method', () => {
  // Запускаем тесты с обоими типами хранилища
  testWithBothStorageTypes((storageType) => {
    describe(`with ${storageType} storage`, () => {
      // Создаем DataFrame с указанным типом хранилища
      const df = createDataFrameWithStorage(DataFrame, testData, storageType);

      // Создаем DataFrame с типизированными массивами для тестирования сохранения типов
      const typedData = {
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
        age: new Int32Array([25, 30, 35, 40, 45, 50, 55, 60, 65, 70]),
        category: ['A', 'B', 'A', 'B', 'C', 'A', 'B', 'A', 'B', 'C'],
        salary: new Float64Array([
          70000, 85000, 90000, 95000, 100000, 105000, 110000, 115000, 120000,
          125000,
        ]),
      };
      const typedDf = createDataFrameWithStorage(
        DataFrame,
        typedData,
        storageType,
      );

      test('should select a stratified sample maintaining category proportions', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.stratifiedSample('category', 0.5);

        // Check that the result has approximately half the rows
        expect(result.rowCount).toBe(5);

        // Check that the proportions of categories are maintained
        const originalCounts = {};
        const resultCounts = {};

        // Count categories in original data
        df.toArray().forEach((row) => {
          originalCounts[row.category] =
            (originalCounts[row.category] || 0) + 1;
        });

        // Count categories in result
        result.toArray().forEach((row) => {
          resultCounts[row.category] = (resultCounts[row.category] || 0) + 1;
        });

        // Check that each category has approximately half the original count
        Object.keys(originalCounts).forEach((category) => {
          expect(resultCounts[category]).toBe(
            Math.round(originalCounts[category] * 0.5),
          );
        });
      });

      test('should produce deterministic samples with seed option', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const sample1 = df.stratifiedSample('category', 0.5, { seed: 42 });
        const sample2 = df.stratifiedSample('category', 0.5, { seed: 42 });

        // Both samples should be identical
        expect(sample1.toArray()).toEqual(sample2.toArray());
      });

      test('should produce different samples with different seeds', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const sample1 = df.stratifiedSample('category', 0.5, { seed: 42 });
        const sample2 = df.stratifiedSample('category', 0.5, { seed: 43 });

        // Samples should be different (this could theoretically fail, but it's very unlikely)
        const sample1Rows = sample1.toArray();
        const sample2Rows = sample2.toArray();

        // Check if at least one row is different
        const allRowsMatch = sample1Rows.every((row1) =>
          sample2Rows.some(
            (row2) =>
              row2.name === row1.name &&
              row2.age === row1.age &&
              row2.category === row1.category &&
              row2.salary === row1.salary,
          ),
        );

        expect(allRowsMatch).toBe(false);
      });

      test('should throw error for non-existent stratify column', () => {
        // df создан выше с помощью createDataFrameWithStorage
        expect(() => df.stratifiedSample('nonexistent', 0.5)).toThrow();
      });

      test('should throw error for negative fraction', () => {
        // df создан выше с помощью createDataFrameWithStorage
        expect(() => df.stratifiedSample('category', -0.5)).toThrow();
      });

      test('should throw error for zero fraction', () => {
        // df создан выше с помощью createDataFrameWithStorage
        expect(() => df.stratifiedSample('category', 0)).toThrow();
      });

      test('should throw error for fraction greater than 1', () => {
        // df создан выше с помощью createDataFrameWithStorage
        expect(() => df.stratifiedSample('category', 1.5)).toThrow();
      });

      test('should return a new DataFrame instance', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.stratifiedSample('category', 0.5);
        expect(result).toBeInstanceOf(DataFrame);
        expect(result).not.toBe(df); // Should be a new instance
      });

      test('should preserve typed arrays', () => {
        // Используем DataFrame с типизированными массивами
        const result = typedDf.stratifiedSample('category', 0.5, { seed: 42 });

        // Проверяем, что результат сохраняет данные и структуру
        expect(result.col('age')).toBeDefined();
        expect(result.col('salary')).toBeDefined();

        // Проверяем, что данные сохранены корректно
        const resultArray = result.toArray();
        expect(resultArray.length).toBeGreaterThan(0);
        expect(typeof resultArray[0].age).toBe('number');
        expect(typeof resultArray[0].salary).toBe('number');
      });

      test('should handle the case where a category has only one item', () => {
        // Создаем DataFrame с одним элементом в каждой категории
        const singleItemData = {
          name: ['Alice', 'Bob', 'Charlie'],
          category: ['A', 'B', 'C'],
        };
        const singleItemDf = createDataFrameWithStorage(
          DataFrame,
          singleItemData,
          storageType,
        );

        // Вызываем метод stratifiedSample на DataFrame с одним элементом в каждой категории
        const result = singleItemDf.stratifiedSample('category', 0.5);

        // Each category should still have at least one item
        const categories = result.toArray().map((row) => row.category);
        expect(categories).toContain('A');
        expect(categories).toContain('B');
        expect(categories).toContain('C');
        expect(result.rowCount).toBe(3); // Все элементы должны быть включены
      });
    });
  });
});
