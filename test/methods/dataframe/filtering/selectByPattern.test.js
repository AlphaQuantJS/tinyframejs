/**
 * Unit tests for selectByPattern method
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import { registerDataFrameFiltering } from '../../../../src/methods/dataframe/filtering/register.js';

// Register filtering methods on DataFrame
registerDataFrameFiltering(DataFrame);

// Test data as array of objects for use with DataFrame.fromRecords
const testData = [
  {
    name: 'Alice',
    age: 25,
    city: 'New York',
    salary: 70000,
    ageGroup: '20-30',
  },
  {
    name: 'Bob',
    age: 30,
    city: 'San Francisco',
    salary: 85000,
    ageGroup: '30-40',
  },
  {
    name: 'Charlie',
    age: 35,
    city: 'Chicago',
    salary: 90000,
    ageGroup: '30-40',
  },
];

describe('SelectByPattern Method', () => {
  describe('with standard storage', () => {
    // Create DataFrame using fromRecords
    const df = DataFrame.fromRecords(testData);

    // Create DataFrame with typed arrays for testing type preservation
    const typedDf = DataFrame.fromRecords(testData, {
      columns: {
        age: { type: 'int32' },
        salary: { type: 'float64' },
      },
    });

    test('should select columns matching a pattern', () => {
      const result = df.selectByPattern('^a');

      // Check that only columns starting with 'a' exist
      expect(result.columns.sort()).toEqual(['age', 'ageGroup'].sort());
      expect(result.columns).not.toContain('name');
      expect(result.columns).not.toContain('city');
      expect(result.columns).not.toContain('salary');

      // Check that the data is correct
      const resultArray = result.toArray();
      expect(resultArray.length).toBe(3);
      expect(resultArray[0]).toHaveProperty('age', 25);
      expect(resultArray[0]).toHaveProperty('ageGroup', '20-30');
      expect(resultArray[1]).toHaveProperty('age', 30);
      expect(resultArray[1]).toHaveProperty('ageGroup', '30-40');
      expect(resultArray[2]).toHaveProperty('age', 35);
      expect(resultArray[2]).toHaveProperty('ageGroup', '30-40');
    });

    test('should handle regex patterns', () => {
      // Pattern a.*e should match 'age' and 'ageGroup', but not 'name'
      // because in 'name' the letter 'a' is not at the beginning of the string
      const result = df.selectByPattern('^a.*e');

      // Should match 'age' and 'ageGroup'
      expect(result.columns.sort()).toEqual(['age', 'ageGroup'].sort());
    });

    test('should return empty DataFrame when no columns match', () => {
      const result = df.selectByPattern('xyz');

      // Should have no columns
      expect(result.columns).toEqual([]);
      expect(result.rowCount).toBe(0);
    });

    test('should throw error for non-string pattern', () => {
      expect(() => df.selectByPattern(123)).toThrow();
    });

    test('should return a new DataFrame instance', () => {
      const result = df.selectByPattern('^a');
      expect(result).toBeInstanceOf(DataFrame);
      expect(result).not.toBe(df); // Should be a new instance
    });

    test('should preserve Float64Array for salary', () => {
      // Use DataFrame with typed arrays
      const result = typedDf.selectByPattern('^s');

      // Check that the result preserves the Float64Array type for salary
      expect(result._columns.salary.vector.__data).toBeInstanceOf(Float64Array);
    });
  });
});
