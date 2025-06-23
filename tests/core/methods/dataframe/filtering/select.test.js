/**
 * Unit tests for select method
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../../../packages/core/src/data/model/DataFrame.js';
import { select } from '../../../../../packages/core/src/methods/dataframe/filtering/select.js';

// Test data for use in all tests
const testData = [
  { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
  { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
  { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
];

describe('Select Method', () => {
  // Add select method to DataFrame prototype
  DataFrame.prototype.select = function(columns) {
    return select(this, columns);
  };

  describe('with standard storage', () => {
    // Create DataFrame using fromRecords
    const df = DataFrame.fromRecords(testData);

    test('should select specified columns', () => {
      const result = df.select(['name', 'age']);

      // Check that the result has only the selected columns
      expect(result.columns.sort()).toEqual(['age', 'name'].sort());
      expect(result.rowCount).toBe(3);
      expect(result.toArray()).toEqual([
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 30 },
        { name: 'Charlie', age: 35 },
      ]);
    });

    test('should handle single column as string', () => {
      // Метод select должен принимать только массив
      expect(() => df.select('name')).toThrow('Columns must be an array');
    });

    test('should throw error for non-existent column', () => {
      expect(() => df.select(['name', 'nonexistent'])).toThrow("Column 'nonexistent' not found");
    });

    test('should return a new DataFrame instance', () => {
      const result = df.select(['name', 'age']);
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

      // Select columns
      const result = typedDf.select(['name', 'age', 'salary']);

      // Check that data is preserved correctly
      const ageCol = result.col('age');
      const salaryCol = result.col('salary');
      expect(ageCol.toArray()).toEqual([25, 30, 35]);
      expect(salaryCol.toArray()).toEqual([70000, 85000, 90000]);
      
      // Verify that the column types are preserved by checking the column options
      // This is an indirect way to verify the typed arrays are preserved
      expect(result._options.columns.age.type).toBe('int32');
      expect(result._options.columns.salary.type).toBe('float64');
    });

    test('should handle empty DataFrame', () => {
      const emptyDf = DataFrame.fromRecords([]);
      
      expect(() => emptyDf.select(['name'])).toThrow("Column 'name' not found");
    });

    test('should handle empty column list', () => {
      expect(() => df.select([])).toThrow('Column list cannot be empty');
    });
  });
});
