<template>
  <div class="project-manage">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <t-input
          v-model="searchKeyword"
          placeholder="搜索项目..."
          clearable
          class="search-input"
        >
          <template #prefix-icon>
            <search-icon />
          </template>
        </t-input>
        
        <t-select
          v-model="filterStatus"
          placeholder="状态筛选"
          clearable
          class="filter-select"
        >
          <t-option value="running" label="运行中" />
          <t-option value="stopped" label="已停止" />
          <t-option value="building" label="构建中" />
          <t-option value="error" label="错误" />
        </t-select>
      </div>
      
      <div class="toolbar-right">
        <t-button theme="primary" @click="$router.push('/create')">
          <template #icon>
            <add-icon />
          </template>
          新建项目
        </t-button>
        
        <t-button theme="default" @click="refreshProjects">
          <template #icon>
            <refresh-icon />
          </template>
          刷新
        </t-button>
      </div>
    </div>
    
    <!-- 项目列表 -->
    <div class="project-list">
      <t-loading :loading="loading" size="large">
        <div v-if="filteredProjects.length === 0" class="empty-state">
          <t-empty description="暂无项目">
            <template #image>
              <folder-icon size="64" />
            </template>
            <t-button theme="primary" @click="$router.push('/create')">
              创建第一个项目
            </t-button>
          </t-empty>
        </div>
        
        <div v-else class="project-grid">
          <t-card
            v-for="project in filteredProjects"
            :key="project.id"
            class="project-card"
            :bordered="true"
            hover
          >
            <template #header>
              <div class="project-header">
                <div class="project-info">
                  <h4>{{ project.name }}</h4>
                  <t-tag
                    :theme="getStatusTheme(project.status)"
                    size="small"
                  >
                    {{ getStatusText(project.status) }}
                  </t-tag>
                </div>
                
                <t-dropdown
                  :options="getProjectActions(project)"
                  @click="handleProjectAction"
                >
                  <t-button theme="default" variant="text" shape="square">
                    <more-icon />
                  </t-button>
                </t-dropdown>
              </div>
            </template>
            
            <div class="project-content">
              <p class="project-description">{{ project.description || '暂无描述' }}</p>
              
              <div class="project-meta">
                <div class="meta-item">
                  <label-icon size="14" />
                  <span>{{ project.template }}</span>
                </div>
                <div class="meta-item">
                  <folder-icon size="14" />
                  <span>{{ project.path }}</span>
                </div>
                <div class="meta-item">
                  <time-icon size="14" />
                  <span>{{ formatTime(project.updatedAt) }}</span>
                </div>
              </div>
              
              <!-- 项目状态详情 -->
              <div v-if="project.status === 'running'" class="status-detail">
                <div class="status-item">
                  <span>开发服务:</span>
                  <a :href="project.devUrl" target="_blank" class="dev-link">
                    {{ project.devUrl }}
                  </a>
                </div>
              </div>
              
              <div v-if="project.status === 'building'" class="status-detail">
                <t-progress :percentage="project.buildProgress" size="small" />
                <span class="build-text">{{ project.buildText }}</span>
              </div>
            </div>
            
            <template #actions>
              <div class="project-actions">
                <t-button
                  v-if="project.status === 'stopped'"
                  theme="primary"
                  size="small"
                  @click="startProject(project)"
                >
                  <template #icon>
                    <play-circle-icon />
                  </template>
                  启动
                </t-button>
                
                <t-button
                  v-if="project.status === 'running'"
                  theme="warning"
                  size="small"
                  @click="stopProject(project)"
                >
                  <template #icon>
                    <stop-circle-icon />
                  </template>
                  停止
                </t-button>
                
                <t-button
                  theme="default"
                  size="small"
                  @click="openProject(project)"
                >
                  <template #icon>
                    <folder-open-icon />
                  </template>
                  打开
                </t-button>
                
                <t-button
                  theme="default"
                  size="small"
                  @click="buildProject(project)"
                  :disabled="project.status === 'building'"
                >
                  <template #icon>
                    <setting-icon />
                  </template>
                  构建
                </t-button>

                <t-button
                  theme="default"
                  size="small"
                  @click="previewProject(project)"
                  :disabled="!project.buildPath || project.status === 'previewing'"
                >
                  <template #icon>
                    <browse-icon />
                  </template>
                  预览
                </t-button>

                <t-button
                  theme="default"
                  size="small"
                  @click="testProject(project)"
                  :disabled="project.status === 'testing'"
                >
                  <template #icon>
                    <play-circle-filled-icon />
                  </template>
                  测试
                </t-button>
              </div>
            </template>
          </t-card>
        </div>
      </t-loading>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  SearchIcon,
  AddIcon,
  RefreshIcon,
  FolderIcon,
  MoreIcon,
  TagIcon,
  TimeIcon,
  PlayCircleIcon,
  StopCircleIcon,
  FolderOpenIcon,
  SettingIcon,
  BrowseIcon,
  PlayCircleFilledIcon,
} from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { getProjectsApi, startProjectApi, stopProjectApi, buildProjectApi, previewProjectApi, testProjectApi } from '../api/project';
import type { Project } from '../types/project';

// 响应式数据
const loading = ref(false);
const searchKeyword = ref('');
const filterStatus = ref('');
const projects = ref<Project[]>([]);

