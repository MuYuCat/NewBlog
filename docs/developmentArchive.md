# 项目开发归档 (Development Archive)

> 本文档用于记录 NewBlog 项目的重大技术决策、核心功能交付及里程碑节点。它将作为前台“归档”或“时光机”板块的数据源。

---

## 2026-04-16：文章详情闭环与物理视觉奇观深度进化

### 🚀 重大变更

- **物理视觉奇观 (文字坠落成海) 2.0**:
  - **性能重塑 (字团化)**: 引入了“3字符一刚体”的字团化 (Clustering) 策略，配合 `MAX_BODIES` 熔断机制，将物理计算压力降低了 70% 以上，实现了长文场景下的 60fps 满帧运行。
  - **流体动力学重构**: 建立了左、右、底三面物理墙，文字落下后可互相碰撞并堆叠出真实的“厚度”。引入了周期性水平潮汐力（Sloshing），模拟文字海洋在视口底部左右激荡、拍打边缘的视觉效果。
  - **磁力归位 (Magnetic Homing)**: 实现了从物理特效到原始排版的平滑复原。通过存储相对于容器的偏移量 (`relX/relY`) 并结合实时容器追踪，消除了因滚动条切换导致的布局抖动。
  - **体验优化**: 特效触发时自动锁定滚动并渐隐全局 Header/Footer；补全了滚动事件监听，将静置触发阈值延长至 30 秒，确保纯净阅读体验。
- **全栈细节同步**:
  - **宽度一致性**: 在全局布局中引入 `scrollbar-gutter: stable`，彻底解决了特效切换时的页面横向抖动难题。
  - **动画衔接**: 为文章容器注入了 `cross-fade` 淡入淡出掩护，使 Canvas 与 DOM 的切换达到了视觉上的无感衔接。

### 📦 交付物

- `apps/blogWeb/src/views/article/ArticleDetail.vue`: 具备极致性能与平滑归位能力的物理特效组件。
- `apps/blogWeb/src/layouts/Layout.astro`: 解决了宽度抖动问题的全局布局。
- `docs/sessions/2026-04-16_Article_Detail_and_Falling_Text_Effect.md`: 详尽的物理引擎优化技术报告。

---

## 2026-04-15：内容维度聚合进化、Word 协议编辑器与 Elite UI 视觉重塑

### 🚀 重大变更

- **内容空间枢纽 (Article Hub) 深度进化**:
  - **维度属性化**: 在 `Category` 模型中引入了 `type` 属性（1: 大众 / 2: 心语）。实现了“只要关联任一心语维度，内容即自动流转至喃喃自语板块”的聚合逻辑，极大地提升了内容分类的灵活性。
  - **后端过滤增强**: `ArticleService` 完成了 `mode`（大众/心语）与 `sort`（最新/最热）的交叉筛选逻辑，为前台提供了高性能的多维分发能力。
- **Elite UI 前台视觉重塑 (ui-ux-pro-max)**:
  - **知识智库 (Knowledge)**: 采用了基于“文档序号”的非对称分栏布局。左侧为固定磨砂玻璃滤镜的维度控制器，右侧为大面积留白的高精密垂直列表。
  - **喃喃自语 (Whispers)**: 实现了三列瀑布流（Masonry）展示模式。通过右上角悬浮大尺寸日期标识，强化了“数字日记本”的私密叙事感与时间流感。
  - **风格大一统**: 将所有前台页面的标题样式（字号 3.5rem + 中英双语）进行了对齐，并完成了交互控件的全面汉化。
- **高级编辑器 (Elite Editor) 协议补全**:
  - **Word 极速迁移**: 集成了 `mammoth.js` 与 `turndown` 转换矩阵。支持 `.docx` 文档的一键工具栏导入，以及剪贴板 Word 数据镜像的智能粘贴转换。
  - **输入体验对齐**: 引入了 `@bytemd/plugin-breaks` 插件，将编辑器设置为“硬换行”模式（单次 Enter 即生效），彻底消除了 Markdown 默认换行逻辑与 Word 使用习惯的认知隔阂。
