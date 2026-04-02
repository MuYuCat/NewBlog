# 个人门户系统详细需求文档 (Product Requirements Document)

本方案围绕 **基础认证、游戏轨迹、知识智库、资源宝库** 四大核心板块，详细定义了各端（前台、后台、移动端、API）的功能与交互逻辑。

---

## 0. 基础认证与单点登录 (Auth & SSO)

### 0.1 核心认证页面 (前台/后台通用)

- **登录页 (Login)**
  - **样式**: 简约居中卡片，背景采用动态粒子或毛玻璃效果。
  - **交互**: 使用 `@newblog/validation` 提供的 `LoginSchema` 进行实时校验。支持账号密码登录、记住我（Persistent Session）。
- **注册页 (Register)**
  - **交互**: 包含用户名重复校验、密码强度提示。使用 `RegisterSchema` 校验。

### 0.2 [单点登录 (SSO)](./knowledgeBase.md#sso) 需求

- **目标**: 用户在 `blogWeb` (前台) 登录后，访问 `blogAdmin` (后台) 时无需再次输入密码，实现一端登录，全端通用。
- **实现逻辑**:
  1.  **统一认证中心**: `blogApi` 作为唯一的 Identity Provider。
  2.  **Cookie 共享**: 在同一根域名下（如 `*.me.com`），利用 Domain Cookie 共享 JWT Token。

---

## 1. 板块一：游戏轨迹 (Game Hub)

### 1.1 前台 Web (`blogWeb`)

- **页面：游戏时光墙 (Game Wall)**
  - **样式**: 采用大卡片流（Card Grid），背景高斯模糊（取自当前游戏封面颜色）。
- **页面：游戏详情页**
  - **交互**: 点击成就图标弹出成就达成详情；点击“前往Steam/PSN”外链。

### 1.2 后台 Admin (`blogAdmin`)

- **页面：同步中心**
  - **功能**: 配置 Steam API Key、PSN ID；手动触发数据同步。
- **页面：游戏库维护**
  - **功能**: 修正自动抓取失败的封面图或描述信息。

### 1.3 移动端 App (`blogMobile`)

- **页面：游玩简报**
  - **样式**: 简约列表，侧重展示“最近在玩”及“愿望单价格变动”。

---

## 2. 板块二：知识智库 (CMS)

### 2.1 前台 Web (`blogWeb`)

- **页面：文档概览 (Tree View)**
  - **交互**: 自动生成右侧悬浮文章大纲（TOC）；支持代码块一键复制。

### 2.2 后台 Admin (`blogAdmin`)

- **页面：文档编辑器 (Markdown Editor)**
  - **功能**: 左右分栏预览；支持图片粘贴自动上传至 OSS。

### 2.3 移动端 App (`blogMobile`)

- **页面：阅读器**
  - **样式**: 适配手机屏幕的排版；支持长按选取文字生成分享卡片。

---

## 3. 板块三：资源宝库 (Resource Hub)

### 3.1 前台 Web (`blogWeb`)

- **页面：资源瀑布流 (Resource Masonry)**
  - **样式**: Pinterest 风格瀑布流，展示网站缩略图、标题、描述。

### 3.2 后台 Admin (`blogAdmin`)

- **页面：智能剪藏助手**
  - **交互**: 输入 URL 后，系统自动调用爬虫抓取元数据。

### 3.3 移动端 App (`blogMobile`)

- **页面：快捷收藏**
  - **交互**: 检测剪贴板 URL 自动弹出提示框确认收藏。

---

<span id="api"></span>

## 4. 后端 API 接口定义 (NestJS - `blogApi`)

本节详细说明 API 模块划分及核心接口逻辑。

### 4.1 通用基础模块 (Auth & Common)

- `POST /auth/login`: 登录并返回 JWT Token。使用 `LoginSchema` 校验入参。
- `GET /auth/me`: 获取当前登录用户信息，用于子应用无感鉴权。

### 4.2 游戏模块 (Game Module)

- `GET /games/list`: 获取已同步的游戏记录。
- `POST /games/sync/trigger`: 触发爬虫/API 同步任务。

### 4.3 文档模块 (Doc Module)

- `GET /docs/tree`: 获取文档目录树结构。
- `POST /docs/upsert`: 发布/更新文档。使用 `DocSchema` 校验。

### 4.4 资源模块 (Resource Module)

- `POST /resources/scrape`: 传入 URL，后端返回抓取的元数据。

---

**由 Gemini CLI 需求分析更新 @ 2026-04-02**
