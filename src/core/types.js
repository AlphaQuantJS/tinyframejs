/**
 * @typedef {'f64'|'f32'|'i32'|'i16'|'i8'|'u32'|'u16'|'u8'|'bool'|'str'} DType
 */

/**
 * @typedef {Object} TinyFrameOptions
 * @property {boolean} [useTypedArrays=true]   Convert numeric columns to the tightest TypedArray
 * @property {boolean} [saveRawData=false]     Store a lazily materialised copy of raw input
 * @property {'none'|'shallow'|'deep'} [copy='shallow']   Control column copy policy
 * @property {boolean} [freeze=false]          Freeze resulting frame to prevent accidental mutation
 */

/**
 * @typedef {Object} TinyFrame
 * @property {Record<string, Array<any>|TypedArray>} columns
 * @property {number} rowCount
 * @property {string[]} columnNames
 * @property {Record<string,DType>} dtypes
 */
