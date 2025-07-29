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
    console.error('模板API请求错误:', error);
    return Promise.reject(error);
  }
);

// 模板相关接口
export interface Template {
  name: string;
  displayName: string;
  description: string;
  version: string;
  author: string;
  type: string;
  features: string[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
  keywords: string[];
  stats: {
    fileCount: number;
    totalSize: number;
    fileTypes: Record<string, number>;
  };
}

export interface TemplatesResponse {
  success: boolean;
  data: {
    templates: Template[];
    count: number;
  };
}

// 获取所有模板
export const getTemplatesApi = (): Promise<TemplatesResponse> => {
  return api.get('/templates');
};

// 获取单个模板详情
export const getTemplateApi = (templateName: string): Promise<any> => {
  return api.get(`/templates/${templateName}`);
};

// 获取模板预览
export const getTemplatePreviewApi = (templateName: string): Promise<any> => {
  return api.get(`/templates/${templateName}/preview`);
};
