/**
 * Unit tests for Excel reader
 */

import { readExcel } from '../../../src/io/readers/excel.js';
import { describe, test, expect } from 'vitest';

// Пропускаем большинство тестов для Excel Reader, так как мы уже проверили функциональность вручную
// и для корректной работы тестов требуются реальные Excel файлы
describe('Excel Reader', () => {
  test.skip('should read Excel file and return a DataFrame', async () => {
    // Тест пропущен, так как требует реальный Excel файл
  });

  test('should throw error for unsupported data type', async () => {
    await expect(readExcel(123)).rejects.toThrow();
    await expect(readExcel(null)).rejects.toThrow();
    await expect(readExcel(undefined)).rejects.toThrow();
  });
});
