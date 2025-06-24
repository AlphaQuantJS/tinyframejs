/**
 * Unit tests for where method
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../../../packages/core/src/data/model/DataFrame.js';
import { where } from '../../../../../packages/core/src/methods/dataframe/filtering/where.js';

// Test data for use in all tests
const testData = [
  {
    name: 'Alice',
    age: 25,
    city: 'New York',
    salary: 70000,
    tags: ['dev', 'js'],
  },
  {
    name: 'Bob',
    age: 30,
    city: 'San Francisco',
    salary: 85000,
    tags: ['dev', 'python'],
  },
  {
    name: 'Charlie',
    age: 35,
    city: 'Chicago',
    salary: 90000,
    tags: ['manager'],
  },
];

describe('Where Method', () => {
  // Add where method to DataFrame prototype
  DataFrame.prototype.where = function (column, operator, value) {
    return where(this, column, operator, value);
  };

  describe('with standard storage', () => {
    // Create DataFrame using fromRecords
    const df = DataFrame.fromRecords(testData);

    test('should filter rows based on equality', () => {
      const result = df.where('age', '===', 30);

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(1);
      expect(result.toArray()).toEqual([
        {
          name: 'Bob',
          age: 30,
          city: 'San Francisco',
          salary: 85000,
          tags: ['dev', 'python'],
        },
      ]);
    });

    test('should filter rows based on loose equality', () => {
      const result = df.where('age', '==', '30');

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(1);
      expect(result.toArray()).toEqual([
        {
          name: 'Bob',
          age: 30,
          city: 'San Francisco',
          salary: 85000,
          tags: ['dev', 'python'],
        },
      ]);
    });

    test('should filter rows based on inequality', () => {
      const result = df.where('age', '!==', 30);

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(2);
      expect(result.toArray()).toEqual([
        {
          name: 'Alice',
          age: 25,
          city: 'New York',
          salary: 70000,
          tags: ['dev', 'js'],
        },
        {
          name: 'Charlie',
          age: 35,
          city: 'Chicago',
          salary: 90000,
          tags: ['manager'],
        },
      ]);
    });

    test('should filter rows based on loose inequality', () => {
      const result = df.where('age', '!=', '30');

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(2);
      expect(result.toArray()).toEqual([
        {
          name: 'Alice',
          age: 25,
          city: 'New York',
          salary: 70000,
          tags: ['dev', 'js'],
        },
        {
          name: 'Charlie',
          age: 35,
          city: 'Chicago',
          salary: 90000,
          tags: ['manager'],
        },
      ]);
    });

    test('should filter rows based on greater than', () => {
      const result = df.where('age', '>', 25);

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(2);
      expect(result.toArray()).toEqual([
        {
          name: 'Bob',
          age: 30,
          city: 'San Francisco',
          salary: 85000,
          tags: ['dev', 'python'],
        },
        {
          name: 'Charlie',
          age: 35,
          city: 'Chicago',
          salary: 90000,
          tags: ['manager'],
        },
      ]);
    });

    test('should filter rows based on greater than or equal', () => {
      const result = df.where('age', '>=', 30);

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(2);
      expect(result.toArray()).toEqual([
        {
          name: 'Bob',
          age: 30,
          city: 'San Francisco',
          salary: 85000,
          tags: ['dev', 'python'],
        },
        {
          name: 'Charlie',
          age: 35,
          city: 'Chicago',
          salary: 90000,
          tags: ['manager'],
        },
      ]);
    });

    test('should filter rows based on less than', () => {
      const result = df.where('age', '<', 30);

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(1);
      expect(result.toArray()).toEqual([
        {
          name: 'Alice',
          age: 25,
          city: 'New York',
          salary: 70000,
          tags: ['dev', 'js'],
        },
      ]);
    });

    test('should filter rows based on less than or equal', () => {
      const result = df.where('age', '<=', 30);

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(2);
      expect(result.toArray()).toEqual([
        {
          name: 'Alice',
          age: 25,
          city: 'New York',
          salary: 70000,
          tags: ['dev', 'js'],
        },
        {
          name: 'Bob',
          age: 30,
          city: 'San Francisco',
          salary: 85000,
          tags: ['dev', 'python'],
        },
      ]);
    });

    test('should filter rows based on in operator', () => {
      const result = df.where('age', 'in', [25, 35]);

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(2);
      expect(result.toArray()).toEqual([
        {
          name: 'Alice',
          age: 25,
          city: 'New York',
          salary: 70000,
          tags: ['dev', 'js'],
        },
        {
          name: 'Charlie',
          age: 35,
          city: 'Chicago',
          salary: 90000,
          tags: ['manager'],
        },
      ]);
    });

    test('should filter rows based on contains operator for strings', () => {
      const result = df.where('city', 'contains', 'Francisco');

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(1);
      expect(result.toArray()).toEqual([
        {
          name: 'Bob',
          age: 30,
          city: 'San Francisco',
          salary: 85000,
          tags: ['dev', 'python'],
        },
      ]);
    });

    test('should filter rows based on startsWith operator for strings', () => {
      const result = df.where('city', 'startsWith', 'San');

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(1);
      expect(result.toArray()).toEqual([
        {
          name: 'Bob',
          age: 30,
          city: 'San Francisco',
          salary: 85000,
          tags: ['dev', 'python'],
        },
      ]);
    });

    test('should filter rows based on endsWith operator for strings', () => {
      const result = df.where('city', 'endsWith', 'York');

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(1);
      expect(result.toArray()).toEqual([
        {
          name: 'Alice',
          age: 25,
          city: 'New York',
          salary: 70000,
          tags: ['dev', 'js'],
        },
      ]);
    });

    test('should filter rows based on matches operator for strings', () => {
      const result = df.where('city', 'matches', /^C/);

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(1);
      expect(result.toArray()).toEqual([
        {
          name: 'Charlie',
          age: 35,
          city: 'Chicago',
          salary: 90000,
          tags: ['manager'],
        },
      ]);
    });

    test('should filter rows based on array contains', () => {
      const result = df.where('tags', 'contains', 'js');

      // Check that the filtered data is correct
      expect(result.rowCount).toBe(1);
      expect(result.toArray()).toEqual([
        {
          name: 'Alice',
          age: 25,
          city: 'New York',
          salary: 70000,
          tags: ['dev', 'js'],
        },
      ]);
    });

    test('should return empty DataFrame when no rows match', () => {
      const result = df.where('age', '>', 100);

      // Should be empty with no rows
      expect(result.rowCount).toBe(0);
      // In the new implementation, an empty DataFrame does not save the column structure
      // which is normal behavior for fromRecords([])
    });

    test('should throw error for non-existent column', () => {
      expect(() => df.where('nonexistent', '===', 30)).toThrow(
        "Column 'nonexistent' not found",
      );
    });

    test('should throw error for invalid operator', () => {
      expect(() => df.where('age', 'invalid', 30)).toThrow(
        "Unsupported operator: 'invalid'",
      );
    });

    test('should return a new DataFrame instance', () => {
      const result = df.where('age', '>', 25);
      expect(result).toBeInstanceOf(DataFrame);
      expect(result).not.toBe(df); // Should be a new instance
    });

    test('should preserve typed arrays', () => {
      // Create DataFrame with typed arrays
      const typedDf = DataFrame.fromRecords(testData, {
        columns: {
          age: { type: 'int32' },
          salary: { type: 'float64' },
        },
      });

      // Filter the data
      const result = typedDf.where('age', '>', 25);

      // Check that the result contains typed arrays
      expect(ArrayBuffer.isView(result._columns.age.vector.__data)).toBe(true);
      expect(ArrayBuffer.isView(result._columns.salary.vector.__data)).toBe(
        true,
      );
      // Check only the presence of typed arrays, without checking specific types
      // Types may be different depending on the implementation of the where method
    });

    test('should handle empty DataFrame', () => {
      const emptyDf = DataFrame.fromRecords([]);

      expect(() => emptyDf.where('age', '===', 30)).toThrow(
        "Column 'age' not found",
      );
    });
  });
});
