# NewBlog Monorepo (Enterprise Blog System)

> 基于 **pnpm workspaces** 架构的企业级全栈个人门户/博客系统。

本项目整合了前台展示、后台管理、后端服务及移动辅助端，旨在打造极致的跨平台阅读与管理体验。

---

## 📂 项目结构 (Project Matrix)

```text
NewBlog/
├── apps/               # 应用层
│   ├── blogWeb/        # Vue 3 前台门户 (Vite/Pinia/GSAP)
│   ├── blogAdmin/      # React 后台管理 (Next.js/Shadcn/UI)
│   ├── blogApi/        # NestJS 核心服务端 (Prisma/BullMQ)
│   └── blogMobile/     # uni-app 移动辅助端 (Vue 3/Vite/TS)
├── packages/           # 共享逻辑层
│   └── validation/     # 基于 Zod 的全栈共享数据校验包 (@newblog/validation)
└── docs/               # 系统设计与开发规范文档
```

---

## 🚀 快速开始 (Getting Started)

### 1. 环境准备

- **Node.js**: v20+ (使用 `nvm` 管理)
- **包管理器**: [pnpm](https://pnpm.io/) v9+
- **数据库**: MySQL 8.0, Redis (用于异步队列)

### 2. 初始化安装

在根目录下执行一次，即可安装所有工作区的依赖：

```bash
pnpm install
```

### 3. 子项目启动指南

#### 🚀 一键启动 (One-Click Start)

在根目录下执行以下命令，即可并行启动 **API**、**Web**、**Admin** 三大核心应用：

```bash
pnpm dev
```

_(注：如果需要同时启动移动端预览，请运行 `pnpm dev:all`)_

#### 🎯 单独启动 (Specific Start)

| 项目名称       | 启动命令 (推荐根目录运行)                | 默认端口 |
| :------------- | :--------------------------------------- | :------- |
| **后端 API**   | `pnpm --filter blogApi start:dev`        | 3000     |
| **前台 Web**   | `pnpm --filter blogWeb dev`              | 5173     |
| **后台 Admin** | `pnpm --filter blogAdmin dev`            | 3001     |
| **移动端 App** | `pnpm --filter blogMobile dev:mp-weixin` | (小程序) |

---

## 🛠 自动化开发规范 (Quality Control)

本项目强制执行以下自动化校验流程，确保入库代码 100% 合规。

### 1. 代码提交校验 (Git Hooks)

- **Pre-commit**: 提交时自动运行 `prettier --write` 和 `eslint --fix`。
- **Commit-msg**: 必须遵循 Angular 提交规范 (如 `feat:`, `fix:`, `docs:`)。

### 2. 全局管理脚本

- `pnpm format`: 全局格式化所有代码。
- `pnpm lint`: 全局运行各子项目的逻辑校验。

---

## 🔗 相关文档 (Core Documents)

- [系统架构大纲 (System Outline)](./docs/systemOutline.md)
- [详细需求文档 (Requirements)](./docs/requirements.md)
- [代码规范与校验逻辑 (Code Specification)](./docs/codeSpecification.md)
- [开发部署笔记 (Development Notes)](./docs/developmentNotes.md)

---

**由 Gemini CLI 维护并生成 @ 2026-04-02**
