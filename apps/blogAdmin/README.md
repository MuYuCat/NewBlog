# blogAdmin - 后台管理系统

基于 **UmiJS v4 (@umijs/max)** + **Ant Design v5** 构建的企业级后台。

## 核心特性

- **UI 组件**: 使用 ProComponents 快速构建数据表格与表单。
- **样式方案**: Tailwind CSS (已配置 preflight: false 以兼容 antd)。
- **校验逻辑**: 集成 `@newblog/validation` (Zod) 进行前端表单校验。

## 开发启动

```bash
# 1. 确保已在根目录运行 pnpm install
# 2. 生成运行时 (仅第一次或修改配置后需要)
pnpm run setup

# 3. 启动开发服务器
pnpm run dev
```

## 目录结构

- `/src/pages`: 业务页面（index, login 等）。
- `/src/layouts`: 全局布局配置。
- `/.umirc.ts`: UmiJS 核心配置文件。
