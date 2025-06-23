/**
 * Unit tests for at method
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../../../packages/core/src/data/model/DataFrame.js';
import { at } from '../../../../../packages/core/src/methods/dataframe/filtering/at.js';

// Test data for use in all tests
const testData = [
  { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
  { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
  { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
];

describe('At Method', () => {
  // Add at method to DataFrame prototype
  DataFrame.prototype.at = function(index) {
    return at(this, index);
  };

  describe('with standard storage', () => {
    // Create DataFrame using fromRecords
    const df = DataFrame.fromRecords(testData);

    test('should return row at specified index', () => {
      const result = df.at(1);

      // Check that the result is the correct row
      expect(result).toEqual({
        name: 'Bob',
        age: 30,
        city: 'San Francisco',
        salary: 85000,
      });
    });

    test('should handle index 0', () => {
      const result = df.at(0);

      expect(result).toEqual({
        name: 'Alice',
        age: 25,
        city: 'New York',
        salary: 70000,
      });
    });

    test('should handle last index', () => {
      const result = df.at(2);

      expect(result).toEqual({
        name: 'Charlie',
        age: 35,
        city: 'Chicago',
        salary: 90000,
      });
    });

    test('should throw error for negative index', () => {
      expect(() => df.at(-1)).toThrow('Index out of bounds: -1 is negative');
    });

    test('should throw error for index >= rowCount', () => {
      expect(() => df.at(3)).toThrow('Index out of bounds: 3 >= 3');
    });

    test('should throw error for non-integer index', () => {
      expect(() => df.at(1.5)).toThrow('Index must be an integer');
    });

    test('should handle typed arrays correctly', () => {
      // Create DataFrame with typed arrays
      const typedDf = DataFrame.fromRecords(testData, {
        columns: {
          age: { type: 'int32' },
          salary: { type: 'float64' },
        },
      });

      // Get row at index
      const result = typedDf.at(1);

      // Check that the values are correct
      expect(result.age).toBe(30);
      expect(result.salary).toBe(85000);
    });

    test('should handle empty DataFrame', () => {
      const emptyDf = DataFrame.fromRecords([]);
      
      expect(() => emptyDf.at(0)).toThrow('Index out of bounds: DataFrame is empty');
    });
  });
});
