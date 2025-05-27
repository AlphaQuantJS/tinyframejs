/**
 * Unit tests for optimizer.js
 */

import { optimize } from '../../../src/core/lazy/optimizer.js';
import { describe, test, expect } from 'vitest';

/**
 * Tests for the optimizer function
 * Verifies optimization of LazyFrame execution plans
 */
describe('optimizer', () => {
  /**
   * Tests handling of short plans
   */
  test('should return plan unchanged if too short', () => {
    const shortPlan = [{ op: 'source', df: {} }];
    expect(optimize(shortPlan)).toBe(shortPlan);

    const shortPlan2 = [
      { op: 'source', df: {} },
      { op: 'filter', fn: () => true },
    ];
    expect(optimize(shortPlan2)).toBe(shortPlan2);
  });

  /**
   * Tests merging consecutive filter operations
   */
  test('should merge consecutive filter operations', () => {
    const plan = [
      { op: 'source', df: {} },
      { op: 'filter', fn: (x) => x.a > 5 },
      { op: 'filter', fn: (x) => x.b < 10 },
    ];

    const optimized = optimize(plan);

    expect(optimized.length).toBe(2);
    expect(optimized[0].op).toBe('source');
    expect(optimized[1].op).toBe('filter');

    // Test that the merged filter function works correctly
    const testRow = { a: 6, b: 8 };
    expect(optimized[1].fn(testRow)).toBe(true);

    const testRow2 = { a: 4, b: 8 };
    expect(optimized[1].fn(testRow2)).toBe(false);

    const testRow3 = { a: 6, b: 12 };
    expect(optimized[1].fn(testRow3)).toBe(false);
  });

  /**
   * Tests pushing select above filter
   */
  test('should push select above filter', () => {
    const plan = [
      { op: 'source', df: {} },
      { op: 'filter', fn: (x) => x.a > 5 },
      { op: 'select', cols: ['a', 'b'] },
    ];

    const optimized = optimize(plan);

    expect(optimized.length).toBe(3);
    expect(optimized[0].op).toBe('source');
    expect(optimized[1].op).toBe('select');
    expect(optimized[2].op).toBe('filter');
  });

  /**
   * Tests handling of complex plans
   */
  test('should optimize complex plans', () => {
    const plan = [
      { op: 'source', df: {} },
      { op: 'filter', fn: (x) => x.a > 5 },
      { op: 'filter', fn: (x) => x.b < 10 },
      { op: 'select', cols: ['a', 'b'] },
      { op: 'head', n: 5 },
    ];

    const optimized = optimize(plan);

    expect(optimized.length).toBe(4);
    expect(optimized[0].op).toBe('source');
    expect(optimized[1].op).toBe('select');
    expect(optimized[2].op).toBe('filter');
    expect(optimized[3].op).toBe('head');
  });

  /**
   * Tests handling of unsupported operations
   */
  test('should pass through unsupported operations', () => {
    const plan = [
      { op: 'source', df: {} },
      { op: 'filter', fn: (x) => x.a > 5 },
      { op: 'custom', customFn: () => {} },
      { op: 'head', n: 5 },
    ];

    const optimized = optimize(plan);

    expect(optimized.length).toBe(4);
    expect(optimized[0].op).toBe('source');
    expect(optimized[1].op).toBe('filter');
    expect(optimized[2].op).toBe('custom');
    expect(optimized[3].op).toBe('head');
  });
});
