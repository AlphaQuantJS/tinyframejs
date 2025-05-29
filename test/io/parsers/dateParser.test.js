/**
 * Unit tests for Date Parser
 */

import { describe, test, expect } from 'vitest';
import { parseDate, formatDate } from '../../../src/io/parsers/dateParser.js';

describe('Date Parser', () => {
  /**
   * Tests parsing date strings in ISO format (YYYY-MM-DD)
   */
  test('should parse ISO format dates correctly', () => {
    const date = parseDate('2023-05-15');
    expect(date).toBeInstanceOf(Date);
    expect(date.getFullYear()).toBe(2023);
    expect(date.getMonth()).toBe(4); // May is 4 (zero-based)
    expect(date.getDate()).toBe(15);
  });

  /**
   * Tests parsing date strings in DD.MM.YYYY format
   */
  test('should parse DD.MM.YYYY format dates correctly', () => {
    const date = parseDate('15.05.2023');
    expect(date).toBeInstanceOf(Date);
    expect(date.getFullYear()).toBe(2023);
    expect(date.getMonth()).toBe(4); // May is 4 (zero-based)
    expect(date.getDate()).toBe(15);
  });

  /**
   * Tests parsing date strings in MM/DD/YYYY format
   */
  test('should parse MM/DD/YYYY format dates correctly', () => {
    const date = parseDate('05/15/2023');
    expect(date).toBeInstanceOf(Date);
    expect(date.getFullYear()).toBe(2023);
    expect(date.getMonth()).toBe(4); // May is 4 (zero-based)
    expect(date.getDate()).toBe(15);
  });

  /**
   * Tests parsing standard JavaScript Date strings
   */
  test('should parse standard JavaScript Date strings', () => {
    const date = parseDate('2023-05-15T12:30:45.000Z');
    expect(date).toBeInstanceOf(Date);
    expect(date.getUTCFullYear()).toBe(2023);
    expect(date.getUTCMonth()).toBe(4); // May is 4 (zero-based)
    expect(date.getUTCDate()).toBe(15);
    expect(date.getUTCHours()).toBe(12);
    expect(date.getUTCMinutes()).toBe(30);
    expect(date.getUTCSeconds()).toBe(45);
  });

  /**
   * Tests handling of invalid date strings
   */
  test('should return null for invalid date strings', () => {
    expect(parseDate('not-a-date')).toBeNull();
    expect(parseDate('2023/13/45')).toBeNull();
    expect(parseDate('32.05.2023')).toBeNull();
  });

  /**
   * Tests handling of null or empty input
   */
  test('should handle null or empty input', () => {
    expect(parseDate(null)).toBeNull();
    expect(parseDate('')).toBeNull();
    expect(parseDate(undefined)).toBeNull();
  });

  /**
   * Tests handling of Date objects as input
   */
  test('should return the same Date object if provided as input', () => {
    const originalDate = new Date(2023, 4, 15);
    const parsedDate = parseDate(originalDate);
    expect(parsedDate).toBe(originalDate);
  });

  /**
   * Tests formatting dates in YYYY-MM-DD format
   */
  test('should format dates in YYYY-MM-DD format by default', () => {
    const date = new Date(2023, 4, 15); // May 15, 2023
    const formatted = formatDate(date);
    expect(formatted).toBe('2023-05-15');
  });

  /**
   * Tests formatting dates with custom format
   */
  test('should format dates with custom format', () => {
    const date = new Date(2023, 4, 15, 12, 30, 45); // May 15, 2023, 12:30:45
    expect(formatDate(date, 'DD.MM.YYYY')).toBe('15.05.2023');
    expect(formatDate(date, 'MM/DD/YYYY')).toBe('05/15/2023');
    expect(formatDate(date, 'YYYY-MM-DD HH:mm:ss')).toBe('2023-05-15 12:30:45');
  });

  /**
   * Tests handling of invalid dates in formatting
   */
  test('should handle invalid dates in formatting', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
    expect(formatDate('not-a-date')).toBe('');
    expect(formatDate(new Date('invalid'))).toBe('');
  });

  /**
   * Tests padding of single-digit values in formatting
   */
  test('should pad single-digit values in formatting', () => {
    const date = new Date(2023, 0, 5, 9, 5, 7); // January 5, 2023, 09:05:07
    expect(formatDate(date)).toBe('2023-01-05');
    expect(formatDate(date, 'YYYY-MM-DD HH:mm:ss')).toBe('2023-01-05 09:05:07');
  });
});
