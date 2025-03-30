// vite.config.js
import { defineConfig } from "file:///C:/Users/aabid/Downloads/PvPingMc-preview/PvPingMc-preview/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/aabid/Downloads/PvPingMc-preview/PvPingMc-preview/node_modules/@vitejs/plugin-react/dist/index.mjs";
import tailwindcss from "file:///C:/Users/aabid/Downloads/PvPingMc-preview/PvPingMc-preview/node_modules/@tailwindcss/vite/dist/index.mjs";
import matter from "file:///C:/Users/aabid/Downloads/PvPingMc-preview/PvPingMc-preview/node_modules/gray-matter/index.js";
import { resolve } from "path";
var __vite_injected_original_dirname = "C:\\Users\\aabid\\Downloads\\PvPingMc-preview\\PvPingMc-preview";
var markdownPlugin = () => ({
  name: "markdown-plugin",
  transform(code, id) {
    if (id.endsWith(".md")) {
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
        console.error("Error processing markdown:", id, error);
        return null;
      }
    }
  }
});
var vite_config_default = defineConfig({
  base: "/",
  plugins: [
    react(),
    tailwindcss(),
    markdownPlugin()
  ],
  resolve: {
    alias: {
      "@": resolve(__vite_injected_original_dirname, "src")
    }
  },
  // Configure the public folder
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__vite_injected_original_dirname, "index.html")
      }
    }
  },
  assetsInclude: ["**/*.md"],
  optimizeDeps: {
    force: true,
    // Force dependency optimization
    exclude: ["fsevents"],
    include: ["react", "react-dom", "react-router-dom", "react-dom/client"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxhYWJpZFxcXFxEb3dubG9hZHNcXFxcUHZQaW5nTWMtcHJldmlld1xcXFxQdlBpbmdNYy1wcmV2aWV3XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxhYWJpZFxcXFxEb3dubG9hZHNcXFxcUHZQaW5nTWMtcHJldmlld1xcXFxQdlBpbmdNYy1wcmV2aWV3XFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9hYWJpZC9Eb3dubG9hZHMvUHZQaW5nTWMtcHJldmlldy9QdlBpbmdNYy1wcmV2aWV3L3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tICdAdGFpbHdpbmRjc3Mvdml0ZSdcbmltcG9ydCBtYXR0ZXIgZnJvbSAnZ3JheS1tYXR0ZXInXG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCdcbmltcG9ydCBmcyBmcm9tICdmcydcblxuLy8gQ3VzdG9tIHBsdWdpbiB0byBoYW5kbGUgbWFya2Rvd24gZmlsZXNcbmNvbnN0IG1hcmtkb3duUGx1Z2luID0gKCkgPT4gKHtcbiAgbmFtZTogJ21hcmtkb3duLXBsdWdpbicsXG4gIHRyYW5zZm9ybShjb2RlLCBpZCkge1xuICAgIGlmIChpZC5lbmRzV2l0aCgnLm1kJykpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHsgZGF0YSwgY29udGVudCB9ID0gbWF0dGVyKGNvZGUpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGNvZGU6IGBcbiAgICAgICAgICAgIGNvbnN0IGZyb250TWF0dGVyID0gJHtKU09OLnN0cmluZ2lmeShkYXRhKX07XG4gICAgICAgICAgICBjb25zdCBjb250ZW50ID0gJHtKU09OLnN0cmluZ2lmeShjb250ZW50KX07XG4gICAgICAgICAgICBleHBvcnQgeyBmcm9udE1hdHRlciwgY29udGVudCB9O1xuICAgICAgICAgICAgZXhwb3J0IGRlZmF1bHQgeyBmcm9udE1hdHRlciwgY29udGVudCB9O1xuICAgICAgICAgIGAsXG4gICAgICAgICAgbWFwOiBudWxsXG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBwcm9jZXNzaW5nIG1hcmtkb3duOicsIGlkLCBlcnJvcik7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgfVxufSk7XG5cbi8vIGh0dHBzOi8vdml0ZS5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgYmFzZTogJy8nLFxuICBwbHVnaW5zOiBbXG4gICAgcmVhY3QoKSxcbiAgICB0YWlsd2luZGNzcygpLFxuICAgIG1hcmtkb3duUGx1Z2luKClcbiAgXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjJyksXG4gICAgfSxcbiAgfSxcbiAgLy8gQ29uZmlndXJlIHRoZSBwdWJsaWMgZm9sZGVyXG4gIHB1YmxpY0RpcjogJ3B1YmxpYycsXG4gIGJ1aWxkOiB7XG4gICAgb3V0RGlyOiAnZGlzdCcsXG4gICAgZW1wdHlPdXREaXI6IHRydWUsXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgaW5wdXQ6IHtcbiAgICAgICAgbWFpbjogcmVzb2x2ZShfX2Rpcm5hbWUsICdpbmRleC5odG1sJylcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIGFzc2V0c0luY2x1ZGU6IFsnKiovKi5tZCddLFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBmb3JjZTogdHJ1ZSwgLy8gRm9yY2UgZGVwZW5kZW5jeSBvcHRpbWl6YXRpb25cbiAgICBleGNsdWRlOiBbJ2ZzZXZlbnRzJ10sXG4gICAgaW5jbHVkZTogWydyZWFjdCcsICdyZWFjdC1kb20nLCAncmVhY3Qtcm91dGVyLWRvbScsICdyZWFjdC1kb20vY2xpZW50J11cbiAgfVxufSkiXSwKICAibWFwcGluZ3MiOiAiO0FBQTRXLFNBQVMsb0JBQW9CO0FBQ3pZLE9BQU8sV0FBVztBQUNsQixPQUFPLGlCQUFpQjtBQUN4QixPQUFPLFlBQVk7QUFDbkIsU0FBUyxlQUFlO0FBSnhCLElBQU0sbUNBQW1DO0FBUXpDLElBQU0saUJBQWlCLE9BQU87QUFBQSxFQUM1QixNQUFNO0FBQUEsRUFDTixVQUFVLE1BQU0sSUFBSTtBQUNsQixRQUFJLEdBQUcsU0FBUyxLQUFLLEdBQUc7QUFDdEIsVUFBSTtBQUNGLGNBQU0sRUFBRSxNQUFNLFFBQVEsSUFBSSxPQUFPLElBQUk7QUFDckMsZUFBTztBQUFBLFVBQ0wsTUFBTTtBQUFBLGtDQUNrQixLQUFLLFVBQVUsSUFBSSxDQUFDO0FBQUEsOEJBQ3hCLEtBQUssVUFBVSxPQUFPLENBQUM7QUFBQTtBQUFBO0FBQUE7QUFBQSxVQUkzQyxLQUFLO0FBQUEsUUFDUDtBQUFBLE1BQ0YsU0FBUyxPQUFPO0FBQ2QsZ0JBQVEsTUFBTSw4QkFBOEIsSUFBSSxLQUFLO0FBQ3JELGVBQU87QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRjtBQUdBLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLE1BQU07QUFBQSxFQUNOLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFlBQVk7QUFBQSxJQUNaLGVBQWU7QUFBQSxFQUNqQjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxRQUFRLGtDQUFXLEtBQUs7QUFBQSxJQUMvQjtBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBRUEsV0FBVztBQUFBLEVBQ1gsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsYUFBYTtBQUFBLElBQ2IsZUFBZTtBQUFBLE1BQ2IsT0FBTztBQUFBLFFBQ0wsTUFBTSxRQUFRLGtDQUFXLFlBQVk7QUFBQSxNQUN2QztBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxlQUFlLENBQUMsU0FBUztBQUFBLEVBQ3pCLGNBQWM7QUFBQSxJQUNaLE9BQU87QUFBQTtBQUFBLElBQ1AsU0FBUyxDQUFDLFVBQVU7QUFBQSxJQUNwQixTQUFTLENBQUMsU0FBUyxhQUFhLG9CQUFvQixrQkFBa0I7QUFBQSxFQUN4RTtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
