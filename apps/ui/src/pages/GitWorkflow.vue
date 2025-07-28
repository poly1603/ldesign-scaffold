<template>
  <div class="git-workflow">
    <t-card title="Git 工作流" class="mb-4">
      <template #actions>
        <t-button theme="primary" @click="refreshGitStatus">
          <template #icon>
            <refresh-icon />
          </template>
          刷新状态
        </t-button>
      </template>
      
      <!-- 项目选择 -->
      <div class="project-selector mb-4">
        <t-select
          v-model="selectedProject"
          placeholder="选择项目"
          class="w-64"
          @change="onProjectChange"
        >
          <t-option
            v-for="project in projects"
            :key="project.id"
            :value="project.id"
            :label="project.name"
          />
        </t-select>
      </div>
      
      <!-- Git 状态 -->
      <div v-if="selectedProject" class="git-status mb-6">
        <t-row :gutter="16">
          <t-col :span="8">
            <t-card title="仓库信息" size="small">
              <div class="repo-info">
                <div class="info-item">
                  <span class="label">当前分支:</span>
                  <t-tag theme="primary">{{ gitStatus.currentBranch }}</t-tag>
                </div>
                <div class="info-item">
                  <span class="label">远程地址:</span>
                  <span class="value">{{ gitStatus.remoteUrl || '未设置' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">最后提交:</span>
                  <span class="value">{{ gitStatus.lastCommit || '无提交' }}</span>
                </div>
              </div>
            </t-card>
          </t-col>
          
          <t-col :span="8">
            <t-card title="工作区状态" size="small">
              <div class="status-info">
                <div class="status-item">
                  <span class="label">修改文件:</span>
                  <t-tag theme="warning">{{ gitStatus.modifiedFiles?.length || 0 }}</t-tag>
                </div>
                <div class="status-item">
                  <span class="label">新增文件:</span>
                  <t-tag theme="success">{{ gitStatus.addedFiles?.length || 0 }}</t-tag>
                </div>
                <div class="status-item">
                  <span class="label">删除文件:</span>
                  <t-tag theme="danger">{{ gitStatus.deletedFiles?.length || 0 }}</t-tag>
                </div>
              </div>
            </t-card>
          </t-col>
          
          <t-col :span="8">
            <t-card title="同步状态" size="small">
              <div class="sync-info">
                <div class="sync-item">
                  <span class="label">领先提交:</span>
                  <t-tag theme="primary">{{ gitStatus.ahead || 0 }}</t-tag>
                </div>
                <div class="sync-item">
                  <span class="label">落后提交:</span>
                  <t-tag theme="warning">{{ gitStatus.behind || 0 }}</t-tag>
                </div>
                <div class="sync-item">
                  <span class="label">工作区状态:</span>
                  <t-tag :theme="gitStatus.isClean ? 'success' : 'warning'">
                    {{ gitStatus.isClean ? '干净' : '有变更' }}
                  </t-tag>
                </div>
              </div>
            </t-card>
          </t-col>
        </t-row>
      </div>
      
      <!-- 操作区域 -->
      <div v-if="selectedProject" class="git-operations">
        <t-tabs v-model="activeTab">
          <!-- 提交变更 -->
          <t-tab-panel value="commit" label="提交变更">
            <div class="commit-panel">
              <div class="file-changes mb-4">
                <t-table
                  :data="fileChanges"
                  :columns="fileColumns"
                  row-key="path"
                  :selected-row-keys="selectedFiles"
                  @select-change="onFileSelect"
                >
                  <template #status="{ row }">
                    <t-tag
                      :theme="getStatusTheme(row.status)"
                      size="small"
                    >
                      {{ getStatusText(row.status) }}
                    </t-tag>
                  </template>
                </t-table>
              </div>
              
              <div class="commit-form">
                <t-form :data="commitForm" layout="vertical">
                  <t-form-item label="提交信息" name="message">
                    <t-textarea
                      v-model="commitForm.message"
                      placeholder="输入提交信息"
                      :rows="3"
                    />
                  </t-form-item>
                  
                  <t-form-item>
                    <t-space>
                      <t-button
                        theme="primary"
                        :loading="committing"
                        :disabled="!commitForm.message || selectedFiles.length === 0"
                        @click="commitChanges"
                      >
                        提交变更
                      </t-button>
                      
                      <t-button
                        theme="default"
                        @click="stageAll"
                      >
                        暂存所有
                      </t-button>
                      
                      <t-button
                        theme="default"
                        @click="unstageAll"
                      >
                        取消暂存
                      </t-button>
                    </t-space>
                  </t-form-item>
                </t-form>
              </div>
            </div>
          </t-tab-panel>
          
          <!-- 分支管理 -->
          <t-tab-panel value="branch" label="分支管理">
            <div class="branch-panel">
              <div class="branch-actions mb-4">
                <t-space>
                  <t-input
                    v-model="newBranchName"
                    placeholder="新分支名称"
                    class="w-48"
                  />
                  <t-button
                    theme="primary"
                    :disabled="!newBranchName"
                    @click="createBranch"
                  >
                    创建分支
                  </t-button>
                </t-space>
              </div>
              
              <t-table
                :data="branches"
                :columns="branchColumns"
                row-key="name"
              >
                <template #current="{ row }">
                  <t-tag v-if="row.current" theme="success" size="small">
                    当前
                  </t-tag>
                </template>
                
                <template #actions="{ row }">
                  <t-space>
                    <t-button
                      v-if="!row.current"
                      theme="primary"
                      size="small"
                      @click="switchBranch(row.name)"
                    >
                      切换
                    </t-button>
                    
                    <t-button
                      v-if="!row.current && !row.isRemote"
                      theme="danger"
                      size="small"
                      @click="deleteBranch(row.name)"
                    >
                      删除
                    </t-button>
                  </t-space>
                </template>
              </t-table>
            </div>
          </t-tab-panel>
          
          <!-- 同步操作 -->
          <t-tab-panel value="sync" label="同步操作">
            <div class="sync-panel">
              <t-space direction="vertical" size="large" class="w-full">
                <t-card title="拉取更新" size="small">
                  <t-space>
                    <t-button
                      theme="primary"
                      :loading="pulling"
                      @click="pullChanges"
                    >
                      <template #icon>
                        <download-icon />
                      </template>
                      拉取 (Pull)
                    </t-button>
                    
                    <t-button
                      theme="default"
                      :loading="fetching"
                      @click="fetchChanges"
                    >
                      <template #icon>
                        <refresh-icon />
                      </template>
                      获取 (Fetch)
                    </t-button>
                  </t-space>
                </t-card>
                
                <t-card title="推送更新" size="small">
                  <t-space>
                    <t-button
                      theme="primary"
                      :loading="pushing"
                      :disabled="gitStatus.ahead === 0"
                      @click="pushChanges"
                    >
                      <template #icon>
                        <upload-icon />
                      </template>
                      推送 (Push)
                    </t-button>
                    
                    <t-button
                      theme="warning"
                      :loading="pushing"
                      @click="forcePushChanges"
                    >
                      <template #icon>
                        <upload-icon />
                      </template>
                      强制推送
                    </t-button>
                  </t-space>
                </t-card>
                
                <t-card title="合并操作" size="small">
                  <div class="merge-form">
                    <t-select
                      v-model="mergeBranch"
                      placeholder="选择要合并的分支"
                      class="w-48 mb-3"
                    >
                      <t-option
                        v-for="branch in branches.filter(b => !b.current)"
                        :key="branch.name"
                        :value="branch.name"
                        :label="branch.name"
                      />
                    </t-select>
                    
                    <t-space>
                      <t-button
                        theme="primary"
                        :disabled="!mergeBranch"
                        @click="mergeBranches"
                      >
                        合并分支
                      </t-button>
                      
                      <t-button
                        theme="default"
                        :disabled="!mergeBranch"
                        @click="rebaseBranches"
                      >
                        变基合并
                      </t-button>
                    </t-space>
                  </div>
                </t-card>
              </t-space>
            </div>
          </t-tab-panel>
        </t-tabs>
      </div>
    </t-card>
    
    <!-- 操作日志 -->
    <t-card title="操作日志" class="mt-4">
      <template #actions>
        <t-button theme="default" @click="clearLogs">
          清空日志
        </t-button>
      </template>
      
      <div class="logs-container">
        <div
          v-for="(log, index) in logs"
          :key="index"
          class="log-item"
          :class="`log-${log.level}`"
        >
          <span class="log-time">{{ formatTime(log.timestamp) }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </t-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import {
  RefreshIcon,
  DownloadIcon,
  UploadIcon,
} from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { getProjectsApi, getGitStatusApi, gitCommitApi, gitPushApi, gitPullApi } from '../api/project';
import type { Project, GitStatus, LogEntry } from '../types/project';

// 响应式数据
const projects = ref<Project[]>([]);
const selectedProject = ref<string>('');
const gitStatus = ref<GitStatus>({
  currentBranch: '',
  isClean: true,
  ahead: 0,
  behind: 0,
});
const activeTab = ref('commit');
const committing = ref(false);
const pulling = ref(false);
const pushing = ref(false);
const fetching = ref(false);
const logs = ref<LogEntry[]>([]);

// 表单数据
const commitForm = reactive({
  message: '',
});

const selectedFiles = ref<string[]>([]);
const newBranchName = ref('');
const mergeBranch = ref('');

// 模拟数据
const fileChanges = ref([
  { path: 'src/components/Header.vue', status: 'modified' },
  { path: 'src/pages/Home.vue', status: 'added' },
  { path: 'src/utils/helper.ts', status: 'deleted' },
]);

const branches = ref([
  { name: 'main', current: true, isRemote: false, lastCommit: '2024-01-15' },
  { name: 'develop', current: false, isRemote: false, lastCommit: '2024-01-14' },
  { name: 'feature/new-ui', current: false, isRemote: false, lastCommit: '2024-01-13' },
  { name: 'origin/main', current: false, isRemote: true, lastCommit: '2024-01-15' },
]);

// 表格列配置
const fileColumns = [
  {
    colKey: 'select-row',
    type: 'multiple',
    width: 50,
  },
  {
    colKey: 'path',
    title: '文件路径',
    width: 300,
  },
  {
    colKey: 'status',
    title: '状态',
    width: 100,
  },
];

const branchColumns = [
  {
    colKey: 'name',
    title: '分支名称',
    width: 200,
  },
  {
    colKey: 'current',
    title: '当前',
    width: 80,
  },
  {
    colKey: 'lastCommit',
    title: '最后提交',
    width: 120,
  },
  {
    colKey: 'actions',
    title: '操作',
    width: 150,
  },
];

// 计算属性
const currentProject = computed(() => {
  return projects.value.find(p => p.id === selectedProject.value);
});

// 方法
const loadProjects = async () => {
  try {
    const response = await projectApi.getProjects();
    projects.value = response.data;
  } catch (error) {
    console.error('加载项目失败:', error);
    MessagePlugin.error('加载项目失败');
  }
};

const onProjectChange = async () => {
  if (selectedProject.value) {
    await loadGitStatus();
  }
};

const loadGitStatus = async () => {
  if (!selectedProject.value) return;
  
  try {
    const response = await projectApi.getGitStatus(selectedProject.value);
    gitStatus.value = response.data;
  } catch (error) {
    console.error('加载 Git 状态失败:', error);
    MessagePlugin.error('加载 Git 状态失败');
  }
};

const refreshGitStatus = async () => {
  await loadGitStatus();
  addLog('info', 'Git 状态已刷新');
};

const onFileSelect = (selectedRowKeys: string[]) => {
  selectedFiles.value = selectedRowKeys;
};

const commitChanges = async () => {
  if (!selectedProject.value || !commitForm.message) return;
  
  committing.value = true;
  try {
    await projectApi.commitChanges(selectedProject.value, {
      message: commitForm.message,
      files: selectedFiles.value,
    });
    
    commitForm.message = '';
    selectedFiles.value = [];
    await loadGitStatus();
    
    addLog('success', `提交成功: ${commitForm.message}`);
    MessagePlugin.success('提交成功');
  } catch (error) {
    console.error('提交失败:', error);
    addLog('error', '提交失败');
    MessagePlugin.error('提交失败');
  } finally {
    committing.value = false;
  }
};

const stageAll = () => {
  selectedFiles.value = fileChanges.value.map(f => f.path);
  addLog('info', '已暂存所有文件');
};

const unstageAll = () => {
  selectedFiles.value = [];
  addLog('info', '已取消暂存所有文件');
};

const createBranch = async () => {
  if (!newBranchName.value) return;
  
  try {
    // 模拟创建分支
    branches.value.push({
      name: newBranchName.value,
      current: false,
      isRemote: false,
      lastCommit: new Date().toISOString().split('T')[0],
    });
    
    addLog('success', `分支 ${newBranchName.value} 创建成功`);
    MessagePlugin.success('分支创建成功');
    newBranchName.value = '';
  } catch (error) {
    console.error('创建分支失败:', error);
    addLog('error', '创建分支失败');
    MessagePlugin.error('创建分支失败');
  }
};

const switchBranch = async (branchName: string) => {
  try {
    // 模拟切换分支
    branches.value.forEach(branch => {
      branch.current = branch.name === branchName;
    });
    
    gitStatus.value.currentBranch = branchName;
    addLog('success', `已切换到分支 ${branchName}`);
    MessagePlugin.success('分支切换成功');
  } catch (error) {
    console.error('切换分支失败:', error);
    addLog('error', '切换分支失败');
    MessagePlugin.error('切换分支失败');
  }
};

const deleteBranch = async (branchName: string) => {
  try {
    const index = branches.value.findIndex(b => b.name === branchName);
    if (index > -1) {
      branches.value.splice(index, 1);
    }
    
    addLog('success', `分支 ${branchName} 删除成功`);
    MessagePlugin.success('分支删除成功');
  } catch (error) {
    console.error('删除分支失败:', error);
    addLog('error', '删除分支失败');
    MessagePlugin.error('删除分支失败');
  }
};

const pullChanges = async () => {
  if (!selectedProject.value) return;
  
  pulling.value = true;
  try {
    await projectApi.pullChanges(selectedProject.value);
    await loadGitStatus();
    
    addLog('success', '拉取更新成功');
    MessagePlugin.success('拉取更新成功');
  } catch (error) {
    console.error('拉取更新失败:', error);
    addLog('error', '拉取更新失败');
    MessagePlugin.error('拉取更新失败');
  } finally {
    pulling.value = false;
  }
};

const fetchChanges = async () => {
  if (!selectedProject.value) return;
  
  fetching.value = true;
  try {
    // 模拟 fetch 操作
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    addLog('success', '获取远程更新成功');
    MessagePlugin.success('获取远程更新成功');
  } catch (error) {
    console.error('获取远程更新失败:', error);
    addLog('error', '获取远程更新失败');
    MessagePlugin.error('获取远程更新失败');
  } finally {
    fetching.value = false;
  }
};

const pushChanges = async () => {
  if (!selectedProject.value) return;
  
  pushing.value = true;
  try {
    await projectApi.pushChanges(selectedProject.value);
    await loadGitStatus();
    
    addLog('success', '推送更新成功');
    MessagePlugin.success('推送更新成功');
  } catch (error) {
    console.error('推送更新失败:', error);
    addLog('error', '推送更新失败');
    MessagePlugin.error('推送更新失败');
  } finally {
    pushing.value = false;
  }
};

const forcePushChanges = async () => {
  if (!selectedProject.value) return;
  
  pushing.value = true;
  try {
    // 模拟强制推送
    await new Promise(resolve => setTimeout(resolve, 2000));
    await loadGitStatus();
    
    addLog('warning', '强制推送成功');
    MessagePlugin.success('强制推送成功');
  } catch (error) {
    console.error('强制推送失败:', error);
    addLog('error', '强制推送失败');
    MessagePlugin.error('强制推送失败');
  } finally {
    pushing.value = false;
  }
};

const mergeBranches = async () => {
  if (!mergeBranch.value) return;
  
  try {
    // 模拟合并分支
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    addLog('success', `分支 ${mergeBranch.value} 合并成功`);
    MessagePlugin.success('分支合并成功');
    mergeBranch.value = '';
  } catch (error) {
    console.error('分支合并失败:', error);
    addLog('error', '分支合并失败');
    MessagePlugin.error('分支合并失败');
  }
};

const rebaseBranches = async () => {
  if (!mergeBranch.value) return;
  
  try {
    // 模拟变基合并
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    addLog('success', `分支 ${mergeBranch.value} 变基合并成功`);
    MessagePlugin.success('变基合并成功');
    mergeBranch.value = '';
  } catch (error) {
    console.error('变基合并失败:', error);
    addLog('error', '变基合并失败');
    MessagePlugin.error('变基合并失败');
  }
};

const getStatusTheme = (status: string) => {
  switch (status) {
    case 'modified':
      return 'warning';
    case 'added':
      return 'success';
    case 'deleted':
      return 'danger';
    default:
      return 'default';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'modified':
      return '修改';
    case 'added':
      return '新增';
    case 'deleted':
      return '删除';
    default:
      return '未知';
  }
};

const addLog = (level: 'info' | 'success' | 'warning' | 'error', message: string) => {
  logs.value.unshift({
    level,
    message,
    timestamp: new Date(),
  });
  
  // 限制日志数量
  if (logs.value.length > 100) {
    logs.value = logs.value.slice(0, 100);
  }
};

const clearLogs = () => {
  logs.value = [];
};

const formatTime = (timestamp: Date) => {
  return timestamp.toLocaleTimeString();
};

// 生命周期
onMounted(() => {
  loadProjects();
});
</script>

<style scoped>
.git-workflow {
  padding: 16px;
}

.project-selector {
  margin-bottom: 16px;
}

.repo-info,
.status-info,
.sync-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item,
.status-item,
.sync-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  font-weight: 500;
  color: var(--td-text-color-secondary);
}

.value {
  color: var(--td-text-color-primary);
}

.commit-panel,
.branch-panel,
.sync-panel {
  padding: 16px 0;
}

.merge-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.logs-container {
  max-height: 300px;
  overflow-y: auto;
  background: var(--td-bg-color-container);
  border-radius: 6px;
  padding: 12px;
}

.log-item {
  display: flex;
  gap: 12px;
  padding: 4px 0;
  border-bottom: 1px solid var(--td-border-level-1-color);
}

.log-item:last-child {
  border-bottom: none;
}

.log-time {
  color: var(--td-text-color-placeholder);
  font-size: 12px;
  min-width: 80px;
}

.log-message {
  flex: 1;
  font-size: 13px;
}

.log-success .log-message {
  color: var(--td-success-color);
}

.log-warning .log-message {
  color: var(--td-warning-color);
}

.log-error .log-message {
  color: var(--td-error-color);
}

.log-info .log-message {
  color: var(--td-text-color-primary);
}
</style>