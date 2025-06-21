/**
 * Vitest setup file
 * This file is executed before running tests
 */

import { vi } from 'vitest';
import * as Arrow from 'apache-arrow';
import { ArrowVector } from './src/core/storage/ArrowVector.js';

// Export ArrowVector through the global object for access from tests
globalThis.__TinyFrameArrowVector = ArrowVector;

// Enable debug mode for all tests
const DEBUG = true;

// Check if Apache Arrow is available
let arrowAvailable = false;
try {
  // Output information about the loaded Arrow module
  if (DEBUG) {
    console.log('Apache Arrow module keys:', Object.keys(Arrow));
    console.log(
      'Arrow.vectorFromArray exists:',
      typeof Arrow.vectorFromArray === 'function',
    );
    console.log(
      'Arrow.Table exists:',
      typeof Arrow.Table === 'object' || typeof Arrow.Table === 'function',
    );
    console.log('Arrow.Float64 exists:', typeof Arrow.Float64 === 'function');
  }

  // Check if Arrow has the required functions
  if (Arrow && typeof Arrow.vectorFromArray === 'function') {
    arrowAvailable = true;
    console.log('Apache Arrow successfully loaded in test environment');

    // Create a test vector for verification
    if (DEBUG) {
      try {
        const testVector = Arrow.vectorFromArray(['test']);
        console.log('Test vector created successfully:', {
          type: testVector.constructor.name,
          length: testVector.length,
        });
      } catch (err) {
        console.error('Failed to create test vector:', err);
      }
    }
  } else {
    console.warn('Apache Arrow loaded but vectorFromArray function not found');
  }
} catch (e) {
  console.error('Error loading Apache Arrow:', e);
  arrowAvailable = false;
}

// Output Arrow availability for tests
console.log('Arrow availability for tests:', arrowAvailable);

// Mock Apache Arrow only if it is not installed or not functional
if (!arrowAvailable) {
  console.log('Mocking Apache Arrow with test adapter');
  vi.mock(
    'apache-arrow',
    () => import('./test/mocks/apache-arrow-adapter.js'),
    { virtual: true },
  );
}

// Suppress console warnings during tests, but only if Arrow is not installed
if (!arrowAvailable) {
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
}
