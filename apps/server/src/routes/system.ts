import { Router, Request, Response } from 'express';
import os from 'os';
import fs from 'fs-extra';
import path from 'path';
import { spawn } from 'child_process';
import { validateRequest, commonSchemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { config } from '../config';

const router = Router();

// 获取系统信息
router.get('/info',
  asyncHandler(async (_req: Request, res: Response) => {
    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      release: os.release(),
      hostname: os.hostname(),
      uptime: os.uptime(),
      loadavg: os.loadavg(),
      totalmem: os.totalmem(),
      freemem: os.freemem(),
      cpus: os.cpus().length,
      networkInterfaces: Object.keys(os.networkInterfaces()),
      node: {
        version: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
      },
      server: {
        version: process.env.npm_package_version || '1.0.0',
        environment: config.env,
        port: config.server.port,
        host: config.server.host,
      },
    };
    
    res.json({
      success: true,
      data: systemInfo,
    });
  })
);

// 获取磁盘使用情况
router.get('/disk',
  asyncHandler(async (_req: Request, res: Response) => {
    const diskInfo = await getDiskUsage();
    
    res.json({
      success: true,
      data: diskInfo,
    });
  })
);

// 获取进程信息
router.get('/processes',
  asyncHandler(async (_req: Request, res: Response) => {
    const processes = await getRunningProcesses();
    
    res.json({
      success: true,
      data: {
        processes,
        count: processes.length,
      },
    });
  })
);

// 获取环境变量
router.get('/env',
  asyncHandler(async (req, res) => {
    // 过滤敏感环境变量
    const sensitiveKeys = ['password', 'secret', 'token', 'key', 'auth'];
    const env = Object.entries(process.env)
      .filter(([key]) => {
        const lowerKey = key.toLowerCase();
        return !sensitiveKeys.some(sensitive => lowerKey.includes(sensitive));
      })
      .reduce((acc, [key, value]) => {
        acc[key] = value || '';
        return acc;
      }, {} as Record<string, string>);
    
    res.json({
      success: true,
      data: {
        env,
        count: Object.keys(env).length,
      },
    });
  })
);

// 获取已安装的工具
router.get('/tools',
  asyncHandler(async (req, res) => {
    const tools = await checkInstalledTools();
    
    res.json({
      success: true,
      data: {
        tools,
        available: tools.filter(tool => tool.installed).length,
        total: tools.length,
      },
    });
  })
);

// 获取系统配置
router.get('/config',
  asyncHandler(async (req, res) => {
    const configPath = path.join(config.paths.root, 'ldesign.config.json');
    let userConfig = {};
    
    try {
      if (await fs.pathExists(configPath)) {
        userConfig = await fs.readJson(configPath);
      }
    } catch (error) {
      logger.warn('Failed to load user config:', error);
    }
    
    res.json({
      success: true,
      data: {
        config: userConfig,
        paths: config.paths,
        limits: config.limits,
      },
    });
  })
);

// 更新系统配置
router.put('/config',
  validateRequest({ body: commonSchemas.systemConfig }),
  asyncHandler(async (req, res) => {
    const newConfig = req.body;
    const configPath = path.join(config.paths.root, 'ldesign.config.json');
    
    logger.info('Updating system config:', newConfig);
    
    await fs.writeJson(configPath, newConfig, { spaces: 2 });
    
    res.json({
      success: true,
      data: newConfig,
      message: 'System configuration updated successfully',
    });
  })
);

// 获取日志
router.get('/logs',
  asyncHandler(async (req, res) => {
    const { lines = 100, level = 'all' } = req.query as any;
    
    try {
      const logs = await logger.getLogs(parseInt(lines, 10));
      
      // 按级别过滤日志
      let filteredLogs = logs;
      if (level !== 'all') {
        filteredLogs = logs.filter(log => log.toLowerCase().includes(`[${level.toUpperCase()}]`));
      }
      
      res.json({
        success: true,
        data: {
          logs: filteredLogs,
          count: filteredLogs.length,
          total: logs.length,
        },
      });
    } catch (error) {
      logger.error('Failed to get logs:', error);
      res.json({
        success: true,
        data: {
          logs: [],
          count: 0,
          total: 0,
        },
      });
    }
  })
);

