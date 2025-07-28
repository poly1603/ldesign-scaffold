<template>
  <div class="create-project">
    <t-card title="创建新项目" :bordered="false">
      <t-steps v-model:current="currentStep" :options="steps" />
      
      <div class="step-content">
        <!-- 步骤1: 选择模板 -->
        <div v-if="currentStep === 0" class="template-selection">
          <h4>选择项目模板</h4>
          <t-radio-group v-model="formData.template" class="template-grid">
            <t-radio-button
              v-for="template in templates"
              :key="template.value"
              :value="template.value"
              class="template-card"
            >
              <div class="template-content">
                <component :is="template.icon" size="32" />
                <h5>{{ template.label }}</h5>
                <p>{{ template.description }}</p>
              </div>
            </t-radio-button>
          </t-radio-group>
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
                  <t-button theme="default" variant="text" @click="selectPath">
                    <folder-open-icon />
                  </t-button>
                </template>
              </t-input>
            </t-form-item>
            
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
import { ref, computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import {
  CodeIcon,
  ServerIcon,
  FolderOpenIcon,
  LayersIcon,
  AppIcon,
} from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { createProjectApi } from '../api/project';

const router = useRouter();

// 步骤配置
const steps = [
  { title: '选择模板', content: '选择项目模板类型' },
  { title: '项目配置', content: '配置项目基本信息' },
  { title: '确认创建', content: '确认项目信息并创建' },
];

const currentStep = ref(0);

// 模板配置
const templates = [
  {
    value: 'vue3',
    label: 'Vue 3 项目',
    description: '基于 Vue 3 + Vite 的现代前端项目',
    icon: AppIcon,
  },
  {
    value: 'vue2',
    label: 'Vue 2 项目',
    description: '基于 Vue 2 的传统前端项目',
    icon: AppIcon,
  },
  {
    value: 'react',
    label: 'React 项目',
    description: '基于 React + Vite 的现代前端项目',
    icon: LayersIcon,
  },
  {
    value: 'typescript',
    label: 'TypeScript 库',
    description: '纯 TypeScript 工具库项目',
    icon: CodeIcon,
  },
  {
    value: 'less',
    label: 'Less 样式库',
    description: '基于 Less 的样式库项目',
    icon: CodeIcon,
  },
  {
    value: 'nodejs',
    label: 'Node.js 项目',
    description: '基于 Node.js 的后端服务项目',
    icon: ServerIcon,
  },
];

// 表单数据
const formData = reactive({
  template: 'vue3',
  name: '',
  description: '',
  path: '',
  packageManager: 'pnpm',
  initGit: true,
});

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
  const template = templates.find(t => t.value === formData.template);
  return [
    { label: '项目模板', value: template?.label },
    { label: '项目名称', value: formData.name },
    { label: '项目描述', value: formData.description || '无' },
    { label: '项目路径', value: formData.path },
    { label: '包管理器', value: formData.packageManager },
    { label: 'Git 初始化', value: formData.initGit ? '是' : '否' },
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

const selectPath = () => {
  // 这里应该调用系统文件选择器
  // 暂时使用输入框
  const path = prompt('请输入项目路径:');
  if (path) {
    formData.path = path;
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
    
  } catch (error) {
    console.error('创建项目失败:', error);
    MessagePlugin.error('创建项目失败，请重试');
    showProgress.value = false;
  } finally {
    creating.value = false;
  }
};
</script>

<style scoped>
.create-project {
  max-width: 800px;
  margin: 0 auto;
}

.step-content {
  margin: 32px 0;
  min-height: 400px;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.template-card {
  border: 1px solid var(--td-border-level-1-color);
  border-radius: 8px;
  padding: 0;
  transition: all 0.2s;
}

.template-card:hover {
  border-color: var(--td-brand-color);
  box-shadow: 0 2px 8px rgba(0, 82, 217, 0.1);
}

.template-content {
  padding: 24px;
  text-align: center;
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
</style>