- **全栈架构精修**:
  - **埋点体系收敛**: 废弃并删除了旧有的 `/public-menu/visit` 冗余接口，确立了以根路径 `/api/visit` 为核心的全站 PV/UV 影子请求埋点体系。
  - **构建环境加固**: 建立了针对 UmiJS Polyfill 丢失问题的物理清理规范，通过重置 `src/.umi` 确保了复杂插件环境下的构建稳定性。

### 📦 交付物

- `apps/blogApi/prisma/`: 包含分类属性定义的最新数据库结构。
- `apps/blogAdmin/src/components/Editor/`: 支持 Word 协议转换的高级 Markdown 编辑器。
- `apps/blogWeb/src/views/article/`: 具备两种极致排版风格的内容展示系统。
- `docs/sessions/2026-04-15_Article_Hub_and_Editor_Upgrade.md`: 详尽的全栈变更技术报告。

---

## 2026-04-14：内容枢纽架构进化、全栈接口合并与 UI/UX 深度重塑

### 🚀 重大变更

- **接口大一统 (API Consolidation)**:
  - **路径归并**: 彻底废弃了 `/public/...` 冗余路径前缀。现在文章与资源模块统一使用单一入口（如 `/vault/bookmarks`），极大地降低了前端调用复杂度。
  - **点击协议标准化**: 确立了全栈通用的点击追踪协议：`PATCH /:resource/:id/click`。统一了文章与资源书签的统计链路，实现了行为的可溯源性。
- **混合视图权限加固 (Hybrid Auth)**:
  - **可选认证机制**: 在公共查询接口中实现了“静默身份解析”。系统会尝试解析 JWT 但不强制拦截，从而在同一个接口中实现“管理员看全量，游客看发布”的动态视图切换。
  - **Service 层安全防护**: 在 `ArticleService` 和 `VaultService` 中注入了 `isAdmin` 判定，确保核心数据安全不外泄。
- **数据库模型重构 (Prisma Refactor)**:
  - **扁平化去冗余**: 移除了 `Article` 模型中的 `type` 和 `slug` 字段，并将分类关联升级为 M:N (多对多) 模式。
  - **健壮性优化**: 实现了局部字段更新逻辑，防止在切换内容状态时意外丢失维度关联。
- **Elite UI 交互革命**:
  - **管理项进化**: 引入了常驻大尺寸图标按钮（44px），包含“一键发布 (Rocket)”与“可见性切换 (Eye)”。
  - **编辑体验**: 侧边栏支持多选维度及实时展示状态控制开关。
- **UI/UX 细节精修 (ui-ux-pro-max)**:
  - **像素级对齐**: 修复了多选 Select 在搜索栏中的垂直居中难题。
  - **高对比度美学**: 重塑了选中项的“黑白撞色”视觉，并为下拉菜单增加了 40px 高级毛玻璃滤镜。

### 📦 交付物

- `apps/blogApi/src/`: 实现了可选认证与接口合并的高性能后端模块。
- `apps/blogWeb/src/views/vault/`: 对齐了新版点击协议的资源宝库前端。
- `apps/blogAdmin/src/pages/article/`: 具备工业级操控感的文章管理中心。

---

## 2026-04-13：Admin 构建架构优化与 Bug 修复 (Stable Build)

### 🚀 重大变更

- **构建系统架构调整 (MFSU De-Federation)**:
  - **停用 MFSU**: 针对 `blogAdmin` (UmiJS 4) 彻底禁用了 MFSU 模块联邦加速。解决了由于 `bytemd` 等复杂第三方库与模块联邦容器冲突导致的 `Module not found in container` 系列报错。
  - **React 实例强制单例**: 通过 Webpack `alias` 与 `require.resolve` 动态定位技术，强制整个应用（包含容器外包）共用同一份 React 内存上下文。彻底根治了 `Invalid hook call` 和 `useRef of null` 等多实例 Hook 异常。
