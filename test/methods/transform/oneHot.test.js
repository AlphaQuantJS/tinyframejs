import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../src/core/DataFrame.js';

describe('DataFrame.oneHot', () => {
  test('создает one-hot кодирование для категориальной колонки', () => {
    // Создаем тестовый DataFrame
    const df = DataFrame.create({
      department: [
        'Engineering',
        'Marketing',
        'Engineering',
        'Sales',
        'Marketing',
      ],
    });

    // Вызываем метод oneHot у DataFrame
    const result = df.oneHot('department');

    // Проверяем, что результат - экземпляр DataFrame
    expect(result).toBeInstanceOf(DataFrame);

    // Проверяем, что новые колонки добавлены
    expect(result.frame.columns).toHaveProperty('department_Engineering');
    expect(result.frame.columns).toHaveProperty('department_Marketing');
    expect(result.frame.columns).toHaveProperty('department_Sales');

    // Проверяем значения новых колонок
    expect(Array.from(result.frame.columns.department_Engineering)).toEqual([
      1, 0, 1, 0, 0,
    ]);
    expect(Array.from(result.frame.columns.department_Marketing)).toEqual([
      0, 1, 0, 0, 1,
    ]);
    expect(Array.from(result.frame.columns.department_Sales)).toEqual([
      0, 0, 0, 1, 0,
    ]);

    // Проверяем, что исходная колонка сохранена
    expect(result.frame.columns.department).toEqual([
      'Engineering',
      'Marketing',
      'Engineering',
      'Sales',
      'Marketing',
    ]);
  });

  test('использует пользовательский префикс для новых колонок', () => {
    // Создаем тестовый DataFrame
    const df = DataFrame.create({
      department: [
        'Engineering',
        'Marketing',
        'Engineering',
        'Sales',
        'Marketing',
      ],
    });

    // Вызываем метод oneHot с пользовательским префиксом
    const result = df.oneHot('department', { prefix: 'dept_' });

    // Проверяем, что новые колонки добавлены с указанным префиксом
    expect(result.frame.columns).toHaveProperty('dept_Engineering');
    expect(result.frame.columns).toHaveProperty('dept_Marketing');
    expect(result.frame.columns).toHaveProperty('dept_Sales');
  });

  test('удаляет исходную колонку при dropOriginal=true', () => {
    // Создаем тестовый DataFrame
    const df = DataFrame.create({
      department: [
        'Engineering',
        'Marketing',
        'Engineering',
        'Sales',
        'Marketing',
      ],
    });

    // Вызываем метод oneHot с dropOriginal=true
    const result = df.oneHot('department', { dropOriginal: true });

    // Проверяем, что исходная колонка удалена
    expect(result.frame.columns).not.toHaveProperty('department');

    // Проверяем, что новые колонки добавлены
    expect(result.frame.columns).toHaveProperty('department_Engineering');
    expect(result.frame.columns).toHaveProperty('department_Marketing');
    expect(result.frame.columns).toHaveProperty('department_Sales');
  });

  test('обрабатывает null и undefined', () => {
    // Создаем DataFrame с пропущенными значениями
    const dfWithNulls = DataFrame.create({
      category: ['A', null, 'B', undefined, 'A'],
    });

    // Вызываем метод oneHot для DataFrame с null и undefined
    const result = dfWithNulls.oneHot('category');

    // Проверяем, что null и undefined не создают отдельных категорий
    const newColumns = result.frame.columnNames.filter(
      (col) => col !== 'category',
    );
    expect(newColumns).toEqual(['category_A', 'category_B']);

    // Проверяем значения новых колонок
    expect(Array.from(result.frame.columns.category_A)).toEqual([
      1, 0, 0, 0, 1,
    ]);
    expect(Array.from(result.frame.columns.category_B)).toEqual([
      0, 0, 1, 0, 0,
    ]);
  });

  test('использует Uint8Array для бинарных колонок', () => {
    // Создаем тестовый DataFrame
    const df = DataFrame.create({
      department: [
        'Engineering',
        'Marketing',
        'Engineering',
        'Sales',
        'Marketing',
      ],
    });

    // Вызываем метод oneHot
    const result = df.oneHot('department');

    // Проверяем, что новые колонки имеют тип Uint8Array
    expect(result.frame.columns.department_Engineering).toBeInstanceOf(
      Uint8Array,
    );
    expect(result.frame.columns.department_Marketing).toBeInstanceOf(
      Uint8Array,
    );
    expect(result.frame.columns.department_Sales).toBeInstanceOf(Uint8Array);

    // Проверяем, что dtype установлен правильно
    expect(result.frame.dtypes.department_Engineering).toBe('u8');
    expect(result.frame.dtypes.department_Marketing).toBe('u8');
    expect(result.frame.dtypes.department_Sales).toBe('u8');
  });

  test('выбрасывает ошибку при некорректных аргументах', () => {
    // Создаем тестовый DataFrame
    const df = DataFrame.create({
      department: [
        'Engineering',
        'Marketing',
        'Engineering',
        'Sales',
        'Marketing',
      ],
    });

    // Проверяем, что метод выбрасывает ошибку, если колонка не существует
    try {
      df.oneHot('nonexistent');
      // Если мы дошли до этой точки, значит ошибка не была выброшена
      throw new Error(
        'Expected oneHot to throw an error for nonexistent column',
      );
    } catch (error) {
      // Проверяем, что ошибка содержит ожидаемое сообщение
      expect(error.message).toContain('nonexistent');
    }
  });
});
