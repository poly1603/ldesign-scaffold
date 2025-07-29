// 项目状态类型
export type ProjectStatus = 'running' | 'stopped' | 'building' | 'error';

// 项目模板类型
export type ProjectTemplate =
  | 'vue3-basic'
  | 'vue3-component-lib'
  | 'vue2-basic'
  | 'vue2-component-lib'
  | 'react-basic'
  | 'react-component-lib'
  | 'typescript-lib'
  | 'nodejs-api'
  | 'less-style-lib';

// 包管理器类型
export type PackageManager = 'pnpm' | 'npm' | 'yarn';

// 项目接口
export interface Project {
  id: string;
  name: string;
  description?: string;
  template: ProjectTemplate;
  path: string;
  packageManager: PackageManager;
  status: ProjectStatus;
  port?: number;
  devUrl?: string;
  buildProgress?: number;
  buildText?: string;
  gitInitialized: boolean;
  createdAt: string;
  updatedAt: string;
}

// 创建项目数据接口
export interface CreateProjectData {
  name: string;
  description?: string;
  template: ProjectTemplate;
  path: string;
  packageManager: PackageManager;
  initGit: boolean;
}

// Git 状态接口
export interface GitStatus {
  branch: string;
  ahead: number;
  behind: number;
  staged: string[];
  unstaged: string[];
  untracked: string[];
}

// 构建配置接口
export interface BuildConfig {
  mode: 'development' | 'production' | 'test';
  target?: string;
  outDir?: string;
  sourcemap?: boolean;
  minify?: boolean;
}

// 部署配置接口
export interface DeployConfig {
  target: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  path?: string;
}

// 项目统计接口
export interface ProjectStats {
  totalProjects: number;
  runningProjects: number;
  buildingProjects: number;
  errorProjects: number;
}

// 模板配置接口
export interface TemplateConfig {
  name: string;
  label: string;
  description: string;
  icon: string;
  category: string;
  tags: string[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
  files: TemplateFile[];
}

// 模板文件接口
export interface TemplateFile {
  path: string;
  content: string;
  encoding?: 'utf8' | 'base64';
}

// 系统信息接口
export interface SystemInfo {
  nodeVersion: string;
  npmVersion: string;
  pnpmVersion?: string;
  yarnVersion?: string;
  gitVersion?: string;
  platform: string;
  arch: string;
  cpus: number;
  memory: number;
}

// 日志接口
export interface LogEntry {
  id: string;
  projectId: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  source?: string;
}

// 任务接口
export interface Task {
  id: string;
  projectId: string;
  type: 'build' | 'deploy' | 'install' | 'git';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  message: string;
  startTime: string;
  endTime?: string;
  logs: LogEntry[];
}