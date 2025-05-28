import { describe, it, expect, vi } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import { print } from '../../../../src/methods/dataframe/display/print.js';

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

describe('DataFrame print method', () => {
  // Запускаем тесты с обоими типами хранилища
  testWithBothStorageTypes((storageType) => {
    describe(`with ${storageType} storage`, () => {
      // Создаем DataFrame с указанным типом хранилища
      const df = createDataFrameWithStorage(DataFrame, testData, storageType);

      // Create test data frame
      const testData = [
        { name: 'Alice', age: 25, city: 'New York' },
        { name: 'Bob', age: 30, city: 'Boston' },
        { name: 'Charlie', age: 35, city: 'Chicago' },
        { name: 'David', age: 40, city: 'Denver' },
        { name: 'Eve', age: 45, city: 'El Paso' },
      ];

      // df создан выше с помощью createDataFrameWithStorage

      it('should format data as a table string', () => {
        // Mock console.log to check output
        const consoleSpy = vi
          .spyOn(console, 'log')
          .mockImplementation(() => {});

        // Call print function directly
        const printFn = print();
        printFn(df._frame);

        // Check that console.log was called
        expect(consoleSpy).toHaveBeenCalled();

        // Get the argument passed to console.log
        const output = consoleSpy.mock.calls[0][0];

        // Check that the output contains column headers
        expect(output).toContain('name');
        expect(output).toContain('age');
        expect(output).toContain('city');

        // Check that the output contains data
        expect(output).toContain('Alice');
        expect(output).toContain('25');
        expect(output).toContain('New York');

        // Restore console.log
        consoleSpy.mockRestore();
      });

      it('should return the frame for method chaining', () => {
        // Mock console.log
        const consoleSpy = vi
          .spyOn(console, 'log')
          .mockImplementation(() => {});

        // Call print function directly
        const printFn = print();
        const result = printFn(df._frame);

        // Check that the function returns the frame
        expect(result).toBe(df._frame);

        // Restore console.log
        consoleSpy.mockRestore();
      });

      it('should respect rows limit', () => {
        // Create a frame with many rows
        const largeData = Array.from({ length: 20 }, (_, i) => ({
          id: i,
          value: i * 10,
        }));

        const largeDf = DataFrame.create(largeData);

        // Mock console.log
        const consoleSpy = vi
          .spyOn(console, 'log')
          .mockImplementation(() => {});

        // Call print function with row limit
        const printFn = print();
        printFn(largeDf._frame, 5);

        // Get the output
        const output = consoleSpy.mock.calls[0][0];

        // Check that the output contains message about additional rows
        expect(output).toContain('more rows');

        // Restore console.log
        consoleSpy.mockRestore();
      });

      it('should respect cols limit', () => {
        // Create a frame with many columns
        const wideData = [
          { col1: 1, col2: 2, col3: 3, col4: 4, col5: 5, col6: 6 },
        ];

        const wideDf = DataFrame.create(wideData);

        // Mock console.log
        const consoleSpy = vi
          .spyOn(console, 'log')
          .mockImplementation(() => {});

        // Call print function with column limit
        const printFn = print();
        printFn(wideDf._frame, undefined, 3);

        // Get the output
        const output = consoleSpy.mock.calls[0][0];

        // Check that the output contains message about additional columns
        expect(output).toContain('more columns');

        // Restore console.log
        consoleSpy.mockRestore();
      });
    });
  });
});
