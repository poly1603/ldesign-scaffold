<template>
  <div class="dev-tools">
    <!-- 项目选择器 -->
    <t-card title="选择项目" class="project-selector">
      <t-select
        v-model="selectedProjectId"
        placeholder="请选择要操作的项目"
        filterable
        @change="handleProjectChange"
      >
        <t-option
          v-for="project in projects"
          :key="project.id"
          :value="project.id"
          :label="project.name"
        >
          <div class="project-option">
            <span>{{ project.name }}</span>
            <t-tag size="small" :theme="getStatusTheme(project.status)">
              {{ getStatusText(project.status) }}
            </t-tag>
          </div>
        </t-option>
      </t-select>
    </t-card>
    
    <!-- 开发服务控制 -->
    <t-card v-if="selectedProject" title="开发服务" class="dev-server">
      <div class="server-status">
        <div class="status-info">
          <div class="status-indicator">
            <div :class="['status-dot', selectedProject.status]" />
            <span class="status-text">{{ getStatusText(selectedProject.status) }}</span>
          </div>
          
          <div v-if="selectedProject.status === 'running'" class="server-info">
            <div class="info-item">
              <span class="info-label">服务地址:</span>
              <a :href="selectedProject.devUrl" target="_blank" class="dev-url">
                {{ selectedProject.devUrl }}
              </a>
              <t-button theme="default" variant="text" @click="copyUrl">
                <copy-icon size="16" />
              </t-button>
            </div>
            <div class="info-item">
              <span class="info-label">端口:</span>
              <span>{{ selectedProject.port }}</span>
            </div>
          </div>
        </div>
        
        <div class="server-actions">
          <t-button
            v-if="selectedProject.status === 'stopped'"
            theme="primary"
            size="large"
            @click="startServer"
            :loading="starting"
          >
            <template #icon>
              <play-circle-icon />
            </template>
            启动服务
          </t-button>
          
          <t-button
            v-if="selectedProject.status === 'running'"
            theme="warning"
            size="large"
            @click="stopServer"
            :loading="stopping"
          >
            <template #icon>
              <stop-circle-icon />
            </template>
            停止服务
          </t-button>
          
          <t-button
            v-if="selectedProject.status === 'running'"
            theme="default"
            size="large"
            @click="restartServer"
            :loading="restarting"
          >
            <template #icon>
              <refresh-icon />
            </template>
            重启服务
          </t-button>
        </div>
      </div>
    </t-card>
    
    <!-- 实时预览 -->
    <t-card v-if="selectedProject?.status === 'running'" title="实时预览" class="preview-panel">
      <div class="preview-toolbar">
        <t-select v-model="previewDevice" class="device-selector">
          <t-option value="desktop" label="桌面端 (1920x1080)" />
          <t-option value="tablet" label="平板 (768x1024)" />
          <t-option value="mobile" label="手机 (375x667)" />
        </t-select>
        
        <t-button theme="default" @click="refreshPreview">
          <template #icon>
            <refresh-icon />
          </template>
          刷新
        </t-button>
        
        <t-button theme="default" @click="openInNewTab">
          <template #icon>
            <link-icon />
          </template>
          新窗口打开
        </t-button>
      </div>
      
      <div class="preview-container">
        <iframe
          ref="previewFrame"
          :src="selectedProject.devUrl"
          :class="['preview-frame', previewDevice]"
          frameborder="0"
        />
      </div>
    </t-card>
    
    <!-- 日志输出 -->
    <t-card v-if="selectedProject" title="开发日志" class="log-panel">
      <div class="log-toolbar">
        <t-button theme="default" @click="clearLogs">
          <template #icon>
            <clear-icon />
          </template>
          清空日志
        </t-button>
        
        <t-switch v-model="autoScroll" size="small">
          <template #label>自动滚动</template>
        </t-switch>
      </div>
      
      <div ref="logContainer" class="log-container">
        <div
          v-for="(log, index) in logs"
          :key="index"
          :class="['log-entry', log.level]"
        >
          <span class="log-time">{{ formatTime(log.timestamp) }}</span>
          <span class="log-level">{{ log.level.toUpperCase() }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
        
        <div v-if="logs.length === 0" class="log-empty">
          暂无日志信息
        </div>
      </div>
    </t-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import {
  PlayCircleIcon,
  StopCircleIcon,
  RefreshIcon,
  CopyIcon,
  LinkIcon,
  ClearIcon,
} from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { getProjectsApi, startProjectApi, stopProjectApi } from '../api/project';
import type { Project, LogEntry } from '../types/project';

// 响应式数据
const projects = ref<Project[]>([]);
const selectedProjectId = ref('');
const starting = ref(false);
const stopping = ref(false);
const restarting = ref(false);
const previewDevice = ref('desktop');
const autoScroll = ref(true);
const logs = ref<LogEntry[]>([]);
const previewFrame = ref<HTMLIFrameElement>();
const logContainer = ref<HTMLDivElement>();

// 计算属性
const selectedProject = computed(() => {
  return projects.value.find(p => p.id === selectedProjectId.value);
});

// 方法
const getStatusTheme = (status: string) => {
  const themeMap: Record<string, string> = {
    running: 'success',
    stopped: 'default',
    building: 'warning',
    error: 'danger',
  };
  return themeMap[status] || 'default';
};

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    running: '运行中',
    stopped: '已停止',
    building: '构建中',
    error: '错误',
  };
  return textMap[status] || '未知';
};

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString();
};

