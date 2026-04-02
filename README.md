# NewBlog: 企业级全栈个人门户/博客系统

本项目是一个集 **游戏轨迹、知识智库、资源宝库** 于一体的全栈个人门户系统，采用现代化的 [Monorepo](#1-monorepo-单仓库多项目) 架构进行开发与管理。

---

## 目录
- [1. 技术大纲与架构设计](#1-技术大纲与架构设计)
  - [核心板块设计](#核心板块设计)
  - [开发环境与包管理](#开发环境与包管理)
  - [项目架构优化](#项目架构优化)
  - [技术栈概览](#技术栈概览)
- [2. 详细需求文档 (PRD)](#2-详细需求文档-prd)
  - [基础认证与单点登录 (SSO)](#基础认证与单点登录-sso)
  - [板块一：游戏轨迹 (Game Hub)](#板块一游戏轨迹-game-hub)
  - [板块二：知识智库 (CMS)](#板块二知识智库-cms)
  - [板块三：资源宝库 (Resource Hub)](#板块三资源宝库-resource-hub)
  - [后端 API 接口定义](#后端-api-接口定义)
- [3. 核心知识点解析](#3-核心知识点解析)
  - [Monorepo (单仓库多项目)](#1-monorepo-单仓库多项目)
  - [单点登录 (SSO)](#2-单点登录-single-sign-on--sso)
- [4. 开发笔记与环境搭建](#4-开发笔记与环境搭建)
  - [MySQL 安装与配置](#mysql-安装与配置)
  - [数据库管理](#数据库管理)
- [5. 官方技术文档](#5-官方技术文档)

---

## 1. 技术大纲与架构设计

本系统针对游戏数据接入、文档管理及资源收藏进行了深度架构优化，支持高度可扩展性。

### 核心板块设计
1. **游戏轨迹 (Game Hub)**: 聚合 PS 与 Steam 游玩记录、成就及愿望单，支持自动同步与降价提醒。
2. **知识智库 (CMS)**: 高性能文档系统，支持 Markdown/富文本、版本历史、树状目录及全文搜索。
3. **资源宝库 (Resource Hub)**: 智能剪藏链接，自动抓取元数据，支持瀑布流展示与移动端快速录入。

### 开发环境与包管理
*   **Node.js 管理**: 使用 **nvm** (推荐 v20 LTS)。
*   **包管理**: **pnpm** (极速、节省空间)。
*   **仓库模式**: **[Monorepo](#1-monorepo-单仓库多项目)** (pnpm workspaces)。
*   **镜像源**: `https://registry.npmmirror.com`。

### 项目架构优化
*   **后端 API (NestJS)**: 模块化设计 (`GameModule`, `DocModule`, `ResourceModule`)，使用 BullMQ 处理异步任务。
*   **前台 Web (Vue 3)**: 布局解耦，集成 GSAP 动效。
*   **后台 Admin (React)**: 使用 `Shadcn/UI` 开发，侧重系统监控与版本管理。
*   **移动端 (uni-app)**: 侧重碎片化录入与查阅。

### 技术栈概览
| 维度 | 技术/工具 | 核心依赖 |
| :--- | :--- | :--- |
| **后端** | NestJS v10 | Prisma, BullMQ, Puppeteer |
| **前台** | Vue 3.4 | Pinia, Element Plus, GSAP |
| **后台** | React 18 | Next.js, Shadcn/UI, TanStack Query |
| **移动端** | uni-app | Vite, uView-plus |

---

## 2. 详细需求文档 (PRD)

### 基础认证与单点登录 (SSO)
*   **功能**: 提供登录、注册、忘记密码页面，界面采用毛玻璃/粒子效果。
*   **[SSO](#2-单点登录-single-sign-on--sso) 需求**: 实现前后台无感登录。基于 **Domain Cookie + JWT** 方案，在 `.me.com` 根域名下共享 Token。

### 板块一：游戏轨迹 (Game Hub)
*   **展示端**: 大卡片流展示，高斯模糊背景，鼠标悬停显示奖杯进度。
*   **管理端**: 配置 API Key，手动/自动触发同步，修正游戏元数据。

### 板块二：知识智库 (CMS)
*   **阅读端**: 左侧树状目录，右侧主体内容，自动生成 TOC。
*   **创作端**: Markdown 左右分栏预览，自动保存草稿，支持版本 Diff 对比与回滚。

### 板块三：资源宝库 (Resource Hub)
*   **展示端**: Pinterest 风格瀑布流，标签快速过滤。
*   **采集端**: 智能提取 URL 元数据（标题、描述、封面）。

<span id="api"></span>

### 后端 API 接口定义
*   `POST /auth/login`: 登录认证。
*   `POST /games/sync/trigger`: 触发游戏同步。
*   `POST /docs/upsert`: 发布/更新文档。
*   `POST /resources/scrape`: 智能爬取链接信息。

---

## 3. 核心知识点解析

<span id="monorepo"></span>

### 1. Monorepo (单仓库多项目)
**Monorepo** 是一种将多个项目存储在同一个 Git 代码仓库中的策略。
*   **核心优势**: 共享类型定义 (Shared Types)、统一依赖管理、原子提交、本地引用极简。
*   **工具**: `pnpm workspaces`, `Turborepo`, `Nx`。

<span id="sso"></span>

### 2. 单点登录 (Single Sign-On / SSO)
**SSO** 让用户只需登录一次即可访问所有信任的子系统。
*   **方案**: **Domain Cookie + JWT**。
*   **原理**: 后端签发 JWT 并写入根域名 Cookie (`.me.com`)，各端启动时自动读取并校验。

---

## 4. 开发笔记与环境搭建

### MySQL 安装与配置
推荐使用 Homebrew 安装或官网下载 DMG。安装后请牢记 root 密码（示例：`8023CuiSiQi`）。
服务管理可通过 Mac `系统设置` 中的 MySQL 面板进行。

### 数据库管理
推荐使用 **Navicat Premium**。
| 系统库 | 作用 |
| :--- | :--- |
| `information_schema` | 元数据中心 |
| `mysql` | 核心配置（权限、时区） |
| `performance_schema` | 性能监控 |
| `sys` | 性能调优视图 |

---

## 5. 官方技术文档

### 后端与数据库
*   **[NestJS]**: [英文官网](https://docs.nestjs.com/) | [中文文档](https://docs.nestjs.cn/)
*   **[Prisma]**: [英文官网](https://www.prisma.io/docs) | [中文文档](https://prisma.yoga/)
*   **[Puppeteer]**: [英文官网](https://pptr.dev/) | [中文文档](https://pptr.nodejs.cn/)

### 前端与移动端
*   **[Vue 3]**: [英文官网](https://vuejs.org/) | [中文文档](https://cn.vuejs.org/)
*   **[React]**: [英文官网](https://react.dev/) | [中文文档](https://zh-hans.react.dev/)
*   **[Shadcn/UI]**: [英文官网](https://ui.shadcn.com/) | [中文镜像](https://shadcn.nodejs.cn/)

---
**由 Gemini CLI 整理整合 @ 2026-04-02**
