# Node.js API 示例项目

这是一个使用 LDesign Scaffold 创建的 Node.js API 示例项目，展示了现代 Node.js 后端开发的最佳实践。

## 项目特性

- **Node.js 18+** - 最新的 Node.js LTS 版本
- **TypeScript** - 类型安全的开发体验
- **Express.js** - 快速、极简的 Web 框架
- **Prisma** - 现代数据库 ORM
- **JWT 认证** - 安全的用户认证
- **API 文档** - Swagger/OpenAPI 自动生成
- **Docker 支持** - 容器化部署

## 快速开始

```bash
# 进入项目目录
cd examples/nodejs-example

# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev
```

访问 http://localhost:3000 查看 API 文档。

## 项目结构

```
nodejs-example/
├── src/
│   ├── controllers/          # 控制器
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   └── post.controller.ts
│   ├── middleware/           # 中间件
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   ├── models/              # 数据模型
│   │   ├── User.ts
│   │   └── Post.ts
│   ├── routes/              # 路由定义
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   └── post.routes.ts
│   ├── services/            # 业务逻辑
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   └── post.service.ts
│   ├── utils/               # 工具函数
│   │   ├── jwt.ts
│   │   ├── password.ts
│   │   └── validation.ts
│   ├── types/               # 类型定义
│   │   └── index.ts
│   ├── config/              # 配置文件
│   │   ├── database.ts
│   │   └── swagger.ts
│   ├── app.ts               # Express 应用
│   └── server.ts            # 服务器入口
├── prisma/                  # Prisma 配置
│   ├── schema.prisma
│   └── migrations/
├── tests/                   # 测试文件
├── docker/                  # Docker 配置
├── docs/                    # API 文档
└── package.json
```

## 核心代码解析

### 服务器入口 (server.ts)

```typescript
import app from './app'
import { config } from './config/database'

const PORT = process.env.PORT || 3000

async function startServer() {
  try {
    // 连接数据库
    await config.connect()
    console.log('✅ 数据库连接成功')
    
    // 启动服务器
    app.listen(PORT, () => {
      console.log(`🚀 服务器运行在 http://localhost:${PORT}`)
      console.log(`📚 API 文档: http://localhost:${PORT}/api-docs`)
    })
  } catch (error) {
    console.error('❌ 服务器启动失败:', error)
    process.exit(1)
  }
}

// 优雅关闭
process.on('SIGTERM', async () => {
  console.log('收到 SIGTERM 信号，正在关闭服务器...')
  await config.disconnect()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('收到 SIGINT 信号，正在关闭服务器...')
  await config.disconnect()
  process.exit(0)
})

startServer()
```

### Express 应用 (app.ts)

```typescript
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './config/swagger'
import { errorHandler } from './middleware/error.middleware'
import authRoutes from './routes/auth.routes'
import userRoutes from './routes/user.routes'
import postRoutes from './routes/post.routes'

const app = express()

// 安全中间件
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}))

// 日志中间件
app.use(morgan('combined'))

// 解析中间件
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// API 文档
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// API 路由
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  })
})

// 错误处理中间件
app.use(errorHandler)

export default app
```

## 认证系统

### JWT 工具 (utils/jwt.ts)

```typescript
import jwt from 'jsonwebtoken'
import { config } from '../config/database'

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export class JWTService {
  private static readonly SECRET = process.env.JWT_SECRET || 'your-secret-key'
  private static readonly EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

  static generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.SECRET, {
      expiresIn: this.EXPIRES_IN,
      issuer: 'ldesign-api',
      audience: 'ldesign-client'
    })
  }

  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.SECRET) as JWTPayload
    } catch (error) {
      throw new Error('无效的令牌')
    }
  }

  static generateRefreshToken(payload: JWTPayload): string {
    return jwt.sign(payload, this.SECRET, {
      expiresIn: '30d',
      issuer: 'ldesign-api',
      audience: 'ldesign-client'
    })
  }
}
```

### 认证中间件 (middleware/auth.middleware.ts)

```typescript
import { Request, Response, NextFunction } from 'express'
import { JWTService } from '../utils/jwt'
import { UserService } from '../services/user.service'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    role: string
  }
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '缺少认证令牌'
      })
    }

    const token = authHeader.substring(7)
    const payload = JWTService.verifyToken(token)
    
    // 验证用户是否存在
    const user = await UserService.findById(payload.userId)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      })
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    }

    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: '认证失败'
    })
  }
}

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '未认证'
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: '权限不足'
      })
    }

    next()
  }
}
```

## 数据模型

### 用户模型 (models/User.ts)

```typescript
export interface User {
  id: string
  email: string
  username: string
  password: string
  role: UserRole
  avatar?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator'
}

export interface CreateUserData {
  email: string
  username: string
  password: string
  role?: UserRole
}

export interface UpdateUserData {
  username?: string
  avatar?: string
  isActive?: boolean
}

