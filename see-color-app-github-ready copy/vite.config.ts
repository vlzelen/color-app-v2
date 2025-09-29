import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/color-app-v2/',  // Replace with your actual repo name
  server: {
    port: 3000
  }
})
