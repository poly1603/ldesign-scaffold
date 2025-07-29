<template>
  <div class="build-tools">
    <!-- 项目选择器 -->
    <t-card title="选择项目" class="project-selector">
      <t-select
        v-model="selectedProjectId"
        placeholder="请选择要构建的项目"
        filterable
        @change="handleProjectChange"
      >
        <t-option
          v-for="project in projects"
          :key="project.id"
          :value="project.id"
          :label="project.name"
        />
      </t-select>
    </t-card>
    
    <!-- 构建配置 -->
    <t-card v-if="selectedProject" title="构建配置" class="build-config">
      <t-tabs v-model:value="activeTab" placement="top">
        <t-tab-panel value="development" label="开发环境">
          <build-config-form
            v-model="configs.development"
            mode="development"
          />
        </t-tab-panel>
        
        <t-tab-panel value="production" label="生产环境">
          <build-config-form
            v-model="configs.production"
            mode="production"
          />
        </t-tab-panel>
        
        <t-tab-panel value="test" label="测试环境">
          <build-config-form
            v-model="configs.test"
            mode="test"
          />
        </t-tab-panel>
      </t-tabs>
      
      <div class="config-actions">
        <t-button theme="default" @click="saveConfig">
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
      </div>
    </t-card>
    
    <!-- 构建执行 -->
    <t-card v-if="selectedProject" title="构建执行" class="build-execution">
      <div class="build-controls">
        <div class="build-options">
          <t-select v-model="buildMode" placeholder="选择构建模式">
            <t-option value="development" label="开发环境" />
            <t-option value="production" label="生产环境" />
            <t-option value="test" label="测试环境" />
          </t-select>
          
          <t-checkbox v-model="buildOptions.sourcemap">生成 Sourcemap</t-checkbox>
          <t-checkbox v-model="buildOptions.minify">代码压缩</t-checkbox>
          <t-checkbox v-model="buildOptions.analyze">包分析</t-checkbox>
        </div>
        
        <div class="build-actions">
          <t-button
            theme="primary"
            size="large"
            @click="startBuild"
            :loading="building"
            :disabled="!buildMode"
          >
            <template #icon>
              <play-circle-icon />
            </template>
            开始构建
          </t-button>
          
          <t-button
            v-if="building"
            theme="warning"
            size="large"
            @click="stopBuild"
          >
            <template #icon>
              <stop-circle-icon />
            </template>
            停止构建
          </t-button>
        </div>
      </div>
      
      <!-- 构建进度 -->
      <div v-if="buildStatus" class="build-progress">
        <div class="progress-header">
          <h4>构建进度</h4>
          <t-tag :theme="getBuildStatusTheme(buildStatus.status)">
            {{ getBuildStatusText(buildStatus.status) }}
          </t-tag>
        </div>
        
        <t-progress
          :percentage="buildStatus.progress"
          :status="buildStatus.status === 'failed' ? 'error' : 'active'"
        />
        
        <div class="progress-info">
          <span>{{ buildStatus.message }}</span>
          <span class="progress-time">{{ formatDuration(buildStatus.duration) }}</span>
        </div>
      </div>
    </t-card>
    
    <!-- 构建产物分析 -->
    <t-card v-if="buildResult" title="构建产物分析" class="build-analysis">
      <div class="analysis-summary">
        <div class="summary-item">
          <label>构建时间:</label>
          <span>{{ formatDuration(buildResult.duration) }}</span>
        </div>
        <div class="summary-item">
          <label>输出目录:</label>
          <span>{{ buildResult.outDir }}</span>
        </div>
        <div class="summary-item">
          <label>总文件数:</label>
          <span>{{ buildResult.files.length }}</span>
        </div>
        <div class="summary-item">
          <label>总大小:</label>
          <span>{{ formatFileSize(buildResult.totalSize) }}</span>
        </div>
      </div>
      
      <t-tabs v-model:value="analysisTab">
        <t-tab-panel value="files" label="文件列表">
          <t-table
            :data="buildResult.files"
            :columns="fileColumns"
            row-key="path"
            size="small"
          />
        </t-tab-panel>
        
        <t-tab-panel value="chunks" label="代码分块">
          <div class="chunks-chart">
            <!-- 这里可以集成图表库显示代码分块信息 -->
            <div class="chart-placeholder">
              代码分块可视化图表（待实现）
            </div>
          </div>
        </t-tab-panel>
        
        <t-tab-panel value="dependencies" label="依赖分析">
          <div class="dependencies-chart">
            <!-- 这里可以集成图表库显示依赖关系 -->
            <div class="chart-placeholder">
              依赖关系可视化图表（待实现）
            </div>
          </div>
        </t-tab-panel>
      </t-tabs>
      
      <div class="analysis-actions">
        <t-button theme="default" @click="openBuildDir">
          <template #icon>
            <folder-open-icon />
          </template>
          打开构建目录
        </t-button>
        
        <t-button theme="default" @click="previewBuild">
          <template #icon>
            <browse-icon />
          </template>
          预览构建结果
        </t-button>
      </div>
    </t-card>
    
    <!-- 构建日志 -->
    <t-card title="构建日志" class="build-logs">
      <div class="log-toolbar">
        <t-button theme="default" @click="clearLogs">
          <template #icon>
            <clear-icon />
          </template>
          清空日志
        </t-button>
        
        <t-button theme="default" @click="downloadLogs">
          <template #icon>
            <download-icon />
          </template>
          下载日志
        </t-button>
      </div>
      
      <div ref="logContainer" class="log-container">
        <div
          v-for="(log, index) in buildLogs"
          :key="index"
          :class="['log-entry', log.level]"
        >
          <span class="log-time">{{ formatTime(log.timestamp) }}</span>
          <span class="log-level">{{ log.level.toUpperCase() }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
        
        <div v-if="buildLogs.length === 0" class="log-empty">
          暂无构建日志
        </div>
      </div>
    </t-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import {
  SaveIcon,
  RefreshIcon,
  PlayCircleIcon,
  StopCircleIcon,
  FolderOpenIcon,
  BrowseIcon,
  ClearIcon,
  DownloadIcon,
} from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { getProjectsApi, buildProjectApi } from '../api/project';
import type { Project, BuildConfig, LogEntry } from '../types/project';
import BuildConfigForm from '../components/BuildConfigForm.vue';

// 响应式数据
const projects = ref<Project[]>([]);
const selectedProjectId = ref('');
const activeTab = ref('production');
const buildMode = ref('production');
const building = ref(false);
const analysisTab = ref('files');
const buildLogs = ref<LogEntry[]>([]);
const logContainer = ref<HTMLDivElement>();

// 构建配置
const configs = reactive({
  development: {
    mode: 'development',
    sourcemap: true,
    minify: false,
    outDir: 'dist-dev',
  } as BuildConfig,
  production: {
    mode: 'production',
    sourcemap: false,
    minify: true,
    outDir: 'dist',
  } as BuildConfig,
  test: {
    mode: 'test',
    sourcemap: true,
    minify: false,
    outDir: 'dist-test',
  } as BuildConfig,
});

// 构建选项
const buildOptions = reactive({
  sourcemap: false,
  minify: true,
  analyze: false,
});

// 构建状态
const buildStatus = ref<{
  status: 'running' | 'completed' | 'failed';
  progress: number;
  message: string;
  duration: number;
} | null>(null);

// 构建结果
const buildResult = ref<{
  duration: number;
  outDir: string;
  totalSize: number;
  files: Array<{
    path: string;
    size: number;
    gzipSize: number;
    type: string;
  }>;
} | null>(null);

// 计算属性
const selectedProject = computed(() => {
  return projects.value.find(p => p.id === selectedProjectId.value);
});

// 表格列配置
const fileColumns = [
  {
    colKey: 'path',
    title: '文件路径',
    width: '40%',
  },
  {
    colKey: 'type',
    title: '类型',
    width: '15%',
  },
  {
    colKey: 'size',
    title: '原始大小',
    width: '15%',
    cell: (h: any, { row }: any) => formatFileSize(row.size),
  },
  {
    colKey: 'gzipSize',
    title: 'Gzip 大小',
    width: '15%',
    cell: (h: any, { row }: any) => formatFileSize(row.gzipSize),
  },
  {
    colKey: 'ratio',
    title: '压缩比',
    width: '15%',
    cell: (h: any, { row }: any) => {
      const ratio = ((row.size - row.gzipSize) / row.size * 100).toFixed(1);
      return `${ratio}%`;
    },
  },
];

// 方法
const handleProjectChange = (projectId: string) => {
  buildLogs.value = [];
  buildStatus.value = null;
  buildResult.value = null;
};

const saveConfig = () => {
  MessagePlugin.success('构建配置已保存');
};

const resetConfig = () => {
  // 重置为默认配置
  MessagePlugin.success('构建配置已重置');
};

const startBuild = async () => {
  if (!selectedProject.value) return;
  
  building.value = true;
  buildStatus.value = {
    status: 'running',
    progress: 0,
    message: '正在初始化构建...',
    duration: 0,
  };
  
  const startTime = Date.now();
  
  try {
    // 模拟构建过程
    const steps = [
      { message: '正在清理输出目录...', progress: 10 },
      { message: '正在编译源代码...', progress: 30 },
      { message: '正在处理资源文件...', progress: 50 },
      { message: '正在优化代码...', progress: 70 },
      { message: '正在生成文件...', progress: 90 },
      { message: '构建完成!', progress: 100 },
    ];
    
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      buildStatus.value!.progress = step.progress;
      buildStatus.value!.message = step.message;
      buildStatus.value!.duration = Date.now() - startTime;
      
      addBuildLog('info', step.message);
    }
    
    // 调用实际的构建 API
    await buildProjectApi(selectedProject.value.id, {
      mode: buildMode.value,
      ...buildOptions,
    });
    
    buildStatus.value.status = 'completed';
    
    // 模拟构建结果
    buildResult.value = {
      duration: Date.now() - startTime,
      outDir: configs[buildMode.value as keyof typeof configs].outDir,
      totalSize: 1024 * 1024 * 2.5, // 2.5MB
      files: [
        {
          path: 'index.html',
          size: 1024 * 2,
          gzipSize: 1024 * 0.8,
          type: 'html',
        },
        {
          path: 'assets/index.js',
          size: 1024 * 1024 * 1.5,
          gzipSize: 1024 * 1024 * 0.5,
          type: 'js',
        },
        {
          path: 'assets/index.css',
          size: 1024 * 256,
          gzipSize: 1024 * 64,
          type: 'css',
        },
      ],
    };
    
    MessagePlugin.success('构建完成!');
    
  } catch (error) {
    console.error('构建失败:', error);
    buildStatus.value!.status = 'failed';
    addBuildLog('error', '构建失败');
    MessagePlugin.error('构建失败');
  } finally {
    building.value = false;
  }
};

