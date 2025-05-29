import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import {
  toJupyter,
  registerJupyterDisplay,
} from '../../../../src/methods/dataframe/display/toJupyter.js';

import {
  testWithBothStorageTypes,
  createDataFrameWithStorage,
} from '../../../utils/storageTestUtils.js';

// Mock the module
vi.mock('../../../../src/display/web/jupyter.js', () => ({
  toJupyter: vi.fn().mockReturnValue({
    'text/html': '<table></table>',
    'application/json': {},
  }),
  registerJupyterDisplay: vi.fn(),
}));

// Import the mocked functions after mocking
import {
  toJupyter as mockJupyterToJupyter,
  registerJupyterDisplay as mockRegisterJupyterDisplay,
} from '../../../../src/display/web/jupyter.js';

describe('DataFrame toJupyter method', () => {
  // Reset mocks before each test
  beforeEach(() => {
    mockJupyterToJupyter.mockClear();
    mockRegisterJupyterDisplay.mockClear();
  });

  // Run tests with both storage types
  testWithBothStorageTypes((storageType) => {
    describe(`with ${storageType} storage`, () => {
      // Create test data frame with people data for better readability in tests
      const testData = [
        { name: 'Alice', age: 25, city: 'New York' },
        { name: 'Bob', age: 30, city: 'Boston' },
        { name: 'Charlie', age: 35, city: 'Chicago' },
      ];

      // Create DataFrame with the specified storage type
      const df = createDataFrameWithStorage(DataFrame, testData, storageType);

      it('should call the Jupyter toJupyter function with the frame', () => {
        // Call toJupyter function directly
        const toJupyterFn = toJupyter();
        toJupyterFn(df);

        // Check that the Jupyter toJupyter function was called with the frame
        expect(mockJupyterToJupyter).toHaveBeenCalledWith(
          df,
          expect.any(Object),
        );
      });

      it('should return the result from the Jupyter toJupyter function', () => {
        // Call toJupyter function
        const toJupyterFn = toJupyter();
        const result = toJupyterFn(df);

        // Check that the function returns the expected result
        expect(result).toEqual({
          'text/html': '<table></table>',
          'application/json': {},
        });
      });

      it('should pass options to the Jupyter toJupyter function', () => {
        // Call toJupyter function with options
        const toJupyterFn = toJupyter();
        const options = {
          maxRows: 5,
          maxCols: 2,
          className: 'custom-table',
        };
        toJupyterFn(df, options);

        // Check that the Jupyter toJupyter function was called with the options
        expect(mockJupyterToJupyter).toHaveBeenCalledWith(df, options);
      });
    });
  });
});

describe('registerJupyterDisplay function', () => {
  it('should call the Jupyter registerJupyterDisplay function with the DataFrame class', () => {
    // Reset mock before test
    mockRegisterJupyterDisplay.mockClear();

    // Call registerJupyterDisplay function
    registerJupyterDisplay(DataFrame);

    // Check that the Jupyter registerJupyterDisplay function was called with the DataFrame class
    expect(mockRegisterJupyterDisplay).toHaveBeenCalledWith(DataFrame);
  });
});
