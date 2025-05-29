import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';

import {
  testWithBothStorageTypes,
  createDataFrameWithStorage,
} from '../../../utils/storageTestUtils.js';

// Test data to be used in all tests
const testData = [
  { value: 10, category: 'A', mixed: '20' },
  { value: 20, category: 'B', mixed: 30 },
  { value: 30, category: 'A', mixed: null },
  { value: 40, category: 'C', mixed: undefined },
  { value: 50, category: 'B', mixed: NaN },
];

describe('DataFrame.melt', () => {
  // Run tests with both storage types
  testWithBothStorageTypes((storageType) => {
    describe(`with ${storageType} storage`, () => {
      // Create DataFrame with specified storage type
      const df = createDataFrameWithStorage(DataFrame, testData, storageType);

      test('unpivots DataFrame from wide to long format', () => {
        // Create a test DataFrame in wide format (pivot table)
        // df created above with createDataFrameWithStorage

        // Call the melt method
        const result = df.melt(['product']);

        // Check that the result is a DataFrame instance
        expect(result).toBeInstanceOf(DataFrame);

        // Check the structure of the melted DataFrame
        expect(result.frame.columnNames).toContain('product');
        expect(result.frame.columnNames).toContain('variable');
        expect(result.frame.columnNames).toContain('value');

        // Check the number of rows (should be product count * variable count)
        expect(result.frame.rowCount).toBe(8); // 2 products * 4 regions

        // Check the values in the melted DataFrame
        expect(result.frame.columns.product).toEqual([
          'Product A',
          'Product A',
          'Product A',
          'Product A',
          'Product B',
          'Product B',
          'Product B',
          'Product B',
        ]);

        expect(result.frame.columns.variable).toEqual([
          'North',
          'South',
          'East',
          'West',
          'North',
          'South',
          'East',
          'West',
        ]);

        expect(Array.from(result.frame.columns.value)).toEqual([
          10, 20, 30, 40, 15, 25, 35, 45,
        ]);
      });

      test('unpivots with custom variable and value names', () => {
        // Create a test DataFrame in wide format
        // df created above with createDataFrameWithStorage

        // Call the melt method with custom variable and value names
        const result = df.melt(['product'], null, 'region', 'sales');

        // Check the structure of the melted DataFrame
        expect(result.frame.columnNames).toContain('product');
        expect(result.frame.columnNames).toContain('region');
        expect(result.frame.columnNames).toContain('sales');

        // Check the values in the melted DataFrame
        expect(result.frame.columns.product).toEqual([
          'Product A',
          'Product A',
          'Product B',
          'Product B',
        ]);

        expect(result.frame.columns.region).toEqual([
          'North',
          'South',
          'North',
          'South',
        ]);

        expect(Array.from(result.frame.columns.sales)).toEqual([
          10, 20, 15, 25,
        ]);
      });

      test('unpivots with specified value variables', () => {
        // Create a test DataFrame in wide format
        // df created above with createDataFrameWithStorage

        // Call the melt method with specific value variables
        const result = df.melt(['product', 'id'], ['North', 'South']);

        // Check the number of rows (should be product count * specified variable count)
        expect(result.frame.rowCount).toBe(4); // 2 products * 2 regions

        // Check the values in the melted DataFrame
        expect(result.frame.columns.product).toEqual([
          'Product A',
          'Product A',
          'Product B',
          'Product B',
        ]);

        expect(Array.from(result.frame.columns.id)).toEqual([1, 1, 2, 2]);

        expect(result.frame.columns.variable).toEqual([
          'North',
          'South',
          'North',
          'South',
        ]);

        expect(Array.from(result.frame.columns.value)).toEqual([
          10, 20, 15, 25,
        ]);
      });

      test('handles non-numeric values in melt', () => {
        // Create a test DataFrame with string values
        // df created above with createDataFrameWithStorage

        // Call the melt method
        const result = df.melt(['product']);

        // Check the values in the melted DataFrame
        expect(result.frame.columns.product).toEqual([
          'Product A',
          'Product A',
          'Product B',
          'Product B',
        ]);

        expect(result.frame.columns.variable).toEqual([
          'category1',
          'category2',
          'category1',
          'category2',
        ]);

        expect(result.frame.columns.value).toEqual([
          'Electronics',
          'Small',
          'Furniture',
          'Large',
        ]);

        // Check that the value column has the correct type
        // In our implementation string values have type 'string', not 'str'
        expect(result.frame.dtypes.value).toBe('string');
      });

      test('throws an error with invalid arguments', () => {
        // Create a test DataFrame
        // df created above with createDataFrameWithStorage

        // Check that the method throws an error if idVars is not an array
        expect(() => df.melt('product')).toThrow();
        expect(() => df.melt(null)).toThrow();
        // Empty array idVars is now allowed, as valueVars will be automatically defined
        // as all columns that are not specified in idVars

        // Check that the method throws an error if idVars contains non-existent columns
        expect(() => df.melt(['nonexistent'])).toThrow();
      });
    });
  });
});
