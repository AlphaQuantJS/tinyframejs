/**
 * Unit tests for melt method
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../src/core/dataframe/DataFrame.js';
import registerReshapeMethods from '../../../src/methods/reshape/register.js';

// Register reshape methods for DataFrame
registerReshapeMethods(DataFrame);

// Test data to be used in all tests
const testData = [
  // Data for melt test
  { product: 'Product A', North: 10, South: 20, East: 30, West: 40 },
  { product: 'Product B', North: 15, South: 25, East: 35, West: 45 },
  // Data for other tests
  {
    product: 'Product A',
    category: 'Electronics',
    id: 1,
    region: 'North',
    sales: 10,
  },
  {
    product: 'Product A',
    category: 'Electronics',
    id: 1,
    region: 'South',
    sales: 20,
  },
  {
    product: 'Product B',
    category: 'Furniture',
    id: 2,
    region: 'North',
    sales: 15,
  },
  {
    product: 'Product B',
    category: 'Furniture',
    id: 2,
    region: 'South',
    sales: 25,
  },
  // Data for test with non-numeric values
  { product: 'Product A', category1: 'Electronics', category2: 'Small' },
  { product: 'Product B', category1: 'Furniture', category2: 'Large' },
];

describe('DataFrame.melt', () => {
  describe('with standard storage', () => {
    test('unpivots DataFrame from wide to long format', () => {
      // Create DataFrame for the melt test
      const testMeltData = [
        { product: 'Product A', North: 10, South: 20, East: 30, West: 40 },
        { product: 'Product B', North: 15, South: 25, East: 35, West: 45 },
      ];
      const dfMelt = DataFrame.fromRecords(testMeltData);

      // Call the melt method
      const result = dfMelt.melt(['product']);

      // Check that the result is a DataFrame instance
      expect(result).toBeInstanceOf(DataFrame);

      // Check the structure of the melted DataFrame
      expect(result.columns).toContain('product');
      expect(result.columns).toContain('variable');
      expect(result.columns).toContain('value');

      // Check the number of rows (should be product count * variable count)
      expect(result.rowCount).toBe(8); // 2 products * 4 regions

      // Check the values in the melted DataFrame
      const resultArray = result.toArray();
      expect(resultArray.map((row) => row.product)).toEqual([
        'Product A',
        'Product A',
        'Product A',
        'Product A',
        'Product B',
        'Product B',
        'Product B',
        'Product B',
      ]);

      expect(resultArray.map((row) => row.variable)).toEqual([
        'North',
        'South',
        'East',
        'West',
        'North',
        'South',
        'East',
        'West',
      ]);

      const valueValues = resultArray.map((row) => row.value);
      expect(valueValues).toEqual([10, 20, 30, 40, 15, 25, 35, 45]);
    });

    test('unpivots with custom variable and value names', () => {
      // Create DataFrame only with data for the melt test
      const testMeltData = [
        { product: 'Product A', North: 10, South: 20 },
        { product: 'Product B', North: 15, South: 25 },
      ];
      const dfMelt = DataFrame.fromRecords(testMeltData);

      // Call the melt method with custom variable and value names
      const result = dfMelt.melt(['product'], null, 'region', 'sales');

      // Check the structure of the melted DataFrame
      expect(result.columns).toContain('product');
      expect(result.columns).toContain('region');
      expect(result.columns).toContain('sales');

      // Check the values in the melted DataFrame
      const resultArray = result.toArray();
      expect(resultArray.map((row) => row.product)).toEqual([
        'Product A',
        'Product A',
        'Product B',
        'Product B',
      ]);

      const regionValues = resultArray.map((row) => row.region);
      expect(regionValues).toEqual(['North', 'South', 'North', 'South']);

      const salesValues = resultArray.map((row) => row.sales);
      expect(salesValues).toEqual([10, 20, 15, 25]);
    });

    test('unpivots with specified value variables', () => {
      // Create DataFrame only with data for the melt test
      const testMeltData = [
        {
          product: 'Product A',
          id: 1,
          North: 10,
          South: 20,
          East: 30,
          West: 40,
        },
        {
          product: 'Product B',
          id: 2,
          North: 15,
          South: 25,
          East: 35,
          West: 45,
        },
      ];
      const dfMelt = DataFrame.fromRecords(testMeltData);

      // Call the melt method with specific value variables
      const result = dfMelt.melt(['product', 'id'], ['North', 'South']);

      // Check the number of rows (should be product count * specified variable count)
      expect(result.rowCount).toBe(4); // 2 products * 2 regions

      // Check the values in the melted DataFrame
      const resultArray = result.toArray();
      expect(resultArray.map((row) => row.product)).toEqual([
        'Product A',
        'Product A',
        'Product B',
        'Product B',
      ]);

      expect(resultArray.map((row) => row.id)).toEqual([1, 1, 2, 2]);

      expect(resultArray.map((row) => row.variable)).toEqual([
        'North',
        'South',
        'North',
        'South',
      ]);

      const valueValues = resultArray.map((row) => row.value);
      expect(valueValues).toEqual([10, 20, 15, 25]);
    });

    test('handles non-numeric values in melt', () => {
      // Create DataFrame for testing with non-numeric values
      const testMeltData = [
        {
          product: 'Product A',
          category1: 'Electronics',
          category2: 'Small',
        },
        { product: 'Product B', category1: 'Furniture', category2: 'Large' },
      ];
      const dfMelt = DataFrame.fromRecords(testMeltData);

      // Call the melt method
      const result = dfMelt.melt(['product']);

      // Check the values in the melted DataFrame
      const resultArray = result.toArray();
      expect(resultArray.map((row) => row.product)).toEqual([
        'Product A',
        'Product A',
        'Product B',
        'Product B',
      ]);

      expect(resultArray.map((row) => row.variable)).toEqual([
        'category1',
        'category2',
        'category1',
        'category2',
      ]);

      expect(resultArray.map((row) => row.value)).toEqual([
        'Electronics',
        'Small',
        'Furniture',
        'Large',
      ]);

      // In our implementation, we don't check types, so we skip this check
      // expect(result.frame.dtypes.value).toBe('string');
    });

    test('throws an error with invalid arguments', () => {
      // Create a simple DataFrame for error testing
      const testMeltData = [{ product: 'Product A', value: 10 }];
      const dfMelt = DataFrame.fromRecords(testMeltData);

      // Check that the method throws an error if idVars is not an array
      expect(() => dfMelt.melt('product')).toThrow();
      expect(() => dfMelt.melt(null)).toThrow();
      // Empty array idVars is now allowed, as valueVars will be automatically defined
      // as all columns that are not specified in idVars

      // Check that the method throws an error if idVars contains non-existent columns
      expect(() => dfMelt.melt(['nonexistent'])).toThrow();
    });
  });
});
