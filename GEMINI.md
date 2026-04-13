# NewBlog 项目上下文同步指令 (GEMINI.md)

> **重要提示**：本文件是 Gemini CLI 的最高优先级执行指南。在任何新会话开始或执行重大任务前，你必须阅读本文件，并以此为基础同步项目现状。

---

## 1. 强制初始化同步 (Initialization Ritual)

为了确保不丢失上下文，你 **必须** 在每次任务开始前，通过 `read_file` 或 `grep_search` 同步以下关键文件：

### A. 项目编年史 (Core History) - **必读**

- `docs/developmentArchive.md`：记录项目所有重大里程碑、版本更迭与技术决策。

### B. 项目文档目录 (`docs/`)

- `docs/systemOutline.md`：核心架构、板块设计与技术选型。
- `docs/requirements.md`：详细业务功能与接口定义（包含 Bento Grid 首页与高质感阅读设计）。
- `docs/codeSpecification.md`：代码规范（命名、校验、样式、SEO 强制化）。
- `docs/developmentNotes.md`：环境配置与底层技术记录。
- `docs/knowledgeBase.md`：全栈 SSG 数据策略、渲染模式对比、高级交互与 SEO 增强指南。

---

## 2. 核心架构与现状摘要

### 项目定位

基于 **pnpm workspaces (Monorepo)** 的全栈个人门户，集成游戏数据同步、CMS 与资源剪藏。

- **注意**: `blogWeb` (前台) **仅限桌面端 (Desktop Only)**，不考虑移动端适配，追求极致的 PC 视觉效果。移动端需求由 `blogMobile` (uni-app) 独立承担。

### 关键技术栈

- **后端**: NestJS v10 + Prisma ORM v6.2.1 + MySQL。
- **后台**: React 18 + UmiJS v4 (@umijs/max) + Ant Design v5 + Tailwind CSS。
- **前台**: **Astro + Vue 3.4 (Islands Architecture)** + GSAP + Tailwind CSS。
- **移动端**: uni-app (Vue 3 + TS)。
- **校验**: 全栈统一使用 `@newblog/validation` (Zod)。

---

## 3. 开发硬性准则 (Development Mandates) - **执行红线**

### A. 全栈主题适配 (Theme Switching)

- **强制性**: `blogWeb` 所有新页面、新组件 **必须** 完整支持亮/暗色模式切换。
- **实现手段**: 严禁在组件内硬编码颜色（如 `#fff`, `white`, `black`），必须统一使用 `src/style.css` 定义的 CSS 变量（`--bg`, `--text`, `--text-h`, `--border`, `--code-bg` 等）。
- **同步机制**: 确保所有孤岛组件通过 `useThemeStore` 保持状态同步，并处理 Astro View Transitions 的 `after-swap` 生命周期。

### C. 质量与完整性 (Quality & Integrity)

- **语言规范 (Language Mandate)**: **强制性**: Gemini CLI 在本项目的所有交互、文档更新、代码注释及任务执行过程中，必须全程使用 **中文**。
- **内容完整性**: **严禁**在更新任何 Markdown 文件（特别是 `GEMINI.md` 和 `docs/*.md`）时使用省略号（如 `...`）或占位符（如 `(此处省略...)`）来替代已有内容。每次修改必须保持文件的语义完整与历史连续性。
- **上下文透明**: 任何对已有逻辑的重构或变更，必须在相关文档中清晰记录，不得模糊处理。

### D. 全栈统一请求与响应封装 (Unified Request & Response)

为了让代码更整洁，我们对前端（Web/Admin）和后端（API）的通信进行了“统一装修”：

- **后端返回格式**: 每一条数据都会装在一个标准盒子里：

  ```json
  { "code": 200, "data": { ...数据内容 }, "message": "success" }
  ```

  - `code`: 状态码。200 是成功，4xx/5xx 是各种失败。
  - `data`: 真正的“干货”数据。
  - `message`: 给程序员看的提示信息。

