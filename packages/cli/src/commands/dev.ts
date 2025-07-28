import { Command } from 'commander';
import path from 'path';
import { execa } from 'execa';
import chalk from 'chalk';
import { DevOptions } from '../types/index.js';
import { readJsonFile, fileExists } from '../utils/file-utils.js';
import { detectPackageManager, getRunCommand } from '../utils/package-manager.js';

export const devCommand = new Command()
  .name('dev')
  .description('启动开发服务器')
  .option('-p, --port <port>', '指定端口号', '3000')
  .option('-h, --host <host>', '指定主机地址', 'localhost')
  .option('--open', '自动打开浏览器')
  .option('--https', '使用 HTTPS')
  .action(async (options: DevOptions) => {
    await startDev(options);
  });

/**
 * 启动开发服务器
 */
export async function startDev(options: DevOptions = {}): Promise<void> {
  try {
    const cwd = process.cwd();
    
    // 检查是否存在 package.json
    const packageJsonPath = path.join(cwd, 'package.json');
    if (!(await fileExists(packageJsonPath))) {
      console.error(chalk.red('当前目录不是一个有效的项目目录（未找到 package.json）'));
      return;
    }
    
    // 读取 package.json
    const packageJson = await readJsonFile(packageJsonPath);
    
    // 检查是否有 dev 脚本
    if (!packageJson.scripts?.dev) {
      console.error(chalk.red('package.json 中未找到 dev 脚本'));
      console.log(chalk.blue('请确保项目配置了开发脚本'));
      return;
    }
    
    // 检测项目类型和构建工具
    const projectInfo = detectProjectType(packageJson);
    console.log(chalk.blue(`检测到项目类型: ${projectInfo.framework}`));
    console.log(chalk.blue(`构建工具: ${projectInfo.buildTool}`));
    
    // 构建环境变量
    const env = buildDevEnv(options);
    
    // 获取包管理器
    const packageManager = detectPackageManager();
    const command = getRunCommand(packageManager, 'dev');
    
    console.log(chalk.green('🚀 正在启动开发服务器...'));
    console.log();
    
    // 启动开发服务器
    const child = execa(command[0], command.slice(1), {
      cwd,
      stdio: 'inherit',
      env: {
        ...process.env,
        ...env
      }
    });
    
    // 处理进程退出
    process.on('SIGINT', () => {
      child.kill('SIGINT');
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      child.kill('SIGTERM');
      process.exit(0);
    });
    
    await child;
    
  } catch (err) {
    console.error(chalk.red(`开发服务器启动失败: ${err}`));
    process.exit(1);
  }
}

/**
 * 检测项目类型
 */
function detectProjectType(packageJson: any): {
  framework: string;
  buildTool: string;
} {
  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies
  };
  
  let framework = 'unknown';
  let buildTool = 'unknown';
  
  // 检测框架
  if (dependencies.vue && dependencies.vue.startsWith('^3')) {
    framework = 'Vue 3';
  } else if (dependencies.vue && dependencies.vue.startsWith('^2')) {
    framework = 'Vue 2';
  } else if (dependencies.react) {
    framework = 'React';
  } else if (dependencies.typescript && !dependencies.vue && !dependencies.react) {
    framework = 'TypeScript';
  } else if (dependencies.less) {
    framework = 'Less';
  } else {
    framework = 'Node.js';
  }
  
  // 检测构建工具
  if (dependencies.vite) {
    buildTool = 'Vite';
  } else if (dependencies.rollup) {
    buildTool = 'Rollup';
  } else if (dependencies.tsup) {
    buildTool = 'tsup';
  } else if (dependencies.webpack) {
    buildTool = 'Webpack';
  }
  
  return { framework, buildTool };
}

/**
 * 构建开发环境变量
 */
function buildDevEnv(options: DevOptions): Record<string, string> {
  const env: Record<string, string> = {};
  
  // 设置端口
  if (options.port) {
    env.PORT = String(options.port);
    env.VITE_PORT = String(options.port);
  }
  
  // 设置主机
  if (options.host) {
    env.HOST = options.host;
    env.VITE_HOST = options.host;
  }
  
  // 设置是否自动打开浏览器
  if (options.open) {
    env.OPEN = 'true';
    env.VITE_OPEN = 'true';
  }
  
  // 设置 HTTPS
  if (options.https) {
    env.HTTPS = 'true';
    env.VITE_HTTPS = 'true';
  }
  
  // 设置开发模式
  env.NODE_ENV = 'development';
  
  return env;
}

/**
 * 获取开发服务器 URL
 */
export function getDevServerUrl(options: DevOptions = {}): string {
  const protocol = options.https ? 'https' : 'http';
  const host = options.host || 'localhost';
  const port = options.port || 3000;
  
  return `${protocol}://${host}:${port}`;
}

/**
 * 检查端口是否可用
 */
export async function isPortAvailable(port: number, host = 'localhost'): Promise<boolean> {
  const net = await import('net');
  
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, host, () => {
      server.close(() => resolve(true));
    });
    
    server.on('error', () => resolve(false));
  });
}

/**
 * 查找可用端口
 */
export async function findAvailablePort(startPort = 3000, host = 'localhost'): Promise<number> {
  let port = startPort;
  
  while (port < startPort + 100) {
    if (await isPortAvailable(port, host)) {
      return port;
    }
    port++;
  }
  
  throw new Error(`无法找到可用端口 (尝试范围: ${startPort}-${startPort + 99})`);
}