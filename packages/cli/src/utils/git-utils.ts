import { execa } from 'execa';
import chalk from 'chalk';
import ora from 'ora';

/**
 * 检查是否安装了 Git
 */
export async function isGitInstalled(): Promise<boolean> {
  try {
    await execa('git', ['--version']);
    return true;
  } catch {
    return false;
  }
}

/**
 * 检查是否在 Git 仓库中
 */
export async function isGitRepository(cwd: string): Promise<boolean> {
  try {
    await execa('git', ['rev-parse', '--git-dir'], { cwd });
    return true;
  } catch {
    return false;
  }
}

/**
 * 初始化 Git 仓库
 */
export async function initGitRepository(cwd: string): Promise<void> {
  try {
    const spinner = ora('正在初始化 Git 仓库...').start();
    
    await execa('git', ['init'], { cwd });
    
    spinner.succeed('Git 仓库初始化完成');
  } catch (error) {
    console.error(chalk.red('Git 仓库初始化失败'));
    throw error;
  }
}

/**
 * 添加文件到 Git
 */
export async function gitAdd(cwd: string, files: string[] = ['.']): Promise<void> {
  try {
    await execa('git', ['add', ...files], { cwd });
  } catch (error) {
    console.error(chalk.red('Git add 失败'));
    throw error;
  }
}

/**
 * Git 提交
 */
export async function gitCommit(cwd: string, message: string): Promise<void> {
  try {
    await execa('git', ['commit', '-m', message], { cwd });
  } catch (error) {
    console.error(chalk.red('Git commit 失败'));
    throw error;
  }
}

/**
 * 创建初始提交
 */
export async function createInitialCommit(cwd: string): Promise<void> {
  try {
    const spinner = ora('正在创建初始提交...').start();
    
    await gitAdd(cwd);
    await gitCommit(cwd, 'feat: initial commit');
    
    spinner.succeed('初始提交创建完成');
  } catch (error) {
    console.error(chalk.red('初始提交创建失败'));
    throw error;
  }
}

/**
 * 获取 Git 用户信息
 */
export async function getGitUserInfo(): Promise<{ name?: string; email?: string }> {
  try {
    const [nameResult, emailResult] = await Promise.allSettled([
      execa('git', ['config', '--global', 'user.name']),
      execa('git', ['config', '--global', 'user.email'])
    ]);
    
    return {
      name: nameResult.status === 'fulfilled' ? nameResult.value.stdout.trim() : undefined,
      email: emailResult.status === 'fulfilled' ? emailResult.value.stdout.trim() : undefined
    };
  } catch {
    return {};
  }
}

/**
 * 设置 Git 用户信息
 */
export async function setGitUserInfo(name: string, email: string, cwd: string): Promise<void> {
  try {
    await execa('git', ['config', 'user.name', name], { cwd });
    await execa('git', ['config', 'user.email', email], { cwd });
  } catch (error) {
    console.error(chalk.red('设置 Git 用户信息失败'));
    throw error;
  }
}

/**
 * 获取当前分支名
 */
export async function getCurrentBranch(cwd: string): Promise<string> {
  try {
    const result = await execa('git', ['branch', '--show-current'], { cwd });
    return result.stdout.trim();
  } catch {
    return 'main';
  }
}

/**
 * 创建分支
 */
export async function createBranch(cwd: string, branchName: string): Promise<void> {
  try {
    await execa('git', ['checkout', '-b', branchName], { cwd });
  } catch (error) {
    console.error(chalk.red(`创建分支 ${branchName} 失败`));
    throw error;
  }
}

/**
 * 切换分支
 */
export async function checkoutBranch(cwd: string, branchName: string): Promise<void> {
  try {
    await execa('git', ['checkout', branchName], { cwd });
  } catch (error) {
    console.error(chalk.red(`切换到分支 ${branchName} 失败`));
    throw error;
  }
}

/**
 * 获取所有分支
 */
export async function getAllBranches(cwd: string): Promise<string[]> {
  try {
    const result = await execa('git', ['branch', '--all'], { cwd });
    return result.stdout
      .split('\n')
      .map(line => line.trim().replace(/^\*\s*/, '').replace(/^remotes\/origin\//, ''))
      .filter(line => line && !line.includes('HEAD'));
  } catch {
    return [];
  }
}

/**
 * 获取提交历史
 */
export async function getCommitHistory(cwd: string, limit = 10): Promise<Array<{
  hash: string;
  message: string;
  author: string;
  date: string;
}>> {
  try {
    const result = await execa('git', [
      'log',
      `--max-count=${limit}`,
      '--pretty=format:%H|%s|%an|%ad',
      '--date=short'
    ], { cwd });
    
    return result.stdout
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [hash, message, author, date] = line.split('|');
        return { hash, message, author, date };
      });
  } catch {
    return [];
  }
}

/**
 * 获取文件状态
 */
export async function getFileStatus(cwd: string): Promise<Array<{
  file: string;
  status: string;
}>> {
  try {
    const result = await execa('git', ['status', '--porcelain'], { cwd });
    
    return result.stdout
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const status = line.substring(0, 2);
        const file = line.substring(3);
        return { file, status };
      });
  } catch {
    return [];
  }
}

/**
 * 推送到远程仓库
 */
export async function gitPush(cwd: string, remote = 'origin', branch?: string): Promise<void> {
  try {
    const args = ['push', remote];
    if (branch) {
      args.push(branch);
    }
    
    const spinner = ora('正在推送到远程仓库...').start();
    
    await execa('git', args, { cwd });
    
    spinner.succeed('推送完成');
  } catch (error) {
    console.error(chalk.red('推送失败'));
    throw error;
  }
}

/**
 * 从远程仓库拉取
 */
export async function gitPull(cwd: string, remote = 'origin', branch?: string): Promise<void> {
  try {
    const args = ['pull', remote];
    if (branch) {
      args.push(branch);
    }
    
    const spinner = ora('正在从远程仓库拉取...').start();
    
    await execa('git', args, { cwd });
    
    spinner.succeed('拉取完成');
  } catch (error) {
    console.error(chalk.red('拉取失败'));
    throw error;
  }
}