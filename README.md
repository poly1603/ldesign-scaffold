# 🎨 LDesign 多功能脚手架工具

> 一个超级强大的现代化脚手架工具！集成 CLI、UI 界面和开发工具链的一站式前端开发解决方案，让项目创建变得如此简单！

## ✨ 功能特性

### 🚀 丰富的项目模板
- **Vue 项目模板**：
  - Vue 2 基础项目（TypeScript + JSX + Less）
  - Vue 2 组件库（包含 Storybook、文档生成、多格式打包）
  - Vue 3 基础项目（TypeScript + JSX + Less）
  - Vue 3 组件库（包含 VitePress、Vitest、多格式打包）
- **React 项目模板**：
  - React 基础项目（TypeScript + JSX + Less）
  - React 组件库（包含 Storybook、Jest、多格式打包）
- **其他模板**：
  - TypeScript 工具库（完整的开发、测试、发布环境）
  - Node.js API 服务（Express + Prisma + Swagger）
  - Less 样式库（主题系统 + PostCSS）

### 🎯 双重操作模式
- **🖥️ 命令行模式**：适合开发者快速操作，支持脚本自动化
- **🎨 可视化界面**：直观的 Web UI，支持项目管理、实时监控、可视化操作

### ⚡ 完整的开发工具链
- **开发服务器**：一键启动各类项目的开发环境
- **构建打包**：支持多格式打包（ESM、CJS、UMD）
- **测试集成**：内置单元测试、集成测试、E2E 测试
- **Git 集成**：自动仓库初始化、可视化工作流管理
- **部署支持**：一键部署到各种平台

## 📦 项目结构

```
ldesign-scaffold/
├── packages/                 # 核心包
│   ├── cli/                 # CLI 工具包
│   ├── shared/              # 共享工具包
│   └── templates/           # 项目模板包
├── apps/                    # 应用
│   ├── ui/                  # 前端 UI 界面
│   └── server/              # 后端服务
├── tools/                   # 开发工具
└── docs/                    # 文档
```

## 🛠️ 技术栈

- **CLI 工具**：Node.js + TypeScript
- **前端界面**：Vite + Vue3 + TDesign Vue Next
- **后端服务**：NestJS
- **构建工具**：Vite、Rollup、tsup
- **包管理**：pnpm
- **代码规范**：ESLint + Prettier

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0（推荐）

### 方式一：使用 CLI 工具

```bash
# 全局安装 CLI 工具
npm install -g @ldesign/cli

# 创建新项目（交互式）
ldesign create my-awesome-project

# 或者直接指定模板
ldesign create my-vue-app --template vue3-basic
ldesign create my-component-lib --template vue3-component-lib
ldesign create my-api-server --template nodejs-api
```

### 方式二：使用可视化界面

```bash
# 克隆项目
git clone https://github.com/ldesign-team/ldesign-scaffold.git
cd ldesign-scaffold

# 安装依赖
pnpm install

# 启动 UI 界面和后端服务
pnpm dev
```

然后打开浏览器访问：`http://localhost:3000`

### 开发模式

```bash
# 启动完整开发环境（UI + 后端）
pnpm dev

# 单独启动 UI 界面
pnpm dev:ui

# 单独启动后端服务
pnpm dev:server
```

### 构建

```bash
# 构建所有包
pnpm build

# 构建特定包
pnpm build:cli      # 构建 CLI 工具
pnpm build:ui       # 构建 UI 界面
pnpm build:server   # 构建后端服务
```

## 📖 详细使用指南

### 🖥️ CLI 命令详解

```bash
# 创建项目
ldesign create <project-name> [options]
  --template <template>     # 指定模板
  --package-manager <pm>    # 指定包管理器 (npm/yarn/pnpm)
  --git                     # 初始化 Git 仓库
  --install                 # 自动安装依赖

# 启动开发服务器
ldesign dev [options]
  --port <port>            # 指定端口
  --open                   # 自动打开浏览器

# 构建项目
ldesign build [options]
  --mode <mode>            # 构建模式 (development/production)
  --outDir <dir>           # 输出目录

# 启动 UI 界面
ldesign ui [options]
  --port <port>            # UI 服务端口
  --host <host>            # 绑定主机

# 部署项目
ldesign deploy [options]
  --target <target>        # 部署目标
```

### 🎨 UI 界面功能

