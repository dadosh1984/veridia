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
        // Linux CI coverage gate — kept conservative so PATHEXT-gated Windows
        // branches (skipped on ubuntu) do not drag thresholds below the gate.
        // Windows-only test coverage raises local numbers ~3-5% above these.
        statements: 65,
        branches: 58,
        functions: 62,
        lines: 65,
      },
    },
  },
});
