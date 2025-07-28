<template>
  <div class="deploy-manage">
    <t-card title="部署管理" class="mb-4">
      <template #actions>
        <t-button theme="primary" @click="refreshDeployments">
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
      
      <!-- 部署环境 -->
      <div v-if="selectedProject" class="deploy-environments mb-6">
        <t-row :gutter="16">
          <t-col
            v-for="env in environments"
            :key="env.name"
            :span="8"
          >
            <t-card :title="env.displayName" size="small" class="env-card">
              <template #actions>
                <t-dropdown
                  :options="getEnvActions(env)"
                  @click="handleEnvAction"
                >
                  <t-button theme="default" variant="text">
                    <more-icon />
                  </t-button>
                </t-dropdown>
              </template>
              
              <div class="env-info">
                <div class="env-status">
                  <t-tag
                    :theme="getStatusTheme(env.status)"
                    size="small"
                  >
                    {{ getStatusText(env.status) }}
                  </t-tag>
                  
                  <span class="env-url" v-if="env.url">
                    <a :href="env.url" target="_blank">{{ env.url }}</a>
                  </span>
                </div>
                
                <div class="env-details">
                  <div class="detail-item">
                    <span class="label">版本:</span>
                    <span class="value">{{ env.version || '未部署' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">更新时间:</span>
                    <span class="value">{{ formatTime(env.lastDeployTime) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">部署分支:</span>
                    <span class="value">{{ env.branch || '-' }}</span>
                  </div>
                </div>
                
                <div class="env-actions mt-3">
                  <t-space>
                    <t-button
                      theme="primary"
                      size="small"
                      :loading="env.deploying"
                      @click="deployToEnv(env.name)"
                    >
                      部署
                    </t-button>
                    
                    <t-button
                      v-if="env.status === 'running'"
                      theme="warning"
                      size="small"
                      @click="stopEnv(env.name)"
                    >
                      停止
                    </t-button>
                    
                    <t-button
                      v-if="env.status === 'stopped'"
                      theme="success"
                      size="small"
                      @click="startEnv(env.name)"
                    >
                      启动
                    </t-button>
                  </t-space>
                </div>
              </div>
            </t-card>
          </t-col>
        </t-row>
      </div>
      
      <!-- 部署配置 -->
      <div v-if="selectedProject" class="deploy-config">
        <t-tabs v-model="activeTab">
          <!-- 快速部署 -->
          <t-tab-panel value="quick" label="快速部署">
            <div class="quick-deploy">
              <t-form :data="quickDeployForm" layout="vertical">
                <t-row :gutter="16">
                  <t-col :span="8">
                    <t-form-item label="目标环境" name="environment">
                      <t-select
                        v-model="quickDeployForm.environment"
                        placeholder="选择部署环境"
                      >
                        <t-option
                          v-for="env in environments"
                          :key="env.name"
                          :value="env.name"
                          :label="env.displayName"
                        />
                      </t-select>
                    </t-form-item>
                  </t-col>
                  
                  <t-col :span="8">
                    <t-form-item label="部署分支" name="branch">
                      <t-select
                        v-model="quickDeployForm.branch"
                        placeholder="选择分支"
                      >
                        <t-option value="main" label="main" />
                        <t-option value="develop" label="develop" />
                        <t-option value="release" label="release" />
                      </t-select>
                    </t-form-item>
                  </t-col>
                  
                  <t-col :span="8">
                    <t-form-item label="构建模式" name="buildMode">
                      <t-select
                        v-model="quickDeployForm.buildMode"
                        placeholder="选择构建模式"
                      >
                        <t-option value="production" label="生产模式" />
                        <t-option value="development" label="开发模式" />
                        <t-option value="test" label="测试模式" />
                      </t-select>
                    </t-form-item>
                  </t-col>
                </t-row>
                
                <t-form-item label="部署说明" name="description">
                  <t-textarea
                    v-model="quickDeployForm.description"
                    placeholder="输入部署说明（可选）"
                    :rows="3"
                  />
                </t-form-item>
                
                <t-form-item>
                  <t-space>
                    <t-button
                      theme="primary"
                      :loading="deploying"
                      :disabled="!quickDeployForm.environment || !quickDeployForm.branch"
                      @click="quickDeploy"
                    >
                      <template #icon>
                        <cloud-upload-icon />
                      </template>
                      开始部署
                    </t-button>
                    
                    <t-button
                      theme="default"
                      @click="resetQuickForm"
                    >
                      重置
                    </t-button>
                  </t-space>
                </t-form-item>
              </t-form>
            </div>
          </t-tab-panel>
          
          <!-- 高级配置 -->
          <t-tab-panel value="advanced" label="高级配置">
            <div class="advanced-deploy">
              <t-form :data="advancedDeployForm" layout="vertical">
                <t-row :gutter="16">
                  <t-col :span="12">
                    <t-form-item label="Docker 镜像" name="dockerImage">
                      <t-input
                        v-model="advancedDeployForm.dockerImage"
                        placeholder="输入 Docker 镜像名称"
                      />
                    </t-form-item>
                  </t-col>
                  
                  <t-col :span="12">
                    <t-form-item label="镜像标签" name="imageTag">
                      <t-input
                        v-model="advancedDeployForm.imageTag"
                        placeholder="输入镜像标签"
                      />
                    </t-form-item>
                  </t-col>
                </t-row>
                
                <t-form-item label="环境变量" name="envVars">
                  <div class="env-vars">
                    <div
                      v-for="(envVar, index) in advancedDeployForm.envVars"
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
                        @click="removeEnvVar(index)"
                      >
                        <delete-icon />
                      </t-button>
                    </div>
                    
                    <t-button theme="default" variant="dashed" @click="addEnvVar">
                      <template #icon>
                        <add-icon />
                      </template>
                      添加环境变量
                    </t-button>
                  </div>
                </t-form-item>
                
                <t-form-item label="资源配置" name="resources">
                  <t-row :gutter="16">
                    <t-col :span="8">
                      <t-input
                        v-model="advancedDeployForm.resources.cpu"
                        placeholder="CPU 限制"
                        addon-before="CPU"
                      />
                    </t-col>
                    <t-col :span="8">
                      <t-input
                        v-model="advancedDeployForm.resources.memory"
                        placeholder="内存限制"
                        addon-before="内存"
                      />
                    </t-col>
                    <t-col :span="8">
                      <t-input
                        v-model="advancedDeployForm.resources.replicas"
                        placeholder="实例数量"
                        addon-before="实例"
                        type="number"
                      />
                    </t-col>
                  </t-row>
                </t-form-item>
                
                <t-form-item label="健康检查" name="healthCheck">
                  <t-row :gutter="16">
                    <t-col :span="12">
                      <t-input
                        v-model="advancedDeployForm.healthCheck.path"
                        placeholder="健康检查路径"
                        addon-before="路径"
                      />
                    </t-col>
                    <t-col :span="6">
                      <t-input
                        v-model="advancedDeployForm.healthCheck.interval"
                        placeholder="检查间隔"
                        addon-before="间隔"
                        type="number"
                      />
                    </t-col>
                    <t-col :span="6">
                      <t-input
                        v-model="advancedDeployForm.healthCheck.timeout"
                        placeholder="超时时间"
                        addon-before="超时"
                        type="number"
                      />
                    </t-col>
                  </t-row>
                </t-form-item>
                
                <t-form-item>
                  <t-space>
                    <t-button
                      theme="primary"
                      :loading="deploying"
                      @click="advancedDeploy"
                    >
                      <template #icon>
                        <cloud-upload-icon />
                      </template>
                      高级部署
                    </t-button>
                    
                    <t-button
                      theme="default"
                      @click="resetAdvancedForm"
                    >
                      重置配置
                    </t-button>
                    
                    <t-button
                      theme="default"
                      @click="saveTemplate"
                    >
                      保存模板
                    </t-button>
                  </t-space>
                </t-form-item>
              </t-form>
            </div>
          </t-tab-panel>
          
          <!-- 部署历史 -->
          <t-tab-panel value="history" label="部署历史">
            <div class="deploy-history">
              <div class="history-filters mb-4">
                <t-space>
                  <t-select
                    v-model="historyFilter.environment"
                    placeholder="筛选环境"
                    clearable
                    class="w-32"
                  >
                    <t-option value="" label="全部环境" />
                    <t-option
                      v-for="env in environments"
                      :key="env.name"
                      :value="env.name"
                      :label="env.displayName"
                    />
                  </t-select>
                  
                  <t-select
                    v-model="historyFilter.status"
                    placeholder="筛选状态"
                    clearable
                    class="w-32"
                  >
                    <t-option value="" label="全部状态" />
                    <t-option value="success" label="成功" />
                    <t-option value="failed" label="失败" />
                    <t-option value="running" label="进行中" />
                  </t-select>
                  
                  <t-date-range-picker
                    v-model="historyFilter.dateRange"
                    placeholder="选择时间范围"
                    clearable
                  />
                </t-space>
              </div>
              
              <t-table
                :data="filteredHistory"
                :columns="historyColumns"
                row-key="id"
                :pagination="pagination"
              >
                <template #status="{ row }">
                  <t-tag
                    :theme="getDeployStatusTheme(row.status)"
                    size="small"
                  >
                    {{ getDeployStatusText(row.status) }}
                  </t-tag>
                </template>
                
                <template #duration="{ row }">
                  {{ formatDuration(row.duration) }}
                </template>
                
                <template #actions="{ row }">
                  <t-space>
                    <t-button
                      theme="primary"
                      size="small"
                      @click="viewDeployLog(row.id)"
                    >
                      查看日志
                    </t-button>
                    
                    <t-button
                      v-if="row.status === 'success'"
                      theme="default"
                      size="small"
                      @click="rollbackDeploy(row.id)"
                    >
                      回滚
                    </t-button>
                    
                    <t-button
                      v-if="row.status === 'running'"
                      theme="danger"
                      size="small"
                      @click="cancelDeploy(row.id)"
                    >
                      取消
                    </t-button>
                  </t-space>
                </template>
              </t-table>
            </div>
          </t-tab-panel>
        </t-tabs>
      </div>
    </t-card>
    
    <!-- 部署日志 -->
    <t-card title="部署日志" class="mt-4">
      <template #actions>
        <t-space>
          <t-button theme="default" @click="clearDeployLogs">
            清空日志
          </t-button>
          
          <t-button theme="default" @click="downloadLogs">
            <template #icon>
              <download-icon />
            </template>
            下载日志
          </t-button>
        </t-space>
      </template>
      
      <div class="logs-container">
        <div
          v-for="(log, index) in deployLogs"
          :key="index"
          class="log-item"
          :class="`log-${log.level}`"
        >
          <span class="log-time">{{ formatTime(log.timestamp) }}</span>
          <span class="log-env">{{ log.environment }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
        
        <div v-if="deployLogs.length === 0" class="empty-logs">
          暂无部署日志
        </div>
      </div>
    </t-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import {
  RefreshIcon,
  MoreIcon,
  CloudUploadIcon,
  AddIcon,
  DeleteIcon,
  DownloadIcon,
} from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { getProjectsApi, deployProjectApi } from '../api/project';
import type { Project, DeployConfig, LogEntry } from '../types/project';

// 响应式数据
const projects = ref<Project[]>([]);
const selectedProject = ref<string>('');
const activeTab = ref('quick');
const deploying = ref(false);
const deployLogs = ref<LogEntry[]>([]);

// 部署环境
const environments = ref([
  {
    name: 'development',
    displayName: '开发环境',
    status: 'running',
    url: 'https://dev.example.com',
    version: 'v1.2.3',
    branch: 'develop',
    lastDeployTime: new Date('2024-01-15T10:30:00'),
    deploying: false,
  },
  {
    name: 'staging',
    displayName: '测试环境',
    status: 'stopped',
    url: 'https://staging.example.com',
    version: 'v1.2.2',
    branch: 'release',
    lastDeployTime: new Date('2024-01-14T16:45:00'),
    deploying: false,
  },
  {
    name: 'production',
    displayName: '生产环境',
    status: 'running',
    url: 'https://example.com',
    version: 'v1.2.1',
    branch: 'main',
    lastDeployTime: new Date('2024-01-13T09:15:00'),
    deploying: false,
  },
]);

// 表单数据
const quickDeployForm = reactive({
  environment: '',
  branch: 'main',
  buildMode: 'production',
  description: '',
});

const advancedDeployForm = reactive({
  dockerImage: '',
  imageTag: 'latest',
  envVars: [
    { key: 'NODE_ENV', value: 'production' },
  ],
  resources: {
    cpu: '500m',
    memory: '512Mi',
    replicas: 1,
  },
  healthCheck: {
    path: '/health',
    interval: 30,
    timeout: 5,
  },
});

// 部署历史
const deployHistory = ref([
  {
    id: '1',
    environment: 'production',
    version: 'v1.2.1',
    branch: 'main',
    status: 'success',
    startTime: new Date('2024-01-13T09:15:00'),
    endTime: new Date('2024-01-13T09:18:30'),
    duration: 210,
    deployer: 'admin',
    description: '修复登录问题',
  },
  {
    id: '2',
    environment: 'staging',
    version: 'v1.2.2',
    branch: 'release',
    status: 'failed',
    startTime: new Date('2024-01-14T16:45:00'),
    endTime: new Date('2024-01-14T16:47:15'),
    duration: 135,
    deployer: 'admin',
    description: '新功能测试',
  },
  {
    id: '3',
    environment: 'development',
    version: 'v1.2.3',
    branch: 'develop',
    status: 'running',
    startTime: new Date('2024-01-15T10:30:00'),
    endTime: null,
    duration: null,
    deployer: 'admin',
    description: '开发环境更新',
  },
]);

// 历史筛选
const historyFilter = reactive({
  environment: '',
  status: '',
  dateRange: [],
});

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});

// 表格列配置
const historyColumns = [
  {
    colKey: 'environment',
    title: '环境',
    width: 100,
  },
  {
    colKey: 'version',
    title: '版本',
    width: 100,
  },
  {
    colKey: 'branch',
    title: '分支',
    width: 100,
  },
  {
    colKey: 'status',
    title: '状态',
    width: 80,
  },
  {
    colKey: 'startTime',
    title: '开始时间',
    width: 150,
    cell: (h: any, { row }: any) => formatTime(row.startTime),
  },
  {
    colKey: 'duration',
    title: '耗时',
    width: 80,
  },
  {
    colKey: 'deployer',
    title: '部署人',
    width: 100,
  },
  {
    colKey: 'description',
    title: '说明',
    width: 200,
  },
  {
    colKey: 'actions',
    title: '操作',
    width: 200,
  },
];

// 计算属性
const filteredHistory = computed(() => {
  let filtered = deployHistory.value;
  
  if (historyFilter.environment) {
    filtered = filtered.filter(item => item.environment === historyFilter.environment);
  }
  
  if (historyFilter.status) {
    filtered = filtered.filter(item => item.status === historyFilter.status);
  }
  
  return filtered;
});

// 方法
const loadProjects = async () => {
  try {
    const response = await getProjectsApi();
    projects.value = response;
  } catch (error) {
    console.error('加载项目失败:', error);
    MessagePlugin.error('加载项目失败');
  }
};

const onProjectChange = () => {
  // 项目切换时重置表单
  resetQuickForm();
  resetAdvancedForm();
};

const refreshDeployments = () => {
  // 刷新部署状态
  addDeployLog('info', 'all', '刷新部署状态');
  MessagePlugin.success('部署状态已刷新');
};

const getEnvActions = (env: any) => {
  return [
    { content: '查看配置', value: `config-${env.name}` },
    { content: '查看日志', value: `logs-${env.name}` },
    { content: '重启服务', value: `restart-${env.name}` },
    { content: '清理缓存', value: `clear-${env.name}` },
  ];
};

const handleEnvAction = (data: any) => {
  const [action, envName] = data.value.split('-');
  
  switch (action) {
    case 'config':
      MessagePlugin.info(`查看 ${envName} 环境配置`);
      break;
    case 'logs':
      MessagePlugin.info(`查看 ${envName} 环境日志`);
      break;
    case 'restart':
      MessagePlugin.info(`重启 ${envName} 环境服务`);
      break;
    case 'clear':
      MessagePlugin.info(`清理 ${envName} 环境缓存`);
      break;
  }
};

const deployToEnv = async (envName: string) => {
  const env = environments.value.find(e => e.name === envName);
  if (!env) return;
  
  env.deploying = true;
  try {
    addDeployLog('info', envName, `开始部署到 ${env.displayName}`);
    
    // 模拟部署过程
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    env.status = 'running';
    env.version = 'v1.2.4';
    env.lastDeployTime = new Date();
    
    addDeployLog('success', envName, `部署到 ${env.displayName} 成功`);
    MessagePlugin.success(`部署到 ${env.displayName} 成功`);
  } catch (error) {
    addDeployLog('error', envName, `部署到 ${env.displayName} 失败`);
    MessagePlugin.error(`部署到 ${env.displayName} 失败`);
  } finally {
    env.deploying = false;
  }
};

const stopEnv = async (envName: string) => {
  const env = environments.value.find(e => e.name === envName);
  if (!env) return;
  
  try {
    env.status = 'stopped';
    addDeployLog('warning', envName, `${env.displayName} 已停止`);
    MessagePlugin.success(`${env.displayName} 已停止`);
  } catch (error) {
    MessagePlugin.error(`停止 ${env.displayName} 失败`);
  }
};

const startEnv = async (envName: string) => {
  const env = environments.value.find(e => e.name === envName);
  if (!env) return;
  
  try {
    env.status = 'running';
    addDeployLog('success', envName, `${env.displayName} 已启动`);
    MessagePlugin.success(`${env.displayName} 已启动`);
  } catch (error) {
    MessagePlugin.error(`启动 ${env.displayName} 失败`);
  }
};

const quickDeploy = async () => {
  if (!selectedProject.value) return;
  
  deploying.value = true;
  try {
    const env = environments.value.find(e => e.name === quickDeployForm.environment);
    if (!env) return;
    
    addDeployLog('info', quickDeployForm.environment, '开始快速部署');
    
    await projectApi.deployProject(selectedProject.value, {
      environment: quickDeployForm.environment,
      branch: quickDeployForm.branch,
      mode: quickDeployForm.buildMode as any,
    });
    
    addDeployLog('success', quickDeployForm.environment, '快速部署成功');
    MessagePlugin.success('快速部署成功');
    
    // 更新环境状态
    env.status = 'running';
    env.branch = quickDeployForm.branch;
    env.lastDeployTime = new Date();
  } catch (error) {
    addDeployLog('error', quickDeployForm.environment, '快速部署失败');
    MessagePlugin.error('快速部署失败');
  } finally {
    deploying.value = false;
  }
};

const advancedDeploy = async () => {
  if (!selectedProject.value) return;
  
  deploying.value = true;
  try {
    addDeployLog('info', 'advanced', '开始高级部署');
    
    // 模拟高级部署
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    addDeployLog('success', 'advanced', '高级部署成功');
    MessagePlugin.success('高级部署成功');
  } catch (error) {
    addDeployLog('error', 'advanced', '高级部署失败');
    MessagePlugin.error('高级部署失败');
  } finally {
    deploying.value = false;
  }
};

const resetQuickForm = () => {
  Object.assign(quickDeployForm, {
    environment: '',
    branch: 'main',
    buildMode: 'production',
    description: '',
  });
};

const resetAdvancedForm = () => {
  Object.assign(advancedDeployForm, {
    dockerImage: '',
    imageTag: 'latest',
    envVars: [
      { key: 'NODE_ENV', value: 'production' },
    ],
    resources: {
      cpu: '500m',
      memory: '512Mi',
      replicas: 1,
    },
    healthCheck: {
      path: '/health',
      interval: 30,
      timeout: 5,
    },
  });
};

const saveTemplate = () => {
  MessagePlugin.success('部署模板已保存');
};

const addEnvVar = () => {
  advancedDeployForm.envVars.push({ key: '', value: '' });
};

const removeEnvVar = (index: number) => {
  advancedDeployForm.envVars.splice(index, 1);
};

const viewDeployLog = (deployId: string) => {
  MessagePlugin.info(`查看部署 ${deployId} 的日志`);
};

const rollbackDeploy = (deployId: string) => {
  MessagePlugin.info(`回滚到部署 ${deployId}`);
};

const cancelDeploy = (deployId: string) => {
  MessagePlugin.info(`取消部署 ${deployId}`);
};

const getStatusTheme = (status: string) => {
  switch (status) {
    case 'running':
      return 'success';
    case 'stopped':
      return 'warning';
    case 'error':
      return 'danger';
    default:
      return 'default';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'running':
      return '运行中';
    case 'stopped':
      return '已停止';
    case 'error':
      return '错误';
    default:
      return '未知';
  }
};

const getDeployStatusTheme = (status: string) => {
  switch (status) {
    case 'success':
      return 'success';
    case 'failed':
      return 'danger';
    case 'running':
      return 'primary';
    default:
      return 'default';
  }
};

const getDeployStatusText = (status: string) => {
  switch (status) {
    case 'success':
      return '成功';
    case 'failed':
      return '失败';
    case 'running':
      return '进行中';
    default:
      return '未知';
  }
};

const formatDuration = (duration: number | null) => {
  if (!duration) return '-';
  
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  
  return `${minutes}m ${seconds}s`;
};

const addDeployLog = (level: 'info' | 'success' | 'warning' | 'error', environment: string, message: string) => {
  deployLogs.value.unshift({
    level,
    message,
    timestamp: new Date(),
    environment,
  });
  
  // 限制日志数量
  if (deployLogs.value.length > 200) {
    deployLogs.value = deployLogs.value.slice(0, 200);
  }
};

const clearDeployLogs = () => {
  deployLogs.value = [];
};

const downloadLogs = () => {
  const logContent = deployLogs.value
    .map(log => `[${formatTime(log.timestamp)}] [${log.environment}] ${log.message}`)
    .join('\n');
  
  const blob = new Blob([logContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `deploy-logs-${new Date().toISOString().split('T')[0]}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};

const formatTime = (timestamp: Date) => {
  return timestamp.toLocaleString();
};

// 生命周期
onMounted(() => {
  loadProjects();
});
</script>

<style scoped>
.deploy-manage {
  padding: 16px;
}

.project-selector {
  margin-bottom: 16px;
}

.env-card {
  height: 100%;
}

.env-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.env-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.env-url a {
  color: var(--td-brand-color);
  text-decoration: none;
  font-size: 12px;
}

.env-url a:hover {
  text-decoration: underline;
}

.env-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.label {
  color: var(--td-text-color-secondary);
}

.value {
  color: var(--td-text-color-primary);
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

.history-filters {
  padding: 16px;
  background: var(--td-bg-color-container);
  border-radius: 6px;
}

.logs-container {
  max-height: 400px;
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
  font-size: 13px;
}

.log-item:last-child {
  border-bottom: none;
}

.log-time {
  color: var(--td-text-color-placeholder);
  min-width: 120px;
  font-size: 12px;
}

.log-env {
  color: var(--td-text-color-secondary);
  min-width: 80px;
  font-size: 12px;
}

.log-message {
  flex: 1;
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

.empty-logs {
  text-align: center;
  color: var(--td-text-color-placeholder);
  padding: 40px 0;
}
</style>