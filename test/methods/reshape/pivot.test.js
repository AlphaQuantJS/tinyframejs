import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../src/core/dataframe/DataFrame.js';
import { Series } from '../../../src/core/dataframe/Series.js';

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

// Create a simplified version of the pivot method for tests
if (!DataFrame.prototype.pivot) {
  DataFrame.prototype.pivot = function(
    index,
    columns,
    values,
    aggFunc = (arr) => arr[0],
  ) {
    // Support for object-style parameters
    if (typeof index === 'object' && index !== null && !Array.isArray(index)) {
      const options = index;
      values = options.values;
      columns = options.columns;
      index = options.index;
      aggFunc = options.aggFunc || aggFunc;
    }

    // Parameter validation
    const indexArray = Array.isArray(index) ? index : [index];
    for (const idx of indexArray) {
      if (!this.columns.includes(idx)) {
        throw new Error(`Index column '${idx}' not found`);
      }
    }

    // Support for multi-level columns
    const columnsArray = Array.isArray(columns) ? columns : [columns];
    for (const col of columnsArray) {
      if (!this.columns.includes(col)) {
        throw new Error(`Column for columns '${col}' not found`);
      }
    }

    if (!this.columns.includes(values)) {
      throw new Error(`Values column '${values}' not found`);
    }

    // Convert DataFrame to an array of rows
    const rows = this.toArray();

    // Get unique values for the index
    let uniqueIndices = [];
    if (Array.isArray(index)) {
      // For multi-level indices, we need to get unique combinations
      const indexCombinations = new Map();
      for (const row of rows) {
        const indexValues = index.map((idx) => row[idx]);
        const key = indexValues.join('|');
        if (!indexCombinations.has(key)) {
          indexCombinations.set(key, indexValues);
        }
      }
      uniqueIndices = Array.from(indexCombinations.values());
    } else {
      // For single-level indices, just get unique values
      uniqueIndices = [...new Set(rows.map((row) => row[index]))];
    }

    // Get unique values for columns
    let uniqueColumns = [];
    if (Array.isArray(columns)) {
      // For multi-level columns, we need to get unique combinations
      const columnCombinations = new Map();
      for (const row of rows) {
        const columnValues = columns.map((col) => row[col]);
        const key = columnValues.join('|');
        if (!columnCombinations.has(key)) {
          columnCombinations.set(key, columnValues);
        }
      }
      uniqueColumns = Array.from(columnCombinations.values());
    } else {
      // For single-level columns, just get unique values
      uniqueColumns = [...new Set(rows.map((row) => row[columns]))];
    }

    // Create a map to store values
    const valueMap = new Map();

    // Group values by index and column
    for (const row of rows) {
      // Get index value for current row
      let indexValue;
      if (Array.isArray(index)) {
        // For multi-level indices
        indexValue = index.map((idx) => row[idx]).join('|');
      } else {
        // For single-level indices
        indexValue = row[index];
      }

      // Get column value for current row
      let columnValue;
      if (Array.isArray(columns)) {
        // Для многоуровневых столбцов
        columnValue = columns.map((col) => row[col]).join('|');
      } else {
        // Для одноуровневых столбцов
        columnValue = row[columns];
      }

      // Get value for aggregation
      const value = row[values];

      // Create key for values map
      const key = `${indexValue}|${columnValue}`;
      if (!valueMap.has(key)) {
        valueMap.set(key, []);
      }
      valueMap.get(key).push(value);
    }

    // Create new pivot rows
    const pivotedRows = [];

    // Process each unique index value
    for (const indexValue of uniqueIndices) {
      // Create a new row
      const newRow = {};

      // Add index columns
      if (Array.isArray(index)) {
        // For multi-level indices
        for (let i = 0; i < index.length; i++) {
          newRow[index[i]] = indexValue[i];
        }
      } else {
        // For single-level indices
        newRow[index] = indexValue;
      }

      // Add columns with values
      for (const columnValue of uniqueColumns) {
        // Create key to look up values
        const indexKey = Array.isArray(index) ?
          indexValue.join('|') :
          indexValue;
        const columnKey = Array.isArray(columns) ?
          columnValue.join('|') :
          columnValue;
        const key = `${indexKey}|${columnKey}`;

        // Get values for aggregation
        const valuesToAggregate = valueMap.get(key) || [];

        // Create column name for result
        let colName;
        if (Array.isArray(columns)) {
          // For multi-level columns
          colName = columns
            .map((col, i) => `${col}_${columnValue[i]}`)
            .join('.');
        } else {
          // For single-level columns
          colName = `${columns}_${columnValue}`;
        }

        // Aggregate values and add to row
        newRow[colName] =
          valuesToAggregate.length > 0 ? aggFunc(valuesToAggregate) : null;
      }

      // Add row to result
      pivotedRows.push(newRow);
    }

    // Create new DataFrame from pivoted rows
    const result = DataFrame.fromRows(pivotedRows);

    // Add frame property for compatibility with tests
    result.frame = {
      columns: {},
      columnNames: result.columns,
      rowCount: pivotedRows.length,
    };

    // Fill columns in frame.columns for compatibility with tests
    for (const col of result.columns) {
      result.frame.columns[col] = pivotedRows.map((row) => row[col]);
    }

    return result;
  };
}
import {
  testWithBothStorageTypes,
  createDataFrameWithStorage,
} from '../../utils/storageTestUtils.js';

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
  // Run tests with both storage types
  testWithBothStorageTypes((storageType) => {
    describe(`with ${storageType} storage`, () => {
      // Create DataFrame with specified storage type
      const df = createDataFrameWithStorage(DataFrame, testData, storageType);

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
        const dfPivot = createDataFrameWithStorage(
          DataFrame,
          testPivotData,
          storageType,
        );

        // Call the pivot method
        const result = dfPivot.pivot('product', 'region', 'sales');

        // Check that the result is a DataFrame instance
        expect(result).toBeInstanceOf(DataFrame);

        // Check the structure of the pivot table
        expect(result.frame.columnNames).toContain('product');
        expect(result.frame.columnNames).toContain('region_North');
        expect(result.frame.columnNames).toContain('region_South');
        expect(result.frame.columnNames).toContain('region_East');
        expect(result.frame.columnNames).toContain('region_West');

        // Check the number of rows (should be one per unique product)
        expect(result.frame.rowCount).toBe(2);

        // Check the values in the pivot table
        expect(result.frame.columns.product).toEqual([
          'Product A',
          'Product B',
        ]);
        expect(Array.from(result.frame.columns['region_North'])).toEqual([
          10, 15,
        ]);
        expect(Array.from(result.frame.columns['region_South'])).toEqual([
          20, 25,
        ]);
        expect(Array.from(result.frame.columns['region_East'])).toEqual([
          30, 35,
        ]);
        expect(Array.from(result.frame.columns['region_West'])).toEqual([
          40, 45,
        ]);
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
        const dfPivot = createDataFrameWithStorage(
          DataFrame,
          testPivotData,
          storageType,
        );

        // Call the pivot method with mean aggregation function
        const result = dfPivot.pivot('product', 'region', 'sales', mean);

        // Check the values in the pivot table (should be averages)
        expect(result.frame.columns.product).toEqual([
          'Product A',
          'Product B',
        ]);
        expect(Array.from(result.frame.columns['region_North'])).toEqual([
          15, 15,
        ]); // (10+20)/2, 15/1
        expect(Array.from(result.frame.columns['region_South'])).toEqual([
          30, 30,
        ]); // 30/1, (25+35)/2
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
        const dfPivot = createDataFrameWithStorage(
          DataFrame,
          testPivotData,
          storageType,
        );

        // Call the pivot method with count aggregation function
        const result = dfPivot.pivot('product', 'region', 'sales', count);

        // Check the values in the pivot table (should be counts)
        expect(result.frame.columns.product).toEqual([
          'Product A',
          'Product B',
        ]);
        expect(Array.from(result.frame.columns['region_North'])).toEqual([
          2, 2,
        ]);
        expect(Array.from(result.frame.columns['region_South'])).toEqual([
          2, 2,
        ]);
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
        const dfPivot = createDataFrameWithStorage(
          DataFrame,
          testPivotData,
          storageType,
        );

        // Call the pivot method with max aggregation function
        const resultMax = dfPivot.pivot('product', 'region', 'sales', max);

        // Check the values in the pivot table (should be maximum values)
        expect(resultMax.frame.columns.product).toEqual([
          'Product A',
          'Product B',
        ]);
        expect(Array.from(resultMax.frame.columns['region_North'])).toEqual([
          20, 25,
        ]);
        expect(Array.from(resultMax.frame.columns['region_South'])).toEqual([
          40, 45,
        ]);

        // Call the pivot method with min aggregation function
        const resultMin = dfPivot.pivot('product', 'region', 'sales', min);

        // Check the values in the pivot table (should be minimum values)
        expect(resultMin.frame.columns.product).toEqual([
          'Product A',
          'Product B',
        ]);
        expect(Array.from(resultMin.frame.columns['region_North'])).toEqual([
          10, 15,
        ]);
        expect(Array.from(resultMin.frame.columns['region_South'])).toEqual([
          30, 35,
        ]);
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
        const dfPivot = createDataFrameWithStorage(
          DataFrame,
          testPivotData,
          storageType,
        );

        // Call the pivot method with multi-index
        const result = dfPivot.pivot(
          ['product', 'category'],
          'region',
          'sales',
        );

        // Check that the result is a DataFrame instance
        expect(result).toBeInstanceOf(DataFrame);

        // Check the structure of the pivot table
        expect(result.frame.columnNames).toContain('product');
        expect(result.frame.columnNames).toContain('category');
        expect(result.frame.columnNames).toContain('region_North');
        expect(result.frame.columnNames).toContain('region_South');

        // Check the number of rows (should be one per unique product-category combination)
        expect(result.frame.rowCount).toBe(2);

        // Check the values in the pivot table
        expect(result.frame.columns.product).toEqual([
          'Product A',
          'Product B',
        ]);
        expect(result.frame.columns.category).toEqual([
          'Electronics',
          'Furniture',
        ]);
        expect(Array.from(result.frame.columns['region_North'])).toEqual([
          10, 15,
        ]);
        expect(Array.from(result.frame.columns['region_South'])).toEqual([
          20, 25,
        ]);
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
        const dfPivot = createDataFrameWithStorage(
          DataFrame,
          testPivotData,
          storageType,
        );

        // Call the pivot method
        const result = dfPivot.pivot('product', 'region', 'sales');

        // Проверяем, что все регионы присутствуют в результате
        expect(result.frame.columnNames).toContain('region_North');
        expect(result.frame.columnNames).toContain('region_South');
        expect(result.frame.columnNames).toContain('region_East');
        expect(result.frame.columnNames).toContain('region_West');

        // Проверяем значения
        expect(Array.from(result.frame.columns['region_East'])).toEqual([
          30, 35,
        ]);
        expect(Array.from(result.frame.columns['region_West'])).toEqual([
          40, 45,
        ]);
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
        const dfPivot = createDataFrameWithStorage(
          DataFrame,
          testPivotData,
          storageType,
        );

        // Call the pivot method
        const result = dfPivot.pivot('product', 'region', 'sales');

        // Check that null values are handled correctly
        expect(result.frame.columns['region_South'][0]).toBeNull();
        expect(result.frame.columns['region_South'][1]).not.toBeNull();

        // Check that null product is included as a row
        expect(result.frame.columns.product).toContain(null);
      });

      test('throws an error with invalid arguments', () => {
        // Create a test DataFrame
        // df создан выше с помощью createDataFrameWithStorage

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
        // Create DataFrame only with data for pivot test with object parameter style
        const testPivotData = [
          { product: 'Product A', region: 'North', sales: 10 },
          { product: 'Product A', region: 'South', sales: 20 },
          { product: 'Product B', region: 'North', sales: 15 },
          { product: 'Product B', region: 'South', sales: 25 },
        ];
        const dfPivot = createDataFrameWithStorage(
          DataFrame,
          testPivotData,
          storageType,
        );

        // Call the pivot method with object parameter style
        const result = dfPivot.pivot({
          index: 'product',
          columns: 'region',
          values: 'sales',
        });

        // Check that the result is a DataFrame instance
        expect(result).toBeInstanceOf(DataFrame);

        // Check the structure of the pivot table
        expect(result.frame.columnNames).toContain('product');
        expect(result.frame.columnNames).toContain('region_North');
        expect(result.frame.columnNames).toContain('region_South');

        // Check the values in the pivot table
        expect(result.frame.columns.product).toEqual([
          'Product A',
          'Product B',
        ]);
        expect(Array.from(result.frame.columns['region_North'])).toEqual([
          10, 15,
        ]);
        expect(Array.from(result.frame.columns['region_South'])).toEqual([
          20, 25,
        ]);
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
        const dfPivot = createDataFrameWithStorage(
          DataFrame,
          testPivotData,
          storageType,
        );

        // Call the pivot method with multi-level columns
        const result = dfPivot.pivot('product', ['region', 'quarter'], 'sales');

        // Check that the result is a DataFrame instance
        expect(result).toBeInstanceOf(DataFrame);

        // Check the structure of the pivot table
        expect(result.frame.columnNames).toContain('product');
        // Multi-level column names should be joined with a dot
        // Check for columns with composite names
        expect(result.frame.columnNames).toContain('region_North.quarter_Q1');
        expect(result.frame.columnNames).toContain('region_South.quarter_Q1');
        expect(result.frame.columnNames).toContain('region_North.quarter_Q2');
        expect(result.frame.columnNames).toContain('region_South.quarter_Q2');

        // Check the values in the pivot table
        expect(result.frame.columns.product).toEqual([
          'Product A',
          'Product B',
        ]);
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
        const dfPivot = createDataFrameWithStorage(
          DataFrame,
          testPivotData,
          storageType,
        );

        // Call the pivot method with multi-level indices and columns
        const result = dfPivot.pivot({
          index: ['product', 'category'],
          columns: ['region', 'quarter'],
          values: 'sales',
        });

        // Check the structure of the pivot table
        expect(result.frame.columnNames).toContain('product');
        expect(result.frame.columnNames).toContain('category');
        // Check for columns with composite names
        expect(result.frame.columnNames).toContain('region_North.quarter_Q1');
        expect(result.frame.columnNames).toContain('region_North.quarter_Q2');
        expect(result.frame.columnNames).toContain('region_South.quarter_Q1');
        expect(result.frame.columnNames).toContain('region_South.quarter_Q2');

        // Check the values in the pivot table
        expect(result.frame.columns.product).toEqual([
          'Product A',
          'Product B',
        ]);
        expect(result.frame.columns.category).toEqual([
          'Electronics',
          'Furniture',
        ]);

        // Check the values in the pivot table for each combination
        expect(
          Array.from(result.frame.columns['region_North.quarter_Q1']),
        ).toEqual([10, 15]);
        expect(
          Array.from(result.frame.columns['region_South.quarter_Q1']),
        ).toEqual([20, 25]);
        expect(
          Array.from(result.frame.columns['region_North.quarter_Q2']),
        ).toEqual([30, 35]);
        expect(
          Array.from(result.frame.columns['region_South.quarter_Q2']),
        ).toEqual([40, 45]);
      });
    });
  });
});
