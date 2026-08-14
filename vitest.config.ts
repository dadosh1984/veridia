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
        statements: 65,
        branches: 58,
        functions: 62,
        lines: 65,
      },
    },
  },
});
