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
- **前台门户 (blogWeb/blogMobile)**: SCSS (Sass) + Scoped CSS (追求定制化动效)。
- **单位规范**: Web 端 `rem/px`，移动端 `rpx`。

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

- **用户名 (Username)**:
  - 长度：3 - 20 位。
  - 规则：仅限字母、数字、下划线，必须以字母开头。
- **密码 (Password)**:
  - 长度：8 - 32 位。
  - 规则：必须包含大小写字母、数字及特殊字符。
- **邮箱 (Email)**:
  - 规则：标准 Email 格式校验，且必须进行 `.toLowerCase()` 处理。

### 7.2 内容管理校验

- **文章/文档标题 (Title)**:
  - 长度：2 - 100 字。
  - 规则：禁止全空格，自动执行 `.trim()`。
- **资源描述 (Description)**:
  - 长度：最大 500 字。
- **标签/分类 (Tag/Category)**:
  - 长度：1 - 20 字。
  - 数量限制：单篇文章标签建议不超过 5 个。

### 7.3 统一报错信息规范

- **格式**: 采用“字段名 + 错误类型”模式。
- **示例**:
  - 必填项：`"请填写用户名"`
  - 长度不符：`"用户名长度应为 3-20 位"`
  - 格式错误：`"密码必须包含数字和字母"`

---

**由 Gemini CLI 维护并生成 @ 2026-04-02**
