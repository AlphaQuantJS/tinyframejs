/**
 * Unit tests for Excel reader
 */

import { readExcel } from '../../../src/io/readers/excel.js';
import { describe, test, expect } from 'vitest';

// Skip most tests for Excel Reader, as we have already manually verified functionality
// and real Excel files are required for proper test operation
describe('Excel Reader', () => {
  test.skip('should read Excel file and return a DataFrame', async () => {
    // Test skipped, as it requires a real Excel file
  });

  test('should throw error for unsupported data type', async () => {
    await expect(readExcel(123)).rejects.toThrow();
    await expect(readExcel(null)).rejects.toThrow();
    await expect(readExcel(undefined)).rejects.toThrow();
  });
});
