# 项目开发归档 (Development Archive)

> 本文档用于记录 NewBlog 项目的重大技术决策、核心功能交付及里程碑节点。它将作为前台“归档”或“时光机”板块的数据源。

---

## 2026-04-08：菜单空间站 (Spatial Menu) 全栈闭环与架构精修

### 🚀 重大变更

- **菜单管理系统 (Menu Station)**:
  - **后端建模**: 在 Prisma 中建立了 `Menu` 模型，支持无限层级、i18n 标识、排序权重及状态控制。
  - **高级交互**: 实现了“空间控制台”式的交互逻辑。左侧为 Bento Grid 轨道网格，右侧为磨砂玻璃详情面板。支持双击反转选中态、面板平滑滑入滑出动效（GSAP）。
  - **状态感知**: 引入了 `ONLINE`/`PAUSED` 实时状态可视化，已禁用节点自动应用灰度滤镜。
- **前台动态化 (blogWeb Integration)**:
  - **数据驱动**: 彻底弃用了前台 Navbar 的硬编码 Mock 数据，改为由后端接口 `/public-menu/tree` 实时驱动。
  - **极简翻译**: 创新性地采用了“降维翻译”逻辑：中文模式取 `name`，英文模式取 `i18nKey`。实现了零配置、免维护语言包的国际化方案。
- **全栈架构精修**:
  - **路由对齐**: 统一了 `blogAdmin`、`blogWeb` 与 `blogApi` 的代理重写逻辑，确保了接口调用的高度一致性。
  - **响应式排版**: 引入 `clamp()` 函数重塑了核心标题系统，实现了在不同屏幕高宽度下的完美字体适配。
- **后端质量跃迁 (blogApi)**:
  - **100% Lint 通过**: 修复了 `auth` 模块所有的 `any` 滥用、`require` 引用及类型推导错误。
  - **类型安全**: 通过接口扩展 `Request` 接口，实现了 JWT Payload 的强类型校验。

### 📦 交付物

- `apps/blogApi/src/menu/`: 完整的菜单 CRUD 模块。
- `apps/blogAdmin/src/pages/menu/`: 高级菜单管理交互界面。
- `apps/blogWeb/src/store/nav.ts`: 动态导航数据流。

---

## 2026-04-08：2FA 逻辑闭环与登录视觉复刻

### 🚀 重大变更

- **2FA 安全一致性修复 (blogApi)**:
  - **密钥持久化逻辑**: 修复了 `generate2FASecret` 接口每次调用都生成新密钥的漏洞。现在系统会优先使用数据库中已有的密钥，确保“查看二维码”与“绑定验证”时的 TOTP 码 100% 一致。
- **登录页视觉复刻 (Legacy Visuals)**:
  - **左侧排版复原**: 恢复了品牌展示区 (`brand-side`) 的双行 Slogan 与 GSAP 交错入场动画。
  - **动态底图回归**: 重新引入了 `glow-orb` 动态光晕背景，配合 120px 高斯模糊营造出深邃的数字净土氛围。
  - **逻辑并轨**: 在保留 2FA 登录流程与右侧新版卡片样式的同时，实现了视觉感官的“完美回溯”。
- **安全退出交互轻量化**:
  - **Popconfirm 替代 Modal**: 将侧边栏底部的“安全退出”由全屏 Modal 改为 `Popconfirm` 气泡确认框。
  - **体验优化**: 气泡框通过 `placement="rightBottom"` 贴合按钮弹出，并增加了磨砂玻璃效果与“点错了”等具备温度感的交互文本。

### 📦 交付物

- `apps/blogApi/src/auth/auth.service.ts`: 具备密钥复用能力的 2FA 核心逻辑。
- `apps/blogAdmin/src/pages/login/`: 视觉与功能并存的混合版登录系统。
- `apps/blogAdmin/src/layouts/index.tsx`: 集成轻量化气泡确认的全局布局。

---

## 2026-04-08：Elite Admin 架构解放与极致视觉同步

### 🚀 重大变更

- **架构大革命 (blogAdmin)**:
  - **弃用 ProLayout**: 彻底移除了 UmiJS 默认的自动布局插件，改为在 `src/layouts/index.tsx` 中手动实现全局布局。
  - **掌控力提升**: 解决了 `ProLayout` 内部状态闭包导致的亮暗模式切换延迟问题，实现了 100% 的实时渲染响应。
