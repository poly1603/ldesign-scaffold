<template>
  <div class="git-manage">
    <!-- 项目选择器 -->
    <div class="project-selector">
      <t-select
        v-model="selectedProjectId"
        placeholder="选择项目"
        @change="onProjectChange"
        class="project-select"
      >
        <t-option
          v-for="project in projects"
          :key="project.id"
          :value="project.id"
          :label="project.name"
        />
      </t-select>
    </div>

    <div v-if="selectedProject" class="git-content">
      <!-- Git 状态 -->
      <t-card title="Git 状态" class="git-status-card">
        <div class="status-info">
          <div class="status-item">
            <span class="label">当前分支:</span>
            <t-tag theme="primary">{{ gitStatus.currentBranch || 'main' }}</t-tag>
          </div>
          <div class="status-item">
            <span class="label">状态:</span>
            <t-tag :theme="getStatusTheme(gitStatus.status)">
              {{ getStatusText(gitStatus.status) }}
            </t-tag>
          </div>
          <div class="status-item">
            <span class="label">未提交更改:</span>
            <span class="count">{{ gitStatus.changedFiles || 0 }} 个文件</span>
          </div>
        </div>
        
        <div class="git-actions">
          <t-button theme="primary" @click="commitChanges" :disabled="!gitStatus.hasChanges">
            <template #icon>
              <upload-icon />
            </template>
            提交更改
          </t-button>
          
          <t-button theme="default" @click="pullChanges">
            <template #icon>
              <download-icon />
            </template>
            拉取更新
          </t-button>
          
          <t-button theme="default" @click="pushChanges" :disabled="!gitStatus.hasCommits">
            <template #icon>
              <cloud-upload-icon />
            </template>
            推送更改
          </t-button>
          
          <t-button theme="default" @click="refreshGitStatus">
            <template #icon>
              <refresh-icon />
            </template>
            刷新状态
          </t-button>
        </div>
      </t-card>

      <!-- 分支管理 -->
      <t-card title="分支管理" class="branch-card">
        <div class="branch-actions">
          <t-input
            v-model="newBranchName"
            placeholder="新分支名称"
            class="branch-input"
          />
          <t-button theme="primary" @click="createBranch" :disabled="!newBranchName">
            创建分支
          </t-button>
        </div>
        
        <div class="branch-list">
          <div
            v-for="branch in gitStatus.branches"
            :key="branch.name"
            class="branch-item"
            :class="{ active: branch.current }"
          >
            <span class="branch-name">{{ branch.name }}</span>
            <div class="branch-actions">
              <t-button
                v-if="!branch.current"
                size="small"
                theme="default"
                @click="switchBranch(branch.name)"
              >
                切换
              </t-button>
              <t-button
                v-if="!branch.current && branch.name !== 'main' && branch.name !== 'master'"
                size="small"
                theme="danger"
                @click="deleteBranch(branch.name)"
              >
                删除
              </t-button>
            </div>
          </div>
        </div>
      </t-card>

      <!-- 提交历史 -->
      <t-card title="提交历史" class="commit-history-card">
        <div class="commit-list">
          <div
            v-for="commit in gitStatus.commits"
            :key="commit.hash"
            class="commit-item"
          >
            <div class="commit-info">
              <div class="commit-message">{{ commit.message }}</div>
              <div class="commit-meta">
                <span class="commit-author">{{ commit.author }}</span>
                <span class="commit-date">{{ formatDate(commit.date) }}</span>
                <span class="commit-hash">{{ commit.hash.substring(0, 8) }}</span>
              </div>
            </div>
          </div>
        </div>
      </t-card>
    </div>

    <div v-else class="empty-state">
      <t-empty description="请选择一个项目来管理 Git" />
    </div>

    <!-- 提交对话框 -->
    <t-dialog
      v-model:visible="commitDialogVisible"
      title="提交更改"
      @confirm="doCommit"
    >
      <t-form>
        <t-form-item label="提交信息">
          <t-textarea
            v-model="commitMessage"
            placeholder="请输入提交信息..."
            :rows="3"
          />
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import {
  UploadIcon,
  DownloadIcon,
  CloudUploadIcon,
  RefreshIcon,
} from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { getProjectsApi, gitStatusApi, gitCommitApi, gitPushApi, gitPullApi } from '../api/project';
import type { Project } from '../types/project';

