#!/usr/bin/env node

import { Command } from 'commander'
import inquirer from 'inquirer'
import chalk from 'chalk'
import ora from 'ora'
import * as path from 'path'
import { ScaffoldGenerator } from './core/ScaffoldGenerator.js'
import { UIServer } from './ui/UIServer.js'
import {
  ProjectConfig,
  TemplateVariables
} from './types/index.js'
import {
  formatProjectName,
  isValidPackageName,
  detectPackageManager,
  detectDevEnvironment,
  openIDE,
  logger
} from './utils/index.js'

const program = new Command()
const generator = new ScaffoldGenerator()

program
  .name('ldesign-scaffold')
  .description('Enterprise-level Node.js scaffold generator')
  .version('1.0.0')

// 创建项目命令
program
  .command('create [project-name]')
  .description('Create a new project')
  .option('-t, --type <type>', 'Project type (vue3-project, vue3-component, nodejs-api, custom)')
  .option('-b, --build-tool <tool>', 'Build tool (vite, rollup, webpack, tsup)')
  .option('-p, --package-manager <manager>', 'Package manager (npm, yarn, pnpm)')
  .option('--skip-install', 'Skip dependency installation')
  .option('--skip-git', 'Skip git initialization')
  .option('--overwrite', 'Overwrite existing directory')
  .option('--verbose', 'Show verbose output')
  .action(async (projectName, options) => {
    try {
      const config = await promptForConfig(projectName, options)
      const variables = await promptForVariables(config)
      
      const targetDir = path.resolve(config.name)
      
      const result = await generator.createProject({
        targetDir,
        config,
        variables,
        overwrite: options.overwrite,
        skipInstall: options.skipInstall,
        skipGit: options.skipGit,
        verbose: options.verbose
      })
      
      if (result.success) {
        await promptForNextSteps(targetDir, config)
      } else {
        process.exit(1)
      }
    } catch (error) {
      logger.error(`创建项目失败: ${error instanceof Error ? error.message : String(error)}`)
      process.exit(1)
    }
  })

// 启动可视化界面命令
program
  .command('ui')
  .description('Start visual interface')
  .option('-p, --port <port>', 'Server port', '3000')
  .option('--no-open', 'Do not open browser automatically')
  .action(async (options) => {
    try {
      const uiServer = new UIServer({
        port: parseInt(options.port),
        autoOpen: options.open
      })
      
      await uiServer.start()
    } catch (error) {
      logger.error(`启动可视化界面失败: ${error instanceof Error ? error.message : String(error)}`)
      process.exit(1)
    }
  })

// 列出模板命令
program
  .command('list')
  .description('List available templates')
  .action(async () => {
    try {
      const templates = await generator.getTemplateManager().listTemplates()
      const features = await generator.getTemplateManager().listFeatures()
      
      console.log(chalk.blue('\n📋 可用模板:'))
      templates.forEach(template => {
        console.log(`  • ${template}`)
      })
      
      console.log(chalk.blue('\n🔧 可用特性:'))
      features.forEach(feature => {
        console.log(`  • ${feature}`)
      })
    } catch (error) {
      logger.error(`获取模板列表失败: ${error instanceof Error ? error.message : String(error)}`)
    }
  })

// 环境检测命令
program
  .command('doctor')
  .description('Check development environment')
  .action(async () => {
    const spinner = ora('检测开发环境...').start()
    
    try {
      const env = await detectDevEnvironment()
      spinner.stop()
      
      console.log(chalk.blue('\n🔍 开发环境检测结果:'))
      
      // Node.js
      console.log(`\n${chalk.green('✓')} Node.js: ${env.node.version}`)
      
      // 包管理器
      console.log('\n📦 包管理器:')
      Object.entries(env.packageManagers).forEach(([name, info]) => {
        if (info) {
          console.log(`  ${chalk.green('✓')} ${name}: ${info.version}`)
        }
      })
      
      // Git
      if (env.git) {
        console.log(`\n${chalk.green('✓')} Git: ${env.git.version}`)
        if (env.git.config.username) {
          console.log(`  用户名: ${env.git.config.username}`)
        }
        if (env.git.config.email) {
          console.log(`  邮箱: ${env.git.config.email}`)
        }
      } else {
        console.log(`\n${chalk.red('✗')} Git: 未安装`)
      }
      
      // Docker
      if (env.docker) {
        console.log(`\n${chalk.green('✓')} Docker: ${env.docker.version}`)
        console.log(`  状态: ${env.docker.running ? chalk.green('运行中') : chalk.yellow('未运行')}`)
      } else {
        console.log(`\n${chalk.yellow('⚠')} Docker: 未安装`)
      }
      
      // IDE
      console.log('\n💻 IDE:')
      env.ides.forEach(ide => {
        if (ide.available) {
          console.log(`  ${chalk.green('✓')} ${ide.type}${ide.version ? `: ${ide.version}` : ''}`)
        } else {
          console.log(`  ${chalk.gray('○')} ${ide.type}: 未安装`)
        }
      })
      
    } catch (error) {
      spinner.fail('环境检测失败')
      logger.error(error instanceof Error ? error.message : String(error))
    }
  })

