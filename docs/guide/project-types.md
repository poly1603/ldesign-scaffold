# 项目类型

LDesign Scaffold 支持多种项目类型，每种类型都针对特定的开发场景进行了优化。

## 概览

| 项目类型 | 适用场景 | 技术栈 | 构建工具 |
|---------|---------|--------|----------|
| Vue 3 项目 | 现代 Web 应用 | Vue 3 + TypeScript | Vite |
| Vue 3 组件库 | 可复用组件 | Vue 3 + Rollup | Rollup |
| Vue 2 项目 | 兼容性项目 | Vue 2.7 + TypeScript | Vite |
| React 项目 | React 应用 | React 18 + TypeScript | Vite |
| Node.js API | 后端服务 | Express + TypeScript | tsup |

## Vue 3 项目

### 适用场景
- 现代化的单页应用（SPA）
- 企业级 Web 应用
- 移动端 H5 应用
- 管理后台系统

### 技术特性
- **Vue 3** - 最新的 Vue.js 框架
- **Composition API** - 更好的逻辑复用
- **`<script setup>`** - 简化的组件语法
- **Vite** - 快速的开发和构建
- **TypeScript** - 类型安全（可选）

### 项目结构
```
vue3-project/
├── src/
│   ├── components/     # 组件目录
│   ├── views/         # 页面组件
│   ├── router/        # 路由配置
│   ├── stores/        # Pinia 状态管理
│   ├── assets/        # 静态资源
│   ├── utils/         # 工具函数
│   ├── App.vue        # 根组件
│   └── main.ts        # 应用入口
├── public/            # 公共资源
└── index.html         # HTML 模板
```

### 推荐特性
- `typescript` - 类型安全
- `router` - Vue Router 4
- `store` - Pinia 状态管理
- `eslint` - 代码检查
- `vitest` - 单元测试
- `tailwindcss` - 样式框架

### 创建命令
```bash
ldesign-scaffold create my-vue3-app \
  --type vue3-project \
  --features typescript,router,store,eslint,vitest
```

## Vue 3 组件库

### 适用场景
- 企业内部组件库
- 开源 UI 组件库
- 设计系统实现
- 可复用业务组件

### 技术特性
- **Vue 3** - 组件开发
- **Rollup** - 多格式构建
- **TypeScript** - 类型定义
- **Storybook** - 组件展示
- **VitePress** - 文档站点

### 构建输出
- **ES Module** - 现代模块格式
- **CommonJS** - Node.js 兼容
- **UMD** - 浏览器直接使用
- **类型定义** - TypeScript 支持

### 项目结构
```
vue3-component/
├── src/
│   ├── components/    # 组件源码
│   ├── utils/         # 工具函数
│   └── index.ts       # 导出入口
├── stories/           # Storybook 故事
├── docs/              # 文档源码
├── dist/              # 构建输出
└── types/             # 类型定义
```

### 推荐特性
- `typescript` - 类型定义
- `storybook` - 组件展示
- `vitepress` - 文档站点
- `vitest` - 组件测试
- `eslint` - 代码规范

### 创建命令
```bash
ldesign-scaffold create my-ui-lib \
  --type vue3-component \
  --features typescript,storybook,vitepress,vitest
```

## Vue 2 项目

### 适用场景
- 维护现有 Vue 2 项目
- 渐进式升级到 Vue 3
- 需要 Vue 2 兼容性的项目
- 团队技能过渡期

### 技术特性
- **Vue 2.7** - 最新的 Vue 2 版本
- **Composition API** - 向前兼容
- **TypeScript** - 类型支持
- **Vite** - 现代构建工具

### 升级路径
Vue 2 项目可以逐步升级到 Vue 3：
1. 使用 Composition API 重写组件
2. 更新依赖到 Vue 3 兼容版本
3. 迁移到 Vue 3 项目类型

### 创建命令
```bash
ldesign-scaffold create my-vue2-app \
  --type vue2-project \
  --features typescript,router,eslint
```

## React 项目