const handleProjectChange = (projectId: string) => {
  logs.value = [];
  // 这里可以加载项目的历史日志
  loadProjectLogs(projectId);
};

const startServer = async () => {
  if (!selectedProject.value) return;
  
  starting.value = true;
  try {
    const result = await startProjectApi(selectedProject.value.id);
    selectedProject.value.status = 'running';
    selectedProject.value.port = result.port;
    selectedProject.value.devUrl = result.url;
    
    addLog('info', `开发服务已启动，地址: ${result.url}`);
    MessagePlugin.success('开发服务启动成功');
  } catch (error) {
    console.error('启动服务失败:', error);
    addLog('error', '启动开发服务失败');
    MessagePlugin.error('启动服务失败');
  } finally {
    starting.value = false;
  }
};

const stopServer = async () => {
  if (!selectedProject.value) return;
  
  stopping.value = true;
  try {
    await stopProjectApi(selectedProject.value.id);
    selectedProject.value.status = 'stopped';
    selectedProject.value.devUrl = undefined;
    
    addLog('info', '开发服务已停止');
    MessagePlugin.success('开发服务已停止');
  } catch (error) {
    console.error('停止服务失败:', error);
    addLog('error', '停止开发服务失败');
    MessagePlugin.error('停止服务失败');
  } finally {
    stopping.value = false;
  }
};

const restartServer = async () => {
  if (!selectedProject.value) return;
  
  restarting.value = true;
  try {
    await stopServer();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await startServer();
    
    addLog('info', '开发服务已重启');
    MessagePlugin.success('开发服务重启成功');
  } catch (error) {
    console.error('重启服务失败:', error);
    addLog('error', '重启开发服务失败');
    MessagePlugin.error('重启服务失败');
  } finally {
    restarting.value = false;
  }
};

const copyUrl = () => {
  if (selectedProject.value?.devUrl) {
    navigator.clipboard.writeText(selectedProject.value.devUrl);
    MessagePlugin.success('服务地址已复制到剪贴板');
  }
};

const refreshPreview = () => {
  if (previewFrame.value) {
    previewFrame.value.src = previewFrame.value.src;
  }
};

const openInNewTab = () => {
  if (selectedProject.value?.devUrl) {
    window.open(selectedProject.value.devUrl, '_blank');
  }
};

const clearLogs = () => {
  logs.value = [];
};

const addLog = (level: 'info' | 'warn' | 'error' | 'debug', message: string) => {
  const log: LogEntry = {
    id: Date.now().toString(),
    projectId: selectedProject.value?.id || '',
    level,
    message,
    timestamp: new Date().toISOString(),
  };
  
  logs.value.push(log);
  
  // 自动滚动到底部
  if (autoScroll.value) {
    nextTick(() => {
      if (logContainer.value) {
        logContainer.value.scrollTop = logContainer.value.scrollHeight;
      }
    });
  }
};

const loadProjects = async () => {
  try {
    const data = await getProjectsApi();
    projects.value = data;
    
    // 自动选择第一个项目
    if (data.length > 0 && !selectedProjectId.value) {
      selectedProjectId.value = data[0].id;
    }
  } catch (error) {
    console.error('获取项目列表失败:', error);
    MessagePlugin.error('获取项目列表失败');
  }
};

const loadProjectLogs = (projectId: string) => {
  // 这里应该从后端加载项目的历史日志
  // 暂时添加一些示例日志
  addLog('info', '项目已选择，准备加载日志...');
};

// 监听器
watch(selectedProjectId, (newId) => {
  if (newId) {
    handleProjectChange(newId);
  }
});

// 生命周期
onMounted(() => {
  loadProjects();
});
</script>

<style scoped>
.dev-tools {
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
}

.project-selector {
  flex-shrink: 0;
}

.project-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.dev-server {
  flex-shrink: 0;
}

.server-status {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.status-info {
  flex: 1;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--td-gray-color-6);
}

.status-dot.running {
  background: var(--td-success-color);
  animation: pulse 2s infinite;
}

.status-dot.stopped {
  background: var(--td-gray-color-6);
}

.status-dot.error {
  background: var(--td-error-color);
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 168, 112, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(0, 168, 112, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 168, 112, 0);
  }
}

.status-text {
  font-weight: 500;
}

.server-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.info-item .info-label {
  color: var(--td-text-color-secondary);
  min-width: 60px;
}

.dev-url {
  color: var(--td-brand-color);
  text-decoration: none;
}

.dev-url:hover {
  text-decoration: underline;
}

.server-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.preview-panel {
  flex: 1;
  min-height: 500px;
  display: flex;
  flex-direction: column;
}

.preview-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--td-border-level-1-color);
}

.device-selector {
  width: 200px;
}

.preview-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: var(--td-bg-color-page);
  border-radius: 8px;
  padding: 20px;
}

.preview-frame {
  border: 1px solid var(--td-border-level-1-color);
  border-radius: 8px;
  background: white;
  transition: all 0.3s;
}

.preview-frame.desktop {
  width: 100%;
  height: 600px;
}

.preview-frame.tablet {
  width: 768px;
  height: 1024px;
  max-width: 100%;
  max-height: 600px;
}

.preview-frame.mobile {
  width: 375px;
  height: 667px;
  max-width: 100%;
  max-height: 600px;
}

.log-panel {
  flex-shrink: 0;
  height: 300px;
  display: flex;
  flex-direction: column;
}

.log-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
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