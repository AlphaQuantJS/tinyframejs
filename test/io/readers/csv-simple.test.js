/**
 * Simple tests for CSV reader in Node.js environment
 */

import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../src/core/DataFrame.js';
import { readCsv, detectEnvironment } from '../../../src/io/readers/csv.js';

// Sample CSV content
const csvContent =
  'date,open,high,low,close,volume\n' +
  '2023-01-01,100.5,105.75,99.25,103.5,1000000\n' +
  '2023-01-02,103.75,108.25,102.5,107.25,1500000\n' +
  '2023-01-03,107.5,110.0,106.25,109.75,1200000';

describe('CSV Reader Tests', () => {
  /**
   * Tests environment detection
   */
  test('should detect current environment', () => {
    const env = detectEnvironment();
    // We're running in Node.js, so this should be 'node'
    expect(env).toBe('node');
  });

  /**
   * Tests CSV reading in Node.js environment
   */
  test('should read CSV in current environment', async () => {
    const df = await readCsv(csvContent);

    // Verify the result
    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(3);
    expect(df.columns).toContain('date');
    expect(df.columns).toContain('open');
    expect(df.columns).toContain('close');
    expect(df.columns).toContain('volume');
  });

  /**
   * Tests batch processing
   */
  test('should support batch processing', async () => {
    // Read CSV with batch processing
    const batchProcessor = await readCsv(csvContent, { batchSize: 2 });

    // Verify that batch processor has the expected methods
    expect(batchProcessor).toHaveProperty('process');
    expect(batchProcessor).toHaveProperty('collect');
    expect(typeof batchProcessor.process).toBe('function');
    expect(typeof batchProcessor.collect).toBe('function');

    // Test collect method
    const df = await batchProcessor.collect();

    // Verify collect results
    expect(df).toBeInstanceOf(DataFrame);
    expect(df.rowCount).toBe(3);
  });
});