// 响应式数据
const projects = ref<Project[]>([]);
const selectedProjectId = ref('');
const gitStatus = ref({
  currentBranch: 'main',
  status: 'clean',
  hasChanges: false,
  hasCommits: false,
  changedFiles: 0,
  branches: [
    { name: 'main', current: true },
    { name: 'develop', current: false }
  ],
  commits: [
    {
      hash: 'abc123def456',
      message: 'Initial commit',
      author: 'Developer',
      date: new Date(),
    }
  ]
});

const newBranchName = ref('');
const commitDialogVisible = ref(false);
const commitMessage = ref('');

// 计算属性
const selectedProject = computed(() => {
  return projects.value.find(p => p.id === selectedProjectId.value);
});

// 方法
const loadProjects = async () => {
  try {
    const response = await getProjectsApi();
    projects.value = response.data.projects;
  } catch (error) {
    console.error('加载项目失败:', error);
    MessagePlugin.error('加载项目失败');
  }
};

const onProjectChange = () => {
  if (selectedProjectId.value) {
    refreshGitStatus();
  }
};

const refreshGitStatus = async () => {
  if (!selectedProjectId.value) return;
  
  try {
    const status = await gitStatusApi(selectedProjectId.value);
    gitStatus.value = status;
  } catch (error) {
    console.error('获取 Git 状态失败:', error);
    MessagePlugin.error('获取 Git 状态失败');
  }
};

const commitChanges = () => {
  commitDialogVisible.value = true;
};

const doCommit = async () => {
  if (!commitMessage.value.trim()) {
    MessagePlugin.warning('请输入提交信息');
    return;
  }

  try {
    await gitCommitApi(selectedProjectId.value, commitMessage.value);
    MessagePlugin.success('提交成功');
    commitDialogVisible.value = false;
    commitMessage.value = '';
    refreshGitStatus();
  } catch (error) {
    console.error('提交失败:', error);
    MessagePlugin.error('提交失败');
  }
};

const pullChanges = async () => {
  try {
    await gitPullApi(selectedProjectId.value);
    MessagePlugin.success('拉取成功');
    refreshGitStatus();
  } catch (error) {
    console.error('拉取失败:', error);
    MessagePlugin.error('拉取失败');
  }
};

const pushChanges = async () => {
  try {
    await gitPushApi(selectedProjectId.value);
    MessagePlugin.success('推送成功');
    refreshGitStatus();
  } catch (error) {
    console.error('推送失败:', error);
    MessagePlugin.error('推送失败');
  }
};

const createBranch = () => {
  MessagePlugin.info('创建分支功能开发中...');
};

const switchBranch = (branchName: string) => {
  MessagePlugin.info(`切换到分支 ${branchName} 功能开发中...`);
};

const deleteBranch = (branchName: string) => {
  MessagePlugin.info(`删除分支 ${branchName} 功能开发中...`);
};

const getStatusTheme = (status: string) => {
  switch (status) {
    case 'clean': return 'success';
    case 'dirty': return 'warning';
    case 'conflict': return 'danger';
    default: return 'default';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'clean': return '干净';
    case 'dirty': return '有更改';
    case 'conflict': return '有冲突';
    default: return '未知';
  }
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleString();
};

// 生命周期
onMounted(() => {
  loadProjects();
});
</script>

<style lang="less" scoped>
.git-manage {
  padding: 24px;
}

.project-selector {
  margin-bottom: 24px;
  
  .project-select {
    width: 300px;
  }
}

.git-content {
  .git-status-card,
  .branch-card,
  .commit-history-card {
    margin-bottom: 24px;
  }
}

.status-info {
  margin-bottom: 16px;
  
  .status-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    
    .label {
      width: 100px;
      font-weight: 500;
    }
    
    .count {
      color: #666;
    }
  }
}

.git-actions {
  display: flex;
  gap: 12px;
}

.branch-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  
  .branch-input {
    width: 200px;
  }
}

.branch-list {
  .branch-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    border: 1px solid #e6e6e6;
    border-radius: 4px;
    margin-bottom: 8px;
    
    &.active {
      background-color: #f0f9ff;
      border-color: #1890ff;
    }
    
    .branch-name {
      font-weight: 500;
    }
    
    .branch-actions {
      display: flex;
      gap: 8px;
      margin: 0;
    }
  }
}

.commit-list {
  max-height: 400px;
  overflow-y: auto;
  
  .commit-item {
    padding: 12px;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .commit-message {
      font-weight: 500;
      margin-bottom: 4px;
    }
    
    .commit-meta {
      font-size: 12px;
      color: #666;
      
      span {
        margin-right: 12px;
      }
    }
  }
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}
</style>
