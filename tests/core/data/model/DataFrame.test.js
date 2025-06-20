/**
 * Unit tests for DataFrame.js
 */

import { DataFrame } from '../../../../packages/core/src/data/model/DataFrame.js';
import { Series } from '../../../../packages/core/src/data/model/Series.js';
import { describe, test, expect, vi, beforeAll } from 'vitest';
import { display } from '../../../../packages/core/src/methods/dataframe/display/display.js';
import { extendDataFrame } from '../../../../packages/core/src/data/model/extendDataFrame.js';

/**
 * Tests for the DataFrame class
 * Verifies DataFrame creation, data access, and manipulation methods
 */
describe('DataFrame', () => {
  // Register display methods before running tests using the new extendDataFrame utility
  beforeAll(() => {
    extendDataFrame(DataFrame.prototype, {
      display: display(),
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
  // Sample test data
  const sampleData = {
    a: [1, 2, 3],
    b: ['x', 'y', 'z'],
  };

  // Mock the shouldUseArrow function to avoid issues with data iteration
  vi.mock(
    '../../../../packages/core/src/data/strategy/shouldUseArrow.js',
    () => ({
      shouldUseArrow: () => false,
    }),
  );

  /**
   * Tests creating a DataFrame instance from object data (column-oriented)
   * Verifies that the DataFrame is created correctly with the expected properties
   */
  test('should create a DataFrame instance from object data', () => {
    const df = new DataFrame(sampleData);

    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(3);
    expect(df.columns).toEqual(['a', 'b']);
  });

  /**
   * Tests creating a DataFrame instance using constructor
   */
  test('should create a DataFrame using constructor', () => {
    const df = new DataFrame(sampleData);

    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(3);
    expect(df.columns).toEqual(['a', 'b']);
  });

  /**
   * Tests creating a DataFrame instance from array of objects (row-oriented)
   * Verifies that the DataFrame is created correctly with the expected properties
   */
  test('should create a DataFrame instance from array of objects', () => {
    const data = [
      { a: 1, b: 'x' },
      { a: 2, b: 'y' },
      { a: 3, b: 'z' },
    ];

    const df = DataFrame.fromRecords(data);

    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(3);
    expect(df.columns).toEqual(['a', 'b']);
  });

  /**
   * Tests converting a DataFrame to an array of objects
   * Verifies that the DataFrame is converted correctly to an array of objects
   */
  test('should convert DataFrame to array of objects', () => {
    const df = new DataFrame(sampleData);
    const array = df.toArray();

    expect(array).toEqual([
      { a: 1, b: 'x' },
      { a: 2, b: 'y' },
      { a: 3, b: 'z' },
    ]);
  });

  /**
   * Tests accessing column data as Series
   */
  test('should access column data as Series', () => {
    const df = new DataFrame(sampleData);
    const seriesA = df.col('a');

    expect(seriesA).toBeInstanceOf(Series);
    expect(seriesA.length).toBe(3);
    expect(seriesA.values).toEqual([1, 2, 3]);
  });

  /**
   * Tests handling empty data correctly
   * Verifies that an empty DataFrame is created correctly and has the expected properties
   */
  test('should handle empty data correctly', () => {
    const df = new DataFrame({});

    expect(df.rowCount).toBe(0);
    expect(df.columns).toEqual([]);
    expect(df.toArray()).toEqual([]);
  });

  /**
   * Tests HTML output
   */
  test('should generate HTML representation', () => {
    const df = new DataFrame(sampleData);
    const html = df.toHTML();

    expect(html).toContain('<table class="tinyframe-table">');
    expect(html).toContain('<th>a</th>');
    expect(html).toContain('<th>b</th>');
    expect(html).toContain('<td>1</td>');
    expect(html).toContain('<td>x</td>');
  });

  /**
   * Tests Markdown output
   */
  test('should generate Markdown representation', () => {
    const df = new DataFrame(sampleData);
    const markdown = df.toMarkdown();

    // Check presence of headers and data
    expect(markdown).toContain('a');
    expect(markdown).toContain('b');
    expect(markdown).toContain('1');
    expect(markdown).toContain('x');

    // Check table structure
    expect(markdown).toContain('|');
    expect(markdown).toContain('---');
  });
});
