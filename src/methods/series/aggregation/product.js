/**
 * Calculates the product of values in a Series.
 *
 * @param {Series} series - Series instance
 * @returns {number|null} - Product of values or null if no valid values
 */
export function product(series) {
  const values = series.toArray();
  if (values.length === 0) return null;

  // Filter only numeric values (not null, not undefined, not NaN)
  const numericValues = values
    .filter(
      (value) =>
        value !== null && value !== undefined && !Number.isNaN(Number(value)),
    )
    .map(Number)
    .filter((v) => !Number.isNaN(v));

  // If there are no numeric values, return null
  if (numericValues.length === 0) return null;

  // Calculate the product
  return numericValues.reduce((product, value) => product * value, 1);
}

/**
 * Registers the product method on Series prototype
 * @param {Class} Series - Series class to extend
 */
export function register(Series) {
  if (!Series.prototype.product) {
    Series.prototype.product = function () {
      return product(this);
    };
  }
}

export default { product, register };
