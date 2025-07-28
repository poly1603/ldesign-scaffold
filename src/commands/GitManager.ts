import { simpleGit, SimpleGit, StatusResult, LogResult } from 'simple-git'
import path from 'path'
import fs from 'fs-extra'
import { CommandResult, GitConfig } from '../types/index.js'
import { logger } from '../utils/index.js'

export class GitManager {
  private git: SimpleGit

  constructor(workingDir?: string) {
    this.git = simpleGit(workingDir)
  }

  /**
   * 初始化 Git 仓库
   */
  async init(projectPath: string, config?: GitConfig): Promise<CommandResult> {
    try {
      const git = simpleGit(projectPath)
      
      // 初始化仓库
      await git.init()
      
      // 设置用户信息
      if (config?.username) {
        await git.addConfig('user.name', config.username)
      }
      if (config?.email) {
        await git.addConfig('user.email', config.email)
      }
      
      // 设置默认分支
      if (config?.defaultBranch) {
        await git.checkoutLocalBranch(config.defaultBranch)
      }
      
      // 添加远程仓库
      if (config?.remoteUrl) {
        await git.addRemote('origin', config.remoteUrl)
      }
      
      logger.success(`Git 仓库初始化成功: ${projectPath}`)
      
      return {
        success: true,
        message: 'Git 仓库初始化成功',
        data: { projectPath }
      }
    } catch (error) {
      const message = `Git 仓库初始化失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 获取仓库状态
   */
  async getStatus(projectPath: string): Promise<CommandResult<StatusResult>> {
    try {
      const git = simpleGit(projectPath)
      const status = await git.status()
      
      return {
        success: true,
        message: '获取仓库状态成功',
        data: status
      }
    } catch (error) {
      const message = `获取仓库状态失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 添加文件到暂存区
   */
  async add(projectPath: string, files: string[] = ['.']): Promise<CommandResult> {
    try {
      const git = simpleGit(projectPath)
      await git.add(files)
      
      logger.success(`文件添加到暂存区成功: ${files.join(', ')}`)
      
      return {
        success: true,
        message: '文件添加到暂存区成功',
        data: { files }
      }
    } catch (error) {
      const message = `添加文件到暂存区失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 提交更改
   */
  async commit(projectPath: string, message: string, files?: string[]): Promise<CommandResult> {
    try {
      const git = simpleGit(projectPath)
      
      // 如果指定了文件，先添加到暂存区
      if (files && files.length > 0) {
        await git.add(files)
      }
      
      const result = await git.commit(message)
      
      logger.success(`提交成功: ${message}`)
      
      return {
        success: true,
        message: '提交成功',
        data: { 
          message,
          hash: result.commit,
          files: files || []
        }
      }
    } catch (error) {
      const message = `提交失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 推送到远程仓库
   */
  async push(projectPath: string, remote: string = 'origin', branch?: string): Promise<CommandResult> {
    try {
      const git = simpleGit(projectPath)
      
      if (branch) {
        await git.push(remote, branch)
      } else {
        await git.push()
      }
      
      logger.success(`推送成功: ${remote}${branch ? `/${branch}` : ''}`)
      
      return {
        success: true,
        message: '推送成功',
        data: { remote, branch }
      }
    } catch (error) {
      const message = `推送失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 从远程仓库拉取
   */
  async pull(projectPath: string, remote: string = 'origin', branch?: string): Promise<CommandResult> {
    try {
      const git = simpleGit(projectPath)
      
      if (branch) {
        await git.pull(remote, branch)
      } else {
        await git.pull()
      }
      
      logger.success(`拉取成功: ${remote}${branch ? `/${branch}` : ''}`)
      
      return {
        success: true,
        message: '拉取成功',
        data: { remote, branch }
      }
    } catch (error) {
      const message = `拉取失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 创建分支
   */
  async createBranch(projectPath: string, branchName: string, checkout: boolean = true): Promise<CommandResult> {
    try {
      const git = simpleGit(projectPath)
      
      if (checkout) {
        await git.checkoutLocalBranch(branchName)
      } else {
        await git.branch([branchName])
      }
      
      logger.success(`分支创建成功: ${branchName}`)
      
      return {
        success: true,
        message: '分支创建成功',
        data: { branchName, checkout }
      }
    } catch (error) {
      const message = `分支创建失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 切换分支
   */
  async checkout(projectPath: string, branchName: string): Promise<CommandResult> {
    try {
      const git = simpleGit(projectPath)
      await git.checkout(branchName)
      
      logger.success(`分支切换成功: ${branchName}`)
      
      return {
        success: true,
        message: '分支切换成功',
        data: { branchName }
      }
    } catch (error) {
      const message = `分支切换失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 获取分支列表
   */
  async getBranches(projectPath: string): Promise<CommandResult> {
    try {
      const git = simpleGit(projectPath)
      const branches = await git.branch()
      
      return {
        success: true,
        message: '获取分支列表成功',
        data: {
          current: branches.current,
          all: branches.all,
          local: branches.all.filter(branch => !branch.startsWith('remotes/')),
          remote: branches.all.filter(branch => branch.startsWith('remotes/'))
        }
      }
    } catch (error) {
      const message = `获取分支列表失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 获取提交历史
   */
  async getLog(projectPath: string, options?: { maxCount?: number; from?: string; to?: string }): Promise<CommandResult<LogResult>> {
    try {
      const git = simpleGit(projectPath)
      const logOptions: Record<string, any> = {}
      
      if (options?.maxCount) {
        logOptions.maxCount = options.maxCount
      }
      if (options?.from && options?.to) {
        logOptions.from = options.from
        logOptions.to = options.to
      }
      
      const log = await git.log(logOptions)
      
      return {
        success: true,
        message: '获取提交历史成功',
        data: log
      }
    } catch (error) {
      const message = `获取提交历史失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 获取远程仓库列表
   */
  async getRemotes(projectPath: string): Promise<CommandResult> {
    try {
      const git = simpleGit(projectPath)
      const remotes = await git.getRemotes(true)
      
      return {
        success: true,
        message: '获取远程仓库列表成功',
        data: remotes
      }
    } catch (error) {
      const message = `获取远程仓库列表失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 添加远程仓库
   */
  async addRemote(projectPath: string, name: string, url: string): Promise<CommandResult> {
    try {
      const git = simpleGit(projectPath)
      await git.addRemote(name, url)
      
      logger.success(`远程仓库添加成功: ${name} -> ${url}`)
      
      return {
        success: true,
        message: '远程仓库添加成功',
        data: { name, url }
      }
    } catch (error) {
      const message = `远程仓库添加失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 删除远程仓库
   */
  async removeRemote(projectPath: string, name: string): Promise<CommandResult> {
    try {
      const git = simpleGit(projectPath)
      await git.removeRemote(name)
      
      logger.success(`远程仓库删除成功: ${name}`)
      
      return {
        success: true,
        message: '远程仓库删除成功',
        data: { name }
      }
    } catch (error) {
      const message = `远程仓库删除失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 合并分支
   */
  async merge(projectPath: string, branchName: string): Promise<CommandResult> {
    try {
      const git = simpleGit(projectPath)
      await git.merge([branchName])
      
      logger.success(`分支合并成功: ${branchName}`)
      
      return {
        success: true,
        message: '分支合并成功',
        data: { branchName }
      }
    } catch (error) {
      const message = `分支合并失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 重置到指定提交
   */
  async reset(projectPath: string, mode: 'soft' | 'mixed' | 'hard', commit?: string): Promise<CommandResult> {
    try {
      const git = simpleGit(projectPath)
      const resetOptions = [`--${mode}`]
      
      if (commit) {
        resetOptions.push(commit)
      }
      
      await git.reset(resetOptions)
      
      logger.success(`重置成功: ${mode}${commit ? ` to ${commit}` : ''}`)
      
      return {
        success: true,
        message: '重置成功',
        data: { mode, commit }
      }
    } catch (error) {
      const message = `重置失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 检查是否为 Git 仓库
   */
  async isGitRepository(projectPath: string): Promise<boolean> {
    try {
      const gitDir = path.join(projectPath, '.git')
      return await fs.pathExists(gitDir)
    } catch {
      return false
    }
  }

  /**
   * 获取当前分支名
   */
  async getCurrentBranch(projectPath: string): Promise<string | null> {
    try {
      const git = simpleGit(projectPath)
      const status = await git.status()
      return status.current || null
    } catch {
      return null
    }
  }

  /**
   * 检查工作区是否干净
   */
  async isWorkingTreeClean(projectPath: string): Promise<boolean> {
    try {
      const git = simpleGit(projectPath)
      const status = await git.status()
      return status.isClean()
    } catch {
      return false
    }
  }
}