# 项目开发归档 (Development Archive)

> 本文档用于记录 NewBlog 项目的重大技术决策、核心功能交付及里程碑节点。它将作为前台“归档”或“时光机”板块的数据源。

---

## 2026-04-07：精英排版系统、首屏布局重构与极致体验闭环

### 🚀 重大变更

- **精英排版系统 (Elite Typography)**:
  - **核心选型**: 确立了以 **Cormorant Garamond** (Heading/Logo) 和 **Montserrat** (Body/UI) 为核心的高奢字体栈。
  - **中文字体同步**: 全站接入 **Noto Serif SC** (思源宋体)，确保中西文字形在视觉重量与气质上高度对齐。
- **首屏 (Hero) 深度重构**:
  - **并排式布局**: 实现了 `MuYuCat` 副标题与 4 个社交图标（GitHub, Telegram, WeChat, Email）的水平并排展示。
  - **视觉分割**: 通过垂直分割线 (`border-left`) 与弹性间距营造出极简且专业的高端杂志排版感。
  - **极简动力学**: 移除了所有复杂的 Stagger 动效，改为单一的、时长 **2.5s** 的全局淡入动画，追求极致的静谧感。
- **安全与交互实践**:
  - **链接安全**: 为所有 `target="_blank"` 链接强制添加了 `rel="noopener noreferrer"`，防御钓鱼攻击并提升跨进程性能。
  - **邮件唤起**: 实现了基于 `mailto:` 协议的邮件直接联系功能。
  - **彻底解决 FOUC (闪烁)**: 通过阻塞式内联脚本与 `transition: none` 策略，彻底解决了亮暗主题初始化时的视觉抖动。
- **资产系统最终更迭**:
  - **Favicon**: 统一使用 `MuYuCat.png` 作为网站图标。
  - **Logo**: 弃用 SVG 方案，全站接入专用 PNG 资产（亮色 `light.png` / 暗色 `dark.png`），确保了品牌形象的极致细腻度。
- **排版与背景统一**: 彻底统一了全站底色，消除了不同分屏间的色差断层。

### 📦 交付物

- `apps/blogWeb/src/style.css`: 统一定义了高奢字体栈与亮色紫/暗色白的主题 Token。
- `apps/blogWeb/src/views/index/Hero.vue`: 实现了极简并排布局与长效淡入动效。
- `apps/blogWeb/src/layouts/Layout.astro`: 引入了 Google Fonts 字体资源及防闪烁脚本。
- `apps/blogWeb/src/components/Navbar.vue`: 适配了思源宋体的导航项排版。

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

...（此处保留原有 04-02 内容）
