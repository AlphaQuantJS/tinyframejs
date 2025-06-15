/**
 * Utilities for testing DataFrame with different storage types
 */

/**
 * List of storage types to test with
 * @type {string[]}
 */
export const storageTypes = ['standard', 'arrow'];

/**
 * Run a test suite with both storage types
 * @param {Function} testFn - Function to run tests with each storage type
 */
export function testWithBothStorageTypes(testFn) {
  storageTypes.forEach((storageType) => {
    testFn(storageType);
  });
}

/**
 * Create a DataFrame with the specified storage type
 * @param {Class} DataFrame - DataFrame class constructor
 * @param {Array} data - Data to create DataFrame from
 * @param {string} storageType - Storage type ('standard' or 'arrow')
 * @returns {DataFrame} - DataFrame instance with the specified storage type
 */
export function createDataFrameWithStorage(DataFrame, data, storageType) {
  const options = {};

  if (storageType === 'arrow') {
    options.preferArrow = true;
  }

  return DataFrame.fromRecords(data, options);
}
