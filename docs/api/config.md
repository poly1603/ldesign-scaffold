# 配置选项

LDesign Scaffold 提供了丰富的配置选项，支持全局配置和项目级配置。

## 配置文件

### 全局配置

**位置：** `~/.ldesign-scaffold/config.json`

```json
{
  "defaultProjectType": "vue3-project",
  "defaultPackageManager": "pnpm",
  "defaultFeatures": ["typescript", "eslint", "prettier"],
  "author": "Your Name",
  "email": "your.email@example.com",
  "license": "MIT",
  "templatePaths": ["~/.ldesign-scaffold/templates"],
  "ui": {
    "theme": "auto",
    "language": "zh-CN",
    "port": 3000
  }
}
```

### 项目配置

**位置：** `ldesign.config.js`

```javascript
export default {
  // 项目基本信息
  name: 'my-project',
  type: 'vue3-project',
  description: 'My Vue 3 application',
  author: 'Your Name',
  version: '1.0.0',
  license: 'MIT',
  
  // 构建配置
  buildTool: 'vite',
  packageManager: 'pnpm',
  
  // 项目特性
  features: [
    'typescript',
    'eslint',
    'prettier',
    'vitest',
    'tailwindcss'
  ],
  
  // 模板配置
  template: {
    // 自定义模板路径
    paths: ['./templates'],
    
    // 模板变量
    variables: {
      apiBaseUrl: 'https://api.example.com',
      appTitle: 'My Application'
    }
  },
  
  // 工具配置
  tools: {
    // Git 配置
    git: {
      hooks: true,
      commitlint: true,
      husky: true
    },
    
    // Docker 配置
    docker: {
      enabled: true,
      baseImage: 'node:18-alpine',
      port: 3000
    },
    
    // Nginx 配置
    nginx: {
      enabled: false,
      ssl: false,
      domain: 'localhost'
    }
  },
  
  // 插件配置
  plugins: [
    // 自定义插件
  ]
}
```

## 配置选项详解

### 项目基本配置

#### name
- **类型：** `string`
- **默认值：** 项目目录名
- **描述：** 项目名称，必须符合 npm 包名规范

#### type
- **类型：** `ProjectType`
- **默认值：** `'vue3-project'`
- **可选值：** `'vue3-project'` | `'vue3-component'` | `'vue2-project'` | `'react-project'` | `'nodejs-api'`
- **描述：** 项目类型

#### description
- **类型：** `string`
- **默认值：** `''`
- **描述：** 项目描述

#### author
- **类型：** `string`
- **默认值：** Git 配置中的用户名
- **描述：** 项目作者

#### version
- **类型：** `string`
- **默认值：** `'1.0.0'`
- **描述：** 项目版本号

#### license
- **类型：** `string`
- **默认值：** `'MIT'`
- **描述：** 项目许可证

### 构建配置

#### buildTool
- **类型：** `BuildTool`
- **默认值：** `'vite'`
- **可选值：** `'vite'` | `'rollup'` | `'webpack'` | `'tsup'`
- **描述：** 构建工具

#### packageManager
- **类型：** `PackageManager`
- **默认值：** `'pnpm'`
- **可选值：** `'npm'` | `'yarn'` | `'pnpm'`
- **描述：** 包管理器

### 特性配置

#### features
- **类型：** `ProjectFeature[]`
- **默认值：** `[]`
- **可选值：** 
  - `'typescript'` - TypeScript 支持
  - `'eslint'` - 代码检查
  - `'prettier'` - 代码格式化
  - `'husky'` - Git 钩子
  - `'commitlint'` - 提交信息规范
  - `'vitest'` - 单元测试
  - `'cypress'` - E2E 测试
  - `'playwright'` - 现代 E2E 测试
  - `'tailwindcss'` - 原子化 CSS
  - `'sass'` - CSS 预处理器
  - `'less'` - CSS 预处理器
  - `'vitepress'` - 文档站点
  - `'storybook'` - 组件展示
  - `'docker'` - 容器化
  - `'nginx'` - Web 服务器
  - `'github-actions'` - CI/CD
  - `'router'` - 路由
  - `'store'` - 状态管理
  - `'i18n'` - 国际化
  - `'ui-library'` - UI 组件库
  - `'iconfont'` - 图标字体
  - `'fontmin'` - 字体压缩

### 模板配置

#### template.paths
- **类型：** `string[]`
- **默认值：** `[]`
- **描述：** 自定义模板路径

#### template.variables
- **类型：** `Record<string, any>`
- **默认值：** `{}`
- **描述：** 模板变量

### 工具配置

#### tools.git
```typescript
interface GitConfig {
  hooks?: boolean;        // 启用 Git 钩子
  commitlint?: boolean;   // 启用提交信息规范
  husky?: boolean;        // 启用 Husky
  flow?: boolean;         // 启用 Git Flow
}
```

#### tools.docker
```typescript
interface DockerConfig {
  enabled?: boolean;      // 启用 Docker
  baseImage?: string;     // 基础镜像
  port?: number;          // 容器端口
  volumes?: string[];     // 挂载卷
  environment?: Record<string, string>; // 环境变量
}
```

