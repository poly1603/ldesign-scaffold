# 特性配置

LDesign Scaffold 提供了丰富的特性选项，你可以根据项目需求选择合适的特性组合。

## 特性概览

| 分类 | 特性 | 描述 | 推荐度 |
|------|------|------|--------|
| 开发工具 | TypeScript | 类型安全的 JavaScript | ⭐⭐⭐⭐⭐ |
| 代码规范 | ESLint | 代码质量检查 | ⭐⭐⭐⭐⭐ |
| 代码规范 | Prettier | 代码格式化 | ⭐⭐⭐⭐ |
| Git 工具 | Husky | Git 钩子管理 | ⭐⭐⭐⭐ |
| Git 工具 | Commitlint | 提交信息规范 | ⭐⭐⭐ |
| 测试框架 | Vitest | 单元测试 | ⭐⭐⭐⭐ |
| 测试框架 | Cypress | E2E 测试 | ⭐⭐⭐ |
| 样式方案 | Tailwind CSS | 原子化 CSS | ⭐⭐⭐⭐ |
| 样式方案 | Sass | CSS 预处理器 | ⭐⭐⭐ |
| 文档工具 | VitePress | 文档站点 | ⭐⭐⭐⭐ |
| 文档工具 | Storybook | 组件展示 | ⭐⭐⭐ |
| 部署工具 | Docker | 容器化 | ⭐⭐⭐⭐ |
| 部署工具 | Nginx | Web 服务器 | ⭐⭐⭐ |

## 开发工具

### TypeScript

**描述：** 为 JavaScript 添加静态类型检查

**优势：**
- 编译时错误检查
- 更好的 IDE 支持
- 代码重构安全
- 团队协作友好

**配置文件：**
- `tsconfig.json` - TypeScript 配置
- `tsconfig.node.json` - Node.js 环境配置

**示例配置：**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

**使用场景：**
- ✅ 大型项目
- ✅ 团队开发
- ✅ 长期维护的项目
- ❌ 快速原型

## 代码规范

### ESLint

**描述：** JavaScript 和 TypeScript 代码检查工具

**功能：**
- 语法错误检查
- 代码风格统一
- 潜在问题发现
- 自动修复

**配置文件：**
- `eslint.config.js` - ESLint 配置

**预设规则：**
- Vue 项目：`@vue/eslint-config-typescript`
- React 项目：`@typescript-eslint/recommended`
- Node.js 项目：`@typescript-eslint/recommended`

**自定义规则：**
```javascript
export default [
  {
    rules: {
      'no-console': 'warn',
      'no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn'
    }
  }
]
```

### Prettier

**描述：** 代码格式化工具

**功能：**
- 自动代码格式化
- 统一代码风格
- 与 ESLint 集成
- 编辑器集成

**配置文件：**
- `.prettierrc` - Prettier 配置
- `.prettierignore` - 忽略文件

**推荐配置：**
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

## Git 工具

### Husky

**描述：** Git 钩子管理工具

**功能：**
- 提交前代码检查
- 推送前测试运行
- 提交信息验证
- 自动化工作流

**钩子配置：**
```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run lint
npm run test
```

**常用钩子：**
- `pre-commit` - 提交前执行
- `commit-msg` - 提交信息验证
- `pre-push` - 推送前执行

### Commitlint

**描述：** 提交信息规范检查

**规范格式：**
```
type(scope): description

[optional body]

[optional footer]
```

**提交类型：**
- `feat` - 新功能
- `fix` - 修复 bug
- `docs` - 文档更新
- `style` - 代码格式
- `refactor` - 重构
- `test` - 测试相关
- `chore` - 构建过程或辅助工具的变动

**示例：**
```bash
feat(auth): add user login functionality
fix(api): resolve data fetching issue
docs(readme): update installation guide
```

## 测试框架

### Vitest

**描述：** 基于 Vite 的测试框架

**特点：**
- 与 Vite 深度集成
- 快速执行
- TypeScript 支持
- 热重载测试

**配置文件：**
- `vitest.config.ts` - Vitest 配置

