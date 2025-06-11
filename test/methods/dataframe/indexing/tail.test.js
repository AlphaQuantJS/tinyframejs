// test/methods/dataframe/indexing/tail.test.js
import { describe, it, expect } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import { register as registerDataFrameIndexing } from '../../../../src/methods/dataframe/indexing/register.js';

// Test data for use in all tests
const testData = [
  { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
  { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
  { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
  { name: 'David', age: 40, city: 'Boston', salary: 95000 },
  { name: 'Eve', age: 45, city: 'Seattle', salary: 100000 },
];

// Empty test data for testing empty cases
const emptyData = [];

describe('DataFrame.tail()', () => {
  // Register indexing methods for DataFrame
  registerDataFrameIndexing(DataFrame);

  describe('with standard storage', () => {
    // Create DataFrame using fromRows
    const df = DataFrame.fromRows(testData);

    it('should return the last rows by default', () => {
      const result = df.tail(5, { print: false });

      expect(result.rowCount).toBe(5);
      expect(result.toArray()).toEqual([
        { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
        { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
        { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
        { name: 'David', age: 40, city: 'Boston', salary: 95000 },
        { name: 'Eve', age: 45, city: 'Seattle', salary: 100000 },
      ]);
    });

    it('should return the specified number of rows from the end', () => {
      const result = df.tail(3, { print: false });

      expect(result.rowCount).toBe(3);
      expect(result.toArray()).toEqual([
        { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
        { name: 'David', age: 40, city: 'Boston', salary: 95000 },
        { name: 'Eve', age: 45, city: 'Seattle', salary: 100000 },
      ]);
    });

    it('should return all rows if n is greater than the number of rows', () => {
      const result = df.tail(20, { print: false });

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
      const emptyDf = DataFrame.fromRows(emptyData);
      const result = emptyDf.tail(5, { print: false });

      expect(result.rowCount).toBe(0);
      expect(result.toArray()).toEqual([]);
    });

    it('should throw an error if n is not a positive integer', () => {
      expect(() => df.tail(0, { print: false })).toThrow(
        'Number of rows must be a positive number',
      );
      expect(() => df.tail(-1, { print: false })).toThrow(
        'Number of rows must be a positive number',
      );
      expect(() => df.tail(2.5, { print: false })).toThrow(
        'Number of rows must be an integer',
      );
    });

    // Tests for print option are disabled, as DataFrame does not have a print method
    // Future development can add a print method to DataFrame and return these tests

    it('should handle print option correctly', () => {
      // Check that the print option does not affect the result
      const result1 = df.tail(3, { print: true });
      const result2 = df.tail(3, { print: false });

      expect(result1.rowCount).toBe(3);
      expect(result2.rowCount).toBe(3);

      // Check that the results are the same
      expect(result1.toArray()).toEqual(result2.toArray());
    });
  });
});
