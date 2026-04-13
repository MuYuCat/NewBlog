# Session Report: BlogAdmin 构建架构优化与 Bug 修复 (2026-04-13)

## 1. 核心问题汇总

在开发 `blogAdmin` 的“内容发射中心”（文章编辑器）过程中，遇到了以下连锁技术难题：

1.  **MFSU 容器模块缺失**:
    - 报错: `Module "./@bytemd/react" does not exist in container`
    - 原因: UmiJS 4 的 MFSU 模块联邦加速在预编译 `bytemd` 及其子插件时，由于其内部包含 Svelte 转换逻辑或特定的打包路径，导致联邦容器索引失效。
2.  **React Hook 多实例冲突**:
    - 报错: `Invalid hook call`, `useRef of null`
    - 原因: 部分包（如 `bytemd`）被排除在 MFSU 之外后，其内部引用的 React 与 MFSU 容器内的 React 并非同一物理文件，导致 React 调度器（Dispatcher）状态隔离。
3.  **菜单路径 Key 重复**:
    - 报错: `Warning: Duplicated key '/article' used in Menu`
    - 原因: 父路由与子路由使用了相同的 `path: '/article'`，导致 Ant Design Pro 菜单生成树时 Key 冲突。
4.  **三方依赖解析失败**:
    - 报错: `Can't resolve 'highlight.js/styles/github.css'`
    - 原因: `highlight.js` 仅作为间接依赖存在，未显式安装，且在 MFSU 排除逻辑下无法自动解析。

## 2. 解决方案与实施步骤

### A. 架构级调整 (Stability First)

- **禁用 MFSU**: 将 `mfsu: false` 加入 `.umirc.ts`。在 pnpm monorepo 中处理具有复杂 peerDependencies 的三方库时，稳定性优于二次启动速度。
- **强制 React 单例**: 通过 Webpack `alias` 配置，使用 `require.resolve` 动态定位并锁定全局唯一的 `react` 和 `react-dom` 路径。

### B. 路由协议规范化

- **路径分离**: 将文章列表页路径从 `/article` 修改为 `/article/index`。
- **解耦重定向**: 将重定向逻辑提取至顶级路由，确保侧边栏菜单生成的 Key 唯一，消除控制台报警。

### C. 依赖补全

- **显式安装**: 安装了 `highlight.js` 以支持编辑器的语法高亮样式渲染。

## 3. 最终构建状态

- [x] MFSU 相关运行时报错已彻底清除。
- [x] React Hook 运行环境已对齐，编辑器正常加载。
- [x] 侧边栏菜单不再产生 Key 重复警告。
- [x] 缓存已清理，支持干净的 `pnpm dev` 启动。

---

**核准执行人**: Gemini CLI
**同步日期**: 2026-04-13
