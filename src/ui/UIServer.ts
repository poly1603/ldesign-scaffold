import express from 'express'
import { Server } from 'socket.io'
import { createServer } from 'http'
import path from 'path'
import open from 'open'
import { ScaffoldGenerator } from '../core/ScaffoldGenerator.js'
import { GitManager } from '../commands/GitManager.js'
import { DockerManager } from '../commands/DockerManager.js'
import { NginxManager } from '../commands/NginxManager.js'
import { SubmoduleManager } from '../commands/SubmoduleManager.js'
import { WorkflowManager } from '../commands/WorkflowManager.js'
import { IconManager } from '../commands/IconManager.js'
import { FontManager } from '../commands/FontManager.js'
import { UIConfig, CommandResult } from '../types/index.js'
import { logger, getAvailablePort, detectDevEnvironment } from '../utils/index.js'

export class UIServer {
  private app: express.Application
  private server: ReturnType<typeof createServer>
  private io: Server
  private config: UIConfig
  private generator: ScaffoldGenerator
  private gitManager: GitManager
  private dockerManager: DockerManager
  private nginxManager: NginxManager
  private submoduleManager: SubmoduleManager
  private workflowManager: WorkflowManager
  private iconManager: IconManager
  private fontManager: FontManager

  constructor(config: Partial<UIConfig> = {}) {
    this.config = {
      port: 3000,
      host: 'localhost',
      autoOpen: true,
      ...config
    }

    this.app = express()
    this.server = createServer(this.app)
    this.io = new Server(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    })

    this.generator = new ScaffoldGenerator()
    this.gitManager = new GitManager()
    this.dockerManager = new DockerManager()
    this.nginxManager = new NginxManager()
    this.submoduleManager = new SubmoduleManager()
    this.workflowManager = new WorkflowManager()
    this.iconManager = new IconManager()
    this.fontManager = new FontManager()