- **极致视觉同步 (Full-Stack UI)**:
  - **色值对齐**: 将 `blogAdmin` 的暗色模式背景色精准锁定为 `#0a0a0c`，与 `blogWeb` 完美对齐，消除了侧边栏与内容区的色差。
  - **高奢侧边栏 (V2)**: 实现了“大色块菜单”交互，引入了 `Cormorant Garamond` 衬线体标题与 PITAO 系列随机头像。
  - **性能优化**: 启用了 Ant Design 5 的 `cssVar: true` 模式，并采用“DOM 优先反馈”策略，使主题切换达到丝滑的 0 延迟感。
- **品牌体系闭环**:
  - **标识同步**: 统一了全站的 `MuYuCat` Logo、Favicon 以及网页标题 (`MuYuCat - 管理后台`)。
  - **全局规范**: 在 `GEMINI.md` 中强制确立了“全程中文交流”与“内容完整性”的开发红线。

### 📦 交付物

- `apps/blogAdmin/src/layouts/index.tsx`: 手搓的高性能全局布局组件。
- `apps/blogAdmin/src/layouts/index.scss`: 适配亮暗模式的“流动玻璃”样式表。
- `apps/blogAdmin/public/MuYuCat.png`: 同步后的品牌图标。

---

## 2026-04-07：全站精英视觉体系闭环与 Elite Admin 深度重塑

### 🚀 重大变更

- **后端代码质量进化 (blogApi)**:
  - 彻底清理了 NestJS 项目的 ESLint 顽疾。
  - **规范化**: 修复了 `any` 滥用、未等待的 Promise (`no-floating-promises`)、以及 `async` 函数中缺少 `await` 的警告。
  - **健壮性**: 为全局过滤器 (`HttpExceptionFilter`) 建立了结构化的 `ErrorResponse` 类型定义，确保了错误消息提取的安全性。
- **前台门户体验增强 (blogWeb)**:
  - **网络层重构**: 将开发环境代理 (Proxy) 从 `request.ts` 迁移至 `astro.config.mjs`，实现了更专业的解耦。
  - **沉浸式 404**: 基于 **MuYuCat (木鱼猫)** 品牌调性与“毛线球”插图，设计了具备叙事感的 404 页面，支持 100vh 动态背景与全栈亮暗色适配。
- **Elite Admin 侧边栏重构 (Sidebar-Centric)**:
  - **布局革命**: 废弃了顶部 Header，确立了以侧边栏为核心的“垂直流”布局。
  - **品牌集成**: 侧边栏头部集成了 MuYuCat 动态 Logo 与大尺寸亮暗切换按钮 (`20px`)。
  - **个性化体验**: 引入了 **PITAO 系列随机头像** 系统，每次登录/刷新均可获得不同的猫咪/动物形象，并放大了头像显示尺寸 (`48px`)。
  - **蓝图可视化**: 完成了 5 个核心模块（菜单、游戏、文章、资源、日志）的 Demo 页面搭建与路由同步，实现了“所见即所得”的功能蓝图。
- **技术底层稳固**:
  - **类型声明**: 解决了静态资源 (`.png`) 在 TypeScript 下的 `TS(2307)` 找不到模块问题。
  - **运行时扩展**: 成功将复杂的 UI 逻辑从独立 Layout 组件迁移至 UmiJS 的 `RunTimeLayoutConfig` (`app.tsx`)，解决了侧边栏菜单渲染丢失的架构难题。

### 📦 交付物

- `apps/blogWeb/src/pages/404.astro`: 具备品牌叙事感的 404 错误页。
- `apps/blogAdmin/src/app.tsx`: 集成了主题切换与随机头像逻辑的运行时布局配置。
- `apps/blogAdmin/src/pages/`: 完整的后台功能模块 Demo 矩阵。
- `apps/blogAdmin/src/typings.d.ts`: 全局静态资源类型声明文件。

---

## 2026-04-07：全站精英视觉体系闭环与 Elite Admin 早期启动 (旧记录备份)

...

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
