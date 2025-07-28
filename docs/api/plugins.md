# 插件系统

LDesign Scaffold 提供了强大的插件系统，允许你扩展脚手架的功能。

## 插件基础

### 插件接口

```typescript
interface Plugin {
  // 插件名称
  name: string;
  
  // 插件版本
  version: string;
  
  // 插件描述
  description?: string;
  
  // 插件作者
  author?: string;
  
  // 应用插件
  apply(generator: ScaffoldGenerator): void;
  
  // 插件配置
  options?: Record<string, any>;
}
```

### 基本插件结构

```typescript
export class MyPlugin implements Plugin {
  name = 'my-plugin'
  version = '1.0.0'
  description = '我的自定义插件'
  author = 'Your Name'
  
  constructor(private options: MyPluginOptions = {}) {}
  
  apply(generator: ScaffoldGenerator) {
    // 插件逻辑
  }
}
```

## 插件开发

### 简单插件示例

```typescript
// plugins/hello-plugin.ts
import { Plugin, ScaffoldGenerator } from 'ldesign-scaffold'

export class HelloPlugin implements Plugin {
  name = 'hello-plugin'
  version = '1.0.0'
  
  apply(generator: ScaffoldGenerator) {
    // 监听项目创建开始事件
    generator.on('create:start', (config) => {
      console.log(`Hello! 正在创建项目: ${config.name}`)
    })
    
    // 监听项目创建完成事件
    generator.on('create:complete', (result) => {
      if (result.success) {
        console.log(`🎉 项目 ${result.projectPath} 创建成功！`)
      }
    })
  }
}
```

### 使用钩子的插件

```typescript
// plugins/custom-files-plugin.ts
export class CustomFilesPlugin implements Plugin {
  name = 'custom-files-plugin'
  version = '1.0.0'
  
  apply(generator: ScaffoldGenerator) {
    // 在项目创建后添加自定义文件
    generator.hooks.afterCreate.tapAsync('CustomFilesPlugin', async (result, callback) => {
      if (result.success) {
        try {
          await this.addCustomFiles(result.projectPath!)
          callback()
        } catch (error) {
          callback(error)
        }
      } else {
        callback()
      }
    })
  }
  
  private async addCustomFiles(projectPath: string) {
    const fs = await import('fs-extra')
    const path = await import('path')
    
    // 添加自定义配置文件
    const configContent = `
export default {
  appName: 'My Custom App',
  version: '1.0.0',
  features: ['custom-feature']
}
    `.trim()
    
    await fs.writeFile(
      path.join(projectPath, 'custom.config.js'),
      configContent
    )
    
    console.log('✅ 添加了自定义配置文件')
  }
}
```

### 修改项目配置的插件

```typescript
// plugins/vue-enhancement-plugin.ts
export class VueEnhancementPlugin implements Plugin {
  name = 'vue-enhancement-plugin'
  version = '1.0.0'
  
  apply(generator: ScaffoldGenerator) {
    // 在项目创建前修改配置
    generator.hooks.beforeCreate.tap('VueEnhancementPlugin', (config) => {
      // 只对 Vue 项目生效
      if (config.type === 'vue3-project') {
        // 自动添加推荐特性
        const recommendedFeatures = ['router', 'store', 'i18n']
        
        recommendedFeatures.forEach(feature => {
          if (!config.features.includes(feature)) {
            config.features.push(feature)
          }
        })
        
        console.log('🔧 为 Vue 项目添加了推荐特性')
      }
      
      return config
    })
  }
}
```

## 钩子系统

### 可用钩子

```typescript
interface Hooks {
  // 同步钩子
  beforeCreate: SyncHook<[ProjectConfig]>
  afterCreate: SyncHook<[CreateProjectResult]>
  
  // 异步钩子
  beforeTemplateLoad: AsyncSeriesHook<[string]>
  afterTemplateLoad: AsyncSeriesHook<[Template]>
  beforeFileGenerate: AsyncSeriesHook<[string, string]>
  afterFileGenerate: AsyncSeriesHook<[string]>
  beforeInstall: AsyncSeriesHook<[string[]]>
  afterInstall: AsyncSeriesHook<[InstallResult]>
  
  // 异步并行钩子
  beforeBuild: AsyncParallelHook<[ProjectConfig]>
  afterBuild: AsyncParallelHook<[BuildResult]>
}
```

### 钩子使用方法

#### tap() - 同步钩子

```typescript
generator.hooks.beforeCreate.tap('MyPlugin', (config) => {
  // 同步修改配置
  config.description = `Enhanced: ${config.description}`
  return config
})
```

#### tapAsync() - 异步钩子

```typescript
generator.hooks.afterCreate.tapAsync('MyPlugin', async (result, callback) => {
  try {
    // 异步操作
    await doSomethingAsync(result)
    callback() // 成功时调用
  } catch (error) {
    callback(error) // 错误时调用
  }
})
```

#### tapPromise() - Promise 钩子

```typescript
generator.hooks.afterCreate.tapPromise('MyPlugin', async (result) => {
  // 返回 Promise
  return doSomethingAsync(result)
})
```

