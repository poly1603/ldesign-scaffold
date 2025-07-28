# 核心 API

LDesign Scaffold 的核心 API 提供了编程式接口，让你可以在代码中使用脚手架功能。

## 核心类

### ScaffoldGenerator

脚手架生成器，负责项目创建和管理。

```typescript
import { ScaffoldGenerator } from 'ldesign-scaffold'

const generator = new ScaffoldGenerator(options?)
```

#### 构造函数选项

```typescript
interface ScaffoldGeneratorOptions {
  // 工作目录
  cwd?: string;
  
  // 模板路径
  templatePaths?: string[];
  
  // 缓存目录
  cacheDir?: string;
  
  // 调试模式
  debug?: boolean;
  
  // 静默模式
  quiet?: boolean;
}
```

#### 方法

##### createProject()

创建新项目。

```typescript
async createProject(options: CreateProjectOptions): Promise<CreateProjectResult>
```

**参数：**
```typescript
interface CreateProjectOptions {
  // 目标目录
  targetDir: string;
  
  // 项目配置
  config: ProjectConfig;
  
  // 模板变量
  variables?: Record<string, any>;
  
  // 是否覆盖已存在目录
  overwrite?: boolean;
  
  // 是否安装依赖
  install?: boolean;
  
  // 包管理器
  packageManager?: PackageManager;
}
```

**返回值：**
```typescript
interface CreateProjectResult {
  success: boolean;
  projectPath?: string;
  error?: ScaffoldError;
  files?: string[];
  duration?: number;
}
```

**示例：**
```typescript
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
    apiBaseUrl: 'https://api.example.com'
  },
  install: true
})

if (result.success) {
  console.log('项目创建成功:', result.projectPath)
} else {
  console.error('项目创建失败:', result.error?.message)
}
```

##### listTemplates()

列出可用模板。

```typescript
async listTemplates(): Promise<TemplateInfo[]>
```

**返回值：**
```typescript
interface TemplateInfo {
  name: string;
  description: string;
  type: ProjectType;
  version: string;
  author: string;
  path: string;
  features: string[];
}
```

##### validateConfig()

验证项目配置。

```typescript
validateConfig(config: ProjectConfig): ValidationResult
```

### TemplateManager

模板管理器，负责模板的加载、渲染和管理。

```typescript
import { TemplateManager } from 'ldesign-scaffold'

const templateManager = new TemplateManager(options?)
```

#### 方法

##### loadTemplate()

加载模板。

```typescript
async loadTemplate(templatePath: string): Promise<Template>
```

##### renderTemplate()

渲染模板。

```typescript
async renderTemplate(
  template: Template,
  variables: Record<string, any>
): Promise<RenderedTemplate>
```

##### generateFiles()

生成文件。

```typescript
async generateFiles(
  template: RenderedTemplate,
  targetDir: string
): Promise<string[]>
```

**示例：**
```typescript
const templateManager = new TemplateManager()

// 加载模板
const template = await templateManager.loadTemplate('./templates/vue3-project')

// 渲染模板
const rendered = await templateManager.renderTemplate(template, {
  projectName: 'my-app',
  author: 'Your Name',
  features: ['typescript', 'eslint']
})

// 生成文件
const files = await templateManager.generateFiles(rendered, './output')
console.log('生成的文件:', files)
```

### ConfigManager

配置管理器，负责配置的读取、写入和验证。

```typescript
import { ConfigManager } from 'ldesign-scaffold'

const configManager = new ConfigManager()
```

#### 方法

##### getGlobalConfig()

获取全局配置。

```typescript
getGlobalConfig(): GlobalConfig
```

##### setGlobalConfig()

设置全局配置。

```typescript
setGlobalConfig(config: Partial<GlobalConfig>): void
```

##### getProjectConfig()

获取项目配置。

```typescript
getProjectConfig(projectDir: string): ProjectConfig | null
```

##### setProjectConfig()

设置项目配置。

```typescript
setProjectConfig(projectDir: string, config: ProjectConfig): void
```

### GitManager

Git 管理器，负责 Git 相关操作。

```typescript
import { GitManager } from 'ldesign-scaffold'

const gitManager = new GitManager(projectDir)
```

#### 方法

##### init()

