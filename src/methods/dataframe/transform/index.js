/**
 * Index file for DataFrame transformation methods
 */

import { DataFrame } from '../../../core/dataframe/DataFrame.js';
import registerDataFrameTransform from './register.js';

// Register all transformation methods on DataFrame
registerDataFrameTransform(DataFrame);

export default registerDataFrameTransform;
