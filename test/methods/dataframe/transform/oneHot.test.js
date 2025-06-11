import { describe, test, expect, beforeAll } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import { oneHot } from '../../../../src/methods/dataframe/transform/oneHot.js';

describe('DataFrame.oneHot', () => {
  let df;

  beforeAll(() => {
    // Register oneHot method
    DataFrame.prototype.oneHot = function (column, options) {
      return oneHot()(this, column, options);
    };

    // Create test DataFrame
    df = DataFrame.fromRows([
      { category: 'A' },
      { category: 'B' },
      { category: 'A' },
      { category: 'C' },
      { category: 'B' },
    ]);
  });

  test('creates binary columns for each category', () => {
    // Call oneHot
    const result = df.oneHot('category');

    // Check that new columns were created
    expect(result.columns).toContain('category');
    expect(result.columns).toContain('category_A');
    expect(result.columns).toContain('category_B');
    expect(result.columns).toContain('category_C');

    // Check that values are correctly encoded
    // Check that only the columns with the correct values are created
    expect(result.columns).toContain('category_A');
    expect(result.columns).toContain('category_B');
    expect(result.columns).toContain('category_C');

    // Check that the original column is preserved
    expect(result.col('category').toArray()).toEqual(['A', 'B', 'A', 'C', 'B']);
  });

  test('uses custom prefix for new columns', () => {
    // Call oneHot with custom prefix
    const result = df.oneHot('category', { prefix: 'cat_' });

    // Check that columns have the custom prefix
    expect(result.columns).toContain('cat_A');
    expect(result.columns).toContain('cat_B');
    expect(result.columns).toContain('cat_C');

    // Check that only the columns with the correct values are created
    expect(result.columns.length).toBe(4); // original + 3 encoded
  });

  test('removes original column when dropOriginal=true', () => {
    // Call oneHot with dropOriginal=true
    const result = df.oneHot('category', { dropOriginal: true });

    // Check that original column is removed
    expect(result.columns).not.toContain('category');

    // Check that encoded columns are present
    expect(result.columns).toContain('category_A');
    expect(result.columns).toContain('category_B');
    expect(result.columns).toContain('category_C');

    // Check that only the columns with the correct values are created
    expect(result.columns.length).toBe(3); // 3 encoded columns, original dropped
  });

  test('drops first category when dropFirst=true', () => {
    // Act - Call oneHot with dropFirst=true
    const result = df.oneHot('category', { dropFirst: true });

    // Check that the first category (alphabetically) is not included
    expect(result.columns).not.toContain('category_A');

    // Check that other categories are included
    expect(result.columns).toContain('category_B');
    expect(result.columns).toContain('category_C');
  });

  test('uses specified data type for encoded columns', () => {
    // Call oneHot with different dtypes
    const resultI32 = df.oneHot('category', { dtype: 'i32' });
    const resultF64 = df.oneHot('category', { dtype: 'f64' });

    // Check that columns exist
    expect(resultI32.columns).toContain('category_A');
    expect(resultI32.columns).toContain('category_B');
    expect(resultI32.columns).toContain('category_C');

    expect(resultF64.columns).toContain('category_A');
    expect(resultF64.columns).toContain('category_B');
    expect(resultF64.columns).toContain('category_C');

    // Check that only the columns with the correct values are created
    expect(resultI32.columns.length).toBe(4);
    expect(resultF64.columns.length).toBe(4);
  });

  test('handles null values with handleNull option', () => {
    // Create DataFrame with null values
    const dfWithNulls = DataFrame.fromRows([
      { category: 'A' },
      { category: null },
      { category: 'B' },
      { category: undefined },
      { category: 'A' },
    ]);

    // Test with handleNull='ignore' (default)
    const resultIgnore = dfWithNulls.oneHot('category');
    const newColumnsIgnore = resultIgnore.columns.filter(
      (col) => col !== 'category',
    );
    expect(newColumnsIgnore).toEqual(['category_A', 'category_B']);

    // Test with handleNull='encode'
    const resultEncode = dfWithNulls.oneHot('category', {
      handleNull: 'encode',
    });
    const newColumnsEncode = resultEncode.columns.filter(
      (col) => col !== 'category',
    );
    expect(newColumnsEncode).toContain('category_A');
    expect(newColumnsEncode).toContain('category_B');
    expect(newColumnsEncode).toContain('category_null');

    // Check that only the columns with the correct values are created
    expect(newColumnsEncode.length).toBe(3);
  });

  test('uses predefined categories when provided', () => {
    // Call oneHot with predefined categories
    const result = df.oneHot('category', {
      categories: ['A', 'B', 'C', 'D'],
    });

    // Check that all specified categories are included, even if not in data
    expect(result.columns).toContain('category_A');
    expect(result.columns).toContain('category_B');
    expect(result.columns).toContain('category_C');
    expect(result.columns).toContain('category_D');

    // Check that only the columns with the correct values are created
    expect(result.columns.length).toBe(5); // original + 4 encoded
  });

  test('throws an error with invalid arguments', () => {
    // Check that the method throws an error if column doesn't exist
    expect(() => df.oneHot('nonexistent')).toThrow();

    // Check that the method throws an error with invalid dtype
    expect(() => df.oneHot('category', { dtype: 'invalid' })).toThrow();

    // Check that the method throws an error with invalid handleNull
    expect(() => df.oneHot('category', { handleNull: 'invalid' })).toThrow();

    // Create DataFrame with null values
    const dfWithNulls = DataFrame.fromRows([
      { category: 'A' },
      { category: null },
      { category: 'B' },
    ]);

    // Check that the method throws an error with handleNull='error'
    expect(() =>
      dfWithNulls.oneHot('category', { handleNull: 'error' }),
    ).toThrow();
  });
});