export interface UserResponse {
  id: string
  email: string
  username: string
  role: UserRole
  avatar?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### 文章模型 (models/Post.ts)

```typescript
export interface Post {
  id: string
  title: string
  content: string
  excerpt?: string
  slug: string
  status: PostStatus
  authorId: string
  author?: User
  tags: string[]
  viewCount: number
  likeCount: number
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export interface CreatePostData {
  title: string
  content: string
  excerpt?: string
  status?: PostStatus
  tags?: string[]
}

export interface UpdatePostData {
  title?: string
  content?: string
  excerpt?: string
  status?: PostStatus
  tags?: string[]
}
```

## 业务服务

### 用户服务 (services/user.service.ts)

```typescript
import bcrypt from 'bcrypt'
import { prisma } from '../config/database'
import { User, CreateUserData, UpdateUserData, UserResponse } from '../models/User'

export class UserService {
  static async create(data: CreateUserData): Promise<UserResponse> {
    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      throw new Error('邮箱已被使用')
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(data.password, 12)

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword
      }
    })

    return this.toResponse(user)
  }

  static async findById(id: string): Promise<UserResponse | null> {
    const user = await prisma.user.findUnique({
      where: { id }
    })

    return user ? this.toResponse(user) : null
  }

  static async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email }
    })
  }

  static async update(id: string, data: UpdateUserData): Promise<UserResponse> {
    const user = await prisma.user.update({
      where: { id },
      data
    })

    return this.toResponse(user)
  }

  static async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id }
    })
  }

  static async list(page = 1, limit = 10): Promise<{
    users: UserResponse[]
    total: number
    page: number
    limit: number
  }> {
    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count()
    ])

    return {
      users: users.map(this.toResponse),
      total,
      page,
      limit
    }
  }

  static async verifyPassword(user: User, password: string): Promise<boolean> {
    return await bcrypt.compare(password, user.password)
  }

  private static toResponse(user: User): UserResponse {
    const { password, ...userResponse } = user
    return userResponse as UserResponse
  }
}
```

## API 控制器

### 认证控制器 (controllers/auth.controller.ts)

```typescript
import { Request, Response } from 'express'
import { UserService } from '../services/user.service'
import { JWTService } from '../utils/jwt'
import { validateEmail, validatePassword } from '../utils/validation'

export class AuthController {
  /**
   * @swagger
   * /api/auth/register:
   *   post:
   *     summary: 用户注册
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - username
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *               username:
   *                 type: string
   *               password:
   *                 type: string
   *                 minLength: 6
   */
  static async register(req: Request, res: Response) {
    try {
      const { email, username, password } = req.body

      // 验证输入
      if (!validateEmail(email)) {
        return res.status(400).json({
          success: false,
          message: '邮箱格式不正确'
        })
      }

      if (!validatePassword(password)) {
        return res.status(400).json({
          success: false,
          message: '密码至少需要6位字符'
        })
      }

      // 创建用户
      const user = await UserService.create({
        email,
        username,
        password
      })

      // 生成令牌
      const token = JWTService.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role
      })

      res.status(201).json({
        success: true,
        message: '注册成功',
        data: {
          user,
          token
        }
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      })
    }
  }

  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     summary: 用户登录
   *     tags: [Auth]
   */
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body

      // 查找用户
      const user = await UserService.findByEmail(email)
      if (!user) {
        return res.status(401).json({
          success: false,
          message: '邮箱或密码错误'
        })
      }

      // 验证密码
      const isValidPassword = await UserService.verifyPassword(user, password)
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: '邮箱或密码错误'
        })
      }

      // 生成令牌
      const token = JWTService.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role
      })

      const { password: _, ...userResponse } = user

      res.json({
        success: true,
        message: '登录成功',
        data: {
          user: userResponse,
          token
        }
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: '服务器错误'
      })
    }
  }
}
```

## 数据库配置

### Prisma Schema (prisma/schema.prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  username  String
  password  String
  role      UserRole @default(USER)
  avatar    String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  posts Post[]

  @@map("users")
}

model Post {
  id          String     @id @default(cuid())
  title       String
  content     String
  excerpt     String?
  slug        String     @unique
  status      PostStatus @default(DRAFT)
  tags        String[]
  viewCount   Int        @default(0)
  likeCount   Int        @default(0)
  publishedAt DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  authorId String
  author   User   @relation(fields: [authorId], references: [id])

  @@map("posts")
}

enum UserRole {
  ADMIN
  USER
  MODERATOR
}

enum PostStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

## Docker 配置

### Dockerfile

```dockerfile
FROM node:18-alpine AS builder

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

# 生成 Prisma 客户端
RUN pnpm prisma generate

# 构建应用
RUN pnpm run build

# 生产阶段
FROM node:18-alpine AS runner

WORKDIR /app

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# 安装 pnpm
RUN npm install -g pnpm

# 复制 package 文件
COPY package*.json ./
COPY pnpm-lock.yaml ./

# 安装生产依赖
RUN pnpm install --frozen-lockfile --prod

# 复制构建产物
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

USER nodejs

EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]
```

## 可用命令

```bash
# 开发服务器
pnpm run dev

# 构建生产版本
pnpm run build

# 启动生产服务器
pnpm run start

# 数据库迁移
pnpm run db:migrate

# 生成 Prisma 客户端
pnpm run db:generate

# 重置数据库
pnpm run db:reset

# 运行测试
pnpm run test

# 代码检查
pnpm run lint

# 代码格式化
pnpm run format
```

## 最佳实践

1. **错误处理** - 统一的错误处理机制
2. **数据验证** - 输入数据验证和清理
3. **安全性** - JWT 认证、CORS、Helmet 等
4. **日志记录** - 结构化日志记录
5. **API 文档** - 自动生成的 Swagger 文档
6. **测试覆盖** - 单元测试和集成测试
7. **容器化** - Docker 部署支持

## 相关链接

- [Express.js 官方文档](https://expressjs.com/)
- [Prisma 官方文档](https://www.prisma.io/docs)
- [Node.js 官方文档](https://nodejs.org/docs/)
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
