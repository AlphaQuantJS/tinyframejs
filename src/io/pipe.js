/**
 * Generic transformer pipeline for declarative ETL processes
 * Allows composing readers, transformers, and writers into a single data pipeline
 */

import { DataFrame } from '../core/dataframe/DataFrame.js';
import { filter as dfFilter } from '../methods/dataframe/filtering/filter.js';
import { sort as dfSort } from '../methods/dataframe/transform/sort.js';
import { apply as dfApply } from '../methods/dataframe/transform/apply.js';

/**
 * Creates a pipeline of functions that transform data
 *
 * @param {...Function} fns - Functions to compose
 * @returns {Function} - Composed function
 */
export function compose(...fns) {
  return fns.reduce(
    (f, g) =>
      async (...args) =>
        g(await f(...args)),
  );
}

/**
 * Creates a data pipeline that reads, transforms, and optionally writes data
 *
 * @param {Function} reader - Function that reads data from a source
 * @param {Function[]} transformers - Array of functions that transform data
 * @param {Function} [writer] - Optional function that writes data to a destination
 * @returns {Function} - Pipeline function that processes data
 */
export function createPipeline(reader, transformers = [], writer = null) {
  return async (...args) => {
    // Read data from source
    let data = await reader(...args);

    // Apply transformers
    for (const transformer of transformers) {
      data = await transformer(data);
    }

    // Write data if writer is provided
    if (writer) {
      await writer(data);
    }

    return data;
  };
}

/**
 * Creates a batch processing pipeline that processes data in chunks
 *
 * @param {Function} reader - Function that reads data from a source
 * @param {Function} processor - Function that processes each batch
 * @param {Object} options - Pipeline options
 * @param {number} [options.batchSize=1000] - Size of each batch
 * @param {Function} [options.onProgress] - Callback for progress updates
 * @returns {Promise<Array>} - Array of processed results
 */
export async function batchProcess(reader, processor, options = {}) {
  const { batchSize = 1000, onProgress = null } = options;

  const results = [];
  let processedCount = 0;

  // Process data in batches
  await reader({
    batchSize,
    onBatch: async (batch) => {
      const result = await processor(batch);
      if (result !== undefined) {
        results.push(result);
      }

      processedCount += batch.rowCount;

      if (onProgress) {
        onProgress({
          processedCount,
          batchCount: results.length,
          lastBatch: batch,
        });
      }
    },
  });

  return results;
}

/**
 * Creates a function that applies a schema to data
 *
 * @param {Object|string} schema - Schema mapping or schema name
 * @returns {Function} - Function that applies the schema
 */
export function applySchema(schema) {
  return async (data) => {
    const { applySchema: applySchemaFn } = await import(
      './transformers/apiSchemas/index.js'
    );
    return applySchemaFn(data, schema);
  };
}

/**
 * Creates a function that filters data based on a predicate
 *
 * @param {Function} predicate - Function that returns true for rows to keep
 * @returns {Function} - Function that filters data
 */
export function filter(predicate) {
  return (data) => {
    if (data instanceof DataFrame) {
      // Используем функцию dfFilter из модуля methods
      return dfFilter(data, predicate);
    }

    if (Array.isArray(data)) {
      return data.filter(predicate);
    }

    throw new Error('Data must be a DataFrame or an array');
  };
}

/**
 * Creates a function that maps data using a transform function
 *
 * @param {Function} transform - Function that transforms each row
 * @returns {Function} - Function that maps data
 */
export function map(transform) {
  return (data) => {
    if (data instanceof DataFrame) {
      // Преобразуем DataFrame в массив, применяем трансформацию и создаем новый DataFrame
      const rows = data.toArray();
      const transformed = rows.map(transform);
      return DataFrame.fromRows(transformed);
    }

    if (Array.isArray(data)) {
      return data.map(transform);
    }

    throw new Error('Data must be a DataFrame or an array');
  };
}

/**
 * Creates a function that sorts data based on a key or comparator
 *
 * @param {string|Function} keyOrComparator - Sort key or comparator function
 * @param {boolean} [ascending=true] - Sort direction
 * @returns {Function} - Function that sorts data
 */
