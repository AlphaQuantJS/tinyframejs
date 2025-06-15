/**
 * Unit tests for unstack method
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../src/core/dataframe/DataFrame.js';
import registerReshapeMethods from '../../../src/methods/reshape/register.js';

// Test data for all tests
const testData = [
  { product: 'Product A', region: 'North', sales: 10 },
  { product: 'Product A', region: 'South', sales: 20 },
  { product: 'Product A', region: 'East', sales: 30 },
  { product: 'Product A', region: 'West', sales: 40 },
  { product: 'Product B', region: 'North', sales: 15 },
  { product: 'Product B', region: 'South', sales: 25 },
  { product: 'Product B', region: 'East', sales: 35 },
  { product: 'Product B', region: 'West', sales: 45 },
];

// Register reshape methods for DataFrame
registerReshapeMethods(DataFrame);

describe('DataFrame.unstack', () => {
  describe('with standard storage', () => {
    // Create DataFrame with test data
    const df = DataFrame.fromRecords(testData);

    test('unstacks rows into columns', () => {
      // Create a test DataFrame in long format
      // df created above with createDataFrameWithStorage

      // Call the unstack method
      const result = df.unstack('product', 'region', 'sales');

      // Check that the result is a DataFrame instance
      expect(result).toBeInstanceOf(DataFrame);

      // Check the structure of the unstacked DataFrame
      expect(result.columns).toContain('product');
      expect(result.columns).toContain('North');
      expect(result.columns).toContain('South');
      expect(result.columns).toContain('East');
      expect(result.columns).toContain('West');

      // Check the number of rows (should be one per unique product)
      expect(result.rowCount).toBe(2);

      // Check the values in the unstacked DataFrame
      const resultArray = result.toArray();
      const products = resultArray.map((row) => row.product);
      const northValues = resultArray.map((row) => row.North);
      const southValues = resultArray.map((row) => row.South);
      const eastValues = resultArray.map((row) => row.East);
      const westValues = resultArray.map((row) => row.West);

      expect(products).toEqual(['Product A', 'Product B']);
      expect(northValues).toEqual([10, 15]);
      expect(southValues).toEqual([20, 25]);
      expect(eastValues).toEqual([30, 35]);
      expect(westValues).toEqual([40, 45]);
    });

    test('unstacks with multiple index columns', () => {
      // Create a test DataFrame with additional category column
      const dataWithCategory = [
        {
          product: 'Product A',
          category: 'Electronics',
          region: 'North',
          sales: 10,
        },
        {
          product: 'Product A',
          category: 'Electronics',
          region: 'South',
          sales: 20,
        },
        {
          product: 'Product A',
          category: 'Electronics',
          region: 'East',
          sales: 30,
        },
        {
          product: 'Product A',
          category: 'Electronics',
          region: 'West',
          sales: 40,
        },
        {
          product: 'Product B',
          category: 'Furniture',
          region: 'North',
          sales: 15,
        },
        {
          product: 'Product B',
          category: 'Furniture',
          region: 'South',
          sales: 25,
        },
        {
          product: 'Product B',
          category: 'Furniture',
          region: 'East',
          sales: 35,
        },
        {
          product: 'Product B',
          category: 'Furniture',
          region: 'West',
          sales: 45,
        },
      ];
      const dfWithCategory = DataFrame.fromRecords(dataWithCategory);

      // Call the unstack method with multiple index columns
      const result = dfWithCategory.unstack(
        ['product', 'category'],
        'region',
        'sales',
      );

      // Check the structure of the unstacked DataFrame
      expect(result.columns).toContain('product');
      expect(result.columns).toContain('category');
      expect(result.columns).toContain('North');
      expect(result.columns).toContain('South');
      expect(result.columns).toContain('East');
      expect(result.columns).toContain('West');

      // Check the number of rows (should be one per unique product-category combination)
      expect(result.rowCount).toBe(2);

      // Check the values in the unstacked DataFrame
      const resultArray = result.toArray();
      const products = resultArray.map((row) => row.product);
      const categories = resultArray.map((row) => row.category);
      const northValues = resultArray.map((row) => row.North);
      const southValues = resultArray.map((row) => row.South);
      const eastValues = resultArray.map((row) => row.East);
      const westValues = resultArray.map((row) => row.West);

      expect(products).toEqual(['Product A', 'Product B']);
      expect(categories).toEqual(['Electronics', 'Furniture']);
      expect(northValues).toEqual([10, 15]);
      expect(southValues).toEqual([20, 25]);
      expect(eastValues).toEqual([30, 35]);
      expect(westValues).toEqual([40, 45]);
    });

    test('handles duplicate index values by using the last occurrence', () => {
      // Create a test DataFrame with duplicate index values
      const dataWithDuplicates = [
        { product: 'Product A', region: 'North', sales: 5 },
        { product: 'Product A', region: 'North', sales: 10 }, // Duplicate that should override
        { product: 'Product A', region: 'South', sales: 20 },
        { product: 'Product B', region: 'North', sales: 15 },
        { product: 'Product B', region: 'South', sales: 25 },
      ];
      const dfWithDuplicates = DataFrame.fromRecords(dataWithDuplicates);

      // Call the unstack method
      const result = dfWithDuplicates.unstack('region', 'product', 'sales');

      // Check the structure of the unstacked DataFrame
      expect(result.columns).toContain('region');
      expect(result.columns).toContain('Product A');
      expect(result.columns).toContain('Product B');

      // Check the number of rows (should be one per unique region)
      expect(result.rowCount).toBe(2);

      // Check the values in the unstacked DataFrame
      const resultArray = result.toArray();
      const regions = resultArray.map((row) => row.region);
      const productAValues = resultArray.map((row) => row['Product A']);
      const productBValues = resultArray.map((row) => row['Product B']);

      expect(regions).toEqual(['North', 'South']);
      expect(productAValues).toEqual([10, 20]); // 10 not 5 due to duplicate override
      expect(productBValues).toEqual([15, 25]);
    });

    test('handles non-numeric values in unstack', () => {
      // Create a test DataFrame with non-numeric values
      const dataWithNonNumeric = [
        { product: 'Product A', year: '2020', category: 'Electronics' },
        { product: 'Product A', year: '2021', category: 'Small' },
        { product: 'Product B', year: '2020', category: 'Furniture' },
        { product: 'Product B', year: '2021', category: 'Large' },
      ];
      const dfWithNonNumeric = DataFrame.fromRecords(dataWithNonNumeric);

      // Call the unstack method
      const result = dfWithNonNumeric.unstack('year', 'product', 'category');

      // Check the structure of the unstacked DataFrame
      expect(result.columns).toContain('year');
      expect(result.columns).toContain('Product A');
      expect(result.columns).toContain('Product B');

      // Check the values in the unstacked DataFrame (should be strings)
      const resultArray = result.toArray();
      const years = resultArray.map((row) => row.year);
      const productAValues = resultArray.map((row) => row['Product A']);
      const productBValues = resultArray.map((row) => row['Product B']);

      expect(years).toEqual(['2020', '2021']);
      expect(productAValues).toEqual(['Electronics', 'Small']);
      expect(productBValues).toEqual(['Furniture', 'Large']);
    });

    test('throws an error with invalid arguments', () => {
      // Check that the method throws an error if index is not provided
      expect(() => df.unstack()).toThrow();

      // Check that the method throws an error if column is not provided
      expect(() => df.unstack('product')).toThrow();

      // Check that the method throws an error if value is not provided
      expect(() => df.unstack('product', 'region')).toThrow();

      // Check that the method throws an error if index column doesn't exist
      expect(() => df.unstack('nonexistent', 'region', 'sales')).toThrow();

      // Check that the method throws an error if column column doesn't exist
      expect(() => df.unstack('product', 'nonexistent', 'sales')).toThrow();

      // Check that the method throws an error if value column doesn't exist
      expect(() => df.unstack('product', 'region', 'nonexistent')).toThrow();
    });
  });
});
