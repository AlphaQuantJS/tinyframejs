/**
 * Unit tests for aggregation methods index
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import * as aggregationMethods from '../../../../src/methods/dataframe/aggregation/index.js';
import { register as registerDataFrameAggregation } from '../../../../src/methods/dataframe/aggregation/register.js';

import {
  testWithBothStorageTypes,
  createDataFrameWithStorage,
} from '../../../utils/storageTestUtils.js';

// Register aggregation methods on DataFrame
registerDataFrameAggregation(DataFrame);

// Test data for use in all tests
const testData = [
  { value: 10, category: 'A', mixed: '20' },
  { value: 20, category: 'B', mixed: 30 },
  { value: 30, category: 'A', mixed: null },
  { value: 40, category: 'C', mixed: undefined },
  { value: 50, category: 'B', mixed: NaN },
];

describe('Aggregation Methods Index', () => {
  // Run tests with both storage types
  testWithBothStorageTypes((storageType) => {
    describe(`with ${storageType} storage`, () => {
      // Create DataFrame with the specified storage type
      const df = createDataFrameWithStorage(DataFrame, testData, storageType);

      test('should export aggregation methods register function', () => {
        // Check that register function is exported
        expect(aggregationMethods).toHaveProperty('register');
        expect(typeof aggregationMethods.register).toBe('function');
      });

      test('should successfully extend DataFrame with group aggregation methods', () => {
        // Check that all group aggregation methods are available on the DataFrame instance
        expect(typeof df.group).toBe('function');
        expect(typeof df.groupAgg).toBe('function');
        expect(typeof df.groupSum).toBe('function');
        expect(typeof df.groupMean).toBe('function');
        expect(typeof df.groupMin).toBe('function');
        expect(typeof df.groupMax).toBe('function');
        expect(typeof df.groupCount).toBe('function');
      });

      test('should correctly access Series through col method', () => {
        // Check that col method returns a Series
        const series = df.col('value');
        expect(series.constructor.name).toBe('Series');

        // Check that get method (alias for col) returns a Series
        const seriesFromGet = df.get('value');
        expect(seriesFromGet.constructor.name).toBe('Series');
      });
    });
  });
});
