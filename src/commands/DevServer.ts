import { createServer, build, preview } from 'vite'
import vue from '@vitejs/plugin-vue'
import { createVuePlugin } from 'vite-plugin-vue2'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs-extra'
import chalk from 'chalk'
import { networkInterfaces } from 'os'
import { logger } from '../utils/index.js'

interface DevServerOptions {
  port: number
  host: string
  cwd: string
}

interface BuildOptions {
  outDir: string
  cwd: string
}

interface PreviewOptions {
  port: number
  host: string
  cwd: string
}

/**
 * 检测项目类型
 */
function detectProjectType(cwd: string): 'vue3' | 'vue2' | 'react' | 'unknown' {
  const packageJsonPath = path.join(cwd, 'package.json')
  
  if (!fs.existsSync(packageJsonPath)) {
    return 'unknown'
  }
  
  try {
    const packageJson = fs.readJsonSync(packageJsonPath)
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies }
    
    if (dependencies.vue) {
      const vueVersion = dependencies.vue
      if (vueVersion.includes('^3.') || vueVersion.includes('~3.')) {
        return 'vue3'
      } else if (vueVersion.includes('^2.') || vueVersion.includes('~2.')) {
        return 'vue2'
      }
    }
    
    if (dependencies.react) {
      return 'react'
    }
    
    return 'unknown'
  } catch (error) {
    logger.error('读取 package.json 失败:', error)
    return 'unknown'
  }
}

/**
 * 获取 Vite 配置
 */
function getViteConfig(projectType: string, cwd: string) {
  const config: any = {
    root: cwd,
    plugins: [],
    server: {
      fs: {
        allow: [cwd, path.dirname(cwd)]
      }
    }
  }
  
  // 检查是否有自定义 vite.config.ts
  const viteConfigPath = path.join(cwd, 'vite.config.ts')
  if (fs.existsSync(viteConfigPath)) {
    logger.info('使用项目自定义的 vite.config.ts')
    return undefined // 让 Vite 使用项目的配置文件
  }
  
  // 根据项目类型添加插件
  switch (projectType) {
    case 'vue3':
      config.plugins.push(vue())
      break
    case 'vue2':
      config.plugins.push(createVuePlugin())
      break
    case 'react':
      config.plugins.push(react())
      break
    default:
      logger.warning('未知的项目类型，使用默认配置')
  }
  
  return config
}

/**
 * 启动开发服务器
 */
export async function startDevServer(options: DevServerOptions): Promise<void> {
  const { port, host, cwd } = options
  
  logger.info(`启动开发服务器...`)
  logger.info(`项目目录: ${cwd}`)
  
  const projectType = detectProjectType(cwd)
  logger.info(`检测到项目类型: ${projectType}`)
  
  try {
    const config = getViteConfig(projectType, cwd)
    
    const server = await createServer({
      ...config,
      server: {
        ...config?.server,
        port,
        host,
        open: true
      }
    })
    
    await server.listen()
    
    const url = `http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`
    console.log()
    console.log(chalk.green(`🚀 开发服务器已启动!`))
    console.log(chalk.blue(`📱 本地访问: ${url}`))
    console.log(chalk.blue(`🌐 网络访问: http://${getLocalIP()}:${port}`))
    console.log()
    console.log(chalk.gray('按 Ctrl+C 停止服务器'))
    
  } catch (error) {
    logger.error('启动开发服务器失败:', error)
    throw error
  }
}

/**
 * 构建项目
 */
export async function buildProject(options: BuildOptions): Promise<void> {
  const { outDir, cwd } = options
  
  logger.info(`构建项目...`)
  logger.info(`项目目录: ${cwd}`)
  logger.info(`输出目录: ${outDir}`)
  
  const projectType = detectProjectType(cwd)
  logger.info(`检测到项目类型: ${projectType}`)
  
  try {
    const config = getViteConfig(projectType, cwd)
    
    await build({
      ...config,
      build: {
        outDir: path.resolve(cwd, outDir),
        emptyOutDir: true
      }
    })
    
    console.log()
    console.log(chalk.green(`✅ 构建完成!`))
    console.log(chalk.blue(`📁 输出目录: ${path.resolve(cwd, outDir)}`))
    console.log()
    
  } catch (error) {
    logger.error('构建项目失败:', error)
    throw error
  }
}

/**
 * 预览构建结果
 */
export async function previewBuild(options: PreviewOptions): Promise<void> {
  const { port, host, cwd } = options
  
  logger.info(`预览构建结果...`)
  logger.info(`项目目录: ${cwd}`)
  
  const distPath = path.join(cwd, 'dist')
  if (!fs.existsSync(distPath)) {
    logger.error('dist 目录不存在，请先运行构建命令')
    throw new Error('构建目录不存在')
  }
  
  try {
    const previewServer = await preview({
      root: cwd,
      preview: {
        port,
        host,
        open: true
      }
    })
    
    const url = `http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`
    console.log()
    console.log(chalk.green(`🔍 预览服务器已启动!`))
    console.log(chalk.blue(`📱 本地访问: ${url}`))
    console.log(chalk.blue(`🌐 网络访问: http://${getLocalIP()}:${port}`))
    console.log()
    console.log(chalk.gray('按 Ctrl+C 停止服务器'))
    
  } catch (error) {
    logger.error('启动预览服务器失败:', error)
    throw error
  }
}

/**
 * 获取本机 IP 地址
 */
function getLocalIP(): string {
  const interfaces = networkInterfaces()

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address
      }
    }
  }

  return 'localhost'
}
