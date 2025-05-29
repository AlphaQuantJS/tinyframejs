/**
 * Mock implementation of Apache Arrow adapter for testing
 * This provides a simplified version of the Apache Arrow functionality
 * to avoid warnings in tests while maintaining test coverage for both storage types
 */

// Simple mock of Arrow Vector
class MockArrowVector {
  constructor(data) {
    this._data = Array.isArray(data) ? [...data] : data;
    this.isArrow = true;
  }

  get(index) {
    return this._data[index];
  }

  toArray() {
    return Array.isArray(this._data) ? this._data : Array.from(this._data);
  }

  get length() {
    return this._data.length;
  }
}

/**
 * Creates a mock Arrow vector from an array
 * @param {Array} array - The source array
 * @returns {MockArrowVector} - A mock Arrow vector
 */
function vectorFromArray(array) {
  return new MockArrowVector(array);
}

module.exports = {
  vectorFromArray,
};
