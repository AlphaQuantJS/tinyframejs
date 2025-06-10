/**
 * Calculates the quantile value of a Series.
 *
 * @param {Series} series - Series instance
 * @param {number} q - Quantile to compute, must be between 0 and 1 inclusive
 * @returns {number|null} - Quantile value or null if no valid values
 */
export function quantile(series, q = 0.5) {
  // Validate q is between 0 and 1
  if (q < 0 || q > 1) {
    throw new Error('Quantile must be between 0 and 1 inclusive');
  }

  const values = series
    .toArray()
    .filter((v) => v !== null && v !== undefined && !Number.isNaN(v))
    .map(Number)
    .filter((v) => !Number.isNaN(v))
    .sort((a, b) => a - b);

  if (values.length === 0) return null;

  // Handle edge cases
  if (q === 0) return values[0];
  if (q === 1) return values[values.length - 1];

  // Calculate the position
  // For quantiles, we use the formula: q * (n-1) + 1
  // This is a common method for calculating quantiles (linear interpolation)
  const n = values.length;
  const pos = q * (n - 1);
  const base = Math.floor(pos);
  const rest = pos - base;

  // If the position is an integer, return the value at that position
  if (rest === 0) {
    return values[base];
  }

  // Otherwise, interpolate between the two surrounding values
  return values[base] + rest * (values[base + 1] - values[base]);
}

/**
 * Registers the quantile method on Series prototype
 * @param {Class} Series - Series class to extend
 */
export function register(Series) {
  if (!Series.prototype.quantile) {
    Series.prototype.quantile = function (q) {
      return quantile(this, q);
    };
  }
}

export default { quantile, register };
