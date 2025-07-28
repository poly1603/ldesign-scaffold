import { defineStore } from 'pinia';
import { ref, reactive, watch } from 'vue';

// 配置接口定义
interface EditorConfig {
  defaultEditor: string;
  editorPath: string;
  editorArgs: string;
  extensions: string[];
}

interface TerminalConfig {
  defaultTerminal: string;
  terminalPath: string;
  workingDirectory: 'project' | 'current' | 'custom';
  customWorkingDir: string;
  envVars: Array<{ key: string; value: string }>;
}

interface PackageConfig {
  defaultManager: 'npm' | 'yarn' | 'pnpm';
  registry: string;
  customRegistry: string;
  installOptions: string[];
  cacheDir: string;
  cacheSize: number;
}

interface GitConfig {
  userName: string;
  userEmail: string;
  defaultBranch: string;
  commitTemplate: string;
  gitignoreTemplate: string[];
  sshKey: string;
}

interface SystemConfig {
  language: string;
  theme: 'light' | 'dark' | 'auto';
  autoUpdate: boolean;
  errorReporting: boolean;
  analytics: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
}

interface AppConfig {
  editor: EditorConfig;
  terminal: TerminalConfig;
  package: PackageConfig;
  git: GitConfig;
  system: SystemConfig;
}

const CONFIG_STORAGE_KEY = 'ldesign-config';

// 默认配置
const defaultConfig: AppConfig = {
  editor: {
    defaultEditor: 'vscode',
    editorPath: '',
    editorArgs: '',
    extensions: ['prettier', 'eslint', 'typescript'],
  },
  terminal: {
    defaultTerminal: 'powershell',
    terminalPath: '',
    workingDirectory: 'project',
    customWorkingDir: '',
    envVars: [
      { key: 'NODE_ENV', value: 'development' },
    ],
  },
  package: {
    defaultManager: 'pnpm',
    registry: 'taobao',
    customRegistry: '',
    installOptions: ['save-exact'],
    cacheDir: '',
    cacheSize: 1024,
  },
  git: {
    userName: '',
    userEmail: '',
    defaultBranch: 'main',
    commitTemplate: 'feat: \n\nBreaking Changes:\n\nCloses #',
    gitignoreTemplate: ['node', 'vscode'],
    sshKey: '',
  },
  system: {
    language: 'zh-CN',
    theme: 'light',
    autoUpdate: true,
    errorReporting: true,
    analytics: false,
    logLevel: 'info',
  },
};

