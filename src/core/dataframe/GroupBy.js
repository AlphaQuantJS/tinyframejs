// src/core/dataframe/GroupBy.js
import { DataFrame } from './DataFrame.js';
import { Series } from './Series.js';

export class GroupBy {
  /**
   * @param {DataFrame} df - Source DataFrame
   * @param {string|string[]} by - Column(s) to group by
   */
  constructor(df, by) {
    this.df = df;
    this.by = Array.isArray(by) ? by : [by];
    this._groups = this._createGroups();
  }

  /**
   * Creates groups based on unique values in the grouping columns
   * @private
   * @returns {Map} - Map of group keys to row indices
   */
  _createGroups() {
    const groups = new Map();
    const rows = this.df.toArray();

    // Group rows by the values in the 'by' columns
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const key = this.by.map((col) => row[col]).join('|');

      if (!groups.has(key)) {
        groups.set(key, []);
      }

      groups.get(key).push(i);
    }

    return groups;
  }

  /**
   * Applies an aggregation function to each group
   * @param {Object} aggregations - Map of column names to aggregation functions
   * @returns {DataFrame} - DataFrame with aggregated results
   */
  agg(aggregations) {
    const result = {};

    // Add grouping columns to result
    for (const col of this.by) {
      result[col] = [];
    }

    // Add aggregation columns to result
    for (const col in aggregations) {
      result[col] = [];
    }

    // Process each group
    for (const [key, indices] of this._groups.entries()) {
      // Extract group key values
      const keyValues = key.split('|');

      // Add group key values to result
      for (let i = 0; i < this.by.length; i++) {
        result[this.by[i]].push(keyValues[i]);
      }

      // Create subset DataFrame for this group
      const groupRows = indices.map((idx) => this.df.toArray()[idx]);
      const groupDf = DataFrame.fromRows(groupRows);

      // Apply aggregations
      for (const col in aggregations) {
        const aggFunc = aggregations[col];
        const aggValue = aggFunc(groupDf.col(col));
        result[col].push(aggValue);
      }
    }

    return new DataFrame(result);
  }

  /**
   * Applies a function to each group and returns a DataFrame with the results
   * @param {Function} fn - Function to apply to each group
   * @returns {DataFrame} - DataFrame with transformed groups
   */
  apply(fn) {
    const results = [];

    // Process each group
    for (const [key, indices] of this._groups.entries()) {
      // Create subset DataFrame for this group
      const groupRows = indices.map((idx) => this.df.toArray()[idx]);
      const groupDf = DataFrame.fromRows(groupRows);

      // Apply function to group
      const result = fn(groupDf);

      // Add group key information
      const keyValues = key.split('|');
      for (let i = 0; i < this.by.length; i++) {
        result[this.by[i]] = keyValues[i];
      }

      results.push(result);
    }

    return DataFrame.fromRows(results);
  }

  /**
   * Returns the number of items in each group
   * @returns {DataFrame} - DataFrame with group counts
   */
  count() {
    return this.agg({
      count: (series) => series.length,
    });
  }

  /**
   * Returns the sum of values in each group
   * @param {string} column - Column to sum
   * @returns {DataFrame} - DataFrame with group sums
   */
  sum(column) {
    const agg = {};
    agg[column] = (series) => series.sum();
    return this.agg(agg);
  }

  /**
   * Returns the mean of values in each group
   * @param {string} column - Column to average
   * @returns {DataFrame} - DataFrame with group means
   */
  mean(column) {
    const agg = {};
    agg[column] = (series) => series.mean();
    return this.agg(agg);
  }
}