// 清空日志
router.delete('/logs',
  asyncHandler(async (req, res) => {
    logger.info('Clearing system logs');
    
    await logger.clearLogs();
    
    res.json({
      success: true,
      message: 'System logs cleared successfully',
    });
  })
);

// 下载日志
router.get('/logs/download',
  asyncHandler(async (req, res) => {
    const logFile = path.join(config.paths.logs, 'server.log');
    
    if (!(await fs.pathExists(logFile))) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'LOG_FILE_NOT_FOUND',
          message: 'Log file not found',
        },
      });
    }
    
    const filename = `ldesign-server-logs-${new Date().toISOString().split('T')[0]}.log`;
    
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'text/plain');
    
    const stream = fs.createReadStream(logFile);
    stream.pipe(res);
  })
);

// 执行系统命令
router.post('/command',
  asyncHandler(async (req, res) => {
    const { command, args = [], cwd, timeout = 30000 } = req.body;
    
    if (!command) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'COMMAND_REQUIRED',
          message: 'Command is required',
        },
      });
    }
    
    // 安全检查：只允许特定的命令
    const allowedCommands = ['node', 'npm', 'yarn', 'pnpm', 'git', 'which', 'where'];
    if (!allowedCommands.includes(command)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'COMMAND_NOT_ALLOWED',
          message: `Command '${command}' is not allowed`,
        },
      });
    }
    
    logger.info(`Executing command: ${command} ${args.join(' ')}`);
    
    try {
      const result = await executeCommand(command, args, { cwd, timeout });
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'COMMAND_EXECUTION_FAILED',
          message: error.message,
          details: error.details,
        },
      });
    }
  })
);

// 检查端口占用
router.get('/ports/:port',
  asyncHandler(async (req: Request, res: Response) => {
    const { port } = req.params;
    const portNumber = parseInt(port, 10);
    
    if (isNaN(portNumber) || portNumber < 1 || portNumber > 65535) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PORT',
          message: 'Port must be a number between 1 and 65535',
        },
      });
    }
    
    const isAvailable = await checkPortAvailability(portNumber);
    
    res.json({
      success: true,
      data: {
        port: portNumber,
        available: isAvailable,
        status: isAvailable ? 'free' : 'occupied',
      },
    });
  })
);

// 获取可用端口
router.get('/ports/available',
  asyncHandler(async (req: Request, res: Response) => {
    const { start = 3000, count = 10 } = req.query as any;
    const startPort = parseInt(start, 10);
    const portCount = Math.min(parseInt(count, 10), 50); // 限制最多50个
    
    const availablePorts: number[] = [];
    
    for (let port = startPort; port < startPort + 1000 && availablePorts.length < portCount; port++) {
      if (await checkPortAvailability(port)) {
        availablePorts.push(port);
      }
    }
    
    res.json({
      success: true,
      data: {
        ports: availablePorts,
        count: availablePorts.length,
        range: {
          start: startPort,
          end: startPort + 1000,
        },
      },
    });
  })
);

// 重启服务器
router.post('/restart',
  asyncHandler(async (_req: Request, res: Response) => {
    logger.info('Server restart requested');
    
    res.json({
      success: true,
      message: 'Server restart initiated',
    });
    
    // 延迟重启以确保响应发送完成
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  })
);

// 辅助函数

