<template>
  <div class="tool-config">
    <t-card title="工具配置" class="mb-4">
      <t-tabs v-model="activeTab">
        <!-- 编辑器配置 -->
        <t-tab-panel value="editor" label="编辑器配置">
          <div class="editor-config">
            <t-form :data="editorConfig" layout="vertical">
              <t-row :gutter="16">
                <t-col :span="12">
                  <t-form-item label="默认编辑器" name="defaultEditor">
                    <t-select
                      v-model="editorConfig.defaultEditor"
                      placeholder="选择默认编辑器"
                    >
                      <t-option value="vscode" label="Visual Studio Code" />
                      <t-option value="webstorm" label="WebStorm" />
                      <t-option value="sublime" label="Sublime Text" />
                      <t-option value="atom" label="Atom" />
                      <t-option value="vim" label="Vim" />
                    </t-select>
                  </t-form-item>
                </t-col>
                
                <t-col :span="12">
                  <t-form-item label="编辑器路径" name="editorPath">
                    <t-input
                      v-model="editorConfig.editorPath"
                      placeholder="编辑器可执行文件路径"
                    >
                      <template #suffix>
                        <t-button theme="default" variant="text" @click="browseEditorPath">
                          <folder-open-icon />
                        </t-button>
                      </template>
                    </t-input>
                  </t-form-item>
                </t-col>
              </t-row>
              
              <t-form-item label="启动参数" name="editorArgs">
                <t-input
                  v-model="editorConfig.editorArgs"
                  placeholder="编辑器启动参数（可选）"
                />
              </t-form-item>
              
              <t-form-item label="扩展配置" name="extensions">
                <div class="extensions-config">
                  <t-checkbox-group v-model="editorConfig.extensions">
                    <t-checkbox value="prettier">Prettier - 代码格式化</t-checkbox>
                    <t-checkbox value="eslint">ESLint - 代码检查</t-checkbox>
                    <t-checkbox value="vetur">Vetur - Vue 支持</t-checkbox>
                    <t-checkbox value="typescript">TypeScript - TS 支持</t-checkbox>
                    <t-checkbox value="gitlens">GitLens - Git 增强</t-checkbox>
                    <t-checkbox value="bracket-pair">Bracket Pair - 括号匹配</t-checkbox>
                  </t-checkbox-group>
                </div>
              </t-form-item>
            </t-form>
          </div>
        </t-tab-panel>
        
        <!-- 终端配置 -->
        <t-tab-panel value="terminal" label="终端配置">
          <div class="terminal-config">
            <t-form :data="terminalConfig" layout="vertical">
              <t-row :gutter="16">
                <t-col :span="12">
                  <t-form-item label="默认终端" name="defaultTerminal">
                    <t-select
                      v-model="terminalConfig.defaultTerminal"
                      placeholder="选择默认终端"
                    >
                      <t-option value="cmd" label="Command Prompt" />
                      <t-option value="powershell" label="PowerShell" />
                      <t-option value="git-bash" label="Git Bash" />
                      <t-option value="wsl" label="WSL" />
                      <t-option value="custom" label="自定义" />
                    </t-select>
                  </t-form-item>
                </t-col>
                
                <t-col :span="12">
                  <t-form-item label="终端路径" name="terminalPath">
                    <t-input
                      v-model="terminalConfig.terminalPath"
                      placeholder="终端可执行文件路径"
                      :disabled="terminalConfig.defaultTerminal !== 'custom'"
                    >
                      <template #suffix>
                        <t-button 
                          theme="default" 
                          variant="text" 
                          :disabled="terminalConfig.defaultTerminal !== 'custom'"
                          @click="browseTerminalPath"
                        >
                          <folder-open-icon />
                        </t-button>
                      </template>
                    </t-input>
                  </t-form-item>
                </t-col>
              </t-row>
              
              <t-form-item label="工作目录" name="workingDirectory">
                <t-radio-group v-model="terminalConfig.workingDirectory">
                  <t-radio value="project">项目根目录</t-radio>
                  <t-radio value="current">当前目录</t-radio>
                  <t-radio value="custom">自定义目录</t-radio>
                </t-radio-group>
              </t-form-item>
              
              <t-form-item 
                v-if="terminalConfig.workingDirectory === 'custom'"
                label="自定义目录" 
                name="customWorkingDir"
              >
                <t-input
                  v-model="terminalConfig.customWorkingDir"
                  placeholder="自定义工作目录路径"
                >
                  <template #suffix>
                    <t-button theme="default" variant="text" @click="browseWorkingDir">
                      <folder-open-icon />
                    </t-button>
                  </template>
                </t-input>
              </t-form-item>
              
              <t-form-item label="环境变量" name="envVars">
                <div class="env-vars">
                  <div
                    v-for="(envVar, index) in terminalConfig.envVars"
                    :key="index"
                    class="env-var-item"
                  >
                    <t-input
                      v-model="envVar.key"
                      placeholder="变量名"
                      class="env-key"
                    />
                    <t-input
                      v-model="envVar.value"
                      placeholder="变量值"
                      class="env-value"
                    />
                    <t-button
                      theme="default"
                      variant="text"
                      @click="removeTerminalEnvVar(index)"
                    >
                      <delete-icon />
                    </t-button>
                  </div>
                  
                  <t-button theme="default" variant="dashed" @click="addTerminalEnvVar">
                    <template #icon>
                      <add-icon />
                    </template>
                    添加环境变量
                  </t-button>
                </div>
              </t-form-item>
            </t-form>
          </div>
        </t-tab-panel>
        
        <!-- 包管理器配置 -->
        <t-tab-panel value="package" label="包管理器">
          <div class="package-config">
            <t-form :data="packageConfig" layout="vertical">
              <t-form-item label="默认包管理器" name="defaultManager">
                <t-radio-group v-model="packageConfig.defaultManager">
                  <t-radio value="npm">npm</t-radio>
                  <t-radio value="yarn">Yarn</t-radio>
                  <t-radio value="pnpm">pnpm</t-radio>
                </t-radio-group>
              </t-form-item>
              
              <t-form-item label="镜像源配置" name="registry">
                <t-select
                  v-model="packageConfig.registry"
                  placeholder="选择镜像源"
                >
                  <t-option value="npm" label="npm 官方源" />
                  <t-option value="taobao" label="淘宝镜像" />
                  <t-option value="cnpm" label="cnpm 镜像" />
                  <t-option value="custom" label="自定义" />
                </t-select>
              </t-form-item>
              
              <t-form-item 
                v-if="packageConfig.registry === 'custom'"
                label="自定义镜像源" 
                name="customRegistry"
              >
                <t-input
                  v-model="packageConfig.customRegistry"
                  placeholder="输入自定义镜像源地址"
                />
              </t-form-item>
              
              <t-form-item label="安装选项" name="installOptions">
                <t-checkbox-group v-model="packageConfig.installOptions">
                  <t-checkbox value="save-exact">精确版本安装</t-checkbox>
                  <t-checkbox value="no-optional">跳过可选依赖</t-checkbox>
                  <t-checkbox value="ignore-scripts">忽略脚本</t-checkbox>
                  <t-checkbox value="prefer-offline">优先离线</t-checkbox>
                </t-checkbox-group>
              </t-form-item>
              
              <t-form-item label="缓存配置" name="cache">
                <t-row :gutter="16">
                  <t-col :span="12">
                    <t-input
                      v-model="packageConfig.cacheDir"
                      placeholder="缓存目录"
                      addon-before="缓存目录"
                    >
                      <template #suffix>
                        <t-button theme="default" variant="text" @click="browseCacheDir">
                          <folder-open-icon />
                        </t-button>
                      </template>
                    </t-input>
                  </t-col>
                  
                  <t-col :span="12">
                    <t-input
                      v-model="packageConfig.cacheSize"
                      placeholder="缓存大小限制"
                      addon-before="大小限制"
                      addon-after="MB"
                      type="number"
                    />
                  </t-col>
                </t-row>
              </t-form-item>
            </t-form>
          </div>
        </t-tab-panel>
        
        <!-- Git 配置 -->
        <t-tab-panel value="git" label="Git 配置">
          <div class="git-config">
            <t-form :data="gitConfig" layout="vertical">
              <t-row :gutter="16">
                <t-col :span="12">
                  <t-form-item label="用户名" name="userName">
                    <t-input
                      v-model="gitConfig.userName"
                      placeholder="Git 用户名"
                    />
                  </t-form-item>
                </t-col>
                
                <t-col :span="12">
                  <t-form-item label="邮箱" name="userEmail">
                    <t-input
                      v-model="gitConfig.userEmail"
                      placeholder="Git 邮箱"
                    />
                  </t-form-item>
                </t-col>
              </t-row>
              
              <t-form-item label="默认分支" name="defaultBranch">
                <t-input
                  v-model="gitConfig.defaultBranch"
                  placeholder="默认分支名称"
                />
              </t-form-item>
              
              <t-form-item label="提交模板" name="commitTemplate">
                <t-textarea
                  v-model="gitConfig.commitTemplate"
                  placeholder="提交信息模板"
                  :rows="4"
                />
              </t-form-item>
              
              <t-form-item label="忽略文件模板" name="gitignoreTemplate">
                <t-select
                  v-model="gitConfig.gitignoreTemplate"
                  placeholder="选择 .gitignore 模板"
                  multiple
                >
                  <t-option value="node" label="Node.js" />
                  <t-option value="vue" label="Vue.js" />
                  <t-option value="react" label="React" />
                  <t-option value="typescript" label="TypeScript" />
                  <t-option value="vscode" label="VS Code" />
                  <t-option value="macos" label="macOS" />
                  <t-option value="windows" label="Windows" />
                  <t-option value="linux" label="Linux" />
                </t-select>
              </t-form-item>
              
              <t-form-item label="SSH 密钥" name="sshKey">
                <t-input
                  v-model="gitConfig.sshKey"
                  placeholder="SSH 私钥路径"
                >
                  <template #suffix>
                    <t-button theme="default" variant="text" @click="browseSshKey">
                      <folder-open-icon />
                    </t-button>
                  </template>
                </t-input>
              </t-form-item>
            </t-form>
          </div>
        </t-tab-panel>
        
        <!-- 系统配置 -->
        <t-tab-panel value="system" label="系统配置">
          <div class="system-config">
            <t-form :data="systemConfig" layout="vertical">
              <t-form-item label="语言设置" name="language">
                <t-select
                  v-model="systemConfig.language"
                  placeholder="选择界面语言"
                >
                  <t-option value="zh-CN" label="简体中文" />
                  <t-option value="en-US" label="English" />
                  <t-option value="ja-JP" label="日本語" />
                </t-select>
              </t-form-item>
              
              <t-form-item label="主题设置" name="theme">
                <t-radio-group v-model="systemConfig.theme">
                  <t-radio value="light">浅色主题</t-radio>
                  <t-radio value="dark">深色主题</t-radio>
                  <t-radio value="auto">跟随系统</t-radio>
                </t-radio-group>
              </t-form-item>
              
              <t-form-item label="自动更新" name="autoUpdate">
                <t-switch v-model="systemConfig.autoUpdate" />
                <span class="form-help">自动检查并下载更新</span>
              </t-form-item>
              
              <t-form-item label="错误报告" name="errorReporting">
                <t-switch v-model="systemConfig.errorReporting" />
                <span class="form-help">自动发送错误报告以改进产品</span>
              </t-form-item>
              
              <t-form-item label="使用统计" name="analytics">
                <t-switch v-model="systemConfig.analytics" />
                <span class="form-help">发送匿名使用统计数据</span>
              </t-form-item>
              
              <t-form-item label="日志级别" name="logLevel">
                <t-select
                  v-model="systemConfig.logLevel"
                  placeholder="选择日志级别"
                >
                  <t-option value="error" label="错误" />
                  <t-option value="warn" label="警告" />
                  <t-option value="info" label="信息" />
                  <t-option value="debug" label="调试" />
                </t-select>
              </t-form-item>
              
              <t-form-item label="缓存清理" name="cacheCleanup">
                <t-row :gutter="16">
                  <t-col :span="12">
                    <t-button theme="default" @click="clearCache">
                      <template #icon>
                        <delete-icon />
                      </template>
                      清理应用缓存
                    </t-button>
                  </t-col>
                  
                  <t-col :span="12">
                    <t-button theme="default" @click="clearLogs">
                      <template #icon>
                        <delete-icon />
                      </template>
                      清理应用日志
                    </t-button>
                  </t-col>
                </t-row>
              </t-form-item>
            </t-form>
          </div>
        </t-tab-panel>
      </t-tabs>
      
      <!-- 操作按钮 -->
      <div class="config-actions mt-6">
        <t-space>
          <t-button theme="primary" @click="saveConfig">
            <template #icon>
              <save-icon />
            </template>
            保存配置
          </t-button>
          
          <t-button theme="default" @click="resetConfig">
            <template #icon>
              <refresh-icon />
            </template>
            重置配置
          </t-button>
          
          <t-button theme="default" @click="exportConfig">
            <template #icon>
              <download-icon />
            </template>
            导出配置
          </t-button>
          
          <t-button theme="default" @click="importConfig">
            <template #icon>
              <upload-icon />
            </template>
            导入配置
          </t-button>
        </t-space>
      </div>
    </t-card>
    
    <!-- 配置预览 -->
    <t-card title="配置预览" class="mt-4">
      <t-textarea
        :value="configPreview"
        readonly
        :rows="15"
        placeholder="配置预览将在这里显示"
      />
    </t-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import {
  FolderOpenIcon,
  AddIcon,
  DeleteIcon,
  SaveIcon,
  RefreshIcon,
  DownloadIcon,
  UploadIcon,
} from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';

