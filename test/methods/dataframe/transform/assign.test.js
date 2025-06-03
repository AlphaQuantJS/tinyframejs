import { describe, test, expect, beforeAll } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import { register as registerAssign } from '../../../../src/methods/dataframe/transform/assign.js';

// Register assign method on DataFrame prototype before tests
beforeAll(() => {
  registerAssign(DataFrame);
});

// Test data to be used in all tests
const testData = {
  value: [10, 20, 30, 40, 50],
  category: ['A', 'B', 'A', 'C', 'B'],
  mixed: ['20', 30, null, undefined, NaN],
};

describe('DataFrame.assign', () => {
  test('adds a new column with a constant value', () => {
    // Arrange
    const df = new DataFrame(testData);

    // Act
    const result = df.assign({ newCol: 100 });

    // Assert
    expect(result).toBeInstanceOf(DataFrame);
    expect(result.columns).toContain('newCol');
    expect(result.col('newCol').toArray()).toEqual(
      Array(df.rowCount).fill(100),
    );
  });

  test('adds a new column with an array', () => {
    // Arrange
    const df = new DataFrame(testData);
    const newValues = [100, 200, 300, 400, 500];

    // Act
    const result = df.assign({ newCol: newValues });

    // Assert
    expect(result.columns).toContain('newCol');
    expect(result.col('newCol').toArray()).toEqual(newValues);
  });

  test('adds multiple columns simultaneously', () => {
    // Arrange
    const df = new DataFrame(testData);
    const newValues1 = [100, 200, 300, 400, 500];
    const newValues2 = [1, 2, 3, 4, 5];

    // Act
    const result = df.assign({
      newCol1: newValues1,
      newCol2: newValues2,
      constCol: 999,
    });

    // Assert
    expect(result.columns).toContain('newCol1');
    expect(result.columns).toContain('newCol2');
    expect(result.columns).toContain('constCol');
    expect(result.col('newCol1').toArray()).toEqual(newValues1);
    expect(result.col('newCol2').toArray()).toEqual(newValues2);
    expect(result.col('constCol').toArray()).toEqual(
      Array(df.rowCount).fill(999),
    );
  });

  test('preserves original DataFrame', () => {
    // Arrange
    const df = new DataFrame(testData);
    const originalColumns = [...df.columns];

    // Act
    const result = df.assign({ newCol: 100 });

    // Assert
    expect(df.columns).toEqual(originalColumns); // Original DataFrame unchanged
    expect(result.columns).toContain('newCol'); // New DataFrame has the new column
    expect(df.columns).not.toContain('newCol'); // Original DataFrame doesn't have the new column
  });

  test('supports inplace modification', () => {
    // Arrange
    const df = new DataFrame(testData);
    const originalColumns = [...df.columns];

    // Act
    const result = df.assign({ newCol: 100 }, { inplace: true });

    // Assert
    expect(result).toBe(df); // Returns the same DataFrame instance
    expect(df.columns).toContain('newCol'); // Original DataFrame modified
    expect(df.columns.length).toBe(originalColumns.length + 1); // One new column added
  });

  test('throws an error with incorrect arguments', () => {
    // Arrange
    const df = new DataFrame(testData);

    // Act & Assert
    expect(() => df.assign(null)).toThrow('Columns must be an object');
    expect(() => df.assign('not an object')).toThrow(
      'Columns must be an object',
    );
    expect(() => df.assign(123)).toThrow('Columns must be an object');
    expect(() => df.assign([])).toThrow('Columns must be an object');
  });

  test('updates existing columns', () => {
    // Arrange
    const df = new DataFrame(testData);
    const originalValue = df.col('value').toArray()[0];
    const newValues = [100, 200, 300, 400, 500];

    // Act
    const result = df.assign({ value: newValues });

    // Assert
    expect(result.col('value').toArray()).toEqual(newValues); // New DataFrame has updated values
    expect(df.col('value').toArray()[0]).toBe(originalValue); // Original DataFrame unchanged
  });
});