// 计算属性
const filteredProjects = computed(() => {
  let result = projects.value;
  
  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(project => 
      project.name.toLowerCase().includes(keyword) ||
      project.description?.toLowerCase().includes(keyword)
    );
  }
  
  // 状态过滤
  if (filterStatus.value) {
    result = result.filter(project => project.status === filterStatus.value);
  }
  
  return result;
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

const formatTime = (time: string) => {
  return new Date(time).toLocaleString('zh-CN');
};

const getProjectActions = (project: Project) => {
  return [
    {
      content: '在编辑器中打开',
      value: 'open-editor',
      data: project,
    },
    {
      content: '在文件管理器中显示',
      value: 'show-in-explorer',
      data: project,
    },
    {
      content: '复制项目路径',
      value: 'copy-path',
      data: project,
    },
    {
      content: '项目设置',
      value: 'settings',
      data: project,
    },
    {
      content: '删除项目',
      value: 'delete',
      data: project,
      theme: 'error',
    },
  ];
};

const handleProjectAction = ({ value, data }: { value: string; data: Project }) => {
  switch (value) {
    case 'open-editor':
      openInEditor(data);
      break;
    case 'show-in-explorer':
      showInExplorer(data);
      break;
    case 'copy-path':
      copyPath(data);
      break;
    case 'settings':
      openSettings(data);
      break;
    case 'delete':
      deleteProject(data);
      break;
  }
};

const refreshProjects = async () => {
  loading.value = true;
  try {
    const data = await getProjectsApi();
    projects.value = data;
  } catch (error) {
    console.error('获取项目列表失败:', error);
    MessagePlugin.error('获取项目列表失败');
  } finally {
    loading.value = false;
  }
};

const startProject = async (project: Project) => {
  try {
    await startProjectApi(project.id);
    project.status = 'running';
    project.devUrl = `http://localhost:${project.port || 3000}`;
    MessagePlugin.success(`项目 ${project.name} 启动成功`);
  } catch (error) {
    console.error('启动项目失败:', error);
    MessagePlugin.error('启动项目失败');
  }
};

const stopProject = async (project: Project) => {
  try {
    await stopProjectApi(project.id);
    project.status = 'stopped';
    project.devUrl = undefined;
    MessagePlugin.success(`项目 ${project.name} 已停止`);
  } catch (error) {
    console.error('停止项目失败:', error);
    MessagePlugin.error('停止项目失败');
  }
};

const buildProject = async (project: Project) => {
  try {
    project.status = 'building';
    project.buildProgress = 0;
    project.buildText = '正在构建...';
    
    await buildProjectApi(project.id);
    
    project.status = 'stopped';
    project.buildProgress = 100;
    project.buildText = '构建完成';
    
    MessagePlugin.success(`项目 ${project.name} 构建成功`);
  } catch (error) {
    console.error('构建项目失败:', error);
    project.status = 'error';
    MessagePlugin.error('构建项目失败');
  }
};

const previewProject = async (project: Project) => {
  try {
    await previewProjectApi(project.id);
    project.status = 'previewing';
    project.previewUrl = `http://localhost:${project.previewPort || 3001}`;
    MessagePlugin.success(`项目 ${project.name} 预览启动成功`);
  } catch (error) {
    console.error('启动预览失败:', error);
    MessagePlugin.error('启动预览失败');
  }
};

const testProject = async (project: Project) => {
  try {
    project.status = 'testing';
    await testProjectApi(project.id);
    project.status = 'stopped';
    MessagePlugin.success(`项目 ${project.name} 测试完成`);
  } catch (error) {
    console.error('运行测试失败:', error);
    project.status = 'error';
    MessagePlugin.error('运行测试失败');
  }
};

const openProject = (project: Project) => {
  // 在文件管理器中打开项目目录
  showInExplorer(project);
};

const openInEditor = (project: Project) => {
  // 在编辑器中打开项目
  MessagePlugin.info('正在打开编辑器...');
};

const showInExplorer = (project: Project) => {
  // 在文件管理器中显示项目
  MessagePlugin.info('正在打开文件管理器...');
};

const copyPath = (project: Project) => {
  navigator.clipboard.writeText(project.path);
  MessagePlugin.success('项目路径已复制到剪贴板');
};

const openSettings = (project: Project) => {
  MessagePlugin.info('项目设置功能开发中...');
};

const deleteProject = (project: Project) => {
  MessagePlugin.warning('删除项目功能开发中...');
};

// 生命周期
onMounted(() => {
  refreshProjects();
});
</script>

<style scoped>
.project-manage {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: var(--td-bg-color-container);
  border-radius: 8px;
}

.toolbar-left {
  display: flex;
  gap: 12px;
  align-items: center;
}

.toolbar-right {
  display: flex;
  gap: 12px;
}

.search-input {
  width: 300px;
}

.filter-select {
  width: 120px;
}

.project-list {
  flex: 1;
  overflow-y: auto;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
}

.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.project-card {
  transition: all 0.2s;
}

.project-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.project-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
}

.project-content {
  padding: 16px 0;
}

.project-description {
  margin: 0 0 16px 0;
  color: var(--td-text-color-secondary);
  font-size: 14px;
  line-height: 1.5;
}

.project-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--td-text-color-placeholder);
}

.status-detail {
  padding: 12px;
  background: var(--td-bg-color-component);
  border-radius: 4px;
  margin-top: 12px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.dev-link {
  color: var(--td-brand-color);
  text-decoration: none;
}

.dev-link:hover {
  text-decoration: underline;
}

.build-text {
  font-size: 12px;
  color: var(--td-text-color-secondary);
  margin-top: 8px;
  display: block;
}

.project-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
</style>