## 插件配置

### 带配置的插件

```typescript
interface MyPluginOptions {
  enabled?: boolean;
  customMessage?: string;
  features?: string[];
}

export class ConfigurablePlugin implements Plugin {
  name = 'configurable-plugin'
  version = '1.0.0'
  
  constructor(private options: MyPluginOptions = {}) {
    // 设置默认值
    this.options = {
      enabled: true,
      customMessage: 'Hello from plugin!',
      features: [],
      ...options
    }
  }
  
  apply(generator: ScaffoldGenerator) {
    if (!this.options.enabled) {
      return // 插件被禁用
    }
    
    generator.on('create:start', (config) => {
      console.log(this.options.customMessage)
      
      // 添加配置的特性
      this.options.features?.forEach(feature => {
        if (!config.features.includes(feature)) {
          config.features.push(feature)
        }
      })
    })
  }
}
```

### 使用配置插件

```typescript
const generator = new ScaffoldGenerator()

// 使用默认配置
generator.use(new ConfigurablePlugin())

// 使用自定义配置
generator.use(new ConfigurablePlugin({
  enabled: true,
  customMessage: '自定义消息',
  features: ['typescript', 'eslint']
}))
```

## 内置插件

### TypeScript 插件

```typescript
export class TypeScriptPlugin implements Plugin {
  name = 'typescript-plugin'
  version = '1.0.0'
  
  apply(generator: ScaffoldGenerator) {
    generator.hooks.afterCreate.tapAsync('TypeScriptPlugin', async (result, callback) => {
      if (result.success && this.shouldAddTypeScript(result.config)) {
        try {
          await this.setupTypeScript(result.projectPath!)
          callback()
        } catch (error) {
          callback(error)
        }
      } else {
        callback()
      }
    })
  }
  
  private shouldAddTypeScript(config: ProjectConfig): boolean {
    return config.features.includes('typescript')
  }
  
  private async setupTypeScript(projectPath: string) {
    const fs = await import('fs-extra')
    const path = await import('path')
    
    // 生成 tsconfig.json
    const tsConfig = {
      compilerOptions: {
        target: 'ES2020',
        module: 'ESNext',
        lib: ['ES2020', 'DOM'],
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist']
    }
    
    await fs.writeJSON(
      path.join(projectPath, 'tsconfig.json'),
      tsConfig,
      { spaces: 2 }
    )
    
    console.log('✅ 配置了 TypeScript')
  }
}
```

### ESLint 插件

```typescript
export class ESLintPlugin implements Plugin {
  name = 'eslint-plugin'
  version = '1.0.0'
  
  apply(generator: ScaffoldGenerator) {
    generator.hooks.afterCreate.tapAsync('ESLintPlugin', async (result, callback) => {
      if (result.success && this.shouldAddESLint(result.config)) {
        try {
          await this.setupESLint(result.projectPath!, result.config)
          callback()
        } catch (error) {
          callback(error)
        }
      } else {
        callback()
      }
    })
  }
  
  private shouldAddESLint(config: ProjectConfig): boolean {
    return config.features.includes('eslint')
  }
  
  private async setupESLint(projectPath: string, config: ProjectConfig) {
    const fs = await import('fs-extra')
    const path = await import('path')
    
    // 根据项目类型生成不同的 ESLint 配置
    let eslintConfig: any = {
      env: {
        browser: true,
        es2021: true,
        node: true
      },
      extends: ['eslint:recommended'],
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      rules: {}
    }
    
    // TypeScript 配置
    if (config.features.includes('typescript')) {
      eslintConfig.extends.push('@typescript-eslint/recommended')
      eslintConfig.parser = '@typescript-eslint/parser'
      eslintConfig.plugins = ['@typescript-eslint']
    }
    
    // Vue 配置
    if (config.type.startsWith('vue')) {
      eslintConfig.extends.push('plugin:vue/vue3-essential')
      eslintConfig.plugins = eslintConfig.plugins || []
      eslintConfig.plugins.push('vue')
    }
    
    // React 配置
    if (config.type === 'react-project') {
      eslintConfig.extends.push('plugin:react/recommended')
      eslintConfig.plugins = eslintConfig.plugins || []
      eslintConfig.plugins.push('react')
      eslintConfig.settings = {
        react: {
          version: 'detect'
        }
      }
    }
    
    await fs.writeJSON(
      path.join(projectPath, '.eslintrc.json'),
      eslintConfig,
      { spaces: 2 }
    )
    
    console.log('✅ 配置了 ESLint')
  }
}
```

## 插件管理

### 插件注册

```typescript
const generator = new ScaffoldGenerator()

// 注册单个插件
generator.use(new MyPlugin())

// 注册多个插件
generator.use([
  new TypeScriptPlugin(),
  new ESLintPlugin(),
  new CustomFilesPlugin()
])

// 条件注册插件
if (process.env.NODE_ENV === 'development') {
  generator.use(new DevPlugin())
}
```

### 插件配置文件

