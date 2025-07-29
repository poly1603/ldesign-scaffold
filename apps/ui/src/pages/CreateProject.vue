<template>
  <div class="create-project">
    <t-card title="创建新项目" :bordered="false">
      <t-steps v-model:current="currentStep" :options="steps" />
      
      <div class="step-content">
        <!-- 步骤1: 选择模板 -->
        <div v-if="currentStep === 0" class="template-selection">
          <h4>选择项目模板</h4>
          <t-loading :loading="templatesLoading" size="large">
            <div class="template-grid">
              <div
                v-for="template in templates"
                :key="template.value"
                :class="['template-card', { 'template-card--selected': formData.template === template.value }]"
                @click="formData.template = template.value"
              >
                <div class="template-content">
                  <component :is="template.icon" size="32" />
                  <h5>{{ template.label }}</h5>
                  <p>{{ template.description }}</p>
                </div>
              </div>
            </div>
          </t-loading>
        </div>
        
        <!-- 步骤2: 项目配置 -->
        <div v-if="currentStep === 1" class="project-config">
          <h4>项目配置</h4>
          <t-form :data="formData" :rules="rules" ref="formRef" layout="vertical">
            <t-form-item label="项目名称" name="name">
              <t-input v-model="formData.name" placeholder="请输入项目名称" />
            </t-form-item>
            
            <t-form-item label="项目描述" name="description">
              <t-textarea v-model="formData.description" placeholder="请输入项目描述" :rows="3" />
            </t-form-item>
            
            <t-form-item label="项目路径" name="path">
              <t-input v-model="formData.path" placeholder="请选择项目创建路径">
                <template #suffix>
                  <t-button theme="default" variant="text" @click="showPathSelector = true">
                    <folder-open-icon />
                  </t-button>
                </template>
              </t-input>
              <template #help>
                <div class="path-help">
                  项目将创建在：{{ formData.path ? `${formData.path}/${formData.name || '[项目名称]'}` : '请先选择路径' }}
                </div>
              </template>
            </t-form-item>

            <!-- 路径选择器对话框 -->
            <t-dialog
              v-model:visible="showPathSelector"
              title="选择项目路径"
              width="600px"
              :footer="false"
            >
              <div class="path-selector">
                <!-- 当前路径显示 -->
                <div class="current-path">
                  <t-input
                    v-model="currentBrowsePath"
                    placeholder="输入路径或从下方选择"
                    @blur="validateAndBrowsePath"
                  >
                    <template #suffix>
                      <t-button theme="default" variant="text" @click="validateAndBrowsePath">
                        <refresh-icon />
                      </t-button>
                    </template>
                  </t-input>
                </div>

                <!-- 快捷目录 -->
                <div class="quick-directories" v-if="commonDirectories.length > 0">
                  <h5>常用目录</h5>
                  <div class="directory-chips">
                    <t-tag
                      v-for="dir in commonDirectories"
                      :key="dir.path"
                      theme="primary"
                      variant="outline"
                      clickable
                      @click="selectDirectory(dir.path)"
                    >
                      {{ dir.name }}
                    </t-tag>
                  </div>
                </div>

                <!-- 目录浏览器 -->
                <div class="directory-browser">
                  <t-loading :loading="browsingDirectory">
                    <!-- 父目录导航 -->
                    <div v-if="currentDirectoryInfo?.parentPath" class="parent-nav">
                      <t-button
                        theme="default"
                        variant="text"
                        @click="selectDirectory(currentDirectoryInfo.parentPath)"
                      >
                        <chevron-left-icon />
                        返回上级目录
                      </t-button>
                    </div>

                    <!-- 子目录列表 -->
                    <div class="subdirectories" v-if="currentDirectoryInfo?.directories">
                      <div
                        v-for="dir in currentDirectoryInfo.directories"
                        :key="dir.path"
                        class="directory-item"
                        @click="selectDirectory(dir.path)"
                      >
                        <folder-icon />
                        <span class="directory-name">{{ dir.name }}</span>
                      </div>
                    </div>

                    <div v-if="currentDirectoryInfo?.directories?.length === 0" class="empty-directory">
                      <t-empty description="此目录下没有子文件夹" />
                    </div>
                  </t-loading>
                </div>

                <!-- 操作按钮 -->
                <div class="path-selector-actions">
                  <t-space>
                    <t-button @click="showPathSelector = false">取消</t-button>
                    <t-button
                      theme="primary"
                      @click="confirmPathSelection"
                      :disabled="!currentBrowsePath || !currentDirectoryInfo?.canWrite"
                    >
                      确认选择
                    </t-button>
                  </t-space>
                  <div v-if="currentDirectoryInfo && !currentDirectoryInfo.canWrite" class="write-warning">
                    <t-alert theme="warning" message="当前目录没有写入权限，请选择其他目录" />
                  </div>
                </div>
              </div>
            </t-dialog>
            
            <t-form-item label="包管理器" name="packageManager">
              <t-select v-model="formData.packageManager" placeholder="选择包管理器">
                <t-option value="pnpm" label="pnpm (推荐)" />
                <t-option value="npm" label="npm" />
                <t-option value="yarn" label="yarn" />
              </t-select>
            </t-form-item>
            
            <t-form-item label="Git 初始化" name="initGit">
              <t-switch v-model="formData.initGit" />
            </t-form-item>

            <t-form-item label="自动安装依赖" name="installDeps">
              <t-switch v-model="formData.installDeps" />
            </t-form-item>
          </t-form>
        </div>
        
        <!-- 步骤3: 确认创建 -->
        <div v-if="currentStep === 2" class="project-confirm">
          <h4>确认项目信息</h4>
          <t-descriptions :data="confirmData" layout="vertical" />
        </div>
      </div>
      
      <div class="step-actions">
        <t-button v-if="currentStep > 0" @click="prevStep">上一步</t-button>
        <t-button
          v-if="currentStep < steps.length - 1"
          theme="primary"
          @click="nextStep"
          :disabled="!canNext"
        >
          下一步
        </t-button>
        <t-button
          v-if="currentStep === steps.length - 1"
          theme="primary"
          @click="createProject"
          :loading="creating"
        >
          创建项目
        </t-button>
      </div>
    </t-card>
    
    <!-- 创建进度对话框 -->
    <t-dialog
      v-model:visible="showProgress"
      title="正在创建项目"
      :close-btn="false"
      :close-on-overlay-click="false"
    >
      <div class="progress-content">
        <t-progress :percentage="progress" :label="false" />
        <p class="progress-text">{{ progressText }}</p>
        <div class="log-output">
          <div v-for="(log, index) in logs" :key="index" class="log-item">
            {{ log }}
          </div>
        </div>
      </div>
    </t-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, markRaw } from 'vue';
