<template>
  <div class="create-project">
    <div class="page-header">
      <h1 class="page-title">{{ $t('create.title') }}</h1>
      <p class="page-subtitle">使用向导快速创建新项目</p>
    </div>

    <div class="create-form">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        size="large"
      >
        <!-- Basic Information -->
        <div class="form-section">
          <div class="section-title">
            <el-icon><Document /></el-icon>
            基本信息
          </div>
          <div class="section-content">
            <el-form-item label="项目名称" prop="name">
              <el-input
                v-model="form.name"
                placeholder="请输入项目名称"
                @blur="validateProjectName"
              />
            </el-form-item>
            
            <el-form-item label="项目描述" prop="description">
              <el-input
                v-model="form.description"
                type="textarea"
                :rows="3"
                placeholder="请输入项目描述"
              />
            </el-form-item>
            
            <div class="form-row">
              <el-form-item label="作者" prop="author">
                <el-input v-model="form.author" placeholder="请输入作者信息" />
              </el-form-item>
              
              <el-form-item label="版本" prop="version">
                <el-input v-model="form.version" placeholder="1.0.0" />
              </el-form-item>
              
              <el-form-item label="许可证" prop="license">
                <el-select v-model="form.license" placeholder="选择许可证">
                  <el-option label="MIT" value="MIT" />
                  <el-option label="Apache-2.0" value="Apache-2.0" />
                  <el-option label="GPL-3.0" value="GPL-3.0" />
                  <el-option label="BSD-3-Clause" value="BSD-3-Clause" />
                  <el-option label="ISC" value="ISC" />
                </el-select>
              </el-form-item>
            </div>
          </div>
        </div>

        <!-- Project Configuration -->
        <div class="form-section">
          <div class="section-title">
            <el-icon><Setting /></el-icon>
            项目配置
          </div>
          <div class="section-content">
            <div class="form-row">
              <el-form-item label="项目类型" prop="type">
                <el-select v-model="form.type" placeholder="选择项目类型" @change="onTypeChange">
                  <el-option
                    v-for="type in projectTypes"
                    :key="type.value"
                    :label="type.label"
                    :value="type.value"
                  >
                    <div class="option-content">
                      <span class="option-label">{{ type.label }}</span>
                      <span class="option-desc">{{ type.description }}</span>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>
              
              <el-form-item label="构建工具" prop="buildTool">
                <el-select v-model="form.buildTool" placeholder="选择构建工具">
                  <el-option
                    v-for="tool in buildTools"
                    :key="tool.value"
                    :label="tool.label"
                    :value="tool.value"
                    :disabled="!tool.compatible.includes(form.type)"
                  >
                    <div class="option-content">
                      <span class="option-label">{{ tool.label }}</span>
                      <span class="option-desc">{{ tool.description }}</span>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>
              
              <el-form-item label="包管理器" prop="packageManager">
                <el-select v-model="form.packageManager" placeholder="选择包管理器">
                  <el-option
                    v-for="pm in packageManagers"
                    :key="pm.value"
                    :label="pm.label"
                    :value="pm.value"
                  >
                    <div class="option-content">
                      <span class="option-label">{{ pm.label }}</span>
                      <span class="option-desc">{{ pm.description }}</span>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>
            </div>
          </div>
        </div>

        <!-- Features Selection -->
        <div class="form-section">
          <div class="section-title">
            <el-icon><Grid /></el-icon>
            特性选择
          </div>
          <div class="section-content">
            <div class="features-grid">
              <div
                v-for="category in featureCategories"
                :key="category.name"
                class="feature-category"
              >
                <h4 class="category-title">{{ category.label }}</h4>
                <div class="feature-list">
                  <div
                    v-for="feature in category.features"
                    :key="feature.value"
                    class="feature-item"
                    :class="{ disabled: !isFeatureCompatible(feature) }"
                  >
                    <el-checkbox
                      :model-value="form.features.includes(feature.value as any)"
                      @change="(checked: any) => toggleFeature(feature.value, checked)"
                      :disabled="!isFeatureCompatible(feature)"
                    >
                      <div class="feature-content">
                        <span class="feature-name">{{ feature.label }}</span>
                        <span class="feature-desc">{{ feature.description }}</span>
                      </div>
                    </el-checkbox>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <el-button size="large" @click="resetForm">重置</el-button>
          <el-button type="primary" size="large" :loading="creating" @click="createProject">
            <el-icon><Plus /></el-icon>
            创建项目
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useProjectsStore } from '@/stores/projects'
import { useSocketStore } from '@/stores/socket'
import { projectApi } from '@/api/projects'
import type { ProjectConfig, ProjectType, BuildTool, PackageManager, ProjectFeature } from '@/types'

