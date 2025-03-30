import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import matter from 'gray-matter'
import { resolve } from 'path'
import fs from 'fs'

// Custom plugin to handle markdown files
const markdownPlugin = () => ({
  name: 'markdown-plugin',
  transform(code, id) {
    if (id.endsWith('.md')) {
      try {
        const { data, content } = matter(code);
        return {
          code: `
            const frontMatter = ${JSON.stringify(data)};
            const content = ${JSON.stringify(content)};
            export { frontMatter, content };
            export default { frontMatter, content };
          `,
          map: null
        };
      } catch (error) {
        console.error('Error processing markdown:', id, error);
        return null;
      }
    }
  }
});

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
    markdownPlugin()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  // Configure the public folder
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  assetsInclude: ['**/*.md'],
  optimizeDeps: {
    force: true, // Force dependency optimization
    exclude: ['fsevents'],
    include: ['react', 'react-dom', 'react-router-dom', 'react-dom/client']
  }
})