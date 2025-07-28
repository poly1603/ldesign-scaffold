import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface RequestLog {
  id: string;
  method: string;
  url: string;
  ip: string;
  userAgent: string;
  timestamp: string;
  duration?: number;
  statusCode?: number;
  contentLength?: number;
  error?: string;
}

// 生成请求ID
function generateRequestId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// 获取客户端IP
function getClientIp(req: Request): string {
  return (
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection as any)?.socket?.remoteAddress ||
    'unknown'
  );
}

// 获取内容长度
function getContentLength(res: Response): number {
  const contentLength = res.get('Content-Length');
  return contentLength ? parseInt(contentLength, 10) : 0;
}

// 请求日志中间件
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const requestId = generateRequestId();
  
  // 将请求ID添加到请求对象中
  (req as any).requestId = requestId;
  
  // 添加请求ID到响应头
  res.set('X-Request-ID', requestId);
  
  const requestLog: RequestLog = {
    id: requestId,
    method: req.method,
    url: req.originalUrl || req.url,
    ip: getClientIp(req),
    userAgent: req.get('User-Agent') || 'unknown',
    timestamp: new Date().toISOString(),
  };
  
  // 记录请求开始
  logger.info(`Request started: ${req.method} ${req.originalUrl}`, {
    requestId,
    ip: requestLog.ip,
    userAgent: requestLog.userAgent,
    headers: req.headers,
    query: req.query,
    body: shouldLogBody(req) ? req.body : '[BODY_HIDDEN]',
  });
  
  // 监听响应完成
  const originalSend = res.send;
  res.send = function(body: any) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    requestLog.duration = duration;
    requestLog.statusCode = res.statusCode;
    requestLog.contentLength = getContentLength(res);
    
    // 记录响应完成
    const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
    const message = `Request completed: ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`;
    
    logger[logLevel](message, {
      requestId,
      statusCode: res.statusCode,
      duration,
      contentLength: requestLog.contentLength,
      responseHeaders: res.getHeaders(),
    });
    
    return originalSend.call(this, body);
  };
  
  // 监听响应错误
  res.on('error', (error: Error) => {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    requestLog.duration = duration;
    requestLog.statusCode = res.statusCode;
    requestLog.error = error.message;
    
    logger.error(`Request error: ${req.method} ${req.originalUrl}`, {
      requestId,
      error: error.message,
      stack: error.stack,
      duration,
    });
  });
  
  next();
};

// 判断是否应该记录请求体
function shouldLogBody(req: Request): boolean {
  // 不记录敏感路径的请求体
  const sensitiveRoutes = ['/api/auth', '/api/login', '/api/register'];
  if (sensitiveRoutes.some(route => req.path.startsWith(route))) {
    return false;
  }
  
  // 不记录大文件上传
  const contentLength = req.get('Content-Length');
  if (contentLength && parseInt(contentLength, 10) > 1024 * 1024) { // 1MB
    return false;
  }
  
  // 不记录文件上传
  const contentType = req.get('Content-Type');
  if (contentType && contentType.includes('multipart/form-data')) {
    return false;
  }
  
  return true;
}

// 性能监控中间件
export const performanceMonitor = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = process.hrtime.bigint();
  
  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // 转换为毫秒
    
    // 记录慢请求（超过1秒）
    if (duration > 1000) {
      logger.warn(`Slow request detected: ${req.method} ${req.originalUrl} - ${duration.toFixed(2)}ms`, {
        requestId: (req as any).requestId,
        duration,
        statusCode: res.statusCode,
      });
    }
    
    // 记录内存使用情况（每100个请求记录一次）
    if (Math.random() < 0.01) {
      const memUsage = process.memoryUsage();
      logger.info('Memory usage', {
        rss: `${(memUsage.rss / 1024 / 1024).toFixed(2)}MB`,
        heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)}MB`,
        heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        external: `${(memUsage.external / 1024 / 1024).toFixed(2)}MB`,
      });
    }
  });
  
  next();
};

// 请求限流中间件
export const rateLimiter = (maxRequests: number = 100, windowMs: number = 60000) => {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientIp = getClientIp(req);
    const now = Date.now();
    
    // 清理过期的记录
    for (const [ip, data] of requests.entries()) {
      if (now > data.resetTime) {
        requests.delete(ip);
      }
    }
    
    // 获取或创建客户端记录
    let clientData = requests.get(clientIp);
    if (!clientData || now > clientData.resetTime) {
      clientData = {
        count: 0,
        resetTime: now + windowMs,
      };
      requests.set(clientIp, clientData);
    }
    
    // 检查请求限制
    if (clientData.count >= maxRequests) {
      logger.warn(`Rate limit exceeded for IP: ${clientIp}`, {
        ip: clientIp,
        count: clientData.count,
        maxRequests,
        windowMs,
      });
      
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests',
          retryAfter: Math.ceil((clientData.resetTime - now) / 1000),
        },
      });
      return;
    }
    
    // 增加请求计数
    clientData.count++;
    
    // 添加限流头信息
    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': (maxRequests - clientData.count).toString(),
      'X-RateLimit-Reset': new Date(clientData.resetTime).toISOString(),
    });
    
    next();
  };
};

// 请求大小限制中间件
export const requestSizeLimit = (maxSize: number = 50 * 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = req.get('Content-Length');
    
    if (contentLength && parseInt(contentLength, 10) > maxSize) {
      logger.warn(`Request size limit exceeded: ${contentLength} bytes`, {
        requestId: (req as any).requestId,
        contentLength,
        maxSize,
        url: req.originalUrl,
      });
      
      res.status(413).json({
        success: false,
        error: {
          code: 'REQUEST_TOO_LARGE',
          message: 'Request entity too large',
          maxSize,
        },
      });
      return;
    }
    
    next();
  };
};