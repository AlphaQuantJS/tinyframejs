/**
 * DataFrame indexing methods
 * @module methods/dataframe/indexing
 */

import { DataFrame } from '../../../core/dataframe/DataFrame.js';
import { registerDataFrameIndexing } from './register.js';

// Register all indexing methods on DataFrame
registerDataFrameIndexing(DataFrame);

// Export nothing as methods are attached to DataFrame prototype
export {};
