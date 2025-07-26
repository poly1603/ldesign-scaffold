import path from 'path'
import fs from 'fs-extra'
import { CommandResult, NginxConfig, ProxyConfig } from '../types/index.js'
import { logger } from '../utils/index.js'

export interface NginxServerConfig {
  listen: number
  serverName: string
  root?: string
  index?: string[]
  locations: NginxLocationConfig[]
  ssl?: {
    certificate: string
    certificateKey: string
  }
  gzip?: boolean
  accessLog?: string
  errorLog?: string
}

export interface NginxLocationConfig {
  path: string
  type: 'static' | 'proxy' | 'redirect' | 'custom'
  config: any
}

export class NginxManager {
  /**
   * 获取项目的 Nginx 配置
   */
  async getConfig(projectPath: string): Promise<CommandResult<NginxConfig>> {
    try {
      const configPath = path.join(projectPath, 'nginx.conf')
      
      if (await fs.pathExists(configPath)) {
        const content = await fs.readFile(configPath, 'utf8')
        const config = this.parseNginxConfig(content)
        
        return {
          success: true,
          message: '获取 Nginx 配置成功',
          data: config
        }
      } else {
        // 返回默认配置
        const defaultConfig = this.getDefaultConfig()
        
        return {
          success: true,
          message: '使用默认 Nginx 配置',
          data: defaultConfig
        }
      }
    } catch (error) {
      const message = `获取 Nginx 配置失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 更新 Nginx 配置
   */
  async updateConfig(projectPath: string, config: NginxConfig): Promise<CommandResult> {
    try {
      const configContent = this.generateNginxConfig(config)
      const configPath = path.join(projectPath, 'nginx.conf')
      
      await fs.writeFile(configPath, configContent, 'utf8')
      
      // 同时生成 Docker 版本的配置
      const dockerConfigPath = path.join(projectPath, 'nginx.docker.conf')
      const dockerConfigContent = this.generateDockerNginxConfig(config)
      await fs.writeFile(dockerConfigPath, dockerConfigContent, 'utf8')
      
      logger.success(`Nginx 配置更新成功: ${configPath}`)
      
      return {
        success: true,
        message: 'Nginx 配置更新成功',
        data: {
          configPath,
          dockerConfigPath,
          content: configContent
        }
      }
    } catch (error) {
      const message = `更新 Nginx 配置失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 生成反向代理配置
   */
  async generateProxyConfig(projectPath: string, proxies: ProxyConfig[]): Promise<CommandResult> {
    try {
      const config: NginxConfig = {
        port: 80,
        serverName: 'localhost',
        gzip: true,
        proxies
      }
      
      return await this.updateConfig(projectPath, config)
    } catch (error) {
      const message = `生成反向代理配置失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 生成静态文件服务配置
   */
  async generateStaticConfig(projectPath: string, options: {
    port?: number
    serverName?: string
    root?: string
    index?: string[]
    spa?: boolean
  } = {}): Promise<CommandResult> {
    try {
      const config: NginxConfig = {
        port: options.port || 80,
        serverName: options.serverName || 'localhost',
        root: options.root || '/usr/share/nginx/html',
        index: options.index || ['index.html', 'index.htm'],
        gzip: true,
        spa: options.spa || false
      }
      
      return await this.updateConfig(projectPath, config)
    } catch (error) {
      const message = `生成静态文件服务配置失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 生成 SSL 配置
   */
  async generateSSLConfig(projectPath: string, options: {
    port?: number
    serverName: string
    certificatePath: string
    keyPath: string
    redirectHttp?: boolean
  }): Promise<CommandResult> {
    try {
      const config: NginxConfig = {
        port: options.port || 443,
        serverName: options.serverName,
        ssl: {
          certificate: options.certificatePath,
          certificateKey: options.keyPath
        },
        gzip: true
      }
      
      // 如果需要 HTTP 重定向到 HTTPS
      if (options.redirectHttp) {
        config.httpRedirect = true
      }
      
      return await this.updateConfig(projectPath, config)
    } catch (error) {
      const message = `生成 SSL 配置失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 生成负载均衡配置
   */
  async generateLoadBalancerConfig(projectPath: string, options: {
    upstreams: Array<{
      name: string
      servers: string[]
      method?: 'round_robin' | 'least_conn' | 'ip_hash'
    }>
    port?: number
    serverName?: string
  }): Promise<CommandResult> {
    try {
      const config: NginxConfig = {
        port: options.port || 80,
        serverName: options.serverName || 'localhost',
        upstreams: options.upstreams,
        gzip: true
      }
      
      return await this.updateConfig(projectPath, config)
    } catch (error) {
      const message = `生成负载均衡配置失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 验证 Nginx 配置
   */
  async validateConfig(configPath: string): Promise<CommandResult> {
    try {
      // 这里可以集成 nginx -t 命令来验证配置
      // 由于需要 nginx 二进制文件，这里只做基本的语法检查
      
      const content = await fs.readFile(configPath, 'utf8')
      const errors = this.validateNginxSyntax(content)
      
      if (errors.length > 0) {
        return {
          success: false,
          message: 'Nginx 配置验证失败',
          error: new Error(errors.join('\n'))
        }
      }
      
      return {
        success: true,
        message: 'Nginx 配置验证通过',
        data: { configPath }
      }
    } catch (error) {
      const message = `验证 Nginx 配置失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 获取默认配置
   */
  private getDefaultConfig(): NginxConfig {
    return {
      port: 80,
      serverName: 'localhost',
      root: '/usr/share/nginx/html',
      index: ['index.html', 'index.htm'],
      gzip: true
    }
  }

  /**
   * 解析 Nginx 配置文件
   */
  private parseNginxConfig(content: string): NginxConfig {
    // 简单的配置解析，实际项目中可能需要更复杂的解析器
    const config: NginxConfig = {
      port: 80,
      serverName: 'localhost',
      gzip: true
    }
    
    // 解析 listen 指令
    const listenMatch = content.match(/listen\s+(\d+)/)
    if (listenMatch) {
      config.port = parseInt(listenMatch[1])
    }
    
    // 解析 server_name 指令
    const serverNameMatch = content.match(/server_name\s+([^;]+)/)
    if (serverNameMatch) {
      config.serverName = serverNameMatch[1].trim()
    }
    
    // 解析 root 指令
    const rootMatch = content.match(/root\s+([^;]+)/)
    if (rootMatch) {
      config.root = rootMatch[1].trim()
    }
    
    return config
  }

  /**
   * 生成 Nginx 配置内容
   */
  private generateNginxConfig(config: NginxConfig): string {
    const lines: string[] = []
    
    // 添加注释
    lines.push('# Nginx configuration')
    lines.push('# Generated by ldesign-scaffold')
    lines.push('')
    
    // upstream 配置
    if (config.upstreams) {
      config.upstreams.forEach(upstream => {
        lines.push(`upstream ${upstream.name} {`)
        if (upstream.method && upstream.method !== 'round_robin') {
          lines.push(`    ${upstream.method};`)
        }
        upstream.servers.forEach(server => {
          lines.push(`    server ${server};`)
        })
        lines.push('}')
        lines.push('')
      })
    }
    
    // HTTP 重定向服务器块（如果启用了 SSL）
    if (config.ssl && config.httpRedirect) {
      lines.push('server {')
      lines.push('    listen 80;')
      lines.push(`    server_name ${config.serverName};`)
      lines.push(`    return 301 https://$server_name$request_uri;`)
      lines.push('}')
      lines.push('')
    }
    
    // 主服务器块
    lines.push('server {')
    
    // listen 指令
    if (config.ssl) {
      lines.push(`    listen ${config.port} ssl http2;`)
    } else {
      lines.push(`    listen ${config.port};`)
    }
    
    // server_name 指令
    lines.push(`    server_name ${config.serverName};`)
    
    // SSL 配置
    if (config.ssl) {
      lines.push('')
      lines.push(`    ssl_certificate ${config.ssl.certificate};`)
      lines.push(`    ssl_certificate_key ${config.ssl.certificateKey};`)
      lines.push('    ssl_protocols TLSv1.2 TLSv1.3;')
      lines.push('    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;')
      lines.push('    ssl_prefer_server_ciphers off;')
    }
    
    // root 和 index 指令
    if (config.root) {
      lines.push('')
      lines.push(`    root ${config.root};`)
      if (config.index) {
        lines.push(`    index ${config.index.join(' ')};`)
      }
    }
    
    // gzip 配置
    if (config.gzip) {
      lines.push('')
      lines.push('    gzip on;')
      lines.push('    gzip_vary on;')
      lines.push('    gzip_min_length 1024;')
      lines.push('    gzip_proxied any;')
      lines.push('    gzip_comp_level 6;')
      lines.push('    gzip_types')
      lines.push('        text/plain')
      lines.push('        text/css')
      lines.push('        text/xml')
      lines.push('        text/javascript')
      lines.push('        application/javascript')
      lines.push('        application/xml+rss')
      lines.push('        application/json;')
    }
    
    // 代理配置
    if (config.proxies) {
      lines.push('')
      config.proxies.forEach(proxy => {
        lines.push(`    location ${proxy.path} {`)
        lines.push(`        proxy_pass ${proxy.target};`)
        lines.push('        proxy_http_version 1.1;')
        lines.push('        proxy_set_header Upgrade $http_upgrade;')
        lines.push('        proxy_set_header Connection "upgrade";')
        lines.push('        proxy_set_header Host $host;')
        lines.push('        proxy_set_header X-Real-IP $remote_addr;')
        lines.push('        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;')
        lines.push('        proxy_set_header X-Forwarded-Proto $scheme;')
        lines.push('        proxy_cache_bypass $http_upgrade;')
        
        if (proxy.timeout) {
          lines.push(`        proxy_connect_timeout ${proxy.timeout}s;`)
          lines.push(`        proxy_send_timeout ${proxy.timeout}s;`)
          lines.push(`        proxy_read_timeout ${proxy.timeout}s;`)
        }
        
        lines.push('    }')
      })
    }
    
    // SPA 支持
    if (config.spa) {
      lines.push('')
      lines.push('    location / {')
      lines.push('        try_files $uri $uri/ /index.html;')
      lines.push('    }')
    }
    
    // 静态资源缓存
    if (config.root) {
      lines.push('')
      lines.push('    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {')
      lines.push('        expires 1y;')
      lines.push('        add_header Cache-Control "public, immutable";')
      lines.push('    }')
    }
    
    // 安全头
    lines.push('')
    lines.push('    add_header X-Frame-Options "SAMEORIGIN" always;')
    lines.push('    add_header X-Content-Type-Options "nosniff" always;')
    lines.push('    add_header X-XSS-Protection "1; mode=block" always;')
    
    if (config.ssl) {
      lines.push('    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;')
    }
    
    lines.push('}')
    
    return lines.join('\n')
  }

  /**
   * 生成 Docker 版本的 Nginx 配置
   */
  private generateDockerNginxConfig(config: NginxConfig): string {
    // Docker 版本的配置，路径可能不同
    const dockerConfig = { ...config }
    
    // 调整路径为容器内路径
    if (dockerConfig.root && !dockerConfig.root.startsWith('/usr/share/nginx/html')) {
      dockerConfig.root = '/usr/share/nginx/html'
    }
    
    return this.generateNginxConfig(dockerConfig)
  }

  /**
   * 验证 Nginx 语法
   */
  private validateNginxSyntax(content: string): string[] {
    const errors: string[] = []
    
    // 检查基本的语法错误
    const lines = content.split('\n')
    let braceCount = 0
    
    lines.forEach((line, index) => {
      const trimmed = line.trim()
      
      // 跳过注释和空行
      if (trimmed.startsWith('#') || trimmed === '') {
        return
      }
      
      // 检查大括号匹配
      const openBraces = (trimmed.match(/{/g) || []).length
      const closeBraces = (trimmed.match(/}/g) || []).length
      braceCount += openBraces - closeBraces
      
      // 检查分号
      if (!trimmed.endsWith('{') && !trimmed.endsWith('}') && !trimmed.endsWith(';')) {
        errors.push(`第 ${index + 1} 行: 缺少分号`)
      }
    })
    
    // 检查大括号是否匹配
    if (braceCount !== 0) {
      errors.push('大括号不匹配')
    }
    
    return errors
  }
}