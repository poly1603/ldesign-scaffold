import path from 'path'
import fs from 'fs-extra'
import yaml from 'yaml'
import { CommandResult } from '../types/index.js'
import { logger } from '../utils/index.js'

export interface WorkflowConfig {
  name: string
  on: {
    push?: {
      branches?: string[]
      tags?: string[]
      paths?: string[]
    }
    pull_request?: {
      branches?: string[]
      paths?: string[]
    }
    schedule?: Array<{
      cron: string
    }>
    workflow_dispatch?: any
  }
  jobs: Record<string, WorkflowJob>
  env?: Record<string, string>
}

export interface WorkflowJob {
  name?: string
  'runs-on': string
  strategy?: {
    matrix?: Record<string, any[]>
    'fail-fast'?: boolean
  }
  env?: Record<string, string>
  steps: WorkflowStep[]
  needs?: string | string[]
  if?: string
  timeout?: number
}

export interface WorkflowStep {
  name?: string
  uses?: string
  run?: string
  with?: Record<string, any>
  env?: Record<string, string>
  if?: string
  'continue-on-error'?: boolean
}

export class WorkflowManager {
  /**
   * 列出所有工作流
   */
  async list(projectPath: string): Promise<CommandResult<string[]>> {
    try {
      const workflowsDir = path.join(projectPath, '.github', 'workflows')
      
      if (!await fs.pathExists(workflowsDir)) {
        return {
          success: true,
          message: '没有找到工作流',
          data: []
        }
      }
      
      const files = await fs.readdir(workflowsDir)
      const workflows = files
        .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'))
        .map(file => path.basename(file, path.extname(file)))
      
      return {
        success: true,
        message: '获取工作流列表成功',
        data: workflows
      }
    } catch (error) {
      const message = `获取工作流列表失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 创建工作流
   */
  async create(projectPath: string, name: string, config: WorkflowConfig): Promise<CommandResult> {
    try {
      const workflowsDir = path.join(projectPath, '.github', 'workflows')
      await fs.ensureDir(workflowsDir)
      
      const workflowPath = path.join(workflowsDir, `${name}.yml`)
      const yamlContent = yaml.stringify(config, {
        indent: 2,
        lineWidth: 120
      })
      
      await fs.writeFile(workflowPath, yamlContent, 'utf8')
      
      logger.success(`工作流创建成功: ${name}`)
      
      return {
        success: true,
        message: '工作流创建成功',
        data: {
          name,
          path: workflowPath,
          content: yamlContent
        }
      }
    } catch (error) {
      const message = `创建工作流失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 获取工作流配置
   */
  async get(projectPath: string, name: string): Promise<CommandResult<WorkflowConfig>> {
    try {
      const workflowPath = path.join(projectPath, '.github', 'workflows', `${name}.yml`)
      
      if (!await fs.pathExists(workflowPath)) {
        // 尝试 .yaml 扩展名
        const yamlPath = path.join(projectPath, '.github', 'workflows', `${name}.yaml`)
        if (!await fs.pathExists(yamlPath)) {
          return {
            success: false,
            message: `工作流不存在: ${name}`,
            error: new Error(`工作流不存在: ${name}`)
          }
        }
      }
      
      const content = await fs.readFile(workflowPath, 'utf8')
      const config = yaml.parse(content) as WorkflowConfig
      
      return {
        success: true,
        message: '获取工作流配置成功',
        data: config
      }
    } catch (error) {
      const message = `获取工作流配置失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 更新工作流
   */
  async update(projectPath: string, name: string, config: WorkflowConfig): Promise<CommandResult> {
    try {
      const workflowPath = path.join(projectPath, '.github', 'workflows', `${name}.yml`)
      
      const yamlContent = yaml.stringify(config, {
        indent: 2,
        lineWidth: 120
      })
      
      await fs.writeFile(workflowPath, yamlContent, 'utf8')
      
      logger.success(`工作流更新成功: ${name}`)
      
      return {
        success: true,
        message: '工作流更新成功',
        data: {
          name,
          path: workflowPath,
          content: yamlContent
        }
      }
    } catch (error) {
      const message = `更新工作流失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 删除工作流
   */
  async delete(projectPath: string, name: string): Promise<CommandResult> {
    try {
      const workflowPath = path.join(projectPath, '.github', 'workflows', `${name}.yml`)
      const yamlPath = path.join(projectPath, '.github', 'workflows', `${name}.yaml`)
      
      let deleted = false
      
      if (await fs.pathExists(workflowPath)) {
        await fs.remove(workflowPath)
        deleted = true
      } else if (await fs.pathExists(yamlPath)) {
        await fs.remove(yamlPath)
        deleted = true
      }
      
      if (!deleted) {
        return {
          success: false,
          message: `工作流不存在: ${name}`,
          error: new Error(`工作流不存在: ${name}`)
        }
      }
      
      logger.success(`工作流删除成功: ${name}`)
      
      return {
        success: true,
        message: '工作流删除成功',
        data: { name }
      }
    } catch (error) {
      const message = `删除工作流失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 生成 CI/CD 工作流
   */
  async generateCICD(projectPath: string, options: {
    name?: string
    nodeVersions?: string[]
    packageManager?: 'npm' | 'yarn' | 'pnpm'
    buildCommand?: string
    testCommand?: string
    deployCommand?: string
    branches?: string[]
    enableDeploy?: boolean
    deployTarget?: 'github-pages' | 'vercel' | 'netlify' | 'custom'
  } = {}): Promise<CommandResult> {
    try {
      const config: WorkflowConfig = {
        name: options.name || 'CI/CD',
        on: {
          push: {
            branches: options.branches || ['main', 'master']
          },
          pull_request: {
            branches: options.branches || ['main', 'master']
          }
        },
        jobs: {
          test: {
            name: 'Test',
            'runs-on': 'ubuntu-latest',
            strategy: {
              matrix: {
                'node-version': options.nodeVersions || ['18', '20']
              }
            },
            steps: [
              {
                name: 'Checkout code',
                uses: 'actions/checkout@v4'
              },
              {
                name: 'Setup Node.js',
                uses: 'actions/setup-node@v4',
                with: {
                  'node-version': '${{ matrix.node-version }}',
                  cache: options.packageManager || 'npm'
                }
              },
              {
                name: 'Install dependencies',
                run: this.getInstallCommand(options.packageManager || 'npm')
              }
            ]
          }
        }
      }
      
      // 添加测试步骤
      if (options.testCommand) {
        config.jobs.test.steps.push({
          name: 'Run tests',
          run: options.testCommand
        })
      }
      
      // 添加构建步骤
      if (options.buildCommand) {
        config.jobs.test.steps.push({
          name: 'Build project',
          run: options.buildCommand
        })
      }
      
      // 添加部署任务
      if (options.enableDeploy && options.deployTarget) {
        config.jobs.deploy = {
          name: 'Deploy',
          'runs-on': 'ubuntu-latest',
          needs: 'test',
          if: "github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master'",
          steps: [
            {
              name: 'Checkout code',
              uses: 'actions/checkout@v4'
            },
            {
              name: 'Setup Node.js',
              uses: 'actions/setup-node@v4',
              with: {
                'node-version': '20',
                cache: options.packageManager || 'npm'
              }
            },
            {
              name: 'Install dependencies',
              run: this.getInstallCommand(options.packageManager || 'npm')
            }
          ]
        }
        
        if (options.buildCommand) {
          config.jobs.deploy.steps.push({
            name: 'Build project',
            run: options.buildCommand
          })
        }
        
        // 根据部署目标添加部署步骤
        this.addDeploySteps(config.jobs.deploy, options.deployTarget, options.deployCommand)
      }
      
      return await this.create(projectPath, options.name || 'ci-cd', config)
    } catch (error) {
      const message = `生成 CI/CD 工作流失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 生成发布工作流
   */
  async generateRelease(projectPath: string, options: {
    name?: string
    packageManager?: 'npm' | 'yarn' | 'pnpm'
    buildCommand?: string
    registry?: string
    publishCommand?: string
  } = {}): Promise<CommandResult> {
    try {
      const config: WorkflowConfig = {
        name: options.name || 'Release',
        on: {
          push: {
            tags: ['v*']
          }
        },
        jobs: {
          release: {
            name: 'Release',
            'runs-on': 'ubuntu-latest',
            steps: [
              {
                name: 'Checkout code',
                uses: 'actions/checkout@v4'
              },
              {
                name: 'Setup Node.js',
                uses: 'actions/setup-node@v4',
                with: {
                  'node-version': '20',
                  cache: options.packageManager || 'npm',
                  'registry-url': options.registry || 'https://registry.npmjs.org/'
                }
              },
              {
                name: 'Install dependencies',
                run: this.getInstallCommand(options.packageManager || 'npm')
              }
            ]
          }
        }
      }
      
      // 添加构建步骤
      if (options.buildCommand) {
        config.jobs.release.steps.push({
          name: 'Build project',
          run: options.buildCommand
        })
      }
      
      // 添加发布步骤
      config.jobs.release.steps.push({
        name: 'Publish to npm',
        run: options.publishCommand || this.getPublishCommand(options.packageManager || 'npm'),
        env: {
          NODE_AUTH_TOKEN: '${{ secrets.NPM_TOKEN }}'
        }
      })
      
      // 添加 GitHub Release
      config.jobs.release.steps.push({
        name: 'Create GitHub Release',
        uses: 'actions/create-release@v1',
        env: {
          GITHUB_TOKEN: '${{ secrets.GITHUB_TOKEN }}'
        },
        with: {
          tag_name: '${{ github.ref }}',
          release_name: 'Release ${{ github.ref }}',
          draft: false,
          prerelease: false
        }
      })
      
      return await this.create(projectPath, options.name || 'release', config)
    } catch (error) {
      const message = `生成发布工作流失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 生成代码质量检查工作流
   */
  async generateCodeQuality(projectPath: string, options: {
    name?: string
    packageManager?: 'npm' | 'yarn' | 'pnpm'
    lintCommand?: string
    typeCheckCommand?: string
    formatCheckCommand?: string
  } = {}): Promise<CommandResult> {
    try {
      const config: WorkflowConfig = {
        name: options.name || 'Code Quality',
        on: {
          push: {
            branches: ['main', 'master', 'develop']
          },
          pull_request: {
            branches: ['main', 'master', 'develop']
          }
        },
        jobs: {
          quality: {
            name: 'Code Quality',
            'runs-on': 'ubuntu-latest',
            steps: [
              {
                name: 'Checkout code',
                uses: 'actions/checkout@v4'
              },
              {
                name: 'Setup Node.js',
                uses: 'actions/setup-node@v4',
                with: {
                  'node-version': '20',
                  cache: options.packageManager || 'npm'
                }
              },
              {
                name: 'Install dependencies',
                run: this.getInstallCommand(options.packageManager || 'npm')
              }
            ]
          }
        }
      }
      
      // 添加代码检查步骤
      if (options.lintCommand) {
        config.jobs.quality.steps.push({
          name: 'Run ESLint',
          run: options.lintCommand
        })
      }
      
      if (options.typeCheckCommand) {
        config.jobs.quality.steps.push({
          name: 'Type check',
          run: options.typeCheckCommand
        })
      }
      
      if (options.formatCheckCommand) {
        config.jobs.quality.steps.push({
          name: 'Format check',
          run: options.formatCheckCommand
        })
      }
      
      return await this.create(projectPath, options.name || 'code-quality', config)
    } catch (error) {
      const message = `生成代码质量检查工作流失败: ${error instanceof Error ? error.message : String(error)}`
      logger.error(message)
      return {
        success: false,
        message,
        error: error instanceof Error ? error : new Error(String(error))
      }
    }
  }

  /**
   * 获取安装命令
   */
  private getInstallCommand(packageManager: string): string {
    switch (packageManager) {
      case 'yarn':
        return 'yarn install --frozen-lockfile'
      case 'pnpm':
        return 'pnpm install --frozen-lockfile'
      default:
        return 'npm ci'
    }
  }

  /**
   * 获取发布命令
   */
  private getPublishCommand(packageManager: string): string {
    switch (packageManager) {
      case 'yarn':
        return 'yarn publish'
      case 'pnpm':
        return 'pnpm publish'
      default:
        return 'npm publish'
    }
  }

  /**
   * 添加部署步骤
   */
  private addDeploySteps(job: WorkflowJob, target: string, customCommand?: string): void {
    switch (target) {
      case 'github-pages':
        job.steps.push({
          name: 'Deploy to GitHub Pages',
          uses: 'peaceiris/actions-gh-pages@v3',
          with: {
            github_token: '${{ secrets.GITHUB_TOKEN }}',
            publish_dir: './dist'
          }
        })
        break
        
      case 'vercel':
        job.steps.push({
          name: 'Deploy to Vercel',
          uses: 'amondnet/vercel-action@v25',
          with: {
            'vercel-token': '${{ secrets.VERCEL_TOKEN }}',
            'vercel-org-id': '${{ secrets.ORG_ID }}',
            'vercel-project-id': '${{ secrets.PROJECT_ID }}',
            'vercel-args': '--prod'
          }
        })
        break
        
      case 'netlify':
        job.steps.push({
          name: 'Deploy to Netlify',
          uses: 'nwtgck/actions-netlify@v2.0',
          with: {
            'publish-dir': './dist',
            'production-branch': 'main',
            'github-token': '${{ secrets.GITHUB_TOKEN }}',
            'deploy-message': 'Deploy from GitHub Actions'
          },
          env: {
            NETLIFY_AUTH_TOKEN: '${{ secrets.NETLIFY_AUTH_TOKEN }}',
            NETLIFY_SITE_ID: '${{ secrets.NETLIFY_SITE_ID }}'
          }
        })
        break
        
      case 'custom':
        if (customCommand) {
          job.steps.push({
            name: 'Custom deploy',
            run: customCommand
          })
        }
        break
    }
  }
}