const router = useRouter()
const projectsStore = useProjectsStore()
const socketStore = useSocketStore()

// Form reference
const formRef = ref<FormInstance>()
const creating = ref(false)

// Form data
const form = ref<ProjectConfig>({
  name: '',
  description: '',
  author: '',
  version: '1.0.0',
  license: 'MIT',
  type: 'vue3-project',
  buildTool: 'vite',
  packageManager: 'pnpm',
  features: []
})

// Form validation rules
const rules: FormRules = {
  name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { pattern: /^[a-z0-9-_]+$/, message: '项目名称只能包含小写字母、数字、连字符和下划线', trigger: 'blur' }
  ],
  author: [
    { required: true, message: '请输入作者信息', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择项目类型', trigger: 'change' }
  ],
  buildTool: [
    { required: true, message: '请选择构建工具', trigger: 'change' }
  ],
  packageManager: [
    { required: true, message: '请选择包管理器', trigger: 'change' }
  ]
}

// Project types
const projectTypes = [
  {
    value: 'vue3-project',
    label: 'Vue 3 项目',
    description: '基于 Vue 3 的现代前端项目'
  },
  {
    value: 'vue2-project',
    label: 'Vue 2 项目',
    description: '基于 Vue 2.7 的前端项目'
  },
  {
    value: 'react-project',
    label: 'React 项目',
    description: '基于 React 18 的前端项目'
  },
  {
    value: 'nodejs-api',
    label: 'Node.js API',
    description: '基于 Node.js 的后端 API 项目'
  },
  {
    value: 'vue3-component',
    label: 'Vue 3 组件库',
    description: 'Vue 3 组件库开发项目'
  }
]

// Build tools
const buildTools = [
  {
    value: 'vite',
    label: 'Vite',
    description: '快速的现代构建工具',
    compatible: ['vue3-project', 'vue2-project', 'react-project', 'vue3-component']
  },
  {
    value: 'webpack',
    label: 'Webpack',
    description: '功能强大的模块打包器',
    compatible: ['vue3-project', 'vue2-project', 'react-project']
  },
  {
    value: 'rollup',
    label: 'Rollup',
    description: '专为库开发优化的打包器',
    compatible: ['vue3-component']
  },
  {
    value: 'tsup',
    label: 'tsup',
    description: '基于 esbuild 的快速构建工具',
    compatible: ['nodejs-api']
  }
]

// Package managers
const packageManagers = [
  {
    value: 'pnpm',
    label: 'pnpm',
    description: '快速、节省磁盘空间的包管理器'
  },
  {
    value: 'npm',
    label: 'npm',
    description: 'Node.js 默认包管理器'
  },
  {
    value: 'yarn',
    label: 'Yarn',
    description: '快速、可靠、安全的依赖管理'
  }
]

// Feature categories
const featureCategories = [
  {
    name: 'language',
    label: '语言支持',
    features: [
      { value: 'typescript', label: 'TypeScript', description: '类型安全的 JavaScript', compatible: ['all'] }
    ]
  },
  {
    name: 'quality',
    label: '代码质量',
    features: [
      { value: 'eslint', label: 'ESLint', description: '代码检查工具', compatible: ['all'] },
      { value: 'prettier', label: 'Prettier', description: '代码格式化工具', compatible: ['all'] },
      { value: 'husky', label: 'Husky', description: 'Git 钩子管理', compatible: ['all'] },
      { value: 'commitlint', label: 'Commitlint', description: '提交信息规范', compatible: ['all'] }
    ]
  },
  {
    name: 'testing',
    label: '测试框架',
    features: [
      { value: 'vitest', label: 'Vitest', description: '快速的单元测试框架', compatible: ['vue3-project', 'react-project', 'vue3-component'] },
      { value: 'cypress', label: 'Cypress', description: 'E2E 测试框架', compatible: ['vue3-project', 'vue2-project', 'react-project'] },
      { value: 'playwright', label: 'Playwright', description: '现代 E2E 测试', compatible: ['vue3-project', 'react-project'] }
    ]
  },
  {
    name: 'styling',
    label: '样式方案',
    features: [
      { value: 'tailwindcss', label: 'Tailwind CSS', description: '原子化 CSS 框架', compatible: ['vue3-project', 'vue2-project', 'react-project'] },
      { value: 'sass', label: 'Sass', description: 'CSS 预处理器', compatible: ['vue3-project', 'vue2-project', 'react-project', 'vue3-component'] },
      { value: 'less', label: 'Less', description: 'CSS 预处理器', compatible: ['vue3-project', 'vue2-project'] }
    ]
  },
  {
    name: 'tools',
    label: '工具集成',
    features: [
      { value: 'docker', label: 'Docker', description: '容器化部署', compatible: ['all'] },
      { value: 'nginx', label: 'Nginx', description: 'Web 服务器配置', compatible: ['vue3-project', 'vue2-project', 'react-project'] },
      { value: 'github-actions', label: 'GitHub Actions', description: 'CI/CD 工作流', compatible: ['all'] }
    ]
  }
]

