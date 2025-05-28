import { describe, it, expect } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import { min } from '../../../../src/methods/dataframe/aggregation/min.js';

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

describe('min method', () => {
  // Запускаем тесты с обоими типами хранилища
  testWithBothStorageTypes((storageType) => {
    describe(`with ${storageType} storage`, () => {
      // Создаем DataFrame с указанным типом хранилища
      const df = createDataFrameWithStorage(DataFrame, testData, storageType);

      it('should find the minimum value in a numeric column', () => {
        // Call min function directly
        const minFn = min({ validateColumn: () => {} });
        const result = minFn(df, 'value');

        // Check that the minimum is correct
        expect(result).toBe(10);
      });

      it('should handle mixed data types by converting to numbers', () => {
        // Call min function directly
        const minFn = min({ validateColumn: () => {} });
        const result = minFn(df, 'mixed');

        // Check that the minimum is correct (only valid numbers are considered)
        expect(result).toBe(20); // '20' -> 20, 30 -> 30, null/undefined/NaN are skipped
      });

      it('should return null for a column with no valid numeric values', () => {
        // Call min function directly
        const minFn = min({ validateColumn: () => {} });
        const result = minFn(df, 'category');

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

        // Call min function with validator
        const minFn = min({ validateColumn });

        // Check that it throws an error for non-existent column
        expect(() => minFn(df, 'nonexistent')).toThrow(
          'Column \'nonexistent\' not found',
        );
      });

      it('should handle empty frames', () => {
        // Create an empty DataFrame
        const emptyDf = createDataFrameWithStorage(DataFrame, [], storageType);

        // Call min function directly with a validator that doesn't throw for empty frames
        const validateColumn = () => {}; // Пустой валидатор, который ничего не проверяет
        const minFn = min({ validateColumn });

        // Проверяем, что для пустого DataFrame результат равен null
        expect(minFn(emptyDf, 'value')).toBe(null);
      });
    });
  });
});
