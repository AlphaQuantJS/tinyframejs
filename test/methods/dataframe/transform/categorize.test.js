import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import { categorize } from '../../../../src/methods/dataframe/transform/categorize.js';
import { validateColumn } from '../../../src/core/validators.js';

import {
  testWithBothStorageTypes,
  createDataFrameWithStorage,
} from '../../../utils/storageTestUtils.js';

// Test data to be used in all tests
const testData = [
  { value: 10, category: 'A', mixed: '20' },
  { value: 20, category: 'B', mixed: 30 },
  { value: 30, category: 'A', mixed: null },
  { value: 40, category: 'C', mixed: undefined },
  { value: 50, category: 'B', mixed: NaN },
];

describe('DataFrame.categorize', () => {
  // Run tests with both storage types
  testWithBothStorageTypes((storageType) => {
    describe(`with ${storageType} storage`, () => {
      // Create DataFrame with specified storage type
      const df = createDataFrameWithStorage(DataFrame, testData, storageType);

      // Create a test DataFrame
      // df created above with createDataFrameWithStorage

      // Create categorize function with dependency injection
      const categorizeWithDeps = categorize({ validateColumn });

      test('creates a categorical column based on a numeric column', () => {
        // Call the function directly with TinyFrame
        const resultFrame = categorizeWithDeps(df.frame, 'age', {
          bins: [0, 30, 50, 100],
          labels: ['Young', 'Middle', 'Senior'],
        });

        // Wrap the result in DataFrame for testing
        const result = new DataFrame(resultFrame);

        // Check that the result is a DataFrame instance
        expect(result).toBeInstanceOf(DataFrame);

        // Check that the original DataFrame hasn't changed
        expect(df.frame.columns).not.toHaveProperty('age_category');

        // Check that the new column has been added
        expect(result.frame.columns).toHaveProperty('age_category');

        // Check the values of the new column
        expect(result.frame.columns.age_category).toEqual([
          'Young',
          'Young',
          'Middle',
          'Middle',
          'Senior',
          'Senior',
        ]);
      });

      test('uses custom name for new column', () => {
        // Call the function directly with TinyFrame
        const resultFrame = categorizeWithDeps(df.frame, 'age', {
          bins: [0, 30, 50, 100],
          labels: ['Young', 'Middle', 'Senior'],
          columnName: 'age_group',
        });

        // Wrap the result in DataFrame for testing
        const result = new DataFrame(resultFrame);

        // Check that the new column has been added with the specified name
        expect(result.frame.columns).toHaveProperty('age_group');

        // Check the values of the new column
        expect(result.frame.columns.age_group).toEqual([
          'Young',
          'Young',
          'Middle',
          'Middle',
          'Senior',
          'Senior',
        ]);
      });

      test('correctly handles boundary values', () => {
        // Create a DataFrame with boundary values
        const dfBoundary = DataFrame.create({
          value: [0, 30, 50, 100],
        });

        // Call the function directly with TinyFrame
        const resultFrame = categorizeWithDeps(dfBoundary.frame, 'value', {
          bins: [0, 30, 50, 100],
          labels: ['Low', 'Medium', 'High'],
        });

        // Wrap the result in DataFrame for testing
        const result = new DataFrame(resultFrame);

        // Check the values of the new column
        // Values on the boundaries fall into the left interval (except the last one)
        expect(result.frame.columns.value_category).toEqual([
          'Low',
          null,
          null,
          null,
        ]);
      });

      test('handles null, undefined and NaN', () => {
        // Create a DataFrame with null, undefined and NaN values
        const dfWithNulls = DataFrame.create({
          value: [10, null, 40, undefined, NaN, 60],
        });

        // Call the function directly with TinyFrame
        const resultFrame = categorizeWithDeps(dfWithNulls.frame, 'value', {
          bins: [0, 30, 50, 100],
          labels: ['Low', 'Medium', 'High'],
        });

        // Wrap the result in DataFrame for testing
        const result = new DataFrame(resultFrame);

        // Check the values of the new column
        expect(result.frame.columns.value_category).toEqual([
          'Low',
          null,
          'Medium',
          null,
          null,
          'High',
        ]);
      });

      test('throws error with invalid arguments', () => {
        // Check that the function throws an error if bins is not an array or has less than 2 elements
        expect(() =>
          categorizeWithDeps(df.frame, 'age', {
            bins: null,
            labels: ['A', 'B'],
          }),
        ).toThrow();
        expect(() =>
          categorizeWithDeps(df.frame, 'age', { bins: [30], labels: [] }),
        ).toThrow();

        // Check that the function throws an error if labels is not an array
        expect(() =>
          categorizeWithDeps(df.frame, 'age', {
            bins: [0, 30, 100],
            labels: 'not an array',
          }),
        ).toThrow();

        // Check that the function throws an error if the number of labels does not match the number of intervals
        expect(() =>
          categorizeWithDeps(df.frame, 'age', {
            bins: [0, 30, 100],
            labels: ['A'],
          }),
        ).toThrow();
        expect(() =>
          categorizeWithDeps(df.frame, 'age', {
            bins: [0, 30, 100],
            labels: ['A', 'B', 'C'],
          }),
        ).toThrow();

        // Check that the function throws an error if the column does not exist
        expect(() =>
          categorizeWithDeps(df.frame, 'nonexistent', {
            bins: [0, 30, 100],
            labels: ['A', 'B'],
          }),
        ).toThrow();
      });
    });
  });
});
