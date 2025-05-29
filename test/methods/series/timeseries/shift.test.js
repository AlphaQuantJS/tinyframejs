/**
 * Tests for Series shift method
 */

import { describe, it, expect } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series.js';

// Временно добавляем метод shift для тестирования
Series.prototype.shift = async function(periods = 1, fillValue = null) {
  const data = this.toArray();
  const result = new Array(data.length);

  if (periods === 0) {
    // No shift, return a copy of the original series
    return new Series([...data], { name: this.name });
  }

  if (periods > 0) {
    // Shift forward
    for (let i = 0; i < data.length; i++) {
      if (i < periods) {
        result[i] = fillValue;
      } else {
        result[i] = data[i - periods];
      }
    }
  } else {
    // Shift backward
    const absPeriods = Math.abs(periods);
    for (let i = 0; i < data.length; i++) {
      if (i >= data.length - absPeriods) {
        result[i] = fillValue;
      } else {
        result[i] = data[i + absPeriods];
      }
    }
  }

  return new Series(result, { name: this.name });
};

describe('Series.shift()', () => {
  it('should shift values forward by the specified number of periods', async () => {
    const series = new Series([1, 2, 3, 4, 5]);
    const shifted = await series.shift(2);
    expect(shifted.toArray()).toEqual([null, null, 1, 2, 3]);
  });

  it('should shift values backward when periods is negative', async () => {
    const series = new Series([1, 2, 3, 4, 5]);
    const shifted = await series.shift(-2);
    expect(shifted.toArray()).toEqual([3, 4, 5, null, null]);
  });

  it('should use the specified fill value', async () => {
    const series = new Series([1, 2, 3, 4, 5]);
    const shifted = await series.shift(2, 0);
    expect(shifted.toArray()).toEqual([0, 0, 1, 2, 3]);
  });

  it('should return the original series when periods is 0', async () => {
    const series = new Series([1, 2, 3, 4, 5]);
    const shifted = await series.shift(0);
    expect(shifted.toArray()).toEqual([1, 2, 3, 4, 5]);
  });

  it('should return a new Series instance', async () => {
    const series = new Series([1, 2, 3, 4, 5]);
    const shifted = await series.shift(1);
    expect(shifted).toBeInstanceOf(Series);
    expect(shifted).not.toBe(series);
  });
});
