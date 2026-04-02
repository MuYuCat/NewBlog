# 技术核心知识点解析 (Core Knowledge Points)

本文件用于深入解析博客系统中涉及的关键技术概念、架构选择及其核心逻辑。

---

<span id="monorepo"></span>

## 1. Monorepo (单仓库多项目)

### 1.1 核心选型: pnpm workspaces

项目采用 pnpm 驱动的 Monorepo 架构。

- **配置**: 根目录 `pnpm-workspace.yaml` 定义了 `apps/*` 和 `packages/*`。
- **本地引用**: 通过 `workspace:*` 语法，各端应用可以直接引用本地的 `@newblog/validation`。

---

<span id="api-nestjs"></span>

## 2. 后端核心: NestJS v10

### 2.1 架构设计

NestJS 采用**模块化 (Module-based)** 架构，由 `AppModule` 作为根节点，各业务功能拆分为独立的 `FeatureModule`。

- **Controller**: 处理 HTTP 请求路由。
- **Service**: 编写业务逻辑。
- **Module**: 组装 Provider 并管理依赖注入 (DI)。

### 2.2 核心中间件

- **PrismaService**: 集成 Prisma 客户端，支持 MySQL 数据库操作。
- **ValidationPipe**: 自动校验 DTO。

---

<span id="orm-prisma"></span>

## 3. 数据库 ORM: Prisma v6.2.1

### 3.1 为什么选择 v6 而非 v7？

针对 Prisma 7.x 强制要求 Driver Adapters 和废弃 `schema.prisma` 链接的激进变更，本项目选择稳定的 **v6.2.1** 以确保本地开发的简洁性与稳定性。

### 3.2 核心流程

1.  **Schema 定义**: 在 `prisma/schema.prisma` 中定义模型。
2.  **Migration**: `npx prisma migrate dev` 将 Schema 同步到物理数据库。
3.  **Generate**: `npx prisma generate` 生成带强类型的客户端代码。

---

<span id="admin-umi"></span>

## 4. 后台框架: UmiJS v4 (@umijs/max)

### 4.1 企业级插件系统

`@umijs/max` 集成了后台管理所需的全家桶：

- **Ant Design v5**: 配合 **ProComponents** 快速构建 UI。
- **Tailwind CSS**: 原子类样式。
- **Model**: 基于 Hooks 的轻量化全局状态管理。

### 4.2 路由与布局

支持约定式路由和配置式路由。本项目采用 **配置式路由**，在 `.umirc.ts` 中显式定义布局。

---

<span id="validation"></span>

## 5. 共享数据校验 (Shared Validation)

### 5.1 工作流

1.  **packages/validation**: 在此定义全栈共用的 Zod Schema。
2.  **前端**: 引用 Schema 进行表单校验（实时反馈）。
3.  **后端**: 引用 Schema 进行 DTO 校验（最终拦截）。

---

**由 Gemini CLI 知识点同步更新 @ 2026-04-02**
