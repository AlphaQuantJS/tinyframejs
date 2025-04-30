/**
 * Unit tests for validators.js
 */

import {
  validateColumn,
  validateColumnLengths,
  validateColumnNames,
  validateInputData,
  validateOptions,
  validateDType,
  validateNumericArray,
} from '../../src/core/validators.js';
import { describe, test, expect } from 'vitest';

// Minimal TinyFrame mock for validateColumn
const tinyFrameMock = { columns: { a: [1, 2], b: [3, 4] } };

/**
 * Tests for validator functions
 * These functions validate various aspects of DataFrame operations
 */
describe('validators', () => {
  /**
   * Tests validateColumn function with an existing column
   * Verifies that no error is thrown when column exists
   */
  test('validateColumn: should not throw for existing column', () => {
    expect(() => validateColumn(tinyFrameMock, 'a')).not.toThrow();
  });

  /**
   * Tests validateColumn function with a missing column
   * Verifies that an error is thrown when column doesn't exist
   */
  test('validateColumn: should throw for missing column', () => {
    expect(() => validateColumn(tinyFrameMock, 'x')).toThrow(/not found/);
  });

  /**
   * Tests validateColumnLengths function with equal length columns
   * Verifies that no error is thrown when all columns have the same length
   */
  test('validateColumnLengths: should not throw for equal lengths', () => {
    expect(() => validateColumnLengths({ a: [1, 2], b: [3, 4] })).not.toThrow();
  });

  /**
   * Tests validateColumnLengths function with unequal length columns
   * Verifies that an error is thrown when columns have different lengths
   */
  test('validateColumnLengths: should throw for unequal lengths', () => {
    expect(() => validateColumnLengths({ a: [1, 2], b: [3] })).toThrow(
      /same length/,
    );
  });

  /**
   * Tests validateColumnNames function with valid column names
   * Verifies that no error is thrown when column names are valid
   */
  test('validateColumnNames: should not throw for valid names', () => {
    expect(() => validateColumnNames(['a', 'b', 'col_1'])).not.toThrow();
  });

  /**
   * Tests validateColumnNames function with an empty string
   * Verifies that an error is thrown when a column name is an empty string
   */
  test('validateColumnNames: should throw for empty string', () => {
    expect(() => validateColumnNames(['a', ''])).toThrow(/non-empty/);
  });

  /**
   * Tests validateColumnNames function with duplicate column names
   * Verifies that an error is thrown when there are duplicate column names
   */
  test('validateColumnNames: should throw for duplicate', () => {
    expect(() => validateColumnNames(['a', 'a'])).toThrow(/Duplicate/);
  });

  /**
   * Tests validateInputData function with an array of objects
   * Verifies that no error is thrown when input data is an array of objects
   */
  test('validateInputData: should not throw for array of objects', () => {
    expect(() => validateInputData([{ a: 1 }, { a: 2 }])).not.toThrow();
  });

  /**
   * Tests validateInputData function with an array of non-objects
   * Verifies that an error is thrown when input data is not an array of objects
   */
  test('validateInputData: should throw for array of non-objects', () => {
    expect(() => validateInputData([1, 2, 3])).toThrow(/objects/);
  });

  /**
   * Tests validateInputData function with an object of arrays
   * Verifies that no error is thrown when input data is an object of arrays
   */
  test('validateInputData: should not throw for object of arrays', () => {
    expect(() => validateInputData({ a: [1, 2], b: [3, 4] })).not.toThrow();
  });

  /**
   * Tests validateInputData function with an object with non-arrays
   * Verifies that an error is thrown when input data is an object with non-arrays
   */
  test('validateInputData: should throw for object with non-arrays', () => {
    expect(() => validateInputData({ a: 1, b: 2 })).toThrow(/array/);
  });

  /**
   * Tests validateOptions function with valid options
   * Verifies that no error is thrown when options are valid
   */
  test('validateOptions: should not throw for valid options', () => {
    expect(() => validateOptions({ copy: 'shallow' })).not.toThrow();
  });

  /**
   * Tests validateOptions function with invalid copy option
   * Verifies that an error is thrown when copy option is invalid
   */
  test('validateOptions: should throw for invalid copy option', () => {
    expect(() => validateOptions({ copy: 'invalid' })).toThrow(/Invalid copy/);
  });

  /**
   * Tests validateDType function with a supported dtype
   * Verifies that no error is thrown when dtype is supported
   */
  test('validateDType: should not throw for supported dtype', () => {
    expect(() => validateDType('f64')).not.toThrow();
    expect(() => validateDType('str')).not.toThrow();
  });

  /**
   * Tests validateDType function with an unsupported dtype
   * Verifies that an error is thrown when dtype is not supported
   */
  test('validateDType: should throw for unsupported dtype', () => {
    expect(() => validateDType('foo')).toThrow(/Unsupported dtype/);
  });

  /**
   * Tests validateNumericArray function with a numeric array
   * Verifies that no error is thrown when array is numeric
   */
  test('validateNumericArray: should not throw for numeric array', () => {
    expect(() => validateNumericArray([1, 2, 3])).not.toThrow();
  });

  /**
   * Tests validateNumericArray function with a non-numeric array
   * Verifies that an error is thrown when array contains non-numeric values
   */
  test('validateNumericArray: should throw for non-numeric values', () => {
    expect(() => validateNumericArray([1, 'a', 3])).toThrow(/non-numeric/);
  });
});
