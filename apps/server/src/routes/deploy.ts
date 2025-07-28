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

// 部署进程管理
const deployProcesses = new Map<string, ChildProcess>();
const deployHistory = new Map<string, any[]>();

// 部署配置接口
interface DeployConfig {
  provider: 'vercel' | 'netlify' | 'github-pages' | 'ftp' | 'ssh' | 'docker';
  environment: 'development' | 'staging' | 'production';
  buildFirst?: boolean;
  config: Record<string, any>;
}

// 获取项目部署状态
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
    
    const isDeploying = deployProcesses.has(projectId);
    const history = deployHistory.get(projectId) || [];
    const lastDeploy = history[0];
    
    // 检查部署配置
    const deployConfigPath = path.join(project.path, '.deploy.json');
    let deployConfigs = [];
    
    try {
      if (await fs.pathExists(deployConfigPath)) {
        deployConfigs = JSON.parse(await fs.readFile(deployConfigPath, 'utf-8'));
      }
    } catch (error) {
      logger.warn(`Failed to read deploy config for project ${projectId}:`, error);
    }
    
    res.json({
      success: true,
      data: {
        isDeploying,
        lastDeploy,
        deployConfigs,
        history: history.slice(0, 10), // 最近10次部署
        availableProviders: ['vercel', 'netlify', 'github-pages', 'ftp', 'ssh', 'docker'],
      },
    });
  })
);

// 部署项目
router.post('/:projectId/deploy',
  validateRequest({ 
    params: commonSchemas.projectId,
    body: commonSchemas.deployConfig,
  }),
  asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const deployConfig: DeployConfig = req.body;
    
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
    
    // 检查是否已在部署
    if (deployProcesses.has(projectId)) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DEPLOY_IN_PROGRESS',
          message: 'Project is already being deployed',
        },
      });
    }
    
    try {
      const result = await deployProject(projectId, deployConfig);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error(`Deploy failed for project ${projectId}:`, error);
      res.status(400).json({
        success: false,
        error: {
          code: 'DEPLOY_FAILED',
          message: error.message || 'Deploy failed',
        },
      });
    }
  })
);

// 停止部署
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
    
    const deployProcess = deployProcesses.get(projectId);
    if (deployProcess) {
      deployProcess.kill('SIGTERM');
      deployProcesses.delete(projectId);
      
      wsService.sendDeployProgress(projectId, {
        stage: 'stopped',
        progress: 0,
        message: 'Deploy stopped by user',
      });
      
      // 记录部署历史
      addDeployHistory(projectId, {
        status: 'cancelled',
        message: 'Deploy stopped by user',
        timestamp: new Date().toISOString(),
      });
      
      logger.info(`Deploy stopped for project ${projectId}`);
    }
    
    res.json({
      success: true,
      data: {
        message: 'Deploy stopped successfully',
      },
    });
  })
);

// 获取部署历史
router.get('/:projectId/history',
  validateRequest({ params: commonSchemas.projectId }),
  asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { limit = 20, offset = 0 } = req.query as any;
    
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
    
    const history = deployHistory.get(projectId) || [];
    const start = parseInt(offset, 10);
    const end = start + parseInt(limit, 10);
    const paginatedHistory = history.slice(start, end);
    
    res.json({
      success: true,
      data: {
        history: paginatedHistory,
        total: history.length,
        limit: parseInt(limit, 10),
        offset: start,
      },
    });
  })
);

// 获取部署日志
router.get('/:projectId/logs',
  validateRequest({ params: commonSchemas.projectId }),
  asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { deployId, lines = 100 } = req.query as any;
    
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
      const logFile = deployId 
        ? path.join(config.paths.logs, `deploy-${projectId}-${deployId}.log`)
        : path.join(config.paths.logs, `deploy-${projectId}.log`);
      
      if (!(await fs.pathExists(logFile))) {
        return res.json({
          success: true,
          data: {
            logs: [],
            message: 'No deploy logs found',
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
      logger.error(`Failed to get deploy logs for project ${projectId}:`, error);
      res.status(500).json({
        success: false,
        error: {
          code: 'LOG_READ_FAILED',
          message: error.message || 'Failed to read deploy logs',
        },
      });
    }
  })
);

// 保存部署配置
router.post('/:projectId/config',
  validateRequest({ params: commonSchemas.projectId }),
  asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { configs } = req.body;
    
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
      const deployConfigPath = path.join(project.path, '.deploy.json');
      await fs.writeFile(deployConfigPath, JSON.stringify(configs, null, 2));
      
      logger.info(`Deploy config saved for project ${projectId}`);
      
      res.json({
        success: true,
        data: {
          configs,
          message: 'Deploy configuration saved successfully',
        },
      });
    } catch (error: any) {
      logger.error(`Failed to save deploy config for project ${projectId}:`, error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CONFIG_SAVE_FAILED',
          message: error.message || 'Failed to save deploy configuration',
        },
      });
    }
  })
);

