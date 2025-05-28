/**
 * Unit tests for console table display
 */

import { describe, it, expect, vi } from 'vitest';
import { print } from '../../../src/display/console/table.js';
import { DataFrame } from '../../../src/core/dataframe/DataFrame.js';

// Test data to be used in all tests
const testData = [
  { name: 'Alice', age: 25, city: 'New York' },
  { name: 'Bob', age: 30, city: 'Boston' },
  { name: 'Charlie', age: 35, city: 'Chicago' },
  { name: 'David', age: 40, city: 'Denver' },
  { name: 'Eve', age: 45, city: 'El Paso' },
];

describe('Console Table Display', () => {
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

  it('should format data as a table string', () => {
    // Mock console.log to check output
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // Call print function directly
    print(frame);

    // Check that console.log was called
    expect(consoleSpy).toHaveBeenCalled();

    // Get the argument passed to console.log
    const output = consoleSpy.mock.calls[0][0];

    // Check that the output contains column headers
    expect(output).toContain('name');
    expect(output).toContain('age');
    expect(output).toContain('city');

    // Check that the output contains data
    expect(output).toContain('Alice');
    expect(output).toContain('25');
    expect(output).toContain('New York');

    // Restore console.log
    consoleSpy.mockRestore();
  });

  it('should return the frame for method chaining', () => {
    // Mock console.log
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // Call print function directly
    const result = print(frame);

    // Check that the function returns the frame
    expect(result).toBe(frame);

    // Restore console.log
    consoleSpy.mockRestore();
  });

  it('should respect rows limit', () => {
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

    // Mock console.log
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // Call print function with row limit
    print(largeFrame, 5);

    // Get the output
    const output = consoleSpy.mock.calls[0][0];

    // Check that the output contains message about additional rows
    expect(output).toContain('more rows');

    // Restore console.log
    consoleSpy.mockRestore();
  });

  it('should respect cols limit', () => {
    // Create a frame with many columns
    const wideData = [{ col1: 1, col2: 2, col3: 3, col4: 4, col5: 5, col6: 6 }];

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

    // Mock console.log
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // Call print function with column limit
    print(wideFrame, undefined, 3);

    // Get the output
    const output = consoleSpy.mock.calls[0][0];

    // Check that the output contains message about additional columns
    expect(output).toContain('more columns');

    // Restore console.log
    consoleSpy.mockRestore();
  });

  it('should handle empty frames', () => {
    // Create an empty frame
    const emptyFrame = {
      columns: {},
      rowCount: 0,
    };

    // Mock console.log
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // Call print function
    print(emptyFrame);

    // Get the output
    const output = consoleSpy.mock.calls[0][0];

    // Check that the output contains information about the empty frame
    expect(output).toContain('0 rows x 0 columns');

    // Restore console.log
    consoleSpy.mockRestore();
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

    // Mock console.log
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // Call print function
    print(nullFrame);

    // Get the output
    const output = consoleSpy.mock.calls[0][0];

    // Check that the output contains the string representations of null and undefined
    expect(output).toContain('null');
    expect(output).toContain('undefined');

    // Restore console.log
    consoleSpy.mockRestore();
  });
});
