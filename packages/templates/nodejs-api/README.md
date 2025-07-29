# {{projectName}}

{{description}}

## 🚀 快速开始

### 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 开发

```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动

### 构建

```bash
npm run build
```

### 生产环境运行

```bash
npm start
```

## 📖 API 文档

### 基础路由

- `GET /` - 欢迎页面
- `GET /health` - 健康检查

### 用户 API

- `GET /api/users` - 获取用户列表
- `POST /api/users` - 创建新用户

#### 创建用户示例

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'
```

## 🛠️ 开发

### 项目结构

```
src/
├── index.ts          # 应用入口
└── ...               # 其他源文件
```

### 环境变量

创建 `.env` 文件：

```env
PORT=3000
NODE_ENV=development
```

### 测试

```bash
npm test
```

## 📄 许可证

MIT License
