import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so the built site works both at a domain root (Vercel)
// and under a sub-path (GitHub Pages project site: /<repo>/).
export default defineConfig({
  plugins: [react()],
  base: './',
})
