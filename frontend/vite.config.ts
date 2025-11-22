import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow access from outside container
    port: 5173,
    watch: {
      usePolling: true, // Needed for file watching in Docker
    },
  },
})
