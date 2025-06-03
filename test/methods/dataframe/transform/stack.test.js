import { describe, test, expect, beforeAll } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';

// Import the stack method register function directly
import { register as registerStack } from '../../../../src/methods/dataframe/transform/stack.js';

// Register stack method on DataFrame prototype before tests
beforeAll(() => {
  registerStack(DataFrame);
});

describe('DataFrame.stack', () => {
  // Helper function to create test data in wide format
  const createWideDataFrame = () =>
    new DataFrame({
      product: ['Product A', 'Product B'],
      id: [1, 2],
      category: ['Electronics', 'Furniture'],
      North: [10, 15],
      South: [20, 25],
      East: [30, 35],
      West: [40, 45],
    });

  // Helper function to create test data with non-numeric values
  const createStatusDataFrame = () =>
    new DataFrame({
      product: ['Product A', 'Product B'],
      status2023: ['Active', 'Inactive'],
      status2024: ['Inactive', 'Active'],
    });

  test('stacks columns into rows', () => {
    const df = createWideDataFrame();

    // Call the stack method
    const result = df.stack('product');

    // Check that the result is a DataFrame instance
    expect(result).toBeInstanceOf(DataFrame);

    // Check the structure of the stacked DataFrame
    expect(result.columns).toContain('product');
    expect(result.columns).toContain('variable');
    expect(result.columns).toContain('value');

    // Check the number of rows (should be product count * variable count)
    expect(result.rowCount).toBe(8); // 2 products * 4 regions

    // Convert to array for easier testing
    const rows = result.toArray();

    // First product values
    expect(rows[0].product).toBe('Product A');
    expect(rows[0].variable).toBe('North');
    expect(rows[0].value).toBe(10);

    expect(rows[1].product).toBe('Product A');
    expect(rows[1].variable).toBe('South');
    expect(rows[1].value).toBe(20);

    expect(rows[2].product).toBe('Product A');
    expect(rows[2].variable).toBe('East');
    expect(rows[2].value).toBe(30);

    expect(rows[3].product).toBe('Product A');
    expect(rows[3].variable).toBe('West');
    expect(rows[3].value).toBe(40);

    // Second product values
    expect(rows[4].product).toBe('Product B');
    expect(rows[4].variable).toBe('North');
    expect(rows[4].value).toBe(15);

    expect(rows[5].product).toBe('Product B');
    expect(rows[5].variable).toBe('South');
    expect(rows[5].value).toBe(25);

    expect(rows[6].product).toBe('Product B');
    expect(rows[6].variable).toBe('East');
    expect(rows[6].value).toBe(35);

    expect(rows[7].product).toBe('Product B');
    expect(rows[7].variable).toBe('West');
    expect(rows[7].value).toBe(45);
  });

  test('stacks with custom variable and value names', () => {
    const df = createWideDataFrame();

    // Call the stack method with custom variable and value names
    const result = df.stack('product', null, 'region', 'sales');

    // Check the structure of the stacked DataFrame
    expect(result.columns).toContain('product');
    expect(result.columns).toContain('region');
    expect(result.columns).toContain('sales');

    // Convert to array for easier testing
    const rows = result.toArray();

    // Check first few rows
    expect(rows[0].product).toBe('Product A');
    expect(rows[0].region).toBe('North');
    expect(rows[0].sales).toBe(10);

    expect(rows[1].product).toBe('Product A');
    expect(rows[1].region).toBe('South');
    expect(rows[1].sales).toBe(20);
  });

  test('stacks with specified value variables', () => {
    const df = createWideDataFrame();

    // Call the stack method with specific value variables
    const result = df.stack(['product', 'id'], ['North', 'South']);

    // Check the number of rows (should be product count * specified variable count)
    expect(result.rowCount).toBe(4); // 2 products * 2 regions

    // Convert to array for easier testing
    const rows = result.toArray();

    // Check rows
    expect(rows[0].product).toBe('Product A');
    expect(rows[0].id).toBe(1);
    expect(rows[0].variable).toBe('North');
    expect(rows[0].value).toBe(10);

    expect(rows[1].product).toBe('Product A');
    expect(rows[1].id).toBe(1);
    expect(rows[1].variable).toBe('South');
    expect(rows[1].value).toBe(20);

    expect(rows[2].product).toBe('Product B');
    expect(rows[2].id).toBe(2);
    expect(rows[2].variable).toBe('North');
    expect(rows[2].value).toBe(15);

    expect(rows[3].product).toBe('Product B');
    expect(rows[3].id).toBe(2);
    expect(rows[3].variable).toBe('South');
    expect(rows[3].value).toBe(25);
  });

  test('stacks with multiple id columns', () => {
    const df = createWideDataFrame();

    // Call the stack method with multiple id columns
    const result = df.stack(['product', 'category']);

    // Check the structure of the stacked DataFrame
    expect(result.columns).toContain('product');
    expect(result.columns).toContain('category');
    expect(result.columns).toContain('variable');
    expect(result.columns).toContain('value');

    // Convert to array for easier testing
    const rows = result.toArray();

    // Check rows
    expect(rows[0].product).toBe('Product A');
    expect(rows[0].category).toBe('Electronics');
    expect(rows[0].variable).toBe('North');
    expect(rows[0].value).toBe(10);

    expect(rows[1].product).toBe('Product A');
    expect(rows[1].category).toBe('Electronics');
    expect(rows[1].variable).toBe('South');
    expect(rows[1].value).toBe(20);
  });

  test('handles non-numeric values in stack', () => {
    const df = createStatusDataFrame();

    // Call the stack method
    const result = df.stack('product');

    // Convert to array for easier testing
    const rows = result.toArray();

    // Check rows
    expect(rows[0].product).toBe('Product A');
    expect(rows[0].variable).toBe('status2023');
    expect(rows[0].value).toBe('Active');

    expect(rows[1].product).toBe('Product A');
    expect(rows[1].variable).toBe('status2024');
    expect(rows[1].value).toBe('Inactive');

    expect(rows[2].product).toBe('Product B');
    expect(rows[2].variable).toBe('status2023');
    expect(rows[2].value).toBe('Inactive');

    expect(rows[3].product).toBe('Product B');
    expect(rows[3].variable).toBe('status2024');
    expect(rows[3].value).toBe('Active');
  });

  test('throws an error with invalid arguments', () => {
    const df = createWideDataFrame();

    // Check that the method throws an error if id_vars is not provided
    expect(() => df.stack()).toThrow();

    // Check that the method throws an error if id_vars column doesn't exist
    expect(() => df.stack('nonexistent')).toThrow();

    // Check that the method throws an error if value_vars column doesn't exist
    expect(() => df.stack('product', ['nonexistent'])).toThrow();
  });
});
