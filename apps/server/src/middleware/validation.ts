import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError } from './errorHandler';
import { logger } from '../utils/logger';

export interface ValidationSchema {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
  headers?: Joi.ObjectSchema;
}

// 验证中间件
export const validateRequest = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];
    
    // 验证请求体
    if (schema.body) {
      const { error } = schema.body.validate(req.body, { abortEarly: false });
      if (error) {
        errors.push(...error.details.map(detail => `Body: ${detail.message}`));
      }
    }
    
    // 验证查询参数
    if (schema.query) {
      const { error } = schema.query.validate(req.query, { abortEarly: false });
      if (error) {
        errors.push(...error.details.map(detail => `Query: ${detail.message}`));
      }
    }
    
    // 验证路径参数
    if (schema.params) {
      const { error } = schema.params.validate(req.params, { abortEarly: false });
      if (error) {
        errors.push(...error.details.map(detail => `Params: ${detail.message}`));
      }
    }
    
    // 验证请求头
    if (schema.headers) {
      const { error } = schema.headers.validate(req.headers, { abortEarly: false });
      if (error) {
        errors.push(...error.details.map(detail => `Headers: ${detail.message}`));
      }
    }
    
    if (errors.length > 0) {
      logger.warn('Request validation failed', {
        requestId: (req as any).requestId,
        url: req.originalUrl,
        method: req.method,
        errors,
      });
      
      throw new AppError(`Validation failed: ${errors.join(', ')}`, 400, 'VALIDATION_ERROR');
    }
    
    next();
  };
};

// 常用验证模式
export const commonSchemas = {
  // 项目ID验证
  projectId: Joi.object({
    id: Joi.string().uuid().required().messages({
      'string.guid': 'Project ID must be a valid UUID',
      'any.required': 'Project ID is required',
    }),
  }),
  
  // 分页验证
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().valid('name', 'createdAt', 'updatedAt', 'status').default('createdAt'),
    order: Joi.string().valid('asc', 'desc').default('desc'),
  }),
  
  // 搜索验证
  search: Joi.object({
    q: Joi.string().min(1).max(100).trim(),
    status: Joi.string().valid('idle', 'running', 'building', 'error'),
    type: Joi.string().valid('vue', 'react', 'typescript', 'less', 'nodejs'),
  }),
  
  // 项目创建验证
  createProject: Joi.object({
    name: Joi.string().min(1).max(50).pattern(/^[a-zA-Z0-9-_]+$/).required().messages({
      'string.pattern.base': 'Project name can only contain letters, numbers, hyphens, and underscores',
      'any.required': 'Project name is required',
    }),
    description: Joi.string().max(200).allow(''),
    template: Joi.string().valid('vue3-basic', 'vue3-component-lib', 'vue2-component-lib', 'react-component-lib', 'nodejs-api').required(),
    path: Joi.string().required(),
    packageManager: Joi.string().valid('npm', 'yarn', 'pnpm').default('npm'),
    initGit: Joi.boolean().default(true),
    installDeps: Joi.boolean().default(true),
  }),
  
  // 项目更新验证
  updateProject: Joi.object({
    name: Joi.string().min(1).max(50).pattern(/^[a-zA-Z0-9-_]+$/),
    description: Joi.string().max(200).allow(''),
    packageManager: Joi.string().valid('npm', 'yarn', 'pnpm'),
  }),
  
  // Git操作验证
  gitCommit: Joi.object({
    message: Joi.string().min(1).max(500).required(),
    files: Joi.array().items(Joi.string()).optional(),
  }),
  
  gitBranch: Joi.object({
    name: Joi.string().min(1).max(50).pattern(/^[a-zA-Z0-9-_/]+$/).required().messages({
      'string.pattern.base': 'Branch name can only contain letters, numbers, hyphens, underscores, and slashes',
    }),
    from: Joi.string().optional(),
  }),
  
  // 构建配置验证
  buildConfig: Joi.object({
    mode: Joi.string().valid('development', 'production', 'test').default('production'),
    target: Joi.string().valid('web', 'node', 'electron').default('web'),
    sourcemap: Joi.boolean().default(false),
    minify: Joi.boolean().default(true),
    analyze: Joi.boolean().default(false),
    outputDir: Joi.string().default('dist'),
    publicPath: Joi.string().default('/'),
    env: Joi.object().pattern(Joi.string(), Joi.string()),
  }),
  
  // 部署配置验证
  deployConfig: Joi.object({
    environment: Joi.string().valid('development', 'staging', 'production').required(),
    branch: Joi.string().min(1).max(50).default('main'),
    buildMode: Joi.string().valid('development', 'production').default('production'),
    description: Joi.string().max(200).allow(''),
    docker: Joi.object({
      image: Joi.string(),
      tag: Joi.string().default('latest'),
      ports: Joi.array().items(Joi.number().integer().min(1).max(65535)),
      env: Joi.object().pattern(Joi.string(), Joi.string()),
    }),
    resources: Joi.object({
      cpu: Joi.string().pattern(/^\d+(\.\d+)?[m]?$/),
      memory: Joi.string().pattern(/^\d+[KMGT]?i?$/),
      replicas: Joi.number().integer().min(1).max(10).default(1),
    }),
    healthCheck: Joi.object({
      path: Joi.string().default('/health'),
      port: Joi.number().integer().min(1).max(65535),
      initialDelaySeconds: Joi.number().integer().min(0).default(30),
      periodSeconds: Joi.number().integer().min(1).default(10),
    }),
  }),
  
  // 文件上传验证
  fileUpload: Joi.object({
    maxSize: Joi.number().integer().min(1).max(100 * 1024 * 1024).default(10 * 1024 * 1024), // 默认10MB
    allowedTypes: Joi.array().items(Joi.string()).default(['image/jpeg', 'image/png', 'image/gif', 'text/plain']),
  }),
  
  // 系统配置验证
  systemConfig: Joi.object({
    editor: Joi.object({
      default: Joi.string().valid('vscode', 'webstorm', 'sublime', 'atom', 'vim'),
      path: Joi.string(),
    }),
    terminal: Joi.object({
      default: Joi.string().valid('cmd', 'powershell', 'bash', 'zsh'),
      path: Joi.string(),
    }),
    packageManager: Joi.object({
      default: Joi.string().valid('npm', 'yarn', 'pnpm'),
      registry: Joi.string().uri(),
    }),
    git: Joi.object({
      userName: Joi.string().min(1).max(50),
      userEmail: Joi.string().email(),
      defaultBranch: Joi.string().default('main'),
    }),
    system: Joi.object({
      language: Joi.string().valid('zh-CN', 'en-US').default('zh-CN'),
      theme: Joi.string().valid('light', 'dark', 'auto').default('auto'),
      autoSave: Joi.boolean().default(true),
      autoUpdate: Joi.boolean().default(true),
    }),
  }),
};

