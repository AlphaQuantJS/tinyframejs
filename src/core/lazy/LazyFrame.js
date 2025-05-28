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

  /** @param {DataFrame} df */
  static fromDataFrame(df) {
    return new LazyFrame([{ op: 'source', df }]);
  }

  /* -------------------------------------------------- *
   *  Transformations (lazy)                             *
   * -------------------------------------------------- */

  /** @param {(row:any)=>boolean} fn */
  filter(fn) {
    return new LazyFrame([...this._plan, { op: 'filter', fn }]);
  }

  /** @param {string[]} cols */
  select(cols) {
    return new LazyFrame([...this._plan, { op: 'select', cols }]);
  }

  /**
   * Returns first n rows
   * @param n
   */
  head(n = 5) {
    return new LazyFrame([...this._plan, { op: 'head', n }]);
  }

  /**
   * Arbitrary function over DataFrame → DataFrame
   * @param {(df:DataFrame)=>DataFrame} fn
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
   */
  collect() {
    let df = this._plan[0].df; // source DataFrame

    for (const step of this._plan.slice(1)) {
      switch (step.op) {
      case 'filter':
        df = DataFrame.fromRows(df.toArray().filter(step.fn));
        break;

      case 'select':
        df = df.select(step.cols);
        break;

      case 'head':
        df = DataFrame.fromRows(df.toArray().slice(0, step.n));
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

  /** alias to collect() for symmetry with Polars */
  execute() {
    return this.collect();
  }

  /** Debug print of the plan */
  toString() {
    return `LazyFrame(steps: ${this._plan.length - 1})`;
  }
}