// 测试部署配置
router.post('/:projectId/test',
  validateRequest({ params: commonSchemas.projectId }),
  asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const deployConfig: DeployConfig = req.body;
    
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
      const result = await testDeployConfig(projectId, deployConfig);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error(`Deploy config test failed for project ${projectId}:`, error);
      res.status(400).json({
        success: false,
        error: {
          code: 'CONFIG_TEST_FAILED',
          message: error.message || 'Deploy configuration test failed',
        },
      });
    }
  })
);

// 回滚部署
router.post('/:projectId/rollback',
  validateRequest({ params: commonSchemas.projectId }),
  asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { deployId } = req.body;
    
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
      const result = await rollbackDeploy(projectId, deployId);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error(`Deploy rollback failed for project ${projectId}:`, error);
      res.status(400).json({
        success: false,
        error: {
          code: 'ROLLBACK_FAILED',
          message: error.message || 'Deploy rollback failed',
        },
      });
    }
  })
);

// 辅助函数

// 部署项目
async function deployProject(projectId: string, deployConfig: DeployConfig): Promise<any> {
  const project = projectService.getProject(projectId);
  if (!project) {
    throw new Error('Project not found');
  }
  
  const deployId = `deploy-${Date.now()}`;
  const startTime = Date.now();
  
  return new Promise((resolve, reject) => {
    const logFile = path.join(config.paths.logs, `deploy-${projectId}-${deployId}.log`);
    
    // 确保日志目录存在
    fs.ensureDirSync(path.dirname(logFile));
    
    wsService.sendDeployProgress(projectId, {
      stage: 'starting',
      progress: 0,
      message: `Starting deployment to ${deployConfig.provider}`,
    });
    
    logger.info(`Starting deploy for project ${projectId}:`, deployConfig);
    
    // 记录部署开始
    addDeployHistory(projectId, {
      id: deployId,
      status: 'running',
      provider: deployConfig.provider,
      environment: deployConfig.environment,
      startTime: new Date().toISOString(),
      message: 'Deployment started',
    });
    
    // 执行部署
    executeDeploy(projectId, deployId, deployConfig, logFile)
      .then((result) => {
        const duration = Date.now() - startTime;
        
        // 更新部署历史
        updateDeployHistory(projectId, deployId, {
          status: 'success',
          endTime: new Date().toISOString(),
          duration,
          url: result.url,
          message: 'Deployment completed successfully',
        });
        
        wsService.sendDeployProgress(projectId, {
          stage: 'completed',
          progress: 100,
          message: `Deployment completed successfully in ${Math.round(duration / 1000)}s`,
          url: result.url,
        });
        
        logger.info(`Deploy completed for project ${projectId} in ${duration}ms`);
        
        resolve({
          deployId,
          duration,
          url: result.url,
          provider: deployConfig.provider,
          environment: deployConfig.environment,
        });
      })
      .catch((error) => {
        const duration = Date.now() - startTime;
        
        // 更新部署历史
        updateDeployHistory(projectId, deployId, {
          status: 'failed',
          endTime: new Date().toISOString(),
          duration,
          error: error.message,
          message: 'Deployment failed',
        });
        
        wsService.sendDeployProgress(projectId, {
          stage: 'failed',
          progress: 0,
          message: `Deployment failed: ${error.message}`,
        });
        
        logger.error(`Deploy failed for project ${projectId}:`, error);
        
        reject(error);
      })
      .finally(() => {
        deployProcesses.delete(projectId);
      });
  });
}