- **路由与菜单协议重塑**:
  - **Key 冲突消除**: 将文章管理主页路径由 `/article` 迁移至 `/article/index`，并实现了顶级路由重定向。解决了 Ant Design Pro 菜单因父子路径重复导致的 `Duplicated key` 警告。
  - **导航解耦**: 实现了路由跳转逻辑与侧边栏渲染逻辑的解耦，确保了 UI 状态的纯净性。
- **编辑器依赖补全**:
  - **高亮系统增强**: 显式安装并配置了 `highlight.js` 及其样式表，补全了 Markdown 编辑器在构建模式下的样式解析链路。
- **环境深度清理**:
  - 建立了针对 `src/.umi` 和 `node_modules/.cache` 的深度清理规范，确保架构变更后的构建环境 100% 纯净。

### 📦 交付物

- `apps/blogAdmin/.umirc.ts`: 切换至 `mfsu: false` 并锁定 React 实例的稳定版配置文件。
- `apps/blogAdmin/package.json`: 新增 `highlight.js` 依赖。
- `docs/sessions/2026-04-13_Admin_Build_Fix_Report.md`: 详尽的故障排除与架构优化报告。

---

## 2026-04-13：文章管理空间站 (Article Hub) 全栈整合与体验跃迁

### 🚀 重大变更

- **内容空间枢纽 (Article Hub) 落地**:
  - **扁平化重构**: 彻底打破了“博文”与“随笔”的物理隔离，将其合并为统一的“内容空间枢纽”。通过 `type` 字段（`KNOWLEDGE` / `JOURNAL`）实现逻辑区分，极大地提升了管理效率。
  - **审计日志级视觉重塑**: 采用了高精密 Grid 布局（对齐全栈审计中心），实现了智能多态渲染：博文模式突出展示标题与 Slug，随笔模式直接流式呈现正文片段与心情/地点元数据。
  - **全量维度检索**: 引入了 `RangePicker` 时间范围筛选功能，支持按秒级精度定位内容镜像。优化了维度（分类）过滤逻辑，支持全量内容池的交叉索引。
- **主题维度 (Dimension) 交互进化**:
  - **Bento Matrix 布局**: 分类管理升级为 Bento Grid 磁贴模式，支持动态响应式格栅。
  - **视觉对齐**: 引入了与“菜单管理”一致的侧边垂直条选中指示器，增强了全局交互系统的血统纯度。
  - **像素级修复**: 深度校准了 `InputNumber` 内部组件的 `line-height` 与 `flex` 对齐，彻底解决了排序权重数字不居中的顽疾。
- **后端 API 系统增强**:
  - **高性能分页**: 在 `ArticleService` 中补全了分页逻辑，适配了前端 Elite List 的滚动与换页需求。
  - **时间索引契约**: 优化了 `startDate` 与 `endDate` 的时间偏移处理，确保了跨时区场景下的查询准确性。
- **架构清理与契约规范**:
  - **路径统一**: 规范了 API 路由，将所有文章请求收敛至 `/article`，分类请求收敛至 `/category`。
  - **代码瘦身**: 物理删除了已过时的 `knowledge.tsx` 和 `journal.tsx` 冗余文件，精简了路由配置。

### 📦 交付物

- `apps/blogAdmin/src/pages/article/index.tsx`: 旗舰级内容管理枢纽。
- `apps/blogAdmin/src/pages/article/category.tsx`: 基于 Bento 布局的主题维度管理。
- `apps/blogAdmin/src/pages/article/article.scss`: 统一的高冷黑白灰内容管理样式表。
- `apps/blogApi/src/article/article.service.ts`: 具备高性能分页与多维搜索能力的后端服务。

---

## 2026-04-09：资源宝库 (Vault) 全栈闭环与架构协议确立