const stopBuild = () => {
  building.value = false;
  if (buildStatus.value) {
    buildStatus.value.status = 'failed';
    buildStatus.value.message = '构建已取消';
  }
  addBuildLog('warn', '构建已被用户取消');
  MessagePlugin.warning('构建已停止');
};

const getBuildStatusTheme = (status: string) => {
  const themeMap: Record<string, string> = {
    running: 'warning',
    completed: 'success',
    failed: 'danger',
  };
  return themeMap[status] || 'default';
};

const getBuildStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    running: '构建中',
    completed: '已完成',
    failed: '失败',
  };
  return textMap[status] || '未知';
};

const formatDuration = (ms: number) => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}分${remainingSeconds}秒`;
  }
  return `${remainingSeconds}秒`;
};

const formatFileSize = (bytes: number) => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString();
};

const openBuildDir = () => {
  MessagePlugin.info('正在打开构建目录...');
};

const previewBuild = () => {
  MessagePlugin.info('正在预览构建结果...');
};

const clearLogs = () => {
  buildLogs.value = [];
};

const downloadLogs = () => {
  const logContent = buildLogs.value
    .map(log => `[${formatTime(log.timestamp)}] ${log.level.toUpperCase()}: ${log.message}`)
    .join('\n');
  
  const blob = new Blob([logContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `build-logs-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};

