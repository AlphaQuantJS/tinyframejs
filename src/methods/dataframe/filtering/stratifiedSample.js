/**
 * Selects stratified sample from DataFrame, preserving category proportions.
 *
 * @param {DataFrame} df - DataFrame instance
 * @param {string} stratifyColumn - Column name for stratification
 * @param {number} fraction - Fraction of rows to sample (0 < fraction <= 1)
 * @param {Object} [options] - Additional options
 * @param {number} [options.seed] - Seed for random number generator
 * @returns {DataFrame} - New DataFrame with sampled rows
 */
export const stratifiedSample = (
  df,
  stratifyColumn,
  fraction,
  options = {},
) => {
  // Validate input parameters
  if (!df.columns.includes(stratifyColumn)) {
    throw new Error(`Column '${stratifyColumn}' not found`);
  }

  if (fraction <= 0 || fraction > 1) {
    throw new Error('Fraction must be in the range (0, 1]');
  }

  // Get data from DataFrame
  const rows = df.toArray();
  if (rows.length === 0) {
    // Return an empty DataFrame with the same storage type
    return new df.constructor({});
  }

  // Group rows by categories
  const categories = {};
  rows.forEach((row) => {
    const category = row[stratifyColumn];
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(row);
  });

  // Create a random number generator with seed if specified
  const random =
    options.seed !== undefined ? createSeededRandom(options.seed) : Math.random;

  // Select rows from each category, preserving proportions
  const sampledRows = [];
  Object.entries(categories).forEach(([category, categoryRows]) => {
    // Calculate the number of rows to sample from this category
    let sampleSize = Math.round(categoryRows.length * fraction);

    // Ensure each category has at least one row
    sampleSize = Math.max(1, sampleSize);
    sampleSize = Math.min(categoryRows.length, sampleSize);

    // Shuffle rows and select the required number
    const shuffled = [...categoryRows].sort(() => 0.5 - random());
    sampledRows.push(...shuffled.slice(0, sampleSize));
  });

  // Create a new DataFrame from sampled rows
  return df.constructor.fromRecords(sampledRows);
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
 * Registers the stratifiedSample method on DataFrame prototype
 * @param {Class} DataFrame - DataFrame class to extend
 */
export const register = (DataFrame) => {
  DataFrame.prototype.stratifiedSample = function (
    stratifyColumn,
    fraction,
    options,
  ) {
    return stratifiedSample(this, stratifyColumn, fraction, options);
  };
};

export default { stratifiedSample, register };
