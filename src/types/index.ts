// 项目类型定义
export type ProjectType = 'vue3-project' | 'vue3-component' | 'nodejs-api' | 'custom'

// 构建工具类型
export type BuildTool = 'vite' | 'rollup' | 'webpack' | 'tsup'

// 包管理器类型
export type PackageManager = 'npm' | 'yarn' | 'pnpm'

// Git配置
export interface GitConfig {
  repository?: string
  branch?: string
  username?: string
  email?: string
  autoCommit?: boolean
}

// 项目配置接口
export interface ProjectConfig {
  name: string
  type: ProjectType
  description?: string
  author?: string
  version?: string
  license?: string
  packageManager: PackageManager
  buildTool: BuildTool
  features: ProjectFeature[]
  git?: GitConfig
  docker?: DockerConfig
  nginx?: NginxConfig
}

// 项目特性
export type ProjectFeature = 
  | 'typescript'
  | 'eslint'
  | 'prettier'
  | 'husky'
  | 'commitlint'
  | 'jest'
  | 'vitest'
  | 'cypress'
  | 'playwright'
  | 'storybook'
  | 'tailwindcss'
  | 'sass'
  | 'less'
  | 'pwa'
  | 'i18n'
  | 'router'
  | 'store'
  | 'ui-library'
  | 'vitepress'
  | 'docker'
  | 'nginx'
  | 'github-actions'
  | 'gitlab-ci'
  | 'iconfont'
  | 'fontmin'

// Docker配置
export interface DockerConfig {
  enabled: boolean
  baseImage?: string
  port?: number
  environment?: Record<string, string>
  volumes?: string[]
  compose?: boolean
}

// Nginx配置
export interface NginxConfig {
  enabled: boolean
  port?: number
  ssl?: boolean
  proxy?: ProxyConfig[]
  staticPath?: string
}

// 代理配置
export interface ProxyConfig {
  path: string
  target: string
  changeOrigin?: boolean
  rewrite?: Record<string, string>
}

// 模板变量
export interface TemplateVariables {
  projectName: string
  projectDescription: string
  author: string
  version: string
  license: string
  [key: string]: any
}

// 脚手架选项
export interface ScaffoldOptions {
  targetDir: string
  config: ProjectConfig
  variables: TemplateVariables
  overwrite?: boolean
  skipInstall?: boolean
  skipGit?: boolean
  verbose?: boolean
}

// 命令执行结果
export interface CommandResult {
  success: boolean
  message: string
  data?: any
  error?: Error
}

// IDE类型
export type IDEType = 'vscode' | 'webstorm' | 'sublime' | 'atom' | 'vim' | 'emacs'

// IDE配置
export interface IDEConfig {
  type: IDEType
  path: string
  available: boolean
  version?: string
}

// 开发环境检测结果
export interface DevEnvironment {
  node: {
    version: string
    path: string
  }
  packageManagers: {
    npm?: { version: string; path: string }
    yarn?: { version: string; path: string }
    pnpm?: { version: string; path: string }
  }
  git?: {
    version: string
    path: string
    config: {
      username?: string
      email?: string
    }
  }
  docker?: {
    version: string
    path: string
    running: boolean
  }
  ides: IDEConfig[]
}

// Git操作类型
export type GitOperation = 
  | 'clone'
  | 'pull'
  | 'push'
  | 'commit'
  | 'branch'
  | 'merge'
  | 'tag'
  | 'submodule'

// Git子模块配置
export interface GitSubmodule {
  name: string
  path: string
  url: string
  branch?: string
}

// 可视化界面配置
export interface UIConfig {
  theme: 'light' | 'dark' | 'auto'
  language: 'zh-CN' | 'en-US'
  port: number
  autoOpen: boolean
}

// 插件接口
export interface Plugin {
  name: string
  version: string
  description: string
  install: (config: ProjectConfig) => Promise<void>
  uninstall: (config: ProjectConfig) => Promise<void>
}

// 错误类型
export class ScaffoldError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ScaffoldError'
  }
}