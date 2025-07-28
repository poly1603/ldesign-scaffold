// Project types
export type ProjectType = 
  | 'vue3-project'
  | 'vue2-project' 
  | 'react-project'
  | 'nodejs-api'
  | 'vue3-component'

export type BuildTool = 'vite' | 'rollup' | 'webpack' | 'tsup'

export type PackageManager = 'npm' | 'yarn' | 'pnpm'

export type ProjectFeature = 
  | 'typescript'
  | 'eslint'
  | 'prettier'
  | 'husky'
  | 'commitlint'
  | 'vitest'
  | 'cypress'
  | 'playwright'
  | 'tailwindcss'
  | 'sass'
  | 'less'
  | 'vitepress'
  | 'storybook'
  | 'docker'
  | 'nginx'
  | 'github-actions'
  | 'router'
  | 'store'
  | 'i18n'
  | 'ui-library'
  | 'iconfont'
  | 'fontmin'
  | 'pwa'

export interface ProjectConfig {
  name: string
  description?: string
  author?: string
  version?: string
  license?: string
  type: ProjectType
  buildTool: BuildTool
  packageManager: PackageManager
  features: ProjectFeature[]
  template?: {
    paths?: string[]
    variables?: Record<string, any>
  }
  tools?: {
    git?: {
      hooks?: boolean
      commitlint?: boolean
      husky?: boolean
      flow?: boolean
    }
    docker?: {
      enabled?: boolean
      baseImage?: string
      port?: number
      volumes?: string[]
      environment?: Record<string, string>
    }
    nginx?: {
      enabled?: boolean
      ssl?: boolean
      domain?: string
      port?: number
      proxy?: {
        enabled: boolean
        target: string
        path: string
      }
    }
  }
}

export interface Project {
  id: string
  name: string
  description?: string
  author?: string
  version: string
  license: string
  type: ProjectType
  buildTool: BuildTool
  packageManager: PackageManager
  features: ProjectFeature[]
  path: string
  status: 'active' | 'archived' | 'error'
  createdAt: string
  updatedAt: string
  lastOpenedAt?: string
  config?: ProjectConfig
  scripts?: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

export interface CreateProjectOptions {
  targetDir: string
  config: ProjectConfig
  variables?: Record<string, any>
  overwrite?: boolean
  install?: boolean
  packageManager?: PackageManager
}

export interface CreateProjectResult {
  success: boolean
  projectPath?: string
  error?: {
    code: string
    message: string
    details?: any
  }
  files?: string[]
  duration?: number
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  error?: {
    code: string
    message: string
    details?: any
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}

// Environment check types
export interface EnvironmentCheck {
  name: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  details?: any
  fixable?: boolean
}

export interface EnvironmentCheckResult {
  overall: 'pass' | 'fail' | 'warning'
  checks: EnvironmentCheck[]
  summary: {
    total: number
    passed: number
    failed: number
    warnings: number
  }
}

// Tool types
export interface GitConfig {
  name?: string
  email?: string
  remotes?: Array<{
    name: string
    url: string
  }>
  hooks?: boolean
  commitlint?: boolean
}

export interface DockerConfig {
  enabled: boolean
  baseImage: string
  port: number
  volumes: string[]
  environment: Record<string, string>
  compose?: boolean
}

export interface NginxConfig {
  enabled: boolean
  ssl: boolean
  domain: string
  port: number
  proxy?: {
    enabled: boolean
    target: string
    path: string
  }
  staticFiles?: {
    enabled: boolean
    path: string
  }
}

// Font and icon types
export interface FontConfig {
  src: string
  dest: string
  subset?: {
    autoDetect: boolean
    text?: string
    chinese?: 'common' | 'standard' | 'full'
  }
  compression?: {
    gzip: boolean
    brotli: boolean
    level: number
  }
  formats: Array<'woff' | 'woff2' | 'ttf' | 'otf'>
}

export interface IconConfig {
  svgDir: string
  outputDir: string
  component?: {
    vue: boolean
    react: boolean
    typescript: boolean
    prefix: string
  }
  font?: {
    enabled: boolean
    fontName: string
    formats: Array<'woff' | 'woff2' | 'ttf'>
    classPrefix: string
  }
}

// WebSocket event types
export interface SocketEvent {
  type: string
  data: any
  timestamp: number
}

export interface ProjectProgress {
  projectId: string
  step: string
  progress: number
  message: string
  completed: boolean
  error?: string
}

// UI types
export interface MenuItem {
  key: string
  label: string
  icon?: string
  path?: string
  children?: MenuItem[]
  disabled?: boolean
  hidden?: boolean
}

export interface BreadcrumbItem {
  title: string
  path?: string
}

export interface NotificationItem {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
  timestamp: number
  read: boolean
  actions?: Array<{
    label: string
    action: () => void
  }>
}

// Form types
export interface FormRule {
  required?: boolean
  message?: string
  trigger?: 'blur' | 'change'
  validator?: (rule: any, value: any, callback: any) => void
}

export interface FormField {
  key: string
  label: string
  type: 'input' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'switch'
  placeholder?: string
  options?: Array<{
    label: string
    value: any
    disabled?: boolean
  }>
  rules?: FormRule[]
  defaultValue?: any
  disabled?: boolean
  hidden?: boolean
  description?: string
}

// Template types
export interface Template {
  name: string
  description: string
  type: ProjectType
  version: string
  author: string
  path: string
  features: ProjectFeature[]
  variables?: Record<string, any>
  preview?: {
    files: string[]
    structure: any
  }
}

export interface TemplateVariable {
  key: string
  type: 'string' | 'boolean' | 'number' | 'array' | 'object'
  label: string
  description?: string
  defaultValue?: any
  required?: boolean
  options?: any[]
  validation?: {
    pattern?: string
    min?: number
    max?: number
    message?: string
  }
}

// Statistics types
export interface ProjectStatistics {
  total: number
  todayCreated: number
  typeStats: Record<string, number>
  statusStats: Record<string, number>
  recentActivity: Array<{
    type: 'created' | 'updated' | 'deleted'
    projectName: string
    timestamp: string
  }>
}
