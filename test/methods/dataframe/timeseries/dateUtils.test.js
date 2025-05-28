import { describe, test, expect } from 'vitest';
import {
  testWithBothStorageTypes,
  createDataFrameWithStorage,
} from '../../../utils/storageTestUtils.js';
import {
  parseDate,
  truncateDate,
  getNextDate,
  formatDateISO,
  isSamePeriod,
  dateRange,
  addTime,
  subtractTime,
  dateDiff,
  formatDate,
  parseDateFormat,
  businessDayStart,
  businessDayEnd,
  isWeekend,
  nextBusinessDay,
} from '../../../../src/methods/dataframe/timeseries/dateUtils.js';

// Тестовые данные для использования во всех тестах
const testData = [
  { value: 10, category: 'A', mixed: '20' },
  { value: 20, category: 'B', mixed: 30 },
  { value: 30, category: 'A', mixed: null },
  { value: 40, category: 'C', mixed: undefined },
  { value: 50, category: 'B', mixed: NaN },
];

describe('Date Utilities', () => {
  // Запускаем тесты с обоими типами хранилища
  testWithBothStorageTypes((storageType) => {
    describe(`with ${storageType} storage`, () => {
      // Создаем DataFrame с указанным типом хранилища
      const df = createDataFrameWithStorage(DataFrame, testData, storageType);

      test('parseDate correctly parses various date formats', () => {
        // Test with Date object
        const dateObj = new Date(2023, 0, 1); // Jan 1, 2023
        expect(parseDate(dateObj)).toEqual(dateObj);

        // Test with timestamp
        const timestamp = new Date(2023, 0, 1).getTime();
        expect(parseDate(timestamp)).toEqual(new Date(timestamp));

        // Test with ISO string
        expect(parseDate('2023-01-01')).toEqual(new Date('2023-01-01'));

        // Test with invalid format
        expect(() => parseDate('invalid-date')).toThrow();
      });

      test('truncateDate truncates dates to the start of periods', () => {
        const date = new Date(2023, 5, 15, 12, 30, 45); // June 15, 2023, 12:30:45

        // Test day truncation
        const dayStart = truncateDate(date, 'D');
        expect(dayStart.getHours()).toBe(0);
        expect(dayStart.getMinutes()).toBe(0);
        expect(dayStart.getSeconds()).toBe(0);
        expect(dayStart.getMilliseconds()).toBe(0);

        // Test week truncation (to Sunday)
        const weekStart = truncateDate(date, 'W');
        expect(weekStart.getDay()).toBe(0); // Sunday

        // Test month truncation
        const monthStart = truncateDate(date, 'M');
        expect(monthStart.getDate()).toBe(1);
        expect(monthStart.getHours()).toBe(0);

        // Test quarter truncation
        const quarterStart = truncateDate(date, 'Q');
        expect(quarterStart.getMonth()).toBe(3); // April (Q2 starts in April)
        expect(quarterStart.getDate()).toBe(1);

        // Test year truncation
        const yearStart = truncateDate(date, 'Y');
        expect(yearStart.getMonth()).toBe(0); // January
        expect(yearStart.getDate()).toBe(1);

        // Test invalid frequency
        expect(() => truncateDate(date, 'invalid')).toThrow();
      });

      test('getNextDate returns the next date in the sequence', () => {
        const date = new Date(2023, 0, 1); // Jan 1, 2023

        // Test day increment
        const nextDay = getNextDate(date, 'D');
        expect(nextDay.getDate()).toBe(2);

        // Test week increment
        const nextWeek = getNextDate(date, 'W');
        expect(nextWeek.getDate()).toBe(8);

        // Test month increment
        const nextMonth = getNextDate(date, 'M');
        expect(nextMonth.getMonth()).toBe(1); // February

        // Test quarter increment
        const nextQuarter = getNextDate(date, 'Q');
        expect(nextQuarter.getMonth()).toBe(3); // April

        // Test year increment
        const nextYear = getNextDate(date, 'Y');
        expect(nextYear.getFullYear()).toBe(2024);

        // Test invalid frequency
        expect(() => getNextDate(date, 'invalid')).toThrow();
      });

      test('formatDateISO formats dates as ISO strings without time component', () => {
        const date = new Date(2023, 0, 1); // Jan 1, 2023
        expect(formatDateISO(date)).toBe('2023-01-01');
      });

      test('isSamePeriod checks if dates are in the same period', () => {
        const date1 = new Date(2023, 0, 1); // Jan 1, 2023
        const date2 = new Date(2023, 0, 15); // Jan 15, 2023
        const date3 = new Date(2023, 1, 1); // Feb 1, 2023

        // Same month
        expect(isSamePeriod(date1, date2, 'M')).toBe(true);
        // Different months
        expect(isSamePeriod(date1, date3, 'M')).toBe(false);
        // Same quarter
        expect(isSamePeriod(date1, date3, 'Q')).toBe(true);
        // Same year
        expect(isSamePeriod(date1, date3, 'Y')).toBe(true);
      });

      test('dateRange generates a sequence of dates', () => {
        const start = new Date(2023, 0, 1); // Jan 1, 2023
        const end = new Date(2023, 2, 1); // Mar 1, 2023

        // Monthly range
        const monthlyRange = dateRange(start, end, 'M');
        expect(monthlyRange.length).toBe(3); // Jan, Feb, Mar
        expect(monthlyRange[0].getMonth()).toBe(0); // January
        expect(monthlyRange[1].getMonth()).toBe(1); // February
        expect(monthlyRange[2].getMonth()).toBe(2); // March

        // Daily range for a shorter period
        const start2 = new Date(2023, 0, 1); // Jan 1, 2023
        const end2 = new Date(2023, 0, 5); // Jan 5, 2023
        const dailyRange = dateRange(start2, end2, 'D');
        expect(dailyRange.length).toBe(5); // 5 days
      });

      test('addTime adds time units to a date', () => {
        const date = new Date(2023, 0, 1); // Jan 1, 2023

        // Add days
        expect(addTime(date, 5, 'days').getDate()).toBe(6);

        // Add weeks
        expect(addTime(date, 1, 'weeks').getDate()).toBe(8);

        // Add months
        expect(addTime(date, 2, 'months').getMonth()).toBe(2); // March

        // Add quarters
        expect(addTime(date, 1, 'quarters').getMonth()).toBe(3); // April

        // Add years
        expect(addTime(date, 1, 'years').getFullYear()).toBe(2024);

        // Test invalid unit
        expect(() => addTime(date, 1, 'invalid')).toThrow();
      });

      test('subtractTime subtracts time units from a date', () => {
        const date = new Date(2023, 6, 15); // July 15, 2023

        // Subtract days
        expect(subtractTime(date, 5, 'days').getDate()).toBe(10);

        // Subtract weeks
        expect(subtractTime(date, 1, 'weeks').getDate()).toBe(8);

        // Subtract months
        expect(subtractTime(date, 2, 'months').getMonth()).toBe(4); // May

        // Subtract quarters
        expect(subtractTime(date, 1, 'quarters').getMonth()).toBe(3); // April

        // Subtract years
        expect(subtractTime(date, 1, 'years').getFullYear()).toBe(2022);
      });

      test('dateDiff calculates the difference between dates', () => {
        const date1 = new Date(2023, 0, 1); // Jan 1, 2023
        const date2 = new Date(2023, 0, 8); // Jan 8, 2023
        const date3 = new Date(2023, 3, 1); // Apr 1, 2023
        const date4 = new Date(2024, 0, 1); // Jan 1, 2024

        // Difference in days
        expect(dateDiff(date1, date2, 'days')).toBe(7);

        // Difference in weeks
        expect(dateDiff(date1, date2, 'weeks')).toBe(1);

        // Difference in months
        expect(dateDiff(date1, date3, 'months')).toBe(3);

        // Difference in quarters
        expect(dateDiff(date1, date3, 'quarters')).toBe(1);

        // Difference in years
        expect(dateDiff(date1, date4, 'years')).toBe(1);

        // Test invalid unit
        expect(() => dateDiff(date1, date2, 'invalid')).toThrow();
      });

      test('formatDate formats dates according to the specified format', () => {
        const date = new Date(2023, 0, 1, 14, 30, 45); // Jan 1, 2023, 14:30:45

        // Default format (YYYY-MM-DD)
        expect(formatDate(date)).toBe('2023-01-01');

        // Custom formats
        expect(formatDate(date, 'DD/MM/YYYY')).toBe('01/01/2023');
        expect(formatDate(date, 'MM/DD/YY')).toBe('01/01/23');
        expect(formatDate(date, 'YYYY-MM-DD HH:mm:ss')).toBe(
          '2023-01-01 14:30:45',
        );
        expect(formatDate(date, 'D/M/YYYY')).toBe('1/1/2023');
        expect(formatDate(date, 'HH:mm')).toBe('14:30');
      });

      test('parseDateFormat parses dates according to the specified format', () => {
        // Default format (YYYY-MM-DD)
        const date1 = parseDateFormat('2023-01-01');
        expect(date1.getFullYear()).toBe(2023);
        expect(date1.getMonth()).toBe(0); // January
        expect(date1.getDate()).toBe(1);

        // Custom formats
        const date2 = parseDateFormat('01/01/2023', 'DD/MM/YYYY');
        expect(date2.getFullYear()).toBe(2023);
        expect(date2.getMonth()).toBe(0); // January
        expect(date2.getDate()).toBe(1);

        const date3 = parseDateFormat('01/01/23', 'MM/DD/YY');
        expect(date3.getFullYear()).toBe(2023);
        expect(date3.getMonth()).toBe(0); // January
        expect(date3.getDate()).toBe(1);

        const date4 = parseDateFormat(
          '2023-01-01 14:30:45',
          'YYYY-MM-DD HH:mm:ss',
        );
        expect(date4.getHours()).toBe(14);
        expect(date4.getMinutes()).toBe(30);
        expect(date4.getSeconds()).toBe(45);

        // Test invalid format
        expect(() => parseDateFormat('2023-01-01', 'MM/DD/YYYY')).toThrow();
      });

      test('businessDayStart returns the start of a business day', () => {
        const date = new Date(2023, 0, 1); // Jan 1, 2023
        const businessStart = businessDayStart(date);

        expect(businessStart.getHours()).toBe(9);
        expect(businessStart.getMinutes()).toBe(30);
        expect(businessStart.getSeconds()).toBe(0);
        expect(businessStart.getMilliseconds()).toBe(0);
      });

      test('businessDayEnd returns the end of a business day', () => {
        const date = new Date(2023, 0, 1); // Jan 1, 2023
        const businessEnd = businessDayEnd(date);

        expect(businessEnd.getHours()).toBe(16);
        expect(businessEnd.getMinutes()).toBe(0);
        expect(businessEnd.getSeconds()).toBe(0);
        expect(businessEnd.getMilliseconds()).toBe(0);
      });

      test('isWeekend checks if a date is a weekend', () => {
        // January 1, 2023 was a Sunday
        const sunday = new Date(2023, 0, 1);
        expect(isWeekend(sunday)).toBe(true);

        // January 7, 2023 was a Saturday
        const saturday = new Date(2023, 0, 7);
        expect(isWeekend(saturday)).toBe(true);

        // January 2, 2023 was a Monday
        const monday = new Date(2023, 0, 2);
        expect(isWeekend(monday)).toBe(false);
      });

      test('nextBusinessDay returns the next business day', () => {
        // January 1, 2023 was a Sunday, next business day should be Monday, January 2
        const sunday = new Date(2023, 0, 1);
        const nextBizDay1 = nextBusinessDay(sunday);
        expect(nextBizDay1.getDate()).toBe(2);
        expect(nextBizDay1.getDay()).toBe(1); // Monday

        // January 6, 2023 was a Friday, next business day should be Monday, January 9
        const friday = new Date(2023, 0, 6);
        const nextBizDay2 = nextBusinessDay(friday);
        expect(nextBizDay2.getDate()).toBe(9);
        expect(nextBizDay2.getDay()).toBe(1); // Monday
      });
    });
  });
});
