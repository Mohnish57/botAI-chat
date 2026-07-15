import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration.
// - React plugin for JSX/Fast Refresh.
// - Vitest test config lives here (test block) so we keep a single source of truth.
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['**/node_modules/**', '**/test/**', '**/*.config.js', 'src/main.jsx'],
    },
  },
});
