/**
 * Centralized registrar for all DataFrame methods
 * This file imports and applies all method registrars for DataFrame
 */

// Import registrars from different categories
import { registerDataFrameAggregation } from './aggregation/register.js';
import { registerDataFrameFiltering } from './filtering/register.js';
import { registerDataFrameTransform } from './transform/register.js';
import { registerDataFrameDisplay } from './display/register.js';
import { registerDataFrameTimeSeries } from './timeseries/register.js';
import { registerReshapeMethods } from '../reshape/register.js';

/**
 * Extends the DataFrame class with all available methods
 * @param {Class} DataFrame - DataFrame class to extend
 */
export function extendDataFrame(DataFrame) {
  // Apply all registrars to the DataFrame class
  registerDataFrameAggregation(DataFrame);
  registerDataFrameFiltering(DataFrame);
  registerDataFrameTransform(DataFrame);
  registerDataFrameDisplay(DataFrame);
  registerDataFrameTimeSeries(DataFrame);
  registerReshapeMethods(DataFrame);

  // Here you can add logging or other actions during registration
  console.debug('DataFrame methods registered successfully');
}

/**
 * Returns an object with information about all registered methods
 * Useful for documentation and auto-generating help
 * @returns {Object} Object with method information
 */
export function getDataFrameMethodsInfo() {
  return {
    aggregation: {
      count: {
        signature: 'count(column)',
        description: 'Count non-empty values in the specified column',
        returns: 'number',
        example: 'df.count(\'age\')',
      },
      sum: {
        signature: 'sum(column)',
        description: 'Sum of values in the specified column',
        returns: 'number',
        example: 'df.sum(\'price\')',
      },
      mean: {
        signature: 'mean(column)',
        description: 'Mean value in the specified column',
        returns: 'number',
        example: 'df.mean(\'score\')',
      },
      min: {
        signature: 'min(column)',
        description: 'Minimum value in the specified column',
        returns: 'number',
        example: 'df.min(\'price\')',
      },
      max: {
        signature: 'max(column)',
        description: 'Maximum value in the specified column',
        returns: 'number',
        example: 'df.max(\'price\')',
      },
      median: {
        signature: 'median(column)',
        description: 'Median value in the specified column',
        returns: 'number',
        example: 'df.median(\'score\')',
      },
      // Other aggregation methods...
    },
    filtering: {
      filter: {
        signature: 'filter(predicate)',
        description: 'Filter rows by predicate',
        returns: 'DataFrame',
        example: 'df.filter(row => row.age > 30)',
      },
      where: {
        signature: 'where(column, operator, value)',
        description: 'Filter rows based on a condition for a specific column',
        returns: 'DataFrame',
        example: 'df.where(\'age\', \'>\', 30)',
      },
      expr$: {
        signature: 'expr$`expression`',
        description: 'Filter rows using a template literal expression',
        returns: 'DataFrame',
        example: 'df.expr$`age > 30 && city.includes("York")`',
      },
      select: {
        signature: 'select(columns)',
        description: 'Select specified columns',
        returns: 'DataFrame',
        example: 'df.select([\'name\', \'age\'])',
      },
      drop: {
        signature: 'drop(columns)',
        description: 'Remove specified columns',
        returns: 'DataFrame',
        example: 'df.drop([\'address\', \'phone\'])',
      },
      at: {
        signature: 'at(index)',
        description: 'Select a single row by index',
        returns: 'Object',
        example: 'df.at(5)',
      },
      iloc: {
        signature: 'iloc(rowSelector, [colSelector])',
        description: 'Select rows and columns by integer positions',
        returns: 'DataFrame|Object',
        example: 'df.iloc([0, 1, 2], [0, 2])',
      },
      // Other filtering methods...
    },
    transform: {
      sort: {
        signature: 'sort(column, [options])',
        description: 'Sort by the specified column',
        returns: 'DataFrame',
        example: 'df.sort(\'name\', { ascending: true })',
      },
      assign: {
        signature: 'assign(columns)',
        description: 'Add or update columns',
        returns: 'DataFrame',
        example:
          'df.assign({ fullName: row => `${row.firstName} ${row.lastName}` })',
      },
      // Other transformation methods...
    },
    reshape: {
      pivot: {
        signature: 'pivot(index, columns, values, [aggFunc])',
        description: 'Pivot DataFrame from long to wide format',
        returns: 'DataFrame',
        example: 'df.pivot(\'date\', \'category\', \'value\')',
      },
      melt: {
        signature: 'melt(idVars, [valueVars], [varName], [valueName])',
        description: 'Unpivot DataFrame from wide to long format',
        returns: 'DataFrame',
        example: 'df.melt([\'date\'], [\'sales\', \'expenses\'])',
      },
      // Other reshape methods...
    },
    display: {
      print: {
        signature: 'print([maxRows], [maxCols])',
        description: 'Display data in console as a table',
        returns: 'DataFrame',
        example: 'df.print(10, 5)',
      },
      toHTML: {
        signature: 'toHTML([options])',
        description: 'Convert to HTML table',
        returns: 'string',
        example: 'df.toHTML({ className: \'data-table\' })',
      },
      // Other display methods...
    },
  };
}

export default {
  extendDataFrame,
  getDataFrameMethodsInfo,
};