// 开发服务器命令
program
  .command('dev')
  .description('Start development server')
  .option('-p, --port <port>', 'Server port', '3000')
  .option('--host <host>', 'Server host', 'localhost')
  .action(async (options) => {
    try {
      const { startDevServer } = await import('./commands/DevServer.js')
      await startDevServer({
        port: parseInt(options.port),
        host: options.host,
        cwd: process.cwd()
      })
    } catch (error) {
      logger.error(`启动开发服务器失败: ${error instanceof Error ? error.message : String(error)}`)
      process.exit(1)
    }
  })

// 构建命令
program
  .command('build')
  .description('Build for production')
  .option('--outDir <dir>', 'Output directory', 'dist')
  .action(async (options) => {
    try {
      const { buildProject } = await import('./commands/DevServer.js')
      await buildProject({
        outDir: options.outDir,
        cwd: process.cwd()
      })
    } catch (error) {
      logger.error(`构建项目失败: ${error instanceof Error ? error.message : String(error)}`)
      process.exit(1)
    }
  })

// 预览命令
program
  .command('preview')
  .description('Preview production build')
  .option('-p, --port <port>', 'Server port', '4173')
  .option('--host <host>', 'Server host', 'localhost')
  .action(async (options) => {
    try {
      const { previewBuild } = await import('./commands/DevServer.js')
      await previewBuild({
        port: parseInt(options.port),
        host: options.host,
        cwd: process.cwd()
      })
    } catch (error) {
      logger.error(`预览构建失败: ${error instanceof Error ? error.message : String(error)}`)
      process.exit(1)
    }
  })

// 配置项目提示
async function promptForConfig(projectName?: string, options: Record<string, any> = {}): Promise<ProjectConfig> {
  const questions: Record<string, any>[] = []
  
  // 项目名称
  if (!projectName) {
    questions.push({
      type: 'input',
      name: 'name',
      message: '项目名称:',
      validate: (input: string) => {
        const formatted = formatProjectName(input)
        if (!isValidPackageName(formatted)) {
          return '请输入有效的项目名称'
        }
        return true
      },
      filter: formatProjectName
    })
  }
  
  // 项目类型
  if (!options.type) {
    questions.push({
      type: 'list',
      name: 'type',
      message: '选择项目类型:',
      choices: [
        { name: 'Vue3 项目', value: 'vue3-project' },
        { name: 'Vue3 组件库', value: 'vue3-component' },
        { name: 'Node.js API', value: 'nodejs-api' },
        { name: '自定义', value: 'custom' }
      ]
    })
  }
  
  // 构建工具
  if (!options.buildTool) {
    questions.push({
      type: 'list',
      name: 'buildTool',
      message: '选择构建工具:',
      choices: (answers: Record<string, any>) => {
        const type = answers.type || options.type
        if (type === 'vue3-component') {
          return [
            { name: 'Rollup (推荐)', value: 'rollup' },
            { name: 'Vite', value: 'vite' },
            { name: 'tsup', value: 'tsup' }
          ]
        } else if (type === 'vue3-project') {
          return [
            { name: 'Vite (推荐)', value: 'vite' },
            { name: 'Webpack', value: 'webpack' }
          ]
        } else {
          return [
            { name: 'tsup (推荐)', value: 'tsup' },
            { name: 'Rollup', value: 'rollup' },
            { name: 'Webpack', value: 'webpack' }
          ]
        }
      }
    })
  }
  
  // 包管理器
  if (!options.packageManager) {
    const detected = detectPackageManager()
    questions.push({
      type: 'list',
      name: 'packageManager',
      message: '选择包管理器:',
      choices: [
        { name: `pnpm${detected === 'pnpm' ? ' (检测到)' : ''}`, value: 'pnpm' },
        { name: `yarn${detected === 'yarn' ? ' (检测到)' : ''}`, value: 'yarn' },
        { name: `npm${detected === 'npm' ? ' (检测到)' : ''}`, value: 'npm' }
      ],
      default: detected
    })
  }
  
  // 项目特性
  questions.push({
    type: 'checkbox',
    name: 'features',
    message: '选择项目特性:',
    choices: (answers: Record<string, any>) => {
      const type = answers.type || options.type
      const baseFeatures = [
        { name: 'TypeScript', value: 'typescript', checked: true },
        { name: 'ESLint', value: 'eslint', checked: true },
        { name: 'Prettier', value: 'prettier', checked: true },
        { name: 'Husky (Git hooks)', value: 'husky' },
        { name: 'Commitlint', value: 'commitlint' }
      ]
      
      const testFeatures = [
        { name: 'Vitest', value: 'vitest', checked: true },
        { name: 'Cypress (E2E)', value: 'cypress' },
        { name: 'Playwright (E2E)', value: 'playwright' }
      ]
      
      const styleFeatures = [
        { name: 'Tailwind CSS', value: 'tailwindcss' },
        { name: 'Sass', value: 'sass' },
        { name: 'Less', value: 'less' }
      ]
      
      const docFeatures = [
        { name: 'VitePress (文档)', value: 'vitepress' },
        { name: 'Storybook', value: 'storybook' }
      ]
      
      const deployFeatures = [
        { name: 'Docker', value: 'docker' },
        { name: 'Nginx', value: 'nginx' },
        { name: 'GitHub Actions', value: 'github-actions' }
      ]
      
      const extFeatures = [
        { name: 'Iconfont', value: 'iconfont' },
        { name: 'Fontmin', value: 'fontmin' }
      ]
      
      const choices = [...baseFeatures, ...testFeatures]
      
      if (type?.includes('vue')) {
        choices.push(
          { name: 'Vue Router', value: 'router' },
          { name: 'Pinia (状态管理)', value: 'store' },
          { name: 'Vue I18n', value: 'i18n' },
          { name: 'UI 组件库', value: 'ui-library' }
        )
      }
      
      choices.push(...styleFeatures, ...docFeatures, ...deployFeatures, ...extFeatures)
      
      return choices
    }
  })
  
  const answers = await inquirer.prompt(questions)
  
  return {
    name: projectName ? formatProjectName(projectName) : answers.name,
    type: options.type || answers.type,
    buildTool: options.buildTool || answers.buildTool,
    packageManager: options.packageManager || answers.packageManager,
    features: answers.features || [],
    description: '',
    author: '',
    version: '1.0.0',
    license: 'MIT'
  }
}

