/**
 * Unit tests for filtering methods index
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../src/core/DataFrame.js';
import * as filteringMethods from '../../../src/methods/filtering/index.js';

describe('Filtering Methods Index', () => {
  test('should export all filtering methods', () => {
    // Check that all expected methods are exported
    expect(filteringMethods).toHaveProperty('select');
    expect(filteringMethods).toHaveProperty('drop');
    expect(filteringMethods).toHaveProperty('selectByPattern');
    expect(filteringMethods).toHaveProperty('filter');
    expect(filteringMethods).toHaveProperty('query');
    expect(filteringMethods).toHaveProperty('where');
    expect(filteringMethods).toHaveProperty('at');
    expect(filteringMethods).toHaveProperty('iloc');
    expect(filteringMethods).toHaveProperty('loc');
    expect(filteringMethods).toHaveProperty('sample');
    expect(filteringMethods).toHaveProperty('stratifiedSample');
  });

  test('should successfully extend DataFrame with filtering methods', () => {
    // Create a sample DataFrame
    const df = DataFrame.create({
      name: ['Alice', 'Bob', 'Charlie'],
      age: [25, 30, 35],
    });

    // Check that all filtering methods are available on the DataFrame instance
    expect(typeof df.select).toBe('function');
    expect(typeof df.drop).toBe('function');
    expect(typeof df.selectByPattern).toBe('function');
    expect(typeof df.filter).toBe('function');
    expect(typeof df.query).toBe('function');
    expect(typeof df.where).toBe('function');
    expect(typeof df.at).toBe('function');
    expect(typeof df.iloc).toBe('function');
    expect(typeof df.loc).toBe('function');
    expect(typeof df.sample).toBe('function');
    expect(typeof df.stratifiedSample).toBe('function');
  });
});
