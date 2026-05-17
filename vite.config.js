import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Replace 'lakers-draft-hub' with your actual GitHub repository name
export default defineConfig({
  plugins: [react()],
  base: '/lakers-draft-hub/',
})
