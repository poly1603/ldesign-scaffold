import fs from 'fs-extra'
import path from 'path'
import { execSync } from 'child_process'
import chalk from 'chalk'
import { PackageManager, IDEType, DevEnvironment } from '../types/index.js'

/**
 * 检查目录是否为空
 */
export function isEmptyDir(dir: string): boolean {
  if (!fs.existsSync(dir)) {
    return true
  }
  const files = fs.readdirSync(dir)
  return files.length === 0 || (files.length === 1 && files[0] === '.git')
}

/**
 * 格式化项目名称
 */
export function formatProjectName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, '')
}

/**
 * 验证项目名称
 */
export function isValidPackageName(name: string): boolean {
  const formatted = formatProjectName(name)
  return formatted.length > 0 && /^[a-z0-9-]+$/.test(formatted)
}

/**
 * 检测包管理器
 */
export function detectPackageManager(): PackageManager {
  try {
    execSync('pnpm --version', { stdio: 'ignore' })
    return 'pnpm'
  } catch {}
  
  try {
    execSync('yarn --version', { stdio: 'ignore' })
    return 'yarn'
  } catch {}
  
  return 'npm'
}

/**
 * 获取包管理器安装命令
 */
export function getInstallCommand(packageManager: PackageManager): string {
  const commands = {
    npm: 'npm install',
    yarn: 'yarn install',
    pnpm: 'pnpm install'
  }
  return commands[packageManager]
}

/**
 * 获取包管理器运行命令
 */
export function getRunCommand(packageManager: PackageManager, script: string): string {
  const commands = {
    npm: `npm run ${script}`,
    yarn: `yarn ${script}`,
    pnpm: `pnpm ${script}`
  }
  return commands[packageManager]
}

/**
 * 检测开发环境
 */
export async function detectDevEnvironment(): Promise<DevEnvironment> {
  const env: DevEnvironment = {
    node: {
      version: process.version,
      path: process.execPath
    },
    packageManagers: {},
    ides: []
  }

  // 检测包管理器
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim()
    env.packageManagers.npm = {
      version: npmVersion,
      path: execSync('where npm', { encoding: 'utf8' }).trim()
    }
  } catch {}

  try {
    const yarnVersion = execSync('yarn --version', { encoding: 'utf8' }).trim()
    env.packageManagers.yarn = {
      version: yarnVersion,
      path: execSync('where yarn', { encoding: 'utf8' }).trim()
    }
  } catch {}

  try {
    const pnpmVersion = execSync('pnpm --version', { encoding: 'utf8' }).trim()
    env.packageManagers.pnpm = {
      version: pnpmVersion,
      path: execSync('where pnpm', { encoding: 'utf8' }).trim()
    }
  } catch {}

  // 检测Git
  try {
    const gitVersion = execSync('git --version', { encoding: 'utf8' }).trim()
    const gitPath = execSync('where git', { encoding: 'utf8' }).trim()
    
    let username: string | undefined
    let email: string | undefined
    
    try {
      username = execSync('git config --global user.name', { encoding: 'utf8' }).trim()
    } catch {}
    
    try {
      email = execSync('git config --global user.email', { encoding: 'utf8' }).trim()
    } catch {}
    
    env.git = {
      version: gitVersion,
      path: gitPath,
      config: { username, email }
    }
  } catch {}

  // 检测Docker
  try {
    const dockerVersion = execSync('docker --version', { encoding: 'utf8' }).trim()
    const dockerPath = execSync('where docker', { encoding: 'utf8' }).trim()
    
    let running = false
    try {
      execSync('docker info', { stdio: 'ignore' })
      running = true
    } catch {}
    
    env.docker = {
      version: dockerVersion,
      path: dockerPath,
      running
    }
  } catch {}

  // 检测IDE
  env.ides = await detectIDEs()

  return env
}

/**
 * 检测可用的IDE
 */
