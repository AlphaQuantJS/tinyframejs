// src/core/lazy/LazyNode.js

/**
 * Node in the LazyFrame DAG plan.
 * Contains:
 *   • operation type (`op`)
 *   • arbitrary arguments (`args`)
 *   • reference to the previous node (nextPointer-free, list in LazyFrame)
 *
 * A full-featured optimizer can:
 *   • analyze chains (filter→filter → combine)
 *   • move select above expensive operations
 *   • eliminate noop steps
 */
export class LazyNode {
  /**
   * @param {string} op             Operation type (filter/select/head/...)
   * @param {object} [payload={}]   Additional data (fn, cols, n ...)
   */
  constructor(op, payload = {}) {
    this.op = op;
    this.args = payload; // arbitrary arguments
  }

  /** Human-readable output */
  toString() {
    return `LazyNode(${this.op})`;
  }
}

/**
 * Why it's needed:
 *
 * LazyFrame currently stores an array of "raw" objects { op, ... }.
 * When an optimizer is added, it will be more convenient to build a graph from LazyNode —
 * easier to type, reorder, cache expression hashes.
 *
 * Already now you can create:
 *
 * new LazyNode('filter', { fn })
 * new LazyNode('select', { cols: ['price'] })
 * and store them in this._plan.
 *
 * This is sufficient to later extend (add id, parents, hash) without changing the public API.
 */
