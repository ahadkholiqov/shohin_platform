import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../plaza/wwwroot',
    emptyOutDir: true,
  },
  server: {
    allowedHosts: ['.ngrok-free.app', '.ngrok-free.dev'],
    proxy: {
      '/api': {
        target: 'http://localhost:5241',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:5241',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
