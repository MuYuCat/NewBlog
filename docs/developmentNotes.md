# 博客项目开发笔记 (Blog Project Development Notes)

> 本笔记记录了从零开始搭建企业级全栈博客系统的过程，涵盖数据库配置、环境搭建及各端核心逻辑。

---

## 1. Git 与 GitHub 推送配置

> **注意**: GitHub 自 2021 年起已停止支持“账号+密码”进行 Git 推送，必须使用 **Token** 或 **SSH**。

### 1.1 方案 A：使用个人访问令牌 (Token) - _当前项目采用方法_

如果你在使用 `https` 链接推送时报错，请使用 Token 代替密码。

1. **生成 Token**:
   - 登录 GitHub -> `Settings` -> `Developer settings` -> `Personal access tokens` -> `Tokens (classic)`。
   - 点击 `Generate new token`，勾选 **`repo`** 权限（建议初学者勾选所有权限以避免权限问题）。
   - **安全提示**: 复制生成的 `ghp_` 开头字符串并妥善保存，切勿在公开代码或聊天中直接发送。
2. **设置远程地址**:
   在终端执行以下命令（将 `<TOKEN>` 替换为你的令牌，并将 `MuYuCat` 替换为你的用户名）：
   ```bash
   git remote set-url origin https://MuYuCat:<TOKEN>@github.com/MuYuCat/NewBlog.git
   ```
3. **推送代码**:
   ```bash
   git push -u origin main
   ```

### 1.2 方案 B：使用 SSH 密钥 (Mac 推荐方案)

这是最专业、最安全且一劳永逸的方法。

