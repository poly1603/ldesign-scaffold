# 模板系统

LDesign Scaffold 使用强大的模板系统来生成项目文件，支持动态内容生成和自定义模板。

## 模板引擎

### EJS 模板引擎

LDesign Scaffold 使用 EJS (Embedded JavaScript) 作为模板引擎：

**特点：**
- 简单易用的语法
- 支持 JavaScript 表达式
- 条件渲染和循环
- 包含和继承

**基本语法：**
```ejs
<% // JavaScript 代码 %>
<%= variable %> // 输出变量
<%- htmlContent %> // 输出 HTML（不转义）
<%# 注释 %>
```

## 内置模板

### Vue 3 项目模板

**位置：** `src/templates/vue3-project/`

**主要文件：**
```
vue3-project/
├── src/
│   ├── App.vue.ejs
│   ├── main.ts.ejs
│   └── components/
│       └── HelloWorld.vue.ejs
├── package.json.ejs
├── vite.config.ts.ejs
├── tsconfig.json.ejs
└── README.md.ejs
```

**package.json 模板示例：**
```ejs
{
  "name": "<%= projectName %>",
  "version": "<%= version %>",
  "description": "<%= description %>",
  "author": "<%= author %>",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    <% if (features.includes('vitest')) { %>
    "test": "vitest",
    <% } %>
    <% if (features.includes('eslint')) { %>
    "lint": "eslint src --ext .ts,.vue",
    <% } %>
  },
  "dependencies": {
    "vue": "^3.4.0"
  },
  "devDependencies": {
    <% if (features.includes('typescript')) { %>
    "typescript": "^5.0.0",
    <% } %>
    <% if (features.includes('eslint')) { %>
    "eslint": "^8.0.0",
    <% } %>
    "vite": "^5.0.0"
  }
}
```

### React 项目模板

**位置：** `src/templates/react-project/`

**特点：**
- React 18 + TypeScript
- 现代 Hooks 开发模式
- Vite 构建配置

### Node.js API 模板

**位置：** `src/templates/nodejs-api/`

**特点：**
- Express.js 框架
- TypeScript 支持
- RESTful API 结构

## 模板变量

### 内置变量

模板中可以使用以下内置变量：

| 变量名 | 类型 | 描述 | 示例 |
|--------|------|------|------|
| `projectName` | string | 项目名称 | `my-vue-app` |
| `description` | string | 项目描述 | `My Vue 3 application` |
| `author` | string | 作者信息 | `John Doe` |
| `version` | string | 版本号 | `1.0.0` |
| `license` | string | 许可证 | `MIT` |
| `type` | string | 项目类型 | `vue3-project` |
| `buildTool` | string | 构建工具 | `vite` |
| `packageManager` | string | 包管理器 | `pnpm` |
| `features` | array | 特性列表 | `['typescript', 'eslint']` |

### 使用变量

**输出变量：**
```ejs
<h1>Welcome to <%= projectName %></h1>
<p>Author: <%= author %></p>
```

**条件渲染：**
```ejs
<% if (features.includes('typescript')) { %>
import type { Component } from 'vue'
<% } else { %>
// JavaScript version
<% } %>
```

**循环渲染：**
```ejs
<% features.forEach(feature => { %>
- <%= feature %>
<% }) %>
```

## 自定义模板

### 创建自定义模板

1. **创建模板目录**
```bash
mkdir my-custom-template
cd my-custom-template
```

2. **创建模板配置**
```javascript
// template.config.js
export default {
  name: 'my-custom-template',
  description: '我的自定义模板',
  type: 'custom',
  files: [
    'src/**/*',
    'public/**/*',
    'package.json.ejs',
    'README.md.ejs'
  ],
  variables: {
    projectName: {
      type: 'string',
      required: true,
      description: '项目名称'
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
    }
  },
  prompts: [
    {
      type: 'input',
      name: 'projectName',
      message: '请输入项目名称：'
    },
    {
      type: 'confirm',
      name: 'useTypeScript',
      message: '是否使用 TypeScript？'
    }
  ]
}
```

3. **创建模板文件**

**package.json.ejs：**
```ejs
{
  "name": "<%= projectName %>",
  "version": "1.0.0",
  "description": "<%= description %>",
  "main": "index.js",
  "scripts": {
    <% if (useTypeScript) { %>
    "build": "tsc",
    "dev": "ts-node src/index.ts"
    <% } else { %>
    "start": "node src/index.js"
    <% } %>
  },
  "dependencies": {
    <% if (useTypeScript) { %>
    "typescript": "^5.0.0",
    "ts-node": "^10.0.0"
    <% } %>
  }
}
```

