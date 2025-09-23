import { defineConfig } from 'vite'
import pages from '@hono/vite-cloudflare-pages'
import { resolve } from 'path'

export default defineConfig({
  plugins: [pages()],
  publicDir: 'public', // Ensure public files are copied
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: [
        'openai',
        '@anthropic-ai/sdk',
        'bcryptjs',
        'jsonwebtoken',
        'pg',
        'redis'
      ]
    },
    // Ensure public directory is properly copied
    copyPublicDir: true
  },
  ssr: {
    external: [
      'openai',
      '@anthropic-ai/sdk',
      'bcryptjs', 
      'jsonwebtoken',
      'pg',
      'redis'
    ]
  }
})