// src/core/storage/types.js
/**
 * Канонические коды внутренних dtypes.
 * Используются при конвертации JS-массивов ➜ TypedArray или Arrow types.
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

  // Timestamp / Date (зарезервировано, пока не реализовано)
  TIMESTAMP_MS: 'ts_ms',
  DATE_DAY: 'date',

  // Дополнять при необходимости:
  // - 'dec128' для Decimal128
  // - 'list'   для Arrow ListVector
};
