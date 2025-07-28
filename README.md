# LDesign 多功能脚手架工具

> 集成 CLI、UI 界面和开发工具链的一站式前端开发解决方案

## 🚀 功能特性

- **🛠️ CLI 脚手架**：快速创建 Vue2/Vue3、React、TypeScript、Less、Node.js 项目
- **🎨 可视化界面**：基于 Vite + Vue3 + TDesign 的直观操作界面
- **⚡ 开发工具集成**：集成 Vite、Rollup、tsup 等构建工具
- **🔄 Git 工作流**：内置版本控制和工作流管理
- **🚀 项目部署**：一键部署到多种平台
- **🔌 扩展性**：支持 VSCode 插件开发

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
- pnpm >= 8.0.0

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
# 启动 UI 界面开发服务器
pnpm dev

# 启动后端服务
pnpm --filter @ldesign/server dev
```

### 构建

```bash
# 构建所有包
pnpm build

# 构建特定包
pnpm build:cli
pnpm build:ui
pnpm build:server
```

## 📖 使用指南

### CLI 使用

```bash
# 全局安装
npm install -g @ldesign/cli

# 创建新项目
ldesign create my-project

# 启动开发服务器
ldesign dev

# 构建项目
ldesign build
```

### UI 界面使用

1. 启动 UI 服务：`pnpm dev`
2. 打开浏览器访问：`http://localhost:3000`
3. 通过可视化界面进行项目管理

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add some amazing feature'`
4. 推送到分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

## 📄 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者！