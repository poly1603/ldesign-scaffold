import { Router } from 'express';
import { spawn, ChildProcess } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import archiver from 'archiver';
import { validateRequest, commonSchemas } from '../middleware/validation';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { ProjectService } from '../services/project';
import { WebSocketService } from '../services/websocket';
import { config } from '../config';

const router = Router();
const projectService = new ProjectService();
const wsService = new WebSocketService();

// 构建进程管理
const buildProcesses = new Map<string, ChildProcess>();
const buildQueue = new Map<string, { projectId: string; options: any; resolve: Function; reject: Function }>();
let activeBuildCount = 0;

// 获取项目构建状态
router.get('/:projectId/status',
  validateRequest({ params: commonSchemas.projectId }),
  asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    
    const project = projectService.getProject(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found',
        },
      });
    }
    
    const isBuilding = buildProcesses.has(projectId);
    const isQueued = buildQueue.has(projectId);
    const buildDir = path.join(project.path, 'dist');
    const hasBuild = await fs.pathExists(buildDir);
    
    let buildInfo = null;
    if (hasBuild) {
      try {
        const stats = await fs.stat(buildDir);
        const files = await fs.readdir(buildDir);
        buildInfo = {
          buildTime: stats.mtime,
          files: files.length,
          size: await getDirSize(buildDir),
        };
      } catch (error) {
        logger.warn(`Failed to get build info for project ${projectId}:`, error);
      }
    }
    
    res.json({
      success: true,
      data: {
        isBuilding,
        isQueued,
        hasBuild,
        buildInfo,
        queuePosition: isQueued ? Array.from(buildQueue.keys()).indexOf(projectId) + 1 : 0,
        activeBuildCount,
        maxConcurrentBuilds: config.build.maxConcurrent,
      },
    });
  })
);

// 构建项目
router.post('/:projectId/build',
  validateRequest({ 
    params: commonSchemas.projectId,
    body: commonSchemas.buildConfig,
  }),
  asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const buildOptions = req.body;
    
    const project = projectService.getProject(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found',
        },
      });
    }
    
    // 检查是否已在构建
    if (buildProcesses.has(projectId)) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'BUILD_IN_PROGRESS',
          message: 'Project is already being built',
        },
      });
    }
    
    // 检查是否已在队列中
    if (buildQueue.has(projectId)) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'BUILD_QUEUED',
          message: 'Project is already queued for build',
        },
      });
    }
    
    try {
      // 如果达到最大并发数，加入队列
      if (activeBuildCount >= config.build.maxConcurrent) {
        await new Promise<void>((resolve, reject) => {
          buildQueue.set(projectId, { projectId, options: buildOptions, resolve, reject });
          
          wsService.sendBuildProgress(projectId, {
            stage: 'queued',
            progress: 0,
            message: `Build queued (position: ${buildQueue.size})`,
          });
          
          logger.info(`Build queued for project ${projectId}`);
        });
      }
      
      // 开始构建
      const result = await buildProject(projectId, buildOptions);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error(`Build failed for project ${projectId}:`, error);
      res.status(400).json({
        success: false,
        error: {
          code: 'BUILD_FAILED',
          message: error.message || 'Build failed',
        },
      });
    }
  })
);

// 停止构建
router.post('/:projectId/stop',
  validateRequest({ params: commonSchemas.projectId }),
  asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    
    const project = projectService.getProject(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found',
        },
      });
    }
    
    // 停止构建进程
    const buildProcess = buildProcesses.get(projectId);
    if (buildProcess) {
      buildProcess.kill('SIGTERM');
      buildProcesses.delete(projectId);
      activeBuildCount--;
      
      wsService.sendBuildProgress(projectId, {
        stage: 'stopped',
        progress: 0,
        message: 'Build stopped by user',
      });
      
      logger.info(`Build stopped for project ${projectId}`);
      
      // 处理队列中的下一个构建
      processNextBuild();
    }
    
    // 从队列中移除
    if (buildQueue.has(projectId)) {
      const queueItem = buildQueue.get(projectId)!;
      buildQueue.delete(projectId);
      queueItem.reject(new Error('Build cancelled by user'));
      
      logger.info(`Build cancelled from queue for project ${projectId}`);
    }
    
    res.json({
      success: true,
      data: {
        message: 'Build stopped successfully',
      },
    });
  })
);

// 清理构建产物
router.delete('/:projectId/artifacts',
  validateRequest({ params: commonSchemas.projectId }),
  asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    
    const project = projectService.getProject(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found',
        },
      });
    }
    
    // 检查是否正在构建
    if (buildProcesses.has(projectId)) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'BUILD_IN_PROGRESS',
          message: 'Cannot clean artifacts while build is in progress',
        },
      });
    }
    
    try {
      const buildDirs = ['dist', 'build', '.next', '.nuxt', 'out'];
      let cleanedDirs = [];
      
      for (const dir of buildDirs) {
        const dirPath = path.join(project.path, dir);
        if (await fs.pathExists(dirPath)) {
          await fs.remove(dirPath);
          cleanedDirs.push(dir);
        }
      }
      
      logger.info(`Build artifacts cleaned for project ${projectId}:`, cleanedDirs);
      
      res.json({
        success: true,
        data: {
          cleanedDirs,
          message: 'Build artifacts cleaned successfully',
        },
      });
    } catch (error: any) {
      logger.error(`Failed to clean build artifacts for project ${projectId}:`, error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CLEAN_FAILED',
          message: error.message || 'Failed to clean build artifacts',
        },
      });
    }
  })
);

