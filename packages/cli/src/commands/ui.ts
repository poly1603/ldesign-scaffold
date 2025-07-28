import { Command } from 'commander';
import { execa } from 'execa';
import open from 'open';
import chalk from 'chalk';
import { UIOptions } from '../types/index.js';
import { findAvailablePort } from './dev.js';

export const uiCommand = new Command()
  .name('ui')
  .description('启动可视化界面')
  .option('-p, --port <port>', '指定端口号', '3001')
  .option('-h, --host <host>', '指定主机地址', 'localhost')
  .option('--no-open', '不自动打开浏览器')
  .action(async (options: UIOptions) => {
    await startUI(options);
  });

/**
 * 启动可视化界面
 */
export async function startUI(options: UIOptions = {}): Promise<void> {
  try {
    // 检查是否安装了 UI 包
    const hasUIPackage = await checkUIPackage();
    if (!hasUIPackage) {
      console.error(chalk.red('UI 界面包未安装'));
      console.log(chalk.blue('请确保已安装 @ldesign/ui 包'));
      return;
    }
    
    // 查找可用端口
    const port = await findAvailablePort(Number(options.port) || 3001, options.host);
    const host = options.host || 'localhost';
    
    // 构建 UI 服务器 URL
    const uiUrl = `http://${host}:${port}`;
    
    console.log(chalk.green('🎨 正在启动可视化界面...'));
    console.log();
    console.log(chalk.blue(`界面地址: ${uiUrl}`));
    console.log();
    
    // 启动 UI 服务器
    const uiProcess = startUIServer(port, host);
    
    // 等待服务器启动
    await waitForServer(uiUrl);
    
    // 自动打开浏览器
    if (options.open !== false) {
      try {
        await open(uiUrl);
        console.log(chalk.green('🌐 浏览器已自动打开'));
      } catch {
        console.log(chalk.blue('请手动打开浏览器访问上述地址'));
      }
    }
    
    // 处理进程退出
    process.on('SIGINT', () => {
      uiProcess.kill('SIGINT');
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      uiProcess.kill('SIGTERM');
      process.exit(0);
    });
    
    // 等待 UI 进程结束
    await uiProcess;
    
  } catch (err) {
    console.error(chalk.red(`可视化界面启动失败: ${err}`));
    process.exit(1);
  }
}

/**
 * 检查 UI 包是否存在
 */
async function checkUIPackage(): Promise<boolean> {
  try {
    // 检查是否在开发环境中
    const path = await import('path');
    const fs = await import('fs-extra');
    
    // 检查是否存在 UI 应用目录（开发环境）
    const uiAppPath = path.resolve(process.cwd(), 'apps/ui');
    const uiPackageJsonPath = path.join(uiAppPath, 'package.json');
    
    if (await fs.pathExists(uiPackageJsonPath)) {
      return true;
    }
    
    // 检查是否全局安装了 @ldesign/ui 包（生产环境）
    try {
      await execa('npm', ['list', '-g', '@ldesign/ui'], { stdio: 'pipe' });
      return true;
    } catch {
      // 检查本地是否安装了 @ldesign/ui 包
      try {
        await execa('npm', ['list', '@ldesign/ui'], { stdio: 'pipe' });
        return true;
      } catch {
        return false;
      }
    }
  } catch {
    return false;
  }
}

/**
 * 启动 UI 服务器
 */
function startUIServer(port: number, host: string) {
  const env = {
    ...process.env,
    PORT: String(port),
    HOST: host,
    NODE_ENV: 'development'
  };
  
  // 检查是否在开发环境中（存在 apps/ui 目录）
  const path = require('path');
  const fs = require('fs-extra');
  const uiAppPath = path.resolve(process.cwd(), 'apps/ui');
  
  if (fs.existsSync(uiAppPath)) {
    // 开发环境：启动本地 UI 应用
    console.log(chalk.blue('检测到开发环境，启动本地 UI 应用...'));
    return execa('pnpm', ['run', 'dev'], {
      cwd: uiAppPath,
      stdio: 'inherit',
      env
    });
  } else {
    // 生产环境：尝试启动已安装的 UI 包
    console.log(chalk.blue('启动已安装的 UI 包...'));
    return execa('npx', ['@ldesign/ui'], {
      stdio: 'inherit',
      env
    });
  }
}

