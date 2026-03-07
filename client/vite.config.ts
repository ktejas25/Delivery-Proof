import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:5000'
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'recharts', 'leaflet', 'react-leaflet', 'lucide-react']
  },
  build: {
    sourcemap: false
  }
})

