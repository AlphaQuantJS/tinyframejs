import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../src/core/DataFrame.js';
import { createFrame } from '../../../src/core/createFrame.js';

describe('shift', () => {
  const data = {
    columns: {
      date: [
        '2023-01-01',
        '2023-01-02',
        '2023-01-03',
        '2023-01-04',
        '2023-01-05',
      ],
      value: [10, 20, 30, 40, 50],
      category: ['A', 'B', 'A', 'B', 'A'],
    },
    rowCount: 5,
    columnNames: ['date', 'value', 'category'],
  };

  const df = new DataFrame(data);

  test('should shift values forward by 1 period (default)', () => {
    const result = df.shift({
      columns: 'value',
    });

    expect(result.frame.columns.value_shift_1).toEqual([null, 10, 20, 30, 40]);
  });

  test('should shift values forward by 2 periods', () => {
    const result = df.shift({
      columns: 'value',
      periods: 2,
    });

    expect(result.frame.columns.value_shift_2).toEqual([
      null,
      null,
      10,
      20,
      30,
    ]);
  });

  test('should shift values backward by 1 period', () => {
    const result = df.shift({
      columns: 'value',
      periods: -1,
    });

    expect(result.frame.columns['value_shift_-1']).toEqual([
      20,
      30,
      40,
      50,
      null,
    ]);
  });

  test('should shift values backward by 2 periods', () => {
    const result = df.shift({
      columns: 'value',
      periods: -2,
    });

    expect(result.frame.columns['value_shift_-2']).toEqual([
      30,
      40,
      50,
      null,
      null,
    ]);
  });

  test('should not change values when periods is 0', () => {
    const result = df.shift({
      columns: 'value',
      periods: 0,
    });

    expect(result.frame.columns.value_shift_0).toEqual([10, 20, 30, 40, 50]);
  });

  test('should use custom fill value', () => {
    const result = df.shift({
      columns: 'value',
      periods: 1,
      fillValue: 0,
    });

    expect(result.frame.columns.value_shift_1).toEqual([0, 10, 20, 30, 40]);
  });

  test('should shift multiple columns', () => {
    const dfMulti = new DataFrame({
      columns: {
        date: ['2023-01-01', '2023-01-02', '2023-01-03'],
        value1: [10, 20, 30],
        value2: [100, 200, 300],
        category: ['A', 'B', 'A'],
      },
      rowCount: 3,
      columnNames: ['date', 'value1', 'value2', 'category'],
    });

    const result = dfMulti.shift({
      columns: ['value1', 'value2'],
      periods: 1,
    });

    expect(result.frame.columns.value1_shift_1).toEqual([null, 10, 20]);
    expect(result.frame.columns.value2_shift_1).toEqual([null, 100, 200]);
  });

  test('should handle empty DataFrame', () => {
    const emptyDf = new DataFrame({
      columns: {
        value: [],
        category: [],
      },
      rowCount: 0,
      columnNames: ['value', 'category'],
    });

    const result = emptyDf.shift({
      columns: 'value',
      periods: 1,
    });

    expect(result.frame.columns.value_shift_1).toEqual([]);
  });

  test('should throw error when column does not exist', () => {
    expect(() => {
      df.shift({
        columns: 'nonexistent',
        periods: 1,
      });
    }).toThrow();
  });
});

