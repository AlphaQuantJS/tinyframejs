/**
 * Unit tests for select method
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import { registerDataFrameFiltering } from '../../../../src/methods/dataframe/filtering/register.js';

// Register filtering methods on DataFrame
registerDataFrameFiltering(DataFrame);

// Test data as array of objects for use with DataFrame.fromRecords
const testData = [
  { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
  { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
  { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
];

describe('Select Method', () => {
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

    test('should select specific columns', () => {
      const result = df.select(['name', 'age']);

      // Check that only the selected columns exist
      expect(result.columns).toEqual(['name', 'age']);
      expect(result.columns).not.toContain('city');
      expect(result.columns).not.toContain('salary');

      // Check that the data is correct
      expect(result.toArray()).toEqual([
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 30 },
        { name: 'Charlie', age: 35 },
      ]);
    });

    test('should throw error for non-existent columns', () => {
      expect(() => df.select(['name', 'nonexistent'])).toThrow();
    });

    test('should handle string input as single column', () => {
      // Check that string is handled as an array with one element
      const result = df.select('name');
      expect(result.columns).toEqual(['name']);
      expect(result.rowCount).toBe(df.rowCount);
    });

    test('should handle empty array input', () => {
      const result = df.select([]);
      expect(result.columns).toEqual([]);
      expect(result.rowCount).toBe(0);
    });

    test('should return a new DataFrame instance', () => {
      const result = df.select(['name', 'age']);
      expect(result).toBeInstanceOf(DataFrame);
      expect(result).not.toBe(df); // Should be a new instance
    });

    test('should preserve Float64Array for salary', () => {
      // Select columns including the typed column
      const result = typedDf.select(['name', 'salary']);

      // Check that the salary column is still a Float64Array
      expect(result._columns.salary.vector.__data).toBeInstanceOf(Float64Array);
    });
  });
});
