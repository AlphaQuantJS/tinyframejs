import { describe, test, expect, beforeAll } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import { join } from '../../../../src/methods/dataframe/transform/join.js';

// Register join method on DataFrame prototype before tests
beforeAll(() => {
  DataFrame.prototype.join = function (other, on, how) {
    return join()(this, other, { on, how });
  };
});

describe('DataFrame.join', () => {
  test('performs inner join on a single column', () => {
    // Arrange - Create two test DataFrames
    const df1 = new DataFrame({
      id: [1, 2, 3, 4],
      name: ['Alice', 'Bob', 'Charlie', 'Dave'],
    });

    const df2 = new DataFrame({
      id: [1, 2, 3, 5],
      age: [25, 30, 35, 40],
    });

    // Act - Call the join method with inner join
    const result = df1.join(df2, 'id', 'inner');

    // Assert
    // Check that the result is a DataFrame instance
    expect(result).toBeInstanceOf(DataFrame);

    // Check the columns exist
    expect(result.columns).toContain('id');
    expect(result.columns).toContain('name');
    expect(result.columns).toContain('age');

    // Check the number of rows (should be the number of matching keys)
    expect(result.rowCount).toBe(3); // ids 1, 2, 3

    // Check the values in the joined DataFrame
    expect(result.col('id').toArray()).toEqual([1, 2, 3]);
    expect(result.col('name').toArray()).toEqual(['Alice', 'Bob', 'Charlie']);
    expect(result.col('age').toArray()).toEqual([25, 30, 35]);
  });

  test('performs left join on a single column', () => {
    // Arrange - Create two test DataFrames
    const df1 = new DataFrame({
      id: [1, 2, 3, 4],
      name: ['Alice', 'Bob', 'Charlie', 'Dave'],
    });

    const df2 = new DataFrame({
      id: [1, 2, 3, 5],
      age: [25, 30, 35, 40],
    });

    // Act - Call the join method with left join
    const result = df1.join(df2, 'id', 'left');

    // Assert
    // Check the columns exist
    expect(result.columns).toContain('id');
    expect(result.columns).toContain('name');
    expect(result.columns).toContain('age');

    // Check the number of rows (should be the number of rows in the left DataFrame)
    expect(result.rowCount).toBe(4);

    // Check the values in the joined DataFrame
    expect(result.col('id').toArray()).toEqual([1, 2, 3, 4]);
    expect(result.col('name').toArray()).toEqual([
      'Alice',
      'Bob',
      'Charlie',
      'Dave',
    ]);

    // The age for id=4 should be null (NaN in TypedArray)
    const ageValues = result.col('age').toArray();
    expect(ageValues[0]).toBe(25);
    expect(ageValues[1]).toBe(30);
    expect(ageValues[2]).toBe(35);
    // Missing values are represented as NaN
    expect(Number.isNaN(ageValues[3])).toBe(true);
  });

  test('throws error with invalid join type', () => {
    // Arrange
    const df1 = new DataFrame({
      id: [1, 2, 3],
      name: ['Alice', 'Bob', 'Charlie'],
    });

    const df2 = new DataFrame({
      id: [1, 2, 3],
      age: [25, 30, 35],
    });

    // Act & Assert
    expect(() => df1.join(df2, 'id', 'invalid_join_type')).toThrow();
  });

  test('performs right join on a single column', () => {
    // Arrange - Create two test DataFrames
    const df1 = new DataFrame({
      id: [1, 2, 3, 4],
      name: ['Alice', 'Bob', 'Charlie', 'Dave'],
    });

    const df2 = new DataFrame({
      id: [1, 2, 3, 5],
      age: [25, 30, 35, 40],
    });

    // Act - Call the join method with right join
    const result = df1.join(df2, 'id', 'right');

    // Assert
    // Check the columns exist
    expect(result.columns).toContain('id');
    expect(result.columns).toContain('name');
    expect(result.columns).toContain('age');

    // Check the number of rows (should be the number of rows in the right DataFrame)
    expect(result.rowCount).toBe(4);

    // Check the values in the joined DataFrame
    const idValues = result.col('id').toArray();
    expect(idValues.length).toBe(4);
    // We check the length of the array and the presence of key values
    expect(idValues).toContain(1);
    expect(idValues).toContain(2);
    expect(idValues).toContain(3);
    expect(idValues).toContain(5);

    // Check name values - the name for id=5 should be NaN
    const nameValues = result.col('name').toArray();
    const ageValues = result.col('age').toArray();

    // Find indices for each id to check corresponding values
    const idx1 = idValues.indexOf(1);
    const idx2 = idValues.indexOf(2);
    const idx3 = idValues.indexOf(3);
    const idx5 = idValues.indexOf(5);

    // Check name values for existing ids
    expect(nameValues[idx1]).toBe('Alice');
    expect(nameValues[idx2]).toBe('Bob');
    expect(nameValues[idx3]).toBe('Charlie');
    expect(nameValues[idx5]).toBe(null); // name for id=5 should be null (строковые значения)

    // Check age values
    expect(ageValues[idx1]).toBe(25);
    expect(ageValues[idx2]).toBe(30);
    expect(ageValues[idx3]).toBe(35);
    expect(ageValues[idx5]).toBe(40);
  });

  test('performs outer join on a single column', () => {
    // Arrange - Create two test DataFrames
    const df1 = new DataFrame({
      id: [1, 2, 3, 4],
      name: ['Alice', 'Bob', 'Charlie', 'Dave'],
    });

    const df2 = new DataFrame({
      id: [1, 2, 3, 5],
      age: [25, 30, 35, 40],
    });

    // Act - Call the join method with outer join
    const result = df1.join(df2, 'id', 'outer');

    // Assert
    // Check the columns existcl
    expect(result.columns).toContain('id');
    expect(result.columns).toContain('name');
    expect(result.columns).toContain('age');

    // Check the number of rows (should be the union of keys from both DataFrames)
    expect(result.rowCount).toBe(5); // ids 1, 2, 3, 4, 5

    // Check the values in the joined DataFrame
    const idValues = result.col('id').toArray();

    // Check for all expected IDs
    expect(idValues).toContain(1);
    expect(idValues).toContain(2);
    expect(idValues).toContain(3);
    expect(idValues).toContain(4);
    expect(idValues).toContain(5);

    // Check name and age values
    const nameValues = result.col('name').toArray();
    const ageValues = result.col('age').toArray();

    // Find indices for each id to check corresponding values
    const idx1 = idValues.indexOf(1);
    const idx2 = idValues.indexOf(2);
    const idx3 = idValues.indexOf(3);
    const idx4 = idValues.indexOf(4);
    const idx5 = idValues.indexOf(5);

    // Check name values
    expect(nameValues[idx1]).toBe('Alice');
    expect(nameValues[idx2]).toBe('Bob');
    expect(nameValues[idx3]).toBe('Charlie');
    expect(nameValues[idx4]).toBe('Dave');
    expect(nameValues[idx5]).toBe(null); // name for id=5 should be null (строковые значения)

    // Check age values
    expect(ageValues[idx1]).toBe(25);
    expect(ageValues[idx2]).toBe(30);
    expect(ageValues[idx3]).toBe(35);
    expect(Number.isNaN(ageValues[idx4])).toBe(true); // age for id=4 should be NaN
    expect(ageValues[idx5]).toBe(40);
  });

  test('joins on multiple columns', () => {
    // Arrange - Create two test DataFrames with composite keys
    const df1 = new DataFrame({
      id: [1, 1, 2, 2],
      type: ['A', 'B', 'A', 'B'],
      value: [10, 20, 30, 40],
    });

    const df2 = new DataFrame({
      id: [1, 1, 2, 3],
      type: ['A', 'B', 'A', 'C'],
      score: [100, 200, 300, 400],
    });

    // Act - Call the join method with multiple columns
    const result = df1.join(df2, ['id', 'type'], 'inner');

    // Assert
    // Check the columns exist
    expect(result.columns).toContain('id');
    expect(result.columns).toContain('type');
    expect(result.columns).toContain('value');
    expect(result.columns).toContain('score');

    // Check the number of rows (should be the number of matching composite keys)
    expect(result.rowCount).toBe(3); // (1,A), (1,B), (2,A)

    // Check the values in the joined DataFrame
    const idValues = result.col('id').toArray();
    const typeValues = result.col('type').toArray();
    const valueValues = result.col('value').toArray();
    const scoreValues = result.col('score').toArray();

    // Find indices for each composite key
    let idx1A = -1;
    let idx1B = -1;
    let idx2A = -1;

    for (let i = 0; i < idValues.length; i++) {
      if (idValues[i] === 1 && typeValues[i] === 'A') idx1A = i;
      if (idValues[i] === 1 && typeValues[i] === 'B') idx1B = i;
      if (idValues[i] === 2 && typeValues[i] === 'A') idx2A = i;
    }

    // Check values for each composite key
    expect(valueValues[idx1A]).toBe(10);
    expect(scoreValues[idx1A]).toBe(100);

    expect(valueValues[idx1B]).toBe(20);
    expect(scoreValues[idx1B]).toBe(200);

    expect(valueValues[idx2A]).toBe(30);
    expect(scoreValues[idx2A]).toBe(300);
  });
});
