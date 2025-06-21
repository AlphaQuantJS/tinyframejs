/**
 * GroupByCore class for advanced DataFrame aggregation operations.
 * Note: This API is experimental and may change in future versions.
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

/**
 * Helper - generate unique output column name
 * @param {string} raw - Base column name
 * @param {Object} bag - Object containing existing column names
 * @returns {string} - Unique column name that doesn't exist in the bag
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
 * For most use cases, use the DataFrame.group() method instead of instantiating
 * this class directly.
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
      sum: (s) => {
        // Если метод sum доступен в Series, используем его
        if (typeof s.sum === 'function') {
          return s.sum();
        }

        // Otherwise use direct access to data
        if (s.vector && s.vector.__data) {
          const data = s.vector.__data;
          let sum = 0;
          for (let i = 0; i < data.length; i++) {
            if (!isNaN(data[i])) {
              sum += data[i];
            }
          }
          return sum;
        }

        // Get values through toArray or values
        let values = [];
        if (typeof s.toArray === 'function') {
          values = s.toArray();
        } else if (s.values) {
          values = s.values;
        } else if (s.vector) {
          try {
            values = Array.from(s.vector);
          } catch (e) {
            values = [];
          }
        }

        // Calculate sum
        let sum = 0;
        for (let i = 0; i < values.length; i++) {
          const val = Number(values[i]);
          if (!isNaN(val)) {
            sum += val;
          }
        }
        return sum;
      },
      mean: (s) => {
        // If the mean method is available in Series, use it
        if (typeof s.mean === 'function') {
          return s.mean();
        }

        // Otherwise use direct access to data
        if (s.vector && s.vector.__data) {
          const data = s.vector.__data;
          let sum = 0;
          let count = 0;
          for (let i = 0; i < data.length; i++) {
            if (!isNaN(data[i])) {
              sum += data[i];
              count++;
            }
          }
          return count > 0 ? sum / count : 0;
        }

        // Get values through toArray or values
        let values = [];
        if (typeof s.toArray === 'function') {
          values = s.toArray();
        } else if (s.values) {
          values = s.values;
        } else if (s.vector) {
          try {
            values = Array.from(s.vector);
          } catch (e) {
            values = [];
          }
        }

        // Calculate mean
        let sum = 0;
        let count = 0;
        for (let i = 0; i < values.length; i++) {
          const val = Number(values[i]);
          if (!isNaN(val)) {
            sum += val;
            count++;
          }
        }
        return count > 0 ? sum / count : 0;
      },
      min: (s) => {
        // If the min method is available in Series, use it
        if (typeof s.min === 'function') {
          return s.min();
        }

        // Otherwise use direct access to data
        if (s.vector && s.vector.__data) {
          const data = s.vector.__data;
          let min = Infinity;
          for (let i = 0; i < data.length; i++) {
            if (!isNaN(data[i]) && data[i] < min) {
              min = data[i];
            }
          }
          return min === Infinity ? null : min;
        }

        // Get values through toArray or values
        let values = [];
        if (typeof s.toArray === 'function') {
          values = s.toArray();
        } else if (s.values) {
          values = s.values;
        } else if (s.vector) {
          try {
            values = Array.from(s.vector);
          } catch (e) {
            values = [];
          }
        }

        // Find minimum
        let min = Infinity;
        for (let i = 0; i < values.length; i++) {
          const val = Number(values[i]);
          if (!isNaN(val) && val < min) {
            min = val;
          }
        }
        return min === Infinity ? null : min;
      },
      max: (s) => {
        // If the max method is available in Series, use it
        if (typeof s.max === 'function') {
          return s.max();
        }

        // Otherwise use direct access to data
        if (s.vector && s.vector.__data) {
          const data = s.vector.__data;
          let max = -Infinity;
          for (let i = 0; i < data.length; i++) {
            if (!isNaN(data[i]) && data[i] > max) {
              max = data[i];
            }
          }
          return max === -Infinity ? null : max;
        }

        // Get values through toArray or values
        let values = [];
        if (typeof s.toArray === 'function') {
          values = s.toArray();
        } else if (s.values) {
          values = s.values;
        } else if (s.vector) {
          try {
            values = Array.from(s.vector);
          } catch (e) {
            values = [];
          }
        }

        // Find maximum
        let max = -Infinity;
        for (let i = 0; i < values.length; i++) {
          const val = Number(values[i]);
          if (!isNaN(val) && val > max) {
            max = val;
          }
        }
        return max === -Infinity ? null : max;
      },
      count: (s) => {
        // If the count method is available in Series, use it
        if (typeof s.count === 'function') {
          return s.count();
        }

        // Otherwise use direct access to data
        if (s.vector && s.vector.__data) {
          return s.vector.__data.length;
        }

        // Get values through toArray or values
        if (typeof s.toArray === 'function') {
          return s.toArray().length;
        }
        if (s.values) {
          return s.values.length;
        }
        return 0;
      },
    };
    const spec = {};
    for (const col in aggregations) {
      normalizeAggSpec(col, aggregations[col], aggFns, spec);
    }

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
        for (const [oName, fn] of Object.entries(spec[col])) {
          const result = fn(series);
          out[oName].push(result);
        }
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
    agg[column] = (series) => {
      if (typeof series.sum === 'function') return series.sum();
      const values =
        series.values || (series.vector ? Array.from(series.vector) : []);
      return values.reduce((a, b) => a + b, 0);
    };
    return this.agg(agg);
  }

  /**
   * Returns the mean of values in each group
   * @param {string} column - Column to average
   * @returns {DataFrame} - DataFrame with group means
   */
  mean(column) {
    const agg = {};
    agg[column] = (series) => {
      if (typeof series.mean === 'function') return series.mean();
      const values =
        series.values || (series.vector ? Array.from(series.vector) : []);
      const count = values.length;
      return count > 0 ? values.reduce((a, b) => a + b, 0) / count : 0;
    };
    return this.agg(agg);
  }

  /**
   * Returns the minimum value in each group
   * @param {string} column - Column to find minimum
   * @returns {DataFrame} - DataFrame with group minimums
   */
  min(column) {
    const agg = {};
    agg[column] = 'min';
    return this.agg(agg);
  }

  /**
   * Returns the maximum value in each group
   * @param {string} column - Column to find maximum
   * @returns {DataFrame} - DataFrame with group maximums
   */
  max(column) {
    const agg = {};
    agg[column] = 'max';
    return this.agg(agg);
  }
}
