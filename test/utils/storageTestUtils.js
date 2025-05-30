/**
 * Utilities for testing with different storage types (TypedArray and Arrow)
 */

import { VectorFactory } from '../../src/core/storage/VectorFactory.js';

/**
 * Runs tests with both storage types (TypedArray and Arrow)
 *
 * @param {Function} testFn - Test function that accepts storage type ('TypedArray' or 'Arrow')
 */
export function testWithBothStorageTypes(testFn) {
  // Save the original shouldUseArrow function
  const originalShouldUseArrow = VectorFactory.shouldUseArrow;

  try {
    // Test with TypedArray
    VectorFactory.shouldUseArrow = () => false;
    testFn('TypedArray');

    // Test with Arrow
    VectorFactory.shouldUseArrow = () => true;
    testFn('Arrow');
  } finally {
    // Restore the original function
    VectorFactory.shouldUseArrow = originalShouldUseArrow;
  }
}

/**
 * Creates DataFrame with the specified storage type
 *
 * @param {Function} DataFrameClass - DataFrame class
 * @param {Object|Array} data - Data for creating DataFrame
 * @param {string} storageType - Storage type ('TypedArray' or 'Arrow')
 * @returns {DataFrame} - Created DataFrame with the specified storage type
 */
export function createDataFrameWithStorage(DataFrameClass, data, storageType) {
  // Напрямую регистрируем методы фильтрации для тестов
  try {
    // Импортируем регистратор методов фильтрации
    const {
      registerDataFrameFiltering,
    } = require('../../src/methods/dataframe/filtering/register.js');
    registerDataFrameFiltering(DataFrameClass);
  } catch (e) {
    console.warn('Warning: Error registering filtering methods:', e.message);
  }

  // Save the original shouldUseArrow function
  const originalShouldUseArrow = VectorFactory.shouldUseArrow;

  try {
    // Set the shouldUseArrow function based on the storage type
    VectorFactory.shouldUseArrow = () => storageType === 'Arrow';

    // Convert data to a format suitable for DataFrame
    let columns = {};

    if (Array.isArray(data)) {
      // If data is presented as an array of objects
      if (data.length > 0) {
        // Get a list of all keys from the first object
        const keys = Object.keys(data[0]);

        // Create columns for each key
        for (const key of keys) {
          columns[key] = data.map((row) => row[key]);
        }
      }
    } else if (typeof data === 'object') {
      // If data is already presented as columns
      columns = data;
    }

    // Create DataFrame
    const df = new DataFrameClass(columns);

    // В новом коре frame это геттер, не нужно устанавливать его вручную
    // Просто возвращаем DataFrame
    return df;
  } finally {
    // Restore the original function
    VectorFactory.shouldUseArrow = originalShouldUseArrow;
  }
}
