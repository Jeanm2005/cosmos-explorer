import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    test: {
        environments: 'jsdom',
        globals: true,
        setupFiles: './src/tests/setup.ts',
    },
})