// src/core/DataFrame.js

import { createFrame } from './createFrame.js';
import { extendDataFrame } from '../methods/autoExtend.js';

/**
 * @typedef {Object} TinyFrame
 * @property {Record<string, Float64Array | Int32Array>} columns - Columns of the frame
 */

/**
 * DataFrame — chainable API wrapper for TinyFrame structure.
 * Provides convenient access to columns, row count, and conversion to array of objects.
 */
export class DataFrame {
  /**
   * Main constructor.
   * @param {TinyFrame} frame - The underlying TinyFrame data structure
   * @throws {Error} If frame is not a valid TinyFrame
   */
  constructor(frame) {
    if (!frame || typeof frame !== 'object' || !frame.columns) {
      throw new Error('Invalid TinyFrame passed to DataFrame');
    }
    this._frame = frame;
  }

  /**
   * Factory method for creating a DataFrame from rows, columns, or another frame.
   * @param {Object[]|Record<string, any[]>|TinyFrame} input
   * @param {Object} [options]
   * @returns {DataFrame}
   */
  static create(input, options = {}) {
    const frame = createFrame(input, options);
    return new DataFrame(frame);
  }

  /**
   * Returns the list of column names.
   * @returns {string[]}
   */
  get columns() {
    return Object.keys(this._frame.columns);
  }

  /**
   * Returns the number of rows in the DataFrame.
   * @returns {number}
   */
  get rowCount() {
    const first = Object.values(this._frame.columns)[0];
    return first?.length || 0;
  }

  /**
   * Converts the DataFrame to an array of plain JavaScript objects (row-wise).
   * @returns {Array<Object>} Array of row objects
   */
  toArray() {
    const result = [];
    const keys = this.columns;
    const len = this.rowCount;

    for (let i = 0; i < len; i++) {
      const row = {};
      for (const key of keys) {
        row[key] = this._frame.columns[key][i];
      }
      result.push(row);
    }
    return result;
  }

  /**
   * Returns the underlying TinyFrame data structure.
   * @returns {TinyFrame}
   */
  get frame() {
    return this._frame;
  }
}

// Extend DataFrame with all methods from aggregation, filtering, etc.
extendDataFrame(DataFrame);
