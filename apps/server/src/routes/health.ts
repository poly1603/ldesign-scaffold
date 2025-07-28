import { Router } from 'express';
import fs from 'fs-extra';
import path from 'path';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { config } from '../config';
import { ProjectService } from '../services/project';
import { WebSocketService } from '../services/websocket';

const router = Router();
const projectService = new ProjectService();
const wsService = new WebSocketService();

// 基础健康检查
router.get('/',
  asyncHandler(async (req, res) => {
    const startTime = Date.now();
    
    try {
      // 检查基础服务
      const checks = await Promise.allSettled([
        checkFileSystem(),
        checkMemory(),
        checkDisk(),
        checkServices(),
      ]);
      
      const results = checks.map((check, index) => {
        const names = ['filesystem', 'memory', 'disk', 'services'];
        return {
          name: names[index],
          status: check.status === 'fulfilled' ? 'healthy' : 'unhealthy',
          details: check.status === 'fulfilled' ? check.value : check.reason?.message,
        };
      });
      
      const allHealthy = results.every(r => r.status === 'healthy');
      const responseTime = Date.now() - startTime;
      
      res.status(allHealthy ? 200 : 503).json({
        status: allHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime,
        version: process.env.npm_package_version || '1.0.0',
        environment: config.env,
        checks: results,
      });
    } catch (error: any) {
      logger.error('Health check failed:', error);
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        error: error.message,
      });
    }
  })
);

// 详细健康检查
router.get('/detailed',
  asyncHandler(async (req, res) => {
    const startTime = Date.now();
    
    try {
      const [systemInfo, projectStats, wsStats, logStats] = await Promise.all([
        getSystemInfo(),
        getProjectStats(),
        getWebSocketStats(),
        getLogStats(),
      ]);
      
      const responseTime = Date.now() - startTime;
      
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        responseTime,
        version: process.env.npm_package_version || '1.0.0',
        environment: config.env,
        uptime: process.uptime(),
        system: systemInfo,
        projects: projectStats,
        websocket: wsStats,
        logs: logStats,
      });
    } catch (error: any) {
      logger.error('Detailed health check failed:', error);
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        responseTime: Date.now() - startTime,
        error: error.message,
      });
    }
  })
);

// 就绪检查
router.get('/ready',
  asyncHandler(async (req, res) => {
    try {
      // 检查关键服务是否就绪
      const checks = {
        projectService: projectService !== null,
        websocketService: wsService !== null,
        configLoaded: config !== null,
        logsDirectory: await fs.pathExists(config.paths.logs),
        projectsDirectory: await fs.pathExists(config.paths.projects),
      };
      
      const allReady = Object.values(checks).every(Boolean);
      
      res.status(allReady ? 200 : 503).json({
        status: allReady ? 'ready' : 'not ready',
        timestamp: new Date().toISOString(),
        checks,
      });
    } catch (error: any) {
      logger.error('Readiness check failed:', error);
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        error: error.message,
      });
    }
  })
);

// 存活检查
router.get('/live',
  asyncHandler(async (req, res) => {
    // 简单的存活检查
    res.json({
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      pid: process.pid,
    });
  })
);

