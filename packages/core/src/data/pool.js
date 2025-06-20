/**
 * Data method pool
 *
 * This file exports core data methods for DataFrame and Series
 *
 * @module data/pool
 */

// Import core classes
import { DataFrame } from './model/DataFrame.js';
import { Series } from './model/Series.js';

// DataFrame core methods
export const fromRecords = (records, opts) =>
  DataFrame.fromRecords(records, opts);
export const fromColumns = (columns, opts) =>
  DataFrame.fromColumns(columns, opts);
export const fromArrays = (arrays, columnNames, opts) =>
  DataFrame.fromArrays(arrays, columnNames, opts);
export const fromArrow = async (table, opts) =>
  await DataFrame.fromArrow(table, opts);

// Data manipulation methods
export const select = (df, names) => df.select(names);
export const drop = (df, names) => df.drop(names);
export const assign = (df, obj) => df.assign(obj);

// Conversion methods
export const toColumns = (df) => df.toColumns();
export const toArray = (df) => df.toArray();
export const toArrow = async (df) => await df.toArrow();

// Accessors
export const col = (df, name) => df.col(name);
export const get = (df, name) => df.get(name);
export const sum = (df, name) => df.sum(name);
export const getVector = (df, name) => df.getVector(name);

// Metadata
export const setMeta = (df, meta) => df.setMeta(meta);
export const getMeta = (df) => df.getMeta();

// Series methods
export const seriesGet = (series, index) => series.get(index);
export const seriesToArray = (series) => series.toArray();

// Organized method collections for extendDataFrame
export const dataframeMethods = {
  fromRecords,
  fromColumns,
  fromArrays,
  fromArrow,
  select,
  drop,
  assign,
  toColumns,
  toArray,
  toArrow,
  col,
  get,
  sum,
  getVector,
  setMeta,
  getMeta,
};

export const seriesMethods = {
  get: seriesGet,
  toArray: seriesToArray,
};
