import { describe, it, expect, vi } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import { print } from '../../../../src/methods/dataframe/display/print.js';

// Test data to be used in all tests
const sampleData = [
  { value: 10, category: 'A', mixed: '20' },
  { value: 20, category: 'B', mixed: 30 },
  { value: 30, category: 'A', mixed: null },
  { value: 40, category: 'C', mixed: undefined },
  { value: 50, category: 'B', mixed: NaN },
];

describe('DataFrame print method', () => {
  describe('with standard storage', () => {
    // Create test data frame with people data for better readability in tests
    const testData = [
      { name: 'Alice', age: 25, city: 'New York' },
      { name: 'Bob', age: 30, city: 'Boston' },
      { name: 'Charlie', age: 35, city: 'Chicago' },
      { name: 'David', age: 40, city: 'Denver' },
      { name: 'Eve', age: 45, city: 'El Paso' },
    ];

    // Create DataFrame using fromRecords
    const df = DataFrame.fromRecords(testData);

    it('should format data as a table string', () => {
      // Mock console.log to check output
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Call print function directly
      const printFn = print();
      printFn(df);

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
      // Mock console.log to prevent output
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Call print function and check the return value
      const printFn = print();
      const result = printFn(df);

      // Check that the function returns the frame
      expect(result).toBe(df);

      // Restore console.log
      consoleSpy.mockRestore();
    });

    it('should respect rows limit', () => {
      // Create a frame with many rows
      const largeData = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        value: i * 10,
      }));

      const largeDf = DataFrame.fromRecords(largeData);

      // Mock console.log
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Call print function with row limit
      const printFn = print();
      printFn(largeDf, 5);

      // Get the output
      const output = consoleSpy.mock.calls[0][0];

      // Check that the output contains message about additional rows
      expect(output).toContain('more rows');

      // Restore console.log
      consoleSpy.mockRestore();
    });

    it('should respect cols limit', () => {
      // Create a frame with many columns
      const wideData = {
        col1: [1, 2, 3],
        col2: [4, 5, 6],
        col3: [7, 8, 9],
        col4: [10, 11, 12],
        col5: [13, 14, 15],
      };

      const wideDf = DataFrame.fromRecords([
        { col1: 1, col2: 4, col3: 7, col4: 10, col5: 13 },
        { col1: 2, col2: 5, col3: 8, col4: 11, col5: 14 },
        { col1: 3, col2: 6, col3: 9, col4: 12, col5: 15 },
      ]);

      // Mock console.log
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Call print function with column limit
      const printFn = print();
      printFn(wideDf, Infinity, 2);

      // Get the output
      const output = consoleSpy.mock.calls[0][0];

      // Check that the output contains message about additional columns
      expect(output).toContain('more columns');

      // Restore console.log
      consoleSpy.mockRestore();
    });
  });
});