import { useRouter } from 'vue-router';
import {
  CodeIcon,
  ServerIcon,
  FolderOpenIcon,
  LayersIcon,
  AppIcon,
  RefreshIcon,
  ChevronLeftIcon,
  FolderIcon,
} from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { createProjectApi } from '../api/project';
import { getTemplatesApi } from '../api/template';
import { selectFolderApi, getCommonDirectoriesApi, browseDirectoryApi } from '../api/system';

const router = useRouter();

// 步骤配置
const steps = [
  { title: '选择模板', content: '选择项目模板类型' },
  { title: '项目配置', content: '配置项目基本信息' },
  { title: '确认创建', content: '确认项目信息并创建' },
];

const currentStep = ref(0);

// 模板配置
const templates = ref<any[]>([]);
const templatesLoading = ref(false);

// 图标映射
const iconMap: Record<string, any> = {
  'vue3-component-lib': AppIcon,
  'vue2-component-lib': AppIcon,
  'react-component-lib': LayersIcon,
  'typescript-lib': CodeIcon,
  'less-lib': CodeIcon,
  'nodejs-api': ServerIcon,
};

// 表单数据
const formData = reactive({
  template: '',
  name: '',
  description: '',
  path: '',
  packageManager: 'pnpm',
  initGit: true,
  installDeps: true,
});

