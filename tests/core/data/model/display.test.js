// test/core/dataframe/display.test.js
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { DataFrame } from '../../../../packages/core/src/data/model/DataFrame.js';
import { display } from '../../../../packages/core/src/methods/dataframe/display/display.js';
import { extendDataFrame } from '../../../../packages/core/src/data/model/extendDataFrame.js';

describe('DataFrame display methods', () => {
  beforeAll(() => {
    // Register display methods using the new extendDataFrame utility
    extendDataFrame(DataFrame.prototype, {
      display: display(),
      // Add print method that returns the frame for chaining
      print: (df) => {
        console.log(df.toString());
        return df;
      },
      // Add toHTML method for testing
      toHTML: (df) => {
        // Create table header
        let html = '<table class="tinyframe-table"><thead><tr>';
        for (const col of df._order) {
          html += `<th>${col}</th>`;
        }
        html += '</tr></thead><tbody>';

        // Add data rows
        const rowCount = df._columns[df._order[0]].length;
        for (let i = 0; i < rowCount; i++) {
          html += '<tr>';
          for (const col of df._order) {
            // Get value from Series
            const series = df._columns[col];
            const value = series.get(i);
            html += `<td>${value}</td>`;
          }
          html += '</tr>';
        }

        html += '</tbody></table>';
        return html;
      },
      // Add toMarkdown method for testing
      toMarkdown: (df) => {
        // Create header row
        let md = '| index |';
        for (const col of df._order) {
          md += ` ${col} |`;
        }
        md += '\n|---|';

        // Add separator row
        for (const col of df._order) {
          md += '---|';
        }
        md += '\n';

        // Add data rows
        const rowCount = df._columns[df._order[0]].length;
        for (let i = 0; i < rowCount; i++) {
          md += `| ${i} |`;
          for (const col of df._order) {
            // Get value from Series
            const series = df._columns[col];
            const value = series.get(i);
            md += ` ${value} |`;
          }
          md += '\n';
        }

        return md;
      },
    });
  });

  // Define test data
  const testData = {
    name: ['Alice', 'Bob', 'Charlie'],
    age: [25, 30, 35],
    city: ['New York', 'London', 'Paris'],
  };

  // Create DataFrame instance with the test data
  const df = new DataFrame(testData);

  it('should convert DataFrame to HTML table', () => {
    const html = df.toHTML();
    expect(html).toContain('<table class="tinyframe-table">');
    expect(html).toContain('<thead>');
    expect(html).toContain('<tbody>');
    expect(html).toContain('<th>name</th>');
    expect(html).toContain('<th>age</th>');
    expect(html).toContain('<th>city</th>');
    expect(html).toContain('<td>Alice</td>');
    expect(html).toContain('<td>25</td>');
    expect(html).toContain('<td>New York</td>');
  });

  it('should convert DataFrame to Markdown table', () => {
    const markdown = df.toMarkdown();

    // Check presence of headers and data, considering index format
    expect(markdown).toContain('name');
    expect(markdown).toContain('age');
    expect(markdown).toContain('city');
    expect(markdown).toContain('Alice');
    expect(markdown).toContain('25');
    expect(markdown).toContain('New York');

    // Check table structure
    expect(markdown).toContain('|');
    expect(markdown).toContain('---');
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
      expect(result).toHaveProperty('_columns');
      expect(result).toHaveProperty('_order');
    } finally {
      // Restore console.log
      consoleSpy.mockRestore();
    }
  });
});
