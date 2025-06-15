// src/core/lazy/LazyFrame.js
import { DataFrame } from '../dataframe/DataFrame.js';

/**
 * Simple lazy-evaluated wrapper over DataFrame.
 * Stores a DAG plan of operations, executes them only when collect() is called.
 *
 * ⚠️  First iteration - supports filter / select / map / head,
 *     as well as custom user-defined step via .apply(df => ...)
 */
export class LazyFrame {
  /** @param {Array<Object>} plan - array of steps { op, args... } */
  constructor(plan) {
    this._plan = plan;
  }

  /* -------------------------------------------------- *
   *  Creation                                           *
   * -------------------------------------------------- */

  /**
   * Create a LazyFrame from a DataFrame
   * @param {DataFrame} df - Source DataFrame
   * @returns {LazyFrame} New LazyFrame instance
   */
  static fromDataFrame(df) {
    return new LazyFrame([{ op: 'source', df }]);
  }

  /* -------------------------------------------------- *
   *  Transformations (lazy)                             *
   * -------------------------------------------------- */

  /**
   * Filter rows based on a predicate function
   * @param {(row:any)=>boolean} fn - Filter predicate
   * @returns {LazyFrame} New LazyFrame with filter operation added
   */
  filter(fn) {
    return new LazyFrame([...this._plan, { op: 'filter', fn }]);
  }

  /**
   * Select columns to keep
   * @param {string[]} cols - Column names to select
   * @returns {LazyFrame} New LazyFrame with select operation added
   */
  select(cols) {
    return new LazyFrame([...this._plan, { op: 'select', cols }]);
  }

  /**
   * Returns first n rows
   * @param {number} n - Number of rows to return
   * @returns {LazyFrame} New LazyFrame with head operation added
   */
  head(n = 5) {
    return new LazyFrame([...this._plan, { op: 'head', n }]);
  }

  /**
   * Arbitrary function over DataFrame → DataFrame
   * @param {(df:DataFrame)=>DataFrame} fn - Transform function
   * @returns {LazyFrame} New LazyFrame with apply operation added
   */
  apply(fn) {
    return new LazyFrame([...this._plan, { op: 'apply', fn }]);
  }

  /* -------------------------------------------------- *
   *  Execution                                          *
   * -------------------------------------------------- */

  /**
   * Executes the plan and returns an actual DataFrame.
   * Materializes DataFrame at each iteration; for production
   * an optimizer can be inserted to combine steps.
   * @returns {DataFrame} Materialized DataFrame after executing all operations
   */
  collect() {
    let df = this._plan[0].df; // source DataFrame

    for (const step of this._plan.slice(1)) {
      switch (step.op) {
        case 'filter':
          df = DataFrame.fromRecords(df.toArray().filter(step.fn));
          break;

        case 'select':
          df = df.select(step.cols);
          break;

        case 'head':
          df = DataFrame.fromRecords(df.toArray().slice(0, step.n));
          break;

        case 'apply':
          df = step.fn(df);
          break;

        default:
          throw new Error(`LazyFrame: unknown operation '${step.op}'`);
      }
    }
    return df;
  }

  /* -------------------------------------------------- *
   *  Syntactic sugar                                    *
   * -------------------------------------------------- */

  /**
   * Alias to collect() for symmetry with Polars
   * @returns {DataFrame} Materialized DataFrame after executing all operations
   */
  execute() {
    return this.collect();
  }

  /**
   * Debug print of the plan
   * @returns {string} String representation of the LazyFrame
   */
  toString() {
    return `LazyFrame(steps: ${this._plan.length - 1})`;
  }
}
