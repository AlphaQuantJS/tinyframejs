/**
 * Configuration-driven pipeline runner
 * Allows defining ETL pipelines using YAML/JSON configuration
 */

import {
  createPipeline,
  filter,
  map,
  sort,
  limit,
  toDataFrame,
  log,
} from './pipe.js';
import { applySchema } from './transformers/apiSchemas/index.js';
import { createValidator } from './transformers/validators/schemaValidator.js';

/**
 * Pipeline configuration schema
 *
 * @typedef {Object} PipelineConfig
 * @property {Object} reader - Reader configuration
 * @property {string} reader.type - Reader type (csv, json, api, etc.)
 * @property {Object} reader.params - Reader parameters
 * @property {Object[]} transformers - Array of transformer configurations
 * @property {string} transformers[].type - Transformer type (filter, map, sort, etc.)
 * @property {Object} transformers[].params - Transformer parameters
 * @property {Object} [writer] - Writer configuration
 * @property {string} writer.type - Writer type (csv, json, arrow, etc.)
 * @property {Object} writer.params - Writer parameters
 */

/**
 * Registry of available readers
 */
const readerRegistry = new Map();

/**
 * Registry of available transformers
 */
const transformerRegistry = new Map();

/**
 * Registry of available writers
 */
const writerRegistry = new Map();

/**
 * Register a reader
 *
 * @param {string} type - Reader type
 * @param {Function} readerFn - Reader function
 */
export function registerReader(type, readerFn) {
  readerRegistry.set(type, readerFn);
}

/**
 * Register a transformer
 *
 * @param {string} type - Transformer type
 * @param {Function} transformerFactory - Transformer factory function
 */
export function registerTransformer(type, transformerFactory) {
  transformerRegistry.set(type, transformerFactory);
}

/**
 * Register a writer
 *
 * @param {string} type - Writer type
 * @param {Function} writerFn - Writer function
 */
export function registerWriter(type, writerFn) {
  writerRegistry.set(type, writerFn);
}

/**
 * Create a reader from configuration
 *
 * @param {Object} config - Reader configuration
 * @returns {Function} - Reader function
 */
function createReaderFromConfig(config) {
  const { type, params = {} } = config;

  if (!readerRegistry.has(type)) {
    throw new Error(`Unknown reader type: ${type}`);
  }

  const readerFn = readerRegistry.get(type);

  return (...args) => {
    // Merge args with params
    const mergedParams = { ...params };

    // If first arg is a string (path/url), use it as source
    if (typeof args[0] === 'string') {
      mergedParams.source = args[0];
    } else if (typeof args[0] === 'object') {
      Object.assign(mergedParams, args[0]);
    }

    return readerFn(mergedParams);
  };
}

/**
 * Create a transformer from configuration
 *
 * @param {Object} config - Transformer configuration
 * @returns {Function} - Transformer function
 */
function createTransformerFromConfig(config) {
  const { type, params = {} } = config;

  // Handle built-in transformers
  switch (type) {
    case 'filter':
      // Convert string expression to function
      if (typeof params.predicate === 'string') {
        // Simple expression parser for basic conditions
        const expr = params.predicate;
        return filter((row) => {
          const fn = new Function('row', `return ${expr}`);
          return fn(row);
        });
      }
      return filter(params.predicate);

    case 'map':
      // Convert string expression to function
      if (typeof params.transform === 'string') {
        // Simple expression parser for basic transformations
        const expr = params.transform;
        return map((row) => {
          const fn = new Function('row', `return ${expr}`);
          return fn(row);
        });
      }
      return map(params.transform);

    case 'sort':
      return sort(params.key, params.ascending);

    case 'limit':
      return limit(params.count);

    case 'log':
      return log(params.message, params.detailed);

    case 'toDataFrame':
      return toDataFrame(params);

    case 'schema':
      return (data) => applySchema(data, params.schema);

    case 'validate':
      return createValidator(params.schema, params.options);

    default:
      // Check custom transformer registry
      if (!transformerRegistry.has(type)) {
        throw new Error(`Unknown transformer type: ${type}`);
      }

      const transformerFactory = transformerRegistry.get(type);
      return transformerFactory(params);
  }
}

/**
 * Create a writer from configuration
 *
 * @param {Object} config - Writer configuration
 * @returns {Function} - Writer function
 */
function createWriterFromConfig(config) {
  const { type, params = {} } = config;

  if (!writerRegistry.has(type)) {
    throw new Error(`Unknown writer type: ${type}`);
  }

  const writerFn = writerRegistry.get(type);

  return (data) => writerFn(data, params);
}

