// src/io/readers/index.js

// Basic readers
export { readCsv, addCsvBatchMethods } from './csv.js';
export { readTsv, addTsvBatchMethods } from './tsv.js';
export { readExcel, addExcelBatchMethods } from './excel.js';
export { readJson, addJsonBatchMethods } from './json.js';
export { readSql, addSqlBatchMethods } from './sql.js';

// Stream readers
export { readCSVStream } from './stream/csvStream.js';
export { readJSONLStream } from './stream/jsonStream.js';
export * from './stream/index.js';

// API readers
export { fetchJson, fetchWithRetry } from './api/common.js';
export { ApiClient, createApiClient, defaultClient } from './api/client.js';

// Environment detection
export {
  detectEnvironment,
  isNodeJs,
  isDeno,
  isBun,
  isBrowser,
} from '../utils/environment.js';
