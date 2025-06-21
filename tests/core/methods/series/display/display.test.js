// tests/core/methods/series/display/display.test.js
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { Series } from '../../../../../packages/core/src/data/model/Series.js';
import { display } from '../../../../../packages/core/src/methods/series/display/display.js';
import { print } from '../../../../../packages/core/src/methods/series/display/print.js';
import { toHTML } from '../../../../../packages/core/src/methods/series/display/toHTML.js';
import { toMarkdown } from '../../../../../packages/core/src/methods/series/display/toMarkdown.js';
import { extendSeries } from '../../../../../packages/core/src/data/model/extendSeries.js';

describe('Series display methods', () => {
  beforeAll(() => {
    // Register display methods using the extendSeries utility
    extendSeries(Series.prototype, {
      display,
      print,
      toHTML,
      toMarkdown,
    });
  });

  // Define test data
  const testData = [10, 20, 30, 40, 50];
  const name = 'test_series';

  // Create Series instance with the test data
  const series = new Series(testData, { name });

  it('should convert Series to HTML table', () => {
    const html = toHTML(series);
    expect(html).toContain('<table class="tinyframe-table">');
    expect(html).toContain('<thead>');
    expect(html).toContain('<tbody>');
    expect(html).toContain(`<th>${name}</th>`);
    expect(html).toContain('<td>10</td>');
    expect(html).toContain('<td>20</td>');
    expect(html).toContain('<td>30</td>');
  });

  it('should convert Series to Markdown table', () => {
    const markdown = toMarkdown(series);

    // Check presence of headers and data
    expect(markdown).toContain(name);
    expect(markdown).toContain('10');
    expect(markdown).toContain('20');
    expect(markdown).toContain('30');

    // Check table structure
    expect(markdown).toContain('|');
    expect(markdown).toContain('---');
  });

  it('should have print method', () => {
    // Check that print function exists
    expect(typeof print).toBe('function');
  });

  it('should chain print method', () => {
    // Create console.log spy
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    try {
      // Check that print method returns Series for chaining
      const result = print(series);
      expect(result).toBe(series);
    } finally {
      // Restore console.log
      consoleSpy.mockRestore();
    }
  });
});