1. **项目创建**：可视化选择模板、配置参数
2. **项目管理**：查看项目列表、状态监控
3. **开发工具**：启动/停止开发服务器
4. **构建打包**：一键构建、进度监控
5. **Git 工作流**：可视化 Git 操作
6. **部署管理**：多平台部署支持

## 📋 项目模板详解

### Vue 项目模板

#### Vue 3 基础项目 (`vue3-basic`)
- **技术栈**：Vue 3 + Vite + TypeScript + JSX + Less
- **特性**：Vue Router、Pinia、ESLint、Prettier
- **适用场景**：中小型 Vue 3 项目开发

#### Vue 3 组件库 (`vue3-component-lib`)
- **技术栈**：Vue 3 + Vite + TypeScript + JSX + Less
- **特性**：Storybook、VitePress 文档、Vitest 测试、多格式打包
- **适用场景**：Vue 3 组件库开发

#### Vue 2 基础项目 (`vue2-basic`)
- **技术栈**：Vue 2 + Webpack + TypeScript + JSX + Less
- **特性**：Vue Router、Vuex、ESLint、Prettier
- **适用场景**：维护现有 Vue 2 项目

#### Vue 2 组件库 (`vue2-component-lib`)
- **技术栈**：Vue 2 + Rollup + TypeScript + JSX + Less
- **特性**：Storybook、VuePress 文档、Jest 测试、多格式打包
- **适用场景**：Vue 2 组件库开发

### React 项目模板

#### React 基础项目 (`react-basic`)
- **技术栈**：React 18 + Vite + TypeScript + JSX + Less
- **特性**：React Router、ESLint、Prettier
- **适用场景**：现代 React 项目开发

#### React 组件库 (`react-component-lib`)
- **技术栈**：React 18 + Rollup + TypeScript + JSX + Less
- **特性**：Storybook、Jest + Testing Library、多格式打包
- **适用场景**：React 组件库开发

### 其他模板

#### TypeScript 工具库 (`typescript-lib`)
- **技术栈**：TypeScript + Rollup + Jest
- **特性**：完整的开发环境、测试配置、发布流程
- **适用场景**：工具函数库、SDK 开发

#### Node.js API 服务 (`nodejs-api`)
- **技术栈**：Node.js + Express + TypeScript + Prisma
- **特性**：API 文档生成、数据库集成、Docker 支持
- **适用场景**：后端 API 服务开发

#### Less 样式库 (`less-style-lib`)
- **技术栈**：Less + PostCSS + Rollup
- **特性**：主题系统、样式组件、自动化构建
- **适用场景**：样式库、设计系统开发

## 🤝 贡献指南

我们热烈欢迎各种形式的贡献！无论是 Bug 修复、新功能开发、文档改进还是使用反馈，都是对项目的宝贵贡献。

### 贡献流程

1. **Fork 项目**：点击右上角的 Fork 按钮
2. **克隆到本地**：`git clone https://github.com/your-username/ldesign-scaffold.git`
3. **创建分支**：`git checkout -b feature/amazing-feature`
4. **开发功能**：编写代码并添加测试
5. **提交更改**：`git commit -m 'feat: add amazing feature'`
6. **推送分支**：`git push origin feature/amazing-feature`
7. **创建 PR**：在 GitHub 上创建 Pull Request

## 📄 许可证

本项目基于 [MIT](LICENSE) 许可证开源，这意味着你可以自由地使用、修改和分发本项目。

## 🙏 致谢

感谢所有为本项目做出贡献的开发者和用户！特别感谢：

- [Vue.js](https://vuejs.org/) 团队提供的优秀框架
- [TDesign](https://tdesign.tencent.com/) 团队提供的精美组件库
- [Vite](https://vitejs.dev/) 团队提供的快速构建工具
- 所有提供反馈和建议的用户

## 📞 联系我们

- 🏠 **项目主页**：[GitHub](https://github.com/ldesign-team/ldesign-scaffold)
- 🐛 **问题反馈**：[Issues](https://github.com/ldesign-team/ldesign-scaffold/issues)
- 💬 **讨论交流**：[Discussions](https://github.com/ldesign-team/ldesign-scaffold/discussions)
- 📧 **邮件联系**：ldesign-team@example.com

---

<div align="center">

**如果这个项目对你有帮助，请给我们一个 ⭐ Star！**

Made with ❤️ by LDesign Team

</div>