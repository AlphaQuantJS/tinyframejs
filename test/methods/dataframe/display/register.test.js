/**
 * Unit tests for DataFrame display methods registration
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import registerDataFrameDisplay from '../../../../src/methods/dataframe/display/register.js';

describe('DataFrame Display Methods Registration', () => {
  beforeEach(() => {
    // Register display methods
    registerDataFrameDisplay(DataFrame);
  });

  it('should register all display methods on DataFrame prototype', () => {
    // Check that all display methods exist
    expect(typeof DataFrame.prototype.print).toBe('function');
    expect(typeof DataFrame.prototype.toHTML).toBe('function');
    expect(typeof DataFrame.prototype.toString).toBe('function');
    expect(typeof DataFrame.prototype.display).toBe('function');
    expect(typeof DataFrame.prototype.renderTo).toBe('function');
    expect(typeof DataFrame.prototype.toJupyter).toBe('function');
  });
});
