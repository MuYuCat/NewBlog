# NewBlog 项目代码规范白皮书 (Code Specification)

> 本文档定义了 NewBlog 全栈项目的统一开发标准，适用于 NestJS (后端)、Vue 3 (前台)、React (后台) 及 uni-app (移动端)。所有开发者及 AI 助手必须严格遵守。

---

## 1. 命名规范 (Naming Conventions)

| 维度                      | 规范建议                         | 示例                                  |
| :------------------------ | :------------------------------- | :------------------------------------ |
| **目录 (Directory)**      | `lowerCamelCase` (小驼峰)        | `userProfile/`, `authService/`        |
| **普通源文件 (.ts, .js)** | `lowerCamelCase` (小驼峰)        | `userController.ts`, `dataUtils.ts`   |
| **前端组件 (.vue, .tsx)** | `PascalCase` (大驼峰)            | `UserInfoCard.vue`, `LoginButton.tsx` |
| **校验 Schema (Zod)**     | `lowerCamelCase` (后缀为 Schema) | `authSchema.ts`, `docSchema.ts`       |

---

## 2. 数据校验规范 (Data Validation - Zod)

为了确保全栈数据流的安全与一致性，必须严格执行以下 Zod 校验标准：

### 2.1 Schema 命名与导出

- **文件名**: 采用 `lowerCamelCase`，以 `Schema` 结尾（如 `authSchema.ts`）。
- **变量名**: 采用 `PascalCase`，以 `Schema` 结尾（如 `LoginSchema`）。
- **类型导出**: 每个 Schema 必须导出对应的 TypeScript 类型。
  ```typescript
  export const LoginSchema = z.object({ ... });
  export type LoginInput = z.infer<typeof LoginSchema>;
  ```

### 2.2 校验分层策略

1.  **客户端 (Web/Admin/App)**:
    - **职责**: 提供实时的 UI 反馈（表单校验）。使用共享包 `@newblog/validation` 进行本地校验。
2.  **服务端 (blogApi)**:
    - **职责**: 最终数据守门员（DTO 校验）。配合 NestJS `ValidationPipe` 或自定义装饰器执行。

---

## 3. Monorepo 导入规范 (Workspace Imports)

为了确保依赖清晰，所有跨包调用必须遵循以下规范：

- **共享包命名**: 统一使用 `@newblog/` 前缀。
  - 校验包: `@newblog/validation`
- **引用方式**: 禁止使用相对路径（如 `../../packages/validation`），必须使用包名。
  - `import { LoginSchema } from '@newblog/validation';`
- **版本管理**: 在子应用的 `package.json` 中使用 `workspace:*` 保持版本同步。

---

## 4. 自动化质量控制 (Automated Checks)

项目集成了 Husky 与 Lint-staged，执行以下自动化流程：

### 4.1 代码提交拦截 (Pre-commit Hook)

- **执行逻辑**: `prettier --write` -> `eslint --fix`。
- **目标**: 仅校验暂存区变动的文件，确保入库代码 100% 符合 Prettier 风格。

### 4.2 提交信息规范 (Commit-msg Hook)

- **工具**: `Commitlint` (@commitlint/config-angular)。
- **要求**: 必须包含类型前缀，如 `feat:`, `fix:`, `docs:`, `refactor:`, `style:`。

---

## 5. 样式与 CSS 规范 (Styling Strategy)

- **管理后台 (blogAdmin)**: Tailwind CSS + Shadcn/UI (原子类优先)。
- **前台门户 (blogWeb)**: SCSS (Sass) + Scoped CSS。**[强制]** 仅限桌面端 (Desktop Only)，最小宽度 `1200px` 视觉基准。
- **移动端 (blogMobile)**: uni-app (Vue 3 + TS)。**[强制]** 独立移动端应用，采用 `rpx` 单位。
- **单位规范**: `blogWeb` 采用 `vh/vw` 配合 `px` 绝对像素，追求像素级排版。

---

## 6. 代码逻辑与质量 (ESLint Rules)

- **变量**: 优先使用 `const`。
- **类型**: 严禁使用 `any`，必须显式定义 Interface 或 Type。
- **清理**: 禁止存在未使用的变量、导入。
- **日志**: 生产环境严禁保留 `console.log`。

---

## 7. 业务校验逻辑标准 (Business Validation Rules)

为了确保各端体验一致且后端数据安全，所有 Zod Schema 必须遵循以下业务逻辑底线：

### 7.1 账户体系校验

...（此处保持原样）

---

## 8. SEO 与极致性能规范 (SEO & Performance)

为了确保 `blogWeb` 在搜索引擎（Google/Baidu）中获得最佳曝光，必须执行以下强制标准：

### 8.1 语义化 HTML (Semantic Tags)

- 严禁全篇 `div`。必须使用 `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>` 描述内容结构。

### 8.2 TDK 与社交元数据 (Meta Tags)

- **TDK**: 每个页面必须包含独一无二的 `<title>`, `<meta name="description">`。
- **Open Graph**: 强制配置 `og:title`, `og:image`, `og:description`，确保社交分发预览质感。

### 8.3 结构化数据 (JSON-LD)

- 在文章详情页必须注入 JSON-LD 脚本，以便搜索引擎生成“富摘要（Rich Snippets）”。

### 8.4 核心性能指标 (Core Web Vitals)

- **LCP (最大内容渲染)**: 必须在 2.5s 内完成。
- **CLS (累积布局偏移)**: 必须小于 0.1。严禁加载过程中卡片闪烁跳跃。
- **图片优化**: 强制使用 `webp` 格式，并提供 `width` 和 `height` 以预留占位。

---

**由 Gemini CLI 维护并生成 @ 2026-04-03**
