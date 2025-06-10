/**
 * Unit tests for head method
 */

import { describe, it, expect, vi } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import registerDataFrameFiltering from '../../../../src/methods/dataframe/filtering/register.js';

// Test data for use in all tests
const testData = [
  { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
  { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
  { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
  { name: 'David', age: 40, city: 'Boston', salary: 95000 },
  { name: 'Eve', age: 45, city: 'Seattle', salary: 100000 },
];

describe('DataFrame.head()', () => {
  // Регистрируем методы фильтрации для DataFrame
  registerDataFrameFiltering(DataFrame);

  describe('with standard storage', () => {
    // Create DataFrame using fromRows
    const df = DataFrame.fromRows(testData);

    it('should return the first 5 rows by default', () => {
      const result = df.head(5, { print: false });

      expect(result.rowCount).toBe(5);
      expect(result.toArray()).toEqual([
        { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
        { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
        { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
        { name: 'David', age: 40, city: 'Boston', salary: 95000 },
        { name: 'Eve', age: 45, city: 'Seattle', salary: 100000 },
      ]);
    });

    it('should return the specified number of rows', () => {
      const result = df.head(3, { print: false });

      expect(result.rowCount).toBe(3);
      expect(result.toArray()).toEqual([
        { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
        { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
        { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
      ]);
    });

    it('should return all rows if n is greater than the number of rows', () => {
      const result = df.head(20, { print: false });

      expect(result.rowCount).toBe(5);
      expect(result.toArray()).toEqual([
        { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
        { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
        { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
        { name: 'David', age: 40, city: 'Boston', salary: 95000 },
        { name: 'Eve', age: 45, city: 'Seattle', salary: 100000 },
      ]);
    });

    it('should return an empty DataFrame if the original DataFrame is empty', () => {
      // Create empty DataFrame for testing
      const emptyDf = DataFrame.fromRows([]);
      const result = emptyDf.head(5, { print: false });

      expect(result.rowCount).toBe(0);
      expect(result.toArray()).toEqual([]);
    });

    it('should throw an error if n is not a positive integer', () => {
      expect(() => df.head(0, { print: false })).toThrow(
        'Number of rows must be a positive number',
      );
      expect(() => df.head(-1, { print: false })).toThrow(
        'Number of rows must be a positive number',
      );
      expect(() => df.head(2.5, { print: false })).toThrow(
        'Number of rows must be an integer',
      );
    });

    // Tests for print option are included for completeness
    // In the future, if DataFrame gets a print method, these tests will be relevant

    it('should handle print option correctly', () => {
      // Check that print option doesn't affect the result
      const result1 = df.head(3, { print: true });
      const result2 = df.head(3, { print: false });

      expect(result1.rowCount).toBe(3);
      expect(result2.rowCount).toBe(3);

      // Check that results are identical
      expect(result1.toArray()).toEqual(result2.toArray());
    });
  });
});
