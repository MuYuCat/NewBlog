# 个人门户系统详细需求文档 (Product Requirements Document)

本方案围绕 **个人展示门户、游戏轨迹、知识智库、资源宝库** 四大核心板块，定义了各端的功能与交互逻辑。

---

## 0. 认证与访问控制 (Auth & Access)

### 0.1 前后台权限分离

- **前台门户 (blogWeb)**:
  - **定位**: 纯展示性质，**无需登录页面**。
  - **访问**: 全公开，所有内容（除草稿外）均可被访客浏览。
- **后台管理 (blogAdmin)**:
  - **定位**: 核心管理端，负责所有内容的增删改查。
  - **登录页**: 采用简约毛玻璃样式，使用 `@newblog/validation` 提供的 `LoginSchema` 进行校验。
  - **安全**: 仅支持单管理员账号（ADMIN 角色）。

### 0.2 后端支持 (blogApi)

- `POST /auth/login`: 仅供后台管理系统调用。
- `GET /feed.xml`: 生成符合 RSS 2.0 标准的 XML，支持 Follow/Inoreader 等订阅器。

---

## 1. 前台门户展示 (blogWeb - High Quality UI)

### 1.1 首页设计 (Bento Grid Style)

参考 `moyuin.top` 的布局，采用现代 **Bento Grid (便当盒)** 网格系统：

- **主视觉区**: 包含个人简介、实时社交状态（GitHub 热力图、MBTI 标签、当前所在地）。
- **板块聚合**:
  - **最近在玩**: 展示最新的 Steam/PSN 游戏卡片，带悬浮光影效果。
  - **最新文档**: 展示最近更新的 3-5 篇技术笔记或长文。
  - **兴趣跑马灯**: 使用 **CSS Marquee** 循环展示听歌列表、常读书目或常用工具图标（SVG）。
- **布局规范 (Desktop Only)**:
  - **最大宽度限制**: 主容器 `max-width: 1200px`，大屏幕居中。
  - **自适应策略**: **禁止** 自动折叠。锁定 4 列或多列网格布局，若视口过窄，允许出现横向滚动或提示使用桌面浏览器。建议最小宽度 `1024px`。

### 1.2 文档阅读页 (Immersive Reading)

- **字体系 (Typography)**:
  - 采用 `Inter` (西文) + `PingFang SC` (中文) 组合。
  - 黄金行高 `1.8`，字号基准 `16px-18px`，开启抗锯齿渲染。
- **动效 (Interaction)**:
  - **滚动渐入 (Scroll Reveal)**: 页面滚动时，段落、图片与代码块平滑浮现。
  - **代码高亮**: 集成 **Shiki**，实现与编辑器一致的像素级语法高亮。
  - **无缝续读**: 底部自动加载关联或下一篇文章，支持平滑滚动与 URL 静默更新。

---

## 2. 板块功能明细

### 2.1 游戏轨迹 (Game Hub)

- **Admin 端**: 配置 API Key，手动或定时触发全量数据同步。
- **Web 端**: 游戏详情页支持成就墙展示，背景自适应封面色（高斯模糊）。

### 2.2 知识智库 (CMS)

- **Admin 端**:
  - 树状结构管理目录。
  - Markdown 编辑器，支持图片拖拽自动上传 OSS。
- **Web 端**: 自动提取文章 H1/H2 标题生成右侧悬浮目录（TOC）。

### 2.3 资源宝库 (Resource Hub)

- **Admin 端**: 智能剪藏，通过 URL 自动抓取 Open Graph 元数据。
- **Web 端**: 瀑布流（Masonry）展示收藏资源，支持分类筛选。

---

## 3. 技术实现要点 (Key Tech Specs)

- **CSS 方案**: Tailwind CSS (blogAdmin) + SCSS/Vanilla CSS (blogWeb)。
- **动效库**: **GSAP + ScrollTrigger** (用于 blogWeb 高级动效)。
- **校验**: 全程引用 `@newblog/validation` 保持数据流安全。
- **分发**: 每一个文档更新，自动同步到 `/feed.xml` 以驱动 RSS 订阅。

---

**由 Gemini CLI 需求分析重构更新 @ 2026-04-03**
