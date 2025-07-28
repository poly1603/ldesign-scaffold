# 示例项目

这里提供了使用 LDesign Scaffold 创建的各种示例项目，展示了不同技术栈和配置的最佳实践。

## 项目概览

| 项目 | 技术栈 | 特性 | 端口 |
|------|--------|------|------|
| [Vue 3 示例](/examples/vue3) | Vue 3 + TypeScript + Vite | 组合式 API、响应式设计 | 3000 |
| [Vue 2 示例](/examples/vue2) | Vue 2 + TypeScript + Vite | 选项式 API、兼容性 | 3001 |
| [React 示例](/examples/react) | React 18 + TypeScript + Vite | Hooks、现代 React | 3002 |
| [Node.js API](/examples/nodejs) | Node.js + Express + TypeScript | RESTful API、中间件 | 3003 |

## 快速体验

所有示例项目都位于 `examples/` 目录下，你可以直接运行：

```bash
# 克隆项目
git clone https://github.com/ldesign/ldesign-scaffold.git
cd ldesign-scaffold

# 进入示例项目
cd examples/vue3-example

# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev
```

## 共同特性

所有示例项目都包含以下特性：

### 🛠️ 开发工具
- **TypeScript** - 类型安全
- **ESLint** - 代码检查
- **Prettier** - 代码格式化
- **Vite** - 快速构建工具

### 📦 构建配置
- **热重载** - 开发时实时更新
- **代码分割** - 优化加载性能
- **Tree Shaking** - 移除未使用代码
- **Source Map** - 调试支持

### 🎨 样式方案
- **CSS Modules** - 样式隔离
- **PostCSS** - CSS 后处理
- **响应式设计** - 移动端适配

### 🧪 测试支持
- **Vitest** - 单元测试框架
- **测试覆盖率** - 代码质量保证
- **组件测试** - UI 组件测试

## 使用方法

### 1. 安装依赖

每个示例项目都依赖于 ldesign-scaffold，首先需要安装：

```bash
# 在项目根目录
pnpm install

# 构建脚手架
pnpm run build

# 进入示例项目
cd examples/vue3-example
pnpm install
```

### 2. 开发命令

```bash
# 启动开发服务器
pnpm run dev

# 构建生产版本
pnpm run build

# 预览构建结果
pnpm run preview

# 运行代码检查
pnpm run lint

# 运行测试
pnpm run test
```

### 3. 自定义配置

你可以修改以下文件来自定义项目：

- `vite.config.ts` - Vite 构建配置
- `tsconfig.json` - TypeScript 配置
- `eslint.config.js` - ESLint 规则
- `package.json` - 项目依赖和脚本

## 项目结构

所有示例项目都遵循统一的目录结构：

```
project-name/
├── src/                 # 源代码目录
│   ├── components/      # 组件目录
│   ├── assets/         # 静态资源
│   ├── styles/         # 样式文件
│   └── main.ts         # 入口文件
├── public/             # 公共资源
├── tests/              # 测试文件
├── docs/               # 项目文档
├── .vscode/            # VS Code 配置
├── package.json        # 项目配置
├── vite.config.ts      # Vite 配置
├── tsconfig.json       # TypeScript 配置
└── README.md           # 项目说明
```

## 最佳实践

### 代码组织
- 按功能模块组织代码
- 使用 TypeScript 提供类型安全
- 遵循统一的命名规范

### 样式管理
- 使用 CSS Modules 避免样式冲突
- 采用 BEM 命名规范
- 响应式设计优先

### 性能优化
- 代码分割和懒加载
- 图片资源优化
- 缓存策略配置

### 测试策略
- 单元测试覆盖核心逻辑
- 组件测试验证 UI 行为
- E2E 测试保证用户流程

## 部署示例

### 静态部署

```bash
# 构建项目
pnpm run build

# 部署到静态服务器
# 将 dist/ 目录上传到服务器
```

### Docker 部署

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN pnpm install
COPY . .
RUN pnpm run build
EXPOSE 3000
CMD ["pnpm", "run", "preview"]
```

### Vercel 部署

```json
{
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist",
  "installCommand": "pnpm install"
}
```

## 贡献指南

如果你想为示例项目贡献代码：

1. Fork 项目仓库
2. 创建特性分支
3. 提交你的更改
4. 创建 Pull Request

## 问题反馈

如果在使用示例项目时遇到问题：

- [GitHub Issues](https://github.com/ldesign/ldesign-scaffold/issues)
- [讨论区](https://github.com/ldesign/ldesign-scaffold/discussions)

## 下一步

- [Vue 3 示例](/examples/vue3) - 现代 Vue.js 开发
- [React 示例](/examples/react) - React 18 最佳实践
- [API 参考](/api/) - 详细的 API 文档
