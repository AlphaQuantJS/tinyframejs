import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';

const root = dirname(fileURLToPath(import.meta.url));

export default {
  test: {
    passWithNoTests: true,
    setupFiles: ['./vitest.setup.js'],
    include: ['./tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: ['*.config.js'],
    },
  },
  resolve: {
    alias: {
      '@tinyframejs/core': resolve(root, 'packages/core/src'),
    },
  },
};
