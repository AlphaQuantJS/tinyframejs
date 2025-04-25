// vitest.config.ts
export default {
    test: {
      include: ['test/**/*.test.js'],
      coverage: {
        provider: 'c8',
        reporter: ['text', 'lcov']
      },
    },
  };
  

  