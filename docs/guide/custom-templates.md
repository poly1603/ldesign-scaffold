# 自定义模板

LDesign Scaffold 支持创建和使用自定义模板，让你可以根据团队需求定制项目结构。

## 模板结构

### 基本目录结构

```
my-custom-template/
├── template.config.js     # 模板配置文件
├── template/              # 模板文件目录
│   ├── src/
│   │   ├── index.ts.ejs
│   │   └── components/
│   ├── public/
│   ├── package.json.ejs
│   ├── README.md.ejs
│   └── .gitignore
├── hooks/                 # 生命周期钩子
│   ├── pre-generate.js
│   └── post-generate.js
├── assets/                # 静态资源
└── README.md              # 模板说明
```

### 模板配置文件

**template.config.js：**
```javascript
export default {
  // 模板基本信息
  name: 'my-custom-template',
  description: '我的自定义模板',
  version: '1.0.0',
  author: 'Your Name',
  
  // 模板类型
  type: 'custom',
  
  // 支持的项目类型
  projectTypes: ['vue3-project', 'react-project'],
  
  // 模板文件列表
  files: [
    'src/**/*',
    'public/**/*',
    'package.json.ejs',
    'vite.config.ts.ejs',
    'README.md.ejs',
    '.gitignore'
  ],
  
  // 模板变量定义
  variables: {
    projectName: {
      type: 'string',
      required: true,
      description: '项目名称',
      validate: (value) => /^[a-z0-9-]+$/.test(value)
    },
    author: {
      type: 'string',
      default: 'Anonymous',
      description: '作者信息'
    },
    useTypeScript: {
      type: 'boolean',
      default: true,
      description: '是否使用 TypeScript'
    },
    features: {
      type: 'array',
      default: ['eslint', 'prettier'],
      description: '项目特性',
      choices: ['eslint', 'prettier', 'vitest', 'tailwindcss']
    }
  },
  
  // 交互式提示配置
  prompts: [
    {
      type: 'input',
      name: 'projectName',
      message: '请输入项目名称：',
      validate: (input) => {
        if (!input) return '项目名称不能为空'
        if (!/^[a-z0-9-]+$/.test(input)) return '项目名称只能包含小写字母、数字和连字符'
        return true
      }
    },
    {
      type: 'input',
      name: 'description',
      message: '请输入项目描述：',
      default: (answers) => `${answers.projectName} project`
    },
    {
      type: 'confirm',
      name: 'useTypeScript',
      message: '是否使用 TypeScript？',
      default: true
    },
    {
      type: 'checkbox',
      name: 'features',
      message: '选择项目特性：',
      choices: [
        { name: 'ESLint', value: 'eslint', checked: true },
        { name: 'Prettier', value: 'prettier', checked: true },
        { name: 'Vitest', value: 'vitest' },
        { name: 'Tailwind CSS', value: 'tailwindcss' }
      ]
    }
  ],
  
  // 依赖项配置
  dependencies: {
    vue: '^3.4.0',
    'vue-router': '^4.0.0'
  },
  
  devDependencies: {
    vite: '^5.0.0',
    '@vitejs/plugin-vue': '^5.0.0'
  },
  
  // 条件依赖
  conditionalDependencies: {
    typescript: {
      condition: 'useTypeScript',
      devDependencies: {
        'typescript': '^5.0.0',
        '@types/node': '^20.0.0'
      }
    },
    eslint: {
      condition: (variables) => variables.features.includes('eslint'),
      devDependencies: {
        'eslint': '^8.0.0',
        '@typescript-eslint/parser': '^6.0.0'
      }
    }
  }
}
```

## 模板文件编写

### EJS 模板语法