- **后端实现**: 通过 `TransformInterceptor` 自动打包成功数据，通过 `HttpExceptionFilter` 统一处理报错。
- **前端实现**: 封装了 `request` 工具。请求时自动带上 `token`，收到后自动拆开“盒子”把 `data` 给到页面，如果 `code` 不对会自动弹窗报警。

### E. 后端 API 系统：小白级通俗解说 (餐厅比喻)

为了让任何人都能秒懂 `blogApi` 的复杂逻辑，我们把它想象成一家**高级餐厅**：

1.  **`src/main.ts` (餐厅总开关)**: 每天开门的第一件事。规定了餐厅开在哪个路口（端口 3000），并请好了**拦截器**（负责给外卖打包）和**过滤器**（负责处理客人的投诉）。
2.  **`src/app.module.ts` (行政大管家)**: 餐厅的总负责人。他手里有一张大地图，知道厨房里有哪些部门（比如登录部、文章部、游戏部），并负责把它们协调在一起，不让大家打架。
3.  **`src/prisma.service.ts` (仓库管理员)**: 他专门负责跟**仓库 (MySQL 数据库)** 打交道。你想存菜（存文章）、取菜（读数据）都得找他，他会把你的话翻译成仓库听得懂的语言。
4.  **`src/common/` (公共更衣室)**: 放置了所有模块共用的工具，比如那个统一给数据“打包装盒”的服务（Interceptor）。
5.  **`src/auth/` (门卫与认证部)**:
    - `auth.controller.ts` (**接待处**): 负责接收客人的登录请求。他只负责“接活”和“给结果”，如果客人没带证件，他就直接拒之门外。
    - `auth.service.ts` (**保卫科大脑**): 真正干重活的地方。他会去仓库查有没有这个用户，对比密码是否正确，并给通过的人发一个“进门证”（JWT Token）。
    - `auth.module.ts` (**保卫科包裹**): 把接待处、保卫科大脑和仓库管理员打包在一起，方便大管家调用。

### F. API 系统维护准则 (API Maintenance Mandates)

- **通俗易懂 (Accessibility)**: **强制要求** API 系统的所有代码结构、变量命名、README 以及注释，必须保持“小白级”的通俗度。禁止使用过于晦涩的术语而不加解释。
- **文档优先 (Documentation First)**: 任何对 `blogApi` 目录结构或核心逻辑的修改，必须第一时间同步更新至 `apps/blogApi/README.md`，并确保比喻（餐厅模型）的一致性。
- **结构清晰 (Structural Clarity)**: 严格遵守 NestJS 的模块化规范，确保每个文件职责单一，像厨房的分工一样明确。

---

## 5. 当前任务与下一步

- **同步点**: 2026-04-13 (Admin 架构稳固与文章管理闭环)
  - [x] **架构级修复 (Build Stabilization)**: 通过禁用 MFSU 并强制 React 单例，彻底解决了 `bytemd` 引起的 Hook 报错与容器丢失故障。
  - [x] **菜单协议重构**: 修复了 `/article` 路径 Key 冲突，实现了导航逻辑与 UI 生成的物理隔离。
  - [x] **内容空间枢纽 (Article Hub)**: 将原有的智库博文与随笔日志页面完美合并，实现了基于“主题维度”的统一管理。
  - [x] **审计日志级视觉重塑**: 内容列表完全对齐“日志管理”的高精密 Grid 布局，支持类型感知渲染。
  - [x] **全栈 API 补全**: `ArticleService` 实现了分页、关键词搜索及精确到秒级的时间范围查询。
  - **待办 (Next Steps)**:
    1. **[后台] 发射中心补全**: 在 `apps/blogAdmin/src/pages/article/edit.tsx` 中完善支持 Word (mammoth.js) 协议转换的高级编辑器。
    2. **[前台] 视觉奇观开发**: 基于 `Pretext.js` + `GSAP` + `Canvas` 实现文章加载时的“文字坠落成海”物理特效。
    3. **[移动端] 跨端启动**: 启动 `blogMobile` (uni-app) 的实质性页面构建。

---

**由 Gemini CLI 自动维护 @ 2026-04-13 18:00**
