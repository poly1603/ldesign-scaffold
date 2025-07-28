# 创建项目

本指南详细介绍如何使用 LDesign Scaffold 创建不同类型的项目。

## 基本用法

### 交互式创建

最简单的方式是使用交互式命令：

```bash
ldesign-scaffold create my-project
```

这将启动一个交互式向导，引导你完成项目配置：

1. **项目名称** - 输入项目名称（必须是有效的包名）
2. **项目类型** - 选择项目类型（Vue3、Vue2、React、Node.js 等）
3. **构建工具** - 选择构建工具（Vite、Rollup、Webpack 等）
4. **包管理器** - 选择包管理器（pnpm、npm、yarn）
5. **项目特性** - 选择需要的特性（TypeScript、ESLint、测试等）
6. **项目信息** - 填写描述、作者、许可证等信息

### 命令行参数

你也可以通过命令行参数直接指定配置：

```bash
ldesign-scaffold create my-vue-app \
  --type vue3-project \
  --build-tool vite \
  --package-manager pnpm \
  --features typescript,eslint,vitest \
  --author "Your Name" \
  --description "My Vue 3 application"
```

## 项目类型详解

### Vue 3 项目

创建现代化的 Vue 3 应用：

```bash
ldesign-scaffold create my-vue3-app --type vue3-project
```

**特点：**
- 使用 Vue 3 Composition API
- 支持 `<script setup>` 语法
- 内置 TypeScript 支持
- 现代化的开发体验

**推荐特性：**
- `typescript` - 类型安全
- `eslint` - 代码检查
- `vitest` - 单元测试
- `router` - Vue Router 4
- `store` - Pinia 状态管理

### Vue 3 组件库

创建可复用的 Vue 3 组件库：

```bash
ldesign-scaffold create my-ui-lib --type vue3-component
```

**特点：**
- 使用 Rollup 构建
- 支持多种输出格式（ES、CJS、UMD）
- 内置 Storybook 支持
- 自动生成类型定义

**推荐特性：**
- `typescript` - 类型定义
- `storybook` - 组件展示
- `vitepress` - 文档站点
- `vitest` - 组件测试

### Vue 2 项目

创建兼容 Vue 2 的项目：

```bash
ldesign-scaffold create my-vue2-app --type vue2-project
```

**特点：**
- 使用 Vue 2.7（支持 Composition API）
- 向后兼容的配置
- 渐进式升级支持

### React 项目

创建 React 18 应用：

```bash
ldesign-scaffold create my-react-app --type react-project
```

**特点：**
- React 18 + TypeScript
- 现代 Hooks 开发模式
- 支持 JSX/TSX

**推荐特性：**
- `typescript` - 类型安全
- `eslint` - 代码检查
- `vitest` - 单元测试
- `tailwindcss` - 样式框架

### Node.js API

创建后端 API 服务：

```bash
ldesign-scaffold create my-api --type nodejs-api
```

**特点：**
- Express.js 框架
- TypeScript 支持
- RESTful API 结构
- 中间件支持

**推荐特性：**
- `typescript` - 类型安全
- `eslint` - 代码检查
- `vitest` - 单元测试
- `docker` - 容器化部署

## 项目配置选项

### 构建工具

#### Vite (推荐)
- 快速的开发服务器
- 原生 ES 模块支持
- 优化的生产构建

```bash
--build-tool vite
```

#### Rollup
- 适合组件库开发
- 多种输出格式
- Tree-shaking 优化

```bash
--build-tool rollup
```

#### Webpack
- 成熟的构建工具
- 丰富的插件生态
- 企业级项目支持

```bash
--build-tool webpack
```

### 包管理器

#### pnpm (推荐)
- 快速、节省磁盘空间
- 严格的依赖管理
- Monorepo 支持

```bash
--package-manager pnpm
```

#### npm
- Node.js 默认包管理器
- 广泛支持
- 稳定可靠

```bash
--package-manager npm
```

#### yarn
- 快速、可靠
- 离线缓存
- 工作区支持

```bash
--package-manager yarn
```

## 项目特性

### 开发工具

#### TypeScript
类型安全的 JavaScript：

```bash
--features typescript
```

- 静态类型检查
- 更好的 IDE 支持
- 重构安全

#### ESLint
代码质量检查：

```bash
--features eslint
```

- 代码规范检查
- 潜在错误发现
- 团队代码一致性

#### Prettier
代码格式化：

```bash
--features prettier
```

- 自动代码格式化
- 统一代码风格
- 与 ESLint 集成

### 测试框架

#### Vitest
现代化的测试框架：

```bash
--features vitest
```

- 与 Vite 深度集成
- 快速执行
- TypeScript 支持

#### Cypress
端到端测试：

```bash
--features cypress
```

- 真实浏览器测试
- 可视化测试界面
- 时间旅行调试

### 样式方案

#### Tailwind CSS
原子化 CSS 框架：

```bash
--features tailwindcss
```

- 实用优先的设计
- 高度可定制
- 优化的生产构建

#### Sass
CSS 预处理器：

```bash
--features sass
```

- 变量和混入
- 嵌套规则
- 模块化

## 项目结构

创建的项目将具有以下标准结构：

```
my-project/
├── src/                 # 源代码目录
│   ├── components/      # 组件目录
│   ├── assets/         # 静态资源
│   ├── utils/          # 工具函数
│   └── main.ts         # 入口文件
├── public/             # 公共资源
├── tests/              # 测试文件
├── docs/               # 项目文档
├── .vscode/            # VS Code 配置
├── package.json        # 项目配置
├── vite.config.ts      # 构建配置
├── tsconfig.json       # TypeScript 配置
├── eslint.config.js    # ESLint 配置
└── README.md           # 项目说明
```

## 创建后的步骤

项目创建完成后，按照以下步骤开始开发：

### 1. 进入项目目录

```bash
cd my-project
```

### 2. 安装依赖

```bash
# 如果选择了 pnpm
pnpm install

# 如果选择了 npm
npm install

# 如果选择了 yarn
yarn install
```

### 3. 启动开发服务器

```bash
pnpm run dev
```

### 4. 开始开发

打开浏览器访问显示的地址，开始你的开发之旅！

## 常见问题

### 项目名称要求

项目名称必须符合 npm 包名规范：
- 只能包含小写字母、数字、连字符和下划线
- 不能以点或下划线开头
- 长度在 1-214 个字符之间

### 目录已存在

如果目标目录已存在，可以使用 `--overwrite` 选项：

```bash
ldesign-scaffold create my-project --overwrite
```

### 依赖安装失败

如果依赖安装失败，可以：
1. 检查网络连接
2. 尝试使用不同的包管理器
3. 配置镜像源

```bash
# 配置 npm 镜像源
npm config set registry https://registry.npmmirror.com/

# 配置 pnpm 镜像源
pnpm config set registry https://registry.npmmirror.com/
```

## 下一步

- [项目类型](/guide/project-types) - 了解不同项目类型的详细信息
- [特性配置](/guide/features) - 深入了解各种特性选项
- [模板系统](/guide/templates) - 学习如何自定义模板