export const useConfigStore = defineStore('config', () => {
  // 状态
  const config = reactive<AppConfig>(JSON.parse(JSON.stringify(defaultConfig)));
  const loading = ref(false);
  const dirty = ref(false);

  // 加载配置
  const loadConfig = () => {
    try {
      const savedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        
        // 合并配置，确保新增的配置项有默认值
        Object.assign(config.editor, defaultConfig.editor, parsed.editor);
        Object.assign(config.terminal, defaultConfig.terminal, parsed.terminal);
        Object.assign(config.package, defaultConfig.package, parsed.package);
        Object.assign(config.git, defaultConfig.git, parsed.git);
        Object.assign(config.system, defaultConfig.system, parsed.system);
        
        dirty.value = false;
      }
    } catch (error) {
      console.error('加载配置失败:', error);
      // 如果加载失败，使用默认配置
      resetConfig();
    }
  };

  // 保存配置
  const saveConfig = async () => {
    loading.value = true;
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
      dirty.value = false;
      return true;
    } catch (error) {
      console.error('保存配置失败:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // 重置配置
  const resetConfig = () => {
    Object.assign(config, JSON.parse(JSON.stringify(defaultConfig)));
    dirty.value = true;
  };

  // 导出配置
  const exportConfig = () => {
    const configJson = JSON.stringify(config, null, 2);
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ldesign-config-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 导入配置
  const importConfig = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedConfig = JSON.parse(e.target?.result as string);
          
          // 验证配置格式
          if (!isValidConfig(importedConfig)) {
            throw new Error('配置文件格式无效');
          }
          
          // 合并配置
          if (importedConfig.editor) Object.assign(config.editor, importedConfig.editor);
          if (importedConfig.terminal) Object.assign(config.terminal, importedConfig.terminal);
          if (importedConfig.package) Object.assign(config.package, importedConfig.package);
          if (importedConfig.git) Object.assign(config.git, importedConfig.git);
          if (importedConfig.system) Object.assign(config.system, importedConfig.system);
          
          dirty.value = true;
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('读取文件失败'));
      reader.readAsText(file);
    });
  };

  // 验证配置格式
  const isValidConfig = (configData: any): boolean => {
    try {
      // 基本结构检查
      if (typeof configData !== 'object' || configData === null) {
        return false;
      }
      
      // 检查必要的配置节点
      const requiredSections = ['editor', 'terminal', 'package', 'git', 'system'];
      for (const section of requiredSections) {
        if (configData[section] && typeof configData[section] !== 'object') {
          return false;
        }
      }
      
      return true;
    } catch {
      return false;
    }
  };

  // 获取特定配置
  const getEditorConfig = () => config.editor;
  const getTerminalConfig = () => config.terminal;
  const getPackageConfig = () => config.package;
  const getGitConfig = () => config.git;
  const getSystemConfig = () => config.system;

  // 更新特定配置
  const updateEditorConfig = (updates: Partial<EditorConfig>) => {
    Object.assign(config.editor, updates);
    dirty.value = true;
  };

  const updateTerminalConfig = (updates: Partial<TerminalConfig>) => {
    Object.assign(config.terminal, updates);
    dirty.value = true;
  };

  const updatePackageConfig = (updates: Partial<PackageConfig>) => {
    Object.assign(config.package, updates);
    dirty.value = true;
  };

  const updateGitConfig = (updates: Partial<GitConfig>) => {
    Object.assign(config.git, updates);
    dirty.value = true;
  };

  const updateSystemConfig = (updates: Partial<SystemConfig>) => {
    Object.assign(config.system, updates);
    dirty.value = true;
  };

  // 获取包管理器命令
  const getPackageManagerCommand = (action: string) => {
    const manager = config.package.defaultManager;
    const commands: Record<string, Record<string, string>> = {
      npm: {
        install: 'npm install',
        add: 'npm install',
        remove: 'npm uninstall',
        update: 'npm update',
        run: 'npm run',
        dev: 'npm run dev',
        build: 'npm run build',
      },
      yarn: {
        install: 'yarn install',
        add: 'yarn add',
        remove: 'yarn remove',
        update: 'yarn upgrade',
        run: 'yarn',
        dev: 'yarn dev',
        build: 'yarn build',
      },
      pnpm: {
        install: 'pnpm install',
        add: 'pnpm add',
        remove: 'pnpm remove',
        update: 'pnpm update',
        run: 'pnpm',
        dev: 'pnpm dev',
        build: 'pnpm build',
      },
    };
    
    return commands[manager]?.[action] || `${manager} ${action}`;
  };

  // 获取镜像源地址
  const getRegistryUrl = () => {
    const registryMap: Record<string, string> = {
      npm: 'https://registry.npmjs.org/',
      taobao: 'https://registry.npmmirror.com/',
      cnpm: 'https://r.cnpmjs.org/',
    };
    
    if (config.package.registry === 'custom') {
      return config.package.customRegistry;
    }
    
    return registryMap[config.package.registry] || registryMap.npm;
  };

  // 获取编辑器启动命令
  const getEditorCommand = (projectPath?: string) => {
    const editorCommands: Record<string, string> = {
      vscode: 'code',
      webstorm: 'webstorm',
      sublime: 'subl',
      atom: 'atom',
      vim: 'vim',
    };
    
    const command = config.editor.editorPath || editorCommands[config.editor.defaultEditor] || 'code';
    const args = config.editor.editorArgs ? ` ${config.editor.editorArgs}` : '';
    const path = projectPath ? ` "${projectPath}"` : '';
    
    return `${command}${args}${path}`;
  };

  // 获取终端启动命令
  const getTerminalCommand = (workingDir?: string) => {
    const terminalCommands: Record<string, string> = {
      cmd: 'cmd',
      powershell: 'powershell',
      'git-bash': 'bash',
      wsl: 'wsl',
    };
    
    const command = config.terminal.terminalPath || terminalCommands[config.terminal.defaultTerminal] || 'powershell';
    
    // 构建环境变量
    const envVars = config.terminal.envVars
      .filter(env => env.key && env.value)
      .map(env => `$env:${env.key}="${env.value}"`)
      .join('; ');
    
    let fullCommand = command;
    
    if (workingDir) {
      fullCommand += ` -Command "cd '${workingDir}'`;
      if (envVars) {
        fullCommand += `; ${envVars}`;
      }
      fullCommand += '"; bash';
    }
    
    return fullCommand;
  };

  // 应用主题
  const applyTheme = () => {
    const theme = config.system.theme;
    if (theme === 'auto') {
      // 跟随系统主题
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('theme-mode', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('theme-mode', theme);
    }
  };

  // 监听配置变化
  watch(
    () => config.system.theme,
    () => {
      applyTheme();
    },
    { immediate: true }
  );

  // 自动保存
  const enableAutoSave = (interval = 30000) => {
    setInterval(() => {
      if (dirty.value) {
        saveConfig().catch(console.error);
      }
    }, interval);
  };

  // 初始化
  const init = () => {
    loadConfig();
    applyTheme();
    enableAutoSave();
  };

  return {
    // 状态
    config,
    loading,
    dirty,
    
    // 操作
    loadConfig,
    saveConfig,
    resetConfig,
    exportConfig,
    importConfig,
    
    // 获取配置
    getEditorConfig,
    getTerminalConfig,
    getPackageConfig,
    getGitConfig,
    getSystemConfig,
    
    // 更新配置
    updateEditorConfig,
    updateTerminalConfig,
    updatePackageConfig,
    updateGitConfig,
    updateSystemConfig,
    
    // 工具方法
    getPackageManagerCommand,
    getRegistryUrl,
    getEditorCommand,
    getTerminalCommand,
    applyTheme,
    
    // 初始化
    init,
  };
});