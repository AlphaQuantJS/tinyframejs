/**
 * Vitest setup file
 * This file is executed before running tests
 */

import { vi } from 'vitest';
import * as Arrow from 'apache-arrow';
import { ArrowVector } from './src/core/storage/ArrowVector.js';

// Экспортируем ArrowVector через глобальный объект для доступа из тестов
globalThis.__TinyFrameArrowVector = ArrowVector;

// Включаем отладочный режим для всех тестов
const DEBUG = true;

// Проверяем, доступен ли Apache Arrow
let arrowAvailable = false;
try {
  // Выводим информацию о загруженном модуле Arrow
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

  // Проверяем, что Arrow имеет необходимые функции
  if (Arrow && typeof Arrow.vectorFromArray === 'function') {
    arrowAvailable = true;
    console.log('Apache Arrow successfully loaded in test environment');

    // Создаем тестовый вектор для проверки
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

// Выводим информацию о состоянии Arrow для тестов
console.log('Arrow availability for tests:', arrowAvailable);

// Мокаем Apache Arrow только если он не установлен или не функционален
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
