/**
 * Unit tests for Number Parser
 */

import { describe, test, expect } from 'vitest';
import {
  parseNumber,
  formatNumber,
} from '../../../src/io/parsers/numberParser.js';

describe('Number Parser', () => {
  /**
   * Tests parsing simple numeric strings
   */
  test('should parse simple numeric strings correctly', () => {
    expect(parseNumber('123')).toBe(123);
    expect(parseNumber('123.45')).toBe(123.45);
    expect(parseNumber('-123.45')).toBe(-123.45);
    expect(parseNumber('0')).toBe(0);
    expect(parseNumber('-0')).toBe(0);
  });

  /**
   * Tests parsing numeric strings with thousands separators
   */
  test('should parse numeric strings with thousands separators', () => {
    expect(parseNumber('1,234')).toBe(1234);
    expect(parseNumber('1,234,567')).toBe(1234567);
    expect(parseNumber('1,234.56')).toBe(1234.56);
    expect(parseNumber('-1,234,567.89')).toBe(-1234567.89);
  });

  /**
   * Tests parsing numeric strings with custom decimal separator
   */
  test('should parse numeric strings with custom decimal separator', () => {
    expect(parseNumber('123,45', { decimalSeparator: ',' })).toBe(123.45);
    expect(
      parseNumber('1.234,56', {
        decimalSeparator: ',',
        thousandsSeparator: '.',
      }),
    ).toBe(1234.56);
    expect(
      parseNumber('-1.234.567,89', {
        decimalSeparator: ',',
        thousandsSeparator: '.',
      }),
    ).toBe(-1234567.89);
  });

  /**
   * Tests parsing percentage values
   */
  test('should parse percentage values correctly', () => {
    expect(parseNumber('50%')).toBe(0.5);
    expect(parseNumber('100%')).toBe(1);
    expect(parseNumber('12.5%')).toBe(0.125);
    expect(parseNumber('-25%')).toBe(-0.25);
  });

  /**
   * Tests disabling percentage parsing
   */
  test('should not parse percentages when disabled', () => {
    expect(parseNumber('50%', { parsePercent: false })).toBe(50);
    expect(parseNumber('12.5%', { parsePercent: false })).toBe(12.5);
  });

  /**
   * Tests handling of invalid numeric strings
   */
  test('should return NaN for invalid numeric strings', () => {
    expect(parseNumber('not-a-number')).toBeNaN();
    expect(parseNumber('123abc')).toBeNaN();
    expect(parseNumber('--123')).toBeNaN();
    expect(parseNumber('123..45')).toBeNaN();
  });

  /**
   * Tests handling of null or empty input
   */
  test('should handle null or empty input', () => {
    expect(parseNumber(null)).toBeNaN();
    expect(parseNumber('')).toBeNaN();
    expect(parseNumber(undefined)).toBeNaN();
    expect(parseNumber('   ')).toBeNaN();
  });

  /**
   * Tests handling of number objects as input
   */
  test('should return the same number if provided as input', () => {
    expect(parseNumber(123)).toBe(123);
    expect(parseNumber(123.45)).toBe(123.45);
    expect(parseNumber(-123.45)).toBe(-123.45);
    expect(parseNumber(0)).toBe(0);
  });

  /**
   * Tests formatting numbers with default options
   */
  test('should format numbers with default options', () => {
    expect(formatNumber(1234.56)).toBe('1,234.56');
    expect(formatNumber(-1234.56)).toBe('-1,234.56');
    expect(formatNumber(0)).toBe('0.00');
  });

  /**
   * Tests formatting numbers with custom decimal separator
   */
  test('should format numbers with custom decimal separator', () => {
    expect(formatNumber(1234.56, { decimalSeparator: ',' })).toBe('1,234,56');
    expect(
      formatNumber(1234.56, {
        decimalSeparator: ',',
        thousandsSeparator: '.',
      }),
    ).toBe('1.234,56');
  });

  /**
   * Tests formatting numbers with custom precision
   */
  test('should format numbers with custom precision', () => {
    expect(formatNumber(1234.56789, { precision: 4 })).toBe('1,234.5679');
    expect(formatNumber(1234.5, { precision: 0 })).toBe('1,235');
    expect(formatNumber(1234, { precision: 3 })).toBe('1,234.000');
  });

  /**
   * Tests formatting numbers as percentages
   */
  test('should format numbers as percentages', () => {
    expect(formatNumber(0.5, { showPercent: true })).toBe('50.00%');
    expect(formatNumber(1, { showPercent: true })).toBe('100.00%');
    expect(formatNumber(0.125, { showPercent: true })).toBe('12.50%');
    expect(formatNumber(-0.25, { showPercent: true })).toBe('-25.00%');
  });

  /**
   * Tests handling of invalid numbers in formatting
   */
  test('should handle invalid numbers in formatting', () => {
    expect(formatNumber(NaN)).toBe('');
    expect(formatNumber(null)).toBe('');
    expect(formatNumber(undefined)).toBe('');
    expect(formatNumber('not-a-number')).toBe('');
  });

  /**
   * Tests formatting very large numbers
   */
  test('should format very large numbers correctly', () => {
    expect(formatNumber(1234567890.12)).toBe('1,234,567,890.12');
    expect(
      formatNumber(1234567890.12, {
        thousandsSeparator: ' ',
      }),
    ).toBe('1 234 567 890.12');
  });
});
