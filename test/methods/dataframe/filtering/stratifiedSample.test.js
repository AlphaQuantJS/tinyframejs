/**
 * Unit tests for stratifiedSample method
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import registerDataFrameFiltering from '../../../../src/methods/dataframe/filtering/register.js';

// Тестовые данные для использования во всех тестах
const testData = [
  { name: 'Alice', age: 25, city: 'New York', category: 'A', salary: 70000 },
  { name: 'Bob', age: 30, city: 'San Francisco', category: 'B', salary: 85000 },
  { name: 'Charlie', age: 35, city: 'Chicago', category: 'A', salary: 90000 },
  { name: 'David', age: 40, city: 'Boston', category: 'B', salary: 95000 },
  { name: 'Eve', age: 45, city: 'Seattle', category: 'C', salary: 100000 },
  { name: 'Frank', age: 50, city: 'New York', category: 'A', salary: 105000 },
  {
    name: 'Grace',
    age: 55,
    city: 'San Francisco',
    category: 'B',
    salary: 110000,
  },
  { name: 'Heidi', age: 60, city: 'Chicago', category: 'A', salary: 115000 },
  { name: 'Ivan', age: 65, city: 'Boston', category: 'B', salary: 120000 },
  { name: 'Judy', age: 70, city: 'Seattle', category: 'C', salary: 125000 },
];

describe('StratifiedSample Method', () => {
  // Регистрируем методы фильтрации для DataFrame
  registerDataFrameFiltering(DataFrame);

  describe('with standard storage', () => {
    // Создаем DataFrame используя fromRows
    const df = DataFrame.fromRows(testData);

    // Создаем DataFrame с типизированными массивами для тестирования сохранения типов
    const typedDf = DataFrame.fromRows(testData, {
      columns: {
        age: { type: 'int32' },
        salary: { type: 'float64' },
      },
    });

    test('should select a stratified sample maintaining category proportions', () => {
      const result = df.stratifiedSample('category', 0.5);

      // Check that the result has approximately half the rows
      expect(result.rowCount).toBe(5);

      // Check that the proportions of categories are maintained
      const originalCounts = {};
      const resultCounts = {};

      // Count categories in original data
      df.toArray().forEach((row) => {
        originalCounts[row.category] = (originalCounts[row.category] || 0) + 1;
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
      const sample1 = df.stratifiedSample('category', 0.5, { seed: 42 });
      const sample2 = df.stratifiedSample('category', 0.5, { seed: 42 });

      // Both samples should be identical
      expect(sample1.toArray()).toEqual(sample2.toArray());
    });

    test('should produce different samples with different seeds', () => {
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
      expect(() => df.stratifiedSample('nonexistent', 0.5)).toThrow();
    });

    test('should throw error for negative fraction', () => {
      expect(() => df.stratifiedSample('category', -0.5)).toThrow();
    });

    test('should throw error for zero fraction', () => {
      expect(() => df.stratifiedSample('category', 0)).toThrow();
    });

    test('should throw error for fraction greater than 1', () => {
      expect(() => df.stratifiedSample('category', 1.5)).toThrow();
    });

    test('should return a new DataFrame instance', () => {
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
      const singleItemData = [
        { name: 'Alice', category: 'A' },
        { name: 'Bob', category: 'B' },
        { name: 'Charlie', category: 'C' },
      ];
      const singleItemDf = DataFrame.fromRows(singleItemData);

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