// 路径选择器相关数据
const showPathSelector = ref(false);
const currentBrowsePath = ref('');
const browsingDirectory = ref(false);
const commonDirectories = ref<any[]>([]);
const currentDirectoryInfo = ref<any>(null);

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入项目名称' },
    { pattern: /^[a-zA-Z0-9-_]+$/, message: '项目名称只能包含字母、数字、横线和下划线' },
  ],
  path: [{ required: true, message: '请选择项目路径' }],
};

const formRef = ref();

// 创建状态
const creating = ref(false);
const showProgress = ref(false);
const progress = ref(0);
const progressText = ref('');
const logs = ref<string[]>([]);

// 计算属性
const canNext = computed(() => {
  if (currentStep.value === 0) {
    return !!formData.template;
  }
  if (currentStep.value === 1) {
    return formData.name && formData.path;
  }
  return true;
});

const confirmData = computed(() => {
  const template = templates.value.find(t => t.value === formData.template);
  return [
    { label: '项目模板', value: template?.label },
    { label: '项目名称', value: formData.name },
    { label: '项目描述', value: formData.description || '无' },
    { label: '项目路径', value: formData.path },
    { label: '包管理器', value: formData.packageManager },
    { label: 'Git 初始化', value: formData.initGit ? '是' : '否' },
    { label: '自动安装依赖', value: formData.installDeps ? '是' : '否' },
  ];
});

// 方法
const nextStep = async () => {
  if (currentStep.value === 1) {
    const valid = await formRef.value?.validate();
    if (!valid) return;
  }
  currentStep.value++;
};

const prevStep = () => {
  currentStep.value--;
};

// 加载模板数据
const loadTemplates = async () => {
  try {
    templatesLoading.value = true;
    console.log('开始加载模板...');

    const response = await getTemplatesApi();
    console.log('模板API响应:', response);

    if (response.success && response.data && response.data.templates) {
      templates.value = response.data.templates.map((template: any) => ({
        value: template.name,
        label: template.displayName,
        description: template.description,
        icon: markRaw(iconMap[template.name] || CodeIcon),
      }));

      console.log('处理后的模板数据:', templates.value);

      // 设置默认选中第一个模板
      if (templates.value.length > 0 && !formData.template) {
        formData.template = templates.value[0].value;
        console.log('设置默认模板:', formData.template);
      }
    } else {
      console.error('模板数据格式错误:', response);
      MessagePlugin.error('模板数据格式错误');
    }
  } catch (error: any) {
    console.error('加载模板失败:', error);
    MessagePlugin.error(error.response?.data?.error || '加载模板失败');
  } finally {
    templatesLoading.value = false;
  }
};

// 加载常用目录
const loadCommonDirectories = async () => {
  try {
    const response = await getCommonDirectoriesApi();
    if (response.success) {
      commonDirectories.value = response.data.directories;
      // 设置默认浏览路径
      if (response.data.directories.length > 0) {
        currentBrowsePath.value = response.data.directories[0].path;
      }
    }
  } catch (error: any) {
    console.error('加载常用目录失败:', error);
  }
};

// 浏览目录
const browseDirectory = async (path: string) => {
  browsingDirectory.value = true;
  try {
    const response = await browseDirectoryApi(path);
    if (response.success) {
      currentDirectoryInfo.value = response.data;
      currentBrowsePath.value = response.data.currentPath;
    } else {
      MessagePlugin.error(response.error || '浏览目录失败');
    }
  } catch (error: any) {
    console.error('浏览目录失败:', error);
    MessagePlugin.error(error.response?.data?.error || '浏览目录失败');
  } finally {
    browsingDirectory.value = false;
  }
};

// 选择目录
const selectDirectory = async (path: string) => {
  await browseDirectory(path);
};

// 验证并浏览路径
const validateAndBrowsePath = async () => {
  if (currentBrowsePath.value) {
    await browseDirectory(currentBrowsePath.value);
  }
};

// 确认路径选择
const confirmPathSelection = () => {
  if (currentBrowsePath.value && currentDirectoryInfo.value?.canWrite) {
    formData.path = currentBrowsePath.value;
    showPathSelector.value = false;
    MessagePlugin.success('路径选择成功');
  } else {
    MessagePlugin.error('请选择一个有效且可写的目录');
  }
};

