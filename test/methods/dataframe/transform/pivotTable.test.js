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

describe('DataFrame.pivotTable', () => {
  // Запускаем тесты с обоими типами хранилища
  testWithBothStorageTypes((storageType) => {
    describe(`with ${storageType} storage`, () => {
      // Создаем DataFrame с указанным типом хранилища
      const df = createDataFrameWithStorage(DataFrame, testData, storageType);

      test('creates a pivot table with a single aggregation function', () => {
        // Create a test DataFrame with sales data
        // df создан выше с помощью createDataFrameWithStorage

        // Call the pivotTable method with a single aggregation function
        const result = df.pivotTable({
          index: 'product',
          columns: 'region',
          values: 'sales',
          aggFunc: sum,
        });

        // Check that the result is a DataFrame instance
        expect(result).toBeInstanceOf(DataFrame);

        // Check the structure of the pivot table
        expect(result.frame.columnNames).toContain('product');
        expect(result.frame.columnNames).toContain('region_North.sales');
        expect(result.frame.columnNames).toContain('region_South.sales');
        expect(result.frame.columnNames).toContain('region_East.sales');
        expect(result.frame.columnNames).toContain('region_West.sales');

        // Check the values in the pivot table
        expect(Array.from(result.frame.columns.product)).toEqual([
          'Product A',
          'Product B',
        ]);
        expect(Array.from(result.frame.columns['region_North.sales'])).toEqual([
          10, 15,
        ]);
        expect(Array.from(result.frame.columns['region_South.sales'])).toEqual([
          20, 25,
        ]);
        expect(Array.from(result.frame.columns['region_East.sales'])).toEqual([
          30, 35,
        ]);
        expect(Array.from(result.frame.columns['region_West.sales'])).toEqual([
          40, 45,
        ]);
      });

      test('creates a pivot table with multiple aggregation functions as an array', () => {
        // Create a test DataFrame with multiple sales entries per region
        // df создан выше с помощью createDataFrameWithStorage

        // Call the pivotTable method with multiple aggregation functions
        const result = df.pivotTable({
          index: 'product',
          columns: 'region',
          values: 'sales',
          aggFunc: [sum, mean, count],
        });

        // Check the structure of the pivot table
        expect(result.frame.columnNames).toContain('product');
        expect(result.frame.columnNames).toContain('region_North.sales_sum');
        expect(result.frame.columnNames).toContain('region_North.sales_mean');
        expect(result.frame.columnNames).toContain('region_North.sales_count');
        expect(result.frame.columnNames).toContain('region_South.sales_sum');
        expect(result.frame.columnNames).toContain('region_South.sales_mean');
        expect(result.frame.columnNames).toContain('region_South.sales_count');

        // Check the values for sum aggregation
        expect(
          Array.from(result.frame.columns['region_North.sales_sum']),
        ).toEqual([30, 15]); // 10+20, 15
        expect(
          Array.from(result.frame.columns['region_South.sales_sum']),
        ).toEqual([30, 60]); // 30, 25+35

        // Check the values for mean aggregation
        expect(
          Array.from(result.frame.columns['region_North.sales_mean']),
        ).toEqual([15, 15]); // (10+20)/2, 15/1
        expect(
          Array.from(result.frame.columns['region_South.sales_mean']),
        ).toEqual([30, 30]); // 30/1, (25+35)/2

        // Check the values for count aggregation
        expect(
          Array.from(result.frame.columns['region_North.sales_count']),
        ).toEqual([2, 1]); // 2 entries for Product A, 1 for Product B
        expect(
          Array.from(result.frame.columns['region_South.sales_count']),
        ).toEqual([1, 2]); // 1 entry for Product A, 2 for Product B

        // Check metadata for aggregation functions
        expect(result.frame.metadata.aggregationFunctions).toEqual([
          'sales_sum',
          'sales_mean',
          'sales_count',
        ]);
      });

      test('creates a pivot table with multiple aggregation functions as an object', () => {
        // Create a test DataFrame with sales data
        // df создан выше с помощью createDataFrameWithStorage

        // Call the pivotTable method with multiple aggregation functions as an object
        const result = df.pivotTable({
          index: 'product',
          columns: 'region',
          values: 'sales',
          aggFunc: {
            total: sum,
            average: mean,
            minimum: min,
            maximum: max,
          },
        });

        // Check the structure of the pivot table
        expect(result.frame.columnNames).toContain('product');
        expect(result.frame.columnNames).toContain('region_North.total');
        expect(result.frame.columnNames).toContain('region_North.average');
        expect(result.frame.columnNames).toContain('region_North.minimum');
        expect(result.frame.columnNames).toContain('region_North.maximum');

        // Check the values for custom aggregation functions
        expect(Array.from(result.frame.columns['region_North.total'])).toEqual([
          10, 15,
        ]); // sum
        expect(
          Array.from(result.frame.columns['region_North.average']),
        ).toEqual([10, 15]); // mean
        expect(
          Array.from(result.frame.columns['region_North.minimum']),
        ).toEqual([10, 15]); // min
        expect(
          Array.from(result.frame.columns['region_North.maximum']),
        ).toEqual([10, 15]); // max

        expect(Array.from(result.frame.columns['region_South.total'])).toEqual([
          20, 25,
        ]); // sum
        expect(
          Array.from(result.frame.columns['region_South.average']),
        ).toEqual([20, 25]); // mean
        expect(
          Array.from(result.frame.columns['region_South.minimum']),
        ).toEqual([20, 25]); // min
        expect(
          Array.from(result.frame.columns['region_South.maximum']),
        ).toEqual([20, 25]); // max

        // Check metadata for aggregation functions
        expect(result.frame.metadata.aggregationFunctions).toEqual([
          'total',
          'average',
          'minimum',
          'maximum',
        ]);
      });

      test('supports multi-level indices and columns with multiple aggregation functions', () => {
        // Create a test DataFrame with multiple dimensions
        // df создан выше с помощью createDataFrameWithStorage

        // Call the pivotTable method with multi-level indices and columns
        const result = df.pivotTable({
          index: ['product', 'category'],
          columns: ['region', 'quarter'],
          values: 'sales',
          aggFunc: [sum, mean],
        });

        // Check the structure of the pivot table
        expect(result.frame.columnNames).toContain('product');
        expect(result.frame.columnNames).toContain('category');
        expect(result.frame.columnNames).toContain(
          'region_North.quarter_Q1.sales_sum',
        );
        expect(result.frame.columnNames).toContain(
          'region_North.quarter_Q2.sales_sum',
        );
        expect(result.frame.columnNames).toContain(
          'region_South.quarter_Q1.sales_sum',
        );
        expect(result.frame.columnNames).toContain(
          'region_South.quarter_Q2.sales_sum',
        );
        expect(result.frame.columnNames).toContain(
          'region_North.quarter_Q1.sales_mean',
        );
        expect(result.frame.columnNames).toContain(
          'region_North.quarter_Q2.sales_mean',
        );
        expect(result.frame.columnNames).toContain(
          'region_South.quarter_Q1.sales_mean',
        );
        expect(result.frame.columnNames).toContain(
          'region_South.quarter_Q2.sales_mean',
        );

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
          result.frame.columns['region_North.quarter_Q1.sales_sum'][
            productAElectronicsIdx
          ],
        ).toBe(10);
        expect(
          result.frame.columns['region_North.quarter_Q2.sales_sum'][
            productAElectronicsIdx
          ],
        ).toBe(15);
        expect(
          result.frame.columns['region_South.quarter_Q1.sales_sum'][
            productAElectronicsIdx
          ],
        ).toBe(20);
        expect(
          result.frame.columns['region_South.quarter_Q2.sales_sum'][
            productAElectronicsIdx
          ],
        ).toBe(25);

        expect(
          result.frame.columns['region_North.quarter_Q1.sales_sum'][
            productBFurnitureIdx
          ],
        ).toBe(30);
        expect(
          result.frame.columns['region_North.quarter_Q2.sales_sum'][
            productBFurnitureIdx
          ],
        ).toBe(35);
        expect(
          result.frame.columns['region_South.quarter_Q1.sales_sum'][
            productBFurnitureIdx
          ],
        ).toBe(40);
        expect(
          result.frame.columns['region_South.quarter_Q2.sales_sum'][
            productBFurnitureIdx
          ],
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
        expect(result.frame.metadata.aggregationFunctions).toEqual([
          'sales_sum',
          'sales_mean',
        ]);
      });

      test('throws an error with invalid aggregation functions', () => {
        // Create a test DataFrame
        // df создан выше с помощью createDataFrameWithStorage

        // Check that the method throws an error if aggFunc is not a function, array, or object
        expect(() =>
          df.pivotTable({
            index: 'product',
            columns: 'region',
            values: 'sales',
            aggFunc: 'not a function',
          }),
        ).toThrow();

        // Check that the method throws an error if array contains non-functions
        expect(() =>
          df.pivotTable({
            index: 'product',
            columns: 'region',
            values: 'sales',
            aggFunc: [sum, 'not a function'],
          }),
        ).toThrow();

        // Check that the method throws an error if object contains non-functions
        expect(() =>
          df.pivotTable({
            index: 'product',
            columns: 'region',
            values: 'sales',
            aggFunc: { total: sum, average: 'not a function' },
          }),
        ).toThrow();
      });
    });
  });
});
