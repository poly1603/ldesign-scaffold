# Docker 支持

LDesign Scaffold 提供完整的 Docker 容器化支持，帮助你轻松部署和运行项目。

## 自动 Docker 配置

### 启用 Docker 特性

创建项目时启用 Docker 支持：

```bash
ldesign-scaffold create my-project --features docker
```

这将自动生成：
- `Dockerfile` - 容器构建文件
- `docker-compose.yml` - 多容器编排
- `.dockerignore` - Docker 忽略文件
- `docker/` - Docker 相关配置

## Dockerfile 模板

### 前端项目 Dockerfile

**Vue/React 项目：**
```dockerfile
# 多阶段构建
FROM node:18-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./
COPY pnpm-lock.yaml ./

# 安装 pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN pnpm run build

# 生产阶段
FROM nginx:alpine

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY docker/nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
```

### 后端项目 Dockerfile

**Node.js API：**
```dockerfile
FROM node:18-alpine

# 创建应用目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./
COPY pnpm-lock.yaml ./

# 安装 pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install --frozen-lockfile --prod

# 复制源代码
COPY . .

# 构建应用
RUN pnpm run build

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# 更改文件所有者
USER nextjs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# 启动应用
CMD ["node", "dist/index.js"]
```

## Docker Compose 配置

### 基础配置

**docker-compose.yml：**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx.conf:/etc/nginx/nginx.conf
      - ./docker/ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### 开发环境配置

**docker-compose.dev.yml：**
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
      - "9229:9229"  # Node.js 调试端口
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
    command: pnpm run dev
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: myapp_dev
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev123
    ports:
      - "5432:5432"
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data

volumes:
  postgres_dev_data:
```

## 开发环境 Docker

### 开发 Dockerfile

**Dockerfile.dev：**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制 package 文件
COPY package*.json ./
COPY pnpm-lock.yaml ./

# 安装依赖（包括开发依赖）
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 暴露端口
EXPOSE 3000 9229

# 启动开发服务器
CMD ["pnpm", "run", "dev"]
```

### 热重载支持

**开发环境配置：**
```yaml
services:
  app:
    build:
      dockerfile: Dockerfile.dev
    volumes:
      - .:/app
      - /app/node_modules
      - /app/dist
    environment:
      - CHOKIDAR_USEPOLLING=true
    stdin_open: true
    tty: true
```

## 生产环境优化

### 多阶段构建

```dockerfile
# 构建阶段
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# 运行阶段
FROM node:18-alpine AS runner
WORKDIR /app

# 创建用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制文件
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist

USER nextjs

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### 镜像优化

**最佳实践：**
```dockerfile
# 使用 Alpine 镜像减小体积
FROM node:18-alpine

# 合并 RUN 指令减少层数
RUN apk add --no-cache \
    curl \
    && npm install -g pnpm \
    && rm -rf /var/cache/apk/*

# 使用 .dockerignore 排除不必要文件
# 利用构建缓存优化构建速度
COPY package*.json ./
RUN pnpm install --frozen-lockfile

# 最后复制源代码
COPY . .
```

## 容器编排

### Kubernetes 配置

**deployment.yaml：**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: myapp:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: myapp-service
spec:
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

### Docker Swarm

**docker-stack.yml：**
```yaml
version: '3.8'

services:
  app:
    image: myapp:latest
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
    ports:
      - "3000:3000"
    networks:
      - app-network

  db:
    image: postgres:15-alpine
    deploy:
      replicas: 1
      placement:
        constraints:
          - node.role == manager
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    secrets:
      - db_password
    volumes:
      - db_data:/var/lib/postgresql/data
    networks:
      - app-network

networks:
  app-network:
    driver: overlay

volumes:
  db_data:

secrets:
  db_password:
    external: true
```

## 容器管理命令

### 基本操作

```bash
# 构建镜像
ldesign-scaffold docker build

# 启动服务
ldesign-scaffold docker up

# 后台启动
ldesign-scaffold docker up -d

# 停止服务
ldesign-scaffold docker down

# 查看日志
ldesign-scaffold docker logs

# 进入容器
ldesign-scaffold docker exec app sh
```

### 开发环境

```bash
# 启动开发环境
ldesign-scaffold docker dev

# 重建并启动
ldesign-scaffold docker dev --build

# 查看开发日志
ldesign-scaffold docker dev logs -f
```

## 环境变量管理

### .env 文件

**生产环境 (.env.prod)：**
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@db:5432/myapp
REDIS_URL=redis://redis:6379
JWT_SECRET=your-secret-key
API_BASE_URL=https://api.example.com
```

**开发环境 (.env.dev)：**
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://dev:dev123@localhost:5432/myapp_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-secret-key
API_BASE_URL=http://localhost:3001
```

### Docker Secrets

```bash
# 创建密钥
echo "my-secret-password" | docker secret create db_password -

# 在 compose 文件中使用
services:
  app:
    secrets:
      - db_password
    environment:
      - DB_PASSWORD_FILE=/run/secrets/db_password

secrets:
  db_password:
    external: true
```

## 监控和日志

### 健康检查

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

**健康检查端点：**
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### 日志管理

**docker-compose.yml：**
```yaml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

**集中日志收集：**
```yaml
services:
  app:
    logging:
      driver: "fluentd"
      options:
        fluentd-address: localhost:24224
        tag: myapp
```

## 部署策略

### 蓝绿部署

```bash
# 部署新版本
docker-compose -f docker-compose.blue.yml up -d

# 切换流量
docker-compose -f docker-compose.yml up -d nginx

# 停止旧版本
docker-compose -f docker-compose.green.yml down
```

### 滚动更新

```bash
# 更新服务
docker service update --image myapp:v2 myapp_app

# 回滚服务
docker service rollback myapp_app
```

## 故障排除

### 常见问题

1. **容器启动失败**
   ```bash
   # 查看容器日志
   docker logs container_name
   
   # 检查容器状态
   docker ps -a
   ```

2. **网络连接问题**
   ```bash
   # 检查网络
   docker network ls
   
   # 测试连接
   docker exec app ping db
   ```

3. **存储卷问题**
   ```bash
   # 查看存储卷
   docker volume ls
   
   # 清理未使用的卷
   docker volume prune
   ```

### 调试技巧

```bash
# 进入运行中的容器
docker exec -it container_name sh

# 以调试模式启动
docker run --rm -it --entrypoint sh image_name

# 查看镜像层
docker history image_name
```

## 下一步

- [自定义模板](/guide/custom-templates) - 学习模板定制
- [环境检测](/guide/environment-check) - 检查开发环境
- [Nginx 配置](/guide/nginx-config) - Web 服务器配置