// 响应式数据
const activeTab = ref('editor');

// 编辑器配置
const editorConfig = reactive({
  defaultEditor: 'vscode',
  editorPath: '',
  editorArgs: '',
  extensions: ['prettier', 'eslint', 'typescript'],
});

// 终端配置
const terminalConfig = reactive({
  defaultTerminal: 'powershell',
  terminalPath: '',
  workingDirectory: 'project',
  customWorkingDir: '',
  envVars: [
    { key: 'NODE_ENV', value: 'development' },
  ],
});

// 包管理器配置
const packageConfig = reactive({
  defaultManager: 'pnpm',
  registry: 'taobao',
  customRegistry: '',
  installOptions: ['save-exact'],
  cacheDir: '',
  cacheSize: 1024,
});

// Git 配置
const gitConfig = reactive({
  userName: '',
  userEmail: '',
  defaultBranch: 'main',
  commitTemplate: 'feat: \n\nBreaking Changes:\n\nCloses #',
  gitignoreTemplate: ['node', 'vscode'],
  sshKey: '',
});

// 系统配置
const systemConfig = reactive({
  language: 'zh-CN',
  theme: 'light',
  autoUpdate: true,
  errorReporting: true,
  analytics: false,
  logLevel: 'info',
});

// 计算属性
const configPreview = computed(() => {
  const config = {
    editor: editorConfig,
    terminal: terminalConfig,
    package: packageConfig,
    git: gitConfig,
    system: systemConfig,
  };
  
  return JSON.stringify(config, null, 2);
});