#### tools.nginx
```typescript
interface NginxConfig {
  enabled?: boolean;      // 启用 Nginx
  ssl?: boolean;          // 启用 HTTPS
  domain?: string;        // 域名
  port?: number;          // 端口
  proxy?: {               // 反向代理配置
    enabled: boolean;
    target: string;
    path: string;
  };
}
```

## 环境变量

### 系统环境变量

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| `LDESIGN_SCAFFOLD_HOME` | 脚手架主目录 | `~/.ldesign-scaffold` |
| `LDESIGN_SCAFFOLD_CACHE` | 缓存目录 | `~/.ldesign-scaffold/cache` |
| `LDESIGN_SCAFFOLD_TEMPLATES` | 模板目录 | `~/.ldesign-scaffold/templates` |
| `LDESIGN_SCAFFOLD_DEBUG` | 调试模式 | `false` |
| `LDESIGN_SCAFFOLD_REGISTRY` | npm 注册表 | `https://registry.npmjs.org/` |

### 项目环境变量

**.env 文件：**
```env
# 开发环境
NODE_ENV=development
PORT=3000
API_BASE_URL=http://localhost:3001

# 构建配置
BUILD_SOURCEMAP=true
BUILD_MINIFY=true

# 特性开关
ENABLE_MOCK=true
ENABLE_ANALYTICS=false
```

## 配置验证

### 配置文件验证

```typescript
interface ConfigSchema {
  name: string;
  type: ProjectType;
  description?: string;
  author?: string;
  version?: string;
  license?: string;
  buildTool?: BuildTool;
  packageManager?: PackageManager;
  features?: ProjectFeature[];
  template?: {
    paths?: string[];
    variables?: Record<string, any>;
  };
  tools?: {
    git?: GitConfig;
    docker?: DockerConfig;
    nginx?: NginxConfig;
  };
  plugins?: Plugin[];
}
```

### 验证规则

```javascript
// 配置验证规则
const configRules = {
  name: {
    required: true,
    pattern: /^[a-z0-9-]+$/,
    message: '项目名称只能包含小写字母、数字和连字符'
  },
  type: {
    required: true,
    enum: ['vue3-project', 'vue3-component', 'vue2-project', 'react-project', 'nodejs-api'],
    message: '无效的项目类型'
  },
  version: {
    pattern: /^\d+\.\d+\.\d+$/,
    message: '版本号必须符合语义化版本规范'
  },
  features: {
    type: 'array',
    items: {
      enum: ['typescript', 'eslint', 'prettier', /* ... */]
    },
    message: '包含无效的特性选项'
  }
}
```

## 配置继承

### 配置优先级

1. **命令行参数** - 最高优先级
2. **项目配置文件** - `ldesign.config.js`
3. **全局配置文件** - `~/.ldesign-scaffold/config.json`
4. **默认配置** - 内置默认值

### 配置合并

```javascript
// 配置合并示例
const finalConfig = {
  ...defaultConfig,      // 默认配置
  ...globalConfig,       // 全局配置
  ...projectConfig,      // 项目配置
  ...cliOptions         // 命令行选项
}
```

## 配置管理命令

### 查看配置

```bash
# 查看当前配置
ldesign-scaffold config list

# 查看特定配置项
ldesign-scaffold config get author

# 查看全局配置
ldesign-scaffold config list --global
```

### 设置配置

```bash
# 设置全局配置
ldesign-scaffold config set author "Your Name" --global

# 设置项目配置
ldesign-scaffold config set buildTool vite

# 批量设置配置
ldesign-scaffold config set --file config.json
```

### 重置配置

```bash
# 重置全局配置
ldesign-scaffold config reset --global

# 重置项目配置
ldesign-scaffold config reset

# 重置特定配置项
ldesign-scaffold config reset author
```

## 配置模板

### 常用配置模板

#### Vue 3 项目配置
```javascript
export default {
  type: 'vue3-project',
  buildTool: 'vite',
  packageManager: 'pnpm',
  features: [
    'typescript',
    'eslint',
    'prettier',
    'vitest',
    'router',
    'store',
    'tailwindcss'
  ]
}
```

#### React 项目配置
```javascript
export default {
  type: 'react-project',
  buildTool: 'vite',
  packageManager: 'pnpm',
  features: [
    'typescript',
    'eslint',
    'prettier',
    'vitest',
    'router',
    'tailwindcss'
  ]
}
```

#### Node.js API 配置
```javascript
export default {
  type: 'nodejs-api',
  buildTool: 'tsup',
  packageManager: 'pnpm',
  features: [
    'typescript',
    'eslint',
    'prettier',
    'vitest',
    'docker'
  ]
}
```

## 故障排除

### 配置文件错误

1. **语法错误**
   ```bash
   # 验证配置文件
   ldesign-scaffold config validate
   
   # 查看详细错误信息
   ldesign-scaffold config validate --verbose
   ```

2. **配置项无效**
   ```bash
   # 检查支持的配置项
   ldesign-scaffold config schema
   
   # 重置为默认配置
   ldesign-scaffold config reset
   ```

3. **权限问题**
   ```bash
   # 检查配置文件权限
   ls -la ~/.ldesign-scaffold/config.json
   
   # 修复权限
   chmod 644 ~/.ldesign-scaffold/config.json
   ```

## 下一步

- [核心 API](/api/core) - 核心类和方法
- [插件系统](/api/plugins) - 插件开发指南
- [CLI 接口](/api/cli) - 命令行工具参考
