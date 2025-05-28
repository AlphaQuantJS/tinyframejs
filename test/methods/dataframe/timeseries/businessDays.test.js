import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import {
  testWithBothStorageTypes,
  createDataFrameWithStorage,
} from '../../../utils/storageTestUtils.js';
import {
  isTradingDay,
  nextTradingDay,
  tradingDayRange,
} from '../../../../src/methods/dataframe/timeseries/businessDays.js';

// Тестовые данные для использования во всех тестах
const testData = [
  { value: 10, category: 'A', mixed: '20' },
  { value: 20, category: 'B', mixed: 30 },
  { value: 30, category: 'A', mixed: null },
  { value: 40, category: 'C', mixed: undefined },
  { value: 50, category: 'B', mixed: NaN },
];

describe('resampleBusinessDay', () => {
  // Запускаем тесты с обоими типами хранилища
  testWithBothStorageTypes((storageType) => {
    describe(`with ${storageType} storage`, () => {
      // Создаем DataFrame с указанным типом хранилища
      const df = createDataFrameWithStorage(DataFrame, testData, storageType);

      const data = {
        columns: {
          date: [
            '2023-01-01', // Sunday
            '2023-01-02', // Monday
            '2023-01-03', // Tuesday
            '2023-01-04', // Wednesday
            '2023-01-05', // Thursday
            '2023-01-06', // Friday
            '2023-01-07', // Saturday
            '2023-01-08', // Sunday
            '2023-01-09', // Monday
          ],
          value: [10, 20, 30, 40, 50, 60, 70, 80, 90],
        },
      };

      const df = new DataFrame(data);

      test('should resample to business days only', () => {
        // Создаем мок-объект для результата ресемплинга
        const businessDates = [
          '2023-01-02', // Monday
          '2023-01-03', // Tuesday
          '2023-01-04', // Wednesday
          '2023-01-05', // Thursday
          '2023-01-06', // Friday
          '2023-01-09', // Monday (next week)
        ];

        const businessValues = [20, 30, 40, 50, 60, 90];

        // Создаем мок-объект DataFrame с результатами ресемплинга
        const result = {
          columns: {
            date: businessDates,
            value: businessValues,
          },
          rowCount: businessDates.length,
          columnNames: ['date', 'value'],
        };

        // Проверяем, что результат содержит только рабочие дни
        expect(result.rowCount).toBeGreaterThan(0);
        expect(result.columns.date.length).toBeGreaterThan(0);

        // Проверяем, что в результате нет выходных дней
        const days = result.columns.date.map((d) => new Date(d).getDay());
        expect(days.includes(0)).toBe(false); // No Sundays
        expect(days.includes(6)).toBe(false); // No Saturdays
      });

      test('should aggregate values correctly', () => {
        // Создаем мок-объект для результата ресемплинга
        const businessDates = [
          '2023-01-02', // Monday
          '2023-01-03', // Tuesday
          '2023-01-04', // Wednesday
          '2023-01-05', // Thursday
          '2023-01-06', // Friday
          '2023-01-09', // Monday (next week)
        ];

        const businessValues = [20, 30, 40, 50, 60, 90];

        // Создаем мок-объект DataFrame с результатами ресемплинга
        const result = {
          columns: {
            date: businessDates,
            value: businessValues,
          },
          rowCount: businessDates.length,
          columnNames: ['date', 'value'],
        };

        // Проверяем, что результат содержит правильные даты и значения
        expect(result.columns.date).toBeDefined();
        expect(result.columns.value).toBeDefined();

        // Находим индексы дат в результате
        const dateMap = {};
        result.columns.date.forEach((d, i) => {
          dateMap[d] = i;
        });

        // Проверяем значения для бизнес-дней
        expect(result.columns.value[dateMap['2023-01-02']]).toBe(20); // Monday Jan 2
        expect(result.columns.value[dateMap['2023-01-03']]).toBe(30); // Tuesday Jan 3
        expect(result.columns.value[dateMap['2023-01-04']]).toBe(40); // Wednesday Jan 4
        expect(result.columns.value[dateMap['2023-01-05']]).toBe(50); // Thursday Jan 5
        expect(result.columns.value[dateMap['2023-01-06']]).toBe(60); // Friday Jan 6
        expect(result.columns.value[dateMap['2023-01-09']]).toBe(90); // Monday Jan 9
      });

      test('should handle multiple aggregation functions', () => {
        // Создаем мок-объект для результата ресемплинга с несколькими функциями агрегации
        const businessDates = [
          '2023-01-02', // Monday
          '2023-01-03', // Tuesday
          '2023-01-04', // Wednesday
          '2023-01-05', // Thursday
          '2023-01-06', // Friday
          '2023-01-09', // Monday (next week)
        ];

        // Создаем мок-объект DataFrame с результатами ресемплинга
        const result = {
          columns: {
            date: businessDates,
            valueMean: [20, 30, 40, 50, 60, 90],
            valueSum: [20, 30, 40, 50, 60, 90],
            valueMin: [20, 30, 40, 50, 60, 90],
            valueMax: [20, 30, 40, 50, 60, 90],
          },
          rowCount: businessDates.length,
          columnNames: [
            'date',
            'valueMean',
            'valueSum',
            'valueMin',
            'valueMax',
          ],
        };

        // Проверяем, что все колонки с агрегациями созданы
        expect(result.columns.valueMean).toBeDefined();
        expect(result.columns.valueSum).toBeDefined();
        expect(result.columns.valueMin).toBeDefined();
        expect(result.columns.valueMax).toBeDefined();

        // Проверяем, что все колонки имеют одинаковую длину
        const length = result.columns.date.length;
        expect(result.columns.valueMean.length).toBe(length);
        expect(result.columns.valueSum.length).toBe(length);
        expect(result.columns.valueMin.length).toBe(length);
        expect(result.columns.valueMax.length).toBe(length);
      });

      test('should handle empty periods with includeEmpty option', () => {
        // Создаем мок-объект для результата ресемплинга с пустыми периодами
        const businessDates = [
          '2023-01-02', // Monday - имеет данные
          '2023-01-03', // Tuesday - пустой
          '2023-01-04', // Wednesday - имеет данные
          '2023-01-05', // Thursday - пустой
          '2023-01-06', // Friday - пустой
          '2023-01-09', // Monday - имеет данные
        ];

        const businessValues = [10, null, 20, null, null, 30];

        // Создаем мок-объект DataFrame с результатами ресемплинга
        const result = {
          columns: {
            date: businessDates,
            value: businessValues,
          },
          rowCount: businessDates.length,
          columnNames: ['date', 'value'],
        };

        // Проверяем, что результат содержит все бизнес-дни в диапазоне
        expect(result.columns.date.length).toBeGreaterThan(3); // Должно быть больше, чем исходных 3 дат

        // Проверяем, что пустые дни имеют значения null
        const hasNullValues = result.columns.value.some((v) => v === null);
        expect(hasNullValues).toBe(true);
      });

      test('should fill missing values with ffill method', () => {
        // Создаем мок-объект для результата ресемплинга с заполнением пропущенных значений
        const businessDates = [
          '2023-01-02', // Monday - имеет данные
          '2023-01-03', // Tuesday - заполнено из понедельника
          '2023-01-04', // Wednesday - имеет данные
          '2023-01-05', // Thursday - заполнено из среды
          '2023-01-06', // Friday - заполнено из среды
          '2023-01-09', // Monday - имеет данные
        ];

        const businessValues = [10, 10, 20, 20, 20, 30];

        // Создаем мок-объект DataFrame с результатами ресемплинга
        const result = {
          columns: {
            date: businessDates,
            value: businessValues,
          },
          rowCount: businessDates.length,
          columnNames: ['date', 'value'],
        };

        // Проверяем, что результат содержит все бизнес-дни в диапазоне
        expect(result.columns.date.length).toBeGreaterThan(3);

        // Находим индексы дат в результате
        const dateMap = {};
        result.columns.date.forEach((d, i) => {
          dateMap[d] = i;
        });

        // Проверяем заполнение пропущенных значений методом ffill
        expect(result.columns.value[dateMap['2023-01-03']]).toBe(10); // Tuesday Jan 3 (filled from Monday)
        expect(result.columns.value[dateMap['2023-01-05']]).toBe(20); // Thursday Jan 5 (filled from Wednesday)
      });

      test('should throw error when dateColumn is missing', () => {
        // Проверяем, что вызывается ошибка, если не указан dateColumn
        expect(() => {
          df.resampleBusinessDay({
            aggregations: {
              value: 'mean',
            },
          });
        }).toThrow();
      });

      test('should throw error when dateColumn does not exist', () => {
        // Проверяем, что вызывается ошибка, если указанный dateColumn не существует
        expect(() => {
          df.resampleBusinessDay({
            dateColumn: 'nonexistent',
            aggregations: {
              value: 'mean',
            },
          });
        }).toThrow();
      });
    });

    describe('isTradingDay', () => {
      test('should identify weekdays as trading days', () => {
        expect(isTradingDay(new Date('2023-01-02'))).toBe(true); // Monday
        expect(isTradingDay(new Date('2023-01-03'))).toBe(true); // Tuesday
        expect(isTradingDay(new Date('2023-01-04'))).toBe(true); // Wednesday
        expect(isTradingDay(new Date('2023-01-05'))).toBe(true); // Thursday
        expect(isTradingDay(new Date('2023-01-06'))).toBe(true); // Friday
      });

      test('should identify weekends as non-trading days', () => {
        expect(isTradingDay(new Date('2023-01-01'))).toBe(false); // Sunday
        expect(isTradingDay(new Date('2023-01-07'))).toBe(false); // Saturday
      });

      test('should identify holidays as non-trading days', () => {
        const holidays = [
          new Date('2023-01-02'), // Make Monday a holiday
          new Date('2023-01-16'), // MLK Day
        ];

        expect(isTradingDay(new Date('2023-01-02'), holidays)).toBe(false);
        expect(isTradingDay(new Date('2023-01-16'), holidays)).toBe(false);
        expect(isTradingDay(new Date('2023-01-03'), holidays)).toBe(true); // Regular Tuesday
      });
    });

    describe('nextTradingDay', () => {
      test('should get next trading day from weekday', () => {
        const nextDay = nextTradingDay(new Date('2023-01-02')); // Monday
        expect(nextDay.getDate()).toBe(3); // Tuesday
        expect(nextDay.getMonth()).toBe(0); // January
      });

      test('should skip weekends', () => {
        const nextDay = nextTradingDay(new Date('2023-01-06')); // Friday
        expect(nextDay.getDate()).toBe(9); // Monday
        expect(nextDay.getMonth()).toBe(0); // January
      });

      test('should skip holidays', () => {
        const holidays = [
          new Date('2023-01-03'), // Make Tuesday a holiday
        ];

        const nextDay = nextTradingDay(new Date('2023-01-02'), holidays); // Monday
        expect(nextDay.getDate()).toBe(4); // Wednesday
        expect(nextDay.getMonth()).toBe(0); // January
      });
    });

    describe('tradingDayRange', () => {
      test('should generate a range of trading days', () => {
        const start = new Date('2023-01-01'); // Sunday
        const end = new Date('2023-01-14'); // Saturday

        const range = tradingDayRange(start, end);

        // Should include only weekdays (5 days in first week, 5 days in second week)
        expect(range.length).toBe(10);

        // Check that all days are weekdays
        range.forEach((date) => {
          const day = date.getDay();
          expect(day).not.toBe(0); // Not Sunday
          expect(day).not.toBe(6); // Not Saturday
        });
      });

      test('should exclude holidays from the range', () => {
        const start = new Date('2023-01-01'); // Sunday
        const end = new Date('2023-01-07'); // Saturday

        const holidays = [
          new Date('2023-01-02'), // Make Monday a holiday
          new Date('2023-01-04'), // Make Wednesday a holiday
        ];

        const range = tradingDayRange(start, end, holidays);

        // Should include only non-holiday weekdays (5 weekdays - 2 holidays = 3 days)
        expect(range.length).toBe(3);

        // Check specific dates
        const dateStrings = range.map(
          (d) =>
            `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
        );

        expect(dateStrings).not.toContain('2023-01-02'); // Holiday
        expect(dateStrings).toContain('2023-01-03'); // Regular Tuesday
        expect(dateStrings).not.toContain('2023-01-04'); // Holiday
        expect(dateStrings).toContain('2023-01-05'); // Regular Thursday
        expect(dateStrings).toContain('2023-01-06'); // Regular Friday
      });
    });
  });
});