const addBuildLog = (level: 'info' | 'warn' | 'error' | 'debug', message: string) => {
  const log: LogEntry = {
    id: Date.now().toString(),
    projectId: selectedProject.value?.id || '',
    level,
    message,
    timestamp: new Date().toISOString(),
  };
  
  buildLogs.value.push(log);
  
  // 自动滚动到底部
  setTimeout(() => {
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight;
    }
  }, 100);
};

const loadProjects = async () => {
  try {
    const data = await getProjectsApi();
    projects.value = data;
    
    if (data.length > 0 && !selectedProjectId.value) {
      selectedProjectId.value = data[0].id;
    }
  } catch (error) {
    console.error('获取项目列表失败:', error);
    MessagePlugin.error('获取项目列表失败');
  }
};

// 生命周期
onMounted(() => {
  loadProjects();
});
</script>

<style scoped>
.build-tools {
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
}

.project-selector {
  flex-shrink: 0;
}

.build-config {
  flex-shrink: 0;
}

.config-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--td-border-level-1-color);
}

.build-execution {
  flex-shrink: 0;
}

.build-controls {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 24px;
}

.build-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.build-actions {
  display: flex;
  gap: 12px;
}

.build-progress {
  padding: 20px;
  background: var(--td-bg-color-component);
  border-radius: 8px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.progress-header h4 {
  margin: 0;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  font-size: 14px;
  color: var(--td-text-color-secondary);
}

.progress-time {
  font-weight: 500;
}

.build-analysis {
  flex-shrink: 0;
}

.analysis-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--td-bg-color-component);
  border-radius: 8px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-item label {
  font-size: 12px;
  color: var(--td-text-color-secondary);
}

.summary-item span {
  font-size: 16px;
  font-weight: 600;
}

.chunks-chart,
.dependencies-chart {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  color: var(--td-text-color-placeholder);
  font-size: 14px;
}

.analysis-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--td-border-level-1-color);
}

.build-logs {
  flex: 1;
  min-height: 300px;
  display: flex;
  flex-direction: column;
}

.log-toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--td-border-level-1-color);
}

.log-container {
  flex: 1;
  overflow-y: auto;
  background: var(--td-bg-color-code);
  border-radius: 4px;
  padding: 12px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.5;
}

.log-entry {
  display: flex;
  gap: 12px;
  margin-bottom: 4px;
  padding: 2px 0;
}

.log-time {
  color: var(--td-text-color-placeholder);
  min-width: 80px;
}

.log-level {
  min-width: 50px;
  font-weight: 600;
}

.log-level.info {
  color: var(--td-brand-color);
}

.log-level.warn {
  color: var(--td-warning-color);
}

.log-level.error {
  color: var(--td-error-color);
}

.log-level.debug {
  color: var(--td-text-color-secondary);
}

.log-message {
  flex: 1;
  word-break: break-all;
}

.log-empty {
  text-align: center;
  color: var(--td-text-color-placeholder);
  padding: 40px 0;
}
</style>