import { describe, expect, test } from 'vitest';
import {
  validateRollingOptions,
  applyRollingWindow,
  validateExpandingOptions,
  applyExpandingWindow,
} from '../../../../src/methods/timeseries/alltypes/rollingCore.js';

describe('validateRollingOptions', () => {
  test('should validate valid options', () => {
    const options = {
      window: 3,
      aggregation: (values) =>
        values.reduce((sum, v) => sum + v, 0) / values.length,
    };

    const validated = validateRollingOptions(options);

    expect(validated.window).toBe(3);
    expect(typeof validated.aggregation).toBe('function');
    expect(validated.minPeriods).toBe(3); // Default to window size
  });

  test('should validate options with custom minPeriods', () => {
    const options = {
      window: 5,
      aggregation: (values) =>
        values.reduce((sum, v) => sum + v, 0) / values.length,
      minPeriods: 2,
    };

    const validated = validateRollingOptions(options);

    expect(validated.window).toBe(5);
    expect(typeof validated.aggregation).toBe('function');
    expect(validated.minPeriods).toBe(2);
  });

  test('should throw error for missing options', () => {
    expect(() => validateRollingOptions()).toThrow('options must be provided');
  });

  test('should throw error for invalid window', () => {
    const options = {
      window: -1,
      aggregation: (values) =>
        values.reduce((sum, v) => sum + v, 0) / values.length,
    };

    expect(() => validateRollingOptions(options)).toThrow(
      'window must be a positive number',
    );
  });

  test('should throw error for missing window', () => {
    const options = {
      aggregation: (values) =>
        values.reduce((sum, v) => sum + v, 0) / values.length,
    };

    expect(() => validateRollingOptions(options)).toThrow(
      'window must be a positive number',
    );
  });

  test('should throw error for invalid aggregation', () => {
    const options = {
      window: 3,
      aggregation: 'not a function',
    };

    expect(() => validateRollingOptions(options)).toThrow(
      'aggregation must be a function',
    );
  });

  test('should throw error for missing aggregation', () => {
    const options = {
      window: 3,
    };

    expect(() => validateRollingOptions(options)).toThrow(
      'aggregation must be a function',
    );
  });

  test('should throw error for invalid minPeriods', () => {
    const options = {
      window: 3,
      aggregation: (values) =>
        values.reduce((sum, v) => sum + v, 0) / values.length,
      minPeriods: -1,
    };

    expect(() => validateRollingOptions(options)).toThrow(
      'minPeriods must be a positive number',
    );
  });
});

describe('applyRollingWindow', () => {
  test('should apply rolling window with mean aggregation', () => {
    const values = [1, 2, 3, 4, 5];

    const options = {
      window: 3,
      aggregation: (values) =>
        values.reduce((sum, v) => sum + v, 0) / values.length,
    };

    const result = applyRollingWindow(values, options);

    expect(result.length).toBe(values.length);
    expect(result[0]).toBeNull(); // Not enough values for window
    expect(result[1]).toBeNull(); // Not enough values for window
    expect(result[2]).toBeCloseTo((1 + 2 + 3) / 3); // First complete window
    expect(result[3]).toBeCloseTo((2 + 3 + 4) / 3);
    expect(result[4]).toBeCloseTo((3 + 4 + 5) / 3);
  });

  test('should apply rolling window with custom minPeriods', () => {
    const values = [1, 2, 3, 4, 5];

    const options = {
      window: 3,
      aggregation: (values) =>
        values.reduce((sum, v) => sum + v, 0) / values.length,
      minPeriods: 2,
    };

    const result = applyRollingWindow(values, options);

    expect(result.length).toBe(values.length);
    expect(result[0]).toBeNull(); // Not enough values for minPeriods
    expect(result[1]).toBeCloseTo((1 + 2) / 2); // Enough for minPeriods
    expect(result[2]).toBeCloseTo((1 + 2 + 3) / 3);
    expect(result[3]).toBeCloseTo((2 + 3 + 4) / 3);
    expect(result[4]).toBeCloseTo((3 + 4 + 5) / 3);
  });

  test('should handle null and NaN values', () => {
    const values = [1, null, NaN, 4, 5];

    const options = {
      window: 3,
      minPeriods: 1,
      aggregation: (arr) => arr.reduce((a, b) => a + b, 0) / arr.length,
    };

    const result = applyRollingWindow(values, options);

    expect(result.length).toBe(values.length);
    expect(result[0]).toBeCloseTo(1); // Only one valid value
    expect(result[1]).toBeCloseTo(1); // Only one valid value
    expect(result[2]).toBeCloseTo(1); // Only one valid value
    expect(result[3]).toBeCloseTo(4); // Only one valid value in window (4)
    expect(result[4]).toBeCloseTo((4 + 5) / 2); // Two valid values (4, 5)
  });

  test('should handle aggregation errors', () => {
    const values = [1, 2, 3, 4, 5];

    const options = {
      window: 3,
      aggregation: () => {
        throw new Error('Aggregation error');
      },
      minPeriods: 1,
    };

    const result = applyRollingWindow(values, options);

    // All results should be null due to aggregation errors
    expect(result.every((v) => v === null)).toBe(true);
  });
});

