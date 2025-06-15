/**
 * Register aggregation methods for DataFrame
 *
 * @module methods/dataframe/aggregation/register
 */

import { GroupByCore } from '../../../core/dataframe/GroupByCore.js';
import { groupByMethod } from './group.js';

/**
 * Creates a proxy object with aggregation methods
 *
 * @returns {Function} Group method function
 */
function groupMethod() {
  return function (by) {
    const groupBy = new GroupByCore(this, by);

    // Add methods that append suffix to column names
    const originalSum = groupBy.sum;
    groupBy.sum = function (column) {
      const aggregations = {};
      aggregations[column] = 'sum';
      return this.agg(aggregations);
    };

    const originalMean = groupBy.mean;
    groupBy.mean = function (column) {
      const aggregations = {};
      aggregations[column] = 'mean';
      return this.agg(aggregations);
    };

    const originalMin = groupBy.min;
    groupBy.min = function (column) {
      const aggregations = {};
      aggregations[column] = 'min';
      return this.agg(aggregations);
    };

    const originalMax = groupBy.max;
    groupBy.max = function (column) {
      const aggregations = {};
      aggregations[column] = 'max';
      return this.agg(aggregations);
    };

    const originalCount = groupBy.count;
    groupBy.count = function (column) {
      const aggregations = {};
      aggregations[column || this.df.columns[0]] = 'count';
      return this.agg(aggregations);
    };

    return groupBy;
  };
}

/**
 * Creates a direct aggregation method
 *
 * @returns {Function} GroupAgg method function
 */
function groupAggMethod() {
  return function (by, aggregations) {
    const groupBy = new GroupByCore(this, by);
    return groupBy.agg(aggregations);
  };
}

/**
 * Creates a simple helper method for common aggregations
 *
 * @param {string} aggType - Aggregation type (sum, mean, min, max, count)
 * @returns {Function} Helper method function
 */
function simpleHelper(aggType) {
  return function (by, column) {
    if (column) {
      const aggregations = {};
      aggregations[column] = aggType;
      return this.groupAgg(by, aggregations);
    }

    // If column is not specified, use the first column
    const firstColumn = this.columns[0];
    const aggregations = {};
    aggregations[firstColumn] = aggType;

    return this.groupAgg(by, aggregations);
  };
}

/**
 * Creates a direct aggregation method for DataFrame that delegates to Series
 *
 * @param {string} methodName - Name of the aggregation method on Series
 * @returns {Function} Direct aggregation method function
 */
function directAggregationMethod(methodName) {
  return function (columnName) {
    // Check that columnName is provided and not undefined
    if (columnName === undefined) {
      throw new Error(`Column name must be provided for ${methodName} method`);
    }

    // Get Series by column name
    const series = this.get(columnName);

    // Check that Series exists
    if (!series) {
      throw new Error(`Column '${columnName}' not found`);
    }

    // Call method on Series
    return series[methodName]();
  };
}

/**
 * Register all aggregation methods on DataFrame prototype
 *
 * @param {Function} DataFrame - DataFrame class
 */
export function register(DataFrame) {
  // Register main group methods
  if (!DataFrame.prototype.groupBy) {
    DataFrame.prototype.groupBy = groupByMethod();
  }

  // For backward compatibility, save method group as alias for groupBy
  if (!DataFrame.prototype.group) {
    DataFrame.prototype.group = function (by) {
      return this.groupBy(by);
    };
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

  // Register direct aggregation methods that delegate to Series
  const aggregationMethods = [
    'mean',
    'sum',
    'min',
    'max',
    'median',
    'mode',
    'std',
    'variance',
    'count',
    'product',
  ];

  aggregationMethods.forEach((methodName) => {
    if (!DataFrame.prototype[methodName]) {
      DataFrame.prototype[methodName] = directAggregationMethod(methodName);
    }
  });
}
