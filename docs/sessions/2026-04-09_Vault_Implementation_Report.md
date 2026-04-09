# 2026-04-09 资源宝库 (Vault) 全栈实现与高奢 UI 报告 (Final)

> **同步点**: 2026-04-09 18:30
> **状态**: 已完成 (Verified)
> **负责人**: Gemini CLI (Senior SE)

---

## 1. 任务背景与核心目标

在完成基础 CRUD 逻辑后，本次任务重点在于打造 **高奢感的个人门户资源宝库**。要求支持模糊搜索、多维标签过滤、热度/时间排序，并具备像素级的视觉质感与丝滑的动态交互。

## 2. 技术变更集 (全栈增强)

### A. 数据库层 (Prisma/MySQL)

- **热度系统**: 在 `Bookmark` 模型中新增 `clicks` 字段 (`Int`, 默认 0)，用于统计资源被访问的频次。
- **迁移记录**: 执行了 `20260409084513_add_clicks_to_bookmark` 数据库迁移。

### B. 后端层 (NestJS API)

- **PublicVaultController**:
  - 路径: `/public/vault`。
  - **findAll**: 开放接口，支持 `search`、`tagIds` 过滤及 `sort` (latest/hottest) 排序。
  - **incrementClicks**: 异步记录点击行为，提升资源热度。
- **VaultService**:
  - 升级 `findAllBookmarks` 逻辑，支持动态排序映射 (`orderByMap`)。
  - 增加 `incrementClicks` 事务操作，确保数据一致性。
- **VaultModule**: 注册并暴露 `PublicVaultController`，实现前后台接口隔离。

### C. 前台门户 (Astro + Vue 3.4 Islands)

- **页面入口 (`vault.astro`)**: 配置 SEO TDK 与 Open Graph 元数据，承载 `VaultView` 孤岛组件。
- **核心视图 (`VaultView.vue`)**:
  - **Bento Grid 布局**: 实现 `2x1` (Wide) 与 `1x1` (Standard) 混合网格，移除 `1x2` 纵向长卡片以优化书签展示空间。
  - **GSAP 动效**: 集成错落 (Stagger) 入场动画与呼吸感悬浮微动效。
  - **动态 Monogram 占位图**: 针对无封面资源，基于域名哈希算法生成 **Mesh Gradient (网格渐变)** 背景，并展示高奢衬线体首字母。
  - **结构化排版**:
    - **域名标识 (Source Badge)**: 自动提取 URL 域名并作为品牌标识展示。
    - **页脚固定**: 强制将日期与热度信息推至卡片底部，解决长内容遮挡问题。
    - **标签收纳**: 限制卡片表面展示标签数量（Max: 2），保持视觉清爽。

### D. 底层工具与 UI 调优

- **Request 工具升级**: 在 `apps/blogWeb/src/utils/request.ts` 中新增 `params` 支持，自动将对象转换为 `URLSearchParams`。
- **搜索框对齐**: 修复了 `.search-bar` 内部垂直不居中的问题，优化了胶囊容器的视觉平衡。
- **组件稳定性**: 修复了 `nextTick` 未定义引发的 ReferenceError，并清理了文件末尾冗余的损坏标签。

### E. 数据埋点与趋势分析 (Analytics Upgrade)

- **逻辑升级**: 针对 `/public/vault/bookmarks/:id/click` 接口，实现了双重记录策略。
- **原子计数器**: 更新 `Bookmark.clicks` 字段，用于前台极速排序。
- **审计日志埋点**: 向 `AuditLog` 写入类型为 `RESOURCE_CLICK` 的详细日志。
  - **数据背景**: 记录了 `bookmarkId`、`title`、访问者 `IP` 及 `UserAgent`。
  - **业务价值**: 为未来仪表盘提供“每日点击走势”、“来源画像分析”及“高频资源热力图”的底层数据。
- **控制器适配**: `PublicVaultController` 现已支持从 Request 中精准提取真实 IP 和 UA 信息。

---

## 3. 核心功能验证 (Verified)

1. [x] **搜索功能**: 输入关键字，实时匹配标题、描述及链接。
2. [x] **排序功能**: 切换“最新”与“最热”，列表即刻重排。
3. [x] **标签筛选**: 点击标签云，精准展示相关分类资源。
4. [x] **视觉反馈**: 鼠标悬浮大卡片左侧占位图，动态首字母清晰可读，整体质感通透。
5. [x] **数据记录**: 点击资源卡片，数据库 `clicks` 字段同步累加。

---

## 4. 下一步计划 (Next Steps)

1. **[后端] 文章系统建模**: 设计 `Article` 与 `Category` 数据库模型。
2. **[后台] 文章管理**: 实现列表矩阵与全功能 Markdown 编辑器。
3. **[后台] 仪表盘**: 接入 `getSummary` API，实现 PV/UV 与资源点击的可视化展示。
4. **[移动端] 启动**: 开始 `blogMobile` (uni-app) 的环境配置与页面布局。

---

**由 Gemini CLI 自动记录并同步 @ 2026-04-09 18:30**
