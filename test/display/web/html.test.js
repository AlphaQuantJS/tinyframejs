/**
 * Unit tests for HTML display
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { toHTML, display, renderTo } from '../../../src/display/web/html.js';
import { DataFrame } from '../../../src/core/dataframe/DataFrame.js';

// Test data to be used in all tests
const testData = [
  { name: 'Alice', age: 25, city: 'New York' },
  { name: 'Bob', age: 30, city: 'Boston' },
  { name: 'Charlie', age: 35, city: 'Chicago' },
  { name: 'David', age: 40, city: 'Denver' },
  { name: 'Eve', age: 45, city: 'El Paso' },
];

describe('HTML Display', () => {
  // Create a DataFrame for testing
  const df = DataFrame.create(testData);

  // Create a TinyFrame-like object for testing
  const frame = {
    columns: {
      name: testData.map((d) => d.name),
      age: testData.map((d) => d.age),
      city: testData.map((d) => d.city),
    },
    rowCount: testData.length,
  };

  describe('toHTML function', () => {
    it('should generate HTML table string', () => {
      const html = toHTML(frame);

      // Check that the output is a string
      expect(typeof html).toBe('string');

      // Check that the output contains HTML table tags
      expect(html).toContain('<table');
      expect(html).toContain('</table>');

      // Check that the output contains column headers
      expect(html).toContain('<th>name</th>');
      expect(html).toContain('<th>age</th>');
      expect(html).toContain('<th>city</th>');

      // Check that the output contains data
      expect(html).toContain('Alice');
      expect(html).toContain('25');
      expect(html).toContain('New York');
    });

    it('should respect maxRows option', () => {
      // Create a frame with many rows
      const largeData = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        value: i * 10,
      }));

      const largeFrame = {
        columns: {
          id: largeData.map((d) => d.id),
          value: largeData.map((d) => d.value),
        },
        rowCount: largeData.length,
      };

      const html = toHTML(largeFrame, { maxRows: 5 });

      // Check that the output contains message about additional rows
      expect(html).toContain('more rows');
    });

    it('should respect maxCols option', () => {
      // Create a frame with many columns
      const wideData = [
        { col1: 1, col2: 2, col3: 3, col4: 4, col5: 5, col6: 6 },
      ];

      const wideFrame = {
        columns: {
          col1: wideData.map((d) => d.col1),
          col2: wideData.map((d) => d.col2),
          col3: wideData.map((d) => d.col3),
          col4: wideData.map((d) => d.col4),
          col5: wideData.map((d) => d.col5),
          col6: wideData.map((d) => d.col6),
        },
        rowCount: wideData.length,
      };

      const html = toHTML(wideFrame, { maxCols: 3 });

      // Check that the output contains message about additional columns
      expect(html).toContain('more columns');
    });

    it('should apply custom CSS class', () => {
      const html = toHTML(frame, { tableClass: 'custom-table' });

      // Check that the output contains the custom class
      expect(html).toContain('class="custom-table');
    });

    it('should apply theme styles', () => {
      const html = toHTML(frame, { theme: 'dark' });

      // Check that the output contains the theme class
      expect(html).toContain('theme-dark');

      // Check that the output contains CSS styles for the theme
      expect(html).toContain('<style>');
      expect(html).toContain('background-color: #222');
    });

    it('should handle empty frames', () => {
      // Create an empty frame
      const emptyFrame = {
        columns: {},
        rowCount: 0,
      };

      const html = toHTML(emptyFrame);

      // Check that the output contains information about empty DataFrame
      expect(html).toContain('0 rows x 0 columns');
    });

    it('should handle null and undefined values', () => {
      // Create a frame with null and undefined values
      const nullData = [
        { a: 1, b: null, c: undefined },
        { a: 2, b: undefined, c: null },
      ];

      const nullFrame = {
        columns: {
          a: nullData.map((d) => d.a),
          b: nullData.map((d) => d.b),
          c: nullData.map((d) => d.c),
        },
        rowCount: nullData.length,
      };

      const html = toHTML(nullFrame);

      // Check that the output contains the string representations of null and undefined
      expect(html).toContain('null-value');
      expect(html).toContain('undefined-value');
    });
  });

  describe('display function', () => {
    // Mock browser environment
    const originalWindow = global.window;
    const originalDocument = global.document;

    beforeEach(() => {
      // Mock window and document
      global.window = {
        document: {
          createElement: vi.fn(() => ({
            className: '',
            appendChild: vi.fn(),
            innerHTML: '',
          })),
          body: {
            appendChild: vi.fn(),
          },
          querySelector: vi.fn(() => null),
        },
      };
      global.document = global.window.document;
    });

    afterEach(() => {
      // Restore window and document
      global.window = originalWindow;
      global.document = originalDocument;
    });

    it('should create a container element in browser environment', () => {
      display(frame);

      // Check that createElement was called
      expect(global.document.createElement).toHaveBeenCalled();

      // Check that the container was appended to the body
      expect(global.document.body.appendChild).toHaveBeenCalled();
    });

    it('should use specified container if provided', () => {
      // Mock querySelector to return an element
      const mockElement = { innerHTML: '' };
      global.document.querySelector = vi.fn(() => mockElement);

      display(frame, { container: '#container' });

      // Check that querySelector was called with the container selector
      expect(global.document.querySelector).toHaveBeenCalledWith('#container');
    });

    it('should fall back to console in non-browser environment', () => {
      // Remove window and document
      global.window = undefined;
      global.document = undefined;

      // Mock console.log
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      display(frame);

      // Check that console.log was called
      expect(consoleSpy).toHaveBeenCalled();

      // Restore console.log
      consoleSpy.mockRestore();
    });

    it('should return the frame for method chaining', () => {
      const result = display(frame);

      // Check that the function returns the frame
      expect(result).toBe(frame);
    });
  });

  describe('renderTo function', () => {
    // Mock browser environment
    const originalWindow = global.window;
    const originalDocument = global.document;

    beforeEach(() => {
      // Mock window and document
      global.window = {
        document: {
          createElement: vi.fn(() => ({
            className: '',
            appendChild: vi.fn(),
            innerHTML: '',
          })),
          body: {
            appendChild: vi.fn(),
          },
          querySelector: vi.fn(() => ({ innerHTML: '' })),
        },
      };
      global.document = global.window.document;

      // Mock HTMLElement
      global.HTMLElement = class HTMLElement {};
    });

    afterEach(() => {
      // Restore window and document
      global.window = originalWindow;
      global.document = originalDocument;
    });

    it('should render to specified element by selector', () => {
      const mockElement = { innerHTML: '' };
      global.document.querySelector = vi.fn(() => mockElement);

      renderTo(frame, '#container');

      // Check that querySelector was called with the container selector
      expect(global.document.querySelector).toHaveBeenCalledWith('#container');
    });

    it('should render to specified DOM element', () => {
      // Create a mock HTMLElement
      class MockHTMLElement {}
      const mockElement = new MockHTMLElement();
      mockElement.innerHTML = '';

      // Make the mock element pass the instanceof check
      global.HTMLElement = MockHTMLElement;

      // Mock the imported toHTML function
      const originalToHTML = toHTML;
      const mockHtml = '<div>Test HTML</div>';
      const mockToHTML = vi.fn().mockReturnValue(mockHtml);

      // Replace the imported function with our mock
      vi.stubGlobal('toHTML', mockToHTML);

      // Call renderTo with the mock element
      renderTo(frame, mockElement);

      // Check that the element's innerHTML was updated
      expect(mockElement.innerHTML).toBeTruthy();

      // Restore the original function
      vi.unstubAllGlobals();
    });

    it('should log error if element not found', () => {
      // Mock querySelector to return null
      global.document.querySelector = vi.fn(() => null);

      // Mock console.error
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      renderTo(frame, '#non-existent');

      // Check that console.error was called
      expect(consoleSpy).toHaveBeenCalled();

      // Restore console.error
      consoleSpy.mockRestore();
    });

    it('should log warning in non-browser environment', () => {
      // Remove window and document
      global.window = undefined;
      global.document = undefined;

      // Mock console.warn
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      renderTo(frame, '#container');

      // Check that console.warn was called
      expect(consoleSpy).toHaveBeenCalled();

      // Restore console.warn
      consoleSpy.mockRestore();
    });

    it('should return the frame for method chaining', () => {
      const mockElement = { innerHTML: '' };

      const result = renderTo(frame, mockElement);

      // Check that the function returns the frame
      expect(result).toBe(frame);
    });
  });
});
