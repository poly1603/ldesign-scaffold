import axios from 'axios';

// 创建 axios 实例
const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('系统API请求错误:', error);
    return Promise.reject(error);
  }
);

// 系统相关接口
export interface SystemInfo {
  platform: string;
  arch: string;
  release: string;
  hostname: string;
  uptime: number;
  loadavg: number[];
  totalmem: number;
  freemem: number;
  cpus: number;
  networkInterfaces: string[];
  node: {
    version: string;
    platform: string;
    arch: string;
    pid: number;
    uptime: number;
    memoryUsage: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
      arrayBuffers: number;
    };
  };
  server: {
    version: string;
    environment: string;
    port: number;
    host: string;
  };
}

export interface FolderSelectResponse {
  success: boolean;
  data: {
    path: string | null;
  };
  error?: string;
}

// 获取系统信息
export const getSystemInfoApi = (): Promise<{
  success: boolean;
  data: SystemInfo;
}> => {
  return api.get('/system/info');
};

// 选择文件夹
export const selectFolderApi = (): Promise<FolderSelectResponse> => {
  return api.post('/system/select-folder');
};

// 获取常用目录
export const getCommonDirectoriesApi = (): Promise<{
  success: boolean;
  data: {
    directories: Array<{
      name: string;
      path: string;
      type: string;
    }>;
    currentDirectory: string;
    platform: string;
  };
  error?: string;
}> => {
  return api.get('/system/common-directories');
};

// 浏览目录
export const browseDirectoryApi = (path: string): Promise<{
  success: boolean;
  data: {
    currentPath: string;
    parentPath: string | null;
    directories: Array<{
      name: string;
      path: string;
      isDirectory: boolean;
      size: number;
      modified: string;
    }>;
    canWrite: boolean;
  };
  error?: string;
}> => {
  return api.post('/system/browse-directory', { path });
};

// 验证路径
export const validatePathApi = (path: string): Promise<{
  success: boolean;
  data: {
    path: string;
    exists: boolean;
    isDirectory: boolean;
    isWritable: boolean;
    stats: any;
  };
  error?: string;
}> => {
  return api.post('/system/validate-path', { path });
};

// 创建目录
export const createDirectoryApi = (path: string): Promise<{
  success: boolean;
  data: {
    path: string;
    created: boolean;
    stats: any;
  };
  error?: string;
}> => {
  return api.post('/system/create-directory', { path });
};
