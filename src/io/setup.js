// src/io/setup.js

/**
 * Setup module for adding I/O capabilities to DataFrame
 * This follows a functional approach to extend DataFrame with various I/O methods
 */

import {
  addCsvBatchMethods,
  addTsvBatchMethods,
  addExcelBatchMethods,
  addJsonBatchMethods,
  addSqlBatchMethods,
} from './readers/index.js';

/**
 * Adds all I/O methods to DataFrame class
 *
 * @param {Function} DataFrameClass - The DataFrame class to extend
 * @returns {Function} The extended DataFrame class
 */
export function setupDataFrameIO(DataFrameClass) {
  // Add all batch methods to DataFrame
  DataFrameClass = addCsvBatchMethods(DataFrameClass);
  DataFrameClass = addTsvBatchMethods(DataFrameClass);
  DataFrameClass = addExcelBatchMethods(DataFrameClass);
  DataFrameClass = addJsonBatchMethods(DataFrameClass);
  DataFrameClass = addSqlBatchMethods(DataFrameClass);

  return DataFrameClass;
}
