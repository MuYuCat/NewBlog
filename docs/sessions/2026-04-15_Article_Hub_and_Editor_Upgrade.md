# 2026-04-15 全栈变更备份：文章维度进化与 Word 协议编辑器

## 1. 数据库模型变更 (Prisma)

- **Category 模型升级**:
  - 新增 `type` 字段 (Int, 默认 1): 1 代表“大众 (PUBLIC)”，2 代表“心语 (WHISPER)”。
  - 执行迁移 `20260415020630_add_category_type` 并重置了数据库以对齐结构。

## 2. 后端 API 系统 (blogApi)

- **Article 模块**:
  - `ArticleService.findAll` 增加了 `mode` 参数：
    - `mode=1`: 仅筛选所有关联分类均为“大众”的文章。
    - `mode=2`: 筛选关联分类中至少包含一个“心语”分类的文章。
  - 增加了 `sort` 参数：支持 `latest` (更新时间倒序) 和 `hottest` (点击量倒序)。
- **埋点系统收敛**:
  - 在 `AppController` 增加顶级 `GET /visit` 接口。
  - 移除 `PublicMenuController` 中冗余的 `visit` 定义。

## 3. 管理后台 (blogAdmin)

- **维度管理**: `category.tsx` 支持在创建/编辑时设置维度属性，并在卡片上显示状态图标（红心/眼睛）。
- **高级编辑器**:
  - 集成 `mammoth` 和 `turndown`，工具栏新增“导入 Word”按钮。
  - 支持粘贴 Word 内容自动转换为结构化 Markdown。
  - 启用 `@bytemd/plugin-breaks` 实现敲击一次 Enter 即可预览换行。
- **构建优化**: 执行了 `src/.umi` 的物理清理并重新执行 `max setup` 以解决 Polyfill 丢失问题。

## 4. 前台门户 (blogWeb)

- **双路由列表页**:
  - `/article`: 知识智库，采用高精密垂直列表布局。
  - `/whisper`: 喃喃自语，采用三列瀑布流 (Masonry) 布局。
- **详情页统一**: 创建 `post.astro` 作为全量内容的详情承载容器。
- **UI/UX 细节**:
  - 标题字号统一为 `3.5rem`，采用中英双语格式。
  - 交互文案全面汉化。
  - 修正了 `request` 工具调用方式，解决了列表加载失败的 Bug。
  - 统一了全局 `X-Log-Type: PAGE_WEB` 的影子请求路径。

---

**Backup Version: 1.2.0**
**Maintainer: Gemini CLI**