初始化 Git 仓库。

```typescript
async init(): Promise<void>
```

##### addRemote()

添加远程仓库。

```typescript
async addRemote(name: string, url: string): Promise<void>
```

##### commit()

提交代码。

```typescript
async commit(message: string): Promise<void>
```

##### installHooks()

安装 Git 钩子。

```typescript
async installHooks(): Promise<void>
```

**示例：**
```typescript
const gitManager = new GitManager('./my-project')

// 初始化仓库
await gitManager.init()

// 添加远程仓库
await gitManager.addRemote('origin', 'https://github.com/user/repo.git')

// 安装钩子
await gitManager.installHooks()

// 提交代码
await gitManager.commit('Initial commit')
```

### DockerManager

Docker 管理器，负责 Docker 相关操作。

```typescript
import { DockerManager } from 'ldesign-scaffold'

const dockerManager = new DockerManager(projectDir)
```

#### 方法

##### generateDockerfile()

生成 Dockerfile。

```typescript
generateDockerfile(config: DockerConfig): string
```

##### generateCompose()

生成 docker-compose.yml。

```typescript
generateCompose(config: ComposeConfig): string
```

##### build()

构建 Docker 镜像。

```typescript
async build(tag?: string): Promise<void>
```

### UIServer

UI 服务器，负责可视化界面。

```typescript
import { UIServer } from 'ldesign-scaffold'

const uiServer = new UIServer(options?)
```

#### 方法

##### start()

启动 UI 服务器。

```typescript
async start(): Promise<void>
```

##### stop()

停止 UI 服务器。

```typescript
async stop(): Promise<void>
```

## 工具函数

### 文件操作

```typescript
import { 
  copyFile,
  copyDir,
  ensureDir,
  removeDir,
  readTemplate,
  writeTemplate
} from 'ldesign-scaffold/utils'

// 复制文件
await copyFile(src, dest)

// 复制目录
await copyDir(srcDir, destDir)

// 确保目录存在
await ensureDir(dir)

// 删除目录
await removeDir(dir)

// 读取模板
const content = await readTemplate(templatePath, variables)

// 写入模板
await writeTemplate(templatePath, destPath, variables)
```

### 包管理器操作

```typescript
import {
  detectPackageManager,
  installDependencies,
  addDependency,
  removeDependency
} from 'ldesign-scaffold/utils'

// 检测包管理器
const pm = detectPackageManager(projectDir)

// 安装依赖
await installDependencies(projectDir, pm)

// 添加依赖
await addDependency(projectDir, 'vue', '^3.4.0', pm)

// 移除依赖
await removeDependency(projectDir, 'vue', pm)
```

### 项目检测

```typescript
import {
  detectProjectType,
  detectBuildTool,
  detectFeatures
} from 'ldesign-scaffold/utils'

// 检测项目类型
const type = detectProjectType(projectDir)

// 检测构建工具
const buildTool = detectBuildTool(projectDir)

// 检测项目特性
const features = detectFeatures(projectDir)
```

## 事件系统

### 事件监听

```typescript
import { ScaffoldGenerator } from 'ldesign-scaffold'

const generator = new ScaffoldGenerator()

// 监听项目创建开始
generator.on('create:start', (config) => {
  console.log('开始创建项目:', config.name)
})

// 监听文件生成
generator.on('file:generate', (filePath) => {
  console.log('生成文件:', filePath)
})

// 监听项目创建完成
generator.on('create:complete', (result) => {
  console.log('项目创建完成:', result.projectPath)
})

// 监听错误
generator.on('error', (error) => {
  console.error('发生错误:', error.message)
})
```

### 可用事件

| 事件名 | 参数 | 描述 |
|--------|------|------|
| `create:start` | `ProjectConfig` | 项目创建开始 |
| `create:complete` | `CreateProjectResult` | 项目创建完成 |
| `template:load` | `string` | 模板加载 |
| `template:render` | `Template` | 模板渲染 |
| `file:generate` | `string` | 文件生成 |
| `dependency:install` | `string[]` | 依赖安装 |
| `git:init` | `string` | Git 初始化 |
| `error` | `Error` | 错误发生 |

## 插件系统

### 插件接口

