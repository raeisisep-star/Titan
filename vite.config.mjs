import { defineConfig } from 'vite'
import pages from '@hono/vite-cloudflare-pages'

export default defineConfig({
  plugins: [pages()],
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
    }
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