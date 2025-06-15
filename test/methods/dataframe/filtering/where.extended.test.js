/**
 * Tests for extended where method with simplified expression syntax
 */

import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import { describe, test, expect, beforeEach } from 'vitest';
import { register as registerWhere } from '../../../../src/methods/dataframe/filtering/where.js';
import { register as registerFilter } from '../../../../src/methods/dataframe/filtering/filter.js';

describe('DataFrame Where and Filter Methods', () => {
  let df;

  // Register methods before each test
  beforeEach(() => {
    // Register where and filter methods
    registerWhere(DataFrame);
    registerFilter(DataFrame);
    // Sample data for testing
    df = new DataFrame({
      id: [1, 2, 3, 4, 5],
      product: ['Laptop', 'Smartphone', 'Tablet', 'Desk', 'Bookshelf'],
      price: [1200, 800, 300, 250, 180],
      stock: [45, 120, null, 15, 22],
      category: [
        'Electronics',
        'Electronics',
        'Electronics',
        'Furniture',
        'Furniture',
      ],
    });
  });

  // Tests for the where method with traditional syntax
  test('should support original where syntax with column, operator, value', () => {
    const result = df.where('price', '>', 500);

    expect(result).toBeInstanceOf(DataFrame);
    expect(result.rowCount).toBe(2);

    const rows = result.toArray();
    expect(rows[0].price).toBe(1200);
    expect(rows[1].price).toBe(800);
  });

  // Tests for the filter method with predicate function
  test('should support filter with predicate function', () => {
    const filtered = df.filter((row) => row.price > 500);

    expect(filtered).toBeInstanceOf(DataFrame);
    expect(filtered.rowCount).toBe(2);

    const rows = filtered.toArray();
    expect(rows[0].price).toBe(1200);
    expect(rows[1].price).toBe(800);
  });

  // Tests for the filter method with string expression
  test('should support filter with string expression', () => {
    const filtered = df.filter('row.price > 500');

    expect(filtered).toBeInstanceOf(DataFrame);
    expect(filtered.rowCount).toBe(2);

    const rows = filtered.toArray();
    expect(rows[0].price).toBe(1200);
    expect(rows[1].price).toBe(800);
  });

  test('should filter with string equality in expression', () => {
    const filtered = df.filter('row.category === "Furniture"');

    expect(filtered).toBeInstanceOf(DataFrame);
    expect(filtered.rowCount).toBe(2);

    const products = filtered.toArray().map((row) => row.product);
    expect(products).toContain('Desk');
    expect(products).toContain('Bookshelf');
  });

  test('should filter with null check in expression', () => {
    const filtered = df.filter('row.stock !== null');

    expect(filtered).toBeInstanceOf(DataFrame);
    expect(filtered.rowCount).toBe(4);

    const products = filtered.toArray().map((row) => row.product);
    expect(products).not.toContain('Tablet');
  });

  test('should support chaining filters with expressions', () => {
    const filtered = df
      .filter('row.price > 100')
      .filter('row.category === "Furniture"')
      .filter('row.stock !== null');

    expect(filtered).toBeInstanceOf(DataFrame);
    expect(filtered.rowCount).toBe(2);

    const products = filtered.toArray().map((row) => row.product);
    expect(products).toContain('Desk');
    expect(products).toContain('Bookshelf');
  });

  test('should support complex expressions in filter', () => {
    const filtered = df.filter(
      'row.price > 100 && row.category === "Furniture" && row.stock !== null',
    );

    expect(filtered).toBeInstanceOf(DataFrame);
    expect(filtered.rowCount).toBe(2);

    const products = filtered.toArray().map((row) => row.product);
    expect(products).toContain('Desk');
    expect(products).toContain('Bookshelf');
  });

  test('should throw error for invalid expressions in filter', () => {
    expect(() => df.filter('row.invalid.nonexistent > 100')).toThrow();
  });

  test('should throw error for syntactically incorrect expressions', () => {
    expect(() => df.filter('row.price >')).toThrow();
  });
});
