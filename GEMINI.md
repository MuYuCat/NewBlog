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

### B. 性能与视觉

- **Desktop Only**: `blogWeb` 仅面向桌面端优化，移除所有响应式/移动端适配逻辑，追求极致的 PC 质感。
- **GSAP 动效**: 所有核心交互必须具备呼吸感，利用 GSAP 处理进入/退出与滚动动画。

---

## 4. 当前任务与下一步

- **同步点**: 2026-04-03 (会话归档)
  - [x] **架构转型**: 完成 `blogWeb` 从 Vue SPA 向 **Astro + Vue (孤岛架构)** 的深度迁移。
  - [x] **视觉转型**: 全站完成从暗色向 **亮色系 (Apple Style Light Mode)** 的转型，并确立了 **Desktop Only** 强制规范。
  - [x] **交互重构**: 实现了混合 Header 策略、**View Transitions** 无缝跳转及 **Apple Style** 胶囊切换开关。
  - [x] **Header/Footer 重构**: 实现了左、中、右三列布局，全站样式由 **SCSS** 驱动，并严格遵守 `1300px` 宽度限制。
  - [x] **多语言系统**: 接入语义化 i18n 系统（支持中英双语），采用 **“中文 Key”** 模式提升代码可读性。
  - [x] **状态管理**: 解决了 Astro 孤岛下的 Pinia 初始化冲突，实现了跨页面（View Transitions Swap）的主题与语言持久化同步。
- **待办 (Next Steps)**:
  1. **[后端]** 实现内容分发接口：生成 RSS 订阅源 (`/feed.xml`) 及站点地图 (`sitemap.xml`)。
  2. **[后端]** 开发 Webhook 触发机制，打通“后台更新 -> 触发 Astro 自动重构”的 Jamstack 流水线。
  3. **[后台]** 开发 `blogAdmin` 的 UmiJS 登录页面（亮色毛玻璃质感），并接入 `@newblog/validation`。
  4. **[前端]** 接入后端真实接口，替换 `Navbar.vue` 及 `BentoGrid.vue` 中的 Mock 数据。

---

**由 Gemini CLI 自动维护 @ 2026-04-03**