// 文件路径验证
export const validatePath = (path: string): boolean => {
  // 检查路径是否包含危险字符
  const dangerousPatterns = [
    /\.\./,  // 父目录引用
    /[<>:"|?*]/,  // Windows保留字符
    /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i,  // Windows保留名称
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(path));
};

// 项目名称验证
export const validateProjectName = (name: string): boolean => {
  // 检查是否为有效的项目名称
  const validPattern = /^[a-zA-Z0-9-_]+$/;
  const reservedNames = ['node_modules', 'dist', 'build', '.git', '.vscode', '.idea'];
  
  return validPattern.test(name) && !reservedNames.includes(name.toLowerCase());
};

// Git分支名称验证
export const validateBranchName = (name: string): boolean => {
  // Git分支名称规则
  const invalidPatterns = [
    /^\./, // 不能以点开头
    /\.$/, // 不能以点结尾
    /\.\./,  // 不能包含连续的点
    /[\s~^:?*\[\\]/,  // 不能包含特殊字符
    /^-/,  // 不能以连字符开头
    /-$/,  // 不能以连字符结尾
  ];
  
  return !invalidPatterns.some(pattern => pattern.test(name)) && name.length > 0 && name.length <= 50;
};

// 环境变量验证
export const validateEnvVar = (key: string, value: string): boolean => {
  // 环境变量键名规则
  const keyPattern = /^[A-Z][A-Z0-9_]*$/;
  
  // 检查是否为敏感信息
  const sensitivePatterns = [
    /password/i,
    /secret/i,
    /token/i,
    /key/i,
    /auth/i,
  ];
  
  return keyPattern.test(key) && !sensitivePatterns.some(pattern => pattern.test(key));
};

// 端口号验证
export const validatePort = (port: number): boolean => {
  return Number.isInteger(port) && port >= 1 && port <= 65535;
};

// URL验证
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// 版本号验证
export const validateVersion = (version: string): boolean => {
  const semverPattern = /^\d+\.\d+\.\d+(-[a-zA-Z0-9-]+)?(\+[a-zA-Z0-9-]+)?$/;
  return semverPattern.test(version);
};