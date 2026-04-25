import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    fs: {
      allow: ['..']
    }
  },
  // We can't easily serve external folders as 'public' in Vite without plugins.
  // I will assume the user will move the folders or I'll provide a script.
})
