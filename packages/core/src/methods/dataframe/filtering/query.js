/*-------------------------------------------------------------------------*
 |  DataFrame › filtering · query()                                      |
 |                                                                         |
 |  df.query("SELECT * WHERE age > 30") → new DataFrame with matching rows |
 |  Supports SQL-like syntax.                                              |
 *-------------------------------------------------------------------------*/

import { createTypedSeries } from '../../../data/utils/createTypedArray.js';

/**
 * Filters DataFrame rows using SQL-like syntax
 *
 * @param {Object} df - DataFrame instance
 * @param {string} queryString - SQL-like query string
 * @returns {Object} - New DataFrame with filtered rows
 */
export function query(df, queryString) {
  if (typeof queryString !== 'string') {
    throw new Error('Query must be a string');
  }

  // Parse SQL-like query
  const parsedQuery = parseQuery(queryString);
  
  // Determine which columns to include in the result
  const columnsToInclude = parsedQuery.columns[0] === '*' ?
    df.columns :
    parsedQuery.columns.filter(col => df.columns.includes(col));
  
  // Get data from DataFrame
  let rows = df.toArray();
  
  // Apply WHERE condition if present
  if (parsedQuery.whereClause) {
    const evaluateQuery = createQueryEvaluator(parsedQuery.whereClause);
    rows = rows.filter((row) => {
      try {
        return evaluateQuery(row);
      } catch (e) {
        throw new Error(`Error evaluating query for row: ${e.message}`);
      }
    });
  }
  
  // Apply ORDER BY sorting if present
  if (parsedQuery.orderBy) {
    const { column, direction } = parsedQuery.orderBy;
    rows.sort((a, b) => {
      const valueA = a[column];
      const valueB = b[column];
      
      if (valueA === valueB) return 0;
      
      const comparison = valueA < valueB ? -1 : 1;
      return direction === 'ASC' ? comparison : -comparison;
    });
  }
  
  // Apply LIMIT restriction if present
  if (parsedQuery.limit !== null) {
    rows = rows.slice(0, parsedQuery.limit);
  }

  // If no rows, return an empty DataFrame with the same columns and column types
  if (rows.length === 0) {
    // Create a new DataFrame instance with the same options as the original
    const result = new df.constructor({}, df._options);
    
    // For each column, create a Series with the appropriate type
    for (const col of df.columns) {
      // Get the original column data to determine its type
      const originalColumn = df._columns[col];
      const originalArray = originalColumn.vector.__data;
      
      // Create an empty array with the same type
      if (ArrayBuffer.isView(originalArray) && !(originalArray instanceof DataView)) {
        const TypedArrayConstructor = originalArray.constructor;
        const emptyTypedArray = new TypedArrayConstructor(0);
        result._columns[col] = createTypedSeries(emptyTypedArray, col, df);
      } else {
        result._columns[col] = createTypedSeries([], col, df);
      }
      
      // Add to column order
      if (!result._order.includes(col)) {
        result._order.push(col);
      }
    }
    
    return result;
  }

  // For non-empty results, create a new DataFrame with filtered rows
  // Create a new DataFrame instance with the same options as the original
  const result = new df.constructor({}, df._options);
  
  // Determine which columns to include based on the query
  const columnsToProcess = parsedQuery.columns[0] === '*' ? df.columns : columnsToInclude;
  
  // For each column, create a Series with the appropriate type
  for (const col of columnsToProcess) {
    // Skip columns that don't exist in the original DataFrame
    if (!df.columns.includes(col)) continue;
    
    // Get the original column data to determine its type
    const originalColumn = df._columns[col];
    const originalArray = originalColumn.vector.__data;
    
    // Extract values for this column from the filtered rows
    const values = rows.map(row => row[col]);
    
    // Preserve the array type if it's a typed array
    if (ArrayBuffer.isView(originalArray) && !(originalArray instanceof DataView)) {
      const TypedArrayConstructor = originalArray.constructor;
      const typedValues = new TypedArrayConstructor(values.length);
      values.forEach((value, i) => {
        typedValues[i] = value;
      });
      result._columns[col] = createTypedSeries(typedValues, col, df);
    } else {
      result._columns[col] = createTypedSeries(values, col, df);
    }
    
    // Add to column order
    if (!result._order.includes(col)) {
      result._order.push(col);
    }
  }
  
  return result;
}