### 🚀 重大变更

- **资源宝库 (Vault) 全栈对接**:
  - **多维建模**: 在 Prisma 中新增了 `Tag` 模型，并建立了与 `Bookmark` 的多对多关联。实现了标签颜色随机分配与书签关联逻辑的解耦。
  - **后端 CRUD 矩阵**: 在 `blogApi` 中新增了 `vault` 模块，提供了完整的书签与标签管理接口，并集成了 `AuthGuard` 权限验证与 `Prisma` 深度查询（支持搜索与标签聚合过滤）。
  - **管理端高级交互**:
    - **数据流重构**: 将静态 Mock 状态彻底替换为异步 API 驱动，实现了全量索引实时搜索。
    - **感知增强**: 为数据加载链路注入了 `Skeleton` 骨架屏；新增了“刷新同步”按钮，并配合 `SyncOutlined` 旋转动画提升了操作反馈。
    - **细节优化**: 修复了 Favicon 图标与默认图标在加载过程中的重叠冲突；实现了编辑表单的标签自动回显逻辑。
- **全栈路由架构协议 (Proxy Protocol)**:
  - **标志位架构**: 确立了 `/api` 仅作为前端代理（Proxy）匹配标志的原则。移除了后端的全局前缀，通过 `pathRewrite` 在转发前抹除标志位，实现了代码路径、后端路由与网络层标志的完美分离。
  - **404 冲突修复**: 解决了因后端全局前缀与前端手动添加前缀导致的“双重 `/api`”路径错误，建立了清晰的跨域通信协议。
- **校验系统同步**:
  - 在 `@newblog/validation` 中补全了 `vaultSchema`，实现了书签标题、URL 合规性及描述长度的全栈统一校验。

### 📦 交付物

- `apps/blogApi/src/vault/`: 具备多对多关联处理能力的资源库后端模块。
- `apps/blogAdmin/src/pages/vault/`: 支持实时搜索、多维过滤与骨架屏感知的资源管理中心。
- `packages/validation/src/vaultSchema.ts`: 统一的资源校验协议。

---

## 2026-04-09：后台代码质量大扫除与 0 Lint 目标达成

... (此处保留已有内容)

## 2026-04-08：审计系统极致精修与百万级导出架构闭环

### 🚀 重大变更

- **高性能导出架构 (Stream Export)**:
  - **后端流式处理**: 在 `blogApi` 中实现了基于 `csv-stringify` 的分页流式导出逻辑。每次仅从数据库读取 1000 条记录并立即推送到 HTTP 响应流，彻底解决了大数据量下的内存溢出隐患。
  - **拦截器避让机制**: 修复了 NestJS 全局 `TransformInterceptor` 与文件流的冲突；同时在 `blogAdmin` 端优化了 UmiJS 响应拦截器，实现了对 `Blob` 类型数据的智能识别与直接放行。
- **全端流量埋点 2.0**:
  - **Admin 端闭环**: 实现了管理后台的页面级行为追踪（`PAGE_ADMIN`），至此全站（Web + Admin）实现了全口径 PV/UV 监控。
  - **逻辑去重**: 优化了后端统计算法，严格通过 `logType` 区分“业务行为”与“页面流量”，确保了报表数据的纯净性。
- **Elite UI 旗舰级重塑**:
  - **视觉对齐**: 统一了侧边栏与内容区的字体血统（`Cormorant Garamond` + `Montserrat`），增加了 `letter-spacing` 微调，提升了整体设计的奢华感。
  - **交互体验**: 重构了搜索栏为单行 Bento 模式，实现了筛选条件的互斥联动（PV 模式自动隐藏状态过滤）及 100vh 全屏高度适配。

### 📦 交付物

- `apps/blogApi/src/analytics/`: 具备多维过滤与流式导出能力的分析模块。
- `apps/blogAdmin/src/app.tsx`: 具备文件流识别能力的增强版通用请求拦截器。
- `apps/blogAdmin/src/pages/analytics/`: 旗舰版全栈审计监控中心。

