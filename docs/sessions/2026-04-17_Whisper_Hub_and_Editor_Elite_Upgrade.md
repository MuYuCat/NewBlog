# 2026-04-17 会话记录：Whisper 板块视觉革命与编辑器协议升级

## 1. 核心任务目标

- [x] 构建“喃喃自语 (Whisper)”板块，实现高性能瀑布流与 Elite UI 视觉。
- [x] 实现曝光统计（Impression Tracking）无感监听。
- [x] 为文章详情页增加“精英目录 (TOC)”并支持中文锚点。
- [x] 解决 Word 粘贴时的样式污染、双份数据以及标题丢失问题。
- [x] 全站交互文字汉化。

## 2. 关键技术方案

### 2.1 Whisper 板块重塑

- **视觉基因**: 提取 `ArticleList` 的搜索控制台框架与 `VaultView` 的磨砂玻璃卡片视觉。
- **无限加载**: 采用 `IntersectionObserver` 哨兵模式，配合 GSAP 实现平滑的追加动画。
- **曝光算法**: 只有在视口内停留超过 2 秒且暴露比例 > 50% 时，才触发一次 `PATCH /article/:id/click` 接口。

### 2.2 编辑器“洁净粘贴”革命

- **暴力清洗**: 通过正则预处理，物理切除 Word 剪贴板中的 `<style>`、`<meta>` 及 XML 注释块。
- **标题还原**: 建立 `MsoHeading` 类名与标准字号（pt）到 HTML 标题标签的映射矩阵。
- **物理拦截**: 采用原生事件捕获阶段（Capture Phase）拦截 `paste` 事件，成功阻止了编辑器的默认粘贴行为，从根本上消除了“双份内容”。

### 2.3 精英目录 (Elite TOC)

- **中文锚点**: 优化 ID 生成算法，支持 `heading-中文内容` 格式。
- **滚动监听**: 引入 `rootMargin: '-10% 0px -80% 0px'` 的精确监听范围，确保阅读到章节头部时准确高亮。

## 3. 已解决的 Bug 列表

- **TS Error**: `src/main.ts` 无法识别 `.vue` 文件 -> 补全 `env.d.ts` 声明模块。
- **Layout Overlap**: 长内容挤压侧边栏 -> 将 `flex` 升级为 `grid` 锁定列宽，并注入 `overflow-wrap: break-word`。
- **Word Pollution**: 粘贴出现大量 `@font-face` 乱码 -> 升级 HTML 清洗算法。
- **Duplicated Content**: 粘贴 Word 出现两套内容 -> 切换至捕获阶段拦截。

## 4. 下一步计划

1. **[移动端] 跨端启动**: 启动 `blogMobile` (uni-app) 的实质性页面构建。
2. **[集成] MinerU 算力节点**: 对接 Mac Mini 算力中心，实现复杂 PDF/Word 的 1:1 像素级解析。
3. **[后台] 发射中心 Bento 升级**: 将 Word 导入功能集成到 Bento Grid 风格的控制台中。