// 方法
const browseEditorPath = () => {
  // 模拟文件浏览
  MessagePlugin.info('请选择编辑器可执行文件');
};

const browseTerminalPath = () => {
  // 模拟文件浏览
  MessagePlugin.info('请选择终端可执行文件');
};

const browseWorkingDir = () => {
  // 模拟文件夹浏览
  MessagePlugin.info('请选择工作目录');
};

const browseCacheDir = () => {
  // 模拟文件夹浏览
  MessagePlugin.info('请选择缓存目录');
};

const browseSshKey = () => {
  // 模拟文件浏览
  MessagePlugin.info('请选择 SSH 私钥文件');
};

const addTerminalEnvVar = () => {
  terminalConfig.envVars.push({ key: '', value: '' });
};

const removeTerminalEnvVar = (index: number) => {
  terminalConfig.envVars.splice(index, 1);
};

const clearCache = () => {
  MessagePlugin.success('应用缓存已清理');
};

const clearLogs = () => {
  MessagePlugin.success('应用日志已清理');
};

const saveConfig = () => {
  // 保存配置到本地存储或服务器
  const config = {
    editor: editorConfig,
    terminal: terminalConfig,
    package: packageConfig,
    git: gitConfig,
    system: systemConfig,
  };
  
  localStorage.setItem('ldesign-config', JSON.stringify(config));
  MessagePlugin.success('配置已保存');
};

