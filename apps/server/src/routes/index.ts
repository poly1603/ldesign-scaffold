import { Router } from 'express';
import projectRoutes from './project';
import systemRoutes from './system';
import templateRoutes from './template';
import gitRoutes from './git';
import buildRoutes from './build';
import deployRoutes from './deploy';
import healthRoutes from './health';
import docsRoutes from './docs';

const router = Router();

// API版本信息
router.get('/', (req, res) => {
  res.json({
    name: 'LDesign Scaffold API',
    version: '1.0.0',
    description: 'RESTful API for LDesign Scaffold - A modern web development platform',
    endpoints: {
      projects: '/api/projects',
      system: '/api/system',
      templates: '/api/templates',
      git: '/api/git',
      build: '/api/build',
      deploy: '/api/deploy',
      health: '/api/health',
      docs: '/api/docs',
    },
    websocket: '/ws',
    timestamp: new Date().toISOString(),
  });
});

// 注册路由
router.use('/projects', projectRoutes);
router.use('/system', systemRoutes);
router.use('/templates', templateRoutes);
router.use('/git', gitRoutes);
router.use('/build', buildRoutes);
router.use('/deploy', deployRoutes);
router.use('/health', healthRoutes);
router.use('/docs', docsRoutes);

export default router;