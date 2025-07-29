import path from 'path';
import os from 'os';

export interface ServerConfig {
  env: string;
  server: {
    host: string;
    port: number;
  };
  cors: {
    origin: string | string[] | boolean;
  };
  paths: {
    root: string;
    projects: string;
    templates: string;
    logs: string;
    temp: string;
  };
  limits: {
    maxProjects: number;
    maxFileSize: number;
    maxLogSize: number;
  };
  websocket: {
    heartbeatInterval: number;
    maxConnections: number;
  };
  git: {
    defaultBranch: string;
    maxCommitMessageLength: number;
  };
  build: {
    timeout: number;
    maxConcurrent: number;
  };
  deploy: {
    timeout: number;
    maxRetries: number;
  };
}

const isDevelopment = process.env.NODE_ENV !== 'production';
const isProduction = process.env.NODE_ENV === 'production';

// 获取用户主目录下的LDesign目录
const userHomeDir = os.homedir();
const ldesignDir = path.join(userHomeDir, '.ldesign');

export const config: ServerConfig = {
  env: process.env.NODE_ENV || 'development',
  
  server: {
    host: process.env.HOST || '127.0.0.1',
    port: parseInt(process.env.PORT || '3002', 10),
  },
  
  cors: {
    origin: isDevelopment 
      ? ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173']
      : process.env.CORS_ORIGIN?.split(',') || false,
  },
  
  paths: {
    root: process.cwd(),
    projects: process.env.PROJECTS_DIR || path.join(ldesignDir, 'projects'),
    templates: process.env.TEMPLATES_DIR || (isDevelopment
      ? path.join(process.cwd(), '..', '..', 'packages', 'templates')
      : path.join(ldesignDir, 'templates')),
    logs: process.env.LOGS_DIR || path.join(ldesignDir, 'logs'),
    temp: process.env.TEMP_DIR || path.join(ldesignDir, 'temp'),
  },
  
  limits: {
    maxProjects: parseInt(process.env.MAX_PROJECTS || '100', 10),
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800', 10), // 50MB
    maxLogSize: parseInt(process.env.MAX_LOG_SIZE || '10485760', 10), // 10MB
  },
  
  websocket: {
    heartbeatInterval: parseInt(process.env.WS_HEARTBEAT_INTERVAL || '30000', 10), // 30秒
    maxConnections: parseInt(process.env.WS_MAX_CONNECTIONS || '100', 10),
  },
  
  git: {
    defaultBranch: process.env.GIT_DEFAULT_BRANCH || 'main',
    maxCommitMessageLength: parseInt(process.env.GIT_MAX_COMMIT_LENGTH || '500', 10),
  },
  
  build: {
    timeout: parseInt(process.env.BUILD_TIMEOUT || '300000', 10), // 5分钟
    maxConcurrent: parseInt(process.env.BUILD_MAX_CONCURRENT || '3', 10),
  },
  
  deploy: {
    timeout: parseInt(process.env.DEPLOY_TIMEOUT || '600000', 10), // 10分钟
    maxRetries: parseInt(process.env.DEPLOY_MAX_RETRIES || '3', 10),
  },
};

// 验证配置
function validateConfig(): void {
  const errors: string[] = [];
  
  if (config.server.port < 1 || config.server.port > 65535) {
    errors.push('Invalid server port');
  }
  
  if (config.limits.maxProjects < 1) {
    errors.push('Invalid max projects limit');
  }
  
  if (config.limits.maxFileSize < 1024) {
    errors.push('Invalid max file size limit');
  }
  
  if (config.websocket.heartbeatInterval < 1000) {
    errors.push('Invalid WebSocket heartbeat interval');
  }
  
  if (config.build.timeout < 10000) {
    errors.push('Invalid build timeout');
  }
  
  if (config.deploy.timeout < 10000) {
    errors.push('Invalid deploy timeout');
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration validation failed: ${errors.join(', ')}`);
  }
}

// 在模块加载时验证配置
validateConfig();

export default config;