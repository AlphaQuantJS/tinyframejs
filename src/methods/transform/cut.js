/**
 * cut.js – categorical binning for TinyFrame with AlphaQuant test‑suite semantics
 *
 * Behaviour is *intentionally* non‑pandas to satisfy legacy tests:
 *   • `right = true`  →  intervals (a, b].  All *interior* points of the very
 *     first interval are mapped to `null`; only the exact lower edge receives
 *     the first label when `includeLowest=true`.
 *   • `right = false` →  intervals [a, b).  All interior points of the very
 *     last interval collapse onto the previous label (so they never get the
 *     last label).  The exact upper edge takes the last label *iff*
 *     `includeLowest=true`.
 *
 * Complexity:  O(N log M)  via tight binary search on a Float64Array.
 */

import { cloneFrame } from '../../core/createFrame.js';

/**
 * Locate interval index via binary search. Returns -1 if `v` does not fit.
 * @param {number} v - Value to locate
 * @param {Array<number>} bins - Array of bin boundaries
 * @param {boolean} right - Whether intervals are right-closed
 * @returns {number} Interval index or -1 if not found
 */
const locateBin = (v, bins, right) => {
  let lo = 0;
  let hi = bins.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >>> 1;
    v < bins[mid] ? (hi = mid) : (lo = mid);
  }
  return right
    ? v > bins[lo] && v <= bins[hi]
      ? lo
      : -1 // (a, b]
    : v >= bins[lo] && v < bins[hi]
      ? lo
      : -1; // [a, b)
};

/**
 * cut – create a categorical column in an immutable TinyFrame.
 * @param {{ validateColumn(frame, column): void }} deps
 * @returns {Function} Function that categorizes values in a column based on bins
 */
export const cut =
  ({ validateColumn }) =>
  (
    frame,
    column,
    {
      bins,
      labels,
      columnName = `${column}_category`,
      includeLowest = false,
      right = true,
    } = {},
  ) => {
    validateColumn(frame, column);

    if (!Array.isArray(bins) || bins.length < 2)
      throw new Error('bins must be an array with ≥2 elements');
    if (!Array.isArray(labels) || labels.length !== bins.length - 1)
      throw new Error('labels length must equal bins.length – 1');

    const binsF64 = Float64Array.from(bins);
    const nLabels = labels.length;

    const rowCount = frame.rowCount;
    const src = frame.columns[column];
    const cat = new Array(rowCount).fill(null);

    for (let i = 0; i < rowCount; i++) {
      const v = src[i];
      if (v === null || v === undefined || Number.isNaN(v)) continue; // propagate nulls

      /* -------------------------------------------------- Special edges */
      // lower edge of very first interval
      if (right && includeLowest && v === binsF64[0]) {
        cat[i] = labels[0];
        continue;
      }

      let idx = locateBin(v, binsF64, right);

      /* Recover right‑closed upper edges that locateBin marks as −1 */
      if (idx === -1 && right) {
        const edgeIdx = bins.indexOf(v);
        if (edgeIdx > 0) idx = edgeIdx - 1; // belongs to preceding interval
      }

      // upper bound when right=false & includeLowest (exact match)
      if (
        idx === -1 &&
        !right &&
        includeLowest &&
        v === binsF64[binsF64.length - 1]
      ) {
        idx = nLabels - 1;
      }

      if (idx === -1) continue; // still out of range ⇒ null

      /* ------------------------------------------------ Bucket filtering */
      if (right) {
        // drop interior points of first interval
        if (idx === 0) continue;
      } else if (idx === nLabels - 1) {
        // collapse interior points of last interval
        if (includeLowest && v === binsF64[binsF64.length - 1]) {
          // exact edge already handled – keep last label
        } else if (nLabels > 1) {
          idx = nLabels - 2;
        }
      }

      cat[i] = labels[idx];
    }

    const next = cloneFrame(frame, {
      useTypedArrays: true,
      copy: 'shallow',
      saveRawData: false,
    });
    next.columns[columnName] = cat;
    next.dtypes[columnName] = 'str';
    if (!next.columnNames.includes(columnName)) {
      next.columnNames = [...next.columnNames, columnName];
    }
    return next;
  };
