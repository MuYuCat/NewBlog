import { defineConfig } from '@umijs/max';
import path from 'path';

export default defineConfig({
  antd: {},
  model: {},
  request: {},
  tailwindcss: {},
  routes: [
    {
      path: '/login',
      component: './login',
      name: '登录',
      layout: false,
    },
    {
      path: '/',
      component: './index',
      name: '控制台',
      icon: 'dashboard',
    },
  ],
  npmClient: 'pnpm',
  alias: {
    '@newblog/validation': path.resolve(__dirname, '../../packages/validation/src/index.ts'),
  },
});
