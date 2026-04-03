# NewBlog - 企业级全栈个人门户/博客系统 (Monorepo)

这是一个基于 **Monorepo** 架构构建的全栈项目，集成了前台、后台、移动端及后端 API，旨在打造一个高性能、高度可复用的个人数字化门户。

---

## 🏗️ 核心技术架构

项目采用 **pnpm workspaces** 统一管理，确保全栈类型定义的高度复用：

| 模块                  | 技术栈                                   | 职责                                                        |
| :-------------------- | :--------------------------------------- | :---------------------------------------------------------- |
| **blogApi (后端)**    | NestJS + Prisma 6 + MySQL                | 智慧大脑：处理业务逻辑、数据库持久化及 JWT 认证。           |
| **blogAdmin (后台)**  | React + **UmiJS v4 (@umijs/max)** + AntD | 生产力工具：企业级后台管理，支持 ProComponents 快速开发。   |
| **blogWeb (前台)**    | Vue 3.4 + Vite 5 + Element Plus          | 门户窗口：极速渲染的前台博客展示。                          |
| **blogMobile (移动)** | uni-app (Vue 3 + TS)                     | 随身助手：跨端移动应用，支持微信小程序。                    |
| **validation (共享)** | **Zod**                                  | 核心契约：全栈通用的业务校验 Schema (@newblog/validation)。 |

---

## 🌟 项目亮点

1.  **全栈校验闭环**: 采用 Zod 定义 Schema，前端实时表单校验与后端 DTO 校验共用一套逻辑。
2.  **企业级后台方案**: `blogAdmin` 由 UmiJS 强力驱动，内置 Ant Design ProComponents，开箱即用。
3.  **稳健的持久层**: 后端通过 Prisma 6 实现 Type-safe 的数据库操作，确保数据一致性。
4.  **自动化质量控制**: 集成 Husky, Lint-staged, ESLint v10 及 Commitlint，强制执行 Angular 提交规范。

---

## 🛠️ 快速开始

### 1. 环境准备

- **Node.js**: v20+ (推荐使用 nvm)
- **包管理**: pnpm v9+
- **数据库**: MySQL 8.0+

### 2. 依赖安装

在根目录下执行：

```bash
pnpm install
```

### 3. 初始化数据库 (API)

```bash
cd apps/blogApi
npx prisma migrate dev --name init
npx prisma generate
```

### 4. 启动开发环境

```bash
# 同时启动 API, Web 和 Admin (UmiJS)
pnpm run dev
```

---

## 📂 目录导航

- `apps/`: 子应用目录。
- `packages/validation/`: 全栈共享的校验包。
- `docs/`: 详细的架构大纲、需求文档及开发笔记。

---

**由 Gemini CLI 维护生成 @ 2026-04-02**
