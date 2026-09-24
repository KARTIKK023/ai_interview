import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://xk5nf2pg-5001.inc1.devtunnels.ms',
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: 'https://xk5nf2pg-5001.inc1.devtunnels.ms',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
