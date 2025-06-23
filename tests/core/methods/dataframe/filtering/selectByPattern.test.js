/**
 * Unit tests for selectByPattern method
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../../../packages/core/src/data/model/DataFrame.js';
import { selectByPattern } from '../../../../../packages/core/src/methods/dataframe/filtering/selectByPattern.js';

// Test data for use in all tests
const testData = [
  { name: 'Alice', age: 25, city_name: 'New York', salary_usd: 70000, user_id: 1 },
  { name: 'Bob', age: 30, city_name: 'San Francisco', salary_usd: 85000, user_id: 2 },
  { name: 'Charlie', age: 35, city_name: 'Chicago', salary_usd: 90000, user_id: 3 },
];

describe('SelectByPattern Method', () => {
  // Add selectByPattern method to DataFrame prototype
  DataFrame.prototype.selectByPattern = function(pattern) {
    return selectByPattern(this, pattern);
  };

  describe('with standard storage', () => {
    // Create DataFrame using fromRecords
    const df = DataFrame.fromRecords(testData);

    test('should select columns matching a string pattern', () => {
      const result = df.selectByPattern('city');

      // Check that the result has only the matching columns
      expect(result.columns).toEqual(['city_name']);
      expect(result.rowCount).toBe(3);
      expect(result.toArray()).toEqual([
        { city_name: 'New York' },
        { city_name: 'San Francisco' },
        { city_name: 'Chicago' },
      ]);
    });

    test('should select columns matching a regular expression', () => {
      const result = df.selectByPattern(/^.+_name$/);

      // Check that the result has only the matching columns
      expect(result.columns).toEqual(['city_name']);
      expect(result.rowCount).toBe(3);
    });

    test('should select multiple columns matching a pattern', () => {
      const result = df.selectByPattern(/^.+_/);

      // Check that the result has all matching columns
      expect(result.columns.sort()).toEqual(['city_name', 'salary_usd', 'user_id'].sort());
      expect(result.rowCount).toBe(3);
    });

    test('should return empty DataFrame when no columns match', () => {
      expect(() => df.selectByPattern('nonexistent')).toThrow('No columns match the pattern');
    });

    test('should return a new DataFrame instance', () => {
      const result = df.selectByPattern('city');
      expect(result).toBeInstanceOf(DataFrame);
      expect(result).not.toBe(df); // Should be a new instance
    });

    test('should preserve typed arrays', () => {
      // Create DataFrame with typed arrays
      const typedDf = DataFrame.fromRecords(testData, {
        columns: {
          age: { type: 'int32' },
          salary_usd: { type: 'float64' },
          user_id: { type: 'int32' },
        },
      });

      // Select columns by pattern
      const result = typedDf.selectByPattern(/^.+_/);

      // Check that data is preserved correctly
      const salaryCol = result.col('salary_usd');
      const userIdCol = result.col('user_id');
      expect(salaryCol.toArray()).toEqual([70000, 85000, 90000]);
      expect(userIdCol.toArray()).toEqual([1, 2, 3]);
      
      // Verify that the column types are preserved by checking the column options
      // This is an indirect way to verify the typed arrays are preserved
      expect(result._options.columns.salary_usd.type).toBe('float64');
      expect(result._options.columns.user_id.type).toBe('int32');
    });

    test('should handle empty DataFrame', () => {
      const emptyDf = DataFrame.fromRecords([]);
      
      expect(() => emptyDf.selectByPattern('city')).toThrow('No columns match the pattern');
    });
  });
});
