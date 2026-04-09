import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [
    vue({
      appEntrypoint: 'src/_app.ts',
    }),
    tailwind({
      applyBaseStyles: true,
    }),
  ],
  output: 'static',
  server: {
    port: 8080,
  },
  vite: {
    server: {
      proxy: {
        // 使用正则前缀匹配，并确保 changeOrigin 为 true
        '^/api/.*': {
          target: 'http://127.0.0.1:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  },
});
