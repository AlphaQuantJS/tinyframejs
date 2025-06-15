/**
 * Centralized registrar for all Series methods
 * This file imports and applies all method registrars for Series
 */

// Import registrars from different categories
import { register as registerSeriesAggregation } from './aggregation/index.js';
import { register as registerSeriesTransform } from './transform/index.js';
import { register as registerSeriesFiltering } from './filtering/index.js';
import { register as registerSeriesTimeSeries } from '../timeseries/series/index.js';

/**
 * Extends the Series class with all available methods
 * @param {Class} Series - Series class to extend
 */
export function extendSeries(Series) {
  // Apply all registrars to the Series class
  registerSeriesAggregation(Series);
  registerSeriesTransform(Series);
  registerSeriesFiltering(Series);
  registerSeriesTimeSeries(Series);

  // Here you can add logging or other actions during registration
  console.debug('Series methods registered successfully');
}

/**
 * Returns an object with information about all registered methods
 * Useful for documentation and auto-generating help
 * @returns {Object} Object with method information
 */
export function getSeriesMethodsInfo() {
  return {
    aggregation: {
      count: {
        signature: 'count()',
        description: 'Count non-empty values in Series',
        returns: 'number',
        example: 'series.count()',
      },
      sum: {
        signature: 'sum()',
        description: 'Sum of values in Series',
        returns: 'number',
        example: 'series.sum()',
      },
      mean: {
        signature: 'mean()',
        description: 'Mean value in Series',
        returns: 'number',
        example: 'series.mean()',
      },
      min: {
        signature: 'min()',
        description: 'Minimum value in Series',
        returns: 'number',
        example: 'series.min()',
      },
      max: {
        signature: 'max()',
        description: 'Maximum value in Series',
        returns: 'number',
        example: 'series.max()',
      },
      median: {
        signature: 'median()',
        description: 'Median value in Series',
        returns: 'number',
        example: 'series.median()',
      },
      // Other aggregation methods...
    },
    transform: {
      map: {
        signature: 'map(fn)',
        description: 'Applies a function to each element in Series',
        returns: 'Series',
        example: 'series.map(x => x * 2)',
      },
      abs: {
        signature: 'abs()',
        description: 'Absolute value of each element in Series',
        returns: 'Series',
        example: 'series.abs()',
      },
      round: {
        signature: 'round([decimals])',
        description: 'Rounds each element in Series to specified decimals',
        returns: 'Series',
        example: 'series.round(2)',
      },
      // Other transformation methods...
    },
    filtering: {
      filter: {
        signature: 'filter(predicate)',
        description: 'Filters Series elements by predicate',
        returns: 'Series',
        example: 'series.filter(x => x > 0)',
      },
      gt: {
        signature: 'gt(value)',
        description: 'Returns values greater than the specified value',
        returns: 'Series',
        example: 'series.gt(10)',
      },
      gte: {
        signature: 'gte(value)',
        description:
          'Returns values greater than or equal to the specified value',
        returns: 'Series',
        example: 'series.gte(10)',
      },
      lt: {
        signature: 'lt(value)',
        description: 'Returns values less than the specified value',
        returns: 'Series',
        example: 'series.lt(10)',
      },
      lte: {
        signature: 'lte(value)',
        description: 'Returns values less than or equal to the specified value',
        returns: 'Series',
        example: 'series.lte(10)',
      },
      eq: {
        signature: 'eq(value)',
        description: 'Returns values equal to the specified value',
        returns: 'Series',
        example: 'series.eq(10)',
      },
      ne: {
        signature: 'ne(value)',
        description: 'Returns values not equal to the specified value',
        returns: 'Series',
        example: 'series.ne(10)',
      },
      notNull: {
        signature: 'notNull()',
        description: 'Returns non-null values',
        returns: 'Series',
        example: 'series.notNull()',
      },
      isin: {
        signature: 'isin(values)',
        description: 'Returns values in the specified array',
        returns: 'Series',
        example: 'series.isin([1, 2, 3])',
      },
      // Other filtering methods...
    },
  };
}

export default {
  extendSeries,
  getSeriesMethodsInfo,
};
