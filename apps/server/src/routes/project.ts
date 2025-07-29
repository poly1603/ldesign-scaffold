import { Router } from 'express';
import { ProjectService } from '../services/project';
import { validateRequest, commonSchemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = Router();
const projectService = new ProjectService();

// 获取所有项目
router.get('/', 
  validateRequest({ query: commonSchemas.pagination }),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, sort = 'createdAt', order = 'desc' } = req.query as any;
    
    let projects = projectService.getProjects();
    
    // 排序
    projects.sort((a, b) => {
      const aValue = a[sort as keyof typeof a];
      const bValue = b[sort as keyof typeof b];
      
      if (order === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    // 分页
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProjects = projects.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        projects: paginatedProjects,
        pagination: {
          page,
          limit,
          total: projects.length,
          totalPages: Math.ceil(projects.length / limit),
        },
      },
    });
  })
);

// 搜索项目
router.get('/search',
  validateRequest({ query: commonSchemas.search }),
  asyncHandler(async (req, res) => {
    const { q, status, type } = req.query as any;
    
    let projects = projectService.getProjects();
    
    // 按名称或描述搜索
    if (q) {
      const searchTerm = q.toLowerCase();
      projects = projects.filter(project => 
        project.name.toLowerCase().includes(searchTerm) ||
        project.description.toLowerCase().includes(searchTerm)
      );
    }
    
    // 按状态筛选
    if (status) {
      projects = projects.filter(project => project.status === status);
    }
    
    // 按模板类型筛选
    if (type) {
      projects = projects.filter(project => project.template === type);
    }
    
    res.json({
      success: true,
      data: {
        projects,
        count: projects.length,
      },
    });
  })
);

// 获取项目统计信息
router.get('/stats',
  asyncHandler(async (req, res) => {
    const stats = await projectService.getStats();
    
    res.json({
      success: true,
      data: stats,
    });
  })
);

// 获取单个项目
router.get('/:id',
  validateRequest({ params: commonSchemas.projectId }),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const project = projectService.getProject(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found',
        },
      });
    }
    
    res.json({
      success: true,
      data: project,
    });
  })
);

// 创建项目
router.post('/',
  validateRequest({ body: commonSchemas.createProject }),
  asyncHandler(async (req, res) => {
    const projectData = req.body;
    
    logger.info('Creating new project:', projectData);
    
    const project = await projectService.createProject(projectData);
    
    res.status(201).json({
      success: true,
      data: project,
      message: 'Project created successfully',
    });
  })
);

// 更新项目
router.put('/:id',
  validateRequest({ 
    params: commonSchemas.projectId,
    body: commonSchemas.updateProject,
  }),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    
    logger.info(`Updating project ${id}:`, updates);
    
    const project = await projectService.updateProject(id, updates);
    
    res.json({
      success: true,
      data: project,
      message: 'Project updated successfully',
    });
  })
);

// 删除项目
router.delete('/:id',
  validateRequest({ params: commonSchemas.projectId }),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { deleteFiles = false } = req.query as any;
    
    logger.info(`Deleting project ${id}, deleteFiles: ${deleteFiles}`);
    
    await projectService.deleteProject(id, deleteFiles === 'true');
    
    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  })
);

// 启动项目开发服务器
router.post('/:id/start',
  validateRequest({ params: commonSchemas.projectId }),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    logger.info(`Starting project ${id}`);
    
    await projectService.startProject(id);
    
    const project = projectService.getProject(id);
    
    res.json({
      success: true,
      data: {
        project,
        url: project?.port ? `http://localhost:${project.port}` : null,
      },
      message: 'Project started successfully',
    });
  })
);

// 停止项目
router.post('/:id/stop',
  validateRequest({ params: commonSchemas.projectId }),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    logger.info(`Stopping project ${id}`);
    
    await projectService.stopProject(id);
    
    const project = projectService.getProject(id);
    
    res.json({
      success: true,
      data: project,
      message: 'Project stopped successfully',
    });
  })
);

