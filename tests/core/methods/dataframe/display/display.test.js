// tests/core/methods/dataframe/display/display.test.js
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { DataFrame } from '../../../../../packages/core/src/data/model/DataFrame.js';
import { Series } from '../../../../../packages/core/src/data/model/Series.js';
import { display } from '../../../../../packages/core/src/methods/dataframe/display/display.js';
import { print } from '../../../../../packages/core/src/methods/dataframe/display/print.js';
import { toHTML } from '../../../../../packages/core/src/methods/dataframe/display/toHTML.js';
import { toMarkdown } from '../../../../../packages/core/src/methods/dataframe/display/toMarkdown.js';
import { extendDataFrame } from '../../../../../packages/core/src/data/model/extendDataFrame.js';

describe('DataFrame display methods', () => {
  beforeAll(() => {
    // Register display methods using the extendDataFrame utility
    extendDataFrame(DataFrame.prototype, {
      display,
      print,
      toHTML,
      toMarkdown,
    });
  });

  // Create test data
  const testData = {
    A: [1, 2, 3],
    B: [4, 5, 6],
    C: [7, 8, 9],
  };

  // Create DataFrame instance with the test data
  const df = new DataFrame(testData);

  it('should convert DataFrame to HTML table', () => {
    const html = df.toHTML();
    expect(html).toContain('<table class="tinyframe-table">');
    expect(html).toContain('<thead>');
    expect(html).toContain('<tbody>');
    expect(html).toContain('<th>A</th>');
    expect(html).toContain('<th>B</th>');
    expect(html).toContain('<th>C</th>');
    expect(html).toContain('<td>1</td>');
    expect(html).toContain('<td>4</td>');
    expect(html).toContain('<td>7</td>');
  });

  it('should convert DataFrame to Markdown table', () => {
    const markdown = df.toMarkdown();

    // Check presence of headers and data
    expect(markdown).toContain('| index | A | B | C |');
    expect(markdown).toContain('|---|---|---|---|');
    expect(markdown).toContain('| 0 | 1 | 4 | 7 |');
    expect(markdown).toContain('| 1 | 2 | 5 | 8 |');
    expect(markdown).toContain('| 2 | 3 | 6 | 9 |');
  });

  it('should have print method', () => {
    // Check that print method exists
    expect(typeof df.print).toBe('function');
  });

  it('should chain print method', () => {
    // Create console.log spy
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    try {
      // Check that print method returns DataFrame for chaining
      const result = df.print();
      expect(result).toBe(df);
    } finally {
      // Restore console.log
      consoleSpy.mockRestore();
    }
  });
});