export function sort(keyOrComparator, ascending = true) {
  return (data) => {
    if (data instanceof DataFrame) {
      // Если ключ - функция, преобразуем в сортировку по столбцу
      if (typeof keyOrComparator === 'function') {
        // Для функции-компаратора используем преобразование в массив
        const rows = data.toArray();
        const sorted = [...rows].sort(keyOrComparator);
        return DataFrame.fromRows(sorted);
      } else {
        // Для строкового ключа используем сортировку по столбцу
        const rows = data.toArray();
        const sorted = [...rows].sort((a, b) => {
          const aVal = a[keyOrComparator];
          const bVal = b[keyOrComparator];

          if (aVal < bVal) return ascending ? -1 : 1;
          if (aVal > bVal) return ascending ? 1 : -1;
          return 0;
        });
        return DataFrame.fromRows(sorted);
      }
    }

    if (Array.isArray(data)) {
      const sorted = [...data];

      if (typeof keyOrComparator === 'function') {
        sorted.sort(keyOrComparator);
      } else {
        sorted.sort((a, b) => {
          const aVal = a[keyOrComparator];
          const bVal = b[keyOrComparator];

          if (aVal < bVal) return ascending ? -1 : 1;
          if (aVal > bVal) return ascending ? 1 : -1;
          return 0;
        });
      }

      return sorted;
    }

    throw new Error('Data must be a DataFrame or an array');
  };
}

/**
 * Creates a function that limits the number of rows
 *
 * @param {number} count - Maximum number of rows to keep
 * @returns {Function} - Function that limits data
 */
export function limit(count) {
  return (data) => {
    if (data instanceof DataFrame) {
      // Преобразуем DataFrame в массив, берем первые count элементов и создаем новый DataFrame
      const rows = data.toArray().slice(0, count);
      return DataFrame.fromRows(rows);
    }

    if (Array.isArray(data)) {
      return data.slice(0, count);
    }

    throw new Error('Data must be a DataFrame or an array');
  };
}

/**
 * Creates a function that converts data to a DataFrame
 *
 * @param {Object} [options] - Conversion options
 * @returns {Function} - Function that converts data to DataFrame
 */
export function toDataFrame(options = {}) {
  return (data) => {
    if (data instanceof DataFrame) {
      return data;
    }

    if (Array.isArray(data)) {
      return DataFrame.fromRows(data, options);
    }

    if (typeof data === 'object' && data !== null) {
      // Check if it's a columns object
      const firstValue = Object.values(data)[0];
      if (Array.isArray(firstValue)) {
        return DataFrame.fromColumns(data, options);
      }

      // Single row object
      return DataFrame.fromRows([data], options);
    }

    throw new Error('Cannot convert data to DataFrame');
  };
}

/**
 * Creates a function that logs data for debugging
 *
 * @param {string} [message='Data:'] - Message to log before data
 * @param {boolean} [detailed=false] - Whether to log detailed information
 * @returns {Function} - Function that logs data
 */
export function log(message = 'Data:', detailed = false) {
  return (data) => {
    if (data instanceof DataFrame) {
      console.log(message);
      if (detailed) {
        console.log(`Rows: ${data.rowCount}, Columns: ${data.columns.length}`);
        console.log('Columns:', data.columns);
        console.log('Sample:');
        // Используем toArray для получения первых 5 строк
        console.table(data.toArray().slice(0, 5));
      } else {
        console.table(data.toArray().slice(0, 5));
      }
    } else {
      console.log(message, data);
    }

    return data;
  };
}

/**
 * Example of a complete ETL pipeline
 *
 * @example
 * // Create a pipeline that reads CSV data, transforms it, and writes to a database
 * const pipeline = createPipeline(
 *   // Reader
 *   () => readCSV('data.csv'),
 *   // Transformers
 *   [
 *     filter(row => row.value > 0),
 *     map(row => ({ ...row, value: row.value * 2 })),
 *     sort('timestamp'),
 *     limit(1000),
 *     log('Processed data:')
 *   ],
 *   // Writer
 *   (data) => writeToDatabase(data, 'table_name')
 * );
 *
 * // Execute the pipeline
 * await pipeline();
 */
