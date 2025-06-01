import { describe, expect, test } from 'vitest';
import {
  inferFrequency,
  inferFrequencyFromData,
} from '../../../../src/methods/timeseries/alltypes/inferFrequency.js';
import { Series } from '../../../../src/core/dataframe/Series.js';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';

describe('inferFrequency', () => {
  test('should infer daily frequency', () => {
    const dates = [
      new Date('2023-01-01'),
      new Date('2023-01-02'),
      new Date('2023-01-03'),
      new Date('2023-01-04'),
      new Date('2023-01-05'),
    ];

    expect(inferFrequency(dates)).toBe('D');
  });

  test('should infer weekly frequency', () => {
    const dates = [
      new Date('2023-01-01'),
      new Date('2023-01-08'),
      new Date('2023-01-15'),
      new Date('2023-01-22'),
      new Date('2023-01-29'),
    ];

    expect(inferFrequency(dates)).toBe('W');
  });

  test('should infer monthly frequency', () => {
    const dates = [
      new Date('2023-01-01'),
      new Date('2023-02-01'),
      new Date('2023-03-01'),
      new Date('2023-04-01'),
      new Date('2023-05-01'),
    ];

    expect(inferFrequency(dates)).toBe('M');
  });

  test('should infer quarterly frequency', () => {
    const dates = [
      new Date('2023-01-01'),
      new Date('2023-04-01'),
      new Date('2023-07-01'),
      new Date('2023-10-01'),
      new Date('2024-01-01'),
    ];

    expect(inferFrequency(dates)).toBe('Q');
  });

  test('should infer yearly frequency', () => {
    const dates = [
      new Date('2020-01-01'),
      new Date('2021-01-01'),
      new Date('2022-01-01'),
      new Date('2023-01-01'),
      new Date('2024-01-01'),
    ];

    expect(inferFrequency(dates)).toBe('Y');
  });

  test('should handle irregular dates', () => {
    const dates = [
      new Date('2023-01-01'),
      new Date('2023-01-03'), // Skip a day
      new Date('2023-01-04'),
      new Date('2023-01-05'),
      new Date('2023-01-08'), // Skip two days
    ];

    expect(inferFrequency(dates)).toBe('D'); // Still infer as daily with gaps
  });

  test('should handle invalid dates', () => {
    const dates = [
      new Date('2023-01-01'),
      new Date('invalid date'), // Invalid date
      new Date('2023-01-03'),
      null, // null
      new Date('2023-01-05'),
    ];

    expect(inferFrequency(dates)).toBe('D'); // Should filter out invalid dates
  });

  test('should return null for insufficient data', () => {
    // Only one date
    expect(inferFrequency([new Date('2023-01-01')])).toBeNull();

    // Empty array
    expect(inferFrequency([])).toBeNull();

    // null
    expect(inferFrequency(null)).toBeNull();
  });
});

describe('inferFrequencyFromData', () => {
  test('should infer frequency from Series', () => {
    const dates = [
      new Date('2023-01-01'),
      new Date('2023-01-02'),
      new Date('2023-01-03'),
      new Date('2023-01-04'),
      new Date('2023-01-05'),
    ];

    const series = Series.create(dates, { name: 'dates' });

    expect(inferFrequencyFromData(series)).toBe('D');
  });

  test('should infer frequency from DataFrame with date column', () => {
    // Create dates with a precise interval of 30 days (month)
    const dates = [
      new Date('2023-01-01T00:00:00Z'),
      new Date('2023-02-01T00:00:00Z'),
      new Date('2023-03-01T00:00:00Z'),
      new Date('2023-04-01T00:00:00Z'),
      new Date('2023-05-01T00:00:00Z'),
    ];

    const values = [10, 20, 30, 40, 50];

    const df = DataFrame.create({
      date: dates,
      value: values,
    });

    // Verify that dates are correctly stored in the DataFrame
    const dateColumn = df.col('date');
    expect(dateColumn).toBeDefined();
    expect(dateColumn.length).toBe(5);
    expect(dateColumn.get(0) instanceof Date).toBe(true);

    // Manual verification of the inferFrequency function with dates from the column
    const dateValues = dateColumn.toArray();
    console.log('Date values from column:', dateValues);
    const frequency = inferFrequency(dateValues);
    console.log('Direct frequency inference:', frequency);

    // Testing the inferFrequencyFromData function
    const result = inferFrequencyFromData(df, 'date');
    console.log('inferFrequencyFromData result:', result);

    expect(result).toBe('M');
  });

  test('should auto-detect date column in DataFrame', () => {
    // Create dates with a precise interval of 7 days (week)
    const dates = [
      new Date('2023-01-01T00:00:00Z'),
      new Date('2023-01-08T00:00:00Z'),
      new Date('2023-01-15T00:00:00Z'),
      new Date('2023-01-22T00:00:00Z'),
      new Date('2023-01-29T00:00:00Z'),
    ];

    const values = [10, 20, 30, 40, 50];

    const df = DataFrame.create({
      timestamp: dates,
      value: values,
    });

    // Verify that dates are correctly stored in the DataFrame
    const timestampColumn = df.col('timestamp');
    expect(timestampColumn).toBeDefined();
    expect(timestampColumn.length).toBe(5);
    expect(timestampColumn.get(0) instanceof Date).toBe(true);

    // Verify that the difference between dates is 7 days (604800000 ms)
    const diff = timestampColumn.get(1) - timestampColumn.get(0);
    expect(diff).toBe(7 * 24 * 60 * 60 * 1000);

    // Debug automatic detection of the date column
    console.log('DataFrame columns:', df.columns);
    console.log('First row of timestamp column:', timestampColumn.get(0));

    // Testing the inferFrequencyFromData function without specifying a column
    const result = inferFrequencyFromData(df);
    console.log('inferFrequencyFromData auto-detect result:', result);

    expect(result).toBe('W');
  });

  test('should return null for DataFrame with no date column', () => {
    const values1 = [10, 20, 30, 40, 50];
    const values2 = [1, 2, 3, 4, 5];

    const df = DataFrame.create({
      value1: values1,
      value2: values2,
    });

    expect(inferFrequencyFromData(df)).toBeNull();
  });
});
