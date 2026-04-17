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

---

## 10. 智能文档解析算力节点 (MinerU)

针对 PDF/DOCX 到 Markdown 的高质量解析需求，本项目集成 **MinerU**。采用 **“Mac Mini 边缘计算 + MinerU-webui 引擎 + 按需唤醒”** 架构。

### 10.1 部署架构 (Micro-Service Architecture)

1.  **算力节点 (Mac Mini)**: 物理部署于本地，利用 Apple Silicon (MPS) 加速。
    - **`MinerU-webui` (核心引擎)**: 克隆自 [MinerU-webui](https://github.com/liuhuapiaoyuan/MinerU-webui)。它不仅提供了强大的可视化界面，还内置了 `api.py` 方便外部调用。
    - **`control-api.js` (控制代理)**: 极轻量 Node.js 服务，负责接收启动/关闭指令并管理 `MinerU-webui` 进程。
2.  **网络隧道 (Network Tunneling)**: 使用 **cpolar** 或 **Cloudflare Tunnel** 将本地 8080 (MinerU API/UI) 与 8001 (控制) 端口暴露至公网。
3.  **业务中转 (Next.js API)**: `blogAdmin` 调用 Next.js 接口，Next.js 验证 `SECRET_TOKEN` 后转发至算力节点。

### 10.2 进程控制逻辑 (Process Management)

使用 **PM2** 进行服务生命周期管理：

```bash
# 注册但不启动 MinerU-webui
pm2 start python3 --name "mineru-webui" -- webui.py
pm2 stop mineru-webui

# 常驻启动控制代理
pm2 start node --name "mineru-controller" -- control-api.js
```

#### A. 按需启动与自动释放 (Smart Idle)

- **启动时间**: 模型加载约需 **20-30s**。
- **调用逻辑**: Next.js 博客后端通过 `fetch` 调用 `MinerU-webui` 提供的 API 接口（如 `/api/parse`）。
- **自动关闭**: `control-api.js` 内置定时器。若 30 分钟内无解析请求，自动执行 `pm2 stop mineru-webui` 释放 16GB 内存。

### 10.3 前端交互规格 (UX/UI Specs)

1.  **状态感知**: 前端调用 `/api/mineru-control?action=status` 获取模型当前状态 (`online` / `stopping` / `offline`)。
2.  **唤醒轮询**: 用户点击“启动”后，前端进入 Loading 状态，每隔 3 秒请求一次 `/health` 接口，直到返回成功，解除锁定。
3.  **视觉重塑 (Elite UI Integration)**:
    - **彻底隐藏原生 UI**: 严禁将 `MinerU-webui` 的 8080/7860 端口直接暴露给最终用户。
    - **样式同步 (Style Sync)**:
      - 强制解析结果使用项目预设字体：`--text-h` (Cormorant Garamond) 和 `--text` (Montserrat)。
      - 所有 UI 状态（进度条、指示灯）读取 `src/style.css` 定义的 CSS 变量。
    - **动效链路**: 解析状态与 GSAP 补间动画绑定，将 API 的异步等待过程转化为具有“物理呼吸感”的视觉叙事。
4.  **安全性**:
    - 算力节点仅接受带 `SECRET_TOKEN` 的 HTTP 请求。
    - 传输层强制开启 HTTPS 隧道。

### 10.4 安全防护机制 (Security & Anti-Abuse)

由于 MinerU 是计算密集型任务，必须在 **Next.js API 网关** 或 **NestJS 后端** 实施严苛的防护。

1.  **限流策略 (Sliding Window)**:
    - 采用滑动窗口算法，限制单 IP 每分钟最多请求 2 次，每天最多 20 次。
2.  **暴力调用识别**:
    - 若单 IP 在 10 秒内连续触发 3 次以上请求，系统自动将其标记为“异常”。
3.  **自动封禁 (Auto-Banning)**:
    - 异常 IP 将被记录在数据库（或 Redis）的 `Blacklist` 表中。
    - **封禁时长**: 默认 24 小时。
    - **拦截位置**: 在请求转发给 Mac Mini 算力节点前进行拦截，返回 `403 Forbidden`。
4.  **日志溯源**:
    - 每次被拦截的请求都会记录 IP、地理位置及触发时间，方便在后台 `blogAdmin` 进行审计。

---

## 11. Elite PPT 重构 (EPR) 技术实现

EPR 是一个多引擎协作的重构管道，旨在实现 1:1 的 PPT 还原。

### 11.1 核心技术链路 (The EPR Pipeline)

1.  **背景提取 (Visual Anchor)**:
    - 使用 `IOPaint` 或 `Lama` 擦除原图文字，生成纯净底图作为 PPT 幻灯片背景。
2.  **结构提取 (MinerU Parser)**:
    - 调用 MinerU 获取表格 JSON 及公式 LaTeX。
    - 利用物理坐标 ($x, y, w, h$) 定位元素。
3.  **原生构建 (python-pptx)**:
    - **表格**: 根据 MinerU 提供的行列数据，在原位绘制 `Native Table`。
    - **公式**: 采用 `latex2mml` 将公式转为 `Office Math`。
    - **文本**: 基于多模态 AI (Gemini/GPT) 推荐的字号和加粗，生成原生文本框。

### 11.2 开发准则

- **禁止硬编码**: 坐标计算必须适配标准幻灯片比例 (16:9 或 4:3)。
- **字体回退策略**: 优先匹配系统字体，若不匹配，采用最接近的开源字体（如 Noto Sans SC）。

---

_Last updated: 2026-04-16_ (MinerU 算力节点与 EPR 安全重构方案定案)
