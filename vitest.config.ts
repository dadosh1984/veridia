import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: ['src/**'],
      exclude: ['src/cli/commands/**'],
      thresholds: {
        statements: 50,
        branches: 40,
        functions: 70,
        lines: 55,
      },
    },
  },
});
