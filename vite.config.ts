// In vite.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // NEUE EIGENSCHAFT HINZUFÜGEN:
  base: '/equity-scenario-simulato/', 
  
  plugins: [
    react()    
  ],
})