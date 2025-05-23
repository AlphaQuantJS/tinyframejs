import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../src/core/DataFrame.js';

describe('DataFrame.stack', () => {
  test('stacks columns into rows', () => {
    // Create a test DataFrame in wide format
    const df = DataFrame.create({
      product: ['Product A', 'Product B'],
      North: [10, 15],
      South: [20, 25],
      East: [30, 35],
      West: [40, 45],
    });

    // Call the stack method
    const result = df.stack('product');

    // Check that the result is a DataFrame instance
    expect(result).toBeInstanceOf(DataFrame);

    // Check the structure of the stacked DataFrame
    expect(result.frame.columnNames).toContain('product');
    expect(result.frame.columnNames).toContain('variable');
    expect(result.frame.columnNames).toContain('value');

    // Check the number of rows (should be product count * variable count)
    expect(result.frame.rowCount).toBe(8); // 2 products * 4 regions

    // Check the values in the stacked DataFrame
    const products = Array.from(result.frame.columns.product);
    const variables = Array.from(result.frame.columns.variable);
    const values = Array.from(result.frame.columns.value);

    // First product values
    expect(products.slice(0, 4)).toEqual([
      'Product A',
      'Product A',
      'Product A',
      'Product A',
    ]);
    expect(variables.slice(0, 4)).toEqual(['North', 'South', 'East', 'West']);
    expect(values.slice(0, 4)).toEqual([10, 20, 30, 40]);

    // Second product values
    expect(products.slice(4, 8)).toEqual([
      'Product B',
      'Product B',
      'Product B',
      'Product B',
    ]);
    expect(variables.slice(4, 8)).toEqual(['North', 'South', 'East', 'West']);
    expect(values.slice(4, 8)).toEqual([15, 25, 35, 45]);
  });

  test('stacks with custom variable and value names', () => {
    // Create a test DataFrame in wide format
    const df = DataFrame.create({
      product: ['Product A', 'Product B'],
      North: [10, 15],
      South: [20, 25],
    });

    // Call the stack method with custom variable and value names
    const result = df.stack('product', null, 'region', 'sales');

    // Check the structure of the stacked DataFrame
    expect(result.frame.columnNames).toContain('product');
    expect(result.frame.columnNames).toContain('region');
    expect(result.frame.columnNames).toContain('sales');

    // Check the values in the stacked DataFrame
    const products = Array.from(result.frame.columns.product);
    const regions = Array.from(result.frame.columns.region);
    const sales = Array.from(result.frame.columns.sales);

    expect(products).toEqual([
      'Product A',
      'Product A',
      'Product B',
      'Product B',
    ]);
    expect(regions).toEqual(['North', 'South', 'North', 'South']);
    expect(sales).toEqual([10, 20, 15, 25]);
  });

  test('stacks with specified value variables', () => {
    // Create a test DataFrame in wide format
    const df = DataFrame.create({
      product: ['Product A', 'Product B'],
      id: [1, 2],
      North: [10, 15],
      South: [20, 25],
      East: [30, 35],
      West: [40, 45],
    });

    // Call the stack method with specific value variables
    const result = df.stack(['product', 'id'], ['North', 'South']);

    // Check the number of rows (should be product count * specified variable count)
    expect(result.frame.rowCount).toBe(4); // 2 products * 2 regions

    // Check the values in the stacked DataFrame
    const products = Array.from(result.frame.columns.product);
    const ids = Array.from(result.frame.columns.id);
    const variables = Array.from(result.frame.columns.variable);
    const values = Array.from(result.frame.columns.value);

    expect(products).toEqual([
      'Product A',
      'Product A',
      'Product B',
      'Product B',
    ]);
    expect(ids).toEqual([1, 1, 2, 2]);
    expect(variables).toEqual(['North', 'South', 'North', 'South']);
    expect(values).toEqual([10, 20, 15, 25]);
  });

  test('stacks with multiple id columns', () => {
    // Create a test DataFrame in wide format
    const df = DataFrame.create({
      product: ['Product A', 'Product B'],
      category: ['Electronics', 'Furniture'],
      North: [10, 15],
      South: [20, 25],
    });

    // Call the stack method with multiple id columns
    const result = df.stack(['product', 'category']);

    // Check the structure of the stacked DataFrame
    expect(result.frame.columnNames).toContain('product');
    expect(result.frame.columnNames).toContain('category');
    expect(result.frame.columnNames).toContain('variable');
    expect(result.frame.columnNames).toContain('value');

    // Check the values in the stacked DataFrame
    const products = Array.from(result.frame.columns.product);
    const categories = Array.from(result.frame.columns.category);
    const variables = Array.from(result.frame.columns.variable);
    const values = Array.from(result.frame.columns.value);

    expect(products).toEqual([
      'Product A',
      'Product A',
      'Product B',
      'Product B',
    ]);
    expect(categories).toEqual([
      'Electronics',
      'Electronics',
      'Furniture',
      'Furniture',
    ]);
    expect(variables).toEqual(['North', 'South', 'North', 'South']);
    expect(values).toEqual([10, 20, 15, 25]);
  });

  test('handles non-numeric values in stack', () => {
    // Create a test DataFrame with non-numeric values
    const df = DataFrame.create({
      product: ['Product A', 'Product B'],
      status2023: ['Active', 'Inactive'],
      status2024: ['Inactive', 'Active'],
    });

    // Call the stack method
    const result = df.stack('product');

    // Check the values in the stacked DataFrame
    const products = Array.from(result.frame.columns.product);
    const variables = Array.from(result.frame.columns.variable);
    const values = Array.from(result.frame.columns.value);

    expect(products).toEqual([
      'Product A',
      'Product A',
      'Product B',
      'Product B',
    ]);
    expect(variables).toEqual([
      'status2023',
      'status2024',
      'status2023',
      'status2024',
    ]);
    expect(values).toEqual(['Active', 'Inactive', 'Inactive', 'Active']);
  });

  test('throws an error with invalid arguments', () => {
    // Create a test DataFrame
    const df = DataFrame.create({
      product: ['Product A', 'Product B'],
      North: [10, 15],
      South: [20, 25],
    });

    // Check that the method throws an error if id_vars is not provided
    expect(() => df.stack()).toThrow();

    // Check that the method throws an error if id_vars column doesn't exist
    expect(() => df.stack('nonexistent')).toThrow();

    // Check that the method throws an error if value_vars column doesn't exist
    expect(() => df.stack('product', ['nonexistent'])).toThrow();
  });
});
