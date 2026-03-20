import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/poc-filter-template/',
  build: {
    rollupOptions: {
      external: ['@progress/kendo-file-saver'],
    },
  },
})