/**
 * Unit tests for Jupyter display
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  toJupyter,
  registerJupyterDisplay,
} from '../../../src/display/web/jupyter.js';
import { DataFrame } from '../../../src/core/dataframe/DataFrame.js';

// Test data to be used in all tests
const testData = [
  { name: 'Alice', age: 25, city: 'New York' },
  { name: 'Bob', age: 30, city: 'Boston' },
  { name: 'Charlie', age: 35, city: 'Chicago' },
  { name: 'David', age: 40, city: 'Denver' },
  { name: 'Eve', age: 45, city: 'El Paso' },
];

describe('Jupyter Display', () => {
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

  // Mock the global object to simulate Jupyter environment
  beforeEach(() => {
    global.$$ = function() {};
  });

  afterEach(() => {
    delete global.$$;
    vi.restoreAllMocks();
  });

  it('should create a Jupyter display object in Jupyter environment', () => {
    const jupyterObj = toJupyter(frame);

    // Check that the result is an object with the correct properties
    expect(typeof jupyterObj).toBe('object');
    expect(jupyterObj).toHaveProperty('text/html');
    expect(jupyterObj).toHaveProperty('application/json');

    // Check that the HTML is a string
    expect(typeof jupyterObj['text/html']).toBe('string');

    // Check that the JSON contains the correct data
    expect(jupyterObj['application/json']).toHaveProperty('columns');
    expect(jupyterObj['application/json']).toHaveProperty('rowCount');
    expect(jupyterObj['application/json'].rowCount).toBe(frame.rowCount);
  });

  it('should include options in the returned object', () => {
    const options = { maxRows: 20, theme: 'dark' };
    const jupyterObj = toJupyter(frame, options);

    // Check that the result is an object
    expect(typeof jupyterObj).toBe('object');

    // Check that the HTML is a string
    expect(typeof jupyterObj['text/html']).toBe('string');
  });

  it('should handle empty frames', () => {
    // Create an empty frame
    const emptyFrame = {
      columns: {},
      rowCount: 0,
    };

    const jupyterObj = toJupyter(emptyFrame);

    // Check that the HTML is a string
    expect(typeof jupyterObj['text/html']).toBe('string');

    // Check that the JSON contains the correct data
    expect(jupyterObj['application/json'].rowCount).toBe(0);
  });

  it('should return HTML string in non-Jupyter environment', () => {
    // Remove Jupyter environment
    delete global.$$;

    const result = toJupyter(frame);

    // Check that the function returns a string
    expect(typeof result).toBe('string');
  });

  it('should register Jupyter display methods on DataFrame', () => {
    // Mock console.log
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    // Register Jupyter display methods
    registerJupyterDisplay(DataFrame);

    // Check that _repr_html_ method was added to DataFrame prototype
    expect(typeof DataFrame.prototype._repr_html_).toBe('function');

    // Check that _repr_mimebundle_ method was added to DataFrame prototype
    expect(typeof DataFrame.prototype._repr_mimebundle_).toBe('function');

    // Check that console.log was called
    expect(consoleSpy).toHaveBeenCalledWith(
      'Jupyter display methods registered for DataFrame',
    );

    // Restore console.log
    consoleSpy.mockRestore();
  });
});
