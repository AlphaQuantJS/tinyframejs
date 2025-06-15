// src/core/dataframe/DataFrame.js
import { Series } from './Series.js';

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
      // Re-use Series or wrap raw data
      this._columns[name] =
        data[name] instanceof Series
          ? data[name]
          : new Series(data[name], { name, ...opts });
    }
    Object.freeze(this._order);

    /* -------------------------------------------------- *
     *  Internal helper (used by tests / plugins)         *
     * -------------------------------------------------- */
    Object.defineProperty(this, 'frame', {
      enumerable: false,
      configurable: false,
      value: {
        /**
         * low-level vector getter (internal)
         * @param {string} n - Column name
         * @returns {import('../storage/ColumnVector.js').ColumnVector|undefined} - Column vector or undefined if not found
         */
        getColumn: (n) => this._columns[n]?.vector,
      },
    });
  }

  /* ------------------------------------------------------------------ *
   *  Factory helpers                                                   *
   * ------------------------------------------------------------------ */

  static create = (cols, opts = {}) => new DataFrame(cols, opts);
  static fromColumns = (cols, opts = {}) => new DataFrame(cols, opts);

  static fromRecords(rows = [], opts = {}) {
    if (!rows.length) return new DataFrame({}, opts);
    const cols = {};
    for (const k of Object.keys(rows[0])) cols[k] = rows.map((r) => r[k]);
    return new DataFrame(cols, opts);
  }

  static fromArrow(table) {
    const cols = {};
    for (const f of table.schema.fields)
      cols[f.name] = table.getColumn(f.name).toArray();
    return new DataFrame(cols, { preferArrow: true });
  }

  /* ------------------------------------------------------------------ *
   *  Export helpers                                                    *
   * ------------------------------------------------------------------ */

  toColumns() {
    const out = {};
    for (const n of this._order) out[n] = this._columns[n].toArray();
    return out;
  }

  async toArrow() {
    const { tableFromArrays } = await import('apache-arrow');
    const arrays = {};
    for (const n of this._order) {
      const v = this._columns[n].vector;
      arrays[n] = v._arrow ?? v._data; // ArrowVector | TypedArray
    }
    return tableFromArrays(arrays);
  }

  /* ------------------------------------------------------------------ *
   *  Accessors                                                         *
   * ------------------------------------------------------------------ */

  get rowCount() {
    return this._columns[this._order[0]]?.length ?? 0;
  }
  get columns() {
    return [...this._order];
  }

  col = (n) => this._columns[n];
  get = (n) => this._columns[n];
  sum = (n) => this.col(n).sum();
  /**
   * low-level vector getter
   * @param {string} n - Column name
   * @returns {import('../storage/ColumnVector.js').ColumnVector|undefined} - Column vector or undefined if not found
   */
  getVector = (n) => this._columns[n]?.vector;

  /* ------------------------------------------------------------------ *
   *  Column-level helpers (select / drop / assign)                     *
   * ------------------------------------------------------------------ */

  select(names) {
    const cols = {};
    for (const n of names) cols[n] = this._columns[n].toArray();
    return new DataFrame(cols);
  }

  drop(names) {
    const keep = this.columns.filter((c) => !names.includes(c));
    return this.select(keep);
  }

  assign(obj) {
    const merged = this.toColumns();
    for (const [k, v] of Object.entries(obj))
      merged[k] = v instanceof Series ? v.toArray() : v;
    return new DataFrame(merged);
  }

  /* ------------------------------------------------------------------ *
   *  Conversion to row array                                           *
   * ------------------------------------------------------------------ */

  toArray() {
    if (!this._order.length) return [];
    const len = this.rowCount;
    const rows = Array.from({ length: len }, (_, i) => {
      const r = {};
      for (const n of this._order) r[n] = this._columns[n].get(i);
      return r;
    });
    return rows;
  }

  /* ------------------------------------------------------------------ *
   *  Lazy & meta                                                       *
   * ------------------------------------------------------------------ */

  lazy = () =>
    import('../lazy/LazyFrame.js').then((m) => m.LazyFrame.fromDataFrame(this));

  /**
   * Set metadata for the DataFrame
   * @param {any} m - Metadata to set
   * @returns {DataFrame} - This DataFrame for chaining
   */
  setMeta = (m) => ((this._meta = m), this);

  /**
   * Get metadata for the DataFrame
   * @returns {any} - DataFrame metadata or empty object if not set
   */
  getMeta = () => this._meta ?? {};

  /**
   * Optimize storage for operation
   * @param {string} op - Operation to optimize for
   * @returns {Promise<DataFrame>} - Optimized DataFrame
   */
  async optimizeFor(op) {
    const { switchStorage } = await import('../strategy/storageStrategy.js');
    return switchStorage(this, op);
  }

  /* ------------------------------------------------------------------ *
   *  Simple render helpers                                             *
   * ------------------------------------------------------------------ */

  toHTML() {
    const head = this.columns.map((n) => `<th>${n}</th>`).join('');
    const body = this.toArray()
      .map(
        (row) =>
          '<tr>' +
          this.columns.map((n) => `<td>${row[n]}</td>`).join('') +
          '</tr>',
      )
      .join('');
    return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
  }

  toMarkdown() {
    const header = '| ' + this.columns.join(' | ') + ' |';
    const divider = '| ' + this.columns.map(() => '---').join(' | ') + ' |';
    const rows = this.toArray().map(
      (r) => '| ' + this.columns.map((n) => r[n]).join(' | ') + ' |',
    );
    return [header, divider, ...rows].join('\n');
  }
}
