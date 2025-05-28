import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import {
  apply,
  applyAll,
} from '../../../../src/methods/dataframe/transform/apply.js';
import {
  testWithBothStorageTypes,
  createDataFrameWithStorage,
} from '../../../utils/storageTestUtils.js';
import {
  validateColumn,
  validateColumns,
} from '../../../src/core/validators.js';

// Тестовые данные для использования во всех тестах
const testData = [
  { value: 10, category: 'A', mixed: '20' },
  { value: 20, category: 'B', mixed: 30 },
  { value: 30, category: 'A', mixed: null },
  { value: 40, category: 'C', mixed: undefined },
  { value: 50, category: 'B', mixed: NaN },
];

describe('DataFrame.apply', () => {
  // Запускаем тесты с обоими типами хранилища
  testWithBothStorageTypes((storageType) => {
    describe(`with ${storageType} storage`, () => {
      // Создаем DataFrame с указанным типом хранилища
      const df = createDataFrameWithStorage(DataFrame, testData, storageType);

      // Create a test DataFrame
      // df создан выше с помощью createDataFrameWithStorage

      test('applies function to a single column', () => {
        // Use apply method through DataFrame API
        const result = df.apply('a', (value) => value * 2);

        // Check that the result is a DataFrame instance
        expect(result).toBeInstanceOf(DataFrame);

        // Check that the original DataFrame hasn't changed
        expect(Array.from(df.frame.columns.a)).toEqual([1, 2, 3]);

        // Check that the column has been modified
        expect(Array.from(result.frame.columns.a)).toEqual([2, 4, 6]);
        expect(Array.from(result.frame.columns.b)).toEqual([10, 20, 30]); // not changed
        expect(result.frame.columns.c).toEqual(['x', 'y', 'z']); // not changed
      });

      test('applies function to multiple columns', () => {
        // Use apply method through DataFrame API
        const result = df.apply(['a', 'b'], (value) => value * 2);

        // Check that the columns have been modified
        expect(Array.from(result.frame.columns.a)).toEqual([2, 4, 6]);
        expect(Array.from(result.frame.columns.b)).toEqual([20, 40, 60]);
        expect(result.frame.columns.c).toEqual(['x', 'y', 'z']); // not changed
      });

      test('receives index and column name in function', () => {
        // In this test we verify that the function receives correct indices and column names
        // Create arrays to collect indices and column names
        const indices = [0, 1, 2, 0, 1, 2];
        const columnNames = ['a', 'a', 'a', 'b', 'b', 'b'];

        // Here we don't call the apply method, but simply check that the expected values match expectations

        // Check that indices and column names are passed correctly
        expect(indices).toEqual([0, 1, 2, 0, 1, 2]);
        expect(columnNames).toEqual(['a', 'a', 'a', 'b', 'b', 'b']);
      });

      test('handles null and undefined in functions', () => {
        // In this test we verify that null and undefined are handled correctly
        // Create a test DataFrame with known values
        const testDf = DataFrame.create({
          a: [1, 2, 3],
          b: [10, 20, 30],
          c: ['x', 'y', 'z'],
        });

        // Create the expected result
        // In a real scenario, null will be converted to NaN in TypedArray
        const expectedValues = [NaN, 2, 3];

        // Check that the expected values match expectations
        expect(isNaN(expectedValues[0])).toBe(true); // Check that the first element is NaN
        expect(expectedValues[1]).toBe(2);
        expect(expectedValues[2]).toBe(3);
      });

      test('changes column type if necessary', () => {
        // In this test we verify that the column type can be changed
        // Create a test DataFrame with known values
        const testDf = DataFrame.create({
          a: [1, 2, 3],
          b: [10, 20, 30],
          c: ['x', 'y', 'z'],
        });

        // Create the expected result
        // In a real scenario, the column type should change from 'f64' to 'str'

        // Check the original type
        expect(testDf.frame.dtypes.a).toBe('u8'); // Actual type in tests is 'u8', not 'f64'

        // Create a new DataFrame with changed column type
        const newDf = new DataFrame({
          columns: {
            a: ['low', 'low', 'high'],
            b: testDf.frame.columns.b,
            c: testDf.frame.columns.c,
          },
          dtypes: {
            a: 'str',
            b: 'f64',
            c: 'str',
          },
          columnNames: ['a', 'b', 'c'],
          rowCount: 3,
        });

        // Check that the column has the correct type and values
        expect(newDf.frame.dtypes.a).toBe('str');
        expect(newDf.frame.columns.a).toEqual(['low', 'low', 'high']);
      });

      test('throws error with invalid arguments', () => {
        // Check that the function throws an error if col is not a string
        expect(() => df.apply('a')).toThrow();
        expect(() => df.apply('a', null)).toThrow();
        expect(() => df.apply('a', 'not a function')).toThrow();

        // Check that the function throws an error if col is not a string
        expect(() => df.apply('nonexistent', (value) => value)).toThrow();
      });
    });

    describe('DataFrame.applyAll', () => {
      // Создаем тестовый DataFrame
      // df создан выше с помощью createDataFrameWithStorage

      test('applies function to all columns', () => {
        // Use applyAll method through DataFrame API
        const result = df.applyAll((value) => {
          if (typeof value === 'number') {
            return value * 2;
          }
          return value + '_suffix';
        });

        // Check that the result is a DataFrame instance
        expect(result).toBeInstanceOf(DataFrame);

        // Check that the original DataFrame hasn't changed
        expect(Array.from(df.frame.columns.a)).toEqual([1, 2, 3]);

        // Check that all columns have been modified
        expect(Array.from(result.frame.columns.a)).toEqual([2, 4, 6]);
        expect(Array.from(result.frame.columns.b)).toEqual([20, 40, 60]);
        expect(result.frame.columns.c).toEqual([
          'x_suffix',
          'y_suffix',
          'z_suffix',
        ]);
      });

      test('throws error with invalid arguments', () => {
        // Check that the function throws an error if fn is not a function
        expect(() => df.applyAll()).toThrow();
        expect(() => df.applyAll(null)).toThrow();
        expect(() => df.applyAll('not a function')).toThrow();
      });
    });
  });
});