const resetConfig = () => {
  // 重置所有配置为默认值
  Object.assign(editorConfig, {
    defaultEditor: 'vscode',
    editorPath: '',
    editorArgs: '',
    extensions: ['prettier', 'eslint', 'typescript'],
  });
  
  Object.assign(terminalConfig, {
    defaultTerminal: 'powershell',
    terminalPath: '',
    workingDirectory: 'project',
    customWorkingDir: '',
    envVars: [
      { key: 'NODE_ENV', value: 'development' },
    ],
  });
  
  Object.assign(packageConfig, {
    defaultManager: 'pnpm',
    registry: 'taobao',
    customRegistry: '',
    installOptions: ['save-exact'],
    cacheDir: '',
    cacheSize: 1024,
  });
  
  Object.assign(gitConfig, {
    userName: '',
    userEmail: '',
    defaultBranch: 'main',
    commitTemplate: 'feat: \n\nBreaking Changes:\n\nCloses #',
    gitignoreTemplate: ['node', 'vscode'],
    sshKey: '',
  });
  
  Object.assign(systemConfig, {
    language: 'zh-CN',
    theme: 'light',
    autoUpdate: true,
    errorReporting: true,
    analytics: false,
    logLevel: 'info',
  });
  
  MessagePlugin.success('配置已重置');
};

