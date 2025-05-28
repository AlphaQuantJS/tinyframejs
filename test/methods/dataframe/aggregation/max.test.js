import { describe, it, expect } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import { max } from '../../../../src/methods/dataframe/aggregation/max.js';

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

describe('max method', () => {
  // Запускаем тесты с обоими типами хранилища
  testWithBothStorageTypes((storageType) => {
    describe(`with ${storageType} storage`, () => {
      // Создаем DataFrame с указанным типом хранилища
      const df = createDataFrameWithStorage(DataFrame, testData, storageType);

      it('should find the maximum value in a numeric column', () => {
        // Call max function directly
        const maxFn = max({ validateColumn: () => {} });
        const result = maxFn(df, 'value');

        // Check that the maximum is correct
        expect(result).toBe(50);
      });

      it('should handle mixed data types by converting to numbers', () => {
        // Call max function directly
        const maxFn = max({ validateColumn: () => {} });
        const result = maxFn(df, 'mixed');

        // Check that the maximum is correct (only valid numbers are considered)
        expect(result).toBe(30); // '20' -> 20, 30 -> 30, null/undefined/NaN are skipped
      });

      it('should return null for a column with no valid numeric values', () => {
        // Call max function directly
        const maxFn = max({ validateColumn: () => {} });
        const result = maxFn(df, 'category');

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

        // Call max function with validator
        const maxFn = max({ validateColumn });

        // Check that it throws an error for non-existent column
        expect(() => maxFn(df, 'nonexistent')).toThrow(
          'Column \'nonexistent\' not found',
        );
      });

      it('should handle empty frames', () => {
        // Create an empty DataFrame
        const emptyDf = createDataFrameWithStorage(DataFrame, [], storageType);

        // Call max function directly with a validator that doesn't throw for empty frames
        const validateColumn = () => {}; // Пустой валидатор, который ничего не проверяет
        const maxFn = max({ validateColumn });

        // Проверяем, что для пустого DataFrame результат равен null
        expect(maxFn(emptyDf, 'value')).toBe(null);
      });
    });
  });
});
