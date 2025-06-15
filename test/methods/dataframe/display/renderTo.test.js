import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import { renderTo } from '../../../../src/methods/dataframe/display/renderTo.js';

// Mock the module
vi.mock('../../../../src/display/web/html.js', () => ({
  renderTo: vi.fn(),
}));

// Import the mocked function after mocking
import { renderTo as mockWebRenderTo } from '../../../../src/display/web/html.js';

describe('DataFrame renderTo method', () => {
  // Reset mock before each test
  beforeEach(() => {
    mockWebRenderTo.mockReset();
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

    // Mock DOM element
    const mockElement = { id: 'test-element' };

    it('should call the web renderTo function with the frame and element', () => {
      // Call renderTo function directly
      const renderToFn = renderTo();
      renderToFn(df, mockElement);

      // Check that the web renderTo function was called with the frame and element
      expect(mockWebRenderTo).toHaveBeenCalledWith(
        df,
        mockElement,
        expect.any(Object),
      );
    });

    it('should return the frame for method chaining', () => {
      // Call renderTo function and check the return value
      const renderToFn = renderTo();
      const result = renderToFn(df, mockElement);

      // Check that the function returns the frame
      expect(result).toBe(df);
    });

    it('should pass options to the web renderTo function', () => {
      // Call renderTo function with options
      const renderToFn = renderTo();
      const options = {
        maxRows: 5,
        maxCols: 2,
        className: 'custom-table',
      };
      renderToFn(df, mockElement, options);

      // Check that the web renderTo function was called with the options
      expect(mockWebRenderTo).toHaveBeenCalledWith(df, mockElement, options);
    });
  });
});
