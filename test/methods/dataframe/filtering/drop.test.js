/**
 * Unit tests for drop method
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import registerDataFrameFiltering from '../../../../src/methods/dataframe/filtering/register.js';

// Test data for use in all tests
const testData = [
  { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
  { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
  { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
];

describe('Drop Method', () => {
  // Регистрируем методы фильтрации для DataFrame
  registerDataFrameFiltering(DataFrame);

  describe('with standard storage', () => {
    // Create DataFrame using fromRows
    const df = DataFrame.fromRows(testData);

    test('should drop specified columns', () => {
      const result = df.drop(['city', 'salary']);

      // Check that dropped columns don't exist
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
      expect(() => df.drop(['city', 'nonexistent'])).toThrow();
    });

    test('should support string input for single column', () => {
      const result = df.drop('city');

      // Check that dropped column doesn't exist
      expect(result.columns).not.toContain('city');
      expect(result.columns.length).toBe(df.columns.length - 1);
    });

    test('should handle empty array input', () => {
      const result = df.drop([]);

      // Should keep all columns
      expect(result.columns.sort()).toEqual(
        ['age', 'city', 'name', 'salary'].sort(),
      );
      expect(result.rowCount).toBe(3);
    });

    test('should return a new DataFrame instance', () => {
      const result = df.drop(['city', 'salary']);
      expect(result).toBeInstanceOf(DataFrame);
      expect(result).not.toBe(df); // Should be a new instance
    });
  });
});