// 下载构建产物
router.get('/:projectId/download',
  validateRequest({ params: commonSchemas.projectId }),
  asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { format = 'zip' } = req.query as any;
    
    const project = projectService.getProject(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found',
        },
      });
    }
    
    const buildDir = path.join(project.path, 'dist');
    if (!(await fs.pathExists(buildDir))) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BUILD_NOT_FOUND',
          message: 'Build artifacts not found',
        },
      });
    }
    
    try {
      const filename = `${project.name}-build-${Date.now()}.${format}`;
      
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      const archive = archiver('zip', {
        zlib: { level: 9 },
      });
      
      archive.on('error', (err) => {
        logger.error(`Archive error for project ${projectId}:`, err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: {
              code: 'ARCHIVE_ERROR',
              message: 'Failed to create archive',
            },
          });
        }
      });
      
      archive.pipe(res);
      archive.directory(buildDir, false);
      await archive.finalize();
      
      logger.info(`Build artifacts downloaded for project ${projectId}`);
    } catch (error: any) {
      logger.error(`Failed to download build artifacts for project ${projectId}:`, error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: {
            code: 'DOWNLOAD_FAILED',
            message: error.message || 'Failed to download build artifacts',
          },
        });
      }
    }
  })
);

// 获取构建日志
router.get('/:projectId/logs',
  validateRequest({ params: commonSchemas.projectId }),
  asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { lines = 100 } = req.query as any;
    
    const project = projectService.getProject(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found',
        },
      });
    }
    
    try {
      const logFile = path.join(config.paths.logs, `build-${projectId}.log`);
      
      if (!(await fs.pathExists(logFile))) {
        return res.json({
          success: true,
          data: {
            logs: [],
            message: 'No build logs found',
          },
        });
      }
      
      const content = await fs.readFile(logFile, 'utf-8');
      const logLines = content.split('\n').filter(line => line.trim());
      const recentLogs = logLines.slice(-parseInt(lines, 10));
      
      res.json({
        success: true,
        data: {
          logs: recentLogs,
          total: logLines.length,
        },
      });
    } catch (error: any) {
      logger.error(`Failed to get build logs for project ${projectId}:`, error);
      res.status(500).json({
        success: false,
        error: {
          code: 'LOG_READ_FAILED',
          message: error.message || 'Failed to read build logs',
        },
      });
    }
  })
);

// 获取构建统计
router.get('/stats',
  asyncHandler(async (req, res) => {
    const stats = {
      activeBuildCount,
      queueLength: buildQueue.size,
      maxConcurrentBuilds: config.build.maxConcurrent,
      activeBuilds: Array.from(buildProcesses.keys()),
      queuedBuilds: Array.from(buildQueue.keys()),
    };
    
    res.json({
      success: true,
      data: stats,
    });
  })
);

// 辅助函数

