/**
 * Simple test for the where method
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../../../packages/core/src/data/model/DataFrame.js';
import { where } from '../../../../../packages/core/src/methods/dataframe/filtering/where.js';

// Test data
const testData = [
  { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
  { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
  { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
];

describe('Where Method - Simple Test', () => {
  // Add where method to DataFrame prototype
  DataFrame.prototype.where = function(column, operator, value) {
    return where(this, column, operator, value);
  };

  // Create DataFrame
  const df = DataFrame.fromRecords(testData);

  test('should filter rows based on equality', () => {
    const result = df.where('age', '===', 30);
    
    // Check row count
    expect(result.rowCount).toBe(1);
    
    // Check that the result contains the correct data
    const resultArray = result.toArray();
    expect(resultArray.length).toBe(1);
    expect(resultArray[0].name).toBe('Bob');
    expect(resultArray[0].age).toBe(30);
  });

  test('should return empty DataFrame when no rows match', () => {
    const result = df.where('age', '>', 100);
    
    // Check that the result is empty
    expect(result.rowCount).toBe(0);
    
    // In the new implementation, an empty DataFrame does not save the column structure
    // which is normal behavior for fromRecords([])
  });

  test('should throw error for non-existent column', () => {
    expect(() => df.where('nonexistent', '===', 30)).toThrow("Column 'nonexistent' not found");
  });

  test('should throw error for invalid operator', () => {
    expect(() => df.where('age', 'invalid', 30)).toThrow("Unsupported operator: 'invalid'");
  });
});