// 重启项目
router.post('/:id/restart',
  validateRequest({ params: commonSchemas.projectId }),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    logger.info(`Restarting project ${id}`);
    
    // 先停止再启动
    await projectService.stopProject(id);
    
    // 等待一秒确保进程完全停止
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await projectService.startProject(id);
    
    const project = projectService.getProject(id);
    
    res.json({
      success: true,
      data: {
        project,
        url: project?.port ? `http://localhost:${project.port}` : null,
      },
      message: 'Project restarted successfully',
    });
  })
);

// 构建项目
router.post('/:id/build',
  validateRequest({ 
    params: commonSchemas.projectId,
    body: commonSchemas.buildConfig,
  }),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const buildOptions = req.body;
    
    logger.info(`Building project ${id}:`, buildOptions);
    
    await projectService.buildProject(id, buildOptions);
    
    const project = projectService.getProject(id);
    
    res.json({
      success: true,
      data: project,
      message: 'Project built successfully',
    });
  })
);

// 获取项目日志
router.get('/:id/logs',
  validateRequest({ params: commonSchemas.projectId }),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { lines = 100, type = 'all' } = req.query as any;
    
    const project = projectService.getProject(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found',
        },
      });
    }
    
    // 这里应该从日志文件或内存中获取日志
    // 暂时返回空数组
    const logs: any[] = [];
    
    res.json({
      success: true,
      data: {
        logs,
        project: {
          id: project.id,
          name: project.name,
          status: project.status,
        },
      },
    });
  })
);

// 清空项目日志
router.delete('/:id/logs',
  validateRequest({ params: commonSchemas.projectId }),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const project = projectService.getProject(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found',
        },
      });
    }
    
    logger.info(`Clearing logs for project ${id}`);
    
    // 这里应该清空项目日志
    // 暂时只返回成功响应
    
    res.json({
      success: true,
      message: 'Project logs cleared successfully',
    });
  })
);

// 获取项目配置
router.get('/:id/config',
  validateRequest({ params: commonSchemas.projectId }),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const project = projectService.getProject(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found',
        },
      });
    }
    
    res.json({
      success: true,
      data: {
        config: project.config || {},
        project: {
          id: project.id,
          name: project.name,
          template: project.template,
          packageManager: project.packageManager,
        },
      },
    });
  })
);

// 更新项目配置
router.put('/:id/config',
  validateRequest({ params: commonSchemas.projectId }),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const config = req.body;
    
    logger.info(`Updating config for project ${id}:`, config);
    
    const project = await projectService.updateProject(id, { config });
    
    res.json({
      success: true,
      data: {
        config: project.config,
        project: {
          id: project.id,
          name: project.name,
        },
      },
      message: 'Project configuration updated successfully',
    });
  })
);

// 批量操作
router.post('/batch',
  asyncHandler(async (req, res) => {
    const { action, projectIds } = req.body;
    
    if (!Array.isArray(projectIds) || projectIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PROJECT_IDS',
          message: 'Project IDs must be a non-empty array',
        },
      });
    }
    
    const results: any[] = [];
    
    for (const projectId of projectIds) {
      try {
        switch (action) {
          case 'start':
            await projectService.startProject(projectId);
            break;
          case 'stop':
            await projectService.stopProject(projectId);
            break;
          case 'build':
            await projectService.buildProject(projectId);
            break;
          case 'preview':
            await projectService.previewProject(projectId);
            break;
          case 'test':
            await projectService.testProject(projectId);
            break;
          default:
            throw new Error(`Unknown action: ${action}`);
        }
        
        results.push({
          projectId,
          success: true,
        });
      } catch (error: any) {
        results.push({
          projectId,
          success: false,
          error: error.message,
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    
    res.json({
      success: failureCount === 0,
      data: {
        results,
        summary: {
          total: projectIds.length,
          success: successCount,
          failure: failureCount,
        },
      },
      message: `Batch ${action} completed: ${successCount} succeeded, ${failureCount} failed`,
    });
  })
);

// Git 状态
router.get('/:id/git/status',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const project = projectService.getProject(id);
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
      const gitStatus = await projectService.getGitStatus(id);
      res.json({
        success: true,
        data: gitStatus,
      });
    } catch (error: any) {
      logger.error(`Failed to get git status for project ${id}:`, error);
      res.status(500).json({
        success: false,
        error: {
          code: 'GIT_STATUS_FAILED',
          message: error.message,
        },
      });
    }
  })
);

export default router;