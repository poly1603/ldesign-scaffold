// 默认配置常量
export const DEFAULT_CONFIG = {
  // 默认项目配置
  PROJECT: {
    VERSION: '1.0.0',
    LICENSE: 'MIT',
    AUTHOR: 'LDesign Team',
    DESCRIPTION: 'A project created with LDesign scaffold'
  },
  
  // 默认端口
  PORTS: {
    DEV_SERVER: 3000,
    API_SERVER: 3001,
    PREVIEW_SERVER: 4173
  },
  
  // 文件路径
  PATHS: {
    TEMPLATES: 'templates',
    OUTPUT: 'dist',
    SRC: 'src',
    PUBLIC: 'public',
    ASSETS: 'assets'
  },
  
  // 包管理器
  PACKAGE_MANAGERS: ['npm', 'yarn', 'pnpm'] as const,
  
  // 支持的项目类型
  PROJECT_TYPES: {
    VUE2: 'vue2',
    VUE3: 'vue3',
    REACT: 'react',
    TYPESCRIPT: 'typescript',
    NODE: 'node',
    LIBRARY: 'library'
  } as const,
  
  // 构建格式
  BUILD_FORMATS: ['esm', 'cjs', 'umd'] as const,
  
  // 部署提供商
  DEPLOY_PROVIDERS: ['vercel', 'netlify', 'github-pages', 'custom'] as const
};

// 模板常量
export const TEMPLATES = {
  VUE3_BASIC: {
    name: 'vue3-basic',
    displayName: 'Vue 3 基础模板',
    description: '基于 Vue 3 + Vite 的基础项目模板',
    features: ['vue3', 'vite', 'typescript', 'vue-router', 'pinia']
  },
  VUE3_ADMIN: {
    name: 'vue3-admin',
    displayName: 'Vue 3 管理后台',
    description: '基于 Vue 3 + Element Plus 的管理后台模板',
    features: ['vue3', 'vite', 'typescript', 'vue-router', 'pinia', 'element-plus']
  },
  REACT_BASIC: {
    name: 'react-basic',
    displayName: 'React 基础模板',
    description: '基于 React + Vite 的基础项目模板',
    features: ['react', 'vite', 'typescript', 'react-router']
  },
  NODE_API: {
    name: 'node-api',
    displayName: 'Node.js API',
    description: '基于 Express + TypeScript 的 API 服务模板',
    features: ['node', 'express', 'typescript', 'cors', 'helmet']
  },
  LIBRARY: {
    name: 'library',
    displayName: 'TypeScript 库',
    description: '用于开发 TypeScript 库的模板',
    features: ['typescript', 'rollup', 'jest', 'eslint']
  }
};

// 文件扩展名映射
export const FILE_EXTENSIONS = {
  TYPESCRIPT: ['.ts', '.tsx'],
  JAVASCRIPT: ['.js', '.jsx'],
  VUE: ['.vue'],
  STYLE: ['.css', '.scss', '.sass', '.less', '.styl'],
  CONFIG: ['.json', '.yaml', '.yml', '.toml'],
  MARKDOWN: ['.md', '.mdx'],
  IMAGE: ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'],
  FONT: ['.woff', '.woff2', '.ttf', '.otf', '.eot']
};

// Git 相关常量
export const GIT = {
  DEFAULT_BRANCH: 'main',
  IGNORE_PATTERNS: [
    'node_modules/',
    'dist/',
    'build/',
    '.env.local',
    '.env.*.local',
    'npm-debug.log*',
    'yarn-debug.log*',
    'yarn-error.log*',
    '.DS_Store',
    'Thumbs.db'
  ],
  COMMIT_TYPES: [
    'feat',
    'fix',
    'docs',
    'style',
    'refactor',
    'perf',
    'test',
    'chore'
  ]
};

// 错误代码
export const ERROR_CODES = {
  // 通用错误
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  INVALID_ARGUMENT: 'INVALID_ARGUMENT',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  
  // 项目相关错误
  PROJECT_EXISTS: 'PROJECT_EXISTS',
  PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
  INVALID_PROJECT_NAME: 'INVALID_PROJECT_NAME',
  TEMPLATE_NOT_FOUND: 'TEMPLATE_NOT_FOUND',
  
  // 构建相关错误
  BUILD_FAILED: 'BUILD_FAILED',
  BUILD_TIMEOUT: 'BUILD_TIMEOUT',
  
  // 部署相关错误
  DEPLOY_FAILED: 'DEPLOY_FAILED',
  DEPLOY_CONFIG_INVALID: 'DEPLOY_CONFIG_INVALID',
  
  // Git 相关错误
  GIT_NOT_INITIALIZED: 'GIT_NOT_INITIALIZED',
  GIT_OPERATION_FAILED: 'GIT_OPERATION_FAILED'
};

// 成功消息
export const SUCCESS_MESSAGES = {
  PROJECT_CREATED: '项目创建成功！',
  PROJECT_BUILT: '项目构建成功！',
  PROJECT_DEPLOYED: '项目部署成功！',
  GIT_INITIALIZED: 'Git 仓库初始化成功！',
  DEPENDENCIES_INSTALLED: '依赖安装成功！'
};

// 错误消息
export const ERROR_MESSAGES = {
  PROJECT_EXISTS: '项目已存在，请选择其他名称或使用 --force 参数覆盖',
  INVALID_PROJECT_NAME: '项目名称无效，只能包含字母、数字、短横线和下划线',
  TEMPLATE_NOT_FOUND: '模板不存在，请检查模板名称',
  BUILD_FAILED: '项目构建失败，请检查代码和配置',
  DEPLOY_FAILED: '项目部署失败，请检查部署配置',
  GIT_NOT_INITIALIZED: 'Git 仓库未初始化，请先运行 git init',
  PERMISSION_DENIED: '权限不足，请检查文件权限'
};