**package.json.ejs：**
```ejs
{
  "name": "<%= projectName %>",
  "version": "1.0.0",
  "description": "<%= description %>",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    <% if (useTypeScript) { %>
    "type-check": "vue-tsc --noEmit",
    <% } %>
    <% if (features.includes('eslint')) { %>
    "lint": "eslint src --ext .ts,.vue",
    "lint:fix": "eslint src --ext .ts,.vue --fix",
    <% } %>
    <% if (features.includes('vitest')) { %>
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    <% } %>
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.4.0"<% if (features.includes('router')) { %>,
    "vue-router": "^4.0.0"<% } %>
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-vue": "^5.0.0"<% if (useTypeScript) { %>,
    "typescript": "^5.0.0",
    "vue-tsc": "^1.0.0"<% } %><% if (features.includes('eslint')) { %>,
    "eslint": "^8.0.0"<% } %><% if (features.includes('tailwindcss')) { %>,
    "tailwindcss": "^3.0.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0"<% } %>
  }
}
```

### 条件文件生成

**src/main.ts.ejs：**
```ejs
import { createApp } from 'vue'
<% if (features.includes('router')) { %>
import { createRouter, createWebHistory } from 'vue-router'
<% } %>
<% if (features.includes('tailwindcss')) { %>
import './style.css'
<% } %>
import App from './App.vue'

<% if (features.includes('router')) { %>
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('./views/Home.vue') }
  ]
})

<% } %>
const app = createApp(App)

<% if (features.includes('router')) { %>
app.use(router)
<% } %>

app.mount('#app')
```

### 动态文件名

使用变量生成动态文件名：

```javascript
// template.config.js
export default {
  files: [
    'src/**/*',
    {
      from: 'component.vue.ejs',
      to: (variables) => `src/components/${variables.componentName}.vue`
    }
  ]
}
```

## 生命周期钩子

### pre-generate 钩子

在文件生成前执行：

**hooks/pre-generate.js：**
```javascript
export default function preGenerate(context) {
  const { variables, config, targetDir } = context
  
  // 修改变量
  if (variables.useTypeScript) {
    variables.fileExtension = 'ts'
  } else {
    variables.fileExtension = 'js'
  }
  
  // 动态添加依赖
  if (variables.features.includes('pinia')) {
    config.dependencies.pinia = '^2.0.0'
  }
  
  // 验证目标目录
  if (fs.existsSync(targetDir) && !variables.overwrite) {
    throw new Error('目标目录已存在')
  }
  
  console.log('开始生成项目...')
  
  return context
}
```

### post-generate 钩子

在文件生成后执行：

**hooks/post-generate.js：**
```javascript
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

export default function postGenerate(context) {
  const { variables, targetDir, packageManager } = context
  
  // 安装依赖
  console.log('安装依赖...')
  try {
    execSync(`${packageManager} install`, {
      cwd: targetDir,
      stdio: 'inherit'
    })
  } catch (error) {
    console.warn('依赖安装失败，请手动安装')
  }
  
  // 初始化 Git 仓库
  if (variables.initGit) {
    console.log('初始化 Git 仓库...')
    try {
      execSync('git init', { cwd: targetDir })
      execSync('git add .', { cwd: targetDir })
      execSync('git commit -m "Initial commit"', { cwd: targetDir })
    } catch (error) {
      console.warn('Git 初始化失败')
    }
  }
  
  // 创建额外文件
  if (variables.features.includes('docker')) {
    const dockerfilePath = path.join(targetDir, 'Dockerfile')
    fs.writeFileSync(dockerfilePath, generateDockerfile(variables))
  }
  
  // 显示完成信息
  console.log(`
项目创建完成！

下一步：
  cd ${variables.projectName}
  ${packageManager} run dev

祝你开发愉快！
  `)
}

function generateDockerfile(variables) {
  return `
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
  `.trim()
}
```

## 模板测试

### 创建测试脚本