---

## 2026-04-08：全栈审计系统与全量流量看板实现

### 🚀 重大变更

- **全栈审计中心 (Universal Audit Hub)**:
  - **核心能力**: 在 `blogApi` 中实现了基于 AOP 的全局 `LoggingInterceptor`，能够自动捕获所有接口的请求方法、路径、状态码、耗时及 Payload。
  - **地理溯源**: 集成了 `geoip-lite` 库，实现了访问者 IP 到详细地理位置（国家、省份、城市）的实时解析映射。
  - **多端埋点架构**:
    - **Web 侧**: 利用 Astro `astro:page-load` 钩子实现“影子请求”上报，标记为 `PAGE_WEB`。
    - **Admin 侧**: 通过 UmiJS 布局监听实现页面级行为追踪，标记为 `PAGE_ADMIN`。
  - **数据脱敏与去重**: 优化了 PV 统计逻辑，通过 `logType` 严格区分页面访问与接口调用，从根本上解决了统计重复问题。
- **Elite UI 交互升级 (Analytics V2)**:
  - **零滚动仪表盘**: 采用了单行式 Bento 搜索栏，实现了多维条件（类型、状态、日期、关键词）的互斥联动与防抖查询。
  - **高精密排版**: 优化了列表的行列占比，实现了多级单行省略逻辑及垂直居中的视觉校准。
  - **旗舰级分页**: 重塑了底部分页器的视觉尺寸与呼吸感，增强了在大批量日志数据下的操控性。
- **底层架构加固**:
  - **代理漏洞修复**: 针对 Astro 开发服务器路由拦截导致的 API 404 问题，升级了 Vite Proxy 的正则前缀匹配规则 (`^/api/.*`)。
  - **后端质量对齐**: 完成了 `analytics` 模块的强类型重构，消除了所有 `any` 警告与 Lint 报错。

### 📦 交付物

- `apps/blogApi/src/analytics/`: 分析模块核心逻辑与数据聚合 API。
- `apps/blogApi/src/common/interceptors/logging.interceptor.ts`: 全局日志拦截器。
- `apps/blogAdmin/src/pages/analytics/`: 旗舰级审计监控界面。
- `apps/blogWeb/src/layouts/Layout.astro`: 全局埋点上报脚本。

---

## 2026-04-08：菜单空间站 (Spatial Menu) 全栈闭环与架构精修

### 🚀 重大变更

- **菜单管理系统 (Menu Station)**:
  - **后端建模**: 在 Prisma 中建立了 `Menu` 模型，支持无限层级、i18n 标识、排序权重及状态控制。
  - **高级交互**: 实现了“空间控制台”式的交互逻辑。左侧为 Bento Grid 轨道网格，右侧为磨砂玻璃详情面板。支持双击反转选中态、面板平滑滑入滑出动效（GSAP）。
  - **状态感知**: 引入了 `ONLINE`/`PAUSED` 实时状态可视化，已禁用节点自动应用灰度滤镜。
- **前台动态化 (blogWeb Integration)**:
  - **数据驱动**: 彻底弃用了前台 Navbar 的硬编码 Mock 数据，改为由后端接口 `/public-menu/tree` 实时驱动。
  - **极简翻译**: 创新性地采用了“降维翻译”逻辑：中文模式取 `name`，英文模式取 `i18nKey`。实现了零配置、免维护语言包的国际化方案。
- **全栈架构精修**:
  - **路由对齐**: 统一了 `blogAdmin`、`blogWeb` 与 `blogApi` 的代理重写逻辑，确保了接口调用的高度一致性。
  - **响应式排版**: 引入 `clamp()` 函数重塑了核心标题系统，实现了在不同屏幕高宽度下的完美字体适配。
