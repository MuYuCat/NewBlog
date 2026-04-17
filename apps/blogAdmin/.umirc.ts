import { defineConfig } from '@umijs/max';
import path from 'path';

export default defineConfig({
  title: 'MuYuCat - 管理后台',
  favicons: ['/MuYuCat.png'],
  antd: {
    configProvider: {
      theme: {
        token: {
          colorPrimary: '#000000',
          borderRadius: 12,
          fontFamily: 'Montserrat, "Noto Serif SC", sans-serif',
        },
      },
    },
    // 允许通过 ConfigProvider 动态切换主题
    appConfig: {},
  },
  locale: {
    default: 'zh-CN',
    baseSeparator: '-',
    antd: true,
  },
  model: {},
  initialState: {},
  // 彻底关闭自动布局插件
  layout: false,
  request: {},
  headScripts: [
    {
      src: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Montserrat:wght@100..900&family=Noto+Serif+SC:wght@200..900&display=swap',
    },
  ],
  routes: [
    {
      path: '/login',
      component: './login',
      name: '登录',
      layout: false,
    },
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      component: './dashboard',
      name: '仪表盘',
      icon: 'dashboard',
    },
    {
      path: '/menu',
      component: './menu',
      name: '菜单管理',
      icon: 'menu',
    },
    {
      path: '/game',
      name: '游戏管理',
      icon: 'playSquare',
      routes: [
        {
          path: '/game',
          redirect: '/game/index',
        },
        {
          path: '/game/index',
          component: './game',
          name: '档案中心',
        },
        {
          path: '/game/edit',
          component: './game/edit',
          name: '入库中心',
          hideInMenu: true,
        },
        {
          path: '/game/edit/:id',
          component: './game/edit',
          name: '档案实验室',
          hideInMenu: true,
        },
        {
          path: '/game/config',
          component: './game/config',
          name: '同步指挥塔',
        },
      ],
    },
    {
      path: '/article',
      name: '文章管理',
      icon: 'read',
      routes: [
        {
          path: '/article/index',
          component: './article',
          name: '内容空间枢纽',
        },
        {
          path: '/article/edit',
          component: './article/edit',
          name: '内容发射中心',
          hideInMenu: true,
        },
        {
          path: '/article/edit/:id',
          component: './article/edit',
          name: '内容协议修订',
          hideInMenu: true,
        },
        {
          path: '/article/category',
          component: './article/category',
          name: '主题维度管理',
        },
      ],
    },
    {
      path: '/vault',
      component: './vault',
      name: '资源宝库',
      icon: 'folderOpen',
    },
    {
      path: '/analytics',
      component: './analytics',
      name: '日志管理',
      icon: 'lineChart',
    },
  ],
  npmClient: 'pnpm',
  mfsu: false,
  proxy: {
    '/api/': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    },
  },
  alias: {
    '@newblog/validation': path.resolve(__dirname, '../../packages/validation/src/index.ts'),
    react: path.dirname(require.resolve('react/package.json')),
    'react-dom': path.dirname(require.resolve('react-dom/package.json')),
  },
});
