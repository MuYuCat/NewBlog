# 会话备份 (2026-04-08)

## 核心任务

- 修复 `blogAdmin` 亮暗模式切换延迟与色差问题。
- 重塑后台管理系统的侧边栏视觉风格（大色块 + 高奢）。

## 关键决策与变更

1. **架构变更**: 弃用 UmiJS 的 `layout` 插件，手动实现 `src/layouts/index.tsx`。
   - **原因**: `ProLayout` 内部状态闭包导致 `childrenRender` 无法实时响应 `initialState` 的变化。
2. **性能优化**:
   - 启用 Ant Design 5 的 `cssVar: true`。
   - 实现“DOM 优先”反馈逻辑（在 `toggleTheme` 中立即操作 `document.documentElement.classList`）。
3. **视觉标准**:
   - 背景色锁定：`#0a0a0c` (Dark) / `#ffffff` (Light)。
   - 菜单项：圆角 16px、高度 54px 的色块，支持 GSAP 悬停位移及暗色模式下的高对比度白色系色块。
4. **品牌对齐**: 同步了 `MuYuCat` Logo 和 Favicon，更新了管理后台网页标题。

## 下次任务起点

- **[Admin] 菜单管理 (MVP)**: 对接 `blogApi` 的菜单接口，实现侧边栏的动态渲染与 CRUD。
- **[API] 文章系统**: 开始 Prisma 建模。
