/**
 * Selects a random sample of rows from DataFrame
 *
 * @param {DataFrame} df - DataFrame instance
 * @param {number|Object} n - Number of rows to sample or options object
 * @param {Object} [options] - Additional options
 * @param {number} [options.seed] - Seed for random number generator
 * @param {boolean} [options.replace=false] - Sampling with replacement
 * @param {boolean} [options.fraction] - Fraction of rows to sample (0 < fraction <= 1)
 * @returns {DataFrame} - New DataFrame with sampled rows
 */
export const sample = (df, n, options = {}) => {
  // Handle case when n is an options object
  if (typeof n === 'object') {
    options = n;
    n = undefined;
  }

  // Get data from DataFrame
  const rows = df.toArray();
  if (rows.length === 0) {
    return new df.constructor({});
  }

  // Determine the number of rows to sample
  let sampleSize;
  if (options.fraction !== undefined) {
    if (options.fraction <= 0 || options.fraction > 1) {
      throw new Error('Fraction must be in the range (0, 1]');
    }
    sampleSize = Math.round(rows.length * options.fraction);
  } else {
    sampleSize = n !== undefined ? n : 1;
  }

  // Check the validity of the number of rows
  if (sampleSize <= 0) {
    throw new Error('Number of rows to sample must be a positive number');
  }

  // Check that the sample size is an integer
  if (!Number.isInteger(sampleSize)) {
    throw new Error('Number of rows to sample must be an integer');
  }

  // If sampling without replacement and sample size is greater than number of rows
  if (!options.replace && sampleSize > rows.length) {
    throw new Error(
      `Sample size (${sampleSize}) cannot be greater than number of rows (${rows.length})`,
    );
  }

  // Create a random number generator with seed if specified
  const random =
    options.seed !== undefined ? createSeededRandom(options.seed) : Math.random;

  // Select rows
  const sampledRows = [];
  if (options.replace) {
    // Sampling with replacement
    for (let i = 0; i < sampleSize; i++) {
      const index = Math.floor(random() * rows.length);
      sampledRows.push(rows[index]);
    }
  } else {
    // Sampling without replacement (using Fisher-Yates algorithm)
    const indices = Array.from({ length: rows.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    for (let i = 0; i < sampleSize; i++) {
      sampledRows.push(rows[indices[i]]);
    }
  }

  // Create a new DataFrame from sampled rows
  return df.constructor.fromRows(sampledRows);
};

/**
 * Creates a random number generator with seed
 * @param {number} seed - Seed for random number generator
 * @returns {Function} - Function returning pseudorandom number in range [0, 1)
 */
function createSeededRandom(seed) {
  return function () {
    // Simple linear congruential generator
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

/**
 * Registers the sample method on DataFrame prototype
 * @param {Class} DataFrame - DataFrame class to extend
 */
export const register = (DataFrame) => {
  DataFrame.prototype.sample = function (n, options) {
    return sample(this, n, options);
  };
};

export default { sample, register };
