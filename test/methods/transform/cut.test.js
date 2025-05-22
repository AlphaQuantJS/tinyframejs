import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../src/core/DataFrame.js';
import { cut } from '../../../src/methods/transform/cut.js';
import { validateColumn } from '../../../src/core/validators.js';

describe('DataFrame.cut', () => {
  // Создаем тестовый DataFrame
  const df = DataFrame.create({
    salary: [30000, 45000, 60000, 75000, 90000, 100000],
  });

  // Создаем функцию cut с инъекцией зависимостей
  const cutWithDeps = cut({ validateColumn });

  test('создает категориальную колонку с настройками по умолчанию', () => {
    // Вызываем функцию напрямую с TinyFrame
    const resultFrame = cutWithDeps(df.frame, 'salary', {
      bins: [0, 50000, 80000, 150000],
      labels: ['Low', 'Medium', 'High'],
    });

    // Оборачиваем результат в DataFrame для тестирования
    const result = new DataFrame(resultFrame);

    // Проверяем, что результат - экземпляр DataFrame
    expect(result).toBeInstanceOf(DataFrame);

    // Проверяем, что исходный DataFrame не изменился
    expect(df.frame.columns).not.toHaveProperty('salary_category');

    // Проверяем, что новая колонка добавлена
    expect(result.frame.columns).toHaveProperty('salary_category');

    // Проверяем значения новой колонки
    // По умолчанию: right=true, includeLowest=false
    expect(result.frame.columns.salary_category).toEqual([
      null,
      null,
      'Medium',
      'Medium',
      'High',
      'High',
    ]);
  });

  test('использует пользовательское имя для новой колонки', () => {
    // Вызываем функцию напрямую с TinyFrame
    const resultFrame = cutWithDeps(df.frame, 'salary', {
      bins: [0, 50000, 80000, 150000],
      labels: ['Low', 'Medium', 'High'],
      columnName: 'salary_tier',
    });

    // Оборачиваем результат в DataFrame для тестирования
    const result = new DataFrame(resultFrame);

    // Проверяем, что новая колонка добавлена с указанным именем
    expect(result.frame.columns).toHaveProperty('salary_tier');
  });

  test('работает с includeLowest=true', () => {
    // Вызываем функцию напрямую с TinyFrame
    const resultFrame = cutWithDeps(df.frame, 'salary', {
      bins: [30000, 50000, 80000, 150000],
      labels: ['Low', 'Medium', 'High'],
      includeLowest: true,
    });

    // Оборачиваем результат в DataFrame для тестирования
    const result = new DataFrame(resultFrame);

    // Проверяем значения новой колонки
    // С includeLowest=true первое значение (30000) должно попасть в первую категорию
    expect(result.frame.columns.salary_category).toEqual([
      'Low',
      null,
      'Medium',
      'Medium',
      'High',
      'High',
    ]);
  });

  test('работает с right=false', () => {
    // Вызываем функцию напрямую с TinyFrame
    const resultFrame = cutWithDeps(df.frame, 'salary', {
      bins: [0, 50000, 80000, 100000],
      labels: ['Low', 'Medium', 'High'],
      right: false,
    });

    // Оборачиваем результат в DataFrame для тестирования
    const result = new DataFrame(resultFrame);

    // Проверяем значения новой колонки
    // С right=false интервалы (a, b] вместо [a, b)
    expect(result.frame.columns.salary_category).toEqual([
      'Low',
      'Low',
      'Medium',
      'Medium',
      'Medium',
      null,
    ]);
  });

  test('работает с right=false и includeLowest=true', () => {
    // Вызываем функцию напрямую с TinyFrame
    const resultFrame = cutWithDeps(df.frame, 'salary', {
      bins: [0, 50000, 80000, 100000],
      labels: ['Low', 'Medium', 'High'],
      right: false,
      includeLowest: true,
    });

    // Оборачиваем результат в DataFrame для тестирования
    const result = new DataFrame(resultFrame);

    // Проверяем значения новой колонки
    // С right=false и includeLowest=true последнее значение (100000) должно попасть в последнюю категорию
    expect(result.frame.columns.salary_category).toEqual([
      'Low',
      'Low',
      'Medium',
      'Medium',
      'Medium',
      'High',
    ]);
  });

  test('обрабатывает null, undefined и NaN', () => {
    // Создаем DataFrame с пропущенными значениями
    const dfWithNulls = DataFrame.create({
      value: [10, null, 40, undefined, NaN, 60],
    });

    // Вызываем функцию напрямую с TinyFrame
    const resultFrame = cutWithDeps(dfWithNulls.frame, 'value', {
      bins: [0, 30, 50, 100],
      labels: ['Low', 'Medium', 'High'],
    });

    // Оборачиваем результат в DataFrame для тестирования
    const result = new DataFrame(resultFrame);

    // Проверяем значения новой колонки
    expect(result.frame.columns.value_category).toEqual([
      null,
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
      cutWithDeps(df.frame, 'salary', { bins: null, labels: ['A', 'B'] }),
    ).toThrow();
    expect(() =>
      cutWithDeps(df.frame, 'salary', { bins: [30], labels: [] }),
    ).toThrow();

    // Проверяем, что метод выбрасывает ошибку, если labels не массив
    expect(() =>
      cutWithDeps(df.frame, 'salary', {
        bins: [0, 30, 100],
        labels: 'not an array',
      }),
    ).toThrow();

    // Проверяем, что метод выбрасывает ошибку, если количество меток не соответствует количеству интервалов
    expect(() =>
      cutWithDeps(df.frame, 'salary', { bins: [0, 30, 100], labels: ['A'] }),
    ).toThrow();
    expect(() =>
      cutWithDeps(df.frame, 'salary', {
        bins: [0, 30, 100],
        labels: ['A', 'B', 'C'],
      }),
    ).toThrow();

    // Проверяем, что метод выбрасывает ошибку, если колонка не существует
    expect(() =>
      cutWithDeps(df.frame, 'nonexistent', {
        bins: [0, 30, 100],
        labels: ['A', 'B'],
      }),
    ).toThrow();
  });
});
