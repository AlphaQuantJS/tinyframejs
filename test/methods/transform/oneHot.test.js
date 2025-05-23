import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../src/core/DataFrame.js';

describe('DataFrame.oneHot', () => {
  test('creates one-hot encoding for a categorical column', () => {
    // Create a test DataFrame
    const df = DataFrame.create({
      department: [
        'Engineering',
        'Marketing',
        'Engineering',
        'Sales',
        'Marketing',
      ],
    });

    // Call the oneHot method
    const result = df.oneHot('department');

    // Check that the result is a DataFrame instance
    expect(result).toBeInstanceOf(DataFrame);

    // Check that new columns are added
    expect(result.frame.columns).toHaveProperty('department_Engineering');
    expect(result.frame.columns).toHaveProperty('department_Marketing');
    expect(result.frame.columns).toHaveProperty('department_Sales');

    // Check values in the new columns
    expect(Array.from(result.frame.columns.department_Engineering)).toEqual([
      1, 0, 1, 0, 0,
    ]);
    expect(Array.from(result.frame.columns.department_Marketing)).toEqual([
      0, 1, 0, 0, 1,
    ]);
    expect(Array.from(result.frame.columns.department_Sales)).toEqual([
      0, 0, 0, 1, 0,
    ]);

    // Check that the original column is preserved
    expect(result.frame.columns.department).toEqual([
      'Engineering',
      'Marketing',
      'Engineering',
      'Sales',
      'Marketing',
    ]);
  });

  test('uses custom prefix for new columns', () => {
    // Create a test DataFrame
    const df = DataFrame.create({
      department: [
        'Engineering',
        'Marketing',
        'Engineering',
        'Sales',
        'Marketing',
      ],
    });

    // Call oneHot with custom prefix
    const result = df.oneHot('department', { prefix: 'dept_' });

    // Check that new columns are added with the specified prefix
    expect(result.frame.columns).toHaveProperty('dept_Engineering');
    expect(result.frame.columns).toHaveProperty('dept_Marketing');
    expect(result.frame.columns).toHaveProperty('dept_Sales');
  });

  test('removes original column when dropOriginal=true', () => {
    // Create a test DataFrame
    const df = DataFrame.create({
      department: [
        'Engineering',
        'Marketing',
        'Engineering',
        'Sales',
        'Marketing',
      ],
    });

    // Call oneHot with dropOriginal=true
    const result = df.oneHot('department', { dropOriginal: true });

    // Check that the original column is removed
    expect(result.frame.columns).not.toHaveProperty('department');

    // Check that new columns are added
    expect(result.frame.columns).toHaveProperty('department_Engineering');
    expect(result.frame.columns).toHaveProperty('department_Marketing');
    expect(result.frame.columns).toHaveProperty('department_Sales');
  });

  test('drops first category when dropFirst=true', () => {
    // Create a test DataFrame
    const df = DataFrame.create({
      department: [
        'Engineering',
        'Marketing',
        'Engineering',
        'Sales',
        'Marketing',
      ],
    });

    // Call oneHot with dropFirst=true
    const result = df.oneHot('department', { dropFirst: true });

    // Check that the first category (alphabetically) is not included
    expect(result.frame.columns).not.toHaveProperty('department_Engineering');
    expect(result.frame.columns).toHaveProperty('department_Marketing');
    expect(result.frame.columns).toHaveProperty('department_Sales');
  });

  test('uses specified data type for encoded columns', () => {
    // Create a test DataFrame
    const df = DataFrame.create({
      department: [
        'Engineering',
        'Marketing',
        'Engineering',
        'Sales',
        'Marketing',
      ],
    });

    // Call oneHot with different dtypes
    const resultI32 = df.oneHot('department', { dtype: 'i32' });
    const resultF64 = df.oneHot('department', { dtype: 'f64' });

    // Check that columns have the correct type
    expect(resultI32.frame.columns.department_Engineering).toBeInstanceOf(
      Int32Array,
    );
    expect(resultI32.frame.dtypes.department_Engineering).toBe('i32');

    expect(resultF64.frame.columns.department_Engineering).toBeInstanceOf(
      Float64Array,
    );
    expect(resultF64.frame.dtypes.department_Engineering).toBe('f64');
  });

  test('handles null values with handleNull option', () => {
    // Create DataFrame with null values
    const dfWithNulls = DataFrame.create({
      category: ['A', null, 'B', undefined, 'A'],
    });

    // Test with handleNull='ignore' (default)
    const resultIgnore = dfWithNulls.oneHot('category');
    const newColumnsIgnore = resultIgnore.frame.columnNames.filter(
      (col) => col !== 'category',
    );
    expect(newColumnsIgnore).toEqual(['category_A', 'category_B']);

    // Test with handleNull='encode'
    const resultEncode = dfWithNulls.oneHot('category', {
      handleNull: 'encode',
    });
    const newColumnsEncode = resultEncode.frame.columnNames.filter(
      (col) => col !== 'category',
    );
    expect(newColumnsEncode).toContain('category_A');
    expect(newColumnsEncode).toContain('category_B');
    expect(newColumnsEncode).toContain('category_null');

    // Check values in the null column
    expect(Array.from(resultEncode.frame.columns.category_null)).toEqual([
      0, 1, 0, 1, 0,
    ]);
  });

  test('uses predefined categories when provided', () => {
    // Create a test DataFrame
    const df = DataFrame.create({
      department: ['Engineering', 'Marketing', 'Engineering'],
    });

    // Call oneHot with predefined categories
    const result = df.oneHot('department', {
      categories: ['Engineering', 'Marketing', 'HR', 'Sales'],
    });

    // Check that all specified categories are included, even if not in data
    expect(result.frame.columns).toHaveProperty('department_Engineering');
    expect(result.frame.columns).toHaveProperty('department_Marketing');
    expect(result.frame.columns).toHaveProperty('department_HR');
    expect(result.frame.columns).toHaveProperty('department_Sales');

    // Check values for a category not present in the data
    expect(Array.from(result.frame.columns.department_HR)).toEqual([0, 0, 0]);
  });

  test('throws an error with invalid arguments', () => {
    // Create a test DataFrame
    const df = DataFrame.create({
      department: [
        'Engineering',
        'Marketing',
        'Engineering',
        'Sales',
        'Marketing',
      ],
    });

    // Check that the method throws an error if column doesn't exist
    expect(() => df.oneHot('nonexistent')).toThrow();

    // Check that the method throws an error with invalid dtype
    expect(() => df.oneHot('department', { dtype: 'invalid' })).toThrow();

    // Check that the method throws an error with invalid handleNull
    expect(() => df.oneHot('department', { handleNull: 'invalid' })).toThrow();

    // Create DataFrame with null values
    const dfWithNulls = DataFrame.create({
      category: ['A', null, 'B'],
    });

    // Check that the method throws an error with handleNull='error'
    expect(() =>
      dfWithNulls.oneHot('category', { handleNull: 'error' }),
    ).toThrow();
  });
});
