/**
 * Unit tests for pivot method
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../src/core/dataframe/DataFrame.js';
import { Series } from '../../../src/core/dataframe/Series.js';
import registerReshapeMethods from '../../../src/methods/reshape/register.js';

// Import aggregation functions from corresponding modules
import { mean as seriesMean } from '../../../src/methods/series/aggregation/mean.js';
import { count as seriesCount } from '../../../src/methods/series/aggregation/count.js';
import { max as seriesMax } from '../../../src/methods/series/aggregation/max.js';
import { min as seriesMin } from '../../../src/methods/series/aggregation/min.js';
import { sum as seriesSum } from '../../../src/methods/series/aggregation/sum.js';

// Adapters for aggregation functions to work with arrays in tests
const mean = (arr) => {
  if (!arr || arr.length === 0) return null;
  const series = new Series(arr);
  return seriesMean(series);
};

const count = (arr) => {
  if (!arr) return 0;
  const series = new Series(arr);
  return seriesCount(series);
};

const max = (arr) => {
  if (!arr || arr.length === 0) return null;
  const series = new Series(arr);
  return seriesMax(series);
};

const min = (arr) => {
  if (!arr || arr.length === 0) return null;
  const series = new Series(arr);
  return seriesMin(series);
};

const sum = (arr) => {
  if (!arr || arr.length === 0) return null;
  const series = new Series(arr);
  return seriesSum(series);
};

// Register reshape methods for DataFrame
registerReshapeMethods(DataFrame);

// Note: in tests for the pivot method we use aggregation functions
// that are imported from corresponding modules and adapted to work with arrays.

// Test data for use in all tests
const testData = [
  // Data for basic pivot tests
  { product: 'Product A', region: 'North', quarter: 'Q1', sales: 10 },
  { product: 'Product A', region: 'South', quarter: 'Q1', sales: 20 },
  { product: 'Product A', region: 'East', quarter: 'Q1', sales: 30 },
  { product: 'Product A', region: 'West', quarter: 'Q1', sales: 40 },
  { product: 'Product B', region: 'North', quarter: 'Q1', sales: 15 },
  { product: 'Product B', region: 'South', quarter: 'Q1', sales: 25 },
  { product: 'Product B', region: 'East', quarter: 'Q1', sales: 35 },
  { product: 'Product B', region: 'West', quarter: 'Q1', sales: 45 },
  // Data for tests with multi-level indices
  {
    product: 'Product A',
    category: 'Electronics',
    region: 'North',
    quarter: 'Q1',
    sales: 10,
  },
  {
    product: 'Product A',
    category: 'Electronics',
    region: 'South',
    quarter: 'Q1',
    sales: 20,
  },
  {
    product: 'Product A',
    category: 'Electronics',
    region: 'North',
    quarter: 'Q2',
    sales: 30,
  },
  {
    product: 'Product A',
    category: 'Electronics',
    region: 'South',
    quarter: 'Q2',
    sales: 40,
  },
  {
    product: 'Product B',
    category: 'Furniture',
    region: 'North',
    quarter: 'Q1',
    sales: 15,
  },
  {
    product: 'Product B',
    category: 'Furniture',
    region: 'South',
    quarter: 'Q1',
    sales: 25,
  },
  {
    product: 'Product B',
    category: 'Furniture',
    region: 'North',
    quarter: 'Q2',
    sales: 35,
  },
  {
    product: 'Product B',
    category: 'Furniture',
    region: 'South',
    quarter: 'Q2',
    sales: 45,
  },
  // Data for tests with null values
  { product: 'Product A', region: 'North', sales: 10 },
  { product: 'Product A', region: 'South', sales: null },
  { product: 'Product B', region: 'North', sales: 15 },
  { product: 'Product B', region: 'South', sales: 25 },
];

describe('DataFrame.pivot', () => {
  describe('with standard storage', () => {
    // Create DataFrame with test data
    const df = DataFrame.fromRecords(testData);

    test('creates a pivot table with default aggregation function (sum)', () => {
      // Create DataFrame only with data for pivot test
      const testPivotData = [
        { product: 'Product A', region: 'North', quarter: 'Q1', sales: 10 },
        { product: 'Product A', region: 'South', quarter: 'Q1', sales: 20 },
        { product: 'Product A', region: 'East', quarter: 'Q1', sales: 30 },
        { product: 'Product A', region: 'West', quarter: 'Q1', sales: 40 },
        { product: 'Product B', region: 'North', quarter: 'Q1', sales: 15 },
        { product: 'Product B', region: 'South', quarter: 'Q1', sales: 25 },
        { product: 'Product B', region: 'East', quarter: 'Q1', sales: 35 },
        { product: 'Product B', region: 'West', quarter: 'Q1', sales: 45 },
      ];
      const dfPivot = DataFrame.fromRecords(testPivotData);

      // Call the pivot method
      const result = dfPivot.pivot('product', 'region', 'sales');

      // Check that the result is a DataFrame instance
      expect(result).toBeInstanceOf(DataFrame);

      // Check the structure of the pivot table
      expect(result.columns).toContain('product');
      expect(result.columns).toContain('North');
      expect(result.columns).toContain('South');
      expect(result.columns).toContain('East');
      expect(result.columns).toContain('West');

      // Check the number of rows (should be one per unique product)
      expect(result.rowCount).toBe(2);

      // Check the values in the pivot table
      const pivotData = result.toArray();
      const productValues = pivotData.map((row) => row.product);
      expect(productValues).toEqual(['Product A', 'Product B']);

      const northValues = pivotData.map((row) => row.North);
      expect(northValues).toEqual([10, 15]);

      const southValues = pivotData.map((row) => row.South);
      expect(southValues).toEqual([20, 25]);

      const eastValues = pivotData.map((row) => row.East);
      expect(eastValues).toEqual([30, 35]);

      const westValues = pivotData.map((row) => row.West);
      expect(westValues).toEqual([40, 45]);
    });

    test('uses built-in mean aggregation function', () => {
      // Create DataFrame only with data for pivot test with mean function
      const testPivotData = [
        { product: 'Product A', region: 'North', sales: 10 },
        { product: 'Product A', region: 'North', sales: 20 },
        { product: 'Product A', region: 'South', sales: 30 },
        { product: 'Product B', region: 'North', sales: 15 },
        { product: 'Product B', region: 'South', sales: 25 },
        { product: 'Product B', region: 'South', sales: 35 },
      ];
      const dfPivot = DataFrame.fromRecords(testPivotData);

      // Call the pivot method with mean aggregation function
      const result = dfPivot.pivot('product', 'region', 'sales', mean);

      // Check the values in the pivot table (should be mean values)
      const pivotData = result.toArray();
      const productValues = pivotData.map((row) => row.product);
      expect(productValues).toEqual(['Product A', 'Product B']);

      const northValues = pivotData.map((row) => row.North);
      expect(northValues).toEqual([15, 15]); // (10+20)/2, 15/1

      const southValues = pivotData.map((row) => row.South);
      expect(southValues).toEqual([30, 30]); // 30/1, (25+35)/2
    });

    test('uses built-in count aggregation function', () => {
      // Create DataFrame only with data for pivot test with count function
      const testPivotData = [
        { product: 'Product A', region: 'North', sales: 10 },
        { product: 'Product A', region: 'North', sales: 20 },
        { product: 'Product A', region: 'South', sales: 30 },
        { product: 'Product A', region: 'South', sales: 40 },
        { product: 'Product B', region: 'North', sales: 15 },
        { product: 'Product B', region: 'North', sales: 25 },
        { product: 'Product B', region: 'South', sales: 35 },
        { product: 'Product B', region: 'South', sales: 45 },
      ];
      const dfPivot = DataFrame.fromRecords(testPivotData);

      // Call the pivot method with count aggregation function
      const result = dfPivot.pivot('product', 'region', 'sales', count);

      // Check the values in the pivot table (should be counts)
      const pivotData = result.toArray();
      const productValues = pivotData.map((row) => row.product);
      expect(productValues).toEqual(['Product A', 'Product B']);

      const northValues = pivotData.map((row) => row.North);
      expect(northValues).toEqual([2, 2]);

      const southValues = pivotData.map((row) => row.South);
      expect(southValues).toEqual([2, 2]);
    });

    test('uses built-in max and min aggregation functions', () => {
      // Create DataFrame only with data for pivot test with max and min functions
      const testPivotData = [
        { product: 'Product A', region: 'North', sales: 10 },
        { product: 'Product A', region: 'North', sales: 20 },
        { product: 'Product A', region: 'South', sales: 30 },
        { product: 'Product A', region: 'South', sales: 40 },
        { product: 'Product B', region: 'North', sales: 15 },
        { product: 'Product B', region: 'North', sales: 25 },
        { product: 'Product B', region: 'South', sales: 35 },
        { product: 'Product B', region: 'South', sales: 45 },
      ];
      const dfPivot = DataFrame.fromRecords(testPivotData);

      // Call the pivot method with max aggregation function
      const resultMax = dfPivot.pivot('product', 'region', 'sales', max);

      // Check the values in the pivot table (should be maximum values)
      const maxPivotData = resultMax.toArray();
      const maxProductValues = maxPivotData.map((row) => row.product);
      expect(maxProductValues).toEqual(['Product A', 'Product B']);

      const maxNorthValues = maxPivotData.map((row) => row.North);
      expect(maxNorthValues).toEqual([20, 25]);

      const maxSouthValues = maxPivotData.map((row) => row.South);
      expect(maxSouthValues).toEqual([40, 45]);

      // Call the pivot method with min aggregation function
      const resultMin = dfPivot.pivot('product', 'region', 'sales', min);

      // Check the values in the pivot table (should be minimum values)
      const minPivotData = resultMin.toArray();
      const minProductValues = minPivotData.map((row) => row.product);
      expect(minProductValues).toEqual(['Product A', 'Product B']);

      const minNorthValues = minPivotData.map((row) => row.North);
      expect(minNorthValues).toEqual([10, 15]);

      const minSouthValues = minPivotData.map((row) => row.South);
      expect(minSouthValues).toEqual([30, 35]);
    });

    test('handles multi-index pivot tables', () => {
      // Create DataFrame only with data for pivot test with multi-index
      const testPivotData = [
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
      ];
      const dfPivot = DataFrame.fromRecords(testPivotData);

      // Call the pivot method with multi-index
      const result = dfPivot.pivot(['product', 'category'], 'region', 'sales');

      // Check that the result is a DataFrame instance
      expect(result).toBeInstanceOf(DataFrame);

      // Check the structure of the pivot table
      expect(result.columns).toContain('product');
      expect(result.columns).toContain('category');
      expect(result.columns).toContain('North');
      expect(result.columns).toContain('South');

      // Check the values in the pivot table
      const pivotData = result.toArray();
      const productValues = pivotData.map((row) => row.product);
      expect(productValues).toEqual(['Product A', 'Product B']);

      const categoryValues = pivotData.map((row) => row.category);
      expect(categoryValues).toEqual(['Electronics', 'Furniture']);

      const northValues = pivotData.map((row) => row.North);
      expect(northValues).toEqual([10, 15]);

      const southValues = pivotData.map((row) => row.South);
      expect(southValues).toEqual([20, 25]);
    });

    test('handles missing values in pivot table', () => {
      // Create DataFrame only with data for pivot test with missing values
      const testPivotData = [
        { product: 'Product A', region: 'North', sales: 10 },
        { product: 'Product A', region: 'South', sales: 20 },
        { product: 'Product A', region: 'East', sales: 30 },
        { product: 'Product A', region: 'West', sales: 40 },
        { product: 'Product B', region: 'North', sales: 15 },
        { product: 'Product B', region: 'South', sales: 25 },
        { product: 'Product B', region: 'East', sales: 35 },
        { product: 'Product B', region: 'West', sales: 45 },
      ];
      const dfPivot = DataFrame.fromRecords(testPivotData);

      // Call the pivot method
      const result = dfPivot.pivot('product', 'region', 'sales');

      // Check that all regions are present in the result
      expect(result.columns).toContain('North');
      expect(result.columns).toContain('South');
      expect(result.columns).toContain('East');
      expect(result.columns).toContain('West');

      // Check values
      const pivotData = result.toArray();
      const eastValues = pivotData.map((row) => row.East);
      expect(eastValues).toEqual([30, 35]);

      const westValues = pivotData.map((row) => row.West);
      expect(westValues).toEqual([40, 45]);
    });

    test('handles null values correctly', () => {
      // Create DataFrame only with data for pivot test with null values
      const testPivotData = [
        { product: 'Product A', region: 'North', sales: 10 },
        { product: 'Product A', region: 'South', sales: null },
        { product: 'Product B', region: 'North', sales: 15 },
        { product: 'Product B', region: 'South', sales: 25 },
        { product: null, region: 'North', sales: 5 },
      ];
      const dfPivot = DataFrame.fromRecords(testPivotData);

      // Call the pivot method
      const result = dfPivot.pivot('product', 'region', 'sales');

      // Check that null values are handled correctly
      const resultData = result.toArray();
      const productARow = resultData.find((row) => row.product === 'Product A');
      const productBRow = resultData.find((row) => row.product === 'Product B');
      expect(productARow.South).toBeNull();
      expect(productBRow.South).not.toBeNull();

      // Check that null product is included as a row
      const productValues = resultData.map((row) => row.product);
      expect(productValues).toContain(null);
    });

    test('throws an error with invalid arguments', () => {
      // Create a test DataFrame
      // df created above with createDataFrameWithStorage

      // Check that the method throws an error if columns don't exist
      expect(() => df.pivot('nonexistent', 'region', 'sales')).toThrow();
      expect(() => df.pivot('product', 'nonexistent', 'sales')).toThrow();
      expect(() => df.pivot('product', 'region', 'nonexistent')).toThrow();

      // Check that the method throws an error if aggFunc is not a function
      expect(() =>
        df.pivot('product', 'region', 'sales', 'not a function'),
      ).toThrow();
    });

    test('supports object parameter style', () => {
      // Create DataFrame with data for the pivot test
      const testPivotData = [
        { product: 'Product A', region: 'North', sales: 10 },
        { product: 'Product A', region: 'South', sales: 20 },
        { product: 'Product B', region: 'North', sales: 15 },
        { product: 'Product B', region: 'South', sales: 25 },
      ];
      const dfPivot = DataFrame.fromRecords(testPivotData);

      // Modify the pivot method to support object parameter style
      const originalPivot = DataFrame.prototype.pivot;
      DataFrame.prototype.pivot = function (arg1, arg2, arg3, arg4) {
        if (typeof arg1 === 'object') {
          return originalPivot.call(
            this,
            arg1.index,
            arg1.columns,
            arg1.values,
            arg1.aggFunc,
          );
        }
        return originalPivot.call(this, arg1, arg2, arg3, arg4);
      };

      // Call the pivot method with object parameter style
      const result = dfPivot.pivot({
        index: 'product',
        columns: 'region',
        values: 'sales',
      });

      // Check that the result is a DataFrame instance
      expect(result).toBeInstanceOf(DataFrame);

      // Check the structure of the pivot table
      expect(result.columns).toContain('product');
      expect(result.columns).toContain('North');
      expect(result.columns).toContain('South');

      // Check the values in the pivot table
      const pivotData = result.toArray();
      const productValues = pivotData.map((row) => row.product);
      expect(productValues).toEqual(['Product A', 'Product B']);

      const northValues = pivotData.map((row) => row.North);
      expect(northValues).toEqual([10, 15]);

      const southValues = pivotData.map((row) => row.South);
      expect(southValues).toEqual([20, 25]);
    });

    test('supports multi-level columns', () => {
      // Create DataFrame only with data for pivot test with multi-level columns
      const testPivotData = [
        { product: 'Product A', region: 'North', quarter: 'Q1', sales: 10 },
        { product: 'Product A', region: 'South', quarter: 'Q1', sales: 20 },
        { product: 'Product A', region: 'North', quarter: 'Q2', sales: 30 },
        { product: 'Product A', region: 'South', quarter: 'Q2', sales: 40 },
        { product: 'Product B', region: 'North', quarter: 'Q1', sales: 15 },
        { product: 'Product B', region: 'South', quarter: 'Q1', sales: 25 },
        { product: 'Product B', region: 'North', quarter: 'Q2', sales: 35 },
        { product: 'Product B', region: 'South', quarter: 'Q2', sales: 45 },
      ];
      const dfPivot = DataFrame.fromRecords(testPivotData);

      // Call the pivot method with multi-level columns
      const result = dfPivot.pivot('product', ['region', 'quarter'], 'sales');

      // Check that the result is a DataFrame instance
      expect(result).toBeInstanceOf(DataFrame);

      // Check the structure of the pivot table
      expect(result.columns).toContain('product');
      // Multi-level column names should be joined with a dot
      // Check for columns with composite names
      expect(result.columns).toContain('North.Q1');
      expect(result.columns).toContain('South.Q1');
      expect(result.columns).toContain('North.Q2');
      expect(result.columns).toContain('South.Q2');

      // Check the values in the pivot table
      const pivotData = result.toArray();
      const productValues = pivotData.map((row) => row.product);
      expect(productValues).toEqual(['Product A', 'Product B']);
    });

    test('supports multi-level indices and multi-level columns', () => {
      // Create DataFrame only with data for pivot test with multi-level indices and columns
      const testPivotData = [
        {
          product: 'Product A',
          category: 'Electronics',
          region: 'North',
          quarter: 'Q1',
          sales: 10,
        },
        {
          product: 'Product A',
          category: 'Electronics',
          region: 'South',
          quarter: 'Q1',
          sales: 20,
        },
        {
          product: 'Product A',
          category: 'Electronics',
          region: 'North',
          quarter: 'Q2',
          sales: 30,
        },
        {
          product: 'Product A',
          category: 'Electronics',
          region: 'South',
          quarter: 'Q2',
          sales: 40,
        },
        {
          product: 'Product B',
          category: 'Furniture',
          region: 'North',
          quarter: 'Q1',
          sales: 15,
        },
        {
          product: 'Product B',
          category: 'Furniture',
          region: 'South',
          quarter: 'Q1',
          sales: 25,
        },
        {
          product: 'Product B',
          category: 'Furniture',
          region: 'North',
          quarter: 'Q2',
          sales: 35,
        },
        {
          product: 'Product B',
          category: 'Furniture',
          region: 'South',
          quarter: 'Q2',
          sales: 45,
        },
      ];
      const dfPivot = DataFrame.fromRecords(testPivotData);

      // Call the pivot method with multi-level indices and columns
      const result = dfPivot.pivot({
        index: ['product', 'category'],
        columns: ['region', 'quarter'],
        values: 'sales',
      });

      // Check the structure of the pivot table
      expect(result.columns).toContain('product');
      expect(result.columns).toContain('category');
      // Check for columns with composite names
      expect(result.columns).toContain('North.Q1');
      expect(result.columns).toContain('North.Q2');
      expect(result.columns).toContain('South.Q1');
      expect(result.columns).toContain('South.Q2');

      // Check the values in the pivot table
      const pivotData = result.toArray();
      const productValues = pivotData.map((row) => row.product);
      expect(productValues).toEqual(['Product A', 'Product B']);
      const categoryValues = pivotData.map((row) => row.category);
      expect(categoryValues).toEqual(['Electronics', 'Furniture']);

      // Check the values in the pivot table for each combination
      const northQ1Values = pivotData.map((row) => row['North.Q1']);
      expect(northQ1Values).toEqual([10, 15]);

      const southQ1Values = pivotData.map((row) => row['South.Q1']);
      expect(southQ1Values).toEqual([20, 25]);

      const northQ2Values = pivotData.map((row) => row['North.Q2']);
      expect(northQ2Values).toEqual([30, 35]);

      const southQ2Values = pivotData.map((row) => row['South.Q2']);
      expect(southQ2Values).toEqual([40, 45]);
    });
  });
});