/**
 * 等待服务器启动
 */
async function waitForServer(url: string, timeout = 30000): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // 服务器还未启动，继续等待
    }
    
    // 等待 1 秒后重试
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  throw new Error('服务器启动超时');
}

/**
 * 获取 UI 服务器状态
 */
export async function getUIServerStatus(port = 3001, host = 'localhost'): Promise<{
  running: boolean;
  url?: string;
  pid?: number;
}> {
  try {
    const url = `http://${host}:${port}`;
    const response = await fetch(url);
    
    if (response.ok) {
      return {
        running: true,
        url
      };
    }
  } catch {
    // 服务器未运行
  }
  
  return { running: false };
}

/**
 * 停止 UI 服务器
 */
export async function stopUIServer(port = 3001): Promise<void> {
  try {
    // 在 Windows 上查找并终止进程
    if (process.platform === 'win32') {
      await execa('netstat', ['-ano'], { stdio: 'pipe' })
        .then(result => {
          const lines = result.stdout.split('\n');
          for (const line of lines) {
            if (line.includes(`:${port} `) && line.includes('LISTENING')) {
              const parts = line.trim().split(/\s+/);
              const pid = parts[parts.length - 1];
              if (pid && !isNaN(Number(pid))) {
                return execa('taskkill', ['/F', '/PID', pid]);
              }
            }
          }
        });
    } else {
      // 在 Unix 系统上使用 lsof
      await execa('lsof', [`-ti:${port}`], { stdio: 'pipe' })
        .then(result => {
          const pid = result.stdout.trim();
          if (pid) {
            return execa('kill', ['-9', pid]);
          }
        });
    }
    
    console.log(chalk.green('UI 服务器已停止'));
  } catch {
    // 进程可能已经停止或不存在
  }
}

/**
 * 重启 UI 服务器
 */
export async function restartUIServer(options: UIOptions = {}): Promise<void> {
  const port = Number(options.port) || 3001;
  
  console.log(chalk.blue('正在重启 UI 服务器...'));
  
  // 停止现有服务器
  await stopUIServer(port);
  
  // 等待一段时间确保端口释放
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 重新启动服务器
  await startUI(options);
}

/**
 * 获取 UI 配置
 */
export async function getUIConfig(): Promise<{
  theme: string;
  language: string;
  autoSave: boolean;
  [key: string]: any;
}> {
  try {
    const os = await import('os');
    const path = await import('path');
    const fs = await import('fs-extra');
    
    const configDir = path.join(os.homedir(), '.ldesign');
    const configFile = path.join(configDir, 'ui-config.json');
    
    if (await fs.pathExists(configFile)) {
      return await fs.readJson(configFile);
    }
  } catch {
    // 使用默认配置
  }
  
  return {
    theme: 'light',
    language: 'zh-CN',
    autoSave: true
  };
}

/**
 * 保存 UI 配置
 */
export async function saveUIConfig(config: Record<string, any>): Promise<void> {
  try {
    const os = await import('os');
    const path = await import('path');
    const fs = await import('fs-extra');
    
    const configDir = path.join(os.homedir(), '.ldesign');
    const configFile = path.join(configDir, 'ui-config.json');
    
    await fs.ensureDir(configDir);
    await fs.writeJson(configFile, config, { spaces: 2 });
    
    console.log(chalk.green('UI 配置已保存'));
  } catch (err) {
    console.error(chalk.red(`保存 UI 配置失败: ${err}`));
  }
}