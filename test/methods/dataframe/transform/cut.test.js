import { describe, test, expect, beforeAll } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import {
  cut,
  register as registerCut,
} from '../../../../src/methods/dataframe/transform/cut.js';
import { register as registerAssign } from '../../../../src/methods/dataframe/transform/assign.js';

// Register cut and assign methods on DataFrame prototype before tests
beforeAll(() => {
  registerAssign(DataFrame); // Needed for inplace option
  registerCut(DataFrame);
});

/*
 * cut.test.js – basic and extended tests for the cut function
 * The semantics correspond to the "historical" behavior of TinyFrame/AlphaQuant,
 * which differs from pandas.
 */

describe('DataFrame.cut', () => {
  test('creates a binned column with default settings', () => {
    // Arrange
    const df = new DataFrame({
      value: [10, 20, 30, 40, 50],
    });
    const bins = [0, 20, 40, 60];
    const labels = ['Low', 'Medium', 'High'];

    // Act
    const result = df.cut('value', bins, { labels });

    // Assert
    expect(result).toBeInstanceOf(DataFrame);
    expect(result.columns).toContain('value_bin');
    expect(result.col('value_bin').toArray()).toEqual([
      null,
      'Low',
      'Medium',
      'Medium',
      'High',
    ]);
    expect(df.columns).not.toContain('value_bin'); // Original DataFrame unchanged
  });

  test('uses custom target column name', () => {
    // Arrange
    const df = new DataFrame({
      value: [10, 20, 30, 40, 50],
    });
    const bins = [0, 20, 40, 60];
    const labels = ['Low', 'Medium', 'High'];
    const targetColumn = 'value_category';

    // Act
    const result = df.cut('value', bins, { labels, targetColumn });

    // Assert
    expect(result.columns).toContain(targetColumn);
    expect(result.columns).not.toContain('value_bin'); // Default name not used
    expect(result.col(targetColumn).toArray()).toEqual([
      null,
      'Low',
      'Medium',
      'Medium',
      'High',
    ]);
  });

  test('works with includeLowest=true', () => {
    // Arrange
    const df = new DataFrame({
      value: [0, 10, 20, 30, 40],
    });
    const bins = [0, 20, 40];
    const labels = ['Low', 'Medium', 'High'];

    // Act
    const result = df.cut('value', bins, { labels, includeLowest: true });

    // Assert
    // With includeLowest=true, value 0 falls into the first interval
    expect(result.col('value_bin').toArray()).toEqual([
      'Low',
      'Low',
      'Medium',
      'Medium',
      null,
    ]);
  });

  test('works with right=false', () => {
    // Arrange
    const df = new DataFrame({
      value: [10, 20, 30, 40, 50],
    });
    const bins = [0, 20, 40, 60];
    const labels = ['Low', 'Medium', 'High'];

    // Act
    const result = df.cut('value', bins, { labels, right: false });

    // Assert
    // With right=false, value 10 falls into the first interval [0, 20)
    expect(result.col('value_bin').toArray()).toEqual([
      'Low',
      null,
      'Medium',
      null,
      'High',
    ]);
  });

  test('works with right=false and includeLowest=true', () => {
    // Arrange
    const df = new DataFrame({
      value: [0, 10, 20, 30, 40, 50],
    });
    const bins = [0, 20, 40, 60];
    const labels = ['Low', 'Medium', 'High'];

    // Act
    const result = df.cut('value', bins, {
      labels,
      right: false,
      includeLowest: true,
    });

    // Assert
    // With right=false and includeLowest=true, value 0 falls into the first interval [0, 20)
    // Value 20 does not fall into the first interval [0, 20), but falls into [20, 40)
    expect(result.col('value_bin').toArray()).toEqual([
      'Low',
      'Low',
      'Medium',
      'Medium',
      'High',
      'High',
    ]);
  });

  test('handles null, undefined and NaN', () => {
    // Arrange
    const df = new DataFrame({
      value: [10, null, 40, undefined, NaN, 60],
    });
    const bins = [0, 30, 50, 100];
    const labels = ['Low', 'Medium', 'High'];

    // Act
    const result = df.cut('value', bins, { labels });

    // Assert
    expect(result.col('value_bin').toArray()).toEqual([
      'Low',
      null,
      'Medium',
      null,
      null,
      'High',
    ]);
  });

  test('supports inplace modification', () => {
    // Arrange
    const df = new DataFrame({
      value: [10, 20, 30, 40, 50],
    });
    const bins = [0, 20, 40, 60];
    const labels = ['Low', 'Medium', 'High'];

    // Act
    const result = df.cut('value', bins, { labels, inplace: true });

    // Assert
    expect(result).toBe(df); // Returns the same DataFrame instance
    expect(df.columns).toContain('value_bin'); // Original DataFrame modified
    // With inplace=true, values should be as expected
    expect(df.col('value_bin').toArray()).toEqual([
      'Low',
      'Low',
      'Medium',
      'Medium',
      'High',
    ]);
  });

  test('throws error with invalid arguments', () => {
    // Arrange
    const df = new DataFrame({
      value: [10, 20, 30, 40, 50],
    });

    // Act & Assert
    expect(() => df.cut(null, [0, 30, 100])).toThrow(
      'Column name must be a string',
    );
    expect(() => df.cut('value', null)).toThrow('Bins must be an array');
    expect(() => df.cut('value', [30])).toThrow('at least 2 elements');
    expect(() => df.cut('nonexistent', [0, 30, 100])).toThrow(
      "Column 'nonexistent' not found",
    );
    expect(() => df.cut('value', [0, 30, 100], { labels: 'str' })).toThrow(
      'Labels must be an array',
    );
    expect(() => df.cut('value', [0, 30, 100], { labels: ['A'] })).toThrow(
      'equal to bins.length - 1',
    );
    expect(() =>
      df.cut('value', [0, 30, 100], { labels: ['A', 'B', 'C'] }),
    ).toThrow('equal to bins.length - 1');
  });

  test('direct function call works the same as method call', () => {
    // Arrange
    const df = new DataFrame({
      value: [10, 20, 30, 40, 50],
    });
    const bins = [0, 20, 40, 60];
    const labels = ['Low', 'Medium', 'High'];

    // Act
    const result1 = df.cut('value', bins, { labels });
    const result2 = cut(df, 'value', bins, { labels });

    // Assert
    expect(result1.col('value_bin').toArray()).toEqual(
      result2.col('value_bin').toArray(),
    );
  });

  describe('interval boundaries', () => {
    test('right=true, includeLowest=false – skip entire first interval', () => {
      // Arrange
      const df = new DataFrame({
        value: [0, 5, 9, 10, 15],
      });
      const bins = [0, 10, 20];
      const labels = ['Low', 'High'];

      // Act
      const result = df.cut('value', bins, { labels });

      // Assert
      // With right=true and includeLowest=false, values 0, 5, 9 do not fall into the first interval (0, 10],
      // while 10 falls into the second interval (10, 20], and 15 also falls into the second interval
      expect(result.col('value_bin').toArray()).toEqual([
        null,
        null,
        null,
        'High',
        'High',
      ]);
    });

    test('right=true, includeLowest=true – only exact lower boundary', () => {
      // Arrange
      const df = new DataFrame({
        value: [0, 1],
      });
      const bins = [0, 10, 20];
      const labels = ['Low', 'High'];

      // Act
      const result = df.cut('value', bins, { labels, includeLowest: true });

      // Assert
      // With includeLowest=true, value 0 falls into the first interval [0, 10),
      // while value 1 falls into the first interval (0, 10]
      expect(result.col('value_bin').toArray()).toEqual(['Low', 'Low']);
    });

    test('right=false, includeLowest=false – skip entire last interval', () => {
      // Arrange
      const df = new DataFrame({
        value: [0, 5, 10, 19, 20],
      });
      const bins = [0, 10, 20];
      const labels = ['Low', 'High'];

      // Act
      const result = df.cut('value', bins, { labels, right: false });

      // Assert
      expect(result.col('value_bin').toArray()).toEqual([
        'Low',
        'Low',
        'High',
        'High',
        null,
      ]);
    });

    test('right=false, includeLowest=true – include last boundary', () => {
      // Arrange
      const df = new DataFrame({
        value: [0, 20],
      });
      const bins = [0, 10, 20];
      const labels = ['Low', 'High'];

      // Act
      const result = df.cut('value', bins, {
        labels,
        right: false,
        includeLowest: true,
      });

      // Assert
      expect(result.col('value_bin').toArray()).toEqual(['Low', 'High']);
    });
  });
});