**测试示例：**
```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HelloWorld from '../HelloWorld.vue'

describe('HelloWorld', () => {
  it('renders properly', () => {
    const wrapper = mount(HelloWorld, { props: { msg: 'Hello Vitest' } })
    expect(wrapper.text()).toContain('Hello Vitest')
  })
})
```

### Cypress

**描述：** 端到端测试框架

**特点：**
- 真实浏览器测试
- 可视化测试界面
- 时间旅行调试
- 自动等待

**测试示例：**
```javascript
describe('App E2E', () => {
  it('should display welcome message', () => {
    cy.visit('/')
    cy.contains('h1', 'Welcome')
    cy.get('[data-testid="counter"]').click()
    cy.get('[data-testid="count"]').should('contain', '1')
  })
})
```

## 样式方案

### Tailwind CSS

**描述：** 原子化 CSS 框架

**优势：**
- 实用优先的设计
- 高度可定制
- 优化的生产构建
- 响应式设计

**配置文件：**
- `tailwind.config.js` - Tailwind 配置

**使用示例：**
```vue
<template>
  <div class="bg-blue-500 text-white p-4 rounded-lg shadow-md">
    <h1 class="text-2xl font-bold mb-2">标题</h1>
    <p class="text-sm opacity-90">描述文本</p>
  </div>
</template>
```

### Sass

**描述：** CSS 预处理器

**特点：**
- 变量和混入
- 嵌套规则
- 模块化
- 函数支持

**使用示例：**
```scss
$primary-color: #3498db;
$border-radius: 4px;

@mixin button-style {
  padding: 10px 20px;
  border-radius: $border-radius;
  border: none;
  cursor: pointer;
}

.btn-primary {
  @include button-style;
  background-color: $primary-color;
  color: white;
  
  &:hover {
    background-color: darken($primary-color, 10%);
  }
}
```

## 文档工具

### VitePress

**描述：** 基于 Vite 的静态站点生成器

**特点：**
- Markdown 驱动
- Vue 组件支持
- 快速热重载
- SEO 友好

**目录结构：**
```
docs/
├── .vitepress/
│   └── config.ts
├── guide/
│   ├── index.md
│   └── getting-started.md
└── index.md
```

### Storybook

**描述：** 组件开发和展示工具

**功能：**
- 组件隔离开发
- 交互式文档
- 视觉测试
- 设计系统

**故事示例：**
```javascript
export default {
  title: 'Example/Button',
  component: Button,
}

export const Primary = {
  args: {
    primary: true,
    label: 'Button',
  },
}
```

## 部署工具

### Docker

**描述：** 容器化平台

**优势：**
- 环境一致性
- 快速部署
- 资源隔离
- 可扩展性

**Dockerfile 示例：**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Nginx

**描述：** 高性能 Web 服务器

**功能：**
- 静态文件服务
- 反向代理
- 负载均衡
- SSL 终止

**配置示例：**
```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://backend:3000;
    }
}
```

## 特性组合推荐

### 小型项目
```bash
--features typescript,eslint,vitest
```

### 中型项目
```bash
--features typescript,eslint,prettier,husky,vitest,tailwindcss
```

### 大型项目
```bash
--features typescript,eslint,prettier,husky,commitlint,vitest,cypress,tailwindcss,vitepress,docker
```

### 组件库项目
```bash
--features typescript,eslint,prettier,vitest,storybook,vitepress
```

### 企业级项目
```bash
--features typescript,eslint,prettier,husky,commitlint,vitest,cypress,tailwindcss,vitepress,docker,nginx
```

## 配置自定义

### 修改配置文件

创建项目后，你可以修改各种配置文件来满足特定需求：

1. **TypeScript 配置** - `tsconfig.json`
2. **ESLint 配置** - `eslint.config.js`
3. **Vite 配置** - `vite.config.ts`
4. **测试配置** - `vitest.config.ts`

### 添加新特性

如果需要添加新的特性，可以：

1. 安装相关依赖
2. 添加配置文件
3. 更新构建脚本
4. 添加相关文档

## 下一步

- [模板系统](/guide/templates) - 了解模板机制
- [创建项目](/guide/creating-projects) - 学习如何创建项目
- [可视化界面](/guide/ui-interface) - 使用图形界面配置