    this.setupMiddleware()
    this.setupRoutes()
    this.setupSocketHandlers()
  }

  private setupMiddleware(): void {
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))
    this.app.use(express.static(path.join(__dirname, '../ui/dist')))
  }

  private setupRoutes(): void {
    // API 路由
    this.app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() })
    })

    // 获取环境信息
    this.app.get('/api/environment', async (req, res) => {
      try {
        const env = await detectDevEnvironment()
        res.json({ success: true, data: env })
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    })

    // 获取模板列表
    this.app.get('/api/templates', async (req, res) => {
      try {
        const templates = await this.generator.getTemplateManager().listTemplates()
        const features = await this.generator.getTemplateManager().listFeatures()
        res.json({ success: true, data: { templates, features } })
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    })

    // 创建项目
    this.app.post('/api/projects', async (req, res) => {
      try {
        const { config, variables, options } = req.body
        const result = await this.generator.createProject({
          targetDir: path.resolve(config.name),
          config,
          variables,
          ...options
        })
        res.json(result)
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    })

    // Git 操作路由
    this.app.get('/api/git/status/:projectPath', async (req, res) => {
      try {
        const { projectPath } = req.params
        const status = await this.gitManager.getStatus(projectPath)
        res.json({ success: true, data: status })
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    })

    this.app.post('/api/git/commit', async (req, res) => {
      try {
        const { projectPath, message, files } = req.body
        const result = await this.gitManager.commit(projectPath, message, files)
        res.json(result)
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    })

    this.app.post('/api/git/push', async (req, res) => {
      try {
        const { projectPath, remote, branch } = req.body
        const result = await this.gitManager.push(projectPath, remote, branch)
        res.json(result)
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    })

    this.app.post('/api/git/pull', async (req, res) => {
      try {
        const { projectPath, remote, branch } = req.body
        const result = await this.gitManager.pull(projectPath, remote, branch)
        res.json(result)
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    })

    // Docker 操作路由
    this.app.get('/api/docker/images', async (req, res) => {
      try {
        const images = await this.dockerManager.listImages()
        res.json({ success: true, data: images })
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    })

    this.app.get('/api/docker/containers', async (req, res) => {
      try {
        const containers = await this.dockerManager.listContainers()
        res.json({ success: true, data: containers })
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    })

    this.app.post('/api/docker/build', async (req, res) => {
      try {
        const { projectPath, imageName, dockerfile } = req.body
        const result = await this.dockerManager.buildImage(projectPath, imageName, dockerfile)
        res.json(result)
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    })

    this.app.post('/api/docker/run', async (req, res) => {
      try {
        const { imageName, containerName, ports, volumes, env } = req.body
        const result = await this.dockerManager.runContainer(imageName, {
          name: containerName,
          ports,
          volumes,
          env
        })
        res.json(result)
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    })

    // Nginx 配置路由
    this.app.get('/api/nginx/config/:projectPath', async (req, res) => {
      try {
        const { projectPath } = req.params
        const config = await this.nginxManager.getConfig(projectPath)
        res.json({ success: true, data: config })
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    })

    this.app.post('/api/nginx/config', async (req, res) => {
      try {
        const { projectPath, config } = req.body
        const result = await this.nginxManager.updateConfig(projectPath, config)
        res.json(result)
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    })

    // Submodule 管理路由
    this.app.get('/api/submodules/:projectPath', async (req, res) => {
      try {
        const { projectPath } = req.params
        const submodules = await this.submoduleManager.list(projectPath)
        res.json({ success: true, data: submodules })
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    })

    this.app.post('/api/submodules', async (req, res) => {
      try {
        const { projectPath, url, path: subPath, branch } = req.body
        const result = await this.submoduleManager.add(projectPath, url, subPath, branch)
        res.json(result)
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    })

    this.app.delete('/api/submodules', async (req, res) => {
      try {
        const { projectPath, path: subPath } = req.body
        const result = await this.submoduleManager.remove(projectPath, subPath)
        res.json(result)
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    })

    // GitHub Actions 工作流路由
    this.app.get('/api/workflows/:projectPath', async (req, res) => {
      try {
        const { projectPath } = req.params
        const workflows = await this.workflowManager.list(projectPath)
        res.json({ success: true, data: workflows })
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    })

    this.app.post('/api/workflows', async (req, res) => {
      try {
        const { projectPath, name, config } = req.body
        const result = await this.workflowManager.create(projectPath, name, config)
        res.json(result)
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    })

    // Iconfont 管理路由
    this.app.get('/api/icons/:projectPath', async (req, res) => {
      try {
        const { projectPath } = req.params
        const icons = await this.iconManager.list(projectPath)
        res.json({ success: true, data: icons })
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    })

    this.app.post('/api/icons/download', async (req, res) => {
      try {
        const { projectPath, projectId, fontClass } = req.body
        const result = await this.iconManager.downloadIconfont(projectPath, projectId, fontClass)
        res.json(result)
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    })

    // Fontmin 管理路由
    this.app.post('/api/fonts/optimize', async (req, res) => {
      try {
        const { projectPath, fontFiles, text } = req.body
        const result = await this.fontManager.optimizeFonts(projectPath, fontFiles, text)
        res.json(result)
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    })

    // 默认路由 - 返回前端应用
    this.app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../ui/dist/index.html'))
    })
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket) => {
      logger.info(`客户端连接: ${socket.id}`)

      // 项目创建进度
      socket.on('create-project', async (data) => {
        try {
          const { config, variables, options } = data
          
          // 发送进度更新
          const emitProgress = (step: string, progress: number) => {
            socket.emit('project-progress', { step, progress })
          }

          const result = await this.generator.createProject({
            targetDir: path.resolve(config.name),
            config,
            variables,
            ...options,
            onProgress: emitProgress
          })

          socket.emit('project-created', result)
        } catch (error) {
          socket.emit('project-error', {
            error: error instanceof Error ? error.message : String(error)
          })
        }
      })

      // Git 操作实时反馈
      socket.on('git-operation', async (data) => {
        try {
          const { operation, projectPath, ...params } = data
          let result: CommandResult

          switch (operation) {
            case 'status':
              result = await this.gitManager.getStatus(projectPath)
              break
            case 'commit':
              result = await this.gitManager.commit(projectPath, params.message, params.files)
              break
            case 'push':
              result = await this.gitManager.push(projectPath, params.remote, params.branch)
              break
            case 'pull':
              result = await this.gitManager.pull(projectPath, params.remote, params.branch)
              break
            default:
              throw new Error(`未知的 Git 操作: ${operation}`)
          }

          socket.emit('git-result', { operation, result })
        } catch (error) {
          socket.emit('git-error', {
            operation: data.operation,
            error: error instanceof Error ? error.message : String(error)
          })
        }
      })

      // Docker 操作实时反馈
      socket.on('docker-operation', async (data) => {
        try {
          const { operation, ...params } = data
          let result: CommandResult

          switch (operation) {
            case 'build':
              result = await this.dockerManager.buildImage(params.projectPath, params.imageName, params.dockerfile)
              break
            case 'run':
              result = await this.dockerManager.runContainer(params.imageName, params.options)
              break
            case 'stop':
              result = await this.dockerManager.stopContainer(params.containerName)
              break
            case 'remove':
              result = await this.dockerManager.removeContainer(params.containerName)
              break
            default:
              throw new Error(`未知的 Docker 操作: ${operation}`)
          }

          socket.emit('docker-result', { operation, result })
        } catch (error) {
          socket.emit('docker-error', {
            operation: data.operation,
            error: error instanceof Error ? error.message : String(error)
          })
        }
      })

      socket.on('disconnect', () => {
        logger.info(`客户端断开连接: ${socket.id}`)
      })
    })
  }

  async start(): Promise<void> {
    try {
      // 检查端口是否可用
      const port = await getAvailablePort(this.config.port!)
      if (port !== this.config.port) {
        logger.warning(`端口 ${this.config.port} 被占用，使用端口 ${port}`)
        this.config.port = port
      }

      // 启动服务器
      await new Promise<void>((resolve, reject) => {
        this.server.listen(this.config.port, this.config.host, () => {
          resolve()
        })
        this.server.on('error', reject)
      })

      const url = `http://${this.config.host}:${this.config.port}`
      logger.success(`🚀 可视化界面已启动: ${url}`)

      // 自动打开浏览器
      if (this.config.autoOpen) {
        try {
          await open(url)
          logger.info('已自动打开浏览器')
        } catch {
          logger.warning('无法自动打开浏览器，请手动访问上述地址')
        }
      }
    } catch (error) {
      throw new Error(`启动 UI 服务器失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      this.server.close(() => {
        logger.info('UI 服务器已停止')
        resolve()
      })
    })
  }

  getUrl(): string {
    return `http://${this.config.host}:${this.config.port}`
  }

  getConfig(): UIConfig {
    return { ...this.config }
  }
}