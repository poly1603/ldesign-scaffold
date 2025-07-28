import { simpleGit } from 'simple-git'
import path from 'path'
import fs from 'fs-extra'
import { CommandResult, GitSubmodule } from '../types/index.js'
import { logger } from '../utils/index.js'

export class SubmoduleManager {
  /**
   * 列出所有子模块
   */
  async list(projectPath: string): Promise<CommandResult<GitSubmodule[]>> {
    try {
      const git = simpleGit(projectPath)
      
      // 检查是否存在 .gitmodules 文件
      const gitmodulesPath = path.join(projectPath, '.gitmodules')
      if (!await fs.pathExists(gitmodulesPath)) {
        return {
          success: true,
          message: '没有找到子模块',
          data: []
        }
      }
      
      // 读取 .gitmodules 文件
      const gitmodulesContent = await fs.readFile(gitmodulesPath, 'utf8')
      const submodules = this.parseGitmodules(gitmodulesContent)
      
      // 获取每个子模块的状态
      for (const submodule of submodules) {
        try {
          const status = await git.subModule(['status', submodule.path])
          submodule.status = this.parseSubmoduleStatus(status)
        } catch (error) {
          submodule.status = 'error'
          submodule.error = error instanceof Error ? error.message : String(error)
        }
      }
      
      return {
        success: true,
        message: '获取子模块列表成功',
        data: submodules
      }
    } catch (error) {
      const message = `获取子模块列表失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 添加子模块
   */
  async add(projectPath: string, url: string, subPath: string, branch?: string): Promise<CommandResult> {
    try {
      const git = simpleGit(projectPath)
      
      // 检查路径是否已存在
      const targetPath = path.join(projectPath, subPath)
      if (await fs.pathExists(targetPath)) {
        return {
          success: false,
          message: `路径已存在: ${subPath}`,
          error: new Error(`路径已存在: ${subPath}`)
        }
      }
      
      // 添加子模块
      const args = ['submodule', 'add']
      if (branch) {
        args.push('-b', branch)
      }
      args.push(url, subPath)
      
      await git.raw(args)
      
      logger.success(`子模块添加成功: ${subPath} -> ${url}`)
      
      return {
        success: true,
        message: '子模块添加成功',
        data: {
          url,
          path: subPath,
          branch
        }
      }
    } catch (error) {
      const message = `添加子模块失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 删除子模块
   */
  async remove(projectPath: string, subPath: string): Promise<CommandResult> {
    try {
      const git = simpleGit(projectPath)
      
      // 检查子模块是否存在
      const gitmodulesPath = path.join(projectPath, '.gitmodules')
      if (!await fs.pathExists(gitmodulesPath)) {
        return {
          success: false,
          message: '没有找到子模块配置',
          error: new Error('没有找到子模块配置')
        }
      }
      
      const targetPath = path.join(projectPath, subPath)
      if (!await fs.pathExists(targetPath)) {
        return {
          success: false,
          message: `子模块不存在: ${subPath}`,
          error: new Error(`子模块不存在: ${subPath}`)
        }
      }
      
      // 1. 取消初始化子模块
      await git.raw(['submodule', 'deinit', '-f', subPath])
      
      // 2. 从 Git 中删除子模块
      await git.raw(['rm', '-f', subPath])
      
      // 3. 删除 .git/modules 中的子模块目录
      const gitModulesPath = path.join(projectPath, '.git', 'modules', subPath)
      if (await fs.pathExists(gitModulesPath)) {
        await fs.remove(gitModulesPath)
      }
      
      logger.success(`子模块删除成功: ${subPath}`)
      
      return {
        success: true,
        message: '子模块删除成功',
        data: { path: subPath }
      }
    } catch (error) {
      const message = `删除子模块失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 初始化子模块
   */
  async init(projectPath: string, subPath?: string): Promise<CommandResult> {
    try {
      const git = simpleGit(projectPath)
      
      const args = ['submodule', 'init']
      if (subPath) {
        args.push(subPath)
      }
      
      await git.raw(args)
      
      logger.success(`子模块初始化成功${subPath ? `: ${subPath}` : ''}`)
      
      return {
        success: true,
        message: '子模块初始化成功',
        data: { path: subPath }
      }
    } catch (error) {
      const message = `初始化子模块失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 更新子模块
   */
  async update(projectPath: string, subPath?: string, options?: {
    init?: boolean
    recursive?: boolean
    remote?: boolean
  }): Promise<CommandResult> {
    try {
      const git = simpleGit(projectPath)
      
      const args = ['submodule', 'update']
      
      if (options?.init) {
        args.push('--init')
      }
      
      if (options?.recursive) {
        args.push('--recursive')
      }
      
      if (options?.remote) {
        args.push('--remote')
      }
      
      if (subPath) {
        args.push(subPath)
      }
      
      await git.raw(args)
      
      logger.success(`子模块更新成功${subPath ? `: ${subPath}` : ''}`)
      
      return {
        success: true,
        message: '子模块更新成功',
        data: { path: subPath, options }
      }
    } catch (error) {
      const message = `更新子模块失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 同步子模块 URL
   */
  async sync(projectPath: string, subPath?: string): Promise<CommandResult> {
    try {
      const git = simpleGit(projectPath)
      
      const args = ['submodule', 'sync']
      if (subPath) {
        args.push(subPath)
      }
      
      await git.raw(args)
      
      logger.success(`子模块同步成功${subPath ? `: ${subPath}` : ''}`)
      
      return {
        success: true,
        message: '子模块同步成功',
        data: { path: subPath }
      }
    } catch (error) {
      const message = `同步子模块失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 获取子模块状态
   */
  async status(projectPath: string, subPath?: string): Promise<CommandResult> {
    try {
      const git = simpleGit(projectPath)
      
      const args = ['submodule', 'status']
      if (subPath) {
        args.push(subPath)
      }
      
      const result = await git.raw(args)
      const statusInfo = this.parseSubmoduleStatusOutput(result)
      
      return {
        success: true,
        message: '获取子模块状态成功',
        data: statusInfo
      }
    } catch (error) {
      const message = `获取子模块状态失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 切换子模块分支
   */
  async checkout(projectPath: string, subPath: string, branch: string): Promise<CommandResult> {
    try {
      const submodulePath = path.join(projectPath, subPath)
      
      // 检查子模块目录是否存在
      if (!await fs.pathExists(submodulePath)) {
        return {
          success: false,
          message: `子模块目录不存在: ${subPath}`,
          error: new Error(`子模块目录不存在: ${subPath}`)
        }
      }
      
      const git = simpleGit(submodulePath)
      await git.checkout(branch)
      
      logger.success(`子模块分支切换成功: ${subPath} -> ${branch}`)
      
      return {
        success: true,
        message: '子模块分支切换成功',
        data: { path: subPath, branch }
      }
    } catch (error) {
      const message = `切换子模块分支失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 更新子模块 URL
   */
  async updateUrl(projectPath: string, subPath: string, newUrl: string): Promise<CommandResult> {
    try {
      const git = simpleGit(projectPath)
      
      // 更新 .gitmodules 文件中的 URL
      await git.raw(['config', '-f', '.gitmodules', `submodule.${subPath}.url`, newUrl])
      
      // 同步到 .git/config
      await git.raw(['submodule', 'sync', subPath])
      
      logger.success(`子模块 URL 更新成功: ${subPath} -> ${newUrl}`)
      
      return {
        success: true,
        message: '子模块 URL 更新成功',
        data: { path: subPath, url: newUrl }
      }
    } catch (error) {
      const message = `更新子模块 URL 失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 解析 .gitmodules 文件
   */
  private parseGitmodules(content: string): GitSubmodule[] {
    const submodules: GitSubmodule[] = []
    const lines = content.split('\n')
    let currentSubmodule: Partial<GitSubmodule> | null = null
    
    for (const line of lines) {
      const trimmed = line.trim()
      
      if (trimmed.startsWith('[submodule')) {
        // 保存上一个子模块
        if (currentSubmodule && currentSubmodule.name && currentSubmodule.path && currentSubmodule.url) {
          submodules.push(currentSubmodule as GitSubmodule)
        }
        
        // 开始新的子模块
        const nameMatch = trimmed.match(/\[submodule "([^"]+)"\]/)
        if (nameMatch) {
          currentSubmodule = {
            name: nameMatch[1],
            path: '',
            url: '',
            branch: 'master',
            status: 'unknown'
          }
        }
      } else if (currentSubmodule && trimmed.includes('=')) {
        const [key, value] = trimmed.split('=').map(s => s.trim())
        
        switch (key) {
          case 'path':
            currentSubmodule.path = value
            break
          case 'url':
            currentSubmodule.url = value
            break
          case 'branch':
            currentSubmodule.branch = value
            break
        }
      }
    }
    
    // 保存最后一个子模块
    if (currentSubmodule && currentSubmodule.name && currentSubmodule.path && currentSubmodule.url) {
      submodules.push(currentSubmodule as GitSubmodule)
    }
    
    return submodules
  }

  /**
   * 解析子模块状态
   */
  private parseSubmoduleStatus(status: string): string {
    const trimmed = status.trim()
    
    if (trimmed.startsWith('-')) {
      return 'not-initialized'
    } else if (trimmed.startsWith('+')) {
      return 'modified'
    } else if (trimmed.startsWith('U')) {
      return 'conflict'
    } else if (trimmed.startsWith(' ')) {
      return 'up-to-date'
    } else {
      return 'unknown'
    }
  }

  /**
   * 解析子模块状态输出
   */
  private parseSubmoduleStatusOutput(output: string): any {
    const lines = output.split('\n').filter(line => line.trim())
    const statusInfo: any = {}
    
    lines.forEach(line => {
      const trimmed = line.trim()
      if (trimmed) {
        const parts = trimmed.split(' ')
        if (parts.length >= 2) {
          const status = this.parseSubmoduleStatus(trimmed)
          const commit = parts[0].replace(/^[-+U ]/, '')
          const path = parts[1]
          
          statusInfo[path] = {
            status,
            commit,
            path
          }
        }
      }
    })
    
    return statusInfo
  }
}