```typescript
interface Plugin {
  name: string;
  version: string;
  apply(generator: ScaffoldGenerator): void;
}
```

### 插件开发

```typescript
export class MyPlugin implements Plugin {
  name = 'my-plugin'
  version = '1.0.0'
  
  apply(generator: ScaffoldGenerator) {
    // 监听事件
    generator.on('create:start', (config) => {
      console.log('插件：项目创建开始')
    })
    
    // 修改配置
    generator.hooks.beforeCreate.tap('MyPlugin', (config) => {
      if (config.type === 'vue3-project') {
        config.features.push('my-feature')
      }
      return config
    })
    
    // 添加文件
    generator.hooks.afterCreate.tap('MyPlugin', async (result) => {
      if (result.success) {
        await this.addCustomFiles(result.projectPath)
      }
    })
  }
  
  private async addCustomFiles(projectPath: string) {
    // 添加自定义文件
  }
}
```

### 使用插件

```typescript
import { ScaffoldGenerator } from 'ldesign-scaffold'
import { MyPlugin } from './my-plugin'

const generator = new ScaffoldGenerator()

// 注册插件
generator.use(new MyPlugin())

// 创建项目
await generator.createProject(options)
```

## 钩子系统

### 可用钩子

```typescript
interface Hooks {
  // 项目创建前
  beforeCreate: AsyncSeriesHook<[ProjectConfig]>
  
  // 项目创建后
  afterCreate: AsyncSeriesHook<[CreateProjectResult]>
  
  // 模板加载前
  beforeTemplateLoad: AsyncSeriesHook<[string]>
  
  // 模板加载后
  afterTemplateLoad: AsyncSeriesHook<[Template]>
  
  // 文件生成前
  beforeFileGenerate: AsyncSeriesHook<[string, string]>
  
  // 文件生成后
  afterFileGenerate: AsyncSeriesHook<[string]>
  
  // 依赖安装前
  beforeInstall: AsyncSeriesHook<[string[]]>
  
  // 依赖安装后
  afterInstall: AsyncSeriesHook<[InstallResult]>
}
```

### 使用钩子

```typescript
const generator = new ScaffoldGenerator()

// 在项目创建前修改配置
generator.hooks.beforeCreate.tap('MyHook', (config) => {
  config.description = `Enhanced: ${config.description}`
  return config
})

// 在文件生成后执行自定义逻辑
generator.hooks.afterFileGenerate.tap('MyHook', async (filePath) => {
  console.log('文件已生成:', filePath)
  
  // 执行自定义处理
  if (filePath.endsWith('.vue')) {
    await processVueFile(filePath)
  }
})
```

## 错误处理

### 错误类型

```typescript
class ScaffoldError extends Error {
  code: string
  details?: any
  
  constructor(message: string, code: string, details?: any) {
    super(message)
    this.code = code
    this.details = details
  }
}
```

### 常见错误码

| 错误码 | 描述 |
|--------|------|
| `INVALID_PROJECT_NAME` | 项目名称无效 |
| `DIRECTORY_EXISTS` | 目录已存在 |
| `TEMPLATE_NOT_FOUND` | 模板不存在 |
| `TEMPLATE_INVALID` | 模板无效 |
| `DEPENDENCY_INSTALL_FAILED` | 依赖安装失败 |
| `GIT_INIT_FAILED` | Git 初始化失败 |
| `FILE_WRITE_FAILED` | 文件写入失败 |

### 错误处理示例

```typescript
try {
  const result = await generator.createProject(options)
  
  if (!result.success) {
    switch (result.error?.code) {
      case 'DIRECTORY_EXISTS':
        console.log('目录已存在，请使用 --overwrite 选项')
        break
      case 'TEMPLATE_NOT_FOUND':
        console.log('模板不存在，请检查模板路径')
        break
      default:
        console.error('未知错误:', result.error?.message)
    }
  }
} catch (error) {
  if (error instanceof ScaffoldError) {
    console.error(`错误 [${error.code}]: ${error.message}`)
  } else {
    console.error('系统错误:', error.message)
  }
}
```

## 下一步

- [插件系统](/api/plugins) - 插件开发指南
- [CLI 接口](/api/cli) - 命令行工具参考
- [配置选项](/api/config) - 配置参考文档
