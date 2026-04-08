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
      // 禁用默认的 preflight 以防样式冲突，后期可以根据需要开启
      applyBaseStyles: true,
    }),
  ],
  output: 'static', // 默认 SSG，追求极致 SEO 和性能
  server: {
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // 去掉 /api 前缀以匹配后端真实的 controller 路径
      },
    },
  },
});
