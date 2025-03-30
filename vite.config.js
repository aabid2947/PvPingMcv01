import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import matter from 'gray-matter'
import { resolve } from 'path'
import fs from 'fs'


// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
    // Custom plugin to handle markdown files
    {
      name: 'markdown-loader',
      transform(code, id) {
        if (id.endsWith('.md')) {
          const { data: frontMatter, content } = matter(code);
          
          // Return the processed content as a JavaScript module
          return {
            code: `
              export default {
                frontMatter: ${JSON.stringify(frontMatter)},
                content: ${JSON.stringify(content)}
              }
            `,
            map: null
          };
        }
      },
      // Add this to handle content files in SSR/production build
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.startsWith('/content/') && req.url?.endsWith('.md')) {
            const filePath = resolve(process.cwd(), req.url.slice(1));
            try {
              const content = fs.readFileSync(filePath, 'utf-8');
              res.setHeader('Content-Type', 'text/plain');
              res.end(content);
            } catch (error) {
              next(error);
            }
          } else {
            next();
          }
        });
      }
    }
  ],
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    cors: true,
    allowedHosts: [
      "c196-103-134-102-70.ngrok-free.app",// Allow ngrok domain
      "localhost" // Keep localhost allowed
    ],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  // Configure the public folder to include the admin directory for Netlify CMS
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'public/admin/index.html')
      }
    }
  },
})