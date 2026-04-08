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
  // 使用 Vite 底层代理配置，解决 Astro 路由拦截导致的 404 问题
  vite: {
    server: {
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  },
});
