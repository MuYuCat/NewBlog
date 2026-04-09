# 2026-04-09 资源宝库 (Vault) 全栈实现报告

## 1. 任务背景

将原有的静态“资源宝库”页面升级为具备真实后端持久化能力的功能模块，支持书签（Bookmark）与多维标签（Tag）的管理。

## 2. 技术变更集

### A. 数据库层 (Prisma)

- 新增 `Tag` 模型，支持名称与颜色。
- 更新 `Bookmark` 模型，建立与 `Tag` 的多对多关联 (`BookmarkTags`)。
- 执行了数据库迁移：`20260409073531_add_tag_model_and_bookmark_relation`。

### B. 后端层 (NestJS)

- **VaultModule**: 集成了 `PrismaService`、`JwtModule` 与 `ConfigModule`，支持 `AuthGuard` 权限校验。
- **VaultController**: 提供 `/vault/bookmarks` 与 `/vault/tags` 的全套 CRUD 接口。
- **VaultService**: 实现书签的多条件过滤（搜索、标签筛选）与关联逻辑处理。
- **全局路由修正**: 在 `main.ts` 中暂时开启后又关闭了 `setGlobalPrefix('api')`，最终确立了 `/api` 仅作为前端代理标志的架构。

### C. 验证层 (Shared)

- 在 `packages/validation` 中新增 `vaultSchema`，同步前后端校验逻辑。

### D. 管理端 (React/UmiJS)

- **数据流**: 将静态 `useState` 替换为 `request` 异步加载，支持全量索引搜索。
- **交互优化**:
  - 新增“刷新同步”按钮，集成 `SyncOutlined` 动效。
  - 引入 `Skeleton` 骨架屏加载状态。
  - 修复 Favicon 图标与默认图标的显示冲突逻辑。
- **架构对齐**: 统一使用 `/api` 作为代理前缀，代码内部保持纯净业务路径。

## 3. 遗留问题与风险

- 目前 Favicon 获取依赖 Google 服务，国内环境可能需要切换为更稳定的 CDN。
- 标签颜色目前为随机分配，后续可增加颜色选择器。
- 移动端 `blogMobile` 尚未同步此功能。

## 4. 下一步计划

- [ ] 文章系统建模（Article & Category）。
- [ ] 文章管理列表与 Markdown 编辑器。
- [ ] 启动 uni-app 移动端开发。
