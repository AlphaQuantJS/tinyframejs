import { describe, test, expect, beforeAll } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import {
  categorize,
  register as registerCategorize,
} from '../../../../src/methods/dataframe/transform/categorize.js';

// Register categorize method on DataFrame prototype before tests
beforeAll(() => {
  registerCategorize(DataFrame);
});

// Test data to be used in all tests
const testData = {
  value: [10, 20, 30, 40, 50],
  category: ['A', 'B', 'A', 'C', 'B'],
  mixed: ['20', 30, null, undefined, NaN],
};

describe('DataFrame.categorize', () => {
  test('categorizes values in a column', () => {
    // Arrange
    const df = new DataFrame(testData);
    const categories = {
      10: 'Low',
      20: 'Low',
      30: 'Medium',
      40: 'Medium',
      50: 'High',
    };

    // Act
    const result = df.categorize('value', categories);

    // Assert
    expect(result).toBeInstanceOf(DataFrame);
    expect(result.columns).toContain('value_categorized');
    expect(result.col('value_categorized').toArray()).toEqual([
      'Low',
      'Low',
      'Medium',
      'Medium',
      'High',
    ]);
    expect(df.columns).not.toContain('value_categorized'); // Original DataFrame unchanged
  });

  test('uses custom target column name', () => {
    // Arrange
    const df = new DataFrame(testData);
    const categories = {
      10: 'Low',
      20: 'Low',
      30: 'Medium',
      40: 'Medium',
      50: 'High',
    };
    const targetColumn = 'value_group';

    // Act
    const result = df.categorize('value', categories, { targetColumn });

    // Assert
    expect(result.columns).toContain(targetColumn);
    expect(result.columns).not.toContain('value_categorized'); // Default name not used
    expect(result.col(targetColumn).toArray()).toEqual([
      'Low',
      'Low',
      'Medium',
      'Medium',
      'High',
    ]);
  });

  test('handles default category for values not in categories', () => {
    // Arrange
    const df = new DataFrame(testData);
    const categories = {
      10: 'Low',
      30: 'Medium',
      50: 'High',
    };
    const defaultCategory = 'Unknown';

    // Act
    const result = df.categorize('value', categories, { defaultCategory });

    // Assert
    expect(result.col('value_categorized').toArray()).toEqual([
      'Low',
      'Unknown',
      'Medium',
      'Unknown',
      'High',
    ]);
  });

  test('supports inplace modification', () => {
    // Arrange
    const df = new DataFrame(testData);
    const categories = {
      10: 'Low',
      20: 'Low',
      30: 'Medium',
      40: 'Medium',
      50: 'High',
    };

    // Act
    const result = df.categorize('value', categories, { inplace: true });

    // Assert
    expect(result).toBe(df); // Returns the same DataFrame instance
    expect(df.columns).toContain('value_categorized'); // Original DataFrame modified
    expect(df.col('value_categorized').toArray()).toEqual([
      'Low',
      'Low',
      'Medium',
      'Medium',
      'High',
    ]);
  });

  test('throws an error if column does not exist', () => {
    // Arrange
    const df = new DataFrame(testData);
    const categories = { 10: 'Low', 20: 'Medium', 30: 'High' };

    // Act & Assert
    expect(() => df.categorize('nonexistent', categories)).toThrow(
      "Column 'nonexistent' not found",
    );
  });

  test('throws an error with invalid arguments', () => {
    // Arrange
    const df = new DataFrame(testData);

    // Act & Assert
    expect(() => df.categorize(null, { 10: 'Low' })).toThrow(
      'Column name must be a string',
    );
    expect(() => df.categorize('value', null)).toThrow(
      'Categories must be an object',
    );
    expect(() => df.categorize('value', 'not an object')).toThrow(
      'Categories must be an object',
    );
    expect(() => df.categorize('value', [1, 2, 3])).toThrow(
      'Categories must be an object',
    );
  });

  test('direct function call works the same as method call', () => {
    // Arrange
    const df = new DataFrame(testData);
    const categories = {
      10: 'Low',
      20: 'Low',
      30: 'Medium',
      40: 'Medium',
      50: 'High',
    };

    // Act
    const result1 = df.categorize('value', categories);
    const result2 = categorize(df, 'value', categories);

    // Assert
    expect(result1.col('value_categorized').toArray()).toEqual(
      result2.col('value_categorized').toArray(),
    );
  });
});
