import fs from 'fs-extra'
import path from 'path'
import { execa } from 'execa'
import chalk from 'chalk'
import ora from 'ora'
import { Listr } from 'listr2'
import {
  ProjectConfig,
  ScaffoldOptions,
  CommandResult,
  TemplateVariables,
  ScaffoldError
} from '../types/index.js'
import { TemplateManager } from './TemplateManager.js'
import { ConfigGenerator } from './ConfigGenerator.js'
import {
  isEmptyDir,
  formatProjectName,
  isValidPackageName,
  getInstallCommand,
  logger,
  copyTemplate
} from '../utils/index.js'

/**
 * 脚手架生成器核心类
 */
export class ScaffoldGenerator {
  private templateManager: TemplateManager
  private configGenerator: ConfigGenerator

  constructor() {
    this.templateManager = new TemplateManager()
    this.configGenerator = new ConfigGenerator()
  }

  /**
   * 创建项目
   */
  async createProject(options: ScaffoldOptions): Promise<CommandResult> {
    try {
      const { targetDir, config, variables, overwrite = false, skipInstall = false, skipGit = false } = options

      // 验证项目名称
      if (!isValidPackageName(config.name)) {
        throw new ScaffoldError(
          `Invalid project name: ${config.name}`,
          'INVALID_PROJECT_NAME'
        )
      }

      // 检查目标目录
      const fullPath = path.resolve(targetDir)
      if (fs.existsSync(fullPath) && !isEmptyDir(fullPath) && !overwrite) {
        throw new ScaffoldError(
          `Directory ${fullPath} is not empty. Use --overwrite to force.`,
          'DIRECTORY_NOT_EMPTY'
        )
      }

      // 创建任务列表
      const tasks = new Listr([
        {
          title: '准备项目目录',
          task: async () => {
            if (overwrite && fs.existsSync(fullPath)) {
              await fs.remove(fullPath)
            }
            await fs.ensureDir(fullPath)
          }
        },
        {
          title: '生成项目结构',
          task: async () => {
            await this.generateProjectStructure(fullPath, config, variables)
          }
        },
        {
          title: '生成配置文件',
          task: async () => {
            await this.configGenerator.generateConfigs(fullPath, config)
          }
        },
        {
          title: '初始化Git仓库',
          skip: () => skipGit || !config.git,
          task: async () => {
            await this.initializeGit(fullPath, config)
          }
        },
        {
          title: '安装依赖',
          skip: () => skipInstall,
          task: async () => {
            await this.installDependencies(fullPath, config.packageManager)
          }
        }
      ])

      await tasks.run()

      logger.success(`项目 ${config.name} 创建成功！`)
      logger.info(`项目路径: ${fullPath}`)
      
      return {
        success: true,
        message: '项目创建成功',
        data: { projectPath: fullPath }
      }
    } catch (error) {
      logger.error(`项目创建失败: ${error instanceof Error ? error.message : String(error)}`)
      return {
        success: false,
        message: '项目创建失败',
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 生成项目结构
   */
  private async generateProjectStructure(
    projectPath: string,
    config: ProjectConfig,
    variables: TemplateVariables
  ): Promise<void> {
    const templatePath = await this.templateManager.getTemplatePath(config.type)
    
    if (!templatePath) {
      throw new ScaffoldError(
        `Template not found for project type: ${config.type}`,
        'TEMPLATE_NOT_FOUND'
      )
    }

    // 复制基础模板
    await copyTemplate(templatePath, projectPath, {
      ...variables,
      projectName: config.name,
      projectType: config.type,
      buildTool: config.buildTool,
      packageManager: config.packageManager,
      features: config.features
    })

    // 根据特性添加额外文件
    await this.addFeatureFiles(projectPath, config)
  }

  /**
   * 根据特性添加文件
   */
  private async addFeatureFiles(projectPath: string, config: ProjectConfig): Promise<void> {
    for (const feature of config.features) {
      const featureTemplatePath = await this.templateManager.getFeatureTemplatePath(feature)
      if (featureTemplatePath) {
        await copyTemplate(featureTemplatePath, projectPath, {
          projectName: config.name,
          feature
        })
      }
    }
  }

  /**
   * 初始化Git仓库
   */
  private async initializeGit(projectPath: string, config: ProjectConfig): Promise<void> {
    const { git } = config
    if (!git) return

    try {
      // 初始化Git仓库
      await execa('git', ['init'], { cwd: projectPath })

      // 设置用户信息
      if (git.username) {
        await execa('git', ['config', 'user.name', git.username], { cwd: projectPath })
      }
      if (git.email) {
        await execa('git', ['config', 'user.email', git.email], { cwd: projectPath })
      }

      // 添加远程仓库
      if (git.repository) {
        await execa('git', ['remote', 'add', 'origin', git.repository], { cwd: projectPath })
      }

      // 初始提交
      if (git.autoCommit) {
        await execa('git', ['add', '.'], { cwd: projectPath })
        await execa('git', ['commit', '-m', 'Initial commit'], { cwd: projectPath })
        
        if (git.branch && git.branch !== 'master') {
          await execa('git', ['branch', '-M', git.branch], { cwd: projectPath })
        }
      }
    } catch (error) {
      logger.warning(`Git初始化失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * 安装依赖
   */
  private async installDependencies(projectPath: string, packageManager: string): Promise<void> {
    const spinner = ora('安装依赖中...').start()
    
    try {
      const installCmd = getInstallCommand(packageManager as any)
      const [cmd, ...args] = installCmd.split(' ')
      
      await execa(cmd, args, {
        cwd: projectPath,
        stdio: 'pipe'
      })
      
      spinner.succeed('依赖安装完成')
    } catch (error) {
      spinner.fail('依赖安装失败')
      throw error
    }
  }

  /**
   * 验证项目配置
   */
  validateConfig(config: ProjectConfig): CommandResult {
    const errors: string[] = []

    // 验证项目名称
    if (!config.name || !isValidPackageName(config.name)) {
      errors.push('项目名称无效')
    }

    // 验证项目类型
    const validTypes = ['vue3-project', 'vue3-component', 'nodejs-api', 'custom']
    if (!validTypes.includes(config.type)) {
      errors.push('项目类型无效')
    }

    // 验证构建工具
    const validBuildTools = ['vite', 'rollup', 'webpack', 'tsup']
    if (!validBuildTools.includes(config.buildTool)) {
      errors.push('构建工具无效')
    }

    // 验证包管理器
    const validPackageManagers = ['npm', 'yarn', 'pnpm']
    if (!validPackageManagers.includes(config.packageManager)) {
      errors.push('包管理器无效')
    }

    if (errors.length > 0) {
      return {
        success: false,
        message: '配置验证失败',
        error: new ScaffoldError(
          `配置错误: ${errors.join(', ')}`,
          'INVALID_CONFIG',
          errors
        )
      }
    }

    return {
      success: true,
      message: '配置验证通过'
    }
  }

  /**
   * 获取支持的项目类型
   */
  getSupportedProjectTypes(): string[] {
    return ['vue3-project', 'vue3-component', 'nodejs-api', 'custom']
  }

  /**
   * 获取支持的构建工具
   */
  getSupportedBuildTools(): string[] {
    return ['vite', 'rollup', 'webpack', 'tsup']
  }

  /**
   * 获取支持的特性
   */
  getSupportedFeatures(): string[] {
    return [
      'typescript',
      'eslint',
      'prettier',
      'husky',
      'commitlint',
      'jest',
      'vitest',
      'cypress',
      'playwright',
      'storybook',
      'tailwindcss',
      'sass',
      'less',
      'pwa',
      'i18n',
      'router',
      'store',
      'ui-library',
      'vitepress',
      'docker',
      'nginx',
      'github-actions',
      'gitlab-ci',
      'iconfont',
      'fontmin'
    ]
  }

  /**
   * 获取模板管理器
   */
  getTemplateManager(): TemplateManager {
    return this.templateManager
  }

  /**
   * 获取配置生成器
   */
  getConfigGenerator(): ConfigGenerator {
    return this.configGenerator
  }
}