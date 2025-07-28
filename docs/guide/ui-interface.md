# 可视化界面

LDesign Scaffold 提供了直观的 Web 界面，让你可以通过图形化方式配置和创建项目。

## 启动界面

### 基本启动

```bash
ldesign-scaffold ui
```

默认会在 `http://localhost:3000` 启动 Web 界面。

### 自定义端口

```bash
ldesign-scaffold ui --port 8080
```

### 自定义主机

```bash
ldesign-scaffold ui --host 0.0.0.0 --port 3000
```

这样可以让局域网内的其他设备访问界面。

## 界面功能

### 1. 项目创建向导

**步骤流程：**
1. **项目基本信息** - 名称、描述、作者等
2. **项目类型选择** - Vue3、React、Node.js 等
3. **构建工具配置** - Vite、Rollup、Webpack
4. **特性选择** - TypeScript、ESLint、测试框架等
5. **预览配置** - 查看生成的项目结构
6. **创建项目** - 执行项目生成

### 2. 实时预览

**功能特点：**
- 实时显示项目结构
- 预览生成的文件内容
- 依赖关系可视化
- 配置文件预览

### 3. 模板管理

**支持功能：**
- 浏览可用模板
- 模板详情查看
- 自定义模板上传
- 模板版本管理

### 4. 项目管理

**管理功能：**
- 查看已创建的项目
- 项目信息编辑
- 快速启动项目
- 项目删除和备份

## 界面组件

### 项目配置面板

**基本信息配置：**
```typescript
interface ProjectInfo {
  name: string;           // 项目名称
  description: string;    // 项目描述
  author: string;         // 作者信息
  version: string;        // 版本号
  license: string;        // 许可证
  repository: string;     // 仓库地址
}
```

**项目类型选择：**
- Vue 3 项目
- Vue 3 组件库
- Vue 2 项目
- React 项目
- Node.js API
- 自定义模板

### 特性选择器

**开发工具：**
- ☑️ TypeScript - 类型安全
- ☑️ ESLint - 代码检查
- ☑️ Prettier - 代码格式化
- ☑️ Husky - Git 钩子

**测试框架：**
- ☑️ Vitest - 单元测试
- ☑️ Cypress - E2E 测试
- ☑️ Playwright - 现代 E2E 测试

**样式方案：**
- ☑️ Tailwind CSS - 原子化 CSS
- ☑️ Sass - CSS 预处理器
- ☑️ Less - CSS 预处理器

**文档工具：**
- ☑️ VitePress - 文档站点
- ☑️ Storybook - 组件展示

### 构建配置

**构建工具选择：**
```typescript
type BuildTool = 'vite' | 'rollup' | 'webpack' | 'tsup';
```

**包管理器选择：**
```typescript
type PackageManager = 'npm' | 'yarn' | 'pnpm';
```

**环境配置：**
- 开发环境配置
- 生产环境优化
- 测试环境设置

## 高级功能

### 1. 配置导入导出

**导出配置：**
```json
{
  "name": "my-vue-app",
  "type": "vue3-project",
  "buildTool": "vite",
  "packageManager": "pnpm",
  "features": [
    "typescript",
    "eslint",
    "vitest",
    "tailwindcss"
  ],
  "author": "John Doe",
  "description": "My Vue 3 application",
  "version": "1.0.0",
  "license": "MIT"
}
```

**导入配置：**
- 从 JSON 文件导入
- 从已有项目导入
- 从模板导入

### 2. 批量项目创建

**功能特点：**
- 支持批量创建多个项目
- 使用配置模板
- 自动命名规则
- 并行创建优化

**配置示例：**
```json
{
  "batch": true,
  "projects": [
    {
      "name": "frontend-app",
      "type": "vue3-project",
      "features": ["typescript", "router"]
    },
    {
      "name": "backend-api",
      "type": "nodejs-api",
      "features": ["typescript", "docker"]
    }
  ]
}
```