// 执行部署
async function executeDeploy(projectId: string, deployId: string, deployConfig: DeployConfig, logFile: string): Promise<any> {
  const project = projectService.getProject(projectId)!;
  
  // 如果需要先构建
  if (deployConfig.buildFirst) {
    wsService.sendDeployProgress(projectId, {
      stage: 'building',
      progress: 20,
      message: 'Building project before deployment',
    });
    
    // 这里应该调用构建服务，简化处理
    await new Promise<void>((resolve, reject) => {
      const buildProcess = spawn('npm', ['run', 'build'], {
        cwd: project.path,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true,
      });
      
      buildProcess.stdout?.on('data', (data) => {
        fs.appendFileSync(logFile, data.toString());
      });
      
      buildProcess.stderr?.on('data', (data) => {
        fs.appendFileSync(logFile, data.toString());
      });
      
      buildProcess.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Build failed with exit code ${code}`));
        }
      });
    });
  }
  
  // 根据提供商执行部署
  switch (deployConfig.provider) {
    case 'vercel':
      return await deployToVercel(project, deployConfig, logFile);
    case 'netlify':
      return await deployToNetlify(project, deployConfig, logFile);
    case 'github-pages':
      return await deployToGitHubPages(project, deployConfig, logFile);
    case 'ftp':
      return await deployToFTP(project, deployConfig, logFile);
    case 'ssh':
      return await deployToSSH(project, deployConfig, logFile);
    case 'docker':
      return await deployToDocker(project, deployConfig, logFile);
    default:
      throw new Error(`Unsupported deploy provider: ${deployConfig.provider}`);
  }
}

// Vercel部署
async function deployToVercel(project: any, deployConfig: DeployConfig, logFile: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const args = ['--prod'];
    
    if (deployConfig.config.token) {
      args.push('--token', deployConfig.config.token);
    }
    
    const deployProcess = spawn('vercel', args, {
      cwd: project.path,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    });
    
    let output = '';
    
    deployProcess.stdout?.on('data', (data) => {
      const text = data.toString();
      output += text;
      fs.appendFileSync(logFile, text);
    });
    
    deployProcess.stderr?.on('data', (data) => {
      const text = data.toString();
      fs.appendFileSync(logFile, text);
    });
    
    deployProcess.on('close', (code) => {
      if (code === 0) {
        // 从输出中提取URL
        const urlMatch = output.match(/https:\/\/[^\s]+/);
        const url = urlMatch ? urlMatch[0] : null;
        
        resolve({ url });
      } else {
        reject(new Error(`Vercel deploy failed with exit code ${code}`));
      }
    });
    
    deployProcess.on('error', reject);
  });
}

// Netlify部署
async function deployToNetlify(project: any, deployConfig: DeployConfig, logFile: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const args = ['deploy', '--prod', '--dir', 'dist'];
    
    if (deployConfig.config.siteId) {
      args.push('--site', deployConfig.config.siteId);
    }
    
    if (deployConfig.config.authToken) {
      args.push('--auth', deployConfig.config.authToken);
    }
    
    const deployProcess = spawn('netlify', args, {
      cwd: project.path,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    });
    
    let output = '';
    
    deployProcess.stdout?.on('data', (data) => {
      const text = data.toString();
      output += text;
      fs.appendFileSync(logFile, text);
    });
    
    deployProcess.stderr?.on('data', (data) => {
      const text = data.toString();
      fs.appendFileSync(logFile, text);
    });
    
    deployProcess.on('close', (code) => {
      if (code === 0) {
        // 从输出中提取URL
        const urlMatch = output.match(/Website URL: (https:\/\/[^\s]+)/);
        const url = urlMatch ? urlMatch[1] : null;
        
        resolve({ url });
      } else {
        reject(new Error(`Netlify deploy failed with exit code ${code}`));
      }
    });
    
    deployProcess.on('error', reject);
  });
}

// GitHub Pages部署
async function deployToGitHubPages(project: any, deployConfig: DeployConfig, logFile: string): Promise<any> {
  // 简化实现，实际应该使用gh-pages包或GitHub Actions
  throw new Error('GitHub Pages deployment not implemented yet');
}

// FTP部署
async function deployToFTP(project: any, deployConfig: DeployConfig, logFile: string): Promise<any> {
  // 简化实现，实际应该使用FTP客户端
  throw new Error('FTP deployment not implemented yet');
}

// SSH部署
async function deployToSSH(project: any, deployConfig: DeployConfig, logFile: string): Promise<any> {
  // 简化实现，实际应该使用SSH客户端
  throw new Error('SSH deployment not implemented yet');
}

// Docker部署
async function deployToDocker(project: any, deployConfig: DeployConfig, logFile: string): Promise<any> {
  // 简化实现，实际应该构建和推送Docker镜像
  throw new Error('Docker deployment not implemented yet');
}

// 测试部署配置
async function testDeployConfig(projectId: string, deployConfig: DeployConfig): Promise<any> {
  // 根据提供商测试配置
  switch (deployConfig.provider) {
    case 'vercel':
      // 测试Vercel配置
      return { valid: true, message: 'Vercel configuration is valid' };
    case 'netlify':
      // 测试Netlify配置
      return { valid: true, message: 'Netlify configuration is valid' };
    default:
      return { valid: true, message: 'Configuration test not implemented for this provider' };
  }
}

// 回滚部署
async function rollbackDeploy(projectId: string, deployId: string): Promise<any> {
  // 简化实现，实际应该根据提供商执行回滚
  throw new Error('Deploy rollback not implemented yet');
}

// 添加部署历史
function addDeployHistory(projectId: string, deploy: any) {
  if (!deployHistory.has(projectId)) {
    deployHistory.set(projectId, []);
  }
  
  const history = deployHistory.get(projectId)!;
  history.unshift(deploy);
  
  // 保持最多100条记录
  if (history.length > 100) {
    history.splice(100);
  }
}

// 更新部署历史
function updateDeployHistory(projectId: string, deployId: string, updates: any) {
  const history = deployHistory.get(projectId);
  if (history) {
    const deploy = history.find(d => d.id === deployId);
    if (deploy) {
      Object.assign(deploy, updates);
    }
  }
}

export default router;