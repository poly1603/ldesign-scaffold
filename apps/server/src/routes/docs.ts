import { Router } from 'express';
import path from 'path';
import { asyncHandler } from '../middleware/errorHandler';
import { config } from '../config';

const router = Router();

// API文档首页
router.get('/',
  asyncHandler(async (req, res) => {
    const apiDocs = {
      title: 'LDesign Scaffold API Documentation',
      version: '1.0.0',
      description: 'RESTful API for LDesign Scaffold - A modern web development platform',
      baseUrl: `http://${config.server.host}:${config.server.port}`,
      endpoints: {
        projects: {
          description: 'Project management endpoints',
          baseUrl: '/api/projects',
          endpoints: [
            {
              method: 'GET',
              path: '/',
              description: 'Get all projects with pagination and filtering',
              parameters: [
                { name: 'page', type: 'number', description: 'Page number (default: 1)' },
                { name: 'limit', type: 'number', description: 'Items per page (default: 10)' },
                { name: 'sort', type: 'string', description: 'Sort field (default: createdAt)' },
                { name: 'order', type: 'string', description: 'Sort order: asc|desc (default: desc)' },
              ],
            },
            {
              method: 'POST',
              path: '/',
              description: 'Create a new project',
              body: {
                name: 'string (required)',
                description: 'string',
                template: 'string (required)',
                path: 'string',
              },
            },
            {
              method: 'GET',
              path: '/:projectId',
              description: 'Get project by ID',
            },
            {
              method: 'PUT',
              path: '/:projectId',
              description: 'Update project',
            },
            {
              method: 'DELETE',
              path: '/:projectId',
              description: 'Delete project',
              parameters: [
                { name: 'deleteFiles', type: 'boolean', description: 'Also delete project files' },
              ],
            },
            {
              method: 'POST',
              path: '/:projectId/start',
              description: 'Start project development server',
            },
            {
              method: 'POST',
              path: '/:projectId/stop',
              description: 'Stop project development server',
            },
            {
              method: 'POST',
              path: '/:projectId/restart',
              description: 'Restart project development server',
            },
            {
              method: 'POST',
              path: '/:projectId/build',
              description: 'Build project',
            },
            {
              method: 'GET',
              path: '/:projectId/logs',
              description: 'Get project logs',
            },
            {
              method: 'DELETE',
              path: '/:projectId/logs',
              description: 'Clear project logs',
            },
          ],
        },
        system: {
          description: 'System information and management endpoints',
          baseUrl: '/api/system',
          endpoints: [
            {
              method: 'GET',
              path: '/info',
              description: 'Get system information',
            },
            {
              method: 'GET',
              path: '/disk',
              description: 'Get disk usage information',
            },
            {
              method: 'GET',
              path: '/processes',
              description: 'Get running processes',
            },
            {
              method: 'GET',
              path: '/env',
              description: 'Get environment variables (filtered)',
            },
            {
              method: 'GET',
              path: '/tools',
              description: 'Get installed development tools',
            },
            {
              method: 'GET',
              path: '/config',
              description: 'Get system configuration',
            },
            {
              method: 'PUT',
              path: '/config',
              description: 'Update system configuration',
            },
            {
              method: 'GET',
              path: '/logs',
              description: 'Get system logs',
            },
            {
              method: 'DELETE',
              path: '/logs',
              description: 'Clear system logs',
            },
            {
              method: 'POST',
              path: '/command',
              description: 'Execute system command',
            },
            {
              method: 'GET',
              path: '/ports/:port',
              description: 'Check if port is available',
            },
            {
              method: 'GET',
              path: '/ports/available',
              description: 'Get available port',
            },
            {
              method: 'POST',
              path: '/restart',
              description: 'Restart server',
            },
          ],
        },
        templates: {
          description: 'Project template management endpoints',
          baseUrl: '/api/templates',
          endpoints: [
            {
              method: 'GET',
              path: '/',
              description: 'Get all available templates',
            },
            {
              method: 'GET',
              path: '/:templateId',
              description: 'Get template details',
            },
            {
              method: 'GET',
              path: '/:templateId/structure',
              description: 'Get template file structure',
            },
            {
              method: 'GET',
              path: '/:templateId/files/*',
              description: 'Get template file content',
            },
            {
              method: 'POST',
              path: '/',
              description: 'Create custom template',
            },
            {
              method: 'PUT',
              path: '/:templateId',
              description: 'Update template',
            },
            {
              method: 'DELETE',
              path: '/:templateId',
              description: 'Delete template (custom only)',
            },
            {
              method: 'GET',
              path: '/:templateId/export',
              description: 'Export template as archive',
            },
            {
              method: 'POST',
              path: '/import',
              description: 'Import template from archive',
            },
            {
              method: 'POST',
              path: '/:templateId/validate',
              description: 'Validate template',
            },
          ],
        },
        git: {
          description: 'Git operations endpoints',
          baseUrl: '/api/git',
          endpoints: [
            {
              method: 'GET',
              path: '/:projectId/status',
              description: 'Get Git repository status',
            },
            {
              method: 'POST',
              path: '/:projectId/init',
              description: 'Initialize Git repository',
            },
            {
              method: 'POST',
              path: '/:projectId/add',
              description: 'Add files to staging area',
            },
            {
              method: 'POST',
              path: '/:projectId/commit',
              description: 'Commit changes',
            },
            {
              method: 'POST',
              path: '/:projectId/push',
              description: 'Push to remote repository',
            },
            {
              method: 'POST',
              path: '/:projectId/pull',
              description: 'Pull from remote repository',
            },
            {
              method: 'POST',
              path: '/:projectId/branches',
              description: 'Create new branch',
            },
            {
              method: 'POST',
              path: '/:projectId/checkout',
              description: 'Checkout branch',
            },
            {
              method: 'DELETE',
              path: '/:projectId/branches/:branchName',
              description: 'Delete branch',
            },
            {
              method: 'POST',
              path: '/:projectId/merge',
              description: 'Merge branch',
            },
            {
              method: 'GET',
              path: '/:projectId/log',
              description: 'Get commit history',
            },
            {
              method: 'POST',
              path: '/:projectId/remotes',
              description: 'Add remote repository',
            },
          ],
        },
        build: {
          description: 'Project build management endpoints',
          baseUrl: '/api/build',
          endpoints: [
            {
              method: 'GET',
              path: '/:projectId/status',
              description: 'Get build status',
            },
            {
              method: 'POST',
              path: '/:projectId/build',
              description: 'Start project build',
            },
            {
              method: 'POST',
              path: '/:projectId/stop',
              description: 'Stop build process',
            },
            {
              method: 'DELETE',
              path: '/:projectId/artifacts',
              description: 'Clean build artifacts',
            },
            {
              method: 'GET',
              path: '/:projectId/download',
              description: 'Download build artifacts',
            },
            {
              method: 'GET',
              path: '/:projectId/logs',
              description: 'Get build logs',
            },
            {
              method: 'GET',
              path: '/stats',
              description: 'Get build statistics',
            },
          ],
        },
        deploy: {
          description: 'Project deployment endpoints',
          baseUrl: '/api/deploy',
          endpoints: [
            {
              method: 'GET',
              path: '/:projectId/status',
              description: 'Get deployment status',
            },
            {
              method: 'POST',
              path: '/:projectId/deploy',
              description: 'Deploy project',
            },
            {
              method: 'POST',
              path: '/:projectId/stop',
              description: 'Stop deployment',
            },
            {
              method: 'GET',
              path: '/:projectId/history',
              description: 'Get deployment history',
            },
            {
              method: 'GET',
              path: '/:projectId/logs',
              description: 'Get deployment logs',
            },
            {
              method: 'POST',
              path: '/:projectId/config',
              description: 'Save deployment configuration',
            },
            {
              method: 'POST',
              path: '/:projectId/test',
              description: 'Test deployment configuration',
            },
            {
              method: 'POST',
              path: '/:projectId/rollback',
              description: 'Rollback deployment',
            },
          ],
        },
        health: {
          description: 'Health check endpoints',
          baseUrl: '/api/health',
          endpoints: [
            {
              method: 'GET',
              path: '/',
              description: 'Basic health check',
            },
            {
              method: 'GET',
              path: '/detailed',
              description: 'Detailed health information',
            },
            {
              method: 'GET',
              path: '/ready',
              description: 'Readiness check',
            },
            {
              method: 'GET',
              path: '/live',
              description: 'Liveness check',
            },
            {
              method: 'GET',
              path: '/metrics',
              description: 'Performance metrics',
            },
            {
              method: 'GET',
              path: '/dependencies',
              description: 'Dependencies status',
            },
          ],
        },
      },
      websocket: {
        description: 'WebSocket API for real-time communication',
        url: `ws://${config.server.host}:${config.server.port}/ws`,
        events: {
          client: [
            {
              event: 'subscribe',
              description: 'Subscribe to project updates',
              payload: { projectId: 'string', channels: 'string[]' },
            },
            {
              event: 'unsubscribe',
              description: 'Unsubscribe from project updates',
              payload: { projectId: 'string', channels: 'string[]' },
            },
            {
              event: 'ping',
              description: 'Heartbeat ping',
              payload: {},
            },
            {
              event: 'getClientInfo',
              description: 'Get client information',
              payload: {},
            },
          ],
          server: [
            {
              event: 'welcome',
              description: 'Welcome message on connection',
              payload: { clientId: 'string', timestamp: 'string' },
            },
            {
              event: 'pong',
              description: 'Heartbeat response',
              payload: { timestamp: 'string' },
            },
            {
              event: 'projectLog',
              description: 'Real-time project logs',
              payload: {
                projectId: 'string',
                log: {
                  type: 'string',
                  level: 'string',
                  message: 'string',
                  timestamp: 'string',
                },
              },
            },
            {
              event: 'projectStatus',
              description: 'Project status updates',
              payload: {
                projectId: 'string',
                status: 'string',
                details: 'object',
              },
            },
            {
              event: 'buildProgress',
              description: 'Build progress updates',
              payload: {
                projectId: 'string',
                progress: {
                  stage: 'string',
                  progress: 'number',
                  message: 'string',
                },
              },
            },
            {
              event: 'deployProgress',
              description: 'Deployment progress updates',
              payload: {
                projectId: 'string',
                progress: {
                  stage: 'string',
                  progress: 'number',
                  message: 'string',
                  url: 'string?',
                },
              },
            },
            {
              event: 'gitStatus',
              description: 'Git status updates',
              payload: {
                projectId: 'string',
                status: 'object',
              },
            },
            {
              event: 'systemNotification',
              description: 'System-wide notifications',
              payload: {
                type: 'string',
                level: 'string',
                message: 'string',
                timestamp: 'string',
              },
            },
          ],
        },
      },
      responseFormat: {
        success: {
          success: true,
          data: 'any',
        },
        error: {
          success: false,
          error: {
            code: 'string',
            message: 'string',
            details: 'any?',
          },
        },
      },
      statusCodes: {
        200: 'OK - Request successful',
        201: 'Created - Resource created successfully',
        400: 'Bad Request - Invalid request parameters',
        401: 'Unauthorized - Authentication required',
        403: 'Forbidden - Access denied',
        404: 'Not Found - Resource not found',
        409: 'Conflict - Resource conflict',
        422: 'Unprocessable Entity - Validation error',
        500: 'Internal Server Error - Server error',
        503: 'Service Unavailable - Service temporarily unavailable',
      },
      examples: {
        createProject: {
          request: {
            method: 'POST',
            url: '/api/projects',
            body: {
              name: 'my-awesome-app',
              description: 'A new Vue.js application',
              template: 'vue3',
            },
          },
          response: {
            success: true,
            data: {
              id: 'proj_123456',
              name: 'my-awesome-app',
              description: 'A new Vue.js application',
              template: 'vue3',
              status: 'created',
              path: '/projects/my-awesome-app',
              port: 3000,
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z',
            },
          },
        },
        getProjects: {
          request: {
            method: 'GET',
            url: '/api/projects?page=1&limit=10&sort=createdAt&order=desc',
          },
          response: {
            success: true,
            data: {
              projects: [
                {
                  id: 'proj_123456',
                  name: 'my-awesome-app',
                  description: 'A new Vue.js application',
                  template: 'vue3',
                  status: 'running',
                  path: '/projects/my-awesome-app',
                  port: 3000,
                  createdAt: '2024-01-01T00:00:00.000Z',
                  updatedAt: '2024-01-01T00:00:00.000Z',
                },
              ],
              pagination: {
                page: 1,
                limit: 10,
                total: 1,
                pages: 1,
              },
            },
          },
        },
        error: {
          response: {
            success: false,
            error: {
              code: 'PROJECT_NOT_FOUND',
              message: 'Project not found',
            },
          },
        },
      },
    };
    
    res.json(apiDocs);
  })
);

