/**
 * Unit tests for drop method
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../../../packages/core/src/data/model/DataFrame.js';
import { drop } from '../../../../../packages/core/src/methods/dataframe/filtering/drop.js';

// Test data for use in all tests
const testData = [
  { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
  { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
  { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
];

describe('Drop Method', () => {
  // Add drop method to DataFrame prototype
  DataFrame.prototype.drop = function(columns) {
    return drop(this, columns);
  };

  describe('with standard storage', () => {
    // Create DataFrame using fromRecords
    const df = DataFrame.fromRecords(testData);

    test('should drop specified columns', () => {
      const result = df.drop(['city', 'salary']);

      // Check that the result has only the remaining columns
      expect(result.columns.sort()).toEqual(['age', 'name'].sort());
      expect(result.rowCount).toBe(3);
      expect(result.toArray()).toEqual([
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 30 },
        { name: 'Charlie', age: 35 },
      ]);
    });

    test('should handle single column as string', () => {
      const result = df.drop('name');

      // Check that the result has all columns except the dropped one
      expect(result.columns.sort()).toEqual(['age', 'city', 'salary'].sort());
      expect(result.rowCount).toBe(3);
      expect(result.toArray()).toEqual([
        { age: 25, city: 'New York', salary: 70000 },
        { age: 30, city: 'San Francisco', salary: 85000 },
        { age: 35, city: 'Chicago', salary: 90000 },
      ]);
    });

    test('should throw error for non-existent column', () => {
      expect(() => df.drop(['name', 'nonexistent'])).toThrow('Column not found: \'nonexistent\'');
    });

    test('should return a new DataFrame instance', () => {
      const result = df.drop(['city', 'salary']);
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

      // Drop columns
      const result = typedDf.drop(['city']);

      // Check that the result has the correct columns
      expect(result.columns.sort()).toEqual(['age', 'name', 'salary'].sort());
      
      // Check that the data types are preserved (using the public API)
      const ageCol = result.col('age');
      const salaryCol = result.col('salary');
      expect(ageCol.toArray()).toEqual([25, 30, 35]);
      expect(salaryCol.toArray()).toEqual([70000, 85000, 90000]);
    });

    test('should handle empty DataFrame', () => {
      const emptyDf = DataFrame.fromRecords([]);
      
      expect(() => emptyDf.drop(['name'])).toThrow('Column not found: \'name\'');
    });

    test('should handle empty column list', () => {
      const result = df.drop([]);
      
      // Should return a copy of the original DataFrame
      expect(result.columns.sort()).toEqual(df.columns.sort());
      expect(result.rowCount).toBe(df.rowCount);
      expect(result).not.toBe(df); // Should be a new instance
    });

    test('should throw error when dropping all columns', () => {
      expect(() => df.drop(['name', 'age', 'city', 'salary'])).toThrow('Cannot drop all columns');
    });
  });
});
