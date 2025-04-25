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
} from '../../src/primitives/validators.js';
import { describe, test, expect } from 'vitest';

// Minimal TinyFrame mock for validateColumn
const tinyFrameMock = { columns: { a: [1, 2], b: [3, 4] } };

describe('validators', () => {
  test('validateColumn: should not throw for existing column', () => {
    expect(() => validateColumn(tinyFrameMock, 'a')).not.toThrow();
  });
  test('validateColumn: should throw for missing column', () => {
    expect(() => validateColumn(tinyFrameMock, 'x')).toThrow(/not found/);
  });

  test('validateColumnLengths: should not throw for equal lengths', () => {
    expect(() => validateColumnLengths({ a: [1, 2], b: [3, 4] })).not.toThrow();
  });
  test('validateColumnLengths: should throw for unequal lengths', () => {
    expect(() => validateColumnLengths({ a: [1, 2], b: [3] })).toThrow(
      /same length/,
    );
  });

  test('validateColumnNames: should not throw for valid names', () => {
    expect(() => validateColumnNames(['a', 'b', 'col_1'])).not.toThrow();
  });
  test('validateColumnNames: should throw for empty string', () => {
    expect(() => validateColumnNames(['a', ''])).toThrow(/non-empty/);
  });
  test('validateColumnNames: should throw for duplicate', () => {
    expect(() => validateColumnNames(['a', 'a'])).toThrow(/Duplicate/);
  });

  test('validateInputData: should not throw for array of objects', () => {
    expect(() => validateInputData([{ a: 1 }, { a: 2 }])).not.toThrow();
  });
  test('validateInputData: should throw for array of non-objects', () => {
    expect(() => validateInputData([1, 2, 3])).toThrow(/objects/);
  });
  test('validateInputData: should not throw for object of arrays', () => {
    expect(() => validateInputData({ a: [1, 2], b: [3, 4] })).not.toThrow();
  });
  test('validateInputData: should throw for object with non-arrays', () => {
    expect(() => validateInputData({ a: 1, b: 2 })).toThrow(/array/);
  });

  test('validateOptions: should not throw for valid options', () => {
    expect(() => validateOptions({ copy: 'shallow' })).not.toThrow();
  });
  test('validateOptions: should throw for invalid copy option', () => {
    expect(() => validateOptions({ copy: 'invalid' })).toThrow(/Invalid copy/);
  });

  test('validateDType: should not throw for supported dtype', () => {
    expect(() => validateDType('f64')).not.toThrow();
    expect(() => validateDType('str')).not.toThrow();
  });
  test('validateDType: should throw for unsupported dtype', () => {
    expect(() => validateDType('foo')).toThrow(/Unsupported dtype/);
  });

  test('validateNumericArray: should not throw for numeric array', () => {
    expect(() => validateNumericArray([1, 2, 3])).not.toThrow();
  });
  test('validateNumericArray: should throw for non-numeric values', () => {
    expect(() => validateNumericArray([1, 'a', 3])).toThrow(/non-numeric/);
  });
});
