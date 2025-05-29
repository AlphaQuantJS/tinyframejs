export default {
  test: {
    passWithNoTests: true,
    setupFiles: ['./vitest.setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      exclude: ['*.config.js'],
    },
  },
};
