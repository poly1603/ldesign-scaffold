import { apiRequest } from './index'
import type { 
  EnvironmentCheckResult,
  GitConfig,
  DockerConfig,
  NginxConfig,
  FontConfig,
  IconConfig,
  ApiResponse
} from '@/types'

export const toolsApi = {
  // Environment check
  checkEnvironment: () => {
    return apiRequest.get<EnvironmentCheckResult>('/tools/environment/check')
  },
  
  // Git management
  getGitConfig: () => {
    return apiRequest.get<GitConfig>('/tools/git/config')
  },
  
  setGitConfig: (config: GitConfig) => {
    return apiRequest.post<GitConfig>('/tools/git/config', config)
  },
  
  initGitRepo: (projectPath: string) => {
    return apiRequest.post('/tools/git/init', { projectPath })
  },
  
  addGitRemote: (projectPath: string, name: string, url: string) => {
    return apiRequest.post('/tools/git/remote', { projectPath, name, url })
  },
  
  // Docker configuration
  generateDockerfile: (config: DockerConfig) => {
    return apiRequest.post<{ content: string }>('/tools/docker/dockerfile', config)
  },
  
  generateDockerCompose: (config: DockerConfig) => {
    return apiRequest.post<{ content: string }>('/tools/docker/compose', config)
  },
  
  // Nginx configuration
  generateNginxConfig: (config: NginxConfig) => {
    return apiRequest.post<{ content: string }>('/tools/nginx/config', config)
  },
  
  // Font management
  optimizeFont: (config: FontConfig) => {
    return apiRequest.post<{
      originalSize: number
      optimizedSize: number
      compressionRatio: number
      outputPath: string
    }>('/tools/font/optimize', config)
  },
  
  getFontInfo: (fontPath: string) => {
    return apiRequest.get<{
      name: string
      family: string
      style: string
      weight: number
      size: number
      glyphs: number
    }>('/tools/font/info', { params: { path: fontPath } })
  },
  
  // Icon management
  generateIconFont: (config: IconConfig) => {
    return apiRequest.post<{
      fontPath: string
      cssPath: string
      htmlPath: string
      icons: Array<{
        name: string
        unicode: string
        className: string
      }>
    }>('/tools/icon/font', config)
  },
  
  generateIconComponents: (config: IconConfig) => {
    return apiRequest.post<{
      components: Array<{
        name: string
        path: string
        content: string
      }>
      indexPath: string
    }>('/tools/icon/components', config)
  },
  
  optimizeSvg: (svgPath: string) => {
    return apiRequest.post<{
      originalSize: number
      optimizedSize: number
      compressionRatio: number
      content: string
    }>('/tools/icon/optimize', { svgPath })
  },
  
  // System information
  getSystemInfo: () => {
    return apiRequest.get<{
      platform: string
      arch: string
      nodeVersion: string
      npmVersion: string
      gitVersion: string
      dockerVersion?: string
      memory: {
        total: number
        used: number
        free: number
      }
      disk: {
        total: number
        used: number
        free: number
      }
    }>('/tools/system/info')
  },
  
  // Package manager operations
  detectPackageManager: (projectPath: string) => {
    return apiRequest.get<{
      manager: 'npm' | 'yarn' | 'pnpm'
      version: string
      lockFile: string
    }>('/tools/package/detect', { params: { path: projectPath } })
  },
  
  installPackages: (projectPath: string, packages: string[], dev = false) => {
    return apiRequest.post('/tools/package/install', {
      projectPath,
      packages,
      dev
    })
  },
  
  updatePackages: (projectPath: string, packages?: string[]) => {
    return apiRequest.post('/tools/package/update', {
      projectPath,
      packages
    })
  },
  
  // Code quality tools
  runLinter: (projectPath: string, fix = false) => {
    return apiRequest.post<{
      output: string
      errors: number
      warnings: number
      fixed: number
    }>('/tools/quality/lint', { projectPath, fix })
  },
  
  formatCode: (projectPath: string, files?: string[]) => {
    return apiRequest.post<{
      formatted: string[]
      errors: string[]
    }>('/tools/quality/format', { projectPath, files })
  },
  
  // Build and deployment
  buildProject: (projectPath: string, mode = 'production') => {
    return apiRequest.post<{
      success: boolean
      output: string
      buildTime: number
      outputPath: string
      assets: Array<{
        name: string
        size: number
        type: string
      }>
    }>('/tools/build', { projectPath, mode })
  },
  
  // File operations
  readFile: (filePath: string) => {
    return apiRequest.get<{
      content: string
      encoding: string
      size: number
      modified: string
    }>('/tools/file/read', { params: { path: filePath } })
  },
  
  writeFile: (filePath: string, content: string) => {
    return apiRequest.post('/tools/file/write', { filePath, content })
  },
  
  deleteFile: (filePath: string) => {
    return apiRequest.delete('/tools/file/delete', { params: { path: filePath } })
  },
  
  createDirectory: (dirPath: string) => {
    return apiRequest.post('/tools/file/mkdir', { dirPath })
  },
  
  listDirectory: (dirPath: string) => {
    return apiRequest.get<{
      files: Array<{
        name: string
        type: 'file' | 'directory'
        size?: number
        modified: string
        path: string
      }>
      total: number
    }>('/tools/file/list', { params: { path: dirPath } })
  },
  
  // Template operations
  renderTemplate: (templatePath: string, variables: Record<string, any>) => {
    return apiRequest.post<{
      content: string
      variables: Record<string, any>
    }>('/tools/template/render', { templatePath, variables })
  },
  
  validateTemplate: (templatePath: string) => {
    return apiRequest.post<{
      valid: boolean
      errors: string[]
      variables: Array<{
        name: string
        type: string
        required: boolean
        defaultValue?: any
      }>
    }>('/tools/template/validate', { templatePath })
  }
}
