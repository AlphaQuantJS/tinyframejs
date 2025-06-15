import { describe, it, expect, vi } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import { toHTML } from '../../../../src/methods/dataframe/display/toHTML.js';

describe('DataFrame toHTML method', () => {
  describe('with standard storage', () => {
    // Create test data frame with people data for better readability in tests
    const testData = [
      { name: 'Alice', age: 25, city: 'New York' },
      { name: 'Bob', age: 30, city: 'Boston' },
      { name: 'Charlie', age: 35, city: 'Chicago' },
    ];

    // Create DataFrame using fromRecords
    const df = DataFrame.fromRecords(testData);

    it('should convert DataFrame to HTML string', () => {
      // Call toHTML function directly
      const toHTMLFn = toHTML();
      const html = toHTMLFn(df);

      // Check that the result is a string
      expect(typeof html).toBe('string');

      // Check that the HTML contains expected elements
      expect(html).toContain('<table');
      expect(html).toContain('</table>');

      // Check that the HTML contains style information
      expect(html).toContain('<style>');
      expect(html).toContain('.tinyframe-table');
    });

    it('should apply custom options if provided', () => {
      // Call toHTML function with custom options
      const toHTMLFn = toHTML();
      const options = {
        theme: 'custom',
        caption: 'Test DataFrame',
      };
      const html = toHTMLFn(df, options);

      // Check that the custom options were applied
      expect(html).toContain('theme-custom');
      expect(html).toContain('<caption>');
    });

    it('should handle empty DataFrame', () => {
      // Create empty DataFrame
      const emptyDf = DataFrame.fromRecords([]);

      // Call toHTML function
      const toHTMLFn = toHTML();
      const html = toHTMLFn(emptyDf);

      // Check that the result contains the empty DataFrame message
      expect(html).toContain('class="tinyframe-empty"');
      expect(html).toContain('Empty DataFrame');
    });
  });
});
