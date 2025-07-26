import { execa } from 'execa'
import path from 'path'
import fs from 'fs-extra'
import { CommandResult, DockerConfig } from '../types/index.js'
import { logger } from '../utils/index.js'

export interface DockerImage {
  id: string
  repository: string
  tag: string
  created: string
  size: string
}

export interface DockerContainer {
  id: string
  image: string
  command: string
  created: string
  status: string
  ports: string
  names: string
}

export interface ContainerOptions {
  name?: string
  ports?: string[]
  volumes?: string[]
  env?: Record<string, string>
  detach?: boolean
  remove?: boolean
}

export class DockerManager {
  /**
   * 检查 Docker 是否可用
   */
  async isDockerAvailable(): Promise<boolean> {
    try {
      await execa('docker', ['--version'])
      return true
    } catch {
      return false
    }
  }

  /**
   * 检查 Docker 是否运行
   */
  async isDockerRunning(): Promise<boolean> {
    try {
      await execa('docker', ['info'])
      return true
    } catch {
      return false
    }
  }

  /**
   * 获取 Docker 版本信息
   */
  async getVersion(): Promise<CommandResult> {
    try {
      const { stdout } = await execa('docker', ['--version'])
      return {
        success: true,
        message: '获取 Docker 版本成功',
        data: { version: stdout }
      }
    } catch (error) {
      const message = `获取 Docker 版本失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 列出所有镜像
   */
  async listImages(): Promise<CommandResult<DockerImage[]>> {
    try {
      const { stdout } = await execa('docker', ['images', '--format', 'table {{.ID}}\t{{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}\t{{.Size}}'])
      
      const lines = stdout.split('\n').slice(1) // 跳过标题行
      const images: DockerImage[] = lines
        .filter(line => line.trim())
        .map(line => {
          const [id, repository, tag, created, size] = line.split('\t')
          return { id, repository, tag, created, size }
        })
      
      return {
        success: true,
        message: '获取镜像列表成功',
        data: images
      }
    } catch (error) {
      const message = `获取镜像列表失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 列出所有容器
   */
  async listContainers(all: boolean = true): Promise<CommandResult<DockerContainer[]>> {
    try {
      const args = ['ps', '--format', 'table {{.ID}}\t{{.Image}}\t{{.Command}}\t{{.CreatedAt}}\t{{.Status}}\t{{.Ports}}\t{{.Names}}']
      if (all) {
        args.push('-a')
      }
      
      const { stdout } = await execa('docker', args)
      
      const lines = stdout.split('\n').slice(1) // 跳过标题行
      const containers: DockerContainer[] = lines
        .filter(line => line.trim())
        .map(line => {
          const [id, image, command, created, status, ports, names] = line.split('\t')
          return { id, image, command, created, status, ports, names }
        })
      
      return {
        success: true,
        message: '获取容器列表成功',
        data: containers
      }
    } catch (error) {
      const message = `获取容器列表失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 构建镜像
   */
  async buildImage(projectPath: string, imageName: string, dockerfile?: string): Promise<CommandResult> {
    try {
      const args = ['build', '-t', imageName]
      
      if (dockerfile) {
        args.push('-f', dockerfile)
      }
      
      args.push('.')
      
      logger.info(`开始构建镜像: ${imageName}`)
      
      const { stdout, stderr } = await execa('docker', args, {
        cwd: projectPath,
        stdio: 'pipe'
      })
      
      logger.success(`镜像构建成功: ${imageName}`)
      
      return {
        success: true,
        message: '镜像构建成功',
        data: {
          imageName,
          output: stdout,
          error: stderr
        }
      }
    } catch (error) {
      const message = `镜像构建失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 运行容器
   */
  async runContainer(imageName: string, options: ContainerOptions = {}): Promise<CommandResult> {
    try {
      const args = ['run']
      
      // 分离模式
      if (options.detach !== false) {
        args.push('-d')
      }
      
      // 自动删除
      if (options.remove) {
        args.push('--rm')
      }
      
      // 容器名称
      if (options.name) {
        args.push('--name', options.name)
      }
      
      // 端口映射
      if (options.ports) {
        options.ports.forEach(port => {
          args.push('-p', port)
        })
      }
      
      // 卷挂载
      if (options.volumes) {
        options.volumes.forEach(volume => {
          args.push('-v', volume)
        })
      }
      
      // 环境变量
      if (options.env) {
        Object.entries(options.env).forEach(([key, value]) => {
          args.push('-e', `${key}=${value}`)
        })
      }
      
      args.push(imageName)
      
      logger.info(`开始运行容器: ${imageName}`)
      
      const { stdout } = await execa('docker', args)
      
      logger.success(`容器运行成功: ${options.name || imageName}`)
      
      return {
        success: true,
        message: '容器运行成功',
        data: {
          containerId: stdout.trim(),
          imageName,
          options
        }
      }
    } catch (error) {
      const message = `容器运行失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 停止容器
   */
  async stopContainer(containerName: string): Promise<CommandResult> {
    try {
      await execa('docker', ['stop', containerName])
      
      logger.success(`容器停止成功: ${containerName}`)
      
      return {
        success: true,
        message: '容器停止成功',
        data: { containerName }
      }
    } catch (error) {
      const message = `容器停止失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 启动容器
   */
  async startContainer(containerName: string): Promise<CommandResult> {
    try {
      await execa('docker', ['start', containerName])
      
      logger.success(`容器启动成功: ${containerName}`)
      
      return {
        success: true,
        message: '容器启动成功',
        data: { containerName }
      }
    } catch (error) {
      const message = `容器启动失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 重启容器
   */
  async restartContainer(containerName: string): Promise<CommandResult> {
    try {
      await execa('docker', ['restart', containerName])
      
      logger.success(`容器重启成功: ${containerName}`)
      
      return {
        success: true,
        message: '容器重启成功',
        data: { containerName }
      }
    } catch (error) {
      const message = `容器重启失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 删除容器
   */
  async removeContainer(containerName: string, force: boolean = false): Promise<CommandResult> {
    try {
      const args = ['rm']
      if (force) {
        args.push('-f')
      }
      args.push(containerName)
      
      await execa('docker', args)
      
      logger.success(`容器删除成功: ${containerName}`)
      
      return {
        success: true,
        message: '容器删除成功',
        data: { containerName }
      }
    } catch (error) {
      const message = `容器删除失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 删除镜像
   */
  async removeImage(imageName: string, force: boolean = false): Promise<CommandResult> {
    try {
      const args = ['rmi']
      if (force) {
        args.push('-f')
      }
      args.push(imageName)
      
      await execa('docker', args)
      
      logger.success(`镜像删除成功: ${imageName}`)
      
      return {
        success: true,
        message: '镜像删除成功',
        data: { imageName }
      }
    } catch (error) {
      const message = `镜像删除失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 获取容器日志
   */
  async getContainerLogs(containerName: string, tail?: number): Promise<CommandResult> {
    try {
      const args = ['logs']
      if (tail) {
        args.push('--tail', tail.toString())
      }
      args.push(containerName)
      
      const { stdout } = await execa('docker', args)
      
      return {
        success: true,
        message: '获取容器日志成功',
        data: { logs: stdout }
      }
    } catch (error) {
      const message = `获取容器日志失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 执行容器内命令
   */
  async execCommand(containerName: string, command: string[]): Promise<CommandResult> {
    try {
      const args = ['exec', '-it', containerName, ...command]
      const { stdout } = await execa('docker', args)
      
      return {
        success: true,
        message: '命令执行成功',
        data: { output: stdout }
      }
    } catch (error) {
      const message = `命令执行失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 生成 Dockerfile
   */
  async generateDockerfile(projectPath: string, config: DockerConfig): Promise<CommandResult> {
    try {
      const dockerfileContent = this.buildDockerfileContent(config)
      const dockerfilePath = path.join(projectPath, 'Dockerfile')
      
      await fs.writeFile(dockerfilePath, dockerfileContent, 'utf8')
      
      logger.success(`Dockerfile 生成成功: ${dockerfilePath}`)
      
      return {
        success: true,
        message: 'Dockerfile 生成成功',
        data: { path: dockerfilePath, content: dockerfileContent }
      }
    } catch (error) {
      const message = `Dockerfile 生成失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 生成 docker-compose.yml
   */
  async generateDockerCompose(projectPath: string, config: DockerConfig): Promise<CommandResult> {
    try {
      const composeContent = this.buildDockerComposeContent(config)
      const composePath = path.join(projectPath, 'docker-compose.yml')
      
      await fs.writeFile(composePath, composeContent, 'utf8')
      
      logger.success(`docker-compose.yml 生成成功: ${composePath}`)
      
      return {
        success: true,
        message: 'docker-compose.yml 生成成功',
        data: { path: composePath, content: composeContent }
      }
    } catch (error) {
      const message = `docker-compose.yml 生成失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 构建 Dockerfile 内容
   */
  private buildDockerfileContent(config: DockerConfig): string {
    const lines: string[] = []
    
    // 基础镜像
    lines.push(`FROM ${config.baseImage || 'node:18-alpine'}`)
    lines.push('')
    
    // 工作目录
    lines.push(`WORKDIR ${config.workDir || '/app'}`)
    lines.push('')
    
    // 复制 package.json
    lines.push('COPY package*.json ./')
    lines.push('')
    
    // 安装依赖
    lines.push('RUN npm ci --only=production')
    lines.push('')
    
    // 复制源代码
    lines.push('COPY . .')
    lines.push('')
    
    // 构建应用
    if (config.buildCommand) {
      lines.push(`RUN ${config.buildCommand}`)
      lines.push('')
    }
    
    // 暴露端口
    if (config.port) {
      lines.push(`EXPOSE ${config.port}`)
      lines.push('')
    }
    
    // 启动命令
    lines.push(`CMD ["${config.startCommand || 'npm', 'start'}"]`)
    
    return lines.join('\n')
  }

  /**
   * 构建 docker-compose.yml 内容
   */
  private buildDockerComposeContent(config: DockerConfig): string {
    const compose = {
      version: '3.8',
      services: {
        app: {
          build: '.',
          ports: config.port ? [`${config.port}:${config.port}`] : undefined,
          environment: config.env || {},
          volumes: config.volumes || [],
          depends_on: config.services || []
        }
      }
    }
    
    // 添加其他服务
    if (config.services) {
      config.services.forEach(service => {
        if (service === 'redis') {
          compose.services.redis = {
            image: 'redis:alpine',
            ports: ['6379:6379']
          }
        } else if (service === 'postgres') {
          compose.services.postgres = {
            image: 'postgres:13',
            environment: {
              POSTGRES_DB: 'app',
              POSTGRES_USER: 'user',
              POSTGRES_PASSWORD: 'password'
            },
            ports: ['5432:5432'],
            volumes: ['postgres_data:/var/lib/postgresql/data']
          }
        } else if (service === 'mysql') {
          compose.services.mysql = {
            image: 'mysql:8',
            environment: {
              MYSQL_ROOT_PASSWORD: 'password',
              MYSQL_DATABASE: 'app'
            },
            ports: ['3306:3306'],
            volumes: ['mysql_data:/var/lib/mysql']
          }
        }
      })
      
      // 添加卷定义
      if (config.services.includes('postgres')) {
        compose.volumes = { postgres_data: {} }
      }
      if (config.services.includes('mysql')) {
        compose.volumes = { ...compose.volumes, mysql_data: {} }
      }
    }
    
    return `# Docker Compose configuration\n# Generated by ldesign-scaffold\n\n${JSON.stringify(compose, null, 2).replace(/"/g, '')}`
  }
}