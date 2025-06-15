/**
 * Facade for GroupByCore functionality.
 * Provides simplified access to grouping operations.
 *
 * This module serves as the single entry point for all DataFrame aggregation methods.
 * It exports two main functions:
 * - groupByMethod: Creates a proxy object with methods like .agg(), .apply(), .sum(), etc.
 * - groupAggMethod: Direct aggregation in one step
 *
 * @module methods/dataframe/aggregation/group
 */
import { GroupByCore } from '../../../core/dataframe/GroupByCore.js';

/**
 * Creates a groupBy method for DataFrame
 * @returns {Function} groupBy method
 */
export function groupByMethod() {
  /**
   * Groups DataFrame by specified column(s) and returns a proxy object
   * that provides methods for aggregation and custom operations.
   *
   * @param {string|string[]} by - Column(s) to group by
   * @returns {Object} Proxy object with methods like .agg(), .apply(), .sum(), etc.
   *
   * @example
   * // Basic usage with aggregation methods
   * df.groupBy('category').sum('value')
   *
   * @example
   * // Advanced usage with apply
   * df.group(['region', 'year'])
   *   .apply(g => {
   *     const profit = g.col('revenue').sum() - g.col('costs').sum();
   *     return { profit };
   *   });
   */
  return function (by) {
    const groupByInstance = new GroupByCore(this, by);

    // Create an object with methods for convenient use
    return {
      // Main GroupByCore methods
      agg: (spec) => groupByInstance.agg(spec),
      apply: (fn) => groupByInstance.apply(fn),

      // Helper methods for aggregation
      sum: (column) => {
        const spec = {};
        spec[column] = 'sum';
        return groupByInstance.agg(spec);
      },
      mean: (column) => {
        const spec = {};
        spec[column] = 'mean';
        return groupByInstance.agg(spec);
      },
      min: (column) => {
        const spec = {};
        spec[column] = 'min';
        return groupByInstance.agg(spec);
      },
      max: (column) => {
        const spec = {};
        spec[column] = 'max';
        return groupByInstance.agg(spec);
      },
      count: (column) => {
        const spec = {};
        spec[column || groupByInstance.df.columns[0]] = 'count';
        return groupByInstance.agg(spec);
      },
    };
  };
}

/**
 * Creates a groupAgg method for DataFrame
 * @returns {Function} groupAgg method
 */
export function groupAggMethod() {
  /**
   * Groups DataFrame by specified column(s) and performs aggregations.
   *
   * @param {string|string[]} by - Column(s) to group by
   * @param {Object} spec - Aggregation specification
   * @returns {DataFrame} DataFrame with aggregation results
   *
   * @example
   * // Single aggregation
   * df.groupAgg('category', { value: 'sum' })
   *
   * @example
   * // Multiple aggregations
   * df.groupAgg('category', {
   *   price: ['mean', 'max'],
   *   quantity: 'sum'
   * })
   *
   * @example
   * // Custom aggregation function
   * df.groupAgg('category', {
   *   price: series => series.values.reduce((a, b) => a + b, 0) / series.length
   * })
   */
  return function (by, spec) {
    return new GroupByCore(this, by).agg(spec);
  };
}

/**
 * Helper function to create simple aggregation methods
 * @param {string} operation - Name of the aggregation operation ('sum', 'mean', 'min', 'max', 'count')
 * @returns {Function} Aggregation method
 */
function simpleHelper(operation) {
  return function (by, column) {
    const aggregations = {};
    aggregations[column] = operation;
    return this.groupAgg(by, aggregations);
  };
}

/**
 * Register all aggregation methods on DataFrame prototype
 * @param {Function} DataFrame - DataFrame class
 */
export function register(DataFrame) {
  // Main methods
  if (!DataFrame.prototype.group) {
    DataFrame.prototype.group = groupMethod();
  }

  if (!DataFrame.prototype.groupAgg) {
    DataFrame.prototype.groupAgg = groupAggMethod();
  }

  // Helper methods for simple aggregations
  if (!DataFrame.prototype.groupSum) {
    DataFrame.prototype.groupSum = simpleHelper('sum');
  }

  if (!DataFrame.prototype.groupMean) {
    DataFrame.prototype.groupMean = simpleHelper('mean');
  }

  if (!DataFrame.prototype.groupMin) {
    DataFrame.prototype.groupMin = simpleHelper('min');
  }

  if (!DataFrame.prototype.groupMax) {
    DataFrame.prototype.groupMax = simpleHelper('max');
  }

  // Special handling for groupCount, since it can work without a specified column
  if (!DataFrame.prototype.groupCount) {
    DataFrame.prototype.groupCount = function (by, column) {
      if (column) {
        const aggregations = {};
        aggregations[column] = 'count';
        return this.groupAgg(by, aggregations);
      }

      // If column is not specified, use the first column for counting
      const firstColumn = this.columns[0];
      const aggregations = {};
      aggregations[firstColumn] = 'count';
      return this.groupAgg(by, aggregations);
    };
  }
}
