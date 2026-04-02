# NewBlog 项目上下文同步指令 (GEMINI.md)

> **重要提示**：本文件是 Gemini CLI 的最高优先级执行指南。在任何新会话开始或执行重大任务前，你必须阅读本文件，并以此为基础同步项目现状。

---

## 1. 强制初始化同步 (Initialization Ritual)

为了确保不丢失上下文，你 **必须** 在每次任务开始前，通过 `read_file` 或 `grep_search` 同步以下关键文件：

### A. 项目文档目录 (`docs/`)

- `docs/systemOutline.md`：核心架构、板块设计与技术选型。
- `docs/requirements.md`：详细业务功能与接口定义。
- `docs/codeSpecification.md`：**代码规范白皮书**（命名、校验、样式）。
- `docs/developmentNotes.md`：历史开发进度与环境配置记录。
- `docs/knowledgeBase.md`：项目涉及的知识库补充。

### B. 核心包依赖与说明 (`package.json` & `README.md`)

- **根目录**: `package.json`, `README.md` (Monorepo 整体配置)。
- **后台 (Admin)**: `apps/blogAdmin/package.json`, `apps/blogAdmin/README.md` (UmiJS v4)。
- **前台 (Web)**: `apps/blogWeb/package.json`, `apps/blogWeb/README.md` (Vue 3)。
- **API (Api)**: `apps/blogApi/package.json`, `apps/blogApi/README.md` (NestJS + Prisma 6)。
- **移动端 (Mobile)**: `apps/blogMobile/package.json`, `apps/blogMobile/README.md` (uni-app)。
- **共享包 (Validation)**: `packages/validation/package.json` (Zod Schema)。

---

## 2. 核心架构与现状摘要

### 项目定位

基于 **pnpm workspaces (Monorepo)** 的全栈个人门户，集成游戏数据同步、CMS 与资源剪藏。

### 关键技术栈

- **后端**: NestJS v10 + Prisma ORM v6.2.1 + MySQL。
- **后台**: React 18 + UmiJS v4 (@umijs/max) + Ant Design v5 + Tailwind CSS。
- **前台**: Vue 3.4 + Vite 5 + Pinia + Element Plus。
- **移动端**: uni-app (Vue 3 + TS)。
- **校验**: 全栈统一使用 `@newblog/validation` (Zod)。

### 开发守则 (Code Standards)

- **命令**: 统一使用 `pnpm --filter <pkg> <cmd>`；Admin 专用 `max` 命令，Api 专用 `nest` 命令。
- **命名**: 目录与文件 `lowerCamelCase`；组件 `PascalCase`；Schema 以 `Schema` 结尾。
- **类型安全**: 严禁 `any`，全栈集成 `@newblog/validation` 进行模型校验。

---

## 3. 当前任务与下一步

- **同步点**: 2026-04-02
  - [x] 完成 blogAdmin 从 Next.js 向 UmiJS v4 (@umijs/max) 的完整重构。
  - [x] 完成 @newblog/validation 共享包的创建与全栈引用集成。
  - [x] 完成 Prisma 6 数据库建模与 NestJS PrismaService 编写（已跑通启动流程）。
- **待办**:
  1. 执行 `npx prisma migrate dev --name init` 同步数据库物理表。
  2. 实现 API 层的 Auth 认证模块（JWT + Passport）。
  3. 开发 Admin 系统的登录界面并对接后端 Auth 接口。

---

**由 Gemini CLI 自动维护 @ 2026-04-02**
