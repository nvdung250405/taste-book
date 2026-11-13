import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import { compressedBuild } from './scripts/compress-build.mjs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), compressedBuild()],
  build: {
    target: ['chrome111', 'edge111', 'safari16.4'],
    cssTarget: 'safari16.4',
    cssCodeSplit: true,
    manifest: true,
    sourcemap: false,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'vendor-react',
              test: /node_modules[\\/](?:react|react-dom|scheduler)[\\/]/,
              priority: 30,
              includeDependenciesRecursively: false,
            },
            {
              name: 'vendor-router',
              test: /node_modules[\\/](?:react-router|react-router-dom)[\\/]/,
              priority: 20,
              includeDependenciesRecursively: false,
            },
            {
              name: 'vendor-query',
              test: /node_modules[\\/]@tanstack[\\/]/,
              priority: 20,
              includeDependenciesRecursively: false,
            },
          ],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
