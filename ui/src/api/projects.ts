import { apiRequest } from './index'
import type { 
  Project, 
  CreateProjectOptions, 
  CreateProjectResult,
  ProjectStatistics,
  ApiResponse,
  PaginatedResponse
} from '@/types'

export const projectApi = {
  // Get all projects
  getProjects: (params?: {
    page?: number
    limit?: number
    search?: string
    type?: string
    status?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) => {
    return apiRequest.get<PaginatedResponse<Project>>('/projects', { params })
  },
  
  // Get project by ID
  getProject: (id: string) => {
    return apiRequest.get<Project>(`/projects/${id}`)
  },
  
  // Create new project
  createProject: (options: CreateProjectOptions) => {
    return apiRequest.post<CreateProjectResult>('/projects', options)
  },
  
  // Update project
  updateProject: (id: string, updates: Partial<Project>) => {
    return apiRequest.put<Project>(`/projects/${id}`, updates)
  },
  
  // Delete project
  deleteProject: (id: string) => {
    return apiRequest.delete(`/projects/${id}`)
  },
  
  // Clone project
  cloneProject: (id: string, newName: string) => {
    return apiRequest.post<Project>(`/projects/${id}/clone`, { name: newName })
  },
  
  // Archive project
  archiveProject: (id: string) => {
    return apiRequest.patch<Project>(`/projects/${id}/archive`)
  },
  
  // Restore project
  restoreProject: (id: string) => {
    return apiRequest.patch<Project>(`/projects/${id}/restore`)
  },
  
  // Get project files
  getProjectFiles: (id: string, path?: string) => {
    return apiRequest.get<{
      files: Array<{
        name: string
        type: 'file' | 'directory'
        size?: number
        modified?: string
        path: string
      }>
      currentPath: string
    }>(`/projects/${id}/files`, { params: { path } })
  },
  
  // Get file content
  getFileContent: (id: string, filePath: string) => {
    return apiRequest.get<{
      content: string
      encoding: string
      size: number
      modified: string
    }>(`/projects/${id}/files/content`, { params: { path: filePath } })
  },
  
  // Update file content
  updateFileContent: (id: string, filePath: string, content: string) => {
    return apiRequest.put(`/projects/${id}/files/content`, {
      path: filePath,
      content
    })
  },
  
  // Get project dependencies
  getDependencies: (id: string) => {
    return apiRequest.get<{
      dependencies: Record<string, string>
      devDependencies: Record<string, string>
      outdated: Array<{
        name: string
        current: string
        wanted: string
        latest: string
        type: 'dependencies' | 'devDependencies'
      }>
    }>(`/projects/${id}/dependencies`)
  },
  
  // Install dependencies
  installDependencies: (id: string, packages?: string[]) => {
    return apiRequest.post(`/projects/${id}/dependencies/install`, { packages })
  },
  
  // Update dependencies
  updateDependencies: (id: string, packages?: string[]) => {
    return apiRequest.post(`/projects/${id}/dependencies/update`, { packages })
  },
  
  // Remove dependencies
  removeDependencies: (id: string, packages: string[], dev = false) => {
    return apiRequest.post(`/projects/${id}/dependencies/remove`, { packages, dev })
  },
  
  // Get project scripts
  getScripts: (id: string) => {
    return apiRequest.get<Record<string, string>>(`/projects/${id}/scripts`)
  },
  
  // Run project script
  runScript: (id: string, script: string) => {
    return apiRequest.post<{
      output: string
      exitCode: number
      duration: number
    }>(`/projects/${id}/scripts/${script}`)
  },
  
  // Get project logs
  getLogs: (id: string, params?: {
    type?: 'build' | 'dev' | 'test' | 'all'
    limit?: number
    offset?: number
  }) => {
    return apiRequest.get<{
      logs: Array<{
        id: string
        type: string
        message: string
        level: 'info' | 'warn' | 'error'
        timestamp: string
      }>
      total: number
    }>(`/projects/${id}/logs`, { params })
  },
  
  // Clear project logs
  clearLogs: (id: string) => {
    return apiRequest.delete(`/projects/${id}/logs`)
  },
  
  // Get project statistics
  getStatistics: () => {
    return apiRequest.get<ProjectStatistics>('/projects/statistics')
  },
  
  // Export project
  exportProject: (id: string, format: 'zip' | 'tar') => {
    return apiRequest.download(`/projects/${id}/export`, undefined, {
      params: { format }
    })
  },
  
  // Import project
  importProject: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiRequest.upload<Project>('/projects/import', formData)
  },
  
  // Validate project name
  validateName: (name: string) => {
    return apiRequest.post<{
      valid: boolean
      message?: string
    }>('/projects/validate-name', { name })
  },
  
  // Get project templates
  getTemplates: () => {
    return apiRequest.get<Array<{
      name: string
      description: string
      type: string
      features: string[]
      preview?: {
        files: string[]
        structure: any
      }
    }>>('/projects/templates')
  },
  
  // Preview project structure
  previewStructure: (config: CreateProjectOptions['config']) => {
    return apiRequest.post<{
      files: Array<{
        path: string
        type: 'file' | 'directory'
        content?: string
      }>
      structure: any
    }>('/projects/preview', { config })
  }
}
