/**
 * Unit tests for at method
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import { registerDataFrameIndexing } from '../../../../src/methods/dataframe/indexing/register.js';

// Test data for use in all tests
const testData = [
  { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
  { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
  { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
];

describe('At Method', () => {
  // Register indexing methods for DataFrame
  registerDataFrameIndexing(DataFrame);

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

    test('should select a row by index', () => {
      const result = df.at(1);

      // Check that the result is an object with the correct values
      expect(result).toEqual({
        name: 'Bob',
        age: 30,
        city: 'San Francisco',
        salary: 85000,
      });
    });

    test('should select the first row with index 0', () => {
      const result = df.at(0);

      // Check that the result is an object with the correct values
      expect(result).toEqual({
        name: 'Alice',
        age: 25,
        city: 'New York',
        salary: 70000,
      });
    });

    test('should select the last row with the last index', () => {
      const result = df.at(2);

      // Check that the result is an object with the correct values
      expect(result).toEqual({
        name: 'Charlie',
        age: 35,
        city: 'Chicago',
        salary: 90000,
      });
    });

    test('should throw error for negative index', () => {
      expect(() => df.at(-1)).toThrow();
    });

    test('should throw error for index out of bounds', () => {
      expect(() => df.at(3)).toThrow();
    });

    test('should throw error for non-integer index', () => {
      expect(() => df.at(1.5)).toThrow();
      expect(() => df.at('1')).toThrow();
    });

    test('should handle empty DataFrame', () => {
      // Create empty DataFrame
      const emptyDf = DataFrame.fromRecords([]);
      expect(() => emptyDf.at(0)).toThrow();
    });

    test('should handle typed arrays', () => {
      // Use DataFrame with typed arrays created above
      const result = typedDf.at(1);

      // Check that the result contains correct values
      expect(result).toEqual({
        name: 'Bob',
        age: 30,
        city: 'San Francisco',
        salary: 85000,
      });

      // Check that numeric values have the correct type
      expect(typeof result.age).toBe('number');
      expect(typeof result.salary).toBe('number');
    });
  });
});
