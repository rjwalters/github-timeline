import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        'demo-dist/',
        '**/*.config.{ts,js}',
        '**/*.d.ts',
        '**/demo/**',
        'worker/**'
      ],
      // Updated thresholds based on current coverage (Nov 7, 2025)
      // Actual coverage: statements: 77.24%, branches: 75.15%, functions: 83.9%, lines: 77.4%
      // Set thresholds to current levels to prevent regression
      thresholds: {
        statements: 77,
        branches: 75,
        functions: 83,
        lines: 77
      }
    },
  },
});
