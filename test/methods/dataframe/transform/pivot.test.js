import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import {
  testWithBothStorageTypes,
  createDataFrameWithStorage,
} from '../../../utils/storageTestUtils.js';
import {
  sum,
  mean,
  count,
  max,
  min,
} from '../../../../src/methods/dataframe/transform/pivot.js';

// Тестовые данные для использования во всех тестах
const testData = [
  { value: 10, category: 'A', mixed: '20' },
  { value: 20, category: 'B', mixed: 30 },
  { value: 30, category: 'A', mixed: null },
  { value: 40, category: 'C', mixed: undefined },
  { value: 50, category: 'B', mixed: NaN },
];

describe('DataFrame.pivot', () => {
  // Запускаем тесты с обоими типами хранилища
  testWithBothStorageTypes((storageType) => {
    describe(`with ${storageType} storage`, () => {
      // Создаем DataFrame с указанным типом хранилища
      const df = createDataFrameWithStorage(DataFrame, testData, storageType);

      test('creates a pivot table with default aggregation function (sum)', () => {
        // Create a test DataFrame with sales data
        // df создан выше с помощью createDataFrameWithStorage

        // Call the pivot method
        const result = df.pivot('product', 'region', 'sales');

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
        expect(Array.from(result.frame.columns.product)).toEqual([
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
        // Create a test DataFrame with multiple sales entries per region
        // df создан выше с помощью createDataFrameWithStorage

        // Call the pivot method with mean aggregation function
        const result = df.pivot('product', 'region', 'sales', mean);

        // Check the values in the pivot table (should be averages)
        expect(Array.from(result.frame.columns.product)).toEqual([
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
        // Create a test DataFrame with multiple entries
        // df создан выше с помощью createDataFrameWithStorage

        // Call the pivot method with count aggregation function
        const result = df.pivot('product', 'region', 'sales', count);

        // Check the values in the pivot table (should be counts)
        expect(Array.from(result.frame.columns.product)).toEqual([
          'Product A',
          'Product B',
        ]);
        expect(Array.from(result.frame.columns['region_North'])).toEqual([
          2, 1,
        ]); // 2 entries for Product A, 1 for Product B
        expect(Array.from(result.frame.columns['region_South'])).toEqual([
          1, 2,
        ]); // 1 entry for Product A, 2 for Product B
      });

      test('uses built-in max and min aggregation functions', () => {
        // Create a test DataFrame with multiple entries
        // df создан выше с помощью createDataFrameWithStorage

        // Call the pivot method with max aggregation function
        const resultMax = df.pivot('product', 'region', 'sales', max);

        // Check max values
        expect(Array.from(resultMax.frame.columns['region_North'])).toEqual([
          20, 15,
        ]); // max of [10,20] and [15]
        expect(Array.from(resultMax.frame.columns['region_South'])).toEqual([
          30, 35,
        ]); // max of [30] and [25,35]

        // Call the pivot method with min aggregation function
        const resultMin = df.pivot('product', 'region', 'sales', min);

        // Check min values
        expect(Array.from(resultMin.frame.columns['region_North'])).toEqual([
          10, 15,
        ]); // min of [10,20] and [15]
        expect(Array.from(resultMin.frame.columns['region_South'])).toEqual([
          30, 25,
        ]); // min of [30] and [25,35]
      });

      test('handles multi-index pivot tables', () => {
        // Create a test DataFrame with multiple dimensions
        // df создан выше с помощью createDataFrameWithStorage

        // Call the pivot method with multiple index columns
        const result = df.pivot(['product', 'category'], 'region', 'sales');

        // Check the structure of the pivot table
        expect(result.frame.columnNames).toContain('product');
        expect(result.frame.columnNames).toContain('category');
        expect(result.frame.columnNames).toContain('region_North');
        expect(result.frame.columnNames).toContain('region_South');

        // Check the number of rows (should be one per unique product-category combination)
        // Our implementation generates all possible combinations of index values
        // So with 2 products and 2 categories, we expect 4 rows (2x2)
        expect(result.frame.rowCount).toBe(4);

        // Find rows for product-category combinations that exist in the data
        let productAElectronicsIdx = -1;
        let productBFurnitureIdx = -1;

        // Find indices for combinations of Product A + Electronics and Product B + Furniture
        for (let i = 0; i < result.frame.rowCount; i++) {
          if (
            result.frame.columns.product[i] === 'Product A' &&
            result.frame.columns.category[i] === 'Electronics'
          ) {
            productAElectronicsIdx = i;
          }
          if (
            result.frame.columns.product[i] === 'Product B' &&
            result.frame.columns.category[i] === 'Furniture'
          ) {
            productBFurnitureIdx = i;
          }
        }

        // Check sales values for combinations that exist in the data
        const northValues = Array.from(result.frame.columns['region_North']);
        const southValues = Array.from(result.frame.columns['region_South']);

        // Verify that the values for existing combinations are correct
        expect(northValues[productAElectronicsIdx]).toBe(10);
        expect(southValues[productAElectronicsIdx]).toBe(20);
        expect(northValues[productBFurnitureIdx]).toBe(30);
        expect(southValues[productBFurnitureIdx]).toBe(40);

        // Check that other combinations have either NaN, null, or 0 values
        const otherIndices = [...Array(result.frame.rowCount).keys()].filter(
          (i) => i !== productAElectronicsIdx && i !== productBFurnitureIdx,
        );

        for (const idx of otherIndices) {
          // In our implementation, missing values can be represented in different ways
          const northValueIsEmpty =
            northValues[idx] === null ||
            northValues[idx] === undefined ||
            isNaN(northValues[idx]) ||
            northValues[idx] === 0;
          const southValueIsEmpty =
            southValues[idx] === null ||
            southValues[idx] === undefined ||
            isNaN(southValues[idx]) ||
            southValues[idx] === 0;

          expect(northValueIsEmpty).toBe(true);
          expect(southValueIsEmpty).toBe(true);
        }
      });

      test('handles missing values in pivot table', () => {
        // Create a test DataFrame with missing combinations
        // df создан выше с помощью createDataFrameWithStorage

        // Call the pivot method
        const result = df.pivot('product', 'region', 'sales');

        // Check the values in the pivot table (missing combinations should be NaN for numeric columns)
        expect(Array.from(result.frame.columns.product)).toEqual([
          'Product A',
          'Product B',
        ]);
        expect(Array.from(result.frame.columns['region_North'])).toEqual([
          10, 15,
        ]);

        // Check that missing value is NaN (since sales is numeric)
        const southValues = Array.from(result.frame.columns['region_South']);
        expect(southValues[0]).toBe(20);
        // In our implementation, missing numeric values are set to NaN
        const missingValue = southValues[1];
        expect(missingValue === null || isNaN(missingValue)).toBe(true);
      });

      test('handles null values correctly', () => {
        // Create a test DataFrame with null values
        // df создан выше с помощью createDataFrameWithStorage

        // Call the pivot method
        const result = df.pivot('product', 'region', 'sales');

        // Check that null values are handled correctly
        expect(result.frame.columnNames).toContain('product');
        expect(result.frame.columnNames).toContain('region_North');
        expect(result.frame.columnNames).toContain('region_South');

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
        // Create a test DataFrame with sales data
        // df создан выше с помощью createDataFrameWithStorage

        // Call the pivot method with object parameter style
        const result = df.pivot({
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
        expect(Array.from(result.frame.columns.product)).toEqual([
          'Product A',
          'Product B',
        ]);
        expect(Array.from(result.frame.columns['region_North'])).toEqual([
          10, 30,
        ]);
        expect(Array.from(result.frame.columns['region_South'])).toEqual([
          20, 40,
        ]);
      });

      test('supports multi-level columns', () => {
        // Create a test DataFrame with multiple dimensions
        // df создан выше с помощью createDataFrameWithStorage

        // Call the pivot method with multi-level columns
        const result = df.pivot({
          index: 'product',
          columns: ['region', 'quarter'],
          values: 'sales',
        });

        // Check the structure of the pivot table
        expect(result.frame.columnNames).toContain('product');
        expect(result.frame.columnNames).toContain('region_North.quarter_Q1');
        expect(result.frame.columnNames).toContain('region_North.quarter_Q2');
        expect(result.frame.columnNames).toContain('region_South.quarter_Q1');
        expect(result.frame.columnNames).toContain('region_South.quarter_Q2');

        // Check the values in the pivot table
        expect(Array.from(result.frame.columns.product)).toEqual([
          'Product A',
          'Product B',
        ]);
        expect(
          Array.from(result.frame.columns['region_North.quarter_Q1']),
        ).toEqual([10, 30]);
        expect(
          Array.from(result.frame.columns['region_North.quarter_Q2']),
        ).toEqual([15, 35]);
        expect(
          Array.from(result.frame.columns['region_South.quarter_Q1']),
        ).toEqual([20, 40]);
        expect(
          Array.from(result.frame.columns['region_South.quarter_Q2']),
        ).toEqual([25, 45]);

        // Check metadata for multi-level columns
        expect(result.frame.metadata.multiLevelColumns).toEqual([
          'region',
          'quarter',
        ]);
      });

      test('supports multi-level indices and multi-level columns', () => {
        // Create a test DataFrame with multiple dimensions
        // df создан выше с помощью createDataFrameWithStorage

        // Call the pivot method with multi-level indices and columns
        const result = df.pivot({
          index: ['product', 'category'],
          columns: ['region', 'quarter'],
          values: 'sales',
        });

        // Check the structure of the pivot table
        expect(result.frame.columnNames).toContain('product');
        expect(result.frame.columnNames).toContain('category');
        expect(result.frame.columnNames).toContain('region_North.quarter_Q1');
        expect(result.frame.columnNames).toContain('region_North.quarter_Q2');
        expect(result.frame.columnNames).toContain('region_South.quarter_Q1');
        expect(result.frame.columnNames).toContain('region_South.quarter_Q2');

        // Check the number of rows (should be one per unique product-category combination)
        expect(result.frame.rowCount).toBe(4); // 2 products x 2 categories = 4 combinations

        // Find rows for product-category combinations that exist in the data
        let productAElectronicsIdx = -1;
        let productBFurnitureIdx = -1;

        // Find indices for combinations of Product A + Electronics and Product B + Furniture
        for (let i = 0; i < result.frame.rowCount; i++) {
          if (
            result.frame.columns.product[i] === 'Product A' &&
            result.frame.columns.category[i] === 'Electronics'
          ) {
            productAElectronicsIdx = i;
          }
          if (
            result.frame.columns.product[i] === 'Product B' &&
            result.frame.columns.category[i] === 'Furniture'
          ) {
            productBFurnitureIdx = i;
          }
        }

        // Check sales values for combinations that exist in the data
        expect(
          result.frame.columns['region_North.quarter_Q1'][
            productAElectronicsIdx
          ],
        ).toBe(10);
        expect(
          result.frame.columns['region_North.quarter_Q2'][
            productAElectronicsIdx
          ],
        ).toBe(15);
        expect(
          result.frame.columns['region_South.quarter_Q1'][
            productAElectronicsIdx
          ],
        ).toBe(20);
        expect(
          result.frame.columns['region_South.quarter_Q2'][
            productAElectronicsIdx
          ],
        ).toBe(25);

        expect(
          result.frame.columns['region_North.quarter_Q1'][productBFurnitureIdx],
        ).toBe(30);
        expect(
          result.frame.columns['region_North.quarter_Q2'][productBFurnitureIdx],
        ).toBe(35);
        expect(
          result.frame.columns['region_South.quarter_Q1'][productBFurnitureIdx],
        ).toBe(40);
        expect(
          result.frame.columns['region_South.quarter_Q2'][productBFurnitureIdx],
        ).toBe(45);

        // Check metadata for multi-level indices and columns
        expect(result.frame.metadata.multiLevelIndex).toEqual([
          'product',
          'category',
        ]);
        expect(result.frame.metadata.multiLevelColumns).toEqual([
          'region',
          'quarter',
        ]);
      });
    });
  });
});
