import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../src/core/DataFrame.js';

describe('DataFrame.melt', () => {
  test('unpivots DataFrame from wide to long format', () => {
    // Create a test DataFrame in wide format (pivot table)
    const df = DataFrame.create({
      product: ['Product A', 'Product B'],
      North: [10, 15],
      South: [20, 25],
      East: [30, 35],
      West: [40, 45],
    });

    // Call the melt method
    const result = df.melt(['product']);

    // Check that the result is a DataFrame instance
    expect(result).toBeInstanceOf(DataFrame);

    // Check the structure of the melted DataFrame
    expect(result.frame.columnNames).toContain('product');
    expect(result.frame.columnNames).toContain('variable');
    expect(result.frame.columnNames).toContain('value');

    // Check the number of rows (should be product count * variable count)
    expect(result.frame.rowCount).toBe(8); // 2 products * 4 regions

    // Check the values in the melted DataFrame
    expect(result.frame.columns.product).toEqual([
      'Product A',
      'Product A',
      'Product A',
      'Product A',
      'Product B',
      'Product B',
      'Product B',
      'Product B',
    ]);

    expect(result.frame.columns.variable).toEqual([
      'North',
      'South',
      'East',
      'West',
      'North',
      'South',
      'East',
      'West',
    ]);

    expect(Array.from(result.frame.columns.value)).toEqual([
      10, 20, 30, 40, 15, 25, 35, 45,
    ]);
  });

  test('unpivots with custom variable and value names', () => {
    // Create a test DataFrame in wide format
    const df = DataFrame.create({
      product: ['Product A', 'Product B'],
      North: [10, 15],
      South: [20, 25],
    });

    // Call the melt method with custom variable and value names
    const result = df.melt(['product'], null, 'region', 'sales');

    // Check the structure of the melted DataFrame
    expect(result.frame.columnNames).toContain('product');
    expect(result.frame.columnNames).toContain('region');
    expect(result.frame.columnNames).toContain('sales');

    // Check the values in the melted DataFrame
    expect(result.frame.columns.product).toEqual([
      'Product A',
      'Product A',
      'Product B',
      'Product B',
    ]);

    expect(result.frame.columns.region).toEqual([
      'North',
      'South',
      'North',
      'South',
    ]);

    expect(Array.from(result.frame.columns.sales)).toEqual([10, 20, 15, 25]);
  });

  test('unpivots with specified value variables', () => {
    // Create a test DataFrame in wide format
    const df = DataFrame.create({
      product: ['Product A', 'Product B'],
      id: [1, 2],
      North: [10, 15],
      South: [20, 25],
      East: [30, 35],
    });

    // Call the melt method with specific value variables
    const result = df.melt(['product', 'id'], ['North', 'South']);

    // Check the number of rows (should be product count * specified variable count)
    expect(result.frame.rowCount).toBe(4); // 2 products * 2 regions

    // Check the values in the melted DataFrame
    expect(result.frame.columns.product).toEqual([
      'Product A',
      'Product A',
      'Product B',
      'Product B',
    ]);

    expect(Array.from(result.frame.columns.id)).toEqual([1, 1, 2, 2]);

    expect(result.frame.columns.variable).toEqual([
      'North',
      'South',
      'North',
      'South',
    ]);

    expect(Array.from(result.frame.columns.value)).toEqual([10, 20, 15, 25]);
  });

  test('handles non-numeric values in melt', () => {
    // Create a test DataFrame with string values
    const df = DataFrame.create({
      product: ['Product A', 'Product B'],
      category1: ['Electronics', 'Furniture'],
      category2: ['Small', 'Large'],
    });

    // Call the melt method
    const result = df.melt(['product']);

    // Check the values in the melted DataFrame
    expect(result.frame.columns.product).toEqual([
      'Product A',
      'Product A',
      'Product B',
      'Product B',
    ]);

    expect(result.frame.columns.variable).toEqual([
      'category1',
      'category2',
      'category1',
      'category2',
    ]);

    expect(result.frame.columns.value).toEqual([
      'Electronics',
      'Small',
      'Furniture',
      'Large',
    ]);

    // Check that the value column has the correct type
    // В нашей реализации строковые значения имеют тип 'string', а не 'str'
    expect(result.frame.dtypes.value).toBe('string');
  });

  test('throws an error with invalid arguments', () => {
    // Create a test DataFrame
    const df = DataFrame.create({
      product: ['Product A', 'Product B'],
      North: [10, 15],
      South: [20, 25],
    });

    // Check that the method throws an error if idVars is not an array
    expect(() => df.melt('product')).toThrow();
    expect(() => df.melt(null)).toThrow();
    // Пустой массив idVars теперь допустим, так как valueVars будут автоматически определены
    // как все столбцы, которые не указаны в idVars

    // Check that the method throws an error if idVars contains non-existent columns
    expect(() => df.melt(['nonexistent'])).toThrow();
  });
});
