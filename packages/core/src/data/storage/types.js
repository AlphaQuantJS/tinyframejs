// src/core/storage/types.js
/**
 * Canonical codes for internal dtypes.
 * Used when converting JS arrays ➜ TypedArray or Arrow types.
 */
export const DType = {
  // Float
  FLOAT64: 'f64',
  FLOAT32: 'f32',

  // Signed integers
  INT32: 'i32',
  INT16: 'i16',
  INT8: 'i8',

  // Unsigned integers
  UINT32: 'u32',
  UINT16: 'u16',
  UINT8: 'u8',

  // Boolean
  BOOL: 'bool',

  // String / categorical
  STRING: 'str',

  // Timestamp / Date (reserved, not implemented yet)
  TIMESTAMP_MS: 'ts_ms',
  DATE_DAY: 'date',

  // To be extended:
  // - 'dec128' for Decimal128
  // - 'list'   for Arrow ListVector
};
