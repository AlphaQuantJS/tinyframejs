/**
 * @experimental
 *
 * GroupByCore class for advanced DataFrame aggregation operations.
 *
 * NOTE: For most use cases, consider using the simpler API:
 * - df.group(by) - returns a GroupByCore instance with methods like .agg(), .apply(), .sum(), etc.
 * - df.groupAgg(by, aggregations) - for general aggregations
 *
 * Examples:
 *
 * Basic aggregation:
 * ```js
 * // Calculate mean and max of price, and sum of volume for each sector
 * df.groupAgg('sector', { price: ['mean', 'max'], volume: 'sum' })
 * ```
 *
 * Advanced usage with apply:
 * ```js
 * // Calculate custom metrics for each group
 * df.group(['sector', 'year'])
 *   .apply(g => {
 *     const gross = g.col('revenue').sum() - g.col('costs').sum();
 *     return { gross };
 *   });
 * ```
 *
 * This class provides the core functionality for all grouping operations.
 *
 * @module data/model/GroupByCore
 */
import { DataFrame } from './DataFrame.js';
import { Series } from './Series.js';
import { sum as seriesSum } from '../../methods/series/aggregation/sum.js';
import { mean as seriesMean } from '../../methods/series/aggregation/mean.js';
import { min as seriesMin } from '../../methods/series/aggregation/min.js';
import { max as seriesMax } from '../../methods/series/aggregation/max.js';

/**
 * Helper - safe Series length calculation
 * @param s
 */
const seriesLen = (s) =>
  typeof s.length === 'number' ? s.length : (s.vector?.length ?? s.size ?? 0);

/**
 * Helper - generate unique output column name
 * @param raw
 * @param bag
 */
const safeName = (raw, bag) => {
  let n = raw,
    i = 1;
  while (bag[n] !== undefined) n = `${raw}_${i++}`;
  return n;
};

/**
 * Helper - normalize aggregation spec to {outName: fn} format
 * @param col
 * @param spec
 * @param aggFns
 * @param out
 */
const normalizeAggSpec = (col, spec, aggFns, out) => {
  if (typeof spec === 'function') {
    out[col] = { [col]: spec };
    return;
  }
  if (typeof spec === 'string') {
    const fn = aggFns[spec];
    if (!fn) throw new Error(`Unknown aggregation: ${spec}`);
    out[col] = { [safeName(`${col}_${spec}`, out)]: fn };
    return;
  }
  if (Array.isArray(spec)) {
    out[col] = {};
    for (const name of spec) {
      const fn = aggFns[name];
      if (!fn) throw new Error(`Unknown aggregation: ${name}`);
      out[col][safeName(`${col}_${name}`, out[col])] = fn;
    }
    return;
  }
  throw new Error(`Invalid aggregation spec for ${col}`);
};

/**
 * GroupByCore class for DataFrame aggregation operations
 *
 * This is the core implementation of grouping functionality.
 * For most use cases, use the DataFrame.group() method instead of instantiating this class directly.
 */
export class GroupByCore {
  /**
   * @param {DataFrame} df - Source DataFrame
   * @param {string|string[]} by - Column(s) to group by
   */
  constructor(df, by) {
    this.df = df;
    this.by = Array.isArray(by) ? by : [by];
    this._rows = df.toArray(); // cache of rows
    this._groups = this._createGroups(); // Map<key, row-idx[]>
  }

  /**
   * Creates groups based on unique values in the grouping columns
   * @private
   * @returns {Map} - Map of group keys to row indices
   */
  _createGroups() {
    const groups = new Map();
    this._rows.forEach((row, i) => {
      const key = this.by.map((c) => row[c]).join('|');
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(i);
    });
    return groups;
  }

