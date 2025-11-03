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
      // Start with low thresholds and increase as we add tests
      // Target: 50% by Phase 1, 80% by Phase 4
      thresholds: {
        statements: 3,
        branches: 0,
        functions: 3,
        lines: 3
      }
    },
  },
});
