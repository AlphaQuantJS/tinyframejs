import { describe, it, expect } from 'vitest';
import { DataFrame } from '../../../src/core/DataFrame.js';
import { std } from '../../../src/methods/aggregation/std.js';

describe('std method', () => {
  // Create test data
  const testData = [
    { value: 10, category: 'A', mixed: '20' },
    { value: 20, category: 'B', mixed: 30 },
    { value: 30, category: 'A', mixed: null },
    { value: 40, category: 'C', mixed: undefined },
    { value: 50, category: 'B', mixed: NaN },
  ];

  const df = DataFrame.create(testData);

  it('should calculate the population standard deviation by default', () => {
    // Call std function directly
    const stdFn = std({ validateColumn: () => {} });
    const result = stdFn(df._frame, 'value');

    // Expected population standard deviation for [10, 20, 30, 40, 50]
    // Mean = 30
    // Sum of squared differences = (10-30)² + (20-30)² + (30-30)² + (40-30)² + (50-30)² = 400 + 100 + 0 + 100 + 400 = 1000
    // Population std = sqrt(1000/5) = sqrt(200) ≈ 14.142
    const expected = Math.sqrt(1000 / 5);

    // Check that the result is close to the expected value (within floating point precision)
    expect(result).toBeCloseTo(expected, 10);
  });

  it('should calculate the sample standard deviation when sample=true', () => {
    // Call std function directly with sample=true
    const stdFn = std({ validateColumn: () => {} });
    const result = stdFn(df._frame, 'value', { sample: true });

    // Expected sample standard deviation for [10, 20, 30, 40, 50]
    // Mean = 30
    // Sum of squared differences = (10-30)² + (20-30)² + (30-30)² + (40-30)² + (50-30)² = 400 + 100 + 0 + 100 + 400 = 1000
    // Sample std = sqrt(1000/4) = sqrt(250) ≈ 15.811
    const expected = Math.sqrt(1000 / 4);

    // Check that the result is close to the expected value (within floating point precision)
    expect(result).toBeCloseTo(expected, 10);
  });

  it('should handle mixed data types by converting to numbers', () => {
    // Call std function directly
    const stdFn = std({ validateColumn: () => {} });
    const result = stdFn(df._frame, 'mixed');

    // Expected population standard deviation for [20, 30] (only valid numeric values)
    // Mean = 25
    // Sum of squared differences = (20-25)² + (30-25)² = 25 + 25 = 50
    // Population std = sqrt(50/2) = sqrt(25) = 5
    const expected = 5;

    // Check that the result is close to the expected value
    expect(result).toBeCloseTo(expected, 10);
  });

  it('should return null for a column with no valid numeric values', () => {
    // Call std function directly
    const stdFn = std({ validateColumn: () => {} });
    const result = stdFn(df._frame, 'category');

    // Check that the result is null (no numeric values in 'category' column)
    expect(result).toBe(null);
  });

  it('should throw an error for non-existent column', () => {
    // Create a validator that throws an error for non-existent column
    const validateColumn = (frame, column) => {
      if (!(column in frame.columns)) {
        throw new Error(`Column '${column}' not found`);
      }
    };

    // Call std function with validator
    const stdFn = std({ validateColumn });

    // Check that it throws an error for non-existent column
    expect(() => stdFn(df._frame, 'nonexistent')).toThrow(
      "Column 'nonexistent' not found",
    );
  });

  it('should handle empty frames', () => {
    // Create an empty DataFrame
    const emptyDf = DataFrame.create([]);

    // Add an empty column
    emptyDf._frame.columns.value = [];

    // Call std function directly
    const stdFn = std({ validateColumn: () => {} });
    const result = stdFn(emptyDf._frame, 'value');

    // Check that the result is null for empty column
    expect(result).toBe(null);
  });

  it('should return null when sample=true and there is only one value', () => {
    // Create a DataFrame with a single value
    const singleValueDf = DataFrame.create([{ value: 42 }]);

    // Call std function directly with sample=true
    const stdFn = std({ validateColumn: () => {} });
    const result = stdFn(singleValueDf._frame, 'value', { sample: true });

    // Check that the result is null (can't calculate sample std dev with n=1)
    expect(result).toBe(null);
  });
});
