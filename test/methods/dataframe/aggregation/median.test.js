import { describe, it, expect } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import { median } from '../../../../src/methods/dataframe/aggregation/median.js';

import {
  testWithBothStorageTypes,
  createDataFrameWithStorage,
} from '../../../utils/storageTestUtils.js';

// Test data for use in all tests
const testData = [
  { value: 10, category: 'A', mixed: '20' },
  { value: 20, category: 'B', mixed: 30 },
  { value: 30, category: 'A', mixed: null },
  { value: 40, category: 'C', mixed: undefined },
  { value: 50, category: 'B', mixed: NaN },
];

describe('median method', () => {
  // Run tests with both storage types
  testWithBothStorageTypes((storageType) => {
    describe(`with ${storageType} storage`, () => {
      // Create test data for odd number of elements
      const testDataOdd = [
        { value: 30, category: 'A', mixed: '20' },
        { value: 10, category: 'B', mixed: 30 },
        { value: 50, category: 'A', mixed: null },
        { value: 40, category: 'C', mixed: undefined },
        { value: 20, category: 'B', mixed: NaN },
      ];

      // Create test data for even number of elements
      const testDataEven = [
        { value: 30, category: 'A', mixed: '20' },
        { value: 10, category: 'B', mixed: 30 },
        { value: 50, category: 'A', mixed: null },
        { value: 40, category: 'C', mixed: undefined },
        { value: 20, category: 'B', mixed: NaN },
        { value: 60, category: 'D', mixed: 40 },
      ];

      // Create a DataFrame with the specified storage type
      const dfOdd = createDataFrameWithStorage(
        DataFrame,
        testDataOdd,
        storageType,
      );
      const dfEven = createDataFrameWithStorage(
        DataFrame,
        testDataEven,
        storageType,
      );

      it('should calculate the median for odd number of elements', () => {
        // Call median function directly
        const medianFn = median({ validateColumn: () => {} });
        const result = medianFn(dfOdd, 'value');

        // Check that the median is correct
        expect(result).toBe(30); // Sorted: [10, 20, 30, 40, 50] -> median is 30
      });

      it('should calculate the median for even number of elements', () => {
        // Call median function directly
        const medianFn = median({ validateColumn: () => {} });
        const result = medianFn(dfEven, 'value');

        // Check that the median is correct
        expect(result).toBe(35); // Sorted: [10, 20, 30, 40, 50, 60] -> median is (30+40)/2 = 35
      });

      it('should handle mixed data types by converting to numbers', () => {
        // Call median function directly
        const medianFn = median({ validateColumn: () => {} });
        const result = medianFn(dfEven, 'mixed');

        // Check that the median is correct (only valid numbers are considered)
        expect(result).toBe(30); // Valid values: [20, 30, 40] -> median is 30
      });

      it('should return null for a column with no valid numeric values', () => {
        // Call median function directly
        const medianFn = median({ validateColumn: () => {} });
        const result = medianFn(dfOdd, 'category');

        // Check that the result is null (no numeric values in 'category' column)
        expect(result).toBe(null);
      });

      it('should throw an error for non-existent column', () => {
        // Create a validator that throws an error for non-existent column
        const validateColumn = (frame, column) => {
          if (!frame.columns.includes(column)) {
            throw new Error(`Column '${column}' not found`);
          }
        };

        // Call median function with validator
        const medianFn = median({ validateColumn });

        // Check that it throws an error for non-existent column
        expect(() => medianFn(dfOdd, 'nonexistent')).toThrow(
          'Column \'nonexistent\' not found',
        );
      });

      it('should handle empty frames', () => {
        // Create an empty DataFrame
        const emptyDf = createDataFrameWithStorage(DataFrame, [], storageType);

        // Call median function directly with a validator that doesn't throw for empty frames
        const validateColumn = () => {}; // Пустой валидатор, который ничего не проверяет
        const medianFn = median({ validateColumn });

        // Проверяем, что для пустого DataFrame результат равен null
        expect(medianFn(emptyDf, 'value')).toBe(null);
      });
    });
  });
});
