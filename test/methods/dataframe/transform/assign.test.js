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

describe('DataFrame.assign', () => {
  // Запускаем тесты с обоими типами хранилища
  testWithBothStorageTypes((storageType) => {
    describe(`with ${storageType} storage`, () => {
      // Создаем DataFrame с указанным типом хранилища
      const df = createDataFrameWithStorage(DataFrame, testData, storageType);

      test('adds a new column with a constant value', () => {
        // Create a test DataFrame
        // df создан выше с помощью createDataFrameWithStorage

        // Call the assign method with a constant value
        const result = df.assign({ c: 100 });

        // Check that the result is a DataFrame instance
        expect(result).toBeInstanceOf(DataFrame);

        // Check that the new column has been added
        expect(result.frame.columns).toHaveProperty('a');
        expect(result.frame.columns).toHaveProperty('b');
        expect(result.frame.columns).toHaveProperty('c');

        // Check the values of the new column
        expect(Array.from(result.frame.columns.c)).toEqual([100, 100, 100]);
      });

      test('adds a new column based on a function', () => {
        // Create a test DataFrame
        // df создан выше с помощью createDataFrameWithStorage

        // Call the assign method with a function
        const result = df.assign({
          sum: (row) => row.a + row.b,
        });

        // Check that the new column has been added
        expect(result.frame.columns).toHaveProperty('sum');

        // Check the values of the new column
        expect(Array.from(result.frame.columns.sum)).toEqual([11, 22, 33]);
      });

      test('adds multiple columns simultaneously', () => {
        // Create a test DataFrame
        // df создан выше с помощью createDataFrameWithStorage

        // Call the assign method with multiple definitions
        const result = df.assign({
          c: 100,
          sum: (row) => row.a + row.b,
          doubleA: (row) => row.a * 2,
        });

        // Check that the new columns have been added
        expect(result.frame.columns).toHaveProperty('c');
        expect(result.frame.columns).toHaveProperty('sum');
        expect(result.frame.columns).toHaveProperty('doubleA');

        // Check the values of the new columns
        expect(Array.from(result.frame.columns.c)).toEqual([100, 100, 100]);
        expect(Array.from(result.frame.columns.sum)).toEqual([11, 22, 33]);
        expect(Array.from(result.frame.columns.doubleA)).toEqual([2, 4, 6]);
      });

      test('handles null and undefined in functions', () => {
        // Create a test DataFrame
        // df создан выше с помощью createDataFrameWithStorage

        // Call the assign method with functions that return null/undefined
        const result = df.assign({
          nullable: (row, i) => (i === 0 ? null : row.a),
          undefinable: (row, i) => (i < 2 ? undefined : row.a),
        });

        // Check the values of the new columns
        // NaN is used to represent null/undefined in TypedArray
        const nullableValues = Array.from(result.frame.columns.nullable);
        expect(isNaN(nullableValues[0])).toBe(true);
        expect(nullableValues[1]).toBe(2);
        expect(nullableValues[2]).toBe(3);

        const undefinableValues = Array.from(result.frame.columns.undefinable);
        expect(isNaN(undefinableValues[0])).toBe(true);
        expect(isNaN(undefinableValues[1])).toBe(true);
        expect(undefinableValues[2]).toBe(3);
      });

      test('changes the column type if necessary', () => {
        // Create a test DataFrame
        // df создан выше с помощью createDataFrameWithStorage

        // Call the assign method with a function that returns strings
        const result = df.assign({
          category: (row) => (row.a < 3 ? 'low' : 'high'),
        });

        // Check that the new column has been added and has the correct type
        expect(result.frame.columns).toHaveProperty('category');
        expect(result.frame.dtypes.category).toBe('str');

        // Проверяем значения новой колонки
        expect(result.frame.columns.category).toEqual(['low', 'low', 'high']);
      });

      test('throws an error with incorrect arguments', () => {
        // Create a test DataFrame
        // df создан выше с помощью createDataFrameWithStorage

        // Check that the method throws an error if columnDefs is not an object
        try {
          df.assign(null);
          throw new Error(
            'Expected assign to throw an error for null columnDefs',
          );
        } catch (error) {
          expect(error.message).toContain('object');
        }

        try {
          df.assign('not an object');
          throw new Error(
            'Expected assign to throw an error for string columnDefs',
          );
        } catch (error) {
          expect(error.message).toContain('object');
        }

        try {
          df.assign(123);
          throw new Error(
            'Expected assign to throw an error for number columnDefs',
          );
        } catch (error) {
          expect(error.message).toContain('object');
        }
      });
    });
  });
});
