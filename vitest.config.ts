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
        statements: 72,
        branches: 65,
        functions: 71,
        lines: 74,
      },
    },
  },
});
