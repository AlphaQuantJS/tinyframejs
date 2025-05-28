import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';

import {
  testWithBothStorageTypes,
  createDataFrameWithStorage,
} from '../../../utils/storageTestUtils.js';

// Тестовые данные для использования во всех тестах
const testData = [
  { value: 10, category: 'A', mixed: '20' },
  { value: 20, category: 'B', mixed: 30 },
  { value: 30, category: 'A', mixed: null },
  { value: 40, category: 'C', mixed: undefined },
  { value: 50, category: 'B', mixed: NaN },
];

describe('DataFrame.unstack', () => {
  // Запускаем тесты с обоими типами хранилища
  testWithBothStorageTypes((storageType) => {
    describe(`with ${storageType} storage`, () => {
      // Создаем DataFrame с указанным типом хранилища
      const df = createDataFrameWithStorage(DataFrame, testData, storageType);

      test('unstacks rows into columns', () => {
        // Create a test DataFrame in long format
        // df создан выше с помощью createDataFrameWithStorage

        // Call the unstack method
        const result = df.unstack('product', 'region', 'sales');

        // Check that the result is a DataFrame instance
        expect(result).toBeInstanceOf(DataFrame);

        // Check the structure of the unstacked DataFrame
        expect(result.frame.columnNames).toContain('product');
        expect(result.frame.columnNames).toContain('North');
        expect(result.frame.columnNames).toContain('South');
        expect(result.frame.columnNames).toContain('East');
        expect(result.frame.columnNames).toContain('West');

        // Check the number of rows (should be one per unique product)
        expect(result.frame.rowCount).toBe(2);

        // Check the values in the unstacked DataFrame
        const products = Array.from(result.frame.columns.product);
        const northValues = Array.from(result.frame.columns.North);
        const southValues = Array.from(result.frame.columns.South);
        const eastValues = Array.from(result.frame.columns.East);
        const westValues = Array.from(result.frame.columns.West);

        expect(products).toEqual(['Product A', 'Product B']);
        expect(northValues).toEqual([10, 15]);
        expect(southValues).toEqual([20, 25]);
        expect(eastValues).toEqual([30, 35]);
        expect(westValues).toEqual([40, 45]);

        // Check metadata
        expect(result.frame.metadata.unstackedColumn).toBe('region');
        expect(result.frame.metadata.valueColumn).toBe('sales');
        expect(result.frame.metadata.indexColumns).toEqual(['product']);
      });

      test('unstacks with multiple index columns', () => {
        // Create a test DataFrame in long format
        // df создан выше с помощью createDataFrameWithStorage

        // Call the unstack method with multiple index columns
        const result = df.unstack(['product', 'category'], 'region', 'sales');

        // Check the structure of the unstacked DataFrame
        expect(result.frame.columnNames).toContain('product');
        expect(result.frame.columnNames).toContain('category');
        expect(result.frame.columnNames).toContain('North');
        expect(result.frame.columnNames).toContain('South');
        expect(result.frame.columnNames).toContain('East');
        expect(result.frame.columnNames).toContain('West');

        // Check the number of rows (should be one per unique product-category combination)
        expect(result.frame.rowCount).toBe(2);

        // Check the values in the unstacked DataFrame
        const products = Array.from(result.frame.columns.product);
        const categories = Array.from(result.frame.columns.category);
        const northValues = Array.from(result.frame.columns.North);
        const southValues = Array.from(result.frame.columns.South);
        const eastValues = Array.from(result.frame.columns.East);
        const westValues = Array.from(result.frame.columns.West);

        expect(products).toEqual(['Product A', 'Product B']);
        expect(categories).toEqual(['Electronics', 'Furniture']);
        expect(northValues).toEqual([10, 15]);
        expect(southValues).toEqual([20, 25]);
        expect(eastValues).toEqual([30, 35]);
        expect(westValues).toEqual([40, 45]);

        // Check metadata
        expect(result.frame.metadata.unstackedColumn).toBe('region');
        expect(result.frame.metadata.valueColumn).toBe('sales');
        expect(result.frame.metadata.indexColumns).toEqual([
          'product',
          'category',
        ]);
      });

      test('handles duplicate index values by using the last occurrence', () => {
        // Create a test DataFrame with duplicate index values
        // df создан выше с помощью createDataFrameWithStorage

        // Call the unstack method
        const result = df.unstack('product', 'region', 'sales');

        // Check the values in the unstacked DataFrame
        // The last occurrence of each duplicate should be used
        const products = Array.from(result.frame.columns.product);
        const northValues = Array.from(result.frame.columns.North);
        const southValues = Array.from(result.frame.columns.South);

        expect(products).toEqual(['Product A', 'Product B']);
        expect(northValues).toEqual([20, null]); // Last value for Product A, North is 20
        expect(southValues).toEqual([null, 40]); // Last value for Product B, South is 40
      });

      test('handles non-numeric values in unstack', () => {
        // Create a test DataFrame in long format
        // df создан выше с помощью createDataFrameWithStorage

        // Call the unstack method
        const result = df.unstack('product', 'year', 'status');

        // Check the column names in the unstacked DataFrame
        expect(result.frame.columnNames).toContain('product');
        expect(result.frame.columnNames).toContain('2023');
        expect(result.frame.columnNames).toContain('2024');

        // Check the values in the unstacked DataFrame
        const products = Array.from(result.frame.columns.product);
        const values2023 = Array.from(result.frame.columns['2023']);
        const values2024 = Array.from(result.frame.columns['2024']);

        expect(products).toEqual(['Product A', 'Product B']);
        expect(values2023).toEqual(['Active', 'Inactive']);
        expect(values2024).toEqual(['Inactive', 'Active']);
      });

      test('throws an error with invalid arguments', () => {
        // Create a test DataFrame
        // df создан выше с помощью createDataFrameWithStorage

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
});