  /**
   * Applies an aggregation function to each group
   * @param {Object} aggregations - Map of column names to aggregation functions or function names
   * @returns {DataFrame} - DataFrame with aggregated results
   */
  agg(aggregations) {
    // ---- 1. normalize aggregation spec -----------------------------
    const aggFns = {
      sum: seriesSum,
      mean: (s) =>
        s.mean
          ? s.mean()
          : s.toArray().reduce((a, b) => a + b, 0) / seriesLen(s),
      min: seriesMin,
      max: seriesMax,
      count: seriesLen,
    };
    const spec = {};
    for (const col in aggregations)
      normalizeAggSpec(col, aggregations[col], aggFns, spec);

    // ---- 2. prepare output object ---------------------------------
    const out = Object.fromEntries(this.by.map((c) => [c, []]));
    for (const col in spec) for (const oName in spec[col]) out[oName] ??= [];

    // ---- 3. process each group -----------------------------------
    for (const [key, idxArr] of this._groups) {
      const keyVals = key.split('|');
      // 3.1. fill grouping columns
      this.by.forEach((c, i) => out[c].push(keyVals[i]));

      // 3.2. create view-slice without copying
      const subDf = DataFrame.fromRecords(idxArr.map((i) => this._rows[i]));

      // 3.3. apply aggregations
      for (const col in spec) {
        const series = subDf.col(col);
        for (const [oName, fn] of Object.entries(spec[col]))
          out[oName].push(fn(series));
      }
    }
    return new DataFrame(out);
  }

  // ───────── syntactic sugar methods ────────────────────────────────
  /**
   * Count rows in each group
   * @returns {DataFrame} DataFrame with counts
   */
  count() {
    return this.agg({ [this.by[0]]: 'count' });
  }

  /**
   * Sum values in specified column for each group
   * @param {string} col - Column to sum
   * @returns {DataFrame} DataFrame with sums
   */
  sum(col) {
    return this.agg({ [col]: 'sum' });
  }

  /**
   * Calculate mean of values in specified column for each group
   * @param {string} col - Column to average
   * @returns {DataFrame} DataFrame with means
   */
  mean(col) {
    return this.agg({ [col]: 'mean' });
  }

  /**
   * Find minimum value in specified column for each group
   * @param {string} col - Column to find minimum
   * @returns {DataFrame} DataFrame with minimums
   */
  min(col) {
    return this.agg({ [col]: 'min' });
  }

  /**
   * Find maximum value in specified column for each group
   * @param {string} col - Column to find maximum
   * @returns {DataFrame} DataFrame with maximums
   */
  max(col) {
    return this.agg({ [col]: 'max' });
  }

  /**
   * Applies a function to each group and returns a DataFrame with the results
   * @param {Function} fn - Function to apply to each group
   * @returns {DataFrame} - DataFrame with results
   */
  apply(fn) {
    const result = {};

    // Initialize result with grouping columns
    for (const col of this.by) {
      result[col] = [];
    }

    // Process each group
    for (const [key, idxArr] of this._groups) {
      // Extract group key values
      const keyVals = key.split('|');

      // Add group key values to result
      this.by.forEach((c, i) => result[c].push(keyVals[i]));

      // Create subset DataFrame for this group using cached rows
      const subDf = DataFrame.fromRecords(idxArr.map((i) => this._rows[i]));

      // Apply function to group
      const fnResult = fn(subDf);

      // Add function result to result
      if (fnResult instanceof DataFrame) {
        // If function returns a DataFrame, add each column to result
        const fnResultArray = fnResult.toArray();
        if (fnResultArray.length === 1) {
          const row = fnResultArray[0];
          for (const col in row) {
            result[col] ??= [];
            result[col].push(row[col]);
          }
        } else {
          throw new Error('Function must return a DataFrame with a single row');
        }
      } else if (typeof fnResult === 'object' && fnResult !== null) {
        // If function returns an object (like {total: 25, avg: 12.5})
        for (const key in fnResult) {
          result[key] ??= [];
          result[key].push(fnResult[key]);
        }
      } else {
        // If function returns a scalar, add it to result
        result.result ??= [];
        result.result.push(fnResult);
      }
    }

    return new DataFrame(result);
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
    agg[column] = (series) => seriesSum(series);
    return this.agg(agg);
  }

  /**
   * Returns the mean of values in each group
   * @param {string} column - Column to average
   * @returns {DataFrame} - DataFrame with group means
   */
  mean(column) {
    const agg = {};
    agg[column] = (series) => seriesMean(series);
    return this.agg(agg);
  }
}