**test/template.test.js：**
```javascript
import { TemplateManager } from 'ldesign-scaffold'
import fs from 'fs'
import path from 'path'

describe('Custom Template', () => {
  const templateManager = new TemplateManager()
  const testDir = './test-output'
  
  beforeEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true })
    }
  })
  
  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true })
    }
  })
  
  test('should generate project with TypeScript', async () => {
    const result = await templateManager.generateProject({
      template: './my-custom-template',
      targetDir: testDir,
      variables: {
        projectName: 'test-project',
        useTypeScript: true,
        features: ['eslint', 'vitest']
      }
    })
    
    expect(result.success).toBe(true)
    expect(fs.existsSync(path.join(testDir, 'package.json'))).toBe(true)
    expect(fs.existsSync(path.join(testDir, 'tsconfig.json'))).toBe(true)
    
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(testDir, 'package.json'), 'utf8')
    )
    expect(packageJson.devDependencies.typescript).toBeDefined()
  })
  
  test('should generate project without TypeScript', async () => {
    const result = await templateManager.generateProject({
      template: './my-custom-template',
      targetDir: testDir,
      variables: {
        projectName: 'test-project',
        useTypeScript: false,
        features: ['eslint']
      }
    })
    
    expect(result.success).toBe(true)
    expect(fs.existsSync(path.join(testDir, 'tsconfig.json'))).toBe(false)
    
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(testDir, 'package.json'), 'utf8')
    )
    expect(packageJson.devDependencies.typescript).toBeUndefined()
  })
})
```

### 运行测试

```bash
# 安装测试依赖
npm install --save-dev vitest @vitest/ui

# 运行测试
npm test

# 运行测试并查看覆盖率
npm run test:coverage
```

## 模板发布

### 发布到 npm

1. **准备 package.json**
```json
{
  "name": "my-scaffold-template",
  "version": "1.0.0",
  "description": "My custom scaffold template",
  "main": "template.config.js",
  "keywords": ["scaffold", "template", "vue", "react"],
  "author": "Your Name",
  "license": "MIT",
  "files": [
    "template/",
    "hooks/",
    "template.config.js",
    "README.md"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/user/my-scaffold-template.git"
  }
}
```

2. **发布包**
```bash
npm login
npm publish
```

### 创建 Git 仓库

```bash
git init
git add .
git commit -m "Initial template"
git remote add origin https://github.com/user/my-template.git
git push -u origin main

# 创建标签
git tag v1.0.0
git push --tags
```

## 使用自定义模板

### 本地模板

```bash
ldesign-scaffold create my-project --template ./path/to/template
```

### npm 包模板

```bash
ldesign-scaffold create my-project --template my-scaffold-template
```

### Git 仓库模板

```bash
ldesign-scaffold create my-project --template https://github.com/user/template.git

# 指定分支或标签
ldesign-scaffold create my-project --template https://github.com/user/template.git#v1.0.0
```

## 模板最佳实践

### 1. 文件组织

- 保持模板文件结构清晰
- 使用有意义的文件名
- 合理使用子目录

### 2. 变量设计

- 使用描述性的变量名
- 提供合理的默认值
- 添加变量验证

### 3. 条件逻辑

- 避免过于复杂的条件
- 使用函数简化逻辑
- 提供清晰的注释

### 4. 错误处理

```javascript
// 在钩子中处理错误
export default function preGenerate(context) {
  try {
    // 处理逻辑
  } catch (error) {
    console.error('模板处理失败:', error.message)
    throw error
  }
}
```

### 5. 文档编写

- 提供详细的 README
- 包含使用示例
- 说明变量和选项

## 故障排除

### 常见问题

1. **模板语法错误**
   - 检查 EJS 语法
   - 验证变量名拼写
   - 确保括号匹配

2. **文件生成失败**
   - 检查文件路径
   - 验证目录权限
   - 确保模板文件存在

3. **钩子执行失败**
   - 检查钩子函数语法
   - 验证依赖是否安装
   - 查看错误日志

### 调试技巧

```bash
# 启用调试模式
ldesign-scaffold create my-project --template ./template --debug

# 干运行（不实际创建文件）
ldesign-scaffold create my-project --template ./template --dry-run

# 查看详细日志
ldesign-scaffold create my-project --template ./template --verbose
```

## 下一步

- [环境检测](/guide/environment-check) - 检查开发环境
- [工具集成](/guide/tools) - 了解工具集成
- [API 参考](/api/core) - 查看核心 API
