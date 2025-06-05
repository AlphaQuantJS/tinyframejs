import { describe, test, expect, beforeAll, beforeEach } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import { register as registerMutate } from '../../../../src/methods/dataframe/transform/mutate.js';

// Register mutate method on DataFrame prototype before tests
beforeAll(() => {
  registerMutate(DataFrame);
});

// Test data to be used in all tests
const testData = {
  a: [1, 2, 3],
  b: [10, 20, 30],
  value: [10, 20, 30],
  category: ['A', 'B', 'A'],
  mixed: ['20', 30, null],
};

// Create test data for each test to avoid mutation issues
const getTestData = () => ({
  a: [1, 2, 3],
  b: [10, 20, 30],
  value: [10, 20, 30],
  category: ['A', 'B', 'A'],
  mixed: ['20', 30, null],
});

describe('DataFrame.mutate', () => {
  // Create a new DataFrame for each test to avoid mutation issues
  let df;
  beforeEach(() => {
    df = new DataFrame(getTestData());
  });

  test('adds a new column with a function', () => {
    // Arrange
    const columnFunctions = {
      c: (row) => row.a * row.b,
    };

    // Act
    const result = df.mutate(columnFunctions);

    // Assert
    expect(result.columns).toContain('c');
    expect(result.col('c').toArray()).toEqual([10, 40, 90]);
  });

  test('modifies an existing column with a function', () => {
    // Arrange
    const columnFunctions = {
      a: (row) => row.a * 2,
    };

    // Act
    const result = df.mutate(columnFunctions);

    // Assert
    expect(result.col('a').toArray()).toEqual([2, 4, 6]);
  });

  test('adds multiple columns with functions', () => {
    // Arrange
    const columnFunctions = {
      c: (row) => row.a * row.b,
      d: (row) => row.a + row.b,
    };

    // Act
    const result = df.mutate(columnFunctions);

    // Assert
    expect(result.columns).toContain('c');
    expect(result.columns).toContain('d');
    expect(result.col('c').toArray()).toEqual([10, 40, 90]);
    expect(result.col('d').toArray()).toEqual([11, 22, 33]);
  });

  test('throws error if column functions are not provided', () => {
    // Act & Assert
    expect(() => df.mutate()).toThrow('Column functions must be specified');
  });

  test('throws error if column function is not a function', () => {
    // Arrange
    const columnFunctions = {
      c: 'not a function',
    };

    // Act & Assert
    expect(() => df.mutate(columnFunctions)).toThrow('must be a function');
  });

  test('provides row index as second parameter to column functions', () => {
    // Arrange
    const columnFunctions = {
      index: (row, idx) => idx,
    };

    // Act
    const result = df.mutate(columnFunctions);

    // Assert
    expect(result.col('index').toArray()).toEqual([0, 1, 2]);
  });

  test('provides DataFrame as third parameter to column functions', () => {
    // Arrange
    const columnFunctions = {
      colCount: (row, idx, df) => df.columns.length,
    };

    // Act
    const result = df.mutate(columnFunctions);

    // Assert
    expect(result.col('colCount').toArray()).toEqual([5, 5, 5]);
  });

  test('converts null and undefined to NaN in column functions', () => {
    // Arrange
    const columnFunctions = {
      nullValues: () => null,
      undefinedValues: () => undefined,
    };

    // Act
    const result = df.mutate(columnFunctions);

    // Assert
    expect(
      result
        .col('nullValues')
        .toArray()
        .every((v) => Number.isNaN(v)),
    ).toBe(true);
    expect(
      result
        .col('undefinedValues')
        .toArray()
        .every((v) => Number.isNaN(v)),
    ).toBe(true);
  });

  test('supports inplace modification', () => {
    // Arrange
    const columnFunctions = {
      c: (row) => row.a * row.b,
    };

    // Act
    const result = df.mutate(columnFunctions, { inplace: true });

    // Assert
    expect(result).toBe(df); // Должен вернуть тот же экземпляр DataFrame
    expect(df.columns).toContain('c');
    expect(df.col('c').toArray()).toEqual([10, 40, 90]);
  });
});