export async function detectIDEs(): Promise<Array<{ type: IDEType; path: string; available: boolean; version?: string }>> {
  const ides: Array<{ type: IDEType; path: string; available: boolean; version?: string }> = []
  
  // VSCode
  try {
    const codePath = execSync('where code', { encoding: 'utf8' }).trim()
    const codeVersion = execSync('code --version', { encoding: 'utf8' }).split('\n')[0]
    ides.push({
      type: 'vscode',
      path: codePath,
      available: true,
      version: codeVersion
    })
  } catch {
    ides.push({
      type: 'vscode',
      path: '',
      available: false
    })
  }

  // WebStorm (检查常见安装路径)
  const webstormPaths = [
    'C:\\Program Files\\JetBrains\\WebStorm*\\bin\\webstorm64.exe',
    'C:\\Users\\*\\AppData\\Local\\JetBrains\\WebStorm*\\bin\\webstorm64.exe'
  ]
  
  let webstormFound = false
  for (const pathPattern of webstormPaths) {
    try {
      const result = execSync(`dir "${pathPattern}" /s /b 2>nul`, { encoding: 'utf8' })
      if (result.trim()) {
        ides.push({
          type: 'webstorm',
          path: result.trim().split('\n')[0],
          available: true
        })
        webstormFound = true
        break
      }
    } catch {}
  }
  
  if (!webstormFound) {
    ides.push({
      type: 'webstorm',
      path: '',
      available: false
    })
  }

  return ides
}

/**
 * 启动IDE
 */
export async function openIDE(type: IDEType, projectPath: string): Promise<boolean> {
  try {
    switch (type) {
      case 'vscode':
        execSync(`code "${projectPath}"`, { stdio: 'ignore' })
        return true
      case 'webstorm':
        const ides = await detectIDEs()
        const webstorm = ides.find(ide => ide.type === 'webstorm' && ide.available)
        if (webstorm) {
          execSync(`"${webstorm.path}" "${projectPath}"`, { stdio: 'ignore' })
          return true
        }
        return false
      default:
        return false
    }
  } catch {
    return false
  }
}

/**
 * 复制模板文件
 */
export async function copyTemplate(
  templatePath: string,
  targetPath: string,
  variables: Record<string, any> = {}
): Promise<void> {
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template path does not exist: ${templatePath}`)
  }

  await fs.ensureDir(path.dirname(targetPath))
  
  const stat = await fs.stat(templatePath)
  
  if (stat.isDirectory()) {
    await fs.ensureDir(targetPath)
    const files = await fs.readdir(templatePath)
    
    for (const file of files) {
      const srcPath = path.join(templatePath, file)
      const destPath = path.join(targetPath, file)
      await copyTemplate(srcPath, destPath, variables)
    }
  } else {
    // 处理模板文件
    if (path.extname(templatePath) === '.ejs') {
      const ejs = await import('ejs')
      const content = await fs.readFile(templatePath, 'utf8')
      const rendered = ejs.render(content, variables)
      const finalPath = targetPath.replace(/\.ejs$/, '')
      await fs.writeFile(finalPath, rendered)
    } else {
      await fs.copy(templatePath, targetPath)
    }
  }
}

/**
 * 日志工具
 */
export const logger = {
  info: (message: string) => console.log(chalk.blue('ℹ'), message),
  success: (message: string) => console.log(chalk.green('✓'), message),
  warning: (message: string) => console.log(chalk.yellow('⚠'), message),
  error: (message: string) => console.log(chalk.red('✗'), message),
  debug: (message: string) => {
    if (process.env.DEBUG) {
      console.log(chalk.gray('🐛'), message)
    }
  }
}

/**
 * 延迟函数
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 获取随机端口
 */
export function getRandomPort(min = 3000, max = 9999): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 检查端口是否可用
 */
export async function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const net = require('net')
    const server = net.createServer()
    
    server.listen(port, () => {
      server.once('close', () => resolve(true))
      server.close()
    })
    
    server.on('error', () => resolve(false))
  })
}

/**
 * 获取可用端口
 */
export async function getAvailablePort(preferredPort = 3000): Promise<number> {
  let port = preferredPort
  while (!(await isPortAvailable(port))) {
    port++
  }
  return port
}