# 快速开始

本指南将帮助你在几分钟内创建第一个使用 LDesign Scaffold 的项目。

## 前置要求

在开始之前，请确保你的开发环境满足以下要求：

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0 (推荐) 或 **npm** >= 9.0.0
- **Git** >= 2.0.0

你可以使用以下命令检查版本：

```bash
node --version
pnpm --version
git --version
```

## 安装脚手架

### 全局安装

```bash
pnpm install -g ldesign-scaffold
```

### 验证安装

```bash
ldesign-scaffold --version
```

如果安装成功，你将看到版本号输出。

## 创建第一个项目

### 使用命令行创建

```bash
# 创建新项目
ldesign-scaffold create my-vue-app

# 进入项目目录
cd my-vue-app

# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev
```

### 使用可视化界面创建

如果你更喜欢图形界面，可以使用可视化界面：

```bash
# 启动可视化界面
ldesign-scaffold ui
```

这将在浏览器中打开一个 Web 界面，你可以通过点击和选择来配置项目。

## 项目结构

创建的项目将具有以下结构：

```
my-vue-app/
├── src/
│   ├── components/
│   ├── assets/
│   ├── App.vue
│   └── main.ts
├── public/
├── tests/
├── docs/
├── .vscode/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── eslint.config.js
└── README.md
```

## 开发命令

生成的项目包含以下常用命令：

```bash
# 启动开发服务器
pnpm run dev

# 构建生产版本
pnpm run build

# 预览构建结果
pnpm run preview

# 运行代码检查
pnpm run lint

# 修复代码问题
pnpm run lint:fix

# 格式化代码
pnpm run format

# 运行单元测试
pnpm run test

# 运行测试覆盖率
pnpm run test:coverage

# 启动文档服务器
pnpm run docs:dev

# 构建文档
pnpm run docs:build
```

## 配置选项

在创建项目时，你可以选择以下配置选项：

### 项目类型
- **Vue 3 项目** - 现代 Vue.js 应用
- **Vue 3 组件库** - 可复用组件库
- **Vue 2 项目** - Vue 2.x 兼容项目
- **React 项目** - React 18 应用
- **Node.js API** - 后端 API 服务

### 构建工具
- **Vite** - 快速开发和构建
- **Rollup** - 适合组件库
- **Webpack** - 传统构建工具
- **tsup** - TypeScript 专用

### 包管理器
- **pnpm** - 快速、节省磁盘空间
- **yarn** - 稳定可靠
- **npm** - Node.js 默认

### 项目特性
- **TypeScript** - 类型安全 (推荐)
- **ESLint** - 代码检查 (推荐)
- **Prettier** - 代码格式化 (推荐)
- **Husky** - Git 钩子
- **Commitlint** - 提交信息规范
- **Vitest** - 单元测试
- **Cypress** - E2E 测试
- **Tailwind CSS** - 原子化 CSS
- **Sass/Less** - CSS 预处理器
- **VitePress** - 文档站点
- **Storybook** - 组件展示
- **Docker** - 容器化
- **Nginx** - Web 服务器
- **GitHub Actions** - CI/CD

## 环境检测

在开始开发之前，建议运行环境检测命令：

```bash
ldesign-scaffold doctor
```

这将检查你的开发环境，包括：
- Node.js 版本
- 包管理器可用性
- Git 配置
- Docker 状态
- IDE 支持

## 下一步

现在你已经成功创建了第一个项目！接下来你可以：

1. [了解项目类型](/guide/project-types) - 选择适合的项目类型
2. [配置项目特性](/guide/features) - 自定义项目功能
3. [使用可视化界面](/guide/ui-interface) - 体验图形化配置
4. [查看示例项目](/examples/) - 学习最佳实践

## 常见问题

### 安装失败怎么办？

如果全局安装失败，可以尝试：

```bash
# 使用 npx 直接运行
npx ldesign-scaffold create my-project

# 或者使用 npm
npm install -g ldesign-scaffold
```

### 如何更新脚手架？

```bash
# 更新到最新版本
pnpm update -g ldesign-scaffold

# 检查版本
ldesign-scaffold --version
```

### 项目创建后如何修改配置？

项目创建后，你可以：
- 修改 `package.json` 中的依赖
- 调整 `vite.config.ts` 构建配置
- 更新 `eslint.config.js` 代码规范
- 自定义 `tsconfig.json` TypeScript 配置
