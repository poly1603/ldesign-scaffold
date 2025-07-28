import { execa } from 'execa';
import { checkPackageManager } from './check-version.js';
import chalk from 'chalk';
import ora from 'ora';

export type PackageManager = 'npm' | 'yarn' | 'pnpm';

/**
 * 检测可用的包管理器
 */
export function detectPackageManager(): PackageManager {
  // 优先使用 pnpm
  if (checkPackageManager('pnpm')) {
    return 'pnpm';
  }
  
  // 其次使用 yarn
  if (checkPackageManager('yarn')) {
    return 'yarn';
  }
  
  // 最后使用 npm
  return 'npm';
}

/**
 * 获取包管理器的安装命令
 */
export function getInstallCommand(manager: PackageManager): string[] {
  switch (manager) {
    case 'pnpm':
      return ['pnpm', 'install'];
    case 'yarn':
      return ['yarn', 'install'];
    case 'npm':
    default:
      return ['npm', 'install'];
  }
}

/**
 * 获取包管理器的添加依赖命令
 */
export function getAddCommand(manager: PackageManager, packages: string[], isDev = false): string[] {
  switch (manager) {
    case 'pnpm':
      return ['pnpm', 'add', ...(isDev ? ['-D'] : []), ...packages];
    case 'yarn':
      return ['yarn', 'add', ...(isDev ? ['-D'] : []), ...packages];
    case 'npm':
    default:
      return ['npm', 'install', ...(isDev ? ['--save-dev'] : []), ...packages];
  }
}

/**
 * 获取包管理器的运行脚本命令
 */
export function getRunCommand(manager: PackageManager, script: string): string[] {
  switch (manager) {
    case 'pnpm':
      return ['pnpm', 'run', script];
    case 'yarn':
      return ['yarn', 'run', script];
    case 'npm':
    default:
      return ['npm', 'run', script];
  }
}

/**
 * 安装依赖
 */
export async function installDependencies(
  cwd: string,
  manager: PackageManager = 'npm'
): Promise<void> {
  const command = getInstallCommand(manager);
  
  const spinner = ora(`正在使用 ${manager} 安装依赖...`).start();
  
  try {
    await execa(command[0], command.slice(1), {
      cwd,
      stdio: 'pipe',
    });
    
    spinner.succeed(`依赖安装完成`);
  } catch (error) {
    spinner.fail(`依赖安装失败`);
    throw error;
  }
}

/**
 * 添加依赖
 */
export async function addDependencies(
  cwd: string,
  packages: string[],
  isDev = false,
  manager: PackageManager = 'npm'
): Promise<void> {
  const command = getAddCommand(manager, packages, isDev);
  const type = isDev ? '开发依赖' : '生产依赖';
  
  const spinner = ora(`正在添加${type}: ${packages.join(', ')}`).start();
  
  try {
    await execa(command[0], command.slice(1), {
      cwd,
      stdio: 'pipe',
    });
    
    spinner.succeed(`${type}添加完成`);
  } catch (error) {
    spinner.fail(`${type}添加失败`);
    throw error;
  }
}

/**
 * 运行脚本
 */
export async function runScript(
  cwd: string,
  script: string,
  manager: PackageManager = 'npm'
): Promise<void> {
  const command = getRunCommand(manager, script);
  
  console.log(chalk.blue(`运行脚本: ${script}`));
  
  try {
    await execa(command[0], command.slice(1), {
      cwd,
      stdio: 'inherit',
    });
  } catch (error) {
    console.error(chalk.red(`脚本运行失败: ${script}`));
    throw error;
  }
}

/**
 * 获取包管理器的锁文件名
 */
export function getLockFileName(manager: PackageManager): string {
  switch (manager) {
    case 'pnpm':
      return 'pnpm-lock.yaml';
    case 'yarn':
      return 'yarn.lock';
    case 'npm':
    default:
      return 'package-lock.json';
  }
}

/**
 * 检查是否存在锁文件
 */
export function hasLockFile(cwd: string, manager: PackageManager): boolean {
  const lockFile = getLockFileName(manager);
  const fs = require('fs');
  const path = require('path');
  
  return fs.existsSync(path.join(cwd, lockFile));
}