describe('validateExpandingOptions', () => {
  test('should validate valid options', () => {
    const options = {
      aggregation: (values) =>
        values.reduce((sum, v) => sum + v, 0) / values.length,
    };

    const validated = validateExpandingOptions(options);

    expect(typeof validated.aggregation).toBe('function');
    expect(validated.minPeriods).toBe(1); // Default
  });

  test('should validate options with custom minPeriods', () => {
    const options = {
      aggregation: (values) =>
        values.reduce((sum, v) => sum + v, 0) / values.length,
      minPeriods: 3,
    };

    const validated = validateExpandingOptions(options);

    expect(typeof validated.aggregation).toBe('function');
    expect(validated.minPeriods).toBe(3);
  });

  test('should throw error for missing options', () => {
    expect(() => validateExpandingOptions()).toThrow(
      'options must be provided',
    );
  });

  test('should throw error for invalid aggregation', () => {
    const options = {
      aggregation: 'not a function',
    };

    expect(() => validateExpandingOptions(options)).toThrow(
      'aggregation must be a function',
    );
  });

  test('should throw error for missing aggregation', () => {
    const options = {
      minPeriods: 3,
    };

    expect(() => validateExpandingOptions(options)).toThrow(
      'aggregation must be a function',
    );
  });

  test('should throw error for invalid minPeriods', () => {
    const options = {
      aggregation: (values) =>
        values.reduce((sum, v) => sum + v, 0) / values.length,
      minPeriods: -1,
    };

    expect(() => validateExpandingOptions(options)).toThrow(
      'minPeriods must be a positive number',
    );
  });
});

describe('applyExpandingWindow', () => {
  test('should apply expanding window with mean aggregation', () => {
    const values = [1, 2, 3, 4, 5];

    const options = {
      aggregation: (values) =>
        values.reduce((sum, v) => sum + v, 0) / values.length,
    };

    const result = applyExpandingWindow(values, options);

    expect(result.length).toBe(values.length);
    expect(result[0]).toBeCloseTo(1); // Just the first value
    expect(result[1]).toBeCloseTo((1 + 2) / 2); // First two values
    expect(result[2]).toBeCloseTo((1 + 2 + 3) / 3); // First three values
    expect(result[3]).toBeCloseTo((1 + 2 + 3 + 4) / 4); // First four values
    expect(result[4]).toBeCloseTo((1 + 2 + 3 + 4 + 5) / 5); // All values
  });

  test('should apply expanding window with custom minPeriods', () => {
    const values = [1, 2, 3, 4, 5];

    const options = {
      aggregation: (values) =>
        values.reduce((sum, v) => sum + v, 0) / values.length,
      minPeriods: 3,
    };

    const result = applyExpandingWindow(values, options);

    expect(result.length).toBe(values.length);
    expect(result[0]).toBeNull(); // Not enough values for minPeriods
    expect(result[1]).toBeNull(); // Not enough values for minPeriods
    expect(result[2]).toBeCloseTo((1 + 2 + 3) / 3); // First three values (enough for minPeriods)
    expect(result[3]).toBeCloseTo((1 + 2 + 3 + 4) / 4); // First four values
    expect(result[4]).toBeCloseTo((1 + 2 + 3 + 4 + 5) / 5); // All values
  });

  test('should handle null and NaN values', () => {
    const values = [1, null, NaN, 4, 5];

    const options = {
      aggregation: (values) =>
        values.reduce((sum, v) => sum + v, 0) / values.length,
      minPeriods: 1,
    };

    const result = applyExpandingWindow(values, options);

    expect(result.length).toBe(values.length);
    expect(result[0]).toBeCloseTo(1); // Only one valid value
    expect(result[1]).toBeCloseTo(1); // Only one valid value
    expect(result[2]).toBeCloseTo(1); // Only one valid value
    expect(result[3]).toBeCloseTo((1 + 4) / 2); // Two valid values
    expect(result[4]).toBeCloseTo((1 + 4 + 5) / 3); // Three valid values
  });

  test('should handle aggregation errors', () => {
    const values = [1, 2, 3, 4, 5];

    const options = {
      aggregation: () => {
        throw new Error('Aggregation error');
      },
    };

    const result = applyExpandingWindow(values, options);

    // All results should be null due to aggregation errors
    expect(result.every((v) => v === null)).toBe(true);
  });
});
