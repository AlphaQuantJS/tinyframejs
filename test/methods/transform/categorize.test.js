import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../src/core/DataFrame.js';
import { categorize } from '../../../src/methods/transform/categorize.js';
import { validateColumn } from '../../../src/core/validators.js';

describe('DataFrame.categorize', () => {
  // Создаем тестовый DataFrame
  const df = DataFrame.create({
    age: [18, 25, 35, 45, 55, 65],
    salary: [30000, 45000, 60000, 75000, 90000, 100000],
  });

  // Создаем функцию categorize с инъекцией зависимостей
  const categorizeWithDeps = categorize({ validateColumn });

  test('создает категориальную колонку на основе числовой', () => {
    // Вызываем функцию напрямую с TinyFrame
    const resultFrame = categorizeWithDeps(df.frame, 'age', {
      bins: [0, 30, 50, 100],
      labels: ['Young', 'Middle', 'Senior'],
    });

    // Оборачиваем результат в DataFrame для тестирования
    const result = new DataFrame(resultFrame);

    // Проверяем, что результат - экземпляр DataFrame
    expect(result).toBeInstanceOf(DataFrame);

    // Проверяем, что исходный DataFrame не изменился
    expect(df.frame.columns).not.toHaveProperty('age_category');

    // Проверяем, что новая колонка добавлена
    expect(result.frame.columns).toHaveProperty('age_category');

    // Проверяем значения новой колонки
    expect(result.frame.columns.age_category).toEqual([
      'Young',
      'Young',
      'Middle',
      'Middle',
      'Senior',
      'Senior',
    ]);
  });

  test('использует пользовательское имя для новой колонки', () => {
    // Вызываем функцию напрямую с TinyFrame
    const resultFrame = categorizeWithDeps(df.frame, 'age', {
      bins: [0, 30, 50, 100],
      labels: ['Young', 'Middle', 'Senior'],
      columnName: 'age_group',
    });

    // Оборачиваем результат в DataFrame для тестирования
    const result = new DataFrame(resultFrame);

    // Проверяем, что новая колонка добавлена с указанным именем
    expect(result.frame.columns).toHaveProperty('age_group');

    // Проверяем значения новой колонки
    expect(result.frame.columns.age_group).toEqual([
      'Young',
      'Young',
      'Middle',
      'Middle',
      'Senior',
      'Senior',
    ]);
  });

  test('корректно обрабатывает значения на границах', () => {
    // Создаем DataFrame с граничными значениями
    const dfBoundary = DataFrame.create({
      value: [0, 30, 50, 100],
    });

    // Вызываем функцию напрямую с TinyFrame
    const resultFrame = categorizeWithDeps(dfBoundary.frame, 'value', {
      bins: [0, 30, 50, 100],
      labels: ['Low', 'Medium', 'High'],
    });

    // Оборачиваем результат в DataFrame для тестирования
    const result = new DataFrame(resultFrame);

    // Проверяем значения новой колонки
    // Значения на границах попадают в левый интервал (кроме последнего)
    expect(result.frame.columns.value_category).toEqual([
      'Low',
      null,
      null,
      null,
    ]);
  });

  test('обрабатывает null, undefined и NaN', () => {
    // Создаем DataFrame с пропущенными значениями
    const dfWithNulls = DataFrame.create({
      value: [10, null, 40, undefined, NaN, 60],
    });

    // Вызываем функцию напрямую с TinyFrame
    const resultFrame = categorizeWithDeps(dfWithNulls.frame, 'value', {
      bins: [0, 30, 50, 100],
      labels: ['Low', 'Medium', 'High'],
    });

    // Оборачиваем результат в DataFrame для тестирования
    const result = new DataFrame(resultFrame);

    // Проверяем значения новой колонки
    expect(result.frame.columns.value_category).toEqual([
      'Low',
      null,
      'Medium',
      null,
      null,
      'High',
    ]);
  });

  test('выбрасывает ошибку при некорректных аргументах', () => {
    // Проверяем, что метод выбрасывает ошибку, если bins не массив или имеет менее 2 элементов
    expect(() =>
      categorizeWithDeps(df.frame, 'age', { bins: null, labels: ['A', 'B'] }),
    ).toThrow();
    expect(() =>
      categorizeWithDeps(df.frame, 'age', { bins: [30], labels: [] }),
    ).toThrow();

    // Проверяем, что метод выбрасывает ошибку, если labels не массив
    expect(() =>
      categorizeWithDeps(df.frame, 'age', {
        bins: [0, 30, 100],
        labels: 'not an array',
      }),
    ).toThrow();

    // Проверяем, что метод выбрасывает ошибку, если количество меток не соответствует количеству интервалов
    expect(() =>
      categorizeWithDeps(df.frame, 'age', {
        bins: [0, 30, 100],
        labels: ['A'],
      }),
    ).toThrow();
    expect(() =>
      categorizeWithDeps(df.frame, 'age', {
        bins: [0, 30, 100],
        labels: ['A', 'B', 'C'],
      }),
    ).toThrow();

    // Проверяем, что метод выбрасывает ошибку, если колонка не существует
    expect(() =>
      categorizeWithDeps(df.frame, 'nonexistent', {
        bins: [0, 30, 100],
        labels: ['A', 'B'],
      }),
    ).toThrow();
  });
});
