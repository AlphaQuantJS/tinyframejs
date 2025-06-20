/**
 * Unit tests for aggregation methods index
 *
 * ▸ Core library:  @tinyframejs/core
 *
 * ─────────────────────────────────────────────────────────
 */

import { describe, test, expect, beforeAll } from 'vitest';
import { DataFrame } from '@tinyframejs/core';

// Test data for use in all tests
const testData = [
  { value: 10, category: 'A', mixed: '20' },
  { value: 20, category: 'B', mixed: 30 },
  { value: 30, category: 'A', mixed: null },
  { value: 40, category: 'C', mixed: undefined },
  { value: 50, category: 'B', mixed: NaN },
];

describe('Aggregation Methods Index', () => {
  let df;

  beforeAll(() => {
    df = DataFrame.fromRecords(testData);
  });

  describe('DataFrame Group API', () => {
    test('should have all group aggregation methods available', () => {
      // Check that all group aggregation methods are available on the DataFrame instance
      expect(typeof df.group).toBe('function');
      expect(typeof df.groupBy).toBe('function'); // Alias for group
      expect(typeof df.groupAgg).toBe('function');
      expect(typeof df.groupSum).toBe('function');
      expect(typeof df.groupMean).toBe('function');
      expect(typeof df.groupMin).toBe('function');
      expect(typeof df.groupMax).toBe('function');
      expect(typeof df.groupCount).toBe('function');
    });
  });

  describe('DataFrame Aggregation API', () => {
    test('should have all aggregation methods available', () => {
      // Check that all direct aggregation methods are available on the DataFrame instance
      expect(typeof df.sum).toBe('function');
      expect(typeof df.mean).toBe('function');
      expect(typeof df.median).toBe('function');
      expect(typeof df.mode).toBe('function');
      expect(typeof df.min).toBe('function');
      expect(typeof df.max).toBe('function');
      expect(typeof df.count).toBe('function');
      expect(typeof df.std).toBe('function');
      expect(typeof df.variance).toBe('function');
    });
  });

  describe('Series Access API', () => {
    test('should correctly access Series through col method', () => {
      // Get the first column name from the DataFrame
      const firstColumn = df.columns[0];

      // Check that col method returns a Series
      const series = df.col(firstColumn);
      expect(series).not.toBeUndefined();
      expect(series.constructor.name).toBe('Series');

      // Check that get method (alias for col) returns a Series
      const seriesFromGet = df.get(firstColumn);
      expect(seriesFromGet).not.toBeUndefined();
      expect(seriesFromGet.constructor.name).toBe('Series');
    });
  });
});
