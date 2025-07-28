import { Command } from 'commander';
import path from 'path';
import inquirer from 'inquirer';
import { execa } from 'execa';
import chalk from 'chalk';
import ora from 'ora';
import { DeployOptions } from '../types/index.js';
import { readJsonFile, fileExists, writeJsonFile } from '../utils/file-utils.js';
import { buildProject } from './build.js';

export const deployCommand = new Command()
  .name('deploy')
  .description('部署项目')
  .option('-p, --platform <platform>', '部署平台 (vercel|netlify|github-pages|custom)')
  .option('-d, --build-dir <dir>', '构建目录', 'dist')
  .option('-c, --config <config>', '部署配置文件')
  .option('--skip-build', '跳过构建步骤')
  .action(async (options: DeployOptions) => {
    await deployProject(options);
  });

/**
 * 部署项目
 */
export async function deployProject(options: DeployOptions = {}): Promise<void> {
  try {
    const cwd = process.cwd();
    
    // 检查是否存在 package.json
    const packageJsonPath = path.join(cwd, 'package.json');
    if (!(await fileExists(packageJsonPath))) {
      console.error(chalk.red('当前目录不是一个有效的项目目录（未找到 package.json）'));
      return;
    }
    
    // 验证 package.json 存在
    await readJsonFile(packageJsonPath);
    
    // 选择部署平台
    const platform = await selectDeployPlatform(options);
    if (!platform) {
      console.error(chalk.red('未选择部署平台'));
      return;
    }
    
    // 检查构建目录
    const buildDir = options.buildDir || 'dist';
    const buildPath = path.join(cwd, buildDir);
    
    if (!options.skipBuild || !(await fileExists(buildPath))) {
      console.log(chalk.blue('正在构建项目...'));
      await buildProject({ outDir: buildDir });
    }
    
    // 验证构建产物
    if (!(await fileExists(buildPath))) {
      console.error(chalk.red(`构建目录不存在: ${buildDir}`));
      return;
    }
    
    // 执行部署
    await executeDeploy(platform, cwd, buildDir, options);
    
    console.log(chalk.green('🚀 项目部署完成!'));
    
  } catch (err) {
    console.error(chalk.red(`项目部署失败: ${err}`));
    process.exit(1);
  }
}

/**
 * 选择部署平台
 */
async function selectDeployPlatform(options: DeployOptions): Promise<string | null> {
  if (options.platform) {
    const validPlatforms = ['vercel', 'netlify', 'github-pages', 'custom'];
    if (!validPlatforms.includes(options.platform)) {
      console.error(chalk.red(`不支持的部署平台: ${options.platform}`));
      console.log(chalk.blue(`支持的平台: ${validPlatforms.join(', ')}`));
      return null;
    }
    return options.platform;
  }
  
  const { selectedPlatform } = await inquirer.prompt([
    {
      type: 'list',
      name: 'selectedPlatform',
      message: '请选择部署平台:',
      choices: [
        { name: 'Vercel - 零配置部署', value: 'vercel' },
        { name: 'Netlify - 静态网站托管', value: 'netlify' },
        { name: 'GitHub Pages - GitHub 静态页面', value: 'github-pages' },
        { name: '自定义部署', value: 'custom' }
      ]
    }
  ]);
  
  return selectedPlatform;
}

/**
 * 执行部署
 */
async function executeDeploy(
  platform: string,
  cwd: string,
  buildDir: string,
  options: DeployOptions
): Promise<void> {
  switch (platform) {
    case 'vercel':
      await deployToVercel(cwd, buildDir, options);
      break;
    case 'netlify':
      await deployToNetlify(cwd, buildDir, options);
      break;
    case 'github-pages':
      await deployToGitHubPages(cwd, buildDir, options);
      break;
    case 'custom':
      await deployCustom(cwd, buildDir, options);
      break;
    default:
      throw new Error(`不支持的部署平台: ${platform}`);
  }
}

/**
 * 部署到 Vercel
 */
async function deployToVercel(cwd: string, buildDir: string, _options: DeployOptions): Promise<void> {
  try {
    // 检查是否安装了 Vercel CLI
    await execa('vercel', ['--version']);
  } catch {
    console.error(chalk.red('未找到 Vercel CLI'));
    console.log(chalk.blue('请先安装 Vercel CLI: npm install -g vercel'));
    throw new Error('Vercel CLI 未安装');
  }
  
  // 创建 vercel.json 配置文件
  await createVercelConfig(cwd, buildDir);
  
  const spinner = ora('正在部署到 Vercel...').start();
  
  try {
    // 执行部署
    const result = await execa('vercel', ['--prod'], {
      cwd,
      stdio: 'pipe'
    });
    
    spinner.succeed('Vercel 部署完成');
    
    // 提取部署 URL
    const deployUrl = result.stdout.trim().split('\n').pop();
    if (deployUrl && deployUrl.startsWith('https://')) {
      console.log(chalk.green(`部署地址: ${deployUrl}`));
    }
  } catch (err) {
    spinner.fail('Vercel 部署失败');
    throw err;
  }
}

/**
 * 部署到 Netlify
 */