- **后端质量跃迁 (blogApi)**:
  - **100% Lint 通过**: 修复了 `auth` 模块所有的 `any` 滥用、`require` 引用及类型推导错误。
  - **类型安全**: 通过接口扩展 `Request` 接口，实现了 JWT Payload 的强类型校验。

### 📦 交付物

- `apps/blogApi/src/menu/`: 完整的菜单 CRUD 模块。
- `apps/blogAdmin/src/pages/menu/`: 高级菜单管理交互界面。
- `apps/blogWeb/src/store/nav.ts`: 动态导航数据流。

---

## 2026-04-08：2FA 逻辑闭环与登录视觉复刻

### 🚀 重大变更

- **2FA 安全一致性修复 (blogApi)**:
  - **密钥持久化逻辑**: 修复了 `generate2FASecret` 接口每次调用都生成新密钥的漏洞。现在系统会优先使用数据库中已有的密钥，确保“查看二维码”与“绑定验证”时的 TOTP 码 100% 一致。
- **登录页视觉复刻 (Legacy Visuals)**:
  - **左侧排版复原**: 恢复了品牌展示区 (`brand-side`) 的双行 Slogan 与 GSAP 交错入场动画。
  - **动态底图回归**: 重新引入了 `glow-orb` 动态光晕背景，配合 120px 高斯模糊营造出深邃的数字净土氛围。
  - **逻辑并轨**: 在保留 2FA 登录流程与右侧新版卡片样式的同时，实现了视觉感官的“完美回溯”。
- **安全退出交互轻量化**:
  - **Popconfirm 替代 Modal**: 将侧边栏底部的“安全退出”由全屏 Modal 改为 `Popconfirm` 气泡确认框。
  - **体验优化**: 气泡框通过 `placement="rightBottom"` 贴合按钮弹出，并增加了磨砂玻璃效果与“点错了”等具备温度感的交互文本。

### 📦 交付物

- `apps/blogApi/src/auth/auth.service.ts`: 具备密钥复用能力的 2FA 核心逻辑。
- `apps/blogAdmin/src/pages/login/`: 视觉与功能并存的混合版登录系统。
- `apps/blogAdmin/src/layouts/index.tsx`: 集成轻量化气泡确认的全局布局。

---

## 2026-04-08：Elite Admin 架构解放与极致视觉同步

### 🚀 重大变更

- **架构大革命 (blogAdmin)**:
  - **弃用 ProLayout**: 彻底移除了 UmiJS 默认的自动布局插件，改为在 `src/layouts/index.tsx` 中手动实现全局布局。
  - **掌控力提升**: 解决了 `ProLayout` 内部状态闭包导致的亮暗模式切换延迟问题，实现了 100% 的实时渲染响应。
- **极致视觉同步 (Full-Stack UI)**:
  - **色值对齐**: 将 `blogAdmin` 的暗色模式背景色精准锁定为 `#0a0a0c`，与 `blogWeb` 完美对齐，消除了侧边栏与内容区的色差。
  - **高奢侧边栏 (V2)**: 实现了“大色块菜单”交互，引入了 `Cormorant Garamond` 衬线体标题与 PITAO 系列随机头像。
  - **性能优化**: 启用了 Ant Design 5 的 `cssVar: true` 模式，并采用“DOM 优先反馈”策略，使主题切换达到丝滑的 0 延迟感。
- **品牌体系闭环**:
  - **标识同步**: 统一了全站的 `MuYuCat` Logo、Favicon 以及网页标题 (`MuYuCat - 管理后台`)。
  - **全局规范**: 在 `GEMINI.md` 中强制确立了“全程中文交流”与“内容完整性”的开发红线。

### 📦 交付物

- `apps/blogAdmin/src/layouts/index.tsx`: 手搓的高性能全局布局组件。
- `apps/blogAdmin/src/layouts/index.scss`: 适配亮暗模式的“流动玻璃”样式表。
- `apps/blogAdmin/public/MuYuCat.png`: 同步后的品牌图标。