// 获取磁盘使用情况
async function getDiskUsage(): Promise<any> {
  try {
    // 在Windows上使用不同的方法
    if (os.platform() === 'win32') {
      return {
        total: 0,
        used: 0,
        free: 0,
        percentage: 0,
        path: config.paths.root,
      };
    }
    
    // Unix系统
    const result = await executeCommand('df', ['-h', config.paths.root]);
    const lines = result.stdout.split('\n');
    if (lines.length > 1) {
      const parts = lines[1].split(/\s+/);
      return {
        filesystem: parts[0],
        total: parts[1],
        used: parts[2],
        free: parts[3],
        percentage: parts[4],
        path: parts[5],
      };
    }
    
    return {
      total: 0,
      used: 0,
      free: 0,
      percentage: '0%',
      path: config.paths.root,
    };
  } catch (error) {
    logger.error('Failed to get disk usage:', error);
    return {
      total: 0,
      used: 0,
      free: 0,
      percentage: '0%',
      path: config.paths.root,
      error: 'Failed to get disk usage',
    };
  }
}

// 获取运行中的进程
async function getRunningProcesses(): Promise<any[]> {
  try {
    // 只返回Node.js相关的进程
    const processes = [];
    
    // 添加当前服务器进程
    processes.push({
      pid: process.pid,
      name: 'ldesign-server',
      cpu: 0,
      memory: Math.round(process.memoryUsage().rss / 1024 / 1024),
      uptime: Math.round(process.uptime()),
      status: 'running',
    });
    
    return processes;
  } catch (error) {
    logger.error('Failed to get running processes:', error);
    return [];
  }
}

// 检查已安装的工具
async function checkInstalledTools(): Promise<any[]> {
  const tools = [
    { name: 'Node.js', command: 'node', args: ['--version'] },
    { name: 'npm', command: 'npm', args: ['--version'] },
    { name: 'yarn', command: 'yarn', args: ['--version'] },
    { name: 'pnpm', command: 'pnpm', args: ['--version'] },
    { name: 'Git', command: 'git', args: ['--version'] },
    { name: 'VS Code', command: 'code', args: ['--version'] },
  ];
  
  const results = [];
  
  for (const tool of tools) {
    try {
      const result = await executeCommand(tool.command, tool.args, { timeout: 5000 });
      results.push({
        name: tool.name,
        command: tool.command,
        installed: true,
        version: result.stdout.trim().split('\n')[0],
      });
    } catch (error) {
      results.push({
        name: tool.name,
        command: tool.command,
        installed: false,
        version: null,
        error: 'Not found or not accessible',
      });
    }
  }
  
  return results;
}

// 执行命令
function executeCommand(
  command: string,
  args: string[] = [],
  options: { cwd?: string; timeout?: number } = {}
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve, reject) => {
    const { cwd, timeout = 30000 } = options;
    
    const child = spawn(command, args, {
      cwd: cwd || process.cwd(),
      stdio: 'pipe',
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });
    
    child.on('exit', (code) => {
      resolve({
        stdout,
        stderr,
        exitCode: code || 0,
      });
    });
    
    child.on('error', (error) => {
      reject({
        message: error.message,
        details: { stdout, stderr },
      });
    });
    
    // 设置超时
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      reject({
        message: 'Command execution timeout',
        details: { stdout, stderr, timeout },
      });
    }, timeout);
    
    child.on('exit', () => {
      clearTimeout(timer);
    });
  });
}

// 检查端口可用性
function checkPortAvailability(port: number): Promise<boolean> {
  const net = require('net');
  
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    
    server.on('error', () => resolve(false));
  });
}