describe('pctChange', () => {
  const data = {
    columns: {
      date: [
        '2023-01-01',
        '2023-01-02',
        '2023-01-03',
        '2023-01-04',
        '2023-01-05',
      ],
      value: [100, 110, 99, 120, 125],
      category: ['A', 'B', 'A', 'B', 'A'],
    },
    rowCount: 5,
    columnNames: ['date', 'value', 'category'],
  };

  const df = new DataFrame(data);

  test('should calculate percentage change with period 1 (default)', () => {
    const result = df.pctChange({
      columns: 'value',
    });

    expect(result.frame.columns.value_pct_change_1[0]).toBeNaN();
    expect(result.frame.columns.value_pct_change_1[1]).toBeCloseTo(0.1); // (110-100)/100 = 0.1
    expect(result.frame.columns.value_pct_change_1[2]).toBeCloseTo(-0.1); // (99-110)/110 = -0.1
    expect(result.frame.columns.value_pct_change_1[3]).toBeCloseTo(0.2121); // (120-99)/99 = 0.2121
    expect(result.frame.columns.value_pct_change_1[4]).toBeCloseTo(0.0417); // (125-120)/120 = 0.0417
  });

  test('should calculate percentage change with period 2', () => {
    const result = df.pctChange({
      columns: 'value',
      periods: 2,
    });

    expect(result.frame.columns.value_pct_change_2[0]).toBeNaN();
    expect(result.frame.columns.value_pct_change_2[1]).toBeNaN();
    expect(result.frame.columns.value_pct_change_2[2]).toBeCloseTo(-0.01); // (99-100)/100 = -0.01
    expect(result.frame.columns.value_pct_change_2[3]).toBeCloseTo(0.0909); // (120-110)/110 = 0.0909
    expect(result.frame.columns.value_pct_change_2[4]).toBeCloseTo(0.2626); // (125-99)/99 = 0.2626
  });

  test('should handle zero values correctly', () => {
    const dfWithZero = new DataFrame({
      columns: {
        value: [0, 10, 20, 0, 30],
        category: ['A', 'B', 'A', 'B', 'A'],
      },
      rowCount: 5,
      columnNames: ['value', 'category'],
    });

    const result = dfWithZero.pctChange({
      columns: 'value',
    });

    expect(result.frame.columns.value_pct_change_1[0]).toBeNaN();
    expect(result.frame.columns.value_pct_change_1[1]).toBeNaN(); // (10-0)/0 = NaN (division by zero)
    expect(result.frame.columns.value_pct_change_1[2]).toBeCloseTo(1); // (20-10)/10 = 1
    expect(result.frame.columns.value_pct_change_1[3]).toBeCloseTo(-1); // (0-20)/20 = -1
    expect(result.frame.columns.value_pct_change_1[4]).toBeNaN(); // (30-0)/0 = NaN (division by zero)
  });

  test('should handle NaN values correctly', () => {
    const dfWithNaN = new DataFrame({
      columns: {
        value: [10, NaN, 20, 30, NaN],
        category: ['A', 'B', 'A', 'B', 'A'],
      },
      rowCount: 5,
      columnNames: ['value', 'category'],
    });

    const result = dfWithNaN.pctChange({
      columns: 'value',
    });

    expect(result.frame.columns.value_pct_change_1[0]).toBeNaN();
    expect(result.frame.columns.value_pct_change_1[1]).toBeNaN(); // (NaN-10)/10 = NaN
    expect(result.frame.columns.value_pct_change_1[2]).toBeNaN(); // (20-NaN)/NaN = NaN
    expect(result.frame.columns.value_pct_change_1[3]).toBeCloseTo(0.5); // (30-20)/20 = 0.5
    expect(result.frame.columns.value_pct_change_1[4]).toBeNaN(); // (NaN-30)/30 = NaN
  });

  test('should fill first periods with 0 when fillNaN is false', () => {
    const result = df.pctChange({
      columns: 'value',
      fillNaN: false,
    });

    expect(result.frame.columns.value_pct_change_1[0]).toEqual(0);
    expect(result.frame.columns.value_pct_change_1[1]).toBeCloseTo(0.1);
  });

  test('should calculate percentage change for multiple columns', () => {
    const dfMulti = new DataFrame({
      columns: {
        date: ['2023-01-01', '2023-01-02', '2023-01-03'],
        price: [100, 110, 105],
        volume: [1000, 1200, 900],
        category: ['A', 'B', 'A'],
      },
      rowCount: 3,
      columnNames: ['date', 'price', 'volume', 'category'],
    });

    const result = dfMulti.pctChange({
      columns: ['price', 'volume'],
    });

    expect(result.frame.columns.price_pct_change_1[0]).toBeNaN();
    expect(result.frame.columns.price_pct_change_1[1]).toBeCloseTo(0.1); // (110-100)/100 = 0.1
    expect(result.frame.columns.price_pct_change_1[2]).toBeCloseTo(-0.0455); // (105-110)/110 = -0.0455

    expect(result.frame.columns.volume_pct_change_1[0]).toBeNaN();
    expect(result.frame.columns.volume_pct_change_1[1]).toBeCloseTo(0.2); // (1200-1000)/1000 = 0.2
    expect(result.frame.columns.volume_pct_change_1[2]).toBeCloseTo(-0.25); // (900-1200)/1200 = -0.25
  });
});
