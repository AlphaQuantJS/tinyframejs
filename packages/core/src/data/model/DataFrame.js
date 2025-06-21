/**
 * DataFrame class
 *
 * Core class for data manipulation in TinyFrameJS
 *
 * @module data/model/DataFrame
 */

import { Series } from './Series.js';
import { validateColumn } from '../utils/index.js';
import { sum as sumAggregation } from '../../methods/dataframe/aggregation/sum.js';

/**
 * DataFrame class - the main class for working with tabular data
 */
export class DataFrame {
  /**
   * Create a new DataFrame
   * @param {Object} data - Data object with column names as keys and arrays as values
   * @param {Object} options - Additional options
   */
  constructor(data = {}, options = {}) {
    this._columns = {};
    this._order = [];
    this._index = null;
    this._options = { ...options };

    // Initialize columns from data
    if (data && typeof data === 'object') {
      for (const [key, values] of Object.entries(data)) {
        if (Array.isArray(values)) {
          this._columns[key] = new Series(values, key);
          if (!this._order.includes(key)) {
            this._order.push(key);
          }
        }
      }
    }
  }

  /**
   * Create DataFrame from array of records (objects)
   * @param {Array<Object>} records - Array of objects where each object represents a row
   * @param {Object} options - Additional options
   * @returns {DataFrame} New DataFrame instance
   */
  static fromRecords(records, options = {}) {
    if (!Array.isArray(records) || records.length === 0) {
      return new DataFrame({}, options);
    }

    // Extract column names from the first record
    const columns = Object.keys(records[0]);

    // Initialize data object with empty arrays for each column
    const data = {};
    for (const col of columns) {
      data[col] = [];
    }

    // Fill data arrays with values from records
    for (const record of records) {
      for (const col of columns) {
        data[col].push(record[col]);
      }
    }

    return new DataFrame(data, options);
  }

  /**
   * Get the number of rows in the DataFrame
   * @returns {number} Number of rows
   */
  get rowCount() {
    if (this._order.length === 0) return 0;
    return this._columns[this._order[0]]?.length || 0;
  }

  /**
   * Get the number of columns in the DataFrame
   * @returns {number} Number of columns
   */
  get columnCount() {
    return this._order.length;
  }

  /**
   * Get array of column names
   * @returns {Array<string>} Array of column names
   */
  get columns() {
    return [...this._order];
  }

  col = (n) => this._columns[n];
  get = (n) => this._columns[n];
  sum = (n) => sumAggregation(this, n);
  /**
   * low-level vector getter
   * @param {string} n - Column name
   * @returns {import('../storage/ColumnVector.js').ColumnVector|undefined} - Column vector or
   * undefined if not found
   */
  _getVector(n) {
    return this._columns[n]?._vector;
  }

  /**
   * Convert DataFrame to array of objects (records)
   * @returns {Array<Object>} Array of records
   */
  toArray() {
    const result = [];
    const rowCount = this.rowCount;

    for (let i = 0; i < rowCount; i++) {
      const record = {};
      for (const col of this._order) {
        record[col] = this._columns[col]?.values[i];
      }
      result.push(record);
    }

    return result;
  }

  /**
   * Convert DataFrame to JSON string
   * @returns {string} JSON string
   */
  toJSON() {
    return JSON.stringify(this.toArray());
  }

  /**
   * Check if DataFrame is empty
   * @returns {boolean} True if DataFrame has no rows or columns
   */
  isEmpty() {
    return this.rowCount === 0 || this.columnCount === 0;
  }
}