### 3. 项目模板定制

**在线编辑器：**
- 模板文件编辑
- 实时语法检查
- 预览生成结果
- 版本控制

**模板变量管理：**
- 变量定义
- 默认值设置
- 验证规则
- 帮助文档

## 界面定制

### 主题配置

**内置主题：**
- Light - 浅色主题
- Dark - 深色主题
- Auto - 跟随系统

**自定义主题：**
```css
:root {
  --primary-color: #3498db;
  --secondary-color: #2ecc71;
  --background-color: #ffffff;
  --text-color: #333333;
  --border-color: #e1e8ed;
}
```

### 语言设置

**支持语言：**
- 中文 (zh-CN)
- English (en-US)
- 日本語 (ja-JP)

**语言切换：**
```javascript
// 设置界面语言
ui.setLanguage('zh-CN');
```

## API 集成

### RESTful API

**项目管理：**
```typescript
// 获取项目列表
GET /api/projects

// 创建项目
POST /api/projects
{
  "name": "my-project",
  "type": "vue3-project",
  "config": { ... }
}

// 获取项目详情
GET /api/projects/:id

// 更新项目
PUT /api/projects/:id

// 删除项目
DELETE /api/projects/:id
```

**模板管理：**
```typescript
// 获取模板列表
GET /api/templates

// 上传模板
POST /api/templates

// 下载模板
GET /api/templates/:id/download
```

### WebSocket 实时通信

**实时功能：**
- 项目创建进度
- 构建状态更新
- 错误信息推送
- 多用户协作

**连接示例：**
```javascript
const ws = new WebSocket('ws://localhost:3000/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'progress':
      updateProgress(data.progress);
      break;
    case 'error':
      showError(data.message);
      break;
    case 'complete':
      showSuccess('项目创建完成！');
      break;
  }
};
```

## 部署配置

### 本地部署

**开发模式：**
```bash
# 启动开发服务器
ldesign-scaffold ui --dev

# 启用热重载
ldesign-scaffold ui --dev --hot
```

**生产模式：**
```bash
# 构建生产版本
ldesign-scaffold build-ui

# 启动生产服务器
ldesign-scaffold ui --prod
```

### Docker 部署

**Dockerfile：**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build-ui
EXPOSE 3000
CMD ["npm", "run", "ui", "--", "--prod"]
```

**docker-compose.yml：**
```yaml
version: '3.8'
services:
  ldesign-ui:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./projects:/app/projects
```

### 云端部署

**Vercel 部署：**
```json
{
  "name": "ldesign-scaffold-ui",
  "version": 2,
  "builds": [
    {
      "src": "ui/package.json",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/ui/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/ui/$1"
    }
  ]
}
```

## 安全配置

### 访问控制

**基本认证：**
```bash
ldesign-scaffold ui --auth --username admin --password secret
```

**JWT 认证：**
```javascript
// 配置 JWT
ui.configure({
  auth: {
    type: 'jwt',
    secret: 'your-secret-key',
    expiresIn: '24h'
  }
});
```

### HTTPS 配置

```bash
ldesign-scaffold ui --https --cert ./cert.pem --key ./key.pem
```

## 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 查找占用端口的进程
   netstat -ano | findstr :3000
   
   # 使用其他端口
   ldesign-scaffold ui --port 3001
   ```

2. **界面无法访问**
   - 检查防火墙设置
   - 验证网络连接
   - 确认服务启动状态

3. **创建项目失败**
   - 检查磁盘空间
   - 验证权限设置
   - 查看错误日志

### 调试模式

```bash
# 启用调试模式
ldesign-scaffold ui --debug

# 查看详细日志
ldesign-scaffold ui --verbose
```

## 下一步

- [Git 管理](/guide/git-management) - 了解 Git 集成功能
- [Docker 支持](/guide/docker-support) - 学习容器化部署
- [API 参考](/api/) - 查看完整的 API 文档
