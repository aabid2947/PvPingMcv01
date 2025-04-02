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

// Helper to load all markdown files from content/blog
const getBlogPosts = () => {
  const blogDir = resolve(__dirname, 'content/blog');
  const entries = {};
  
  try {
    if (fs.existsSync(blogDir)) {
      const files = fs.readdirSync(blogDir);
      files.forEach(file => {
        if (file.endsWith('.md')) {
          const path = resolve(blogDir, file);
          try {
            const content = fs.readFileSync(path, 'utf-8');
            const { data } = matter(content);
            entries[`/content/blog/${file}`] = {
              file: path,
              data
            };
          } catch (err) {
            console.error(`Error reading blog file ${file}:`, err);
          }
        }
      });
    }
  } catch (err) {
    console.error('Error reading blog directory:', err);
  }
  
  return entries;
};

// Get environment variables from .env file
const isDev = process.env.NODE_ENV === 'development';

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
    markdownPlugin(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  // Configure the public folder
  publicDir: 'public',
  server: {
    fs: {
      // Allow serving files from content folder
      allow: ['content', '.']
    },
    historyApiFallback: true,
  },
  preview: {
    port: 5000,
    historyApiFallback: true
  },
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