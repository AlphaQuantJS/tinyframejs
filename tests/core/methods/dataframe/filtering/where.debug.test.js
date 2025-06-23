/**
 * Debug test for the where method
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

describe('Where Method - Debug Test', () => {
  // Add where method to DataFrame prototype
  DataFrame.prototype.where = function(column, operator, value) {
    return where(this, column, operator, value);
  };

  test('should debug where method behavior', () => {
    // Create DataFrame
    const df = DataFrame.fromRecords(testData);
    console.log('Original DataFrame columns:', df.columns);
    console.log('Original DataFrame row count:', df.rowCount);
    
    // Test where method
    const result = df.where('age', '===', 30);
    console.log('Result DataFrame columns:', result.columns);
    console.log('Result DataFrame row count:', result.rowCount);
    
    // Output result
    const resultArray = result.toArray();
    console.log('Result array:', JSON.stringify(resultArray, null, 2));
    
    // Check result structure
    expect(resultArray.length).toBe(1);
    console.log('First row keys:', Object.keys(resultArray[0]));
    
    // Test empty result
    const emptyResult = df.where('age', '>', 100);
    console.log('Empty result columns:', emptyResult.columns);
    console.log('Empty result row count:', emptyResult.rowCount);
  });
});
