import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
    typecheck: {
      enabled: true,
      tsconfig: './tsconfig.app.json',
    },
    coverage: {
      provider: 'v8',
      all: false,
      thresholds: {
        statements: 80,
        branches: 75,
      },
      exclude: [
        'src/__mocks__/**',
        'src/**/*.test.*',
        'src/**/*.test-d.*',
        'src/setupTests.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'motion/react': path.resolve(__dirname, './src/__mocks__/motion.ts'),
    },
  },
})
