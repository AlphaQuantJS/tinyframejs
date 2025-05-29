/**
 * Vitest setup file
 * This file is executed before running tests
 */

import { vi } from 'vitest';

// Mock for apache-arrow/adapter
vi.mock(
  'apache-arrow/adapter',
  () => import('./test/mocks/apache-arrow-adapter.js'),
  { virtual: true },
);

// Suppress console warnings during tests
const originalWarn = console.warn;
console.warn = function (message, ...args) {
  // Ignore specific Apache Arrow warnings
  if (
    message &&
    (message.includes('Apache Arrow adapter not available') ||
      message.includes('Error using Arrow adapter'))
  ) {
    return;
  }

  // Pass through other warnings
  originalWarn.apply(console, [message, ...args]);
};