// 获取常用目录列表
router.get('/common-directories',
  asyncHandler(async (req: any, res: any) => {
    try {
      const platform = os.platform();
      const homeDir = os.homedir();
      const commonDirs = [];

      // 添加用户主目录
      commonDirs.push({
        name: '用户主目录',
        path: homeDir,
        type: 'home'
      });

      // 添加桌面目录
      const desktopPath = path.join(homeDir, 'Desktop');
      if (await fs.pathExists(desktopPath)) {
        commonDirs.push({
          name: '桌面',
          path: desktopPath,
          type: 'desktop'
        });
      }

      // 添加文档目录
      const documentsPath = platform === 'win32'
        ? path.join(homeDir, 'Documents')
        : path.join(homeDir, 'Documents');
      if (await fs.pathExists(documentsPath)) {
        commonDirs.push({
          name: '文档',
          path: documentsPath,
          type: 'documents'
        });
      }

      // 添加开发目录（如果存在）
      const devPaths = [
        path.join(homeDir, 'dev'),
        path.join(homeDir, 'development'),
        path.join(homeDir, 'projects'),
        path.join(homeDir, 'workspace'),
        path.join(homeDir, 'code'),
      ];

      for (const devPath of devPaths) {
        if (await fs.pathExists(devPath)) {
          commonDirs.push({
            name: path.basename(devPath),
            path: devPath,
            type: 'development'
          });
        }
      }

      // Windows特定目录
      if (platform === 'win32') {
        const programFiles = 'C:\\Program Files';
        const programFilesX86 = 'C:\\Program Files (x86)';

        if (await fs.pathExists(programFiles)) {
          commonDirs.push({
            name: 'Program Files',
            path: programFiles,
            type: 'system'
          });
        }
      }

      res.json({
        success: true,
        data: {
          directories: commonDirs,
          currentDirectory: process.cwd(),
          platform
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || '获取目录列表失败'
      });
    }
  })
);

// 浏览目录内容
router.post('/browse-directory',
  asyncHandler(async (req: any, res: any) => {
    try {
      const { path: dirPath } = req.body;

      if (!dirPath) {
        throw new Error('目录路径不能为空');
      }

      // 验证路径是否存在
      if (!await fs.pathExists(dirPath)) {
        throw new Error('目录不存在');
      }

      const stats = await fs.stat(dirPath);
      if (!stats.isDirectory()) {
        throw new Error('路径不是有效的目录');
      }

      // 读取目录内容
      const items = await fs.readdir(dirPath);
      const directories = [];

      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        try {
          const itemStats = await fs.stat(itemPath);
          if (itemStats.isDirectory()) {
            directories.push({
              name: item,
              path: itemPath,
              isDirectory: true,
              size: itemStats.size,
              modified: itemStats.mtime
            });
          }
        } catch (error) {
          // 忽略无法访问的目录
          continue;
        }
      }

      // 按名称排序
      directories.sort((a, b) => a.name.localeCompare(b.name));

      // 获取父目录
      const parentPath = path.dirname(dirPath);
      const hasParent = parentPath !== dirPath;

      res.json({
        success: true,
        data: {
          currentPath: dirPath,
          parentPath: hasParent ? parentPath : null,
          directories,
          canWrite: await checkWritePermission(dirPath)
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || '浏览目录失败'
      });
    }
  })
);

// 检查写入权限的辅助函数
async function checkWritePermission(dirPath: string): Promise<boolean> {
  try {
    const testFile = path.join(dirPath, '.ldesign-write-test');
    await fs.writeFile(testFile, 'test');
    await fs.remove(testFile);
    return true;
  } catch (error) {
    return false;
  }
}

// 选择文件夹（返回建议的常用目录）
router.post('/select-folder',
  asyncHandler(async (req: any, res: any) => {
    try {
      // 不再打开系统对话框，而是返回建议的目录
      const homeDir = os.homedir();
      const platform = os.platform();

      // 建议的默认目录
      const suggestedPaths = [
        path.join(homeDir, 'Desktop'),
        path.join(homeDir, 'Documents'),
        path.join(homeDir, 'dev'),
        path.join(homeDir, 'projects'),
        path.join(homeDir, 'workspace'),
      ];

      // 找到第一个存在且可写的目录
      let defaultPath = homeDir;
      for (const suggestedPath of suggestedPaths) {
        if (await fs.pathExists(suggestedPath) && await checkWritePermission(suggestedPath)) {
          defaultPath = suggestedPath;
          break;
        }
      }

      res.json({
        success: true,
        data: {
          path: defaultPath,
          message: '已选择默认目录，您可以在下方手动修改路径'
        }
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || '选择文件夹失败'
      });
    }
  })
);

export default router;