// Methods
const isFeatureCompatible = (feature: any) => {
  return feature.compatible.includes('all') || feature.compatible.includes(form.value.type)
}

const toggleFeature = (featureValue: string, checked: any) => {
  if (checked) {
    if (!form.value.features.includes(featureValue as any)) {
      form.value.features.push(featureValue as any)
    }
  } else {
    const index = form.value.features.indexOf(featureValue as any)
    if (index > -1) {
      form.value.features.splice(index, 1)
    }
  }
}

const onTypeChange = () => {
  // Update build tool based on project type
  const compatibleTools = buildTools.filter(tool => tool.compatible.includes(form.value.type))
  if (compatibleTools.length > 0 && !compatibleTools.find(tool => tool.value === form.value.buildTool)) {
    form.value.buildTool = compatibleTools[0].value as BuildTool
  }
  
  // Filter incompatible features
  form.value.features = form.value.features.filter(feature => {
    const featureConfig = featureCategories
      .flatMap(cat => cat.features)
      .find(f => f.value === feature)
    return featureConfig ? isFeatureCompatible(featureConfig) : false
  })
}

const validateProjectName = async () => {
  if (!form.value.name) return
  
  try {
    const response = await projectApi.validateName(form.value.name)
    const data = response.data as any
    if (!data.valid) {
      ElMessage.warning(data.message || '项目名称不可用')
    }
  } catch (error) {
    console.error('Validate project name error:', error)
  }
}

const resetForm = () => {
  formRef.value?.resetFields()
  form.value = {
    name: '',
    description: '',
    author: '',
    version: '1.0.0',
    license: 'MIT',
    type: 'vue3-project',
    buildTool: 'vite',
    packageManager: 'pnpm',
    features: []
  }
}

const createProject = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    creating.value = true
    
    const options = {
      targetDir: `./${form.value.name}`,
      config: form.value,
      install: true
    }
    
    const result = await projectsStore.createProject(options)

    ElMessage.success('项目创建成功！')
    router.push('/projects')
    
  } catch (error) {
    console.error('Create project error:', error)
    ElMessage.error('项目创建失败')
  } finally {
    creating.value = false
  }
}

// Initialize form with user info
onMounted(() => {
  // Get user info from localStorage or API
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  if (userInfo.name) {
    form.value.author = userInfo.name
  }
})
</script>

<style lang="scss" scoped>
.create-project {
  max-width: 1200px;
  margin: 0 auto;

  .page-header {
    text-align: center;
    margin-bottom: 40px;

    .page-title {
      font-size: 32px;
      font-weight: bold;
      color: var(--el-text-color-primary);
      margin-bottom: 8px;
    }

    .page-subtitle {
      font-size: 16px;
      color: var(--el-text-color-secondary);
    }
  }

  .create-form {
    background: var(--el-bg-color);
    border-radius: 12px;
    padding: 32px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

    .form-section {
      margin-bottom: 32px;

      .section-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin-bottom: 20px;
        display: flex;
        align-items: center;

        .el-icon {
          margin-right: 8px;
          color: var(--el-color-primary);
        }
      }

      .section-content {
        padding-left: 32px;

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }
      }
    }

    .option-content {
      display: flex;
      flex-direction: column;

      .option-label {
        font-weight: 500;
        color: var(--el-text-color-primary);
      }

      .option-desc {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        margin-top: 2px;
      }
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;

      .feature-category {
        .category-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--el-text-color-primary);
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 2px solid var(--el-color-primary-light-8);
        }

        .feature-list {
          .feature-item {
            margin-bottom: 12px;

            &.disabled {
              opacity: 0.5;
            }

            .feature-content {
              display: flex;
              flex-direction: column;
              margin-left: 8px;

              .feature-name {
                font-weight: 500;
                color: var(--el-text-color-primary);
              }

              .feature-desc {
                font-size: 12px;
                color: var(--el-text-color-secondary);
                margin-top: 2px;
              }
            }
          }
        }
      }
    }

    .form-actions {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-top: 40px;
      padding-top: 24px;
      border-top: 1px solid var(--el-border-color-lighter);
    }
  }
}

@media (max-width: 768px) {
  .create-project {
    .create-form {
      padding: 20px;

      .section-content {
        padding-left: 0;

        .form-row {
          grid-template-columns: 1fr;
        }
      }

      .features-grid {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>
