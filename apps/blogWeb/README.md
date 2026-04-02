# NewBlog Front-end (blogWeb)

> 基于 Vue 3.4+ 的企业级全栈博客系统前台门户。

本项目作为 **NewBlog** 系统的用户端展示层，侧重于极致的阅读体验、丝滑的交互动效（GSAP）以及跨平台的游戏数据看板。

---

## 🛠 技术选型 (Tech Stack)

- **核心框架**: [Vue 3.4](https://cn.vuejs.org/) (Composition API + `<script setup>`)
- **构建工具**: [Vite 5](https://cn.vitejs.dev/)
- **路由管理**: [Vue Router 4](https://router.vuejs.org/zh/)
- **状态管理**: [Pinia](https://pinia.vuejs.org/zh/)
- **UI 组件库**: [Element Plus](https://element-plus.org/zh-CN/)
- **动画库**: [GSAP](https://gsap.com/) (用于游戏卡片等动效)
- **代码规范**: TypeScript + ESLint + Prettier
- **共享校验**: `@newblog/validation` (Zod)

---

## 📂 项目目录 (Directory Structure)

```text
src/
├── api/            # 接口请求封装
├── assets/         # 静态资源 (图片, 样式)
├── components/     # 公共组件 (大驼峰命名)
├── layouts/        # 页面布局模板
├── router/         # 路由配置
├── stores/         # Pinia 状态树
├── styles/         # 全局样式 (SCSS)
├── utils/          # 工具函数
└── views/          # 页面视图
```

---

## 🚀 快速开始 (Getting Started)

### 1. 环境依赖

确保已安装 [pnpm](https://pnpm.io/) 及 Node.js v20+。

### 2. 安装依赖

在项目根目录或当前目录下执行：

```bash
pnpm install
```

### 3. 本地开发

```bash
pnpm dev
```

### 4. 构建发布

```bash
pnpm build
```

---

## 🔗 相关文档 (Links)

- [项目主大纲 (System Outline)](../../docs/systemOutline.md)
- [开发笔记 (Development Notes)](../../docs/developmentNotes.md)
- [代码规范 (Code Specification)](../../docs/codeSpecification.md)

---

**Last Updated: 2026-04-02**
