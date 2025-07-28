import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs-extra';

import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { validateRequest } from './middleware/validation';

import projectRoutes from './routes/project';
import systemRoutes from './routes/system';
import templateRoutes from './routes/template';
import gitRoutes from './routes/git';
import buildRoutes from './routes/build';
import deployRoutes from './routes/deploy';

import { WebSocketService } from './services/websocket';
import { ProjectService } from './services/project';
import { logger } from './utils/logger';
import { config } from './config';

// 加载环境变量
dotenv.config();

class Server {
  private app: express.Application;
  private server: any;
  private wss: WebSocketServer;
  private wsService: WebSocketService;
  private projectService: ProjectService;

  constructor() {
    this.app = express();
    this.projectService = new ProjectService();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // 安全中间件
    this.app.use(helmet({
      contentSecurityPolicy: false, // 开发环境下禁用CSP
    }));

    // CORS配置
    this.app.use(cors({
      origin: config.cors.origin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    }));

    // 压缩响应
    this.app.use(compression());

    // 请求日志
    this.app.use(morgan('combined', {
      stream: {
        write: (message: string) => logger.info(message.trim()),
      },
    }));

    // 解析请求体
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));

    // 静态文件服务
    this.app.use('/static', express.static(path.join(__dirname, '../public')));

    // 自定义中间件
    this.app.use(requestLogger);
  }

  private setupRoutes(): void {
    // API路由
    this.app.use('/api/projects', projectRoutes);
    this.app.use('/api/system', systemRoutes);
    this.app.use('/api/templates', templateRoutes);
    this.app.use('/api/git', gitRoutes);
    this.app.use('/api/build', buildRoutes);
    this.app.use('/api/deploy', deployRoutes);

    // 健康检查
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0',
      });
    });

    // API文档
    this.app.get('/api', (req, res) => {
      res.json({
        name: 'LDesign Scaffold API',
        version: '1.0.0',
        description: 'Backend API for LDesign Scaffold',
        endpoints: {
          projects: '/api/projects',
          system: '/api/system',
          templates: '/api/templates',
          git: '/api/git',
          build: '/api/build',
          deploy: '/api/deploy',
        },
      });
    });

    // 404处理
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString(),
      });
    });
  }

  private setupErrorHandling(): void {
    this.app.use(errorHandler);
  }

  private setupWebSocket(): void {
    this.wss = new WebSocketServer({ server: this.server });
    this.wsService = new WebSocketService(this.wss);

    this.wss.on('connection', (ws, req) => {
      logger.info(`WebSocket client connected from ${req.socket.remoteAddress}`);
      this.wsService.handleConnection(ws, req);
    });

    logger.info('WebSocket server initialized');
  }

  private async ensureDirectories(): Promise<void> {
    const directories = [
      config.paths.projects,
      config.paths.templates,
      config.paths.logs,
      config.paths.temp,
    ];

    for (const dir of directories) {
      await fs.ensureDir(dir);
      logger.info(`Ensured directory: ${dir}`);
    }
  }

  public async start(): Promise<void> {
    try {
      // 确保必要的目录存在
      await this.ensureDirectories();

      // 初始化项目服务
      await this.projectService.initialize();

      // 创建HTTP服务器
      this.server = createServer(this.app);

      // 设置WebSocket
      this.setupWebSocket();

      // 启动服务器
      this.server.listen(config.server.port, config.server.host, () => {
        logger.info(`Server running on http://${config.server.host}:${config.server.port}`);
        logger.info(`Environment: ${config.env}`);
        logger.info(`Process ID: ${process.pid}`);
      });

      // 优雅关闭处理
      this.setupGracefulShutdown();

    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);

      // 关闭HTTP服务器
      if (this.server) {
        this.server.close(() => {
          logger.info('HTTP server closed');
        });
      }

      // 关闭WebSocket服务器
      if (this.wss) {
        this.wss.close(() => {
          logger.info('WebSocket server closed');
        });
      }

      // 清理项目服务
      if (this.projectService) {
        await this.projectService.cleanup();
      }

      logger.info('Server shutdown complete');
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // 处理未捕获的异常
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
  }

  public getApp(): express.Application {
    return this.app;
  }

  public getWebSocketService(): WebSocketService {
    return this.wsService;
  }

  public getProjectService(): ProjectService {
    return this.projectService;
  }
}

// 启动服务器
if (require.main === module) {
  const server = new Server();
  server.start().catch((error) => {
    logger.error('Failed to start server:', error);
    process.exit(1);
  });
}

export default Server;
export { Server };