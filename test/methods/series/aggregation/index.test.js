/**
 * Unit tests for Series aggregation methods index
 */

import { describe, test, expect } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series.js';
import * as aggregationMethods from '../../../../src/methods/series/aggregation/index.js';
import { registerSeriesAggregation } from '../../../../src/methods/series/aggregation/register.js';

// Register aggregation methods on Series
registerSeriesAggregation(Series);

// Test data for use in all tests
const testData = [10, 20, 30, 40, 50];

describe('Series Aggregation Methods Index', () => {
  // Create Series with test data
  const series = new Series(testData);

  test('should export aggregation methods register function', () => {
    // Check that register function is exported
    expect(aggregationMethods).toHaveProperty('register');
    expect(typeof aggregationMethods.register).toBe('function');
  });

  test('should successfully extend Series with aggregation methods', () => {
    // Check that all aggregation methods are available on the Series instance
    expect(typeof series.mean).toBe('function');
    expect(typeof series.sum).toBe('function');
    expect(typeof series.min).toBe('function');
    expect(typeof series.max).toBe('function');
    expect(typeof series.median).toBe('function');
    expect(typeof series.mode).toBe('function');
    expect(typeof series.std).toBe('function');
    expect(typeof series.variance).toBe('function');
    expect(typeof series.count).toBe('function');
    expect(typeof series.quantile).toBe('function');
    expect(typeof series.product).toBe('function');
    expect(typeof series.cumsum).toBe('function');
    expect(typeof series.cumprod).toBe('function');
  });

  test('should correctly calculate aggregation values', () => {
    // Test basic aggregation calculations
    expect(series.mean()).toBe(30); // (10+20+30+40+50)/5 = 30
    expect(series.sum()).toBe(150); // 10+20+30+40+50 = 150
    expect(series.min()).toBe(10);
    expect(series.max()).toBe(50);
    expect(series.count()).toBe(5);
  });
});
