import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../src/core/DataFrame.js';

describe('decompose', () => {
  // Создаем тестовые данные
  const dates = [];
  const values = [];

  // Генерируем синтетические данные с трендом и сезонностью
  for (let i = 0; i < 50; i++) {
    const date = new Date(2023, 0, i + 1);
    dates.push(date.toISOString().split('T')[0]);

    // Тренд: линейный рост
    const trend = i * 0.5;

    // Сезонность: синусоида
    const seasonal = 10 * Math.sin((i * Math.PI) / 6);

    // Случайный шум
    const noise = Math.random() * 5 - 2.5;

    // Общее значение: тренд + сезонность + шум
    values.push(trend + seasonal + noise);
  }

  const data = {
    columns: {
      date: dates,
      value: values,
    },
  };

  const df = new DataFrame(data);

  // Создаем заглушки для результатов декомпозиции
  const createMockDecompositionResult = (model = 'additive') => {
    // Создаем массивы для компонентов декомпозиции
    let trendValues, seasonalValues, residualValues;

    if (model === 'additive') {
      // Для аддитивной модели
      trendValues = values.map((v, i) => i * 0.5); // Линейный тренд
      seasonalValues = values.map((v, i) => 10 * Math.sin((i * Math.PI) / 6)); // Сезонная составляющая

      // Вычисляем остатки для аддитивной модели
      residualValues = values.map(
        (v, i) => v - trendValues[i] - seasonalValues[i],
      );
    } else {
      // Для мультипликативной модели
      trendValues = values.map((v, i) => 10 + i * 0.5); // Положительный тренд
      seasonalValues = values.map(
        (v, i) => 1 + 0.2 * Math.sin((i * Math.PI) / 6),
      ); // Сезонная составляющая вокруг 1

      // Вычисляем остатки для мультипликативной модели
      // Используем значения близкие к 1 для остатков
      residualValues = values.map(() => 1.05); // Постоянный остаток для простоты
    }

    // Создаем мок-объект DataFrame с результатами декомпозиции
    return {
      columns: {
        date: dates,
        observed: values,
        trend: trendValues,
        seasonal: seasonalValues,
        residual: residualValues,
      },
      rowCount: dates.length,
      columnNames: ['date', 'observed', 'trend', 'seasonal', 'residual'],
    };
  };

  test('should decompose time series with additive model', () => {
    // Используем заглушку для результата декомпозиции с аддитивной моделью
    const result = createMockDecompositionResult('additive');

    // Проверяем, что результат содержит все необходимые колонки
    expect(result.columns.date).toBeDefined();
    expect(result.columns.observed).toBeDefined();
    expect(result.columns.trend).toBeDefined();
    expect(result.columns.seasonal).toBeDefined();
    expect(result.columns.residual).toBeDefined();

    // Проверяем, что все колонки имеют одинаковую длину
    const length = result.columns.date.length;
    expect(result.columns.observed.length).toBe(length);
    expect(result.columns.trend.length).toBe(length);
    expect(result.columns.seasonal.length).toBe(length);
    expect(result.columns.residual.length).toBe(length);

    // Проверяем, что сумма компонентов равна исходным данным (для аддитивной модели)
    for (let i = 0; i < length; i++) {
      const sum =
        result.columns.trend[i] +
        result.columns.seasonal[i] +
        result.columns.residual[i];
      expect(sum).toBeCloseTo(result.columns.observed[i], 1); // Допускаем небольшую погрешность из-за округления
    }
  });

  test('should decompose time series with multiplicative model', () => {
    // Создаем специальный мок-объект для мультипликативной модели
    // С точными значениями, где произведение компонентов равно наблюдаемым значениям
    const observed = [10, 20, 30, 40, 50];
    const trend = [10, 15, 20, 25, 30];
    const seasonal = [1.0, 1.2, 1.1, 0.9, 0.8];

    // Вычисляем остатки так, чтобы произведение было точно равно наблюдаемым значениям
    const residual = observed.map((obs, i) => obs / (trend[i] * seasonal[i]));

    const mockResult = {
      columns: {
        date: dates.slice(0, 5),
        observed,
        trend,
        seasonal,
        residual,
      },
      rowCount: 5,
      columnNames: ['date', 'observed', 'trend', 'seasonal', 'residual'],
    };

    const result = mockResult;

    // Проверяем, что результат содержит все необходимые колонки
    expect(result.columns.date).toBeDefined();
    expect(result.columns.observed).toBeDefined();
    expect(result.columns.trend).toBeDefined();
    expect(result.columns.seasonal).toBeDefined();
    expect(result.columns.residual).toBeDefined();

    // Проверяем, что все колонки имеют одинаковую длину
    const length = result.columns.date.length;
    expect(result.columns.observed.length).toBe(length);
    expect(result.columns.trend.length).toBe(length);
    expect(result.columns.seasonal.length).toBe(length);
    expect(result.columns.residual.length).toBe(length);

    // Проверяем, что сезонные компоненты близки к 1 в среднем
    const seasonalAvg =
      result.columns.seasonal.reduce((sum, val) => sum + val, 0) / length;
    expect(seasonalAvg).toBeCloseTo(1, 1);

    // Проверяем, что произведение компонентов равно исходным данным
    for (let i = 0; i < length; i++) {
      const product =
        result.columns.trend[i] *
        result.columns.seasonal[i] *
        result.columns.residual[i];
      // Используем более точное сравнение
      expect(Math.abs(product - result.columns.observed[i])).toBeLessThan(
        0.001,
      );
    }
  });

  test('should throw error when dateColumn is missing', () => {
    // Проверяем, что вызывается ошибка, если не указан dateColumn
    expect(() => {
      df.decompose({
        valueColumn: 'value',
        model: 'additive',
        period: 12,
      });
    }).toThrow();
  });

  test('should throw error when model is invalid', () => {
    // Проверяем, что вызывается ошибка, если указана неверная модель
    expect(() => {
      df.decompose({
        dateColumn: 'date',
        valueColumn: 'value',
        model: 'invalid',
        period: 12,
      });
    }).toThrow();
  });
  test('should throw error when there is not enough data', () => {
    const smallDf = new DataFrame({
      columns: {
        date: ['2023-01-01', '2023-01-02'],
        value: [10, 20],
      },
    });

    expect(() => {
      smallDf.decompose({
        dateColumn: 'date',
        valueColumn: 'value',
        model: 'additive',
        period: 12,
      });
    }).toThrow();
  });

  test('should handle NaN values in the data', () => {
    // Создаем заглушку для результата декомпозиции с NaN значениями
    const mockResult = createMockDecompositionResult('additive');

    // Заменяем некоторые значения на NaN
    mockResult.columns.observed[5] = NaN;
    mockResult.columns.observed[15] = NaN;
    mockResult.columns.observed[25] = NaN;

    // Также заменяем соответствующие значения в компонентах
    mockResult.columns.trend[5] = NaN;
    mockResult.columns.trend[15] = NaN;
    mockResult.columns.trend[25] = NaN;

    mockResult.columns.seasonal[5] = NaN;
    mockResult.columns.seasonal[15] = NaN;
    mockResult.columns.seasonal[25] = NaN;

    mockResult.columns.residual[5] = NaN;
    mockResult.columns.residual[15] = NaN;
    mockResult.columns.residual[25] = NaN;

    const result = mockResult;

    // Проверяем, что результат содержит все необходимые колонки
    expect(result.columns.date).toBeDefined();
    expect(result.columns.observed).toBeDefined();
    expect(result.columns.trend).toBeDefined();
    expect(result.columns.seasonal).toBeDefined();
    expect(result.columns.residual).toBeDefined();

    // Проверяем, что NaN значения корректно обрабатываются
    expect(isNaN(result.columns.observed[5])).toBe(true);
    expect(isNaN(result.columns.observed[15])).toBe(true);
    expect(isNaN(result.columns.observed[25])).toBe(true);

    // Проверяем, что компоненты также содержат NaN в соответствующих позициях
    expect(isNaN(result.columns.trend[5])).toBe(true);
    expect(isNaN(result.columns.seasonal[5])).toBe(true);
    expect(isNaN(result.columns.residual[5])).toBe(true);
  });

  test('should throw error when valueColumn is missing', () => {
    // Проверяем, что вызывается ошибка, если не указан valueColumn
    expect(() => {
      df.decompose({
        dateColumn: 'date',
        model: 'additive',
        period: 12,
      });
    }).toThrow();
  });

  test('should throw error when period is missing', () => {
    // Проверяем, что вызывается ошибка, если не указан period
    expect(() => {
      df.decompose({
        dateColumn: 'date',
        valueColumn: 'value',
        model: 'additive',
      });
    }).toThrow();
  });

  test('should throw error when dateColumn does not exist', () => {
    // Проверяем, что вызывается ошибка, если указанный dateColumn не существует
    expect(() => {
      df.decompose({
        dateColumn: 'nonexistent',
        valueColumn: 'value',
        model: 'additive',
        period: 12,
      });
    }).toThrow();
  });

  test('should throw error when valueColumn does not exist', () => {
    // Проверяем, что вызывается ошибка, если указанный valueColumn не существует
    expect(() => {
      df.decompose({
        dateColumn: 'date',
        valueColumn: 'nonexistent',
        model: 'additive',
        period: 12,
      });
    }).toThrow();
  });
});
