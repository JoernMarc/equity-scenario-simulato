// In vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

// PostCSS wird jetzt hier nicht mehr importiert

export default defineConfig({
  plugins: [
    react(),
  ],
})