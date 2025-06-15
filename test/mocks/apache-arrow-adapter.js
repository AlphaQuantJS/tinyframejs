/**
 * Mock implementation of Apache Arrow adapter for testing
 * This provides a simplified version of the Apache Arrow functionality
 * to avoid warnings in tests while maintaining test coverage for both storage types
 */

// Simple mock of Arrow Vector
class MockArrowVector {
  constructor(data) {
    this._data = Array.isArray(data) ? [...data] : data;
    // Important marker that catches ArrowVector-wrapper
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

// Mock Table class
class Table {
  constructor(data) {
    this.data = data;
  }

  static new(columns) {
    return new Table(columns);
  }
}

// Mock data types
class Float64 {
  constructor() {
    this.typeId = 9; // Float64 type ID
  }
}

class Bool {
  constructor() {
    this.typeId = 10; // Bool type ID
  }
}

class DateMillisecond {
  constructor() {
    this.typeId = 11; // DateMillisecond type ID
  }
}

/**
 * Creates a mock Arrow vector from an array
 * @param {Array} array - The source array
 * @param dataType
 * @returns {MockArrowVector} - A mock Arrow vector
 */
export function vectorFromArray(array, dataType) {
  console.log('Mock Arrow vectorFromArray called with:', {
    arrayLength: array?.length,
    dataType,
  });
  return new MockArrowVector(array);
}

/**
 * Mock tableToIPC function
 * @param table
 * @param options
 */
export function tableToIPC(table, options) {
  console.log('Mock Arrow tableToIPC called');
  return Buffer.from(JSON.stringify(table.data || {}));
}

/**
 * Mock recordBatchStreamWriter function
 */
export function recordBatchStreamWriter() {
  console.log('Mock Arrow recordBatchStreamWriter called');
  return {
    pipe: (stream) => {
      console.log('Mock Arrow pipe called');
      return stream;
    },
    write: (data) => {
      console.log('Mock Arrow write called');
      return true;
    },
    end: () => {
      console.log('Mock Arrow end called');
    },
  };
}

// Notify that the mock is active
console.log('Mock Arrow adapter active');

// Export mock classes and functions
export { Table, Float64, Bool, DateMillisecond };

// Export default for compatibility
export default {
  vectorFromArray,
  tableToIPC,
  recordBatchStreamWriter,
  Table,
  Float64,
  Bool,
  DateMillisecond,
  // Add other necessary exports
  makeData: (data) => data,
  Codec: {
    ZSTD: 'zstd-codec',
    LZ4: 'lz4-codec',
  },
};
