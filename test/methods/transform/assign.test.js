import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../src/core/DataFrame.js';

describe('DataFrame.assign', () => {
  test('adds a new column with a constant value', () => {
    // Создаем тестовый DataFrame
    const df = DataFrame.create({
      a: [1, 2, 3],
      b: [10, 20, 30],
    });

    // Call the assign method with a constant value
    const result = df.assign({ c: 100 });

    // Check that the result is a DataFrame instance
    expect(result).toBeInstanceOf(DataFrame);

    // Проверяем, что новая колонка добавлена
    expect(result.frame.columns).toHaveProperty('a');
    expect(result.frame.columns).toHaveProperty('b');
    expect(result.frame.columns).toHaveProperty('c');

    // Проверяем значения новой колонки
    expect(Array.from(result.frame.columns.c)).toEqual([100, 100, 100]);
  });

  test('adds a new column based on a function', () => {
    // Создаем тестовый DataFrame
    const df = DataFrame.create({
      a: [1, 2, 3],
      b: [10, 20, 30],
    });

    // Вызываем метод assign с функцией
    const result = df.assign({
      sum: (row) => row.a + row.b,
    });

    // Проверяем, что новая колонка добавлена
    expect(result.frame.columns).toHaveProperty('sum');

    // Проверяем значения новой колонки
    expect(Array.from(result.frame.columns.sum)).toEqual([11, 22, 33]);
  });

  test('adds multiple columns simultaneously', () => {
    // Create a test DataFrame
    const df = DataFrame.create({
      a: [1, 2, 3],
      b: [10, 20, 30],
    });

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
    const df = DataFrame.create({
      a: [1, 2, 3],
      b: [10, 20, 30],
    });

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
    const df = DataFrame.create({
      a: [1, 2, 3],
      b: [10, 20, 30],
    });

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
    // Создаем тестовый DataFrame
    const df = DataFrame.create({
      a: [1, 2, 3],
      b: [10, 20, 30],
    });

    // Check that the method throws an error if columnDefs is not an object
    try {
      df.assign(null);
      throw new Error('Expected assign to throw an error for null columnDefs');
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
