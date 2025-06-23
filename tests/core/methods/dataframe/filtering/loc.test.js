/**
 * Unit tests for loc method
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../../../packages/core/src/data/model/DataFrame.js';
import { loc } from '../../../../../packages/core/src/methods/dataframe/filtering/loc.js';

// Test data for use in all tests
const testData = [
  { id: 'a1', name: 'Alice', age: 25, city: 'New York', salary: 70000 },
  { id: 'b2', name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
  { id: 'c3', name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
  { id: 'd4', name: 'David', age: 40, city: 'Boston', salary: 95000 },
  { id: 'e5', name: 'Eve', age: 45, city: 'Seattle', salary: 100000 },
];

describe('Loc Method', () => {
  // Add loc method to DataFrame prototype
  DataFrame.prototype.loc = function(rowSelector, columnSelector) {
    return loc(this, rowSelector, columnSelector);
  };

  describe('with standard storage', () => {
    // Create DataFrame using fromRecords with id as index
    const df = DataFrame.fromRecords(testData);
    
    // Set index to 'id' column
    df.setIndex('id');

    test('should select rows by label', () => {
      const result = df.loc('b2');

      // Check that the result is a DataFrame with one row
      expect(result.rowCount).toBe(1);
      expect(result.toArray()[0].name).toBe('Bob');
    });

    test('should select rows by array of labels', () => {
      const result = df.loc(['a1', 'c3', 'e5']);

      // Check that the result contains the selected rows
      expect(result.rowCount).toBe(3);
      expect(result.toArray().map(r => r.name)).toEqual(['Alice', 'Charlie', 'Eve']);
    });

    test('should select rows by predicate function', () => {
      const result = df.loc((row) => row.age > 30);

      // Should select rows with age > 30
      expect(result.rowCount).toBe(3);
      expect(result.toArray().map(r => r.name)).toEqual(['Charlie', 'David', 'Eve']);
    });

    test('should select rows by condition object', () => {
      const result = df.loc({ city: 'Chicago' });

      // Should select rows where city is Chicago
      expect(result.rowCount).toBe(1);
      expect(result.toArray()[0].name).toBe('Charlie');
    });

    test('should select columns by name', () => {
      const result = df.loc(null, 'age');

      // Should select the 'age' column for all rows
      expect(result.columns).toEqual(['age']);
      expect(result.rowCount).toBe(5);
      expect(result.col('age').toArray()).toEqual([25, 30, 35, 40, 45]);
    });

    test('should select columns by array of names', () => {
      const result = df.loc(null, ['name', 'city']);

      // Should select the 'name' and 'city' columns
      expect(result.columns.sort()).toEqual(['city', 'name'].sort());
      expect(result.rowCount).toBe(5);
    });

    test('should select rows and columns by labels', () => {
      const result = df.loc(['b2', 'd4'], ['name', 'city']);

      // Should select rows with ids 'b2' and 'd4', columns 'name' and 'city'
      expect(result.rowCount).toBe(2);
      expect(result.columns.sort()).toEqual(['city', 'name'].sort());
      expect(result.toArray()).toEqual([
        { name: 'Bob', city: 'San Francisco' },
        { name: 'David', city: 'Boston' },
      ]);
    });

    test('should handle null for rows to select all rows', () => {
      const result = df.loc(null, 'age');

      // Should select all rows, but only the 'age' column
      expect(result.rowCount).toBe(5);
      expect(result.columns).toEqual(['age']);
    });

    test('should handle null for columns to select all columns', () => {
      const result = df.loc('c3', null);

      // Should select row with id 'c3', all columns
      expect(result.rowCount).toBe(1);
      expect(result.columns.length).toBe(5); // id, name, age, city, salary
      expect(result.toArray()[0].name).toBe('Charlie');
    });

    test('should throw error for non-existent row label', () => {
      expect(() => df.loc('z9')).toThrow('Row label not found');
    });

    test('should throw error for non-existent column label', () => {
      expect(() => df.loc(null, 'country')).toThrow('Column not found');
    });

    test('should preserve typed arrays', () => {
      // Create DataFrame with typed arrays
      const typedDf = DataFrame.fromRecords(testData, {
        columns: {
          age: { type: 'int32' },
          salary: { type: 'float64' },
        },
      });
      typedDf.setIndex('id');

      // Select rows and columns
      const result = typedDf.loc(['b2', 'd4'], ['age', 'salary']);

      // Check that the result contains typed arrays
      expect(result._columns.age.vector.__data).toBeInstanceOf(Int32Array);
      expect(result._columns.salary.vector.__data).toBeInstanceOf(Float64Array);
    });

    test('should handle empty DataFrame', () => {
      const emptyDf = DataFrame.fromRecords([]);
      emptyDf.setIndex('id');
      
      expect(() => emptyDf.loc('a1')).toThrow('Row label not found');
    });

    test('should handle DataFrame without index', () => {
      const dfNoIndex = DataFrame.fromRecords(testData);
      
      // Should use row number as index
      const result = dfNoIndex.loc(2);
      expect(result.rowCount).toBe(1);
      expect(result.toArray()[0].name).toBe('Charlie');
    });
  });
});
