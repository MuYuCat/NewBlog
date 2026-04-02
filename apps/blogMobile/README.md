# NewBlog Mobile App (blogMobile)

> 基于 uni-app (Vue 3 + Vite + TS) 的多端博客系统移动端。

本项目作为 **NewBlog** 系统的移动辅助端，侧重于“碎片化”内容生产与快速访问，支持打包为微信小程序、iOS 及 Android App。

---

## 🛠 技术选型 (Tech Stack)

- **核心框架**: [uni-app](https://uniapp.dcloud.net.cn/) (Vue 3 + Composition API)
- **构建工具**: [Vite](https://cn.vitejs.dev/)
- **编程语言**: [TypeScript](https://www.typescriptlang.org/)
- **UI 组件库**: [uView-plus](https://uview-plus.com/) / [uni-ui](https://uniapp.dcloud.net.cn/component/uniui/uni-ui.html)
- **状态管理**: [Pinia](https://pinia.vuejs.org/zh/)
- **共享校验**: `@newblog/validation` (Zod)

---

## 📂 项目目录 (Directory Structure)

```text
src/
├── api/            # 移动端专用接口请求
├── components/     # 移动端原子组件
├── pages/          # 页面目录 (Index, Post, My)
├── static/         # 本地静态资源
├── store/          # Pinia 状态管理
├── utils/          # 移动端工具类 (设备适配, 权限申请)
├── App.vue         # 应用配置
└── main.ts         # 程序入口
```

---

## 🚀 快速开始 (Getting Started)

### 1. 环境依赖

确保已安装 [pnpm](https://pnpm.io/) 及 Node.js v20+。

### 2. 安装依赖

```bash
pnpm install
```

### 3. 本地运行 (以微信小程序为例)

```bash
pnpm dev:mp-weixin
```

然后使用 **微信开发者工具** 导入 `dist/dev/mp-weixin` 目录。

### 4. 编译发布

```bash
pnpm build:app-plus  # 打包 App
pnpm build:mp-weixin  # 打包微信小程序
```

---

## 🔗 相关文档 (Links)

- [项目主大纲 (System Outline)](../../docs/systemOutline.md)
- [开发笔记 (Development Notes)](../../docs/developmentNotes.md)
- [代码规范 (Code Specification)](../../docs/codeSpecification.md)

---

**Last Updated: 2026-04-02**