// 构建项目
async function buildProject(projectId: string, options: any): Promise<any> {
  const project = projectService.getProject(projectId);
  if (!project) {
    throw new Error('Project not found');
  }
  
  activeBuildCount++;
  
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const logFile = path.join(config.paths.logs, `build-${projectId}.log`);
    
    // 确保日志目录存在
    fs.ensureDirSync(path.dirname(logFile));
    
    // 获取构建命令
    const buildCommand = getBuildCommand(project, options);
    
    wsService.sendBuildProgress(projectId, {
      stage: 'starting',
      progress: 0,
      message: `Starting build with command: ${buildCommand.command}`,
    });
    
    logger.info(`Starting build for project ${projectId}:`, buildCommand);
    
    // 启动构建进程
    const buildProcess = spawn(buildCommand.command, buildCommand.args, {
      cwd: project.path,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
      env: {
        ...process.env,
        ...buildCommand.env,
      },
    });
    
    buildProcesses.set(projectId, buildProcess);
    
    let output = '';
    let errorOutput = '';
    
    // 处理输出
    buildProcess.stdout?.on('data', (data) => {
      const text = data.toString();
      output += text;
      
      // 写入日志文件
      fs.appendFileSync(logFile, text);
      
      // 发送实时日志
      wsService.sendProjectLog(projectId, {
        type: 'build',
        level: 'info',
        message: text.trim(),
        timestamp: new Date().toISOString(),
      });
      
      // 解析构建进度
      const progress = parseBuildProgress(text);
      if (progress) {
        wsService.sendBuildProgress(projectId, progress);
      }
    });
    
    buildProcess.stderr?.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
      
      // 写入日志文件
      fs.appendFileSync(logFile, text);
      
      // 发送实时日志
      wsService.sendProjectLog(projectId, {
        type: 'build',
        level: 'error',
        message: text.trim(),
        timestamp: new Date().toISOString(),
      });
    });
    
    // 设置超时
    const timeout = setTimeout(() => {
      buildProcess.kill('SIGTERM');
      reject(new Error('Build timeout'));
    }, config.build.timeout);
    
    buildProcess.on('close', (code) => {
      clearTimeout(timeout);
      buildProcesses.delete(projectId);
      activeBuildCount--;
      
      const duration = Date.now() - startTime;
      
      if (code === 0) {
        wsService.sendBuildProgress(projectId, {
          stage: 'completed',
          progress: 100,
          message: `Build completed successfully in ${Math.round(duration / 1000)}s`,
        });
        
        logger.info(`Build completed for project ${projectId} in ${duration}ms`);
        
        resolve({
          success: true,
          duration,
          output: output.trim(),
          buildDir: path.join(project.path, 'dist'),
        });
      } else {
        wsService.sendBuildProgress(projectId, {
          stage: 'failed',
          progress: 0,
          message: `Build failed with exit code ${code}`,
        });
        
        logger.error(`Build failed for project ${projectId} with exit code ${code}`);
        
        reject(new Error(`Build failed with exit code ${code}\n${errorOutput}`));
      }
      
      // 处理队列中的下一个构建
      processNextBuild();
    });
    
    buildProcess.on('error', (error) => {
      clearTimeout(timeout);
      buildProcesses.delete(projectId);
      activeBuildCount--;
      
      wsService.sendBuildProgress(projectId, {
        stage: 'failed',
        progress: 0,
        message: `Build process error: ${error.message}`,
      });
      
      logger.error(`Build process error for project ${projectId}:`, error);
      
      reject(error);
      
      // 处理队列中的下一个构建
      processNextBuild();
    });
  });
}

// 处理队列中的下一个构建
function processNextBuild() {
  if (buildQueue.size > 0 && activeBuildCount < config.build.maxConcurrent) {
    const [projectId, queueItem] = buildQueue.entries().next().value;
    buildQueue.delete(projectId);
    
    buildProject(projectId, queueItem.options)
      .then(queueItem.resolve)
      .catch(queueItem.reject);
  }
}

// 获取构建命令
function getBuildCommand(project: any, options: any) {
  const { mode = 'production', target = 'web' } = options;
  
  // 检查package.json中的脚本
  const packageJsonPath = path.join(project.path, 'package.json');
  let packageJson: any = {};
  
  try {
    if (fs.existsSync(packageJsonPath)) {
      packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    }
  } catch (error) {
    logger.warn(`Failed to read package.json for project ${project.id}:`, error);
  }
  
  const scripts = packageJson.scripts || {};
  
  // 根据项目类型和配置选择构建命令
  let command = 'npm';
  let args = ['run', 'build'];
  let env: Record<string, string> = {
    NODE_ENV: mode,
  };
  
  // 检查是否使用pnpm或yarn
  if (fs.existsSync(path.join(project.path, 'pnpm-lock.yaml'))) {
    command = 'pnpm';
  } else if (fs.existsSync(path.join(project.path, 'yarn.lock'))) {
    command = 'yarn';
    args = ['build']; // yarn不需要run
  }
  
  // 根据目标平台调整环境变量
  if (target === 'static') {
    env.BUILD_TARGET = 'static';
  }
  
  // 检查是否有自定义构建脚本
  if (mode !== 'production' && scripts[`build:${mode}`]) {
    args = ['run', `build:${mode}`];
  }
  
  return { command, args, env };
}

// 解析构建进度
function parseBuildProgress(output: string): any {
  // Vite构建进度
  const viteMatch = output.match(/building for (\w+)\.\.\./i);
  if (viteMatch) {
    return {
      stage: 'building',
      progress: 30,
      message: `Building for ${viteMatch[1]}...`,
    };
  }
  
  // Webpack构建进度
  const webpackMatch = output.match(/(\d+)% building/i);
  if (webpackMatch) {
    const progress = parseInt(webpackMatch[1], 10);
    return {
      stage: 'building',
      progress,
      message: `Building... ${progress}%`,
    };
  }
  
  // 完成标识
  if (output.includes('built in') || output.includes('Build completed')) {
    return {
      stage: 'finalizing',
      progress: 90,
      message: 'Finalizing build...',
    };
  }
  
  return null;
}

// 获取目录大小
async function getDirSize(dirPath: string): Promise<number> {
  let size = 0;
  
  try {
    const files = await fs.readdir(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = await fs.stat(filePath);
      
      if (stats.isDirectory()) {
        size += await getDirSize(filePath);
      } else {
        size += stats.size;
      }
    }
  } catch (error) {
    // 忽略错误
  }
  
  return size;
}

export default router;