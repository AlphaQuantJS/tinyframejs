/**
 * Unit tests for LazyNode.js
 */

import { LazyNode } from '../../../src/core/lazy/LazyNode.js';
import { describe, test, expect } from 'vitest';

/**
 * Tests for the LazyNode class
 * Verifies node creation and properties
 */
describe('LazyNode', () => {
  /**
   * Tests creating a node with operation type
   */
  test('should create a node with operation type', () => {
    const node = new LazyNode('filter');

    expect(node).toBeDefined();
    expect(node.op).toBe('filter');
    expect(node.args).toEqual({});
  });

  /**
   * Tests creating a node with payload
   */
  test('should create a node with payload', () => {
    const payload = { fn: (x) => x > 5 };
    const node = new LazyNode('filter', payload);

    expect(node.op).toBe('filter');
    expect(node.args).toEqual(payload);
    expect(node.args.fn).toBeDefined();
  });

  /**
   * Tests creating a node with different operation types
   */
  test('should support different operation types', () => {
    const filterNode = new LazyNode('filter', { fn: (x) => x > 5 });
    const selectNode = new LazyNode('select', { cols: ['a', 'b'] });
    const headNode = new LazyNode('head', { n: 10 });

    expect(filterNode.op).toBe('filter');
    expect(selectNode.op).toBe('select');
    expect(headNode.op).toBe('head');
  });

  /**
   * Tests string representation
   */
  test('should provide string representation', () => {
    const node = new LazyNode('filter');
    const str = node.toString();

    expect(str).toContain('LazyNode');
    expect(str).toContain('filter');
  });
});