**src/index.ts.ejs：**
```ejs
<% if (useTypeScript) { %>
interface Config {
  name: string;
  version: string;
}

const config: Config = {
  name: '<%= projectName %>',
  version: '1.0.0'
};
<% } else { %>
const config = {
  name: '<%= projectName %>',
  version: '1.0.0'
};
<% } %>

console.log(`Welcome to ${config.name}!`);
```

### 使用自定义模板

```bash
# 本地模板
ldesign-scaffold create my-project --template ./my-custom-template

# Git 仓库模板
ldesign-scaffold create my-project --template https://github.com/user/template.git

# npm 包模板
ldesign-scaffold create my-project --template my-template-package
```

## 模板开发

### 目录结构

推荐的模板目录结构：

```
my-template/
├── template.config.js     # 模板配置
├── template/              # 模板文件
│   ├── src/
│   │   ├── index.ts.ejs
│   │   └── utils/
│   ├── public/
│   ├── package.json.ejs
│   ├── README.md.ejs
│   └── .gitignore
├── hooks/                 # 生命周期钩子
│   ├── pre-generate.js
│   └── post-generate.js
└── README.md              # 模板说明
```

### 生命周期钩子

**pre-generate.js：**
```javascript
export default function preGenerate(context) {
  const { variables, targetDir } = context;
  
  // 生成前的处理逻辑
  if (variables.useDatabase) {
    variables.dependencies = {
      ...variables.dependencies,
      'mongoose': '^7.0.0'
    };
  }
  
  return context;
}
```

**post-generate.js：**
```javascript
import { execSync } from 'child_process';

export default function postGenerate(context) {
  const { targetDir, packageManager } = context;
  
  // 生成后的处理逻辑
  console.log('Installing dependencies...');
  execSync(`${packageManager} install`, { cwd: targetDir });
  
  console.log('Initializing git repository...');
  execSync('git init', { cwd: targetDir });
}
```

### 模板测试

创建测试脚本验证模板：

```javascript
// test-template.js
import { TemplateManager } from 'ldesign-scaffold';

const templateManager = new TemplateManager();

async function testTemplate() {
  const result = await templateManager.generateProject({
    template: './my-custom-template',
    targetDir: './test-output',
    variables: {
      projectName: 'test-project',
      author: 'Test Author',
      useTypeScript: true
    }
  });
  
  if (result.success) {
    console.log('Template test passed!');
  } else {
    console.error('Template test failed:', result.error);
  }
}

testTemplate();
```

## 模板最佳实践

### 1. 文件命名

- 使用 `.ejs` 后缀标识模板文件
- 保持原始文件扩展名：`component.vue.ejs`
- 避免特殊字符和空格

### 2. 变量命名

- 使用驼峰命名法：`projectName`
- 布尔变量使用 `is/has/use` 前缀：`useTypeScript`
- 数组变量使用复数形式：`features`

### 3. 条件逻辑

```ejs
<% if (condition) { %>
  // 内容
<% } %>

<% if (condition) { %>
  // 条件为真
<% } else { %>
  // 条件为假
<% } %>
```

### 4. 循环处理

```ejs
<% items.forEach((item, index) => { %>
  <%= index + 1 %>. <%= item %>
<% }) %>
```

### 5. 包含文件

```ejs
<%- include('partials/header', { title: projectName }) %>
```

## 模板分享

### 发布到 npm

1. **准备 package.json**
```json
{
  "name": "my-scaffold-template",
  "version": "1.0.0",
  "description": "My custom scaffold template",
  "main": "template.config.js",
  "keywords": ["scaffold", "template", "vue"],
  "files": ["template/", "template.config.js"]
}
```

2. **发布包**
```bash
npm publish
```

### 创建 Git 仓库

```bash
git init
git add .
git commit -m "Initial template"
git remote add origin https://github.com/user/my-template.git
git push -u origin main
```

## 故障排除

### 常见问题

1. **模板语法错误**
   - 检查 EJS 语法
   - 验证变量名拼写
   - 确保括号匹配

2. **变量未定义**
   - 检查变量是否在配置中声明
   - 验证变量传递是否正确

3. **文件生成失败**
   - 检查文件路径
   - 验证目录权限
   - 确保模板文件存在

### 调试技巧

1. **启用调试模式**
```bash
ldesign-scaffold create my-project --template ./my-template --debug
```

2. **检查生成的文件**
```bash
ldesign-scaffold create my-project --template ./my-template --dry-run
```

## 下一步

- [可视化界面](/guide/ui-interface) - 使用图形界面创建项目
- [自定义模板](/guide/custom-templates) - 深入了解模板定制
- [API 参考](/api/core) - 了解模板 API
