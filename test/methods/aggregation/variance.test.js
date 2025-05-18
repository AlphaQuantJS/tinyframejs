import { describe, it, expect } from 'vitest';
import { DataFrame } from '../../../src/core/DataFrame.js';
import { variance } from '../../../src/methods/aggregation/variance.js';

describe('variance method', () => {
  // Create test data
  const testData = [
    { value: 10, category: 'A', mixed: '20' },
    { value: 20, category: 'B', mixed: 30 },
    { value: 30, category: 'A', mixed: null },
    { value: 40, category: 'C', mixed: undefined },
    { value: 50, category: 'B', mixed: NaN },
  ];

  const df = DataFrame.create(testData);

  it('should calculate the population variance by default', () => {
    // Call variance function directly
    const varianceFn = variance({ validateColumn: () => {} });
    const result = varianceFn(df._frame, 'value');

    // Expected population variance for [10, 20, 30, 40, 50]
    // Mean = 30
    // Sum of squared differences = (10-30)² + (20-30)² + (30-30)² + (40-30)² + (50-30)² = 400 + 100 + 0 + 100 + 400 = 1000
    // Population variance = 1000/5 = 200
    const expected = 200;

    // Check that the result is close to the expected value (within floating point precision)
    expect(result).toBeCloseTo(expected, 10);
  });

  it('should calculate the sample variance when sample=true', () => {
    // Call variance function directly with sample=true
    const varianceFn = variance({ validateColumn: () => {} });
    const result = varianceFn(df._frame, 'value', { sample: true });

    // Expected sample variance for [10, 20, 30, 40, 50]
    // Mean = 30
    // Sum of squared differences = (10-30)² + (20-30)² + (30-30)² + (40-30)² + (50-30)² = 400 + 100 + 0 + 100 + 400 = 1000
    // Sample variance = 1000/4 = 250
    const expected = 250;

    // Check that the result is close to the expected value (within floating point precision)
    expect(result).toBeCloseTo(expected, 10);
  });

  it('should handle mixed data types by converting to numbers', () => {
    // Call variance function directly
    const varianceFn = variance({ validateColumn: () => {} });
    const result = varianceFn(df._frame, 'mixed');

    // Expected population variance for [20, 30] (only valid numeric values)
    // Mean = 25
    // Sum of squared differences = (20-25)² + (30-25)² = 25 + 25 = 50
    // Population variance = 50/2 = 25
    const expected = 25;

    // Check that the result is close to the expected value
    expect(result).toBeCloseTo(expected, 10);
  });

  it('should return null for a column with no valid numeric values', () => {
    // Call variance function directly
    const varianceFn = variance({ validateColumn: () => {} });
    const result = varianceFn(df._frame, 'category');

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

    // Call variance function with validator
    const varianceFn = variance({ validateColumn });

    // Check that it throws an error for non-existent column
    expect(() => varianceFn(df._frame, 'nonexistent')).toThrow(
      'Column \'nonexistent\' not found',
    );
  });

  it('should handle empty frames', () => {
    // Create an empty DataFrame
    const emptyDf = DataFrame.create([]);

    // Add an empty column
    emptyDf._frame.columns.value = [];

    // Call variance function directly
    const varianceFn = variance({ validateColumn: () => {} });
    const result = varianceFn(emptyDf._frame, 'value');

    // Check that the result is null for empty column
    expect(result).toBe(null);
  });

  it('should return null when sample=true and there is only one value', () => {
    // Create a DataFrame with a single value
    const singleValueDf = DataFrame.create([{ value: 42 }]);

    // Call variance function directly with sample=true
    const varianceFn = variance({ validateColumn: () => {} });
    const result = varianceFn(singleValueDf._frame, 'value', { sample: true });

    // Check that the result is null (can't calculate sample variance with n=1)
    expect(result).toBe(null);
  });
});