### 适用场景
- React 单页应用
- 企业级前端应用
- 移动端 React 应用
- 现代化 Web 应用

### 技术特性
- **React 18** - 最新的 React 版本
- **Hooks** - 现代组件开发
- **TypeScript** - 类型安全
- **Vite** - 快速开发体验

### 项目结构
```
react-project/
├── src/
│   ├── components/    # 组件目录
│   ├── pages/         # 页面组件
│   ├── hooks/         # 自定义 Hooks
│   ├── utils/         # 工具函数
│   ├── assets/        # 静态资源
│   ├── App.tsx        # 根组件
│   └── main.tsx       # 应用入口
├── public/            # 公共资源
└── index.html         # HTML 模板
```

### 推荐特性
- `typescript` - 类型安全
- `eslint` - 代码检查
- `vitest` - 单元测试
- `tailwindcss` - 样式框架
- `router` - React Router

### 创建命令
```bash
ldesign-scaffold create my-react-app \
  --type react-project \
  --features typescript,router,eslint,vitest,tailwindcss
```

## Node.js API

### 适用场景
- RESTful API 服务
- GraphQL 服务
- 微服务架构
- 后端业务逻辑

### 技术特性
- **Express.js** - Web 框架
- **TypeScript** - 类型安全
- **中间件支持** - 可扩展架构
- **数据库集成** - 多种数据库支持

### 项目结构
```
nodejs-api/
├── src/
│   ├── controllers/   # 控制器
│   ├── services/      # 业务逻辑
│   ├── models/        # 数据模型
│   ├── middleware/    # 中间件
│   ├── routes/        # 路由定义
│   ├── utils/         # 工具函数
│   └── app.ts         # 应用入口
├── tests/             # 测试文件
└── dist/              # 构建输出
```

### 推荐特性
- `typescript` - 类型安全
- `eslint` - 代码检查
- `vitest` - 单元测试
- `docker` - 容器化
- `database` - 数据库支持

### 创建命令
```bash
ldesign-scaffold create my-api \
  --type nodejs-api \
  --features typescript,eslint,vitest,docker
```

## 自定义项目类型

### 创建自定义模板

你可以创建自己的项目模板：

1. **创建模板目录**
```bash
mkdir my-custom-template
cd my-custom-template
```

2. **定义模板配置**
```javascript
// template.config.js
export default {
  name: 'my-custom-template',
  description: '我的自定义模板',
  type: 'custom',
  files: [
    'src/**/*',
    'public/**/*',
    'package.json.ejs'
  ],
  variables: {
    projectName: 'string',
    author: 'string',
    description: 'string'
  }
}
```

3. **使用自定义模板**
```bash
ldesign-scaffold create my-project --template ./my-custom-template
```

## 选择指南

### 前端项目选择

**选择 Vue 3 项目，如果：**
- 团队熟悉 Vue.js
- 需要渐进式开发
- 重视开发体验

**选择 React 项目，如果：**
- 团队熟悉 React
- 需要丰富的生态系统
- 重视性能优化

**选择 Vue 2 项目，如果：**
- 维护现有项目
- 需要向后兼容
- 计划渐进升级

### 组件库选择

**选择 Vue 3 组件库，如果：**
- 开发 Vue 组件
- 需要类型定义
- 要求多格式输出

### 后端项目选择

**选择 Node.js API，如果：**
- 开发 REST API
- 需要 TypeScript
- 要求快速开发

## 最佳实践

### 项目命名
- 使用小写字母和连字符
- 避免特殊字符
- 保持简洁明了

### 特性选择
- 根据团队技能选择
- 考虑项目复杂度
- 平衡功能和性能

### 构建工具
- 新项目推荐 Vite
- 组件库推荐 Rollup
- 复杂项目可选 Webpack

## 下一步

- [特性配置](/guide/features) - 了解各种特性选项
- [创建项目](/guide/creating-projects) - 学习如何创建项目
- [模板系统](/guide/templates) - 深入了解模板机制