// 初始化路径选择器
const initPathSelector = async () => {
  await loadCommonDirectories();
  if (commonDirectories.value.length > 0) {
    await browseDirectory(commonDirectories.value[0].path);
  }
};

const createProject = async () => {
  creating.value = true;
  showProgress.value = true;
  progress.value = 0;
  progressText.value = '正在初始化项目...';
  logs.value = [];
  
  try {
    // 模拟创建过程
    const steps = [
      { text: '创建项目目录...', progress: 20 },
      { text: '下载项目模板...', progress: 40 },
      { text: '安装项目依赖...', progress: 70 },
      { text: '初始化 Git 仓库...', progress: 90 },
      { text: '项目创建完成!', progress: 100 },
    ];
    
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      progress.value = step.progress;
      progressText.value = step.text;
      logs.value.push(`[${new Date().toLocaleTimeString()}] ${step.text}`);
    }
    
    // 调用实际的创建 API
    await createProjectApi(formData);
    
    MessagePlugin.success('项目创建成功!');
    
    // 跳转到项目管理页面
    setTimeout(() => {
      showProgress.value = false;
      router.push('/manage');
    }, 1000);
    
  } catch (error: any) {
    console.error('创建项目失败:', error);

    // 显示具体的错误信息
    let errorMessage = '创建项目失败，请重试';
    if (error.response?.data?.error?.message) {
      errorMessage = error.response.data.error.message;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    MessagePlugin.error(errorMessage);
    showProgress.value = false;
  } finally {
    creating.value = false;
  }
};

// 生命周期
onMounted(() => {
  loadTemplates();
  initPathSelector();
});
</script>

<style scoped>
.create-project {
  max-width: 800px;
  margin: 0 auto;
}

.path-help {
  font-size: 12px;
  color: var(--td-text-color-placeholder);
  margin-top: 4px;
}

.step-content {
  margin: 32px 0;
  min-height: 400px;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.template-card {
  border: 1px solid var(--td-border-level-1-color);
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
}

.template-card:hover {
  border-color: var(--td-brand-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.template-card--selected {
  border-color: var(--td-brand-color);
  background: var(--td-brand-color-light);
  box-shadow: 0 4px 12px rgba(0, 82, 217, 0.15);
}

.template-content {
  padding: 24px;
  text-align: center;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.template-content h5 {
  margin: 12px 0 8px;
  font-size: 16px;
  font-weight: 600;
}

.template-content p {
  margin: 0;
  color: var(--td-text-color-secondary);
  font-size: 14px;
}

.step-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid var(--td-border-level-1-color);
}

.progress-content {
  text-align: center;
}

.progress-text {
  margin: 16px 0;
  color: var(--td-text-color-primary);
}

.log-output {
  max-height: 200px;
  overflow-y: auto;
  background: var(--td-bg-color-code);
  border-radius: 4px;
  padding: 12px;
  margin-top: 16px;
  text-align: left;
}

.log-item {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: var(--td-text-color-secondary);
  margin-bottom: 4px;
}

// 路径选择器样式
.path-selector {
  .current-path {
    margin-bottom: 16px;
  }

  .quick-directories {
    margin-bottom: 16px;

    h5 {
      margin: 0 0 8px 0;
      font-size: 14px;
      font-weight: 500;
    }

    .directory-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  }

  .directory-browser {
    border: 1px solid var(--td-border-level-1-color);
    border-radius: 6px;
    min-height: 200px;
    max-height: 300px;
    overflow-y: auto;
    margin-bottom: 16px;

    .parent-nav {
      padding: 8px;
      border-bottom: 1px solid var(--td-border-level-1-color);
    }

    .subdirectories {
      padding: 8px;
    }

    .directory-item {
      display: flex;
      align-items: center;
      padding: 8px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: var(--td-bg-color-container-hover);
      }

      .directory-name {
        margin-left: 8px;
        font-size: 14px;
      }
    }

    .empty-directory {
      padding: 32px;
      text-align: center;
    }
  }

  .path-selector-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .write-warning {
      flex: 1;
      margin-left: 16px;
    }
  }
}
</style>