1. **生成密钥**: `ssh-keygen -t ed25519 -C "your_email@example.com"` (一路回车)。
2. **复制公钥**: `pbcopy < ~/.ssh/id_ed25519.pub`。
3. **添加至 GitHub**: 访问 [SSH Keys 设置页](https://github.com/settings/ssh/new)，粘贴并保存。
4. **切换协议**:
   ```bash
   git remote set-url origin git@github.com:MuYuCat/NewBlog.git
   ```
5. **验证与推送**: 直接执行 `git push`，系统会自动完成身份校验。

---

## 2. 本地基础设施搭建 (MySQL)

### 2.1 MySQL 数据库安装与配置

在 macOS 环境下，推荐以下两种安装方式：

#### A. 命令行安装 (推荐开发者使用)

通过 Homebrew 一键安装：

```bash
brew install mysql
```

#### B. 官网 DMG 图形化安装

前往 [MySQL 官网下载页](https://dev.mysql.com/downloads/mysql/) 下载对应版本的 DMG 包。

| 安装格式        | 安装方式       | 难度 | 适用人群         | 自动化程度                   |
| :-------------- | :------------- | :--- | :--------------- | :--------------------------- |
| **DMG Archive** | 图形化安装器   | 低   | 普通用户、开发者 | **高** (自动配置服务/启动项) |
| **TAR Archive** | 命令行手动配置 | 中高 | 高级用户         | **低** (需手动配置环境变量)  |

> **重要提示**: 安装过程中请牢记 root 密码。
> _示例密码：`8023CuiSiQi`_

---

### 2.2 MySQL 服务管理

安装完成后，可以通过以下步骤管理服务状态：

1. **进入设置**: 打开 `系统设置` (macOS Ventura+) 或 `系统偏好设置`。
2. **找到图标**: 在面板底部找到 **MySQL** 图标并点击。
3. **启停服务**:
   - 点击 `Start MySQL Server` 启动服务。
   - 状态变为 `Running` (绿色) 表示启动成功。
   - 系统会要求输入 Mac 管理员密码。

---

### 2.3 数据库管理工具 (Navicat)

推荐使用 **Navicat Premium** 进行可视化管理：

- **连接配置**: 新建连接，输入 `localhost`, `root` 用户名及设置的密码。
- **预置数据库说明**: 登录后会看到几个默认的系统库，**请勿删除或直接修改**。

| 数据库名称           | 核心作用                                                         | 开发者关注度               |
| :------------------- | :--------------------------------------------------------------- | :------------------------- |
| `information_schema` | **元数据中心**：存储所有库名、表名、列类型等字典信息。           | ⭐⭐ (查询表结构有用)      |
| `mysql`              | **核心配置库**：存储用户权限、时区、存储过程等。                 | ⭐⭐⭐ (修改密码/权限涉及) |
| `performance_schema` | **性能监控**：收集资源消耗、锁等待等事件。                       | ⭐ (运维/调优使用)         |
| `sys`                | **便捷视图库**：将上述复杂数据整理成易读的视图，方便排查慢 SQL。 | ⭐⭐ (排查性能问题)        |

---

## 3. Monorepo 架构搭建 (pnpm workspaces)

项目采用 **Monorepo** 模式，统一管理前台、后台、API 及共享包。

### 3.1 工作区配置 (`pnpm-workspace.yaml`)

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

### 3.2 共享校验逻辑 (`packages/validation`)

为了保持前后端校验逻辑一致，我们采用 **Zod** 定义 Schema。

- **初始化命令**: `pnpm init && pnpm add zod`
- **定位**: 核心业务 Schema（如：登录、用户资料更新、文章发布）统一存放于此，被各端应用引用。

---

## 4. 后台管理系统 (blogAdmin)

基于 React 18+ 与 UmiJS v4 (@umijs/max) 架构。

### 4.1 技术选型与版本

- **框架**: [UmiJS v4 (Max 版)](https://umijs.org/)
- **样式**: [Tailwind CSS v3](https://tailwindcss.com/) (需禁用 `preflight`)
- **组件库**: [Ant Design v5](https://ant.design/)

### 4.2 重构记录 (2026-04-02)

- 放弃了原有的 Next.js 方案，全面切换到 UmiJS 以利用其更成熟的后台管理生态（ProComponents）。
- `tailwind.css` 入口文件已移至项目根目录以符合 Umi 插件规范。

---

## 5. 前台门户系统 (blogWeb)

基于 Vue 3.4+ 与 Vite 5+。

### 5.1 技术选型与版本

- **核心**: Vue 3.4 (Composition API)
- **构建**: Vite 5
- **状态**: Pinia
- **组件库**: Element Plus

---

## 6. 后端服务端 (blogApi)

基于 NestJS v10+ 与 Prisma ORM。

### 6.1 数据库集成 (Prisma)

- **初始化**: `npx prisma init`
- **连接串**: `mysql://root:PASSWORD@localhost:3306/newblog`
- **核心模型**: `User`, `Game`, `Doc`, `Bookmark`。

### 6.2 同步指令

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## 7. 移动端应用 (blogMobile)

基于 uni-app 的跨端开发方案。

### 7.1 技术选型与版本

- **核心**: [uni-app](https://uniapp.dcloud.net.cn/) (Vue 3 + Vite + TS)
- **UI**: [uView-plus](https://uview-plus.com/)
- **端支持**: 微信小程序、iOS、Android

### 7.2 创建流程 (规范化初始化)

```bash
npx degit dcloudio/uni-preset-vue#vite-ts blogMobile
```

---

## 8. 自动化质量控制体系 (Quality Control)

为了确保 Monorepo 代码的一致性，在根目录统一部署了拦截器。

### 8.1 部署工具链

- **Husky**: 管理 Git Hooks。
- **Lint-staged**: 增量代码校验。
- **Commitlint**: 提交信息规范化 (`@commitlint/config-angular`)。
- **Prettier**: 全局代码美化。

### 8.2 核心配置说明

- **代码提交**: `git commit` 时触发 `prettier --write` 与 `eslint --fix`。
- **消息规范**: 提交信息必须以 `feat:`, `fix:`, `docs:`, `style:`, `refactor:` 等开头。

---

## 9. 核心技术架构定案 (2026-04-02)

### 9.1 后台系统重构

- **动作**: 彻底删除 Next.js 相关配置，采用 **UmiJS v4 (@umijs/max)**。
- **原因**: 针对后台管理系统，UmiJS 的插件化能力和 Ant Design ProComponents 生态更具生产力。
- **配置**: 解决了 `tailwind.css` 入口路径及 `preflight` 样式冲突。

### 9.2 数据库连接层稳定

- **动作**: 弃用 Prisma 7.x 回退至 **Prisma 6.2.1**。
- **原因**: 适配 Prisma 7 的 Driver Adapters 带来的额外复杂性与本地开发便捷性相冲突。
- **结果**: 成功实现了 NestJS 对 MySQL 的直连，并通过 `npx prisma generate` 生成了强类型客户端。

### 9.3 共享校验闭环

- **动作**: 完成了 `@newblog/validation` 包的创建与全栈引用集成。
- **应用**: 在 `blogAdmin` 的登录页和 `blogApi` 的 PrismaService 中已成功引入。

---

_Last updated: 2026-04-02_
