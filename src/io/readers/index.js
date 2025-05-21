// src/io/readers/index.js

export { readCsv, addCsvBatchMethods } from './csv.js';
export { readTsv, addTsvBatchMethods } from './tsv.js';
export { readExcel, addExcelBatchMethods } from './excel.js';
export { readJson, addJsonBatchMethods } from './json.js';
export { readSql, addSqlBatchMethods } from './sql.js';
export {
  detectEnvironment,
  isNodeJs,
  isDeno,
  isBun,
  isBrowser,
} from '../utils/environment.js';

// Note: API readers will be added in future versions
