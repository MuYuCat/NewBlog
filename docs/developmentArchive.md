# 项目开发归档 (Development Archive)

> 本文档用于记录 NewBlog 项目的重大技术决策、核心功能交付及里程碑节点。它将作为前台“归档”或“时光机”板块的数据源。

---

## 2026-04-07：全站精英视觉体系闭环与 Elite Admin 深度重塑

### 🚀 重大变更

- **全站精英视觉 (Elite UI)**:
  - **字体革命**: 确立了 **Cormorant Garamond** (Heading) + **Montserrat** (UI) + **Noto Serif SC** (Chinese) 的高奢组合。
  - **交互体验**: 首页实现了 Hero (2.5s 缓慢淡入) -> Poetry (100vh 人文独白) -> Placeholder 的节奏递进。
- **Elite Admin 后台架构精简与深度集成**:
  - **交互重塑**: 废弃用户管理列表，改为侧边栏底部点击头像唤起 **Modal 弹窗** 直接修改个人信息，极简化操作流。
  - **全栈集成**: `blogAdmin` 成功接入 `blogApi` 登录接口，实现了 JWT 认证与全局路由拦截（`getInitialState`）。
  - **响应标准化**: 建立了后端 `TransformInterceptor` 与前端 `request` 封装，确立了全栈 `{ code, data, message }` 的通信协议。
- **技术底层优化**:
  - **类型补全**: 修复了 UmiJS v4 动态模型的 TS 报错，完善了 `src/app.ts` 与 `src/access.ts` 配置。
  - **数据同步**: 修复了 `@newblog/validation` 共享包的编译导出逻辑，确保其在 NestJS 环境下稳健运行。
- **小白级文档体系**:
  - 确立了“餐厅/厨房”比喻模型，并在 `apps/blogApi/README.md` 和 `GEMINI.md` 中以此为准则进行了通俗化改写。

### 📦 交付物

- `apps/blogAdmin/src/layouts/`: 集成个人信息修改弹窗的高奢侧边栏。
- `apps/blogApi/src/auth/`: 具备自动初始化能力的认证模块。
- `apps/blogApi/src/common/`: 统一响应格式处理工具集。
- `docs/sessions/2026-04-07_session_backup.md`: 本次会话全景备份。

---

## 2026-04-03：交互深度进化、语义化 i18n 与 Apple Style 视觉闭环

### 🚀 重大变更

- **Header 布局终极重构**:
  - 确立了左（Logo）、中（目录）、右（Actions）的三列式布局。
  - 全站样式规范化：强制要求使用 **SCSS** 书写，并为 Header 设定了 `1300px` 的最大宽度红线。
  - **Apple Style 主题开关**: 实现了胶囊式切换开关，具备物理质感的回弹动效与分层图标显示，彻底解决了图标遮挡与对齐问题。
- **语义化 i18n 系统**:
  - 接入 **简体中文 (zh)** 与 **英文 (en)** 双语支持。
  - **创新实践**: 采用“中文语义化 Key”（如 `t('页头.搜索')`）替代传统的英文路径，显著提升了开发者在 Vue 模板中的直观感官。
  - 解决了 Astro 独立孤岛下的 Pinia 水合报错（通过显式单例注入）。
- **极简极客页脚**:
  - 根据参考风格完成 Footer 重构，实现了“左版权、中动力、右社交”的三段式布局。
  - 全面支持亮暗色切换，移除了所有背景色硬编码。
- **Astro 生命周期适配**:
  - 针对 `View Transitions` 的 `swap` 机制，建立了状态重注流程，确保在页面跳转后主题与语言配置 100% 维持。
  - 将 Header 触发点优化至首屏 50% 位置，增强了视觉流动的平滑度。
- **架构清理**: 彻底移除 `Hero.astro` 及其相关缓存，将首页 Hero 转化为 Vue 孤岛以保证 i18n 响应性。

### 📦 交付物

- `apps/blogWeb/src/components/HeaderActions.vue`: 集成主题与语言控制的核心组件。
- `apps/blogWeb/src/locales`: 语义化语言包。
- `apps/blogWeb/src/hooks/useI18n.ts`: 具备 Pinia 自动注入能力的国际化 Hook。
- `apps/blogWeb/src/components/Footer.astro`: 适配亮暗色的新版页脚。

---

## 2026-04-02：架构定型与 Monorepo 初始化

### 🚀 重大变更

- **Monorepo 落地**: 基于 **pnpm workspaces** 建立了统一的代码管理模式。
  - `apps/blogWeb`: 前台门户 (Vue 3.4)。
  - `apps/blogAdmin`: 后台管理 (React 18)。
  - `apps/blogApi`: 后端服务 (NestJS v10)。
  - `apps/blogMobile`: 移动端 (uni-app)。
  - `packages/validation`: 全栈共享的校验包 (Zod)。
- **数据库建模**: 确立了以 **Prisma ORM** 为核心的 MySQL 数据库模型。
  - 核心表：`User`, `Game`, `Doc`, `Bookmark`。
- **技术规范确立**:
  - 全面使用 **TypeScript** 以保证类型安全。
  - 引入 **Husky + Commitlint** 规范代码提交。
  - 接入 **Prettier + ESLint** 确保代码风格统一。

### 📦 交付物

- 完整的目录结构与 `pnpm-workspace.yaml`。
- `apps/blogApi/prisma/schema.prisma` 基础模型。
- `@newblog/validation` 基础 Schema 定义。