async function deployToNetlify(cwd: string, buildDir: string, _options: DeployOptions): Promise<void> {
  try {
    // 检查是否安装了 Netlify CLI
    await execa('netlify', ['--version']);
  } catch {
    console.error(chalk.red('未找到 Netlify CLI'));
    console.log(chalk.blue('请先安装 Netlify CLI: npm install -g netlify-cli'));
    throw new Error('Netlify CLI 未安装');
  }
  
  // 创建 netlify.toml 配置文件
  await createNetlifyConfig(cwd, buildDir);
  
  const spinner2 = ora('正在部署到 Netlify...').start();
  
  try {
    // 执行部署
    const result = await execa('netlify', ['deploy', '--prod', '--dir', buildDir], {
      cwd,
      stdio: 'pipe'
    });
    
    spinner2.succeed('Netlify 部署完成');
    
    // 提取部署 URL
    const output = result.stdout;
    const urlMatch = output.match(/Website URL:\s*(https:\/\/[^\s]+)/);
    if (urlMatch) {
      console.log(chalk.green(`部署地址: ${urlMatch[1]}`));
    }
  } catch (err) {
    spinner2.fail('Netlify 部署失败');
    throw err;
  }
}

/**
 * 部署到 GitHub Pages
 */
async function deployToGitHubPages(cwd: string, buildDir: string, _options: DeployOptions): Promise<void> {
  try {
    // 检查是否安装了 gh-pages
    await execa('npx', ['gh-pages', '--version']);
  } catch {
    console.log(chalk.yellow('未找到 gh-pages，正在安装...'));
    await execa('npm', ['install', '-D', 'gh-pages'], { cwd });
  }
  
  const spinner3 = ora('正在部署到 GitHub Pages...').start();
  
  try {
    // 执行部署
    await execa('npx', ['gh-pages', '-d', buildDir], {
      cwd,
      stdio: 'pipe'
    });
    
    spinner3.succeed('GitHub Pages 部署完成');
    
    // 获取仓库信息
    const packageJson = await readJsonFile(path.join(cwd, 'package.json'));
    if (packageJson.repository?.url) {
      const repoUrl = packageJson.repository.url
        .replace('git+', '')
        .replace('.git', '')
        .replace('git://', 'https://')
        .replace('ssh://git@', 'https://');
      
      const githubPagesUrl = repoUrl
        .replace('https://github.com/', 'https://')
        .replace('/', '.github.io/') + '/';
      
      console.log(chalk.green(`部署地址: ${githubPagesUrl}`));
    }
  } catch (err) {
    spinner3.fail('GitHub Pages 部署失败');
    throw err;
  }
}

/**
 * 自定义部署
 */
async function deployCustom(cwd: string, buildDir: string, _options: DeployOptions): Promise<void> {
  const { deployScript } = await inquirer.prompt([
    {
      type: 'input',
      name: 'deployScript',
      message: '请输入部署命令:',
      default: `rsync -avz ${buildDir}/ user@server:/path/to/deploy/`
    }
  ]);
  
  if (!deployScript.trim()) {
    console.error(chalk.red('部署命令不能为空'));
    return;
  }
  
  const spinner4 = ora('正在执行自定义部署...').start();
  
  try {
    // 解析命令
    const [command, ...args] = deployScript.split(' ');
    
    await execa(command, args, {
      cwd,
      stdio: 'inherit'
    });
    
    spinner4.succeed('自定义部署完成');
  } catch (err) {
    spinner4.fail('自定义部署失败');
    throw err;
  }
}

/**
 * 创建 Vercel 配置文件
 */
async function createVercelConfig(cwd: string, buildDir: string): Promise<void> {
  const configPath = path.join(cwd, 'vercel.json');
  
  if (await fileExists(configPath)) {
    return; // 配置文件已存在
  }
  
  const config = {
    version: 2,
    builds: [
      {
        src: `${buildDir}/**/*`,
        use: '@vercel/static'
      }
    ],
    routes: [
      {
        src: '/(.*)',
        dest: `/${buildDir}/$1`
      }
    ]
  };
  
  await writeJsonFile(configPath, config);
  console.log(chalk.blue('已创建 vercel.json 配置文件'));
}

/**
 * 创建 Netlify 配置文件
 */
async function createNetlifyConfig(cwd: string, buildDir: string): Promise<void> {
  const configPath = path.join(cwd, 'netlify.toml');
  
  if (await fileExists(configPath)) {
    return; // 配置文件已存在
  }
  
  const config = `[build]
  publish = "${buildDir}"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`;
  
  const fs = await import('fs-extra');
  await fs.writeFile(configPath, config, 'utf8');
  console.log(chalk.blue('已创建 netlify.toml 配置文件'));
}

/**
 * 获取部署状态
 */
export async function getDeployStatus(cwd: string): Promise<{
  platform?: string;
  lastDeploy?: Date;
  url?: string;
}> {
  try {
    // 检查 Vercel 配置
    if (await fileExists(path.join(cwd, 'vercel.json'))) {
      return { platform: 'vercel' };
    }
    
    // 检查 Netlify 配置
    if (await fileExists(path.join(cwd, 'netlify.toml'))) {
      return { platform: 'netlify' };
    }
    
    // 检查 GitHub Pages
    const packageJson = await readJsonFile(path.join(cwd, 'package.json'));
    if (packageJson.devDependencies?.['gh-pages']) {
      return { platform: 'github-pages' };
    }
    
    return {};
  } catch {
    return {};
  }
}