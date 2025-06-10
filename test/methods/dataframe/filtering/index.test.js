/**
 * Unit tests for filtering methods index
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import * as filteringMethods from '../../../../src/methods/dataframe/filtering/index.js';
import registerDataFrameFiltering from '../../../../src/methods/dataframe/filtering/register.js';

// Test data for use in all tests
const testData = [
  { value: 10, category: 'A', mixed: '20' },
  { value: 20, category: 'B', mixed: 30 },
  { value: 30, category: 'A', mixed: null },
  { value: 40, category: 'C', mixed: undefined },
  { value: 50, category: 'B', mixed: NaN },
];

describe('Filtering Methods Index', () => {
  // Регистрируем методы фильтрации для DataFrame
  registerDataFrameFiltering(DataFrame);

  describe('with standard storage', () => {
    // Create DataFrame using fromRows
    const df = DataFrame.fromRows(testData);

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
});