/**
 * Create a pipeline from configuration
 *
 * @param {PipelineConfig} config - Pipeline configuration
 * @returns {Function} - Pipeline function
 */
export function createPipelineFromConfig(config) {
  // Validate configuration
  if (!config.reader) {
    throw new Error('Pipeline configuration must include a reader');
  }

  // Create reader
  const reader = createReaderFromConfig(config.reader);

  // Create transformers
  const transformers = (config.transformers || []).map(
    createTransformerFromConfig,
  );

  // Create writer (optional)
  const writer = config.writer ? createWriterFromConfig(config.writer) : null;

  // Create pipeline
  return createPipeline(reader, transformers, writer);
}

/**
 * Run a pipeline from configuration
 *
 * @param {PipelineConfig|string} config - Pipeline configuration or path to config file
 * @param {Object} [args] - Arguments to pass to the pipeline
 * @returns {Promise<any>} - Pipeline result
 */
export async function runPipeline(config, args = {}) {
  // If config is a string, load it as a file
  if (typeof config === 'string') {
    const { isNodeJs } = await import('./utils/environment.js');

    if (isNodeJs()) {
      const fs = await import('fs/promises');
      const path = await import('path');
      const yaml = await import('js-yaml');

      const configPath = config;
      const ext = path.extname(configPath).toLowerCase();

      const content = await fs.readFile(configPath, 'utf8');

      if (ext === '.json') {
        config = JSON.parse(content);
      } else if (ext === '.yml' || ext === '.yaml') {
        config = yaml.load(content);
      } else {
        throw new Error(`Unsupported config file extension: ${ext}`);
      }
    } else {
      throw new Error(
        'Loading config from file is only supported in Node.js environment',
      );
    }
  }

  // Create and run pipeline
  const pipeline = createPipelineFromConfig(config);
  return pipeline(args);
}

// Register built-in readers
import { readCsv } from './readers/csv.js';
import { readJson } from './readers/json.js';
import { readTsv } from './readers/tsv.js';
import { readExcel } from './readers/excel.js';
import { readCSVStream } from './readers/stream/csvStream.js';
import { readJSONLStream } from './readers/stream/jsonStream.js';
import { ApiClient } from './readers/api/client.js';

registerReader('csv', ({ source, ...options }) => readCsv(source, options));
registerReader('json', ({ source, ...options }) => readJson(source, options));
registerReader('tsv', ({ source, ...options }) => readTsv(source, options));
registerReader('excel', ({ source, ...options }) => readExcel(source, options));
registerReader('csvStream', ({ source, ...options }) =>
  readCSVStream(source, options),
);
registerReader('jsonlStream', ({ source, ...options }) =>
  readJSONLStream(source, options),
);
registerReader(
  'api',
  ({ url, method = 'GET', baseUrl, headers, ...options }) => {
    const client = new ApiClient({ baseUrl, defaultHeaders: headers });
    return method.toUpperCase() === 'GET'
      ? client.fetchJson(url, options)
      : client.request(url, { method, ...options }).then((res) => res.json());
  },
);

// Register built-in writers
import { writeArrow } from './writers/arrow.js';

registerWriter('arrow', (data, { destination, ...options }) =>
  writeArrow(data, destination, options),
);
registerWriter('console', (data) => {
  console.log(data);
  return data;
});

/**
 * Example pipeline configuration:
 *
 * ```json
 * {
 *   "reader": {
 *     "type": "csv",
 *     "params": {
 *       "source": "data.csv",
 *       "header": true
 *     }
 *   },
 *   "transformers": [
 *     {
 *       "type": "filter",
 *       "params": {
 *         "predicate": "row.value > 0"
 *       }
 *     },
 *     {
 *       "type": "map",
 *       "params": {
 *         "transform": "{ ...row, value: row.value * 2 }"
 *       }
 *     },
 *     {
 *       "type": "sort",
 *       "params": {
 *         "key": "timestamp",
 *         "ascending": true
 *       }
 *     },
 *     {
 *       "type": "limit",
 *       "params": {
 *         "count": 1000
 *       }
 *     },
 *     {
 *       "type": "log",
 *       "params": {
 *         "message": "Processed data:",
 *         "detailed": true
 *       }
 *     },
 *     {
 *       "type": "toDataFrame"
 *     }
 *   ],
 *   "writer": {
 *     "type": "arrow",
 *     "params": {
 *       "destination": "output.arrow",
 *       "compression": "zstd"
 *     }
 *   }
 * }
 * ```
 */
