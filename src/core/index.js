// src/core/index.js
// Export the public façade of the core layer
export { DataFrame } from './dataframe/DataFrame.js';
export { Series } from './dataframe/Series.js';
export { GroupBy } from './dataframe/GroupBy.js';

// Re‑export utils that may be needed by the user
export * as tfUtils from './utils/index.js';