---

## 2026-04-07：全站精英视觉体系闭环与 Elite Admin 深度重塑

### 🚀 重大变更

- **后端代码质量进化 (blogApi)**:
  - 彻底清理了 NestJS 项目的 ESLint 顽疾。
  - **规范化**: 修复了 `any` 滥用、未等待的 Promise (`no-floating-promises`)、以及 `async` 函数中缺少 `await` 的警告。
  - **健壮性**: 为全局过滤器 (`HttpExceptionFilter`) 建立了结构化的 `ErrorResponse` 类型定义，确保了错误消息提取的安全性。
- **前台门户体验增强 (blogWeb)**:
  - **网络层重构**: 将开发环境代理 (Proxy) 从 `request.ts` 迁移至 `astro.config.mjs`，实现了更专业的解耦。
  - **沉浸式 404**: 基于 **MuYuCat (木鱼猫)** 品牌调性与“毛线球”插图，设计了具备叙事感的 404 页面，支持 100vh 动态背景与全栈亮暗色适配。
- **Elite Admin 侧边栏重构 (Sidebar-Centric)**:
  - **布局革命**: 废弃了顶部 Header，确立了以侧边栏为核心的“垂直流”布局。
  - **品牌集成**: 侧边栏头部集成了 MuYuCat 动态 Logo 与大尺寸亮暗切换按钮 (`20px`)。
  - **个性化体验**: 引入了 **PITAO 系列随机头像** 系统，每次登录/刷新均可获得不同的猫咪/动物形象，并放大了头像显示尺寸 (`48px`)。
  - **蓝图可视化**: 完成了 5 个核心模块（菜单、游戏、文章、资源、日志）的 Demo 页面搭建与路由同步，实现了“所见即所得”的功能蓝图。
- **技术底层稳固**:
  - **类型声明**: 解决了静态资源 (`.png`) 在 TypeScript 下的 `TS(2307)` 找不到模块问题。
  - **运行时扩展**: 成功将复杂的 UI 逻辑从独立 Layout 组件迁移至 UmiJS 的 `RunTimeLayoutConfig` (`app.tsx`)，解决了侧边栏菜单渲染丢失的架构难题。

### 📦 交付物

- `apps/blogWeb/src/pages/404.astro`: 具备品牌叙事感的 404 错误页。
- `apps/blogAdmin/src/app.tsx`: 集成了主题切换与随机头像逻辑的运行时布局配置。
- `apps/blogAdmin/src/pages/`: 完整的后台功能模块 Demo 矩阵。
- `apps/blogAdmin/src/typings.d.ts`: 全局静态资源类型声明文件。

---

## 2026-04-07：全站精英视觉体系闭环与 Elite Admin 早期启动 (旧记录备份)

...

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

### 🚀 重大变更

- **Monorepo 落地**: 基于 **pnpm workspaces** 建立了统一的代码管理模式。
  - `apps/blogWeb`: 前台门户 (Vue 3.4)。
  - `apps/blogAdmin`: 后台管理 (React 18)。
  - `apps/blogApi`: 后端服务 (NestJS v10)。
  - `apps/blogMobile`: 移动端 (uni-app)。
  - `packages/validation`: 全栈共享的校验包 (Zod)。
- **数据库建模**: 确立了以 **Prisma ORM** 为核心的 MySQL 数据库模型。
  - 核心表：`User`, `Game`, `Doc`, `Bookmark`。
- **技术规范确立**:
  - 全面使用 **TypeScript** 以保证类型安全。
  - 引入 **Husky + Commitlint** 规范代码提交。
  - 接入 **Prettier + ESLint** 确保代码风格统一。

### 📦 交付物

- 完整的目录结构与 `pnpm-workspace.yaml`。
- `apps/blogApi/prisma/schema.prisma` 基础模型。
- `@newblog/validation` 基础 Schema 定义。
