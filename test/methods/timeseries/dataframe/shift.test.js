import { describe, expect, test, beforeAll } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame';
import registerDataFrameTimeSeries from '../../../../src/methods/timeseries/dataframe/register';

// Register timeseries methods before tests
beforeAll(() => {
  registerDataFrameTimeSeries(DataFrame);
  console.log('Apache Arrow integration initialized successfully');
});

describe('shift', () => {
  test('should shift values forward by default', () => {
    const df = DataFrame.create({
      A: [1, 2, 3, 4, 5],
      B: [10, 20, 30, 40, 50],
    });

    const result = df.shift();

    // Check that all columns are preserved
    expect(result.columns).toEqual(df.columns);

    // Check that values are shifted forward by 1 position (default)
    expect(result.col('A').toArray()).toEqual([null, 1, 2, 3, 4]);
    expect(result.col('B').toArray()).toEqual([null, 10, 20, 30, 40]);
  });

  test('should shift values forward with custom periods', () => {
    const df = DataFrame.create({
      A: [1, 2, 3, 4, 5],
      B: [10, 20, 30, 40, 50],
    });

    const result = df.shift(2);

    // Check that values are shifted forward by 2 positions
    expect(result.col('A').toArray()).toEqual([null, null, 1, 2, 3]);
    expect(result.col('B').toArray()).toEqual([null, null, 10, 20, 30]);
  });

  test('should shift values backward with negative periods', () => {
    const df = DataFrame.create({
      A: [1, 2, 3, 4, 5],
      B: [10, 20, 30, 40, 50],
    });

    const result = df.shift(-2);

    // Check that values are shifted backward by 2 positions
    expect(result.col('A').toArray()).toEqual([3, 4, 5, null, null]);
    expect(result.col('B').toArray()).toEqual([30, 40, 50, null, null]);
  });

  test('should use custom fill value', () => {
    const df = DataFrame.create({
      A: [1, 2, 3, 4, 5],
      B: [10, 20, 30, 40, 50],
    });

    const result = df.shift(1, 0);

    // Check that new positions are filled with the specified value (0)
    expect(result.col('A').toArray()).toEqual([0, 1, 2, 3, 4]);
    expect(result.col('B').toArray()).toEqual([0, 10, 20, 30, 40]);
  });
});

describe('pctChange', () => {
  test('should calculate percentage change with default periods', () => {
    const df = DataFrame.create({
      A: [1, 2, 4, 8, 16],
    });

    const result = df.pctChange();

    // Check that all columns are preserved
    expect(result.columns).toEqual(df.columns);

    // Check that percentage changes are calculated correctly
    // Formula: (current - previous) / previous
    const pctChanges = result.col('A').toArray();
    expect(pctChanges[0]).toBeNull(); // First value is always null
    expect(pctChanges[1]).toBeCloseTo((2 - 1) / 1); // 100%
    expect(pctChanges[2]).toBeCloseTo((4 - 2) / 2); // 100%
    expect(pctChanges[3]).toBeCloseTo((8 - 4) / 4); // 100%
    expect(pctChanges[4]).toBeCloseTo((16 - 8) / 8); // 100%
  });

  test('should calculate percentage change with custom periods', () => {
    const df = DataFrame.create({
      A: [1, 2, 4, 8, 16, 32],
    });

    const result = df.pctChange(2);

    // Check that percentage changes are calculated correctly with period 2
    const pctChanges = result.col('A').toArray();
    expect(pctChanges[0]).toBeNull(); // First two values are null
    expect(pctChanges[1]).toBeNull();
    expect(pctChanges[2]).toBeCloseTo((4 - 1) / 1); // 300%
    expect(pctChanges[3]).toBeCloseTo((8 - 2) / 2); // 300%
    expect(pctChanges[4]).toBeCloseTo((16 - 4) / 4); // 300%
    expect(pctChanges[5]).toBeCloseTo((32 - 8) / 8); // 300%
  });

  test('should handle zero values correctly', () => {
    const df = DataFrame.create({
      A: [0, 1, 0, 2, 0],
    });

    const result = df.pctChange();

    // Check that division by zero is handled correctly (should be null)
    const pctChanges = result.col('A').toArray();
    expect(pctChanges[0]).toBeNull();
    expect(pctChanges[1]).toBeNull(); // Division by zero should return null
    expect(pctChanges[2]).toBeCloseTo((0 - 1) / 1); // -100%
    expect(pctChanges[3]).toBeNull(); // Division by zero should return null
    expect(pctChanges[4]).toBeCloseTo((0 - 2) / 2); // -100%
  });

  test('should handle NaN values correctly', () => {
    const df = DataFrame.create({
      A: [1, NaN, 3, 4, NaN],
    });

    const result = df.pctChange();

    // Check that NaN values are handled correctly
    const pctChanges = result.col('A').toArray();
    expect(pctChanges[0]).toBeNull();
    expect(pctChanges[1]).toBeNull(); // NaN - 1 / 1 = NaN
    expect(pctChanges[2]).toBeNull(); // 3 - NaN / NaN = NaN
    expect(pctChanges[3]).toBeCloseTo((4 - 3) / 3); // 33.33%
    expect(pctChanges[4]).toBeNull(); // NaN - 4 / 4 = NaN
  });
});
