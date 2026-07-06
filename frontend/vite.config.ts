import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Compiled SPA is served by ASP.NET from wwwroot in production.
    outDir: '../plaza/wwwroot',
    emptyOutDir: true,
  },
  server: {
    // Dev-only: allow ngrok tunnels (rotating subdomains) to reach the dev server.
    allowedHosts: ['.ngrok-free.app', '.ngrok-free.dev'],
    // Dev-only: forward API + uploaded media to the .NET backend (http profile).
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
