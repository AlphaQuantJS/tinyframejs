/* -------------------------------------------------------------- *
 |  DataFrame  →  filtering  ·  sample()                           |
 * -------------------------------------------------------------- */

/**
 * Returns a random sample of rows from a DataFrame.<br>
 * `df.sample(10)` → returns a new DataFrame with 10 randomly selected rows.<br>
 * `df.sample({ fraction: 0.1 })` → returns a sample of 10% of rows.
 *
 * @param {import('../../../data/model/DataFrame.js').DataFrame} df
 * @param {number|Object} n - Number of rows to sample or options object
 * @param {Object} [options] - Additional options
 * @param {number} [options.seed] - Seed for random number generator
 * @param {boolean} [options.replace=false] - Sample with replacement
 * @param {number} [options.fraction] - Fraction of rows to sample (0 < fraction <= 1)
 * @returns {DataFrame} - New DataFrame with sampled rows
 * @throws {Error} If sampling parameters are invalid
 */
export function sample(df, n, options = {}) {
  // Handle case when n is an options object
  if (typeof n === 'object') {
    options = n;
    n = undefined;
  }

  // Get data from DataFrame
  const rows = df.toArray();
  if (rows.length === 0) {
    // For empty DataFrame, return an empty DataFrame with the same structure
    const builder =
      typeof df.constructor.fromRecords === 'function'
        ? df.constructor.fromRecords
        : (rows) => new df.constructor(rows);
    
    return builder([]);
  }

  // Determine sample size
  let sampleSize;
  if (options.fraction !== undefined) {
    if (options.fraction <= 0 || options.fraction > 1) {
      throw new Error('Fraction must be in the range (0, 1]');
    }
    sampleSize = Math.round(rows.length * options.fraction);
  } else {
    sampleSize = n !== undefined ? n : 1;
  }

  // Validate sample size
  if (sampleSize <= 0) {
    throw new Error('Number of rows to sample must be a positive integer');
  }

  // Check that sample size is an integer
  if (!Number.isInteger(sampleSize)) {
    throw new Error('Number of rows to sample must be an integer');
  }

  // If sampling without replacement and sample size is greater than number of rows
  if (!options.replace && sampleSize > rows.length) {
    throw new Error(
      `Sample size (${sampleSize}) cannot be greater than number of rows (${rows.length})`
    );
  }

  // Create random number generator with seed if specified
  const random =
    options.seed !== undefined ? createSeededRandom(options.seed) : Math.random;

  // Sample rows
  const sampledRows = [];
  if (options.replace) {
    // Sampling with replacement
    for (let i = 0; i < sampleSize; i++) {
      const index = Math.floor(random() * rows.length);
      sampledRows.push(rows[index]);
    }
  } else {
    // Sampling without replacement (using Fisher-Yates shuffle algorithm)
    const indices = Array.from({ length: rows.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    for (let i = 0; i < sampleSize; i++) {
      sampledRows.push(rows[indices[i]]);
    }
  }

  // Create a new DataFrame from the sampled rows
  const builder =
    typeof df.constructor.fromRecords === 'function'
      ? df.constructor.fromRecords
      : (rows) => new df.constructor(rows);

  return builder(sampledRows);
}

/**
 * Creates a seeded random number generator
 * 
 * @param {number} seed - Seed for the random number generator
 * @returns {Function} - Function that returns a pseudo-random number in the range [0, 1)
 * @private
 */
function createSeededRandom(seed) {
  return function () {
    // Simple linear congruential generator
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

/* -------------------------------------------------------------- *
 |  Pool for extendDataFrame                                       |
 * -------------------------------------------------------------- */
export default { sample };
