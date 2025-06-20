// src/core/strategy/shouldUseArrow.js

/**
 * Heuristics that decide whether to store a column in Apache Arrow format.
 * Rules are chosen so that Arrow is used only where it really brings
 * memory/efficiency/compatibility benefits.
 *
 * @param {Array|TypedArray|import('apache-arrow').Vector} data  – source data
 * @param {object} [opts]   – additional flags:
 *   { preferArrow?: boolean, alwaysArrow?: boolean, neverArrow?: boolean }
 * @returns {boolean}       – true → use ArrowVector, false → TypedArrayVector
 */
export function shouldUseArrow(data, opts = {}) {
  // ─────────────────────────────────────────────────────
  // 1. User flags have highest priority
  // ─────────────────────────────────────────────────────
  if (opts.alwaysArrow) return true;
  if (opts.neverArrow) return false;
  if (typeof opts.preferArrow === 'boolean') return opts.preferArrow;

  // ─────────────────────────────────────────────────────
  // 2. If already Arrow.NativeVector or ArrowVector wrapper
  // ─────────────────────────────────────────────────────
  if (data?.isArrow || data?._isArrowVector) return true;

  // ─────────────────────────────────────────────────────
  // 3. If this is TypedArray – already optimal, Arrow «not needed»
  // ─────────────────────────────────────────────────────
  if (ArrayBuffer.isView(data)) return false;

  // ─────────────────────────────────────────────────────
  // Check if data is an array or array-like object with length
  // ─────────────────────────────────────────────────────
  if (!data || typeof data !== 'object') return false;

  // Check if data has a length property
  const size = data.length ?? 0;
  if (size === 0) return false;

  // Check for very large arrays directly - this is a high priority rule
  if (size > 1_000_000) return true;

  // Only process Arrays for content analysis, not other iterables like Set/Map
  if (!Array.isArray(data)) return false;

  // ─────────────────────────────────────────────────────
  // 5. Regular JS array – analyze contents
  // ─────────────────────────────────────────────────────
  let hasNulls = false;
  let hasString = false;
  let numeric = true;

  for (const v of data) {
    if (v === null || v === undefined || Number.isNaN(v)) hasNulls = true;
    else if (typeof v === 'string') {
      hasString = true;
      numeric = false;
    } else if (typeof v !== 'number') numeric = false;

    // Fast exit if already found string and null
    if (hasString && hasNulls) break;
  }

  // Main conditions:
  //  • string data                       → Arrow
  //  • null/NaN when non-numeric type      → Arrow
  //  • otherwise – leave as TypedArray (or Float64Array)
  //  • Note: very large arrays (> 1e6) are checked earlier
  return hasString || (hasNulls && !numeric);
}
