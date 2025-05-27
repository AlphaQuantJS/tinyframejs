// src/core/dataframe/DataFrame.js
import { Series } from './Series.js';
import { VectorFactory } from '../storage/VectorFactory.js';
import { shouldUseArrow } from '../strategy/shouldUseArrow.js';

export class DataFrame {
  /**
   * @param {Record<string, Array|TypedArray>} data – source columns
   * @param {object} [opts] – { preferArrow?: boolean }
   */
  constructor(data = {}, opts = {}) {
    /** @type {Record<string, Series>} */
    this._columns = {};
    /** @type {string[]} */
    this._order = Object.keys(data);

    for (const name of this._order) {
      // If data is already a Series, use it directly
      if (data[name] instanceof Series) {
        this._columns[name] = data[name];
      } else {
        // Otherwise create a new Series
        this._columns[name] = new Series(data[name], {
          name,
          ...opts,
        });
      }
    }
    Object.freeze(this._order);
  }

  /* ------------------------------------------------------------------ *
   *  Factories (static methods)                                        *
   * ------------------------------------------------------------------ */

  static create(cols, opts = {}) {
    return new DataFrame(cols, opts);
  }
  static fromColumns(cols, opts = {}) {
    return new DataFrame(cols, opts);
  }

  /**
   * Array of objects → DataFrame
   * @param rows
   * @param opts
   */
  static fromRows(rows = [], opts = {}) {
    if (!rows.length) return new DataFrame({}, opts);
    const keys = Object.keys(rows[0] || {});
    const cols = {};
    for (const k of keys) cols[k] = rows.map((r) => r[k]);
    return new DataFrame(cols, opts);
  }

  /**
   * Apache Arrow Table → DataFrame
   * @param table
   */
  static fromArrow(table) {
    const cols = {};
    for (const field of table.schema.fields) {
      cols[field.name] = table.getColumn(field.name).toArray();
    }
    return new DataFrame(cols, { preferArrow: true });
  }

  /* ------------------------------------------------------------------ *
   *  Data Export                                                       *
   * ------------------------------------------------------------------ */

  /** DataFrame → { col: Array } */
  toColumns() {
    const out = {};
    for (const name of this._order) out[name] = this._columns[name].toArray();
    return out;
  }

  /** DataFrame → Arrow.Table (if lib is available) */
  toArrow() {
    const { tableFromArrays } = require('apache-arrow');
    const arrays = {};
    for (const name of this._order) {
      const vec = this._columns[name].vector;
      arrays[name] = vec._arrow ?? vec._data; // ArrowVector | TypedArray
    }
    return tableFromArrays(arrays);
  }

  /* ------------------------------------------------------------------ *
   *  Getters and quick accessors                                       *
   * ------------------------------------------------------------------ */

  get rowCount() {
    return this._columns[this._order[0]]?.length ?? 0;
  }
  get columns() {
    return [...this._order];
  }

  col(name) {
    return this._columns[name];
  }
  sum(name) {
    return this.col(name).sum();
  }

  /* ------------------------------------------------------------------ *
   *  DataFrame operations                                               *
   * ------------------------------------------------------------------ */

  /**
   * Returns a new DataFrame with a subset of columns
   * @param names
   */
  select(names) {
    const subset = {};
    for (const n of names) subset[n] = this._columns[n].toArray();
    return new DataFrame(subset);
  }

  /**
   * Remove specified columns
   * @param names
   */
  drop(names) {
    const keep = {};
    for (const n of this._order)
      if (!names.includes(n)) keep[n] = this._columns[n].toArray();
    return new DataFrame(keep);
  }

  /**
   * Add / replace columns.
   * @param {Record<string, Array|TypedArray|Series>} obj
   */
  assign(obj) {
    const merged = this.toColumns(); // existing columns
    for (const [k, v] of Object.entries(obj)) {
      merged[k] = v instanceof Series ? v.toArray() : v;
    }
    return new DataFrame(merged);
  }

  /* ------------------------------------------------------------------ *
   *  Convert to array of rows (row-wise)                               *
   * ------------------------------------------------------------------ */

  toArray() {
    // If there are no columns, return an empty array
    if (!this._order.length) return [];

    const out = [];
    const len = this.rowCount;
    for (let i = 0; i < len; i++) {
      const row = {};
      for (const name of this._order) {
        row[name] = this._columns[name].get(i);
      }
      out.push(row);
    }
    return out;
  }

  /* ------------------------------------------------------------------ *
   *  Lazy API                                                          *
   * ------------------------------------------------------------------ */

  /** @returns {Promise<LazyFrame>} */
  lazy() {
    return import('../lazy/LazyFrame.js').then((m) =>
      m.LazyFrame.fromDataFrame(this),
    );
  }

  /* ------------------------------------------------------------------ *
   *  Visualization                                                     *
   * ------------------------------------------------------------------ */

  /**
   * Output as HTML table (for Jupyter-like UI)
   * @returns {string} HTML string
   */
  toHTML() {
    const headers = this.columns.map((name) => `<th>${name}</th>`).join('');
    const rows = this.toArray()
      .map((row) => {
        const cells = this.columns
          .map((name) => `<td>${row[name]}</td>`)
          .join('');
        return `<tr>${cells}</tr>`;
      })
      .join('');
    return `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
  }

  /**
   * Output as Markdown table (for .md reports)
   * @returns {string} Markdown table string
   */
  toMarkdown() {
    const header = '| ' + this.columns.join(' | ') + ' |';
    const divider = '| ' + this.columns.map(() => '---').join(' | ') + ' |';
    const rows = this.toArray().map(
      (row) => '| ' + this.columns.map((name) => row[name]).join(' | ') + ' |',
    );
    return [header, divider, ...rows].join('\n');
  }

  /* ------------------------------------------------------------------ *
   *  DataFrame operations                                               *
   * ------------------------------------------------------------------ */

  /**
   * Select subset of columns (select)
   * @param names
   */
  select(names) {
    const selected = {};
    for (const name of names) {
      selected[name] = this.col(name).toArray();
    }
    return new DataFrame(selected);
  }

  /**
   * Remove specified columns (drop)
   * @param names
   */
  drop(names) {
    const remaining = this.columns.filter((name) => !names.includes(name));
    return this.select(remaining);
  }

  /**
   * Add or update columns
   * @param obj
   */
  assign(obj) {
    const updated = this.toColumns();
    for (const key in obj) updated[key] = obj[key];
    return new DataFrame(updated);
  }

  /**
   * Insert metadata
   * @param meta
   */
  setMeta(meta) {
    this._meta = meta;
    return this;
  }

  getMeta() {
    return this._meta ?? {};
  }

  /**
   * Optimize storage for operation
   * @param op
   */
  async optimizeFor(op) {
    const { switchStorage } = await import('../strategy/storageStrategy.js');
    return switchStorage(this, op);
  }
}
