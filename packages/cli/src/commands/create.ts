import { Command } from 'commander';
import inquirer from 'inquirer';
import path from 'path';
import chalk from 'chalk';
import { CreateOptions, ProjectTemplate } from '../types/index.js';
import {
  getAvailableTemplates,
  getTemplateByName,
  copyAndRenderTemplate,
  createTemplateContext
} from '../utils/template-utils.js';
import {
  validateProjectName,
  isDirectoryEmpty,
  ensureDir,
  writeJsonFile
} from '../utils/file-utils.js';
import {
  detectPackageManager,
  installDependencies,
  PackageManager
} from '../utils/package-manager.js';
import {
  isGitInstalled,
  initGitRepository,
  createInitialCommit,
  getGitUserInfo
} from '../utils/git-utils.js';

export const createCommand = new Command()
  .name('create')
  .description('创建新项目')
  .argument('<project-name>', '项目名称')
  .option('-t, --template <template>', '指定项目模板')
  .option('-f, --framework <framework>', '指定框架类型')
  .option('-b, --build-tool <tool>', '指定构建工具')
  .option('-p, --package-manager <manager>', '指定包管理器')
  .option('--skip-install', '跳过依赖安装')
  .option('--force', '强制覆盖已存在的目录')
  .action(async (projectName: string, options: CreateOptions) => {
    await createProject(projectName, options);
  });

/**
 * 创建项目
 */
export async function createProject(projectName: string, options: CreateOptions = {}): Promise<void> {
  try {
    console.log(chalk.cyan('🚀 LDesign 项目创建向导'));
    
    // 验证项目名称
    const nameValidation = validateProjectName(projectName);
    if (!nameValidation.valid) {
      console.error(chalk.red('项目名称无效:'));
      nameValidation.errors.forEach(err => console.log(`  - ${err}`));
      process.exit(1);
    }
    
    // 检查目标目录
    const targetDir = path.resolve(process.cwd(), projectName);
    const isEmpty = await isDirectoryEmpty(targetDir);
    
    if (!isEmpty && !options.force) {
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message: `目录 ${projectName} 已存在且不为空，是否覆盖？`,
          default: false
        }
      ]);
      
      if (!overwrite) {
        console.log(chalk.yellow('操作已取消'));
        return;
      }
    }
    
    // 选择模板
    const template = await selectTemplate(options);
    if (!template) {
      console.error(chalk.red('未选择有效模板'));
      return;
    }
    
    // 获取项目配置
    const projectConfig = await getProjectConfig(projectName, template, options);
    
    // 创建项目目录
    await ensureDir(targetDir);
    
    // 复制模板文件
    const templateContext = createTemplateContext(projectName, template, projectConfig);
    await copyAndRenderTemplate(template.templatePath, targetDir, templateContext);
    
    // 创建 package.json
    await createPackageJson(targetDir, projectName, template, projectConfig);
    
    // 安装依赖
    if (!options.skipInstall) {
      const packageManager = options.packageManager as PackageManager || detectPackageManager();
      await installDependencies(targetDir, packageManager);
    }
    
    // 初始化 Git 仓库
    if (await isGitInstalled()) {
      await initGitRepository(targetDir);
      await createInitialCommit(targetDir);
    }
    
    // 显示完成信息
    showCompletionMessage(projectName, targetDir, template);
    
  } catch (err) {
    console.error(chalk.red(`项目创建失败: ${err}`));
    process.exit(1);
  }
}

/**
 * 选择模板
 */
async function selectTemplate(options: CreateOptions): Promise<ProjectTemplate | null> {
  const templates = getAvailableTemplates();
  
  // 如果指定了模板名称
  if (options.template) {
    const template = getTemplateByName(options.template);
    if (!template) {
      console.error(chalk.red(`模板 "${options.template}" 不存在`));
      console.log(chalk.yellow('可用模板:'));
      templates.forEach(t => console.log(`  - ${t.name}: ${t.description}`));
      return null;
    }
    return template;
  }
  
  // 交互式选择模板
  const { selectedTemplate } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedTemplate',
      message: '请选择项目模板:',
      choices: templates.map(template => ({
        name: `${template.displayName} - ${template.description}`,
        value: template.name
      }))
    } as any
  ]);
  
  return getTemplateByName(selectedTemplate) || null;
}

/**
 * 获取项目配置
 */
async function getProjectConfig(projectName: string, _template: ProjectTemplate, options: CreateOptions) {
  const gitUserInfo = await getGitUserInfo();
  
  const questions = [
    {
      type: 'input',
      name: 'description',
      message: '项目描述:',
      default: `${projectName} project`
    },
    {
      type: 'input',
      name: 'author',
      message: '作者:',
      default: gitUserInfo.name || ''
    },
    {
      type: 'input',
      name: 'email',
      message: '邮箱:',
      default: gitUserInfo.email || ''
    }
  ];
  
  // 如果没有指定包管理器，询问用户
  if (!options.packageManager) {
    questions.push({
      type: 'list',
      name: 'packageManager',
      message: '选择包管理器:',
      choices: [
        { name: 'pnpm (推荐)', value: 'pnpm' },
        { name: 'npm', value: 'npm' },
        { name: 'yarn', value: 'yarn' }
      ],
      default: 'pnpm'
    } as any);
  }
  
  const answers = await inquirer.prompt(questions);
  
  return {
    ...answers,
    packageManager: options.packageManager || answers.packageManager
  };
}

/**
 * 创建 package.json
 */
async function createPackageJson(
  targetDir: string,
  projectName: string,
  template: ProjectTemplate,
  config: any
): Promise<void> {
  const packageJson = {
    name: projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    version: '0.1.0',
    description: config.description,
    author: config.author,
    license: 'MIT',
    type: 'module',
    scripts: template.scripts,
    dependencies: template.dependencies,
    devDependencies: template.devDependencies,
    keywords: [
      template.framework,
      template.buildTool,
      'ldesign'
    ]
  };
  
  const packageJsonPath = path.join(targetDir, 'package.json');
  await writeJsonFile(packageJsonPath, packageJson);
}

/**
 * 显示完成信息
 */
function showCompletionMessage(projectName: string, targetDir: string, template: ProjectTemplate): void {
  console.log();
  console.log(chalk.green('🎉 项目创建成功!'));
  console.log();
  
  console.log(chalk.blue('项目信息:'));
  console.log(`  项目名称: ${chalk.cyan(projectName)}`);
  console.log(`  项目路径: ${chalk.cyan(targetDir)}`);
  console.log(`  项目模板: ${chalk.cyan(template.displayName)}`);
  console.log(`  构建工具: ${chalk.cyan(template.buildTool)}`);
  console.log();
  
  console.log(chalk.blue('下一步操作:'));
  console.log(`  ${chalk.gray('$')} cd ${projectName}`);
  
  if (template.buildTool === 'vite') {
    console.log(`  ${chalk.gray('$')} ldesign dev`);
  } else if (template.buildTool === 'rollup') {
    console.log(`  ${chalk.gray('$')} ldesign build`);
  } else if (template.buildTool === 'tsup') {
    console.log(`  ${chalk.gray('$')} ldesign dev`);
  }
  
  console.log();
  console.log(chalk.yellow('💡 提示: 使用 ldesign ui 启动可视化界面'));
  console.log();
}