// test/methods/dataframe/transform/sort.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import {
  sort,
  registerSort,
} from '../../../../src/methods/dataframe/transform/sort.js';
import { register as registerAssign } from '../../../../src/methods/dataframe/transform/assign.js';

describe('DataFrame.sort', () => {
  let df;

  beforeEach(() => {
    // Register methods on DataFrame prototype before each test
    registerSort(DataFrame);
    registerAssign(DataFrame);

    // Create a test DataFrame
    df = new DataFrame({
      id: [1, 2, 3, 4, 5],
      value: [30, 10, 50, 20, 40],
      name: ['Charlie', 'Alice', 'Eve', 'Bob', 'David'],
    });
  });

  it('sorts a DataFrame by numeric column in ascending order', () => {
    // Arrange
    const column = 'value';

    // Act
    const result = df.sort(column);

    // Assert
    expect(result).not.toBe(df); // Returns a new DataFrame
    expect(result.col('value').toArray()).toEqual([10, 20, 30, 40, 50]);
    expect(result.col('name').toArray()).toEqual([
      'Alice',
      'Bob',
      'Charlie',
      'David',
      'Eve',
    ]);
    expect(result.col('id').toArray()).toEqual([2, 4, 1, 5, 3]);
  });

  it('sorts a DataFrame by string column in ascending order', () => {
    // Arrange
    const column = 'name';

    // Act
    const result = df.sort(column);

    // Assert
    expect(result.col('name').toArray()).toEqual([
      'Alice',
      'Bob',
      'Charlie',
      'David',
      'Eve',
    ]);
    expect(result.col('value').toArray()).toEqual([10, 20, 30, 40, 50]);
    expect(result.col('id').toArray()).toEqual([2, 4, 1, 5, 3]);
  });

  it('sorts a DataFrame in descending order', () => {
    // Arrange
    const column = 'value';
    const options = { descending: true };

    // Act
    const result = df.sort(column, options);

    // Assert
    expect(result.col('value').toArray()).toEqual([50, 40, 30, 20, 10]);
    expect(result.col('name').toArray()).toEqual([
      'Eve',
      'David',
      'Charlie',
      'Bob',
      'Alice',
    ]);
  });

  it('supports inplace modification', () => {
    // Arrange
    const column = 'value';
    const options = { inplace: true };

    // Act
    const result = df.sort(column, options);

    // Assert
    expect(result).toBe(df); // Returns the same DataFrame instance
    expect(df.col('value').toArray()).toEqual([10, 20, 30, 40, 50]);
  });

  it('handles null, undefined and NaN values', () => {
    // Arrange
    const dfWithNulls = new DataFrame({
      id: [1, 2, 3, 4, 5],
      value: [30, null, NaN, undefined, 10],
    });

    // Act
    const result = dfWithNulls.sort('value');

    // Assert
    expect(result.col('value').toArray()).toEqual([
      10,
      30,
      null,
      NaN,
      undefined,
    ]);
    expect(result.col('id').toArray()).toEqual([5, 1, 2, 3, 4]);
  });

  it('throws error with invalid column name', () => {
    // Arrange
    const invalidColumn = 'nonexistent';

    // Act & Assert
    expect(() => df.sort(invalidColumn)).toThrow(
      "Column 'nonexistent' not found in DataFrame",
    );
  });

  it('direct function call works the same as method call', () => {
    // Arrange
    const column = 'value';

    // Act
    const result1 = df.sort(column);
    const result2 = sort(df, column);

    // Assert
    expect(result1.col('value').toArray()).toEqual(
      result2.col('value').toArray(),
    );
    expect(result1.col('name').toArray()).toEqual(
      result2.col('name').toArray(),
    );
  });
});
