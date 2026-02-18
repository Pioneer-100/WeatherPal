import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Allow setting a base path via VITE_BASE_PATH when deploying to subpaths (e.g., GitHub Pages)
  const basePath = process.env.VITE_BASE_PATH || '/'
  return {
    base: basePath,
    plugins: [react()],
    build: {
      sourcemap: false,
      chunkSizeWarningLimit: 2000,
    },
  }
})
