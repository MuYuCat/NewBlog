# 个人门户系统详细需求文档 (Product Requirements Document)

本方案围绕 **个人展示门户、游戏轨迹、知识智库、资源宝库** 四大核心板块，定义了各端的功能与交互逻辑。

---

## 0. 认证与访问控制 (Auth & Access)

### 0.1 前后台权限分离

- **前台门户 (blogWeb)**:
  - **定位**: 纯展示性质，无需登录。
  - **访问**: 全公开，所有发布内容均可被访客浏览。
- **后台管理 (blogAdmin)**:
  - **定位**: 核心管理端，负责全站内容的生命周期管理。
  - **登录页**: 采用极简毛玻璃样式，使用 `@newblog/validation` 提供的 `LoginSchema` 进行校验。
  - **安全**: 仅支持单管理员账号（ADMIN 角色），关键操作记录埋点。

---

## 1. 前台门户展示 (blogWeb - Elite UI)

### 1.1 视觉系统 (Elite Typography & Layout)

- **字体系统**:
  - **Heading**: Cormorant Garamond (衬线体，高奢感)。
  - **Body**: Montserrat (现代感) + Noto Serif SC (思源宋体，精致中文字形)。
- **布局策略**:
  - **Desktop Only**: 仅针对宽屏优化，追求极致的 PC 视觉排版。
  - **100vh 叙事**: 首页采用板块化分屏（Hero -> Poetry -> Bento），形成呼吸感。
- **玻璃磨砂**: Header 采用 `blur(20px)` 的 Glassmorphism 效果，随亮暗模式自适应。

---

## 2. 后台管理系统 (blogAdmin - Elite Admin)

### 2.1 视觉规范

- **风格**: 延续前台的小众高奢质感，拒绝传统企业级样板。
- **UI 框架**: UmiJS v4 + Ant Design v5 (深度定制 Token，圆角 12px~32px)。
- **交互**: 采用浮动侧边栏、大面积留白与 GSAP 平滑过渡。

### 2.2 核心功能模块

1.  **用户管理 (User & Auth)**
    - 管理员个人信息维护：修改姓名、账号、密码、头像。
    - 会话管理：查看当前登录状态与安全策略。
2.  **菜单管理 (Navigation CMS)**
    - 全站导航项配置：支持二级菜单，绑定 i18n 多语言 Key。
    - 动态路径映射与图标分配。
3.  **游戏管理 (Game Sync)**
    - **统计筛选**: 列出账号下所有关联游戏，勾选的游戏才进入统计与前台展示。
    - **原始数据**: 监控从 Steam/PSN 等三方 API 抓取的数据流，支持手动触发重构。
4.  **文章管理 (Content CMS)**
    - 涵盖：知识智库、个人博客、日常随笔。
    - 功能：分类目录树、列表展示、权限管理、全功能编辑器。
5.  **资源宝库 (Vault Management)**
    - 资源剪藏：链接分类（工具、灵感等）、编辑备注、私密状态控制。
6.  **日志管理 (Analytics)**
    - **操作埋点**: 记录所有管理后台的操作审计日志。
    - **数据分析**: 可视化仪表盘，展示 PV/UV、游戏数据趋势、内容阅读分析。

---

## 3. 技术实现要点 (Key Tech Specs)

- **框架**: Astro (Web) / NestJS (Api) / UmiJS (Admin)。
- **动效**: GSAP + ScrollTrigger。
- **样式**: CSS Variables + SCSS + Tailwind (Admin)。
- **校验**: 全程引用 `@newblog/validation`。

---

**由 Gemini CLI 需求分析重构更新 @ 2026-04-07**