const exportConfig = () => {
  const config = {
    editor: editorConfig,
    terminal: terminalConfig,
    package: packageConfig,
    git: gitConfig,
    system: systemConfig,
  };
  
  const configJson = JSON.stringify(config, null, 2);
  const blob = new Blob([configJson], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ldesign-config.json';
  a.click();
  URL.revokeObjectURL(url);
  
  MessagePlugin.success('配置已导出');
};

const importConfig = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string);
        
        if (config.editor) Object.assign(editorConfig, config.editor);
        if (config.terminal) Object.assign(terminalConfig, config.terminal);
        if (config.package) Object.assign(packageConfig, config.package);
        if (config.git) Object.assign(gitConfig, config.git);
        if (config.system) Object.assign(systemConfig, config.system);
        
        MessagePlugin.success('配置已导入');
      } catch (error) {
        MessagePlugin.error('配置文件格式错误');
      }
    };
    reader.readAsText(file);
  };
  input.click();
};

// 初始化配置
const initConfig = () => {
  const savedConfig = localStorage.getItem('ldesign-config');
  if (savedConfig) {
    try {
      const config = JSON.parse(savedConfig);
      
      if (config.editor) Object.assign(editorConfig, config.editor);
      if (config.terminal) Object.assign(terminalConfig, config.terminal);
      if (config.package) Object.assign(packageConfig, config.package);
      if (config.git) Object.assign(gitConfig, config.git);
      if (config.system) Object.assign(systemConfig, config.system);
    } catch (error) {
      console.error('加载配置失败:', error);
    }
  }
};

// 初始化
initConfig();
</script>

<style scoped>
.tool-config {
  padding: 16px;
}

.extensions-config {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.env-vars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.env-var-item {
  display: flex;
  gap: 12px;
  align-items: center;
}

.env-key {
  flex: 1;
}

.env-value {
  flex: 2;
}

.form-help {
  margin-left: 8px;
  color: var(--td-text-color-secondary);
  font-size: 12px;
}

.config-actions {
  padding-top: 16px;
  border-top: 1px solid var(--td-border-level-1-color);
}
</style>