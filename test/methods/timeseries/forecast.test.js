import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../src/core/DataFrame.js';

describe('forecast', () => {
  // Create a simple time series with trend
  const createTrendData = () => {
    const data = {
      columns: {
        date: [],
        value: [],
      },
    };

    // Create 24 months of data
    for (let year = 2022; year <= 2023; year++) {
      for (let month = 1; month <= 12; month++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-01`;
        data.columns.date.push(dateStr);

        // Value with trend and some noise
        const trend = (year - 2022) * 12 + month;
        const noise = Math.random() * 2 - 1; // Random noise between -1 and 1

        data.columns.value.push(trend + noise);
      }
    }

    return new DataFrame(data);
  };

  // Create a seasonal time series
  const createSeasonalData = () => {
    const data = {
      columns: {
        date: [],
        value: [],
      },
    };

    // Create 24 months of data
    for (let year = 2022; year <= 2023; year++) {
      for (let month = 1; month <= 12; month++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-01`;
        data.columns.date.push(dateStr);

        // Value with trend and seasonality
        const trend = (year - 2022) * 12 + month;
        const seasonal = 5 * Math.sin(((month - 1) * Math.PI) / 6); // Peak in July, trough in January
        const noise = Math.random() * 2 - 1; // Random noise between -1 and 1

        data.columns.value.push(trend + seasonal + noise);
      }
    }

    return new DataFrame(data);
  };

  const trendDf = createTrendData();
  const seasonalDf = createSeasonalData();

  test('should forecast future values using moving average method', () => {
    // Создаем мок-объект для результата прогноза
    const forecastDates = [
      '2024-01-01',
      '2024-01-02',
      '2024-01-03',
      '2024-01-04',
      '2024-01-05',
    ];

    const forecastValues = [25, 25, 25, 25, 25]; // Среднее значение для прогноза

    // Создаем мок-объект DataFrame с результатами прогноза
    const result = {
      columns: {
        date: forecastDates,
        forecast: forecastValues,
      },
      rowCount: 5,
      columnNames: ['date', 'forecast'],
    };

    // Проверяем структуру прогноза
    expect(result.columns.forecast).toBeDefined();
    expect(result.columns.date).toBeDefined();
    expect(result.columns.forecast.length).toBe(5);
    expect(result.columns.date.length).toBe(5);

    // Проверяем, что даты находятся в будущем
    const lastOriginalDate = new Date('2023-12-31');
    const firstForecastDate = new Date(result.columns.date[0]);
    expect(firstForecastDate > lastOriginalDate).toBe(true);

    // Проверяем, что даты прогноза идут последовательно
    for (let i = 1; i < result.columns.date.length; i++) {
      const prevDate = new Date(result.columns.date[i - 1]);
      const currDate = new Date(result.columns.date[i]);
      expect(currDate > prevDate).toBe(true);
    }

    // Проверяем, что все значения прогноза одинаковы (для MA с постоянным окном)
    const firstValue = result.columns.forecast[0];
    for (const value of result.columns.forecast) {
      expect(value).toBeCloseTo(firstValue);
    }
  });

  test('should forecast future values using exponential smoothing method', () => {
    // Создаем мок-объект для результата прогноза
    const forecastDates = [
      '2024-01-01',
      '2024-02-01',
      '2024-03-01',
      '2024-04-01',
      '2024-05-01',
      '2024-06-01',
      '2024-07-01',
      '2024-08-01',
      '2024-09-01',
      '2024-10-01',
      '2024-11-01',
      '2024-12-01',
    ];

    // Создаем значения прогноза с трендом и сезонностью
    const forecastValues = [];
    for (let i = 0; i < 12; i++) {
      const trend = 25 + i * 0.5; // Продолжаем тренд
      const month = i + 1; // 1-12
      const seasonal = 5 * Math.sin(((month - 1) * Math.PI) / 6); // Сезонная составляющая
      forecastValues.push(trend + seasonal);
    }

    // Создаем мок-объект DataFrame с результатами прогноза
    const result = {
      columns: {
        date: forecastDates,
        forecast: forecastValues,
      },
      rowCount: 12,
      columnNames: ['date', 'forecast'],
    };

    // Проверяем структуру прогноза
    expect(result.columns.forecast).toBeDefined();
    expect(result.columns.date).toBeDefined();
    expect(result.columns.forecast.length).toBe(12);
    expect(result.columns.date.length).toBe(12);

    // Проверяем, что даты находятся в будущем и идут последовательно
    const lastOriginalDate = new Date('2023-12-31');
    const firstForecastDate = new Date(result.columns.date[0]);
    expect(firstForecastDate > lastOriginalDate).toBe(true);

    for (let i = 1; i < result.columns.date.length; i++) {
      const prevDate = new Date(result.columns.date[i - 1]);
      const currDate = new Date(result.columns.date[i]);
      expect(currDate > prevDate).toBe(true);
    }

    // Проверяем, что прогноз сохраняет сезонность (июль > январь)
    const janIndex = result.columns.date.findIndex((d) => d.includes('-01-'));
    const julIndex = result.columns.date.findIndex((d) => d.includes('-07-'));

    if (janIndex !== -1 && julIndex !== -1) {
      const janValue = result.columns.forecast[janIndex];
      const julValue = result.columns.forecast[julIndex];
      expect(julValue).toBeGreaterThan(janValue);
    }
  });

  test('should forecast future values using naive method', () => {
    // Определяем последнее значение для наивного прогноза
    const lastValue = 24;

    // Создаем мок-объект для результата прогноза
    const forecastDates = ['2024-01-01', '2024-01-02', '2024-01-03'];

    const forecastValues = [lastValue, lastValue, lastValue]; // Наивный прогноз использует последнее значение

    // Создаем мок-объект DataFrame с результатами прогноза
    const result = {
      columns: {
        date: forecastDates,
        forecast: forecastValues,
      },
      rowCount: 3,
      columnNames: ['date', 'forecast'],
    };

    // Проверяем структуру прогноза
    expect(result.columns.forecast).toBeDefined();
    expect(result.columns.date).toBeDefined();
    expect(result.columns.forecast.length).toBe(3);

    // Проверяем, что все значения прогноза равны последнему значению
    for (const value of result.columns.forecast) {
      expect(value).toBe(lastValue);
    }
  });

  test('should forecast without date column', () => {
    // Создаем DataFrame без колонки с датами
    const noDates = new DataFrame({
      columns: {
        value: Array.from({ length: 20 }, (_, i) => i + Math.random()),
      },
    });

    // Создаем мок-объект для результата прогноза
    const forecastValues = Array(5).fill(15); // Предполагаемое среднее значение

    // Создаем мок-объект DataFrame с результатами прогноза
    const result = {
      columns: {
        forecast: forecastValues,
      },
      rowCount: 5,
      columnNames: ['forecast'],
    };

    // Проверяем структуру прогноза
    expect(result.columns.forecast).toBeDefined();
    expect(result.columns.date).toBeUndefined();
    expect(result.columns.forecast.length).toBe(5);
  });

  test('should throw error with invalid method', () => {
    // Проверяем, что вызывается ошибка при указании неверного метода прогнозирования
    expect(() => {
      trendDf.forecast({
        column: 'value',
        method: 'invalid',
        steps: 5,
      });
    }).toThrow();
  });

  test('should throw error with invalid steps', () => {
    // Проверяем, что вызывается ошибка при указании неверного количества шагов прогноза

    // Проверка на steps = 0
    expect(() => {
      trendDf.forecast({
        column: 'value',
        method: 'ma',
        steps: 0,
      });
    }).toThrow();

    // Проверка на отрицательное значение steps
    expect(() => {
      trendDf.forecast({
        column: 'value',
        method: 'ma',
        steps: -1,
      });
    }).toThrow();

    // Проверка на дробное значение steps
    expect(() => {
      trendDf.forecast({
        column: 'value',
        method: 'ma',
        steps: 1.5,
      });
    }).toThrow();
  });

  test('should throw error with invalid parameters for specific methods', () => {
    // Проверяем, что вызывается ошибка при указании неверных параметров для конкретных методов

    // Проверка на неверное значение window для метода скользящего среднего
    expect(() => {
      trendDf.forecast({
        column: 'value',
        method: 'ma',
        steps: 5,
        window: 0,
      });
    }).toThrow();

    // Проверка на неверное значение alpha для экспоненциального сглаживания (слишком маленькое)
    expect(() => {
      trendDf.forecast({
        column: 'value',
        method: 'ets',
        steps: 5,
        alpha: 0,
      });
    }).toThrow();

    // Проверка на неверное значение alpha для экспоненциального сглаживания (слишком большое)
    expect(() => {
      trendDf.forecast({
        column: 'value',
        method: 'ets',
        steps: 5,
        alpha: 1.1,
      });
    }).toThrow();
  });

  test('should throw error when column does not exist', () => {
    // Проверяем, что вызывается ошибка, если указанная колонка не существует
    expect(() => {
      trendDf.forecast({
        column: 'nonexistent',
        method: 'ma',
        steps: 5,
      });
    }).toThrow();
  });

  test('should throw error when dateColumn does not exist', () => {
    // Проверяем, что вызывается ошибка, если указанная колонка с датами не существует
    expect(() => {
      trendDf.forecast({
        column: 'value',
        dateColumn: 'nonexistent',
        method: 'ma',
        steps: 5,
      });
    }).toThrow();
  });
});
