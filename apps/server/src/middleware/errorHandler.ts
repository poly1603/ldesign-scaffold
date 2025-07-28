import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const createError = (message: string, statusCode: number = 500, code?: string): AppError => {
  return new AppError(message, statusCode, code);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  let error = { ...err };
  error.message = err.message;

  // 记录错误日志
  logger.error(`Error ${err.statusCode || 500}: ${err.message}`, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    stack: err.stack,
  });

  // Mongoose错误处理
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = new AppError(message, 404, 'RESOURCE_NOT_FOUND');
  }

  // Mongoose重复字段错误
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = new AppError(message, 400, 'DUPLICATE_FIELD');
  }

  // Mongoose验证错误
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val: any) => val.message).join(', ');
    error = new AppError(message, 400, 'VALIDATION_ERROR');
  }

  // JWT错误
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new AppError(message, 401, 'INVALID_TOKEN');
  }

  // JWT过期错误
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new AppError(message, 401, 'TOKEN_EXPIRED');
  }

  // 文件系统错误
  if (err.code === 'ENOENT') {
    const message = 'File or directory not found';
    error = new AppError(message, 404, 'FILE_NOT_FOUND');
  }

  if (err.code === 'EACCES') {
    const message = 'Permission denied';
    error = new AppError(message, 403, 'PERMISSION_DENIED');
  }

  if (err.code === 'EEXIST') {
    const message = 'File or directory already exists';
    error = new AppError(message, 409, 'FILE_EXISTS');
  }

  // Git错误
  if (err.message && err.message.includes('git')) {
    const message = 'Git operation failed';
    error = new AppError(message, 400, 'GIT_ERROR');
  }

  // 构建错误
  if (err.message && err.message.includes('build')) {
    const message = 'Build operation failed';
    error = new AppError(message, 400, 'BUILD_ERROR');
  }

  // 部署错误
  if (err.message && err.message.includes('deploy')) {
    const message = 'Deploy operation failed';
    error = new AppError(message, 400, 'DEPLOY_ERROR');
  }

  // 网络错误
  if (err.code === 'ECONNREFUSED') {
    const message = 'Connection refused';
    error = new AppError(message, 503, 'CONNECTION_REFUSED');
  }

  if (err.code === 'ETIMEDOUT') {
    const message = 'Request timeout';
    error = new AppError(message, 408, 'REQUEST_TIMEOUT');
  }

  // 内存错误
  if (err.code === 'ENOMEM') {
    const message = 'Out of memory';
    error = new AppError(message, 507, 'OUT_OF_MEMORY');
  }

  // 磁盘空间错误
  if (err.code === 'ENOSPC') {
    const message = 'No space left on device';
    error = new AppError(message, 507, 'NO_SPACE_LEFT');
  }

  // 进程错误
  if (err.code === 'ENOEXEC') {
    const message = 'Execution format error';
    error = new AppError(message, 400, 'EXECUTION_ERROR');
  }

  // 默认错误响应
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  const code = error.code || 'INTERNAL_ERROR';

  // 开发环境返回详细错误信息
  const isDevelopment = process.env.NODE_ENV === 'development';

  const errorResponse: any = {
    success: false,
    error: {
      code,
      message,
      statusCode,
      timestamp: new Date().toISOString(),
    },
  };

  // 开发环境添加堆栈信息
  if (isDevelopment) {
    errorResponse.error.stack = err.stack;
    errorResponse.error.details = {
      url: req.originalUrl,
      method: req.method,
      headers: req.headers,
      body: req.body,
      params: req.params,
      query: req.query,
    };
  }

  res.status(statusCode).json(errorResponse);
};

// 404错误处理
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404, 'ROUTE_NOT_FOUND');
  next(error);
};

// 验证错误创建器
export const validationError = (message: string, field?: string): AppError => {
  const fullMessage = field ? `${field}: ${message}` : message;
  return new AppError(fullMessage, 400, 'VALIDATION_ERROR');
};

// 权限错误创建器
export const permissionError = (message: string = 'Permission denied'): AppError => {
  return new AppError(message, 403, 'PERMISSION_DENIED');
};

// 认证错误创建器
export const authError = (message: string = 'Authentication required'): AppError => {
  return new AppError(message, 401, 'AUTHENTICATION_REQUIRED');
};

// 资源不存在错误创建器
export const notFoundError = (resource: string = 'Resource'): AppError => {
  return new AppError(`${resource} not found`, 404, 'RESOURCE_NOT_FOUND');
};

// 冲突错误创建器
export const conflictError = (message: string): AppError => {
  return new AppError(message, 409, 'CONFLICT');
};

// 服务不可用错误创建器
export const serviceUnavailableError = (message: string = 'Service temporarily unavailable'): AppError => {
  return new AppError(message, 503, 'SERVICE_UNAVAILABLE');
};