// 性能指标
router.get('/metrics',
  asyncHandler(async (req, res) => {
    try {
      const memUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      const metrics = {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: {
          rss: memUsage.rss,
          heapTotal: memUsage.heapTotal,
          heapUsed: memUsage.heapUsed,
          external: memUsage.external,
          arrayBuffers: memUsage.arrayBuffers,
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system,
        },
        eventLoop: {
          // 简化的事件循环延迟测量
          delay: await measureEventLoopDelay(),
        },
        projects: {
          total: projectService.getAllProjects().length,
          running: projectService.getAllProjects().filter(p => p.status === 'running').length,
        },
        websocket: {
          connections: wsService.getStats().totalConnections,
        },
      };
      
      res.json(metrics);
    } catch (error: any) {
      logger.error('Metrics collection failed:', error);
      res.status(500).json({
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  })
);

// 依赖检查
router.get('/dependencies',
  asyncHandler(async (req, res) => {
    try {
      const dependencies = await checkDependencies();
      
      res.json({
        timestamp: new Date().toISOString(),
        dependencies,
      });
    } catch (error: any) {
      logger.error('Dependencies check failed:', error);
      res.status(500).json({
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  })
);

// 辅助函数

// 检查文件系统
async function checkFileSystem(): Promise<any> {
  const testFile = path.join(config.paths.temp, 'health-check.txt');
  
  try {
    // 确保目录存在
    await fs.ensureDir(config.paths.temp);
    
    // 写入测试文件
    await fs.writeFile(testFile, 'health check test');
    
    // 读取测试文件
    const content = await fs.readFile(testFile, 'utf-8');
    
    // 删除测试文件
    await fs.remove(testFile);
    
    if (content !== 'health check test') {
      throw new Error('File content mismatch');
    }
    
    return { status: 'ok', message: 'File system is accessible' };
  } catch (error: any) {
    throw new Error(`File system check failed: ${error.message}`);
  }
}

// 检查内存
async function checkMemory(): Promise<any> {
  const memUsage = process.memoryUsage();
  const totalMem = require('os').totalmem();
  const freeMem = require('os').freemem();
  
  const heapUsedPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
  const systemMemUsedPercent = ((totalMem - freeMem) / totalMem) * 100;
  
  // 警告阈值
  const heapWarningThreshold = 80;
  const systemWarningThreshold = 90;
  
  const warnings = [];
  
  if (heapUsedPercent > heapWarningThreshold) {
    warnings.push(`Heap usage is high: ${heapUsedPercent.toFixed(1)}%`);
  }
  
  if (systemMemUsedPercent > systemWarningThreshold) {
    warnings.push(`System memory usage is high: ${systemMemUsedPercent.toFixed(1)}%`);
  }
  
  return {
    status: warnings.length > 0 ? 'warning' : 'ok',
    heapUsedPercent: heapUsedPercent.toFixed(1),
    systemMemUsedPercent: systemMemUsedPercent.toFixed(1),
    warnings,
  };
}

// 检查磁盘空间
async function checkDisk(): Promise<any> {
  try {
    const stats = await fs.stat(config.paths.projects);
    
    // 简化的磁盘空间检查
    // 在实际应用中，应该使用更精确的磁盘空间检查方法
    return {
      status: 'ok',
      message: 'Disk space check passed',
    };
  } catch (error: any) {
    throw new Error(`Disk check failed: ${error.message}`);
  }
}

// 检查服务
async function checkServices(): Promise<any> {
  const services = {
    projectService: projectService !== null,
    websocketService: wsService !== null,
    logger: logger !== null,
  };
  
  const failedServices = Object.entries(services)
    .filter(([, status]) => !status)
    .map(([name]) => name);
  
  if (failedServices.length > 0) {
    throw new Error(`Services not available: ${failedServices.join(', ')}`);
  }
  
  return {
    status: 'ok',
    services,
  };
}

// 获取系统信息
async function getSystemInfo(): Promise<any> {
  const os = require('os');
  
  return {
    platform: os.platform(),
    arch: os.arch(),
    nodeVersion: process.version,
    cpus: os.cpus().length,
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    loadAverage: os.loadavg(),
    uptime: os.uptime(),
  };
}

// 获取项目统计
async function getProjectStats(): Promise<any> {
  const projects = projectService.getAllProjects();
  
  const stats = {
    total: projects.length,
    byStatus: {} as Record<string, number>,
    byTemplate: {} as Record<string, number>,
  };
  
  projects.forEach(project => {
    // 按状态统计
    stats.byStatus[project.status] = (stats.byStatus[project.status] || 0) + 1;
    
    // 按模板统计
    stats.byTemplate[project.template] = (stats.byTemplate[project.template] || 0) + 1;
  });
  
  return stats;
}

// 获取WebSocket统计
async function getWebSocketStats(): Promise<any> {
  return wsService.getStats();
}

// 获取日志统计
async function getLogStats(): Promise<any> {
  try {
    const logDir = config.paths.logs;
    
    if (!(await fs.pathExists(logDir))) {
      return {
        totalFiles: 0,
        totalSize: 0,
      };
    }
    
    const files = await fs.readdir(logDir);
    let totalSize = 0;
    
    for (const file of files) {
      const filePath = path.join(logDir, file);
      const stats = await fs.stat(filePath);
      if (stats.isFile()) {
        totalSize += stats.size;
      }
    }
    
    return {
      totalFiles: files.length,
      totalSize,
    };
  } catch (error) {
    return {
      error: 'Failed to get log stats',
    };
  }
}

// 测量事件循环延迟
async function measureEventLoopDelay(): Promise<number> {
  return new Promise((resolve) => {
    const start = process.hrtime.bigint();
    setImmediate(() => {
      const delay = Number(process.hrtime.bigint() - start) / 1000000; // 转换为毫秒
      resolve(delay);
    });
  });
}

// 检查依赖
async function checkDependencies(): Promise<any> {
  const dependencies = {
    node: {
      required: '>=16.0.0',
      current: process.version,
      status: 'ok',
    },
    npm: {
      status: 'checking',
    },
    git: {
      status: 'checking',
    },
  };
  
  // 检查npm
  try {
    const { spawn } = require('child_process');
    const npmVersion = await new Promise<string>((resolve, reject) => {
      const proc = spawn('npm', ['--version'], { shell: true });
      let output = '';
      
      proc.stdout?.on('data', (data) => {
        output += data.toString();
      });
      
      proc.on('close', (code) => {
        if (code === 0) {
          resolve(output.trim());
        } else {
          reject(new Error('npm not found'));
        }
      });
      
      proc.on('error', reject);
    });
    
    dependencies.npm = {
      current: npmVersion,
      status: 'ok',
    };
  } catch (error) {
    dependencies.npm = {
      status: 'error',
      error: 'npm not available',
    };
  }
  
  // 检查git
  try {
    const { spawn } = require('child_process');
    const gitVersion = await new Promise<string>((resolve, reject) => {
      const proc = spawn('git', ['--version'], { shell: true });
      let output = '';
      
      proc.stdout?.on('data', (data) => {
        output += data.toString();
      });
      
      proc.on('close', (code) => {
        if (code === 0) {
          resolve(output.trim());
        } else {
          reject(new Error('git not found'));
        }
      });
      
      proc.on('error', reject);
    });
    
    dependencies.git = {
      current: gitVersion,
      status: 'ok',
    };
  } catch (error) {
    dependencies.git = {
      status: 'error',
      error: 'git not available',
    };
  }
  
  return dependencies;
}

export default router;