**ldesign.config.js：**
```javascript
import { TypeScriptPlugin, ESLintPlugin } from 'ldesign-scaffold/plugins'
import { MyCustomPlugin } from './plugins/my-custom-plugin'

export default {
  plugins: [
    new TypeScriptPlugin(),
    new ESLintPlugin({
      rules: {
        'no-console': 'warn'
      }
    }),
    new MyCustomPlugin({
      enabled: true,
      customOption: 'value'
    })
  ]
}
```

## 插件发布

### 插件包结构

```
my-scaffold-plugin/
├── src/
│   ├── index.ts          # 插件入口
│   └── plugin.ts         # 插件实现
├── dist/                 # 编译输出
├── package.json          # 包配置
├── README.md             # 说明文档
└── LICENSE               # 许可证
```

### package.json 配置

```json
{
  "name": "my-scaffold-plugin",
  "version": "1.0.0",
  "description": "My custom scaffold plugin",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "keywords": ["scaffold", "plugin", "ldesign"],
  "author": "Your Name",
  "license": "MIT",
  "peerDependencies": {
    "ldesign-scaffold": "^1.0.0"
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ]
}
```

### 插件入口文件

```typescript
// src/index.ts
export { MyPlugin } from './plugin'
export type { MyPluginOptions } from './plugin'

// 默认导出
export default MyPlugin
```

### 发布插件

```bash
# 构建插件
npm run build

# 发布到 npm
npm publish

# 或发布到私有仓库
npm publish --registry https://npm.company.com
```

## 插件测试

### 单元测试

```typescript
// tests/plugin.test.ts
import { describe, it, expect, vi } from 'vitest'
import { ScaffoldGenerator } from 'ldesign-scaffold'
import { MyPlugin } from '../src/plugin'

describe('MyPlugin', () => {
  it('should register correctly', () => {
    const generator = new ScaffoldGenerator()
    const plugin = new MyPlugin()
    
    expect(() => generator.use(plugin)).not.toThrow()
  })
  
  it('should modify config correctly', async () => {
    const generator = new ScaffoldGenerator()
    const plugin = new MyPlugin()
    
    generator.use(plugin)
    
    const config = {
      name: 'test-project',
      type: 'vue3-project' as const,
      features: []
    }
    
    // 模拟钩子调用
    const result = await generator.hooks.beforeCreate.promise(config)
    
    expect(result.features).toContain('my-feature')
  })
})
```

### 集成测试

```typescript
// tests/integration.test.ts
import { describe, it, expect } from 'vitest'
import { ScaffoldGenerator } from 'ldesign-scaffold'
import { MyPlugin } from '../src/plugin'
import fs from 'fs-extra'
import path from 'path'

describe('MyPlugin Integration', () => {
  it('should create project with plugin features', async () => {
    const generator = new ScaffoldGenerator()
    const plugin = new MyPlugin()
    
    generator.use(plugin)
    
    const testDir = './test-output'
    
    const result = await generator.createProject({
      targetDir: testDir,
      config: {
        name: 'test-project',
        type: 'vue3-project',
        features: ['my-feature']
      }
    })
    
    expect(result.success).toBe(true)
    expect(fs.existsSync(path.join(testDir, 'custom.config.js'))).toBe(true)
    
    // 清理
    await fs.remove(testDir)
  })
})
```

## 插件最佳实践

### 1. 命名规范

- 插件名称使用 kebab-case
- 类名使用 PascalCase
- 包名使用 `*-scaffold-plugin` 后缀

### 2. 错误处理

```typescript
export class SafePlugin implements Plugin {
  name = 'safe-plugin'
  version = '1.0.0'
  
  apply(generator: ScaffoldGenerator) {
    generator.hooks.afterCreate.tapAsync('SafePlugin', async (result, callback) => {
      try {
        await this.doSomething(result)
        callback()
      } catch (error) {
        // 记录错误但不中断流程
        console.warn(`插件 ${this.name} 执行失败:`, error.message)
        callback() // 继续执行
      }
    })
  }
  
  private async doSomething(result: CreateProjectResult) {
    // 可能失败的操作
  }
}
```

### 3. 性能优化

```typescript
export class OptimizedPlugin implements Plugin {
  name = 'optimized-plugin'
  version = '1.0.0'
  
  private cache = new Map()
  
  apply(generator: ScaffoldGenerator) {
    generator.hooks.beforeCreate.tap('OptimizedPlugin', (config) => {
      // 使用缓存避免重复计算
      const cacheKey = `${config.type}-${config.features.join(',')}`
      
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey)
      }
      
      const result = this.processConfig(config)
      this.cache.set(cacheKey, result)
      
      return result
    })
  }
  
  private processConfig(config: ProjectConfig) {
    // 处理配置
    return config
  }
}
```

### 4. 文档和示例

每个插件都应该包含：
- 详细的 README.md
- 使用示例
- API 文档
- 配置选项说明

## 下一步

- [CLI 接口](/api/cli) - 命令行工具参考
- [核心 API](/api/core) - 核心类和方法
- [配置选项](/api/config) - 配置参考文档