/**
 * Parses an SQL-like query string into its components
 * 
 * @param {string} queryString - SQL-like query string
 * @returns {Object} - Parsed query components
 * @private
 */
function parseQuery(queryString) {
  // Initialize default values
  const result = {
    columns: ['*'],
    whereClause: null,
    orderBy: null,
    limit: null
  };
  
  // Extract LIMIT clause if present
  const limitMatch = queryString.match(/\s+LIMIT\s+(\d+)\s*$/i);
  if (limitMatch) {
    result.limit = parseInt(limitMatch[1], 10);
    queryString = queryString.replace(/\s+LIMIT\s+\d+\s*$/i, '');
  }
  
  // Extract ORDER BY clause if present
  const orderByMatch = queryString.match(/\s+ORDER\s+BY\s+([\w.]+)(?:\s+(ASC|DESC))?\s*$/i);
  if (orderByMatch) {
    result.orderBy = {
      column: orderByMatch[1],
      direction: (orderByMatch[2] || 'ASC').toUpperCase()
    };
    queryString = queryString.replace(/\s+ORDER\s+BY\s+[\w.]+(?:\s+(?:ASC|DESC))?\s*$/i, '');
  }
  
  // Extract SELECT and WHERE parts
  const selectMatch = queryString.match(/^\s*SELECT\s+(.+?)(?:\s+WHERE\s+(.+))?\s*$/i);
  if (selectMatch) {
    // Parse columns
    const columnsStr = selectMatch[1].trim();
    if (columnsStr !== '*') {
      result.columns = columnsStr.split(',').map(col => col.trim());
    }
    
    // Parse WHERE clause
    if (selectMatch[2]) {
      result.whereClause = selectMatch[2].trim();
    }
  } else {
    // If no SELECT keyword, treat the whole string as WHERE clause
    result.whereClause = queryString.trim();
  }
  
  return result;
}

/**
 * Creates a function to evaluate a WHERE clause
 * 
 * @param {string} whereClause - WHERE clause from SQL-like query
 * @returns {Function} - Function evaluating the clause for a row
 * @private
 */
function createQueryEvaluator(whereClause) {
  if (!whereClause) {
    return () => true; // No WHERE clause means all rows match
  }
  
  // Transform SQL-like query into JavaScript expression
  let jsQuery = whereClause;
  
  // Process logical operators first (to avoid conflicts with BETWEEN...AND)
  jsQuery = jsQuery
    .replace(/\bAND\b/gi, '&&')
    .replace(/\bOR\b/gi, '||')
    .replace(/\bNOT\b/gi, '!');
  
  // Process basic comparison operators
  jsQuery = jsQuery
    // Replace single equals with double equals
    .replace(/([\w.]+)\s*=\s*([^=\s][^=]*)/g, '$1 == $2')
    // Process IN operator
    .replace(
      /([\w.]+)\s+IN\s+\(([^)]+)\)/gi,
      (match, col, values) => {
        // Split values by comma and remove extra spaces
        const cleanValues = values.split(',').map(v => v.trim()).join(', ');
        return `[${cleanValues}].includes(${col})`;
      }
    )
    // Process LIKE with % at beginning and end (contains)
    .replace(/([\w.]+)\s+LIKE\s+['"]%(.+?)%['"]\s*/gi, '$1.toString().includes("$2")')
    // Process LIKE with % at end (starts with)
    .replace(/([\w.]+)\s+LIKE\s+['"](.+?)%['"]\s*/gi, '$1.toString().startsWith("$2")')
    // Process LIKE with % at beginning (ends with)
    .replace(/([\w.]+)\s+LIKE\s+['"]%(.+?)['"]\s*/gi, '$1.toString().endsWith("$2")')
    // Process BETWEEN
    .replace(
      /([\w.]+)\s+BETWEEN\s+(\S+)\s+AND\s+(\S+)/gi,
      '($1 >= $2 && $1 <= $3)'
    );

  // Create function to evaluate the query
  try {
    return new Function(
      'row',
      `
      try {
        with (row) {
          return ${jsQuery};
        }
      } catch (e) {
        return false;
      }
    `
    );
  } catch (e) {
    throw new Error(`Invalid query syntax: ${e.message}`);
  }
}

// Export object with method for the pool
export default { query };
