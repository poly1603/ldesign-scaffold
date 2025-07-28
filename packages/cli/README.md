# @ldesign/cli

一个强大的前端项目脚手架工具，帮助您快速创建和管理现代化的前端项目。

## 特性

- 🚀 **快速创建项目** - 支持多种主流框架模板
- 🛠️ **开发服务器** - 内置开发服务器，支持热重载
- 📦 **智能构建** - 优化的构建配置，支持多种输出格式
- 🌐 **一键部署** - 支持多种部署平台
- 🎨 **可视化界面** - 提供直观的图形化操作界面
- 📋 **TypeScript 支持** - 完整的 TypeScript 类型定义
- 🔧 **灵活配置** - 支持自定义配置和插件扩展

## 安装

### 全局安装

```bash
npm install -g @ldesign/cli
# 或
pnpm add -g @ldesign/cli
# 或
yarn global add @ldesign/cli
```

### 临时使用

```bash
npx @ldesign/cli create my-project
# 或
pnpm dlx @ldesign/cli create my-project
```

## 使用方法

### 创建新项目

```bash
# 交互式创建项目
ldesign create my-project

# 指定模板创建项目
ldesign create my-project --template vue
ldesign create my-project --template react
ldesign create my-project --template library

# 指定包管理器
ldesign create my-project --package-manager pnpm

# 跳过依赖安装
ldesign create my-project --skip-install

# 跳过 Git 初始化
ldesign create my-project --skip-git
```

### 启动开发服务器

```bash
# 使用默认配置启动
ldesign dev

# 指定端口和主机
ldesign dev --port 8080 --host 0.0.0.0

# 启用 HTTPS
ldesign dev --https

# 自动打开浏览器
ldesign dev --open
```

### 构建项目

```bash
# 生产环境构建
ldesign build

# 指定构建模式
ldesign build --mode production
ldesign build --mode development

# 指定输出目录
ldesign build --outDir dist

# 生成 sourcemap
ldesign build --sourcemap

# 分析构建产物
ldesign build --analyze
```

### 部署项目

```bash
# 交互式选择部署平台
ldesign deploy

# 部署到 Vercel
ldesign deploy --platform vercel

# 部署到 Netlify
ldesign deploy --platform netlify

# 部署到 GitHub Pages
ldesign deploy --platform github-pages

# 跳过构建直接部署
ldesign deploy --skip-build
```

### 启动可视化界面

```bash
# 启动 UI 界面
ldesign ui

# 指定端口
ldesign ui --port 3001

# 不自动打开浏览器
ldesign ui --no-open
```

## 支持的模板

### 前端框架

- **Vue 3 + Vite** - 现代化的 Vue.js 开发环境
- **React + Vite** - 快速的 React 开发环境
- **Svelte + Vite** - 轻量级的 Svelte 开发环境
- **Vanilla + Vite** - 原生 JavaScript 开发环境

### 库和工具

- **TypeScript Library** - TypeScript 库开发模板
- **Node.js Library** - Node.js 库开发模板
- **Monorepo** - 多包管理模板

### 移动端

- **React Native** - 跨平台移动应用开发
- **Ionic** - 混合移动应用开发

## 配置文件

### ldesign.config.js

在项目根目录创建 `ldesign.config.js` 文件来自定义配置：

```javascript
export default {
  // 开发服务器配置
  dev: {
    port: 3000,
    host: 'localhost',
    open: true,
    https: false
  },
  
  // 构建配置
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: true,
    target: 'es2015'
  },
  
  // 部署配置
  deploy: {
    platform: 'vercel',
    buildCommand: 'npm run build',
    outputDir: 'dist'
  },
  
  // 插件配置
  plugins: [
    // 自定义插件
  ]
};
```

### package.json 脚本

推荐在 `package.json` 中添加以下脚本：

```json
{
  "scripts": {
    "dev": "ldesign dev",
    "build": "ldesign build",
    "deploy": "ldesign deploy",
    "ui": "ldesign ui"
  }
}
```

## 环境变量

支持以下环境变量：

- `LDESIGN_REGISTRY` - 自定义 npm 镜像源
- `LDESIGN_TEMPLATE_REGISTRY` - 自定义模板源
- `LDESIGN_LOG_LEVEL` - 日志级别 (debug, info, warn, error)
- `LDESIGN_NO_UPDATE_CHECK` - 禁用更新检查

## API

### 编程式使用

```javascript
import { createProject, startDev, buildProject } from '@ldesign/cli';

// 创建项目
await createProject({
  name: 'my-project',
  template: 'vue',
  packageManager: 'pnpm'
});

// 启动开发服务器
await startDev({
  port: 3000,
  open: true
});

// 构建项目
await buildProject({
  mode: 'production',
  outDir: 'dist'
});
```

## 插件开发

### 创建插件

```javascript
// my-plugin.js
export default function myPlugin(options = {}) {
  return {
    name: 'my-plugin',
    
    // 项目创建时的钩子
    onCreate(context) {
      // 自定义逻辑
    },
    
    // 开发服务器启动时的钩子
    onDev(context) {
      // 自定义逻辑
    },
    
    // 构建时的钩子
    onBuild(context) {
      // 自定义逻辑
    }
  };
}
```

### 使用插件

```javascript
// ldesign.config.js
import myPlugin from './my-plugin.js';

export default {
  plugins: [
    myPlugin({
      // 插件选项
    })
  ]
};
```

## 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 查找占用端口的进程
   netstat -ano | findstr :3000
   # 终止进程
   taskkill /F /PID <PID>
   ```

2. **依赖安装失败**
   ```bash
   # 清理缓存
   npm cache clean --force
   # 或
   pnpm store prune
   ```

3. **构建失败**
   ```bash
   # 检查 Node.js 版本
   node --version
   # 更新依赖
   npm update
   ```

### 调试模式

启用调试模式获取详细日志：

```bash
LDESIGN_LOG_LEVEL=debug ldesign create my-project
```

## 更新日志

查看 [CHANGELOG.md](./CHANGELOG.md) 了解版本更新信息。

## 贡献指南

欢迎贡献代码！请查看 [CONTRIBUTING.md](../../CONTRIBUTING.md) 了解贡献指南。

## 许可证

[MIT](../../LICENSE) © LDesign Team

## 相关链接

- [官方文档](https://ldesign.dev)
- [GitHub 仓库](https://github.com/ldesign/ldesign-scaffold)
- [问题反馈](https://github.com/ldesign/ldesign-scaffold/issues)
- [讨论区](https://github.com/ldesign/ldesign-scaffold/discussions)