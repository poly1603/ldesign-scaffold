import axios from 'axios';
import type { Project, CreateProjectData } from '../types/project';

// 创建 axios 实例
const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证 token 等
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
    console.error('API 请求错误:', error);
    return Promise.reject(error);
  }
);

// 项目相关 API
export const getProjectsApi = (): Promise<Project[]> => {
  return api.get('/projects');
};

export const createProjectApi = (data: CreateProjectData): Promise<Project> => {
  return api.post('/projects', data);
};

export const getProjectApi = (id: string): Promise<Project> => {
  return api.get(`/projects/${id}`);
};

export const updateProjectApi = (id: string, data: Partial<Project>): Promise<Project> => {
  return api.put(`/projects/${id}`, data);
};

export const deleteProjectApi = (id: string): Promise<void> => {
  return api.delete(`/projects/${id}`);
};

// 项目操作 API
export const startProjectApi = (id: string): Promise<{ port: number; url: string }> => {
  return api.post(`/projects/${id}/start`);
};

export const stopProjectApi = (id: string): Promise<void> => {
  return api.post(`/projects/${id}/stop`);
};

export const buildProjectApi = (id: string, options?: { mode?: string }): Promise<void> => {
  return api.post(`/projects/${id}/build`, options);
};

export const deployProjectApi = (id: string, options?: { target?: string }): Promise<void> => {
  return api.post(`/projects/${id}/deploy`, options);
};

// Git 相关 API
export const getGitStatusApi = (id: string): Promise<any> => {
  return api.get(`/projects/${id}/git/status`);
};

export const gitCommitApi = (id: string, data: { message: string; files: string[] }): Promise<void> => {
  return api.post(`/projects/${id}/git/commit`, data);
};

export const gitPushApi = (id: string): Promise<void> => {
  return api.post(`/projects/${id}/git/push`);
};

export const gitPullApi = (id: string): Promise<void> => {
  return api.post(`/projects/${id}/git/pull`);
};

export const gitStatusApi = (id: string): Promise<any> => {
  return api.get(`/projects/${id}/git/status`);
};

// 预览项目
export const previewProjectApi = (id: string): Promise<void> => {
  return api.post(`/projects/${id}/preview`);
};

// 测试项目
export const testProjectApi = (id: string): Promise<void> => {
  return api.post(`/projects/${id}/test`);
};

// 批量操作项目
export const batchProjectActionApi = (action: string, projectIds: string[]): Promise<any> => {
  return api.post('/projects/batch', { action, projectIds });
};

// 系统相关 API
export const getSystemInfoApi = (): Promise<any> => {
  return api.get('/system/info');
};

export const getTemplatesApi = (): Promise<any> => {
  return api.get('/templates');
};

export default api;