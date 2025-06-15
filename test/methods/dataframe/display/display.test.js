import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import { display } from '../../../../src/methods/dataframe/display/display.js';

// Mock the module
vi.mock('../../../../src/display/web/html.js', () => ({
  display: vi.fn(),
}));

// Import the mocked function after mocking
import { display as mockWebDisplay } from '../../../../src/display/web/html.js';

describe('DataFrame display method', () => {
  // Reset mock before each test
  beforeEach(() => {
    mockWebDisplay.mockReset();
  });

  describe('with standard storage', () => {
    // Create test data frame with people data for better readability in tests
    const testData = [
      { name: 'Alice', age: 25, city: 'New York' },
      { name: 'Bob', age: 30, city: 'Boston' },
      { name: 'Charlie', age: 35, city: 'Chicago' },
    ];

    // Create DataFrame using fromRecords
    const df = DataFrame.fromRecords(testData);

    it('should call the web display function with the frame', () => {
      // Call display function directly
      const displayFn = display();
      displayFn(df);

      // Check that the web display function was called with the frame
      expect(mockWebDisplay).toHaveBeenCalledWith(df, expect.any(Object));
    });

    it('should return the frame for method chaining', () => {
      // Call display function and check the return value
      const displayFn = display();
      const result = displayFn(df);

      // Check that the function returns the frame
      expect(result).toBe(df);
    });

    it('should pass options to the web display function', () => {
      // Call display function with options
      const displayFn = display();
      const options = {
        maxRows: 5,
        maxCols: 2,
        className: 'custom-table',
      };
      displayFn(df, options);

      // Check that the web display function was called with the options
      expect(mockWebDisplay).toHaveBeenCalledWith(df, options);
    });
  });
});
