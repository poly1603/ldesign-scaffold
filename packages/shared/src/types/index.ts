// 项目类型定义
export interface ProjectConfig {
  name: string;
  type: ProjectType;
  template: string;
  description?: string;
  author?: string;
  version?: string;
  license?: string;
  features?: string[];
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

// 项目类型枚举
export enum ProjectType {
  VUE2 = 'vue2',
  VUE3 = 'vue3',
  REACT = 'react',
  TYPESCRIPT = 'typescript',
  NODE = 'node',
  LIBRARY = 'library'
}

// 模板配置
export interface TemplateConfig {
  name: string;
  displayName: string;
  description: string;
  type: ProjectType;
  features: string[];
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  scripts: Record<string, string>;
  files: TemplateFile[];
}

// 模板文件
export interface TemplateFile {
  path: string;
  content: string;
  encoding?: 'utf8' | 'binary';
}

// 构建配置
export interface BuildConfig {
  entry: string;
  output: string;
  format: 'esm' | 'cjs' | 'umd';
  minify: boolean;
  sourcemap: boolean;
  external?: string[];
}

// 部署配置
export interface DeployConfig {
  provider: 'vercel' | 'netlify' | 'github-pages' | 'custom';
  buildCommand?: string;
  outputDir?: string;
  domain?: string;
  env?: Record<string, string>;
}

// Git配置
export interface GitConfig {
  remote: string;
  branch: string;
  commitMessage?: string;
  autoCommit?: boolean;
  autoPush?: boolean;
}

// CLI选项
export interface CLIOptions {
  template?: string;
  features?: string[];
  packageManager?: 'npm' | 'yarn' | 'pnpm';
  git?: boolean;
  install?: boolean;
  force?: boolean;
  verbose?: boolean;
}

// 日志级别
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

// 命令结果
export interface CommandResult {
  success: boolean;
  message?: string;
  data?: any;
  error?: Error;
}