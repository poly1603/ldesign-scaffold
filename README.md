# LDesign Scaffold

<p align="center">
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg" alt="Node">
  <img src="https://img.shields.io/badge/license-MIT-yellow.svg" alt="License">
</p>

企业级 Node.js 脚手架生成器，支持 Vue2/3、React、Node.js 等多种技术栈，内置丰富的开发工具和最佳实践配置。

## ✨ 特性

- 🚀 **快速创建** - 一键生成项目结构，内置最佳实践配置
- 🎯 **多种模板** - 支持 Vue2/3、React、Node.js 等多种项目类型
- 🔧 **灵活配置** - 丰富的特性选项，TypeScript、ESLint、Docker 等一应俱全
- 🎨 **可视化界面** - 提供直观的 Web 界面，可视化配置项目参数
- 📦 **开箱即用** - 预配置开发环境，包含热重载、代码检查、自动化测试等
- 🌐 **企业级** - 支持 Docker、Nginx、CI/CD 等企业级部署方案

## 🚀 快速开始

### 安装

```bash
# 使用 pnpm (推荐)
pnpm install -g ldesign-scaffold

# 使用 npm
npm install -g ldesign-scaffold
```

### 创建项目

```bash
# 命令行创建
ldesign-scaffold create my-project

# 可视化界面创建
ldesign-scaffold ui
```

### 环境检测

```bash
ldesign-scaffold doctor
```

## 📋 支持的项目类型

| 项目类型 | 描述 | 技术栈 |
|---------|------|--------|
| Vue 3 项目 | 现代化 Vue.js 应用 | Vue 3 + TypeScript + Vite |
| Vue 3 组件库 | 可复用的 Vue 组件库 | Vue 3 + Rollup + TypeScript |
| Vue 2 项目 | Vue 2.x 兼容项目 | Vue 2.7 + TypeScript + Vite |
| React 项目 | React 18 应用 | React 18 + TypeScript + Vite |
| Node.js API | 后端 API 服务 | Node.js + Express + TypeScript |

## 🛠️ 核心特性

### 开发工具
- ✅ TypeScript 支持
- ✅ ESLint + Prettier 代码规范
- ✅ Husky + Commitlint Git 钩子
- ✅ Vitest 单元测试
- ✅ Cypress/Playwright E2E 测试

### 样式方案
- ✅ Tailwind CSS
- ✅ Sass/Less 预处理器
- ✅ CSS Modules
- ✅ 响应式设计支持

### 文档和部署
- ✅ VitePress 文档站点
- ✅ Storybook 组件展示
- ✅ Docker 容器化
- ✅ Nginx 配置生成
- ✅ GitHub Actions CI/CD

## 📚 示例项目

项目包含完整的示例，展示不同技术栈的最佳实践：

```bash
# Vue 3 示例
cd examples/vue3-example
pnpm install && pnpm run dev

# Vue 2 示例
cd examples/vue2-example
pnpm install && pnpm run dev

# React 示例
cd examples/react-example
pnpm install && pnpm run dev
```

## 📖 文档

- [快速开始](./docs/guide/getting-started.md) - 立即开始使用
- [安装指南](./docs/guide/installation.md) - 详细安装说明
- [API 参考](./docs/api/index.md) - 完整的 API 文档
- [示例项目](./docs/examples/index.md) - 各种项目示例

启动文档服务：

```bash
pnpm run docs:dev
```

## 🔧 开发

```bash
# 克隆项目
git clone https://github.com/ldesign/ldesign-scaffold.git
cd ldesign-scaffold

# 安装依赖
pnpm install

# 开发模式
pnpm run dev

# 构建项目
pnpm run build

# 运行测试
pnpm run test

# 代码检查
pnpm run lint
```

## 🧪 测试

运行功能测试：

```bash
node test-scaffold.js
```

## 📄 许可证

[MIT License](./LICENSE)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

- [GitHub Issues](https://github.com/ldesign/ldesign-scaffold/issues) - 问题反馈
- [GitHub Discussions](https://github.com/ldesign/ldesign-scaffold/discussions) - 社区讨论