// 模板变量提示
async function promptForVariables(config: ProjectConfig): Promise<TemplateVariables> {
  const questions = [
    {
      type: 'input',
      name: 'projectDescription',
      message: '项目描述:',
      default: `A ${config.type} project`
    },
    {
      type: 'input',
      name: 'author',
      message: '作者:',
      default: 'Your Name'
    },
    {
      type: 'input',
      name: 'version',
      message: '版本:',
      default: '1.0.0'
    },
    {
      type: 'list',
      name: 'license',
      message: '许可证:',
      choices: ['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause', 'ISC'],
      default: 'MIT'
    }
  ]
  
  const answers = await inquirer.prompt(questions)
  
  return {
    projectName: config.name,
    projectDescription: answers.projectDescription,
    author: answers.author,
    version: answers.version,
    license: answers.license
  }
}

// 后续步骤提示
async function promptForNextSteps(projectPath: string, config: ProjectConfig): Promise<void> {
  console.log(chalk.green('\n🎉 项目创建成功!'))
  console.log(chalk.blue(`\n📁 项目路径: ${projectPath}`))
  
  const { nextAction } = await inquirer.prompt([
    {
      type: 'list',
      name: 'nextAction',
      message: '接下来要做什么?',
      choices: [
        { name: '打开 VS Code', value: 'vscode' },
        { name: '打开 WebStorm', value: 'webstorm' },
        { name: '启动可视化界面', value: 'ui' },
        { name: '显示使用说明', value: 'help' },
        { name: '退出', value: 'exit' }
      ]
    }
  ])
  
  switch (nextAction) {
    case 'vscode': {
      const vscodeSuccess = await openIDE('vscode', projectPath)
      if (!vscodeSuccess) {
        logger.warning('无法启动 VS Code，请手动打开项目')
      }
      break
    }

    case 'webstorm': {
      const webstormSuccess = await openIDE('webstorm', projectPath)
      if (!webstormSuccess) {
        logger.warning('无法启动 WebStorm，请手动打开项目')
      }
      break
    }

    case 'ui': {
      const uiServer = new UIServer({ port: 3000, autoOpen: true })
      await uiServer.start()
      break
    }
      
    case 'help':
      showUsageInstructions(config)
      break
      
    case 'exit':
    default:
      break
  }
}

// 显示使用说明
function showUsageInstructions(config: ProjectConfig): void {
  console.log(chalk.blue('\n📖 使用说明:'))
  console.log(`\n1. 进入项目目录:`)
  console.log(chalk.gray(`   cd ${config.name}`))
  
  console.log(`\n2. 安装依赖:`)
  console.log(chalk.gray(`   ${config.packageManager} install`))
  
  console.log(`\n3. 启动开发服务器:`)
  console.log(chalk.gray(`   ${config.packageManager} run dev`))
  
  if (config.features.includes('vitest')) {
    console.log(`\n4. 运行测试:`)
    console.log(chalk.gray(`   ${config.packageManager} run test`))
  }
  
  if (config.features.includes('vitepress')) {
    console.log(`\n5. 启动文档:`)
    console.log(chalk.gray(`   ${config.packageManager} run docs:dev`))
  }
  
  console.log(`\n6. 构建项目:`)
  console.log(chalk.gray(`   ${config.packageManager} run build`))
  
  console.log(chalk.blue('\n🚀 开始你的开发之旅吧!'))
}

// 错误处理
process.on('uncaughtException', (error) => {
  logger.error(`未捕获的异常: ${error.message}`)
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  logger.error(`未处理的 Promise 拒绝: ${reason}`)
  process.exit(1)
})

// 解析命令行参数
program.parse()