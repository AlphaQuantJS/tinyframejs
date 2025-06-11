import { describe, test, expect, beforeAll } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import { register as registerApply } from '../../../../src/methods/dataframe/transform/apply.js';

// Register apply methods on DataFrame prototype before tests
beforeAll(() => {
  registerApply(DataFrame);
});

// Test data to be used in all tests
const testData = {
  value: [10, 20, 30, 40, 50],
  category: ['A', 'B', 'A', 'C', 'B'],
  mixed: ['20', 30, null, undefined, NaN],
};

// Helper function to get column values
const getColValues = (df, colName) => Array.from(df.col(colName).toArray());

describe('DataFrame.apply', () => {
  test('applies function to a single column', () => {
    // Arrange
    const df = new DataFrame(testData);

    // Act
    const result = df.apply('value', (value) => value * 2);

    // Assert
    expect(result).toBeInstanceOf(DataFrame);
    expect(getColValues(df, 'value')).toEqual([10, 20, 30, 40, 50]); // original unchanged
    expect(getColValues(result, 'value')).toEqual([20, 40, 60, 80, 100]); // modified
    expect(getColValues(result, 'category')).toEqual(['A', 'B', 'A', 'C', 'B']); // other columns unchanged
    expect(result.columns.includes('mixed')).toBe(true); // mixed column still exists
  });

  test('applies function to multiple columns', () => {
    // Arrange
    const df = new DataFrame(testData);

    // Act
    const result = df.apply(['value', 'mixed'], (value) =>
      // Double the value if it's a number
      typeof value === 'number' ? value * 2 : value,
    );

    // Assert
    expect(getColValues(result, 'value')).toEqual([20, 40, 60, 80, 100]);

    // mixed column has mixed types, so we need to check each value separately
    const mixedValues = getColValues(result, 'mixed');
    expect(mixedValues[0]).toBe('20'); // string not changed
    expect(mixedValues[1]).toBe(60); // number doubled
    expect(isNaN(mixedValues[2])).toBe(true); // null converted to NaN
    expect(isNaN(mixedValues[3])).toBe(true); // undefined converted to NaN
    expect(isNaN(mixedValues[4])).toBe(true); // NaN still NaN

    // Check that other columns remain unchanged
    expect(getColValues(result, 'category')).toEqual(['A', 'B', 'A', 'C', 'B']);
  });

  test('receives index and column name in function', () => {
    // Arrange
    const df = new DataFrame(testData);
    const receivedValues = [];
    const receivedIndices = [];
    const receivedColumns = [];

    // Act
    df.apply('value', (value, index, column) => {
      receivedValues.push(value);
      receivedIndices.push(index);
      receivedColumns.push(column);
      return value; // Return unchanged value
    });

    // Assert
    expect(receivedValues).toEqual([10, 20, 30, 40, 50]);
    expect(receivedIndices).toEqual([0, 1, 2, 3, 4]);
    expect(receivedColumns).toEqual([
      'value',
      'value',
      'value',
      'value',
      'value',
    ]);
  });

  test('handles null and undefined in functions', () => {
    // Arrange
    const df = new DataFrame(testData);

    // Act
    const result = df.apply('value', (value, index) => {
      if (index === 0) return null;
      if (index === 1) return undefined;
      return value;
    });

    // Assert
    const values = getColValues(result, 'value');
    expect(isNaN(values[0])).toBe(true); // null converted to NaN
    expect(isNaN(values[1])).toBe(true); // undefined converted to NaN
    expect(values[2]).toBe(30); // other values unchanged
    expect(values[3]).toBe(40);
    expect(values[4]).toBe(50);
  });

  test('changes column type if necessary', () => {
    // Arrange
    const df = new DataFrame(testData);

    // Act
    const stringDf = df.apply('value', (value) =>
      value < 30 ? 'low' : 'high',
    );

    // Assert
    expect(getColValues(stringDf, 'value')).toEqual([
      'low',
      'low',
      'high',
      'high',
      'high',
    ]);
  });

  test('throws error with invalid arguments', () => {
    // Arrange
    const df = new DataFrame(testData);

    // Act & Assert
    expect(() => df.apply('value')).toThrow(
      'Function to apply must be provided',
    );
    expect(() => df.apply('nonexistent', (x) => x)).toThrow(
      "Column 'nonexistent' not found",
    );
  });

  describe('DataFrame.applyAll', () => {
    test('applies function to all columns', () => {
      // Arrange
      const df = new DataFrame(testData);

      // Act
      const result = df.applyAll((value, index, column) => {
        if (typeof value === 'string') {
          return value + '_suffix';
        } else if (typeof value === 'number') {
          return value * 2;
        }
        return value; // null, undefined, NaN remain unchanged
      });

      // Assert
      expect(getColValues(df, 'value')).toEqual([10, 20, 30, 40, 50]); // original unchanged
      expect(getColValues(result, 'value')).toEqual([20, 40, 60, 80, 100]);
      expect(getColValues(result, 'category')).toEqual([
        'A_suffix',
        'B_suffix',
        'A_suffix',
        'C_suffix',
        'B_suffix',
      ]);

      // mixed column contains different data types
      const mixedValues = getColValues(result, 'mixed');
      expect(mixedValues[0]).toBe('20_suffix'); // string with suffix
      expect(mixedValues[1]).toBe(60); // number doubled
      expect(isNaN(mixedValues[2])).toBe(true); // null remained NaN
      expect(isNaN(mixedValues[3])).toBe(true); // undefined remained NaN
      expect(isNaN(mixedValues[4])).toBe(true); // NaN remained NaN
    });

    test('throws error with invalid arguments', () => {
      // Arrange
      const df = new DataFrame(testData);

      // Act & Assert
      expect(() => df.applyAll()).toThrow();
      expect(() => df.applyAll(null)).toThrow();
    });
  });

  test('supports inplace modification', () => {
    // Arrange
    const df = new DataFrame(testData);
    const originalValues = getColValues(df, 'value');

    // Act
    const result = df.apply('value', (value) => value * 2, { inplace: true });

    // Assert
    expect(result).toBe(df); // Returns the same DataFrame instance
    expect(getColValues(df, 'value')).toEqual([20, 40, 60, 80, 100]); // Original modified
    expect(originalValues).toEqual([10, 20, 30, 40, 50]); // Just to confirm original values
  });
});