// OpenAPI/Swagger规范
router.get('/openapi.json',
  asyncHandler(async (req, res) => {
    const openApiSpec = {
      openapi: '3.0.0',
      info: {
        title: 'LDesign Scaffold API',
        version: '1.0.0',
        description: 'RESTful API for LDesign Scaffold - A modern web development platform',
        contact: {
          name: 'LDesign Team',
          url: 'https://github.com/ldesign-scaffold',
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT',
        },
      },
      servers: [
        {
          url: `http://${config.server.host}:${config.server.port}`,
          description: 'Development server',
        },
      ],
      paths: {
        '/api/projects': {
          get: {
            summary: 'Get all projects',
            tags: ['Projects'],
            parameters: [
              {
                name: 'page',
                in: 'query',
                schema: { type: 'integer', default: 1 },
                description: 'Page number',
              },
              {
                name: 'limit',
                in: 'query',
                schema: { type: 'integer', default: 10 },
                description: 'Items per page',
              },
            ],
            responses: {
              200: {
                description: 'Successful response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean' },
                        data: {
                          type: 'object',
                          properties: {
                            projects: {
                              type: 'array',
                              items: { $ref: '#/components/schemas/Project' },
                            },
                            pagination: { $ref: '#/components/schemas/Pagination' },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          post: {
            summary: 'Create a new project',
            tags: ['Projects'],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/CreateProjectRequest' },
                },
              },
            },
            responses: {
              201: {
                description: 'Project created successfully',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean' },
                        data: { $ref: '#/components/schemas/Project' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/api/health': {
          get: {
            summary: 'Health check',
            tags: ['Health'],
            responses: {
              200: {
                description: 'Service is healthy',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/HealthResponse' },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          Project: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              description: { type: 'string' },
              template: { type: 'string' },
              status: { type: 'string', enum: ['created', 'running', 'stopped', 'building', 'error'] },
              path: { type: 'string' },
              port: { type: 'integer' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          CreateProjectRequest: {
            type: 'object',
            required: ['name', 'template'],
            properties: {
              name: { type: 'string' },
              description: { type: 'string' },
              template: { type: 'string' },
              path: { type: 'string' },
            },
          },
          Pagination: {
            type: 'object',
            properties: {
              page: { type: 'integer' },
              limit: { type: 'integer' },
              total: { type: 'integer' },
              pages: { type: 'integer' },
            },
          },
          HealthResponse: {
            type: 'object',
            properties: {
              status: { type: 'string', enum: ['healthy', 'unhealthy'] },
              timestamp: { type: 'string', format: 'date-time' },
              responseTime: { type: 'number' },
              version: { type: 'string' },
              environment: { type: 'string' },
              checks: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    status: { type: 'string' },
                    details: { type: 'object' },
                  },
                },
              },
            },
          },
          Error: {
            type: 'object',
            properties: {
              success: { type: 'boolean', enum: [false] },
              error: {
                type: 'object',
                properties: {
                  code: { type: 'string' },
                  message: { type: 'string' },
                  details: { type: 'object' },
                },
              },
            },
          },
        },
      },
      tags: [
        { name: 'Projects', description: 'Project management operations' },
        { name: 'System', description: 'System information and management' },
        { name: 'Templates', description: 'Project template operations' },
        { name: 'Git', description: 'Git operations' },
        { name: 'Build', description: 'Build management' },
        { name: 'Deploy', description: 'Deployment operations' },
        { name: 'Health', description: 'Health check operations' },
      ],
    };
    
    res.json(openApiSpec);
  })
);

// Swagger UI HTML页面
router.get('/swagger',
  asyncHandler(async (req, res) => {
    const swaggerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LDesign Scaffold API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin:0;
      background: #fafafa;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: '/api/docs/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      });
    };
  </script>
</body>
</html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(swaggerHtml);
  })
);

// Postman集合
router.get('/postman.json',
  asyncHandler(async (req, res) => {
    const postmanCollection = {
      info: {
        name: 'LDesign Scaffold API',
        description: 'API collection for LDesign Scaffold',
        version: '1.0.0',
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      },
      variable: [
        {
          key: 'baseUrl',
          value: `http://${config.server.host}:${config.server.port}`,
          type: 'string',
        },
      ],
      item: [
        {
          name: 'Projects',
          item: [
            {
              name: 'Get All Projects',
              request: {
                method: 'GET',
                header: [],
                url: {
                  raw: '{{baseUrl}}/api/projects',
                  host: ['{{baseUrl}}'],
                  path: ['api', 'projects'],
                },
              },
            },
            {
              name: 'Create Project',
              request: {
                method: 'POST',
                header: [
                  {
                    key: 'Content-Type',
                    value: 'application/json',
                  },
                ],
                body: {
                  mode: 'raw',
                  raw: JSON.stringify({
                    name: 'my-project',
                    description: 'A new project',
                    template: 'vue3',
                  }, null, 2),
                },
                url: {
                  raw: '{{baseUrl}}/api/projects',
                  host: ['{{baseUrl}}'],
                  path: ['api', 'projects'],
                },
              },
            },
          ],
        },
        {
          name: 'Health',
          item: [
            {
              name: 'Health Check',
              request: {
                method: 'GET',
                header: [],
                url: {
                  raw: '{{baseUrl}}/api/health',
                  host: ['{{baseUrl}}'],
                  path: ['api', 'health'],
                },
              },
            },
          ],
        },
      ],
    };
    
    res.json(postmanCollection);
  })
);

export default router;