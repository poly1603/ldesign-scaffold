# API 参考

LDesign Scaffold 提供了丰富的 API 接口，包括命令行工具、核心类库和插件系统。

## 概览

- [命令行接口](/api/cli) - CLI 命令和选项
- [配置选项](/api/config) - 项目配置参数
- [核心 API](/api/core) - 核心类和方法
- [插件系统](/api/plugins) - 扩展和插件开发

## 快速索引

### 命令行工具

| 命令 | 描述 | 示例 |
|------|------|------|
| `create` | 创建新项目 | `ldesign-scaffold create my-app` |
| `ui` | 启动可视化界面 | `ldesign-scaffold ui` |
| `list` | 列出可用模板 | `ldesign-scaffold list` |
| `doctor` | 环境检测 | `ldesign-scaffold doctor` |

### 核心类

| 类名 | 描述 | 用途 |
|------|------|------|
| `ScaffoldGenerator` | 脚手架生成器 | 项目创建和管理 |
| `TemplateManager` | 模板管理器 | 模板处理和渲染 |
| `ConfigGenerator` | 配置生成器 | 配置文件生成 |
| `UIServer` | UI 服务器 | 可视化界面服务 |

### 管理工具

| 类名 | 描述 | 功能 |
|------|------|------|
| `GitManager` | Git 管理 | 版本控制操作 |
| `DockerManager` | Docker 管理 | 容器化配置 |
| `NginxManager` | Nginx 管理 | Web 服务器配置 |
| `WorkflowManager` | 工作流管理 | CI/CD 配置 |

## 类型定义

### 项目配置

```typescript
interface ProjectConfig {
  name: string
  type: ProjectType
  buildTool: BuildTool
  packageManager: PackageManager
  features: ProjectFeature[]
  description: string
  author: string
  version: string
  license: string
}
```

### 项目类型

```typescript
type ProjectType = 
  | 'vue3-project'
  | 'vue3-component'
  | 'vue2-project'
  | 'react-project'
  | 'nodejs-api'
  | 'custom'
```

### 构建工具

```typescript
type BuildTool = 
  | 'vite'
  | 'rollup'
  | 'webpack'
  | 'tsup'
```

### 包管理器

```typescript
type PackageManager = 
  | 'npm'
  | 'yarn'
  | 'pnpm'
```

### 项目特性

```typescript
type ProjectFeature = 
  | 'typescript'
  | 'eslint'
  | 'prettier'
  | 'husky'
  | 'commitlint'
  | 'vitest'
  | 'cypress'
  | 'playwright'
  | 'tailwindcss'
  | 'sass'
  | 'less'
  | 'vitepress'
  | 'storybook'
  | 'docker'
  | 'nginx'
  | 'github-actions'
  | 'router'
  | 'store'
  | 'i18n'
  | 'ui-library'
  | 'iconfont'
  | 'fontmin'
```

## 使用示例

### 编程式 API

```typescript
import { ScaffoldGenerator } from 'ldesign-scaffold'

const generator = new ScaffoldGenerator()

// 创建项目
const result = await generator.createProject({
  targetDir: './my-project',
  config: {
    name: 'my-project',
    type: 'vue3-project',
    buildTool: 'vite',
    packageManager: 'pnpm',
    features: ['typescript', 'eslint', 'vitest'],
    description: 'My Vue 3 project',
    author: 'Your Name',
    version: '1.0.0',
    license: 'MIT'
  },
  variables: {
    projectName: 'my-project',
    projectDescription: 'My Vue 3 project',
    author: 'Your Name',
    version: '1.0.0',
    license: 'MIT'
  }
})

if (result.success) {
  console.log('项目创建成功!')
} else {
  console.error('项目创建失败:', result.error)
}
```

### 模板管理

```typescript
import { TemplateManager } from 'ldesign-scaffold'

const templateManager = new TemplateManager()

// 列出可用模板
const templates = await templateManager.listTemplates()
console.log('可用模板:', templates)

// 渲染模板
const rendered = await templateManager.renderTemplate(
  'vue3-project',
  {
    projectName: 'my-app',
    author: 'Your Name'
  }
)
```

### Git 管理

```typescript
import { GitManager } from 'ldesign-scaffold'

const gitManager = new GitManager('./my-project')

// 初始化 Git 仓库
await gitManager.init()

// 添加远程仓库
await gitManager.addRemote('origin', 'https://github.com/user/repo.git')

// 提交代码
await gitManager.commit('Initial commit')
```

## 错误处理

### 错误类型

```typescript
interface ScaffoldError {
  code: string
  message: string
  details?: any
}

interface CommandResult<T = any> {
  success: boolean
  data?: T
  error?: ScaffoldError
}
```

### 常见错误码

| 错误码 | 描述 | 解决方案 |
|--------|------|----------|
| `INVALID_PROJECT_NAME` | 项目名称无效 | 使用有效的包名格式 |
| `DIRECTORY_EXISTS` | 目录已存在 | 使用 `--overwrite` 选项 |
| `TEMPLATE_NOT_FOUND` | 模板不存在 | 检查模板名称 |
| `DEPENDENCY_INSTALL_FAILED` | 依赖安装失败 | 检查网络和包管理器 |
| `GIT_INIT_FAILED` | Git 初始化失败 | 检查 Git 配置 |

## 配置文件

### 脚手架配置

```typescript
// ldesign.config.ts
import { defineConfig } from 'ldesign-scaffold'

export default defineConfig({
  // 默认项目类型
  defaultProjectType: 'vue3-project',
  
  // 默认包管理器
  defaultPackageManager: 'pnpm',
  
  // 默认特性
  defaultFeatures: ['typescript', 'eslint', 'prettier'],
  
  // 自定义模板路径
  templatePaths: ['./templates'],
  
  // 插件配置
  plugins: [
    // 自定义插件
  ]
})
```

### 模板配置

```typescript
// template.config.ts
export default {
  name: 'my-template',
  description: '自定义模板',
  type: 'vue3-project',
  files: [
    'src/**/*',
    'public/**/*',
    'package.json.ejs',
    'vite.config.ts.ejs'
  ],
  variables: {
    projectName: 'string',
    author: 'string',
    description: 'string'
  }
}
```

## 扩展开发

### 插件接口

```typescript
interface Plugin {
  name: string
  version: string
  apply(generator: ScaffoldGenerator): void
}

// 插件示例
export class MyPlugin implements Plugin {
  name = 'my-plugin'
  version = '1.0.0'
  
  apply(generator: ScaffoldGenerator) {
    generator.hooks.beforeCreate.tap('MyPlugin', (config) => {
      // 在项目创建前执行
      console.log('创建项目:', config.name)
    })
    
    generator.hooks.afterCreate.tap('MyPlugin', (result) => {
      // 在项目创建后执行
      if (result.success) {
        console.log('项目创建成功!')
      }
    })
  }
}
```

### 钩子系统

```typescript
interface Hooks {
  beforeCreate: AsyncSeriesHook<[ProjectConfig]>
  afterCreate: AsyncSeriesHook<[CommandResult]>
  beforeInstall: AsyncSeriesHook<[string]>
  afterInstall: AsyncSeriesHook<[CommandResult]>
  beforeBuild: AsyncSeriesHook<[ProjectConfig]>
  afterBuild: AsyncSeriesHook<[CommandResult]>
}
```

## 下一步

- [命令行接口](/api/cli) - 详细的 CLI 文档
- [配置选项](/api/config) - 完整的配置参考
- [核心 API](/api/core) - 核心类和方法
- [插件系统](/api/plugins) - 插件开发指南
