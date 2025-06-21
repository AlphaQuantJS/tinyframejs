/**
 * DataFrame aggregation core functions
 *
 * This file contains all core aggregation functions that use GroupByCore
 *
 * @module methods/dataframe/aggregation/group
 */

import { GroupByCore } from '../../../data/model/GroupByCore.js';

/**
 * Groups DataFrame by specified column(s) and returns a proxy object
 * that provides methods for aggregation and custom operations.
 *
 * @param {DataFrame} df - DataFrame to group
 * @param {string|string[]} by - Column(s) to group by
 * @returns {Object} Proxy object with methods like .agg(), .apply(), .sum(), etc.
 *
 * @example
 * // Basic usage with aggregation methods
 * group(df, 'category').sum('value')
 *
 * @example
 * // Advanced usage with apply
 * group(df, ['region', 'year'])
 *   .apply(g => {
 *     const profit = g.col('revenue').sum() - g.col('costs').sum();
 *     return { profit };
 *   });
 */
export function group(df, by) {
  const groupByInstance = new GroupByCore(df, by);
  return groupByInstance;
}

/**
 * Alias for group function with a more descriptive name
 *
 * @param {DataFrame} df - DataFrame to group
 * @param {string|string[]} by - Column(s) to group by
 * @returns {Object} Proxy object with methods like .agg(), .apply(), .sum(), etc.
 */
export function groupBy(df, by) {
  return group(df, by);
}

/**
 * Groups DataFrame by specified column(s) and performs aggregations.
 *
 * @param {DataFrame} df - DataFrame to group
 * @param {string|string[]} by - Column(s) to group by
 * @param {Object} spec - Aggregation specification
 * @returns {DataFrame} DataFrame with aggregation results
 *
 * @example
 * // Single aggregation
 * groupAgg(df, 'category', { value: 'sum' })
 *
 * @example
 * // Multiple aggregations
 * groupAgg(df, 'category', {
 *   price: ['mean', 'max'],
 *   quantity: 'sum'
 * })
 */
export function groupAgg(df, by, spec) {
  return new GroupByCore(df, by).agg(spec);
}

/**
 * Groups DataFrame by specified column(s) and calculates sum for a column.
 *
 * @param {DataFrame} df - DataFrame to group
 * @param {string|string[]} by - Column(s) to group by
 * @param {string} column - Column to calculate sum for
 * @returns {DataFrame} DataFrame with sum results
 *
 * @example
 * // Calculate sum of 'value' column grouped by 'category'
 * groupSum(df, 'category', 'value')
 */
export function groupSum(df, by, column) {
  return new GroupByCore(df, by).sum(column);
}

/**
 * Groups DataFrame by specified column(s) and calculates mean for a column.
 *
 * @param {DataFrame} df - DataFrame to group
 * @param {string|string[]} by - Column(s) to group by
 * @param {string} column - Column to calculate mean for
 * @returns {DataFrame} DataFrame with mean results
 *
 * @example
 * // Calculate mean of 'value' column grouped by 'category'
 * groupMean(df, 'category', 'value')
 */
export function groupMean(df, by, column) {
  return new GroupByCore(df, by).mean(column);
}

/**
 * Groups DataFrame by specified column(s) and finds minimum for a column.
 *
 * @param {DataFrame} df - DataFrame to group
 * @param {string|string[]} by - Column(s) to group by
 * @param {string} column - Column to find minimum for
 * @returns {DataFrame} DataFrame with minimum results
 *
 * @example
 * // Find minimum of 'value' column grouped by 'category'
 * groupMin(df, 'category', 'value')
 */
export function groupMin(df, by, column) {
  return new GroupByCore(df, by).min(column);
}

/**
 * Groups DataFrame by specified column(s) and finds maximum for a column.
 *
 * @param {DataFrame} df - DataFrame to group
 * @param {string|string[]} by - Column(s) to group by
 * @param {string} column - Column to find maximum for
 * @returns {DataFrame} DataFrame with maximum results
 *
 * @example
 * // Find maximum of 'value' column grouped by 'category'
 * groupMax(df, 'category', 'value')
 */
export function groupMax(df, by, column) {
  return new GroupByCore(df, by).max(column);
}

/**
 * Groups DataFrame by specified column(s) and counts rows in each group.
 *
 * @param {DataFrame} df - DataFrame to group
 * @param {string|string[]} by - Column(s) to group by
 * @param {string} [column] - Optional column to count (if not provided, counts rows)
 * @returns {DataFrame} DataFrame with count results
 *
 * @example
 * // Count rows in each category
 * groupCount(df, 'category')
 */
export function groupCount(df, by, column) {
  const groupByInstance = new GroupByCore(df, by);
  return column
    ? groupByInstance.agg({ [column]: 'count' })
    : groupByInstance.count();
}
