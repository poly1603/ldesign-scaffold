<template>
  <div class="project-wizard">
    <!-- Header -->
    <div class="wizard-header">
      <div class="header-left">
        <div class="logo">
          <el-icon><Rocket /></el-icon>
          <span>LDesign Scaffold</span>
        </div>
      </div>
      <div class="header-right">
        <el-button text @click="exitWizard">
          <el-icon><Close /></el-icon>
          退出向导
        </el-button>
      </div>
    </div>

    <!-- Progress -->
    <div class="wizard-progress">
      <el-steps :active="currentStep" align-center>
        <el-step title="基本信息" />
        <el-step title="项目配置" />
        <el-step title="特性选择" />
        <el-step title="预览确认" />
        <el-step title="创建完成" />
      </el-steps>
    </div>

    <!-- Content -->
    <div class="wizard-content">
      <!-- Step 1: Basic Info -->
      <div v-show="currentStep === 0" class="wizard-step">
        <div class="step-header">
          <h2 class="step-title">基本信息</h2>
          <p class="step-description">填写项目的基本信息</p>
        </div>
        <div class="step-body">
          <el-form :model="formData" label-width="120px" size="large">
            <el-form-item label="项目名称" required>
              <el-input
                v-model="formData.name"
                placeholder="请输入项目名称"
                style="width: 400px"
              />
            </el-form-item>
            <el-form-item label="项目描述">
              <el-input
                v-model="formData.description"
                type="textarea"
                :rows="3"
                placeholder="请输入项目描述"
                style="width: 400px"
              />
            </el-form-item>
            <el-form-item label="作者">
              <el-input
                v-model="formData.author"
                placeholder="请输入作者信息"
                style="width: 400px"
              />
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- Step 2: Project Config -->
      <div v-show="currentStep === 1" class="wizard-step">
        <div class="step-header">
          <h2 class="step-title">项目配置</h2>
          <p class="step-description">选择项目类型和构建工具</p>
        </div>
        <div class="step-body">
          <div class="config-grid">
            <div class="config-section">
              <h3 class="section-title">项目类型</h3>
              <div class="type-options">
                <div
                  v-for="type in projectTypes"
                  :key="type.value"
                  class="type-option"
                  :class="{ active: formData.type === type.value }"
                  @click="formData.type = type.value as any"
                >
                  <div class="option-icon">
                    <el-icon>
                      <component :is="type.icon" />
                    </el-icon>
                  </div>
                  <div class="option-content">
                    <div class="option-title">{{ type.label }}</div>
                    <div class="option-desc">{{ type.description }}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="config-section">
              <h3 class="section-title">构建工具</h3>
              <div class="tool-options">
                <div
                  v-for="tool in availableBuildTools"
                  :key="tool.value"
                  class="tool-option"
                  :class="{ active: formData.buildTool === tool.value }"
                  @click="formData.buildTool = tool.value as any"
                >
                  <div class="option-title">{{ tool.label }}</div>
                  <div class="option-desc">{{ tool.description }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: Features -->
      <div v-show="currentStep === 2" class="wizard-step">
        <div class="step-header">
          <h2 class="step-title">特性选择</h2>
          <p class="step-description">选择项目需要的特性和工具</p>
        </div>
        <div class="step-body">
          <div class="features-grid">
            <div
              v-for="category in featureCategories"
              :key="category.name"
              class="feature-category"
            >
              <h3 class="category-title">{{ category.label }}</h3>
              <div class="feature-list">
                <div
                  v-for="feature in category.features"
                  :key="feature.value"
                  class="feature-item"
                  :class="{ 
                    active: formData.features.includes(feature.value as any),
                    disabled: !isFeatureCompatible(feature)
                  }"
                  @click="toggleFeature(feature.value as any)"
                >
                  <div class="feature-icon">
                    <el-icon><Check v-if="formData.features.includes(feature.value as any)" /></el-icon>
                  </div>
                  <div class="feature-content">
                    <div class="feature-name">{{ feature.label }}</div>
                    <div class="feature-desc">{{ feature.description }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 4: Preview -->
      <div v-show="currentStep === 3" class="wizard-step">
        <div class="step-header">
          <h2 class="step-title">预览确认</h2>
          <p class="step-description">确认项目配置信息</p>
        </div>
        <div class="step-body">
          <div class="preview-content">
            <div class="preview-left">
              <div class="preview-card">
                <h3 class="card-title">项目信息</h3>
                <div class="info-list">
                  <div class="info-item">
                    <span class="info-label">项目名称：</span>
                    <span class="info-value">{{ formData.name }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">项目类型：</span>
                    <span class="info-value">{{ getTypeLabel(formData.type) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">构建工具：</span>
                    <span class="info-value">{{ formData.buildTool }}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">包管理器：</span>
                    <span class="info-value">{{ formData.packageManager }}</span>
                  </div>
                </div>
              </div>
              
              <div class="preview-card">
                <h3 class="card-title">选择的特性</h3>
                <div class="features-preview">
                  <el-tag
                    v-for="feature in formData.features"
                    :key="feature"
                    class="feature-tag"
                  >
                    {{ getFeatureLabel(feature) }}
                  </el-tag>
                </div>
              </div>
            </div>
            
            <div class="preview-right">
              <div class="preview-card">
                <h3 class="card-title">项目结构预览</h3>
                <div class="file-tree">
                  <div class="file-item">
                    <el-icon><Folder /></el-icon>
                    <span>{{ formData.name }}/</span>
                  </div>
                  <div class="file-item indent">
                    <el-icon><Document /></el-icon>
                    <span>package.json</span>
                  </div>
                  <div class="file-item indent">
                    <el-icon><Document /></el-icon>
                    <span>README.md</span>
                  </div>
                  <div class="file-item indent">
                    <el-icon><Folder /></el-icon>
                    <span>src/</span>
                  </div>
                  <div class="file-item indent-2">
                    <el-icon><Document /></el-icon>
                    <span>main.{{ formData.features.includes('typescript') ? 'ts' : 'js' }}</span>
                  </div>
                  <div class="file-item indent-2">
                    <el-icon><Document /></el-icon>
                    <span>App.vue</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 5: Complete -->
      <div v-show="currentStep === 4" class="wizard-step">
        <div class="step-header">
          <h2 class="step-title">创建完成</h2>
          <p class="step-description">项目创建成功！</p>
        </div>
        <div class="step-body">
          <div class="complete-content">
            <div class="success-icon">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <h3 class="success-title">🎉 项目创建成功！</h3>
            <p class="success-desc">项目 "{{ formData.name }}" 已成功创建</p>
            
            <div class="next-steps">
              <h4>接下来你可以：</h4>
              <ul>
                <li>在编辑器中打开项目</li>
                <li>安装项目依赖</li>
                <li>启动开发服务器</li>
                <li>开始编写代码</li>
              </ul>
            </div>
            
            <div class="complete-actions">
              <el-button type="primary" size="large" @click="openProject">
                <el-icon><FolderOpened /></el-icon>
                打开项目
              </el-button>
              <el-button size="large" @click="createAnother">
                <el-icon><Plus /></el-icon>
                创建另一个项目
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="wizard-actions">
      <div class="actions-left">
        <el-button v-if="currentStep > 0" @click="prevStep">
          <el-icon><ArrowLeft /></el-icon>
          上一步
        </el-button>
      </div>
      <div class="actions-right">
        <el-button v-if="currentStep < 3" type="primary" @click="nextStep">
          下一步
          <el-icon><ArrowRight /></el-icon>
        </el-button>
        <el-button
          v-else-if="currentStep === 3"
          type="primary"
          :loading="creating"
          @click="createProject"
        >
          <el-icon><Plus /></el-icon>
          创建项目
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useProjectsStore } from '@/stores/projects'
import type { ProjectConfig, ProjectType, BuildTool, PackageManager, ProjectFeature } from '@/types'

const router = useRouter()
const projectsStore = useProjectsStore()

// State
const currentStep = ref(0)
const creating = ref(false)

const formData = ref<ProjectConfig>({
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

// Project types with icons
const projectTypes = [
  {
    value: 'vue3-project',
    label: 'Vue 3 项目',
    description: '基于 Vue 3 的现代前端项目',
    icon: 'ElementPlus'
  },
  {
    value: 'vue2-project',
    label: 'Vue 2 项目',
    description: '基于 Vue 2.7 的前端项目',
    icon: 'ElementPlus'
  },
  {
    value: 'react-project',
    label: 'React 项目',
    description: '基于 React 18 的前端项目',
    icon: 'Refresh'
  },
  {
    value: 'nodejs-api',
    label: 'Node.js API',
    description: '基于 Node.js 的后端 API 项目',
    icon: 'Service'
  }
]

// Build tools
const buildTools = [
  {
    value: 'vite',
    label: 'Vite',
    description: '快速的现代构建工具',
    compatible: ['vue3-project', 'vue2-project', 'react-project']
  },
  {
    value: 'webpack',
    label: 'Webpack',
    description: '功能强大的模块打包器',
    compatible: ['vue3-project', 'vue2-project', 'react-project']
  },
  {
    value: 'tsup',
    label: 'tsup',
    description: '基于 esbuild 的快速构建工具',
    compatible: ['nodejs-api']
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
      { value: 'prettier', label: 'Prettier', description: '代码格式化工具', compatible: ['all'] }
    ]
  },
  {
    name: 'testing',
    label: '测试框架',
    features: [
      { value: 'vitest', label: 'Vitest', description: '快速的单元测试框架', compatible: ['vue3-project', 'react-project'] }
    ]
  }
]

// Computed
const availableBuildTools = computed(() => {
  return buildTools.filter(tool => tool.compatible.includes(formData.value.type))
})

// Methods
const isFeatureCompatible = (feature: any) => {
  return feature.compatible.includes('all') || feature.compatible.includes(formData.value.type)
}

const toggleFeature = (feature: ProjectFeature) => {
  const featureConfig = featureCategories
    .flatMap(cat => cat.features)
    .find(f => f.value === feature)

  if (!featureConfig || !isFeatureCompatible(featureConfig)) return

  const index = formData.value.features.indexOf(feature)
  if (index > -1) {
    formData.value.features.splice(index, 1)
  } else {
    formData.value.features.push(feature)
  }
}

const getTypeLabel = (type: ProjectType) => {
  return projectTypes.find(t => t.value === type)?.label || type
}

const getFeatureLabel = (feature: ProjectFeature) => {
  return featureCategories
    .flatMap(cat => cat.features)
    .find(f => f.value === feature)?.label || feature
}

const nextStep = () => {
  if (currentStep.value < 4) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const createProject = async () => {
  creating.value = true
  
  try {
    const options = {
      targetDir: `./${formData.value.name}`,
      config: formData.value,
      install: true
    }
    
    await projectsStore.createProject(options)
    currentStep.value = 4
    
  } catch (error) {
    ElMessage.error('项目创建失败')
  } finally {
    creating.value = false
  }
}

const openProject = () => {
  router.push('/projects')
}

const createAnother = () => {
  // Reset form and go to first step
  currentStep.value = 0
  formData.value = {
    name: '',
    description: '',
    author: formData.value.author, // Keep author
    version: '1.0.0',
    license: 'MIT',
    type: 'vue3-project',
    buildTool: 'vite',
    packageManager: 'pnpm',
    features: []
  }
}

const exitWizard = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要退出项目创建向导吗？',
      '退出向导',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    router.push('/')
  } catch (error) {
    // User cancelled
  }
}
</script>

<style lang="scss" scoped>
.project-wizard {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;

  .wizard-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 40px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);

    .header-left {
      .logo {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 20px;
        font-weight: bold;
        color: white;

        .el-icon {
          font-size: 24px;
        }
      }
    }

    .header-right {
      .el-button {
        color: white;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      }
    }
  }

  .wizard-progress {
    padding: 40px;

    :deep(.el-steps) {
      .el-step__title {
        color: rgba(255, 255, 255, 0.8);

        &.is-process {
          color: white;
          font-weight: bold;
        }
      }

      .el-step__line {
        background: rgba(255, 255, 255, 0.3);
      }

      .el-step__icon {
        &.is-text {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.3);
          color: rgba(255, 255, 255, 0.8);
        }

        &.is-process {
          background: white;
          border-color: white;
          color: var(--el-color-primary);
        }

        &.is-finish {
          background: rgba(255, 255, 255, 0.8);
          border-color: rgba(255, 255, 255, 0.8);
          color: var(--el-color-primary);
        }
      }
    }
  }

  .wizard-content {
    flex: 1;
    padding: 0 40px;
    display: flex;
    align-items: center;
    justify-content: center;

    .wizard-step {
      width: 100%;
      max-width: 1000px;
      background: white;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);

      .step-header {
        text-align: center;
        margin-bottom: 40px;

        .step-title {
          font-size: 28px;
          font-weight: bold;
          color: var(--el-text-color-primary);
          margin-bottom: 8px;
        }

        .step-description {
          font-size: 16px;
          color: var(--el-text-color-secondary);
        }
      }

      .step-body {
        .config-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;

          .config-section {
            .section-title {
              font-size: 18px;
              font-weight: 600;
              color: var(--el-text-color-primary);
              margin-bottom: 20px;
            }

            .type-options {
              display: grid;
              gap: 16px;

              .type-option {
                display: flex;
                align-items: center;
                padding: 20px;
                border: 2px solid var(--el-border-color-light);
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.3s ease;

                &:hover {
                  border-color: var(--el-color-primary-light-5);
                  background: var(--el-color-primary-light-9);
                }

                &.active {
                  border-color: var(--el-color-primary);
                  background: var(--el-color-primary-light-9);
                }

                .option-icon {
                  width: 48px;
                  height: 48px;
                  border-radius: 12px;
                  background: var(--el-color-primary-light-8);
                  color: var(--el-color-primary);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 24px;
                  margin-right: 16px;
                }

                .option-content {
                  .option-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--el-text-color-primary);
                    margin-bottom: 4px;
                  }

                  .option-desc {
                    font-size: 14px;
                    color: var(--el-text-color-secondary);
                  }
                }
              }
            }

            .tool-options {
              display: grid;
              gap: 12px;

              .tool-option {
                padding: 16px;
                border: 2px solid var(--el-border-color-light);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;

                &:hover {
                  border-color: var(--el-color-primary-light-5);
                  background: var(--el-color-primary-light-9);
                }

                &.active {
                  border-color: var(--el-color-primary);
                  background: var(--el-color-primary-light-9);
                }

                .option-title {
                  font-weight: 600;
                  color: var(--el-text-color-primary);
                  margin-bottom: 4px;
                }

                .option-desc {
                  font-size: 12px;
                  color: var(--el-text-color-secondary);
                }
              }
            }
          }
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 32px;

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
                display: flex;
                align-items: center;
                padding: 16px;
                border: 2px solid var(--el-border-color-light);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-bottom: 12px;

                &:hover:not(.disabled) {
                  border-color: var(--el-color-primary-light-5);
                  background: var(--el-color-primary-light-9);
                }

                &.active {
                  border-color: var(--el-color-primary);
                  background: var(--el-color-primary-light-9);
                }

                &.disabled {
                  opacity: 0.5;
                  cursor: not-allowed;
                }

                .feature-icon {
                  width: 24px;
                  height: 24px;
                  border: 2px solid var(--el-border-color);
                  border-radius: 4px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  margin-right: 12px;

                  .el-icon {
                    color: var(--el-color-success);
                  }
                }

                .feature-content {
                  .feature-name {
                    font-weight: 500;
                    color: var(--el-text-color-primary);
                    margin-bottom: 4px;
                  }

                  .feature-desc {
                    font-size: 12px;
                    color: var(--el-text-color-secondary);
                  }
                }
              }
            }
          }
        }

        .preview-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;

          .preview-card {
            background: var(--el-fill-color-lighter);
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;

            .card-title {
              font-size: 16px;
              font-weight: 600;
              color: var(--el-text-color-primary);
              margin-bottom: 16px;
            }

            .info-list {
              .info-item {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid var(--el-border-color-lighter);

                &:last-child {
                  border-bottom: none;
                }

                .info-label {
                  color: var(--el-text-color-secondary);
                }

                .info-value {
                  font-weight: 500;
                  color: var(--el-text-color-primary);
                }
              }
            }

            .features-preview {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;

              .feature-tag {
                margin: 0;
              }
            }

            .file-tree {
              font-family: monospace;

              .file-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 4px 0;
                color: var(--el-text-color-primary);

                &.indent {
                  padding-left: 20px;
                }

                &.indent-2 {
                  padding-left: 40px;
                }

                .el-icon {
                  color: var(--el-color-primary);
                }
              }
            }
          }
        }

        .complete-content {
          text-align: center;

          .success-icon {
            font-size: 80px;
            color: var(--el-color-success);
            margin-bottom: 20px;
          }

          .success-title {
            font-size: 24px;
            font-weight: bold;
            color: var(--el-text-color-primary);
            margin-bottom: 8px;
          }

          .success-desc {
            font-size: 16px;
            color: var(--el-text-color-secondary);
            margin-bottom: 32px;
          }

          .next-steps {
            text-align: left;
            max-width: 400px;
            margin: 0 auto 32px;

            h4 {
              font-size: 16px;
              font-weight: 600;
              color: var(--el-text-color-primary);
              margin-bottom: 12px;
            }

            ul {
              list-style: none;
              padding: 0;

              li {
                padding: 4px 0;
                color: var(--el-text-color-regular);

                &::before {
                  content: '✓';
                  color: var(--el-color-success);
                  font-weight: bold;
                  margin-right: 8px;
                }
              }
            }
          }

          .complete-actions {
            display: flex;
            gap: 16px;
            justify-content: center;
          }
        }
      }
    }
  }

  .wizard-actions {
    display: flex;
    justify-content: space-between;
    padding: 20px 40px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);

    .actions-left,
    .actions-right {
      .el-button {
        color: white;
        border-color: rgba(255, 255, 255, 0.3);

        &:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.5);
        }

        &.el-button--primary {
          background: white;
          color: var(--el-color-primary);
          border-color: white;

          &:hover {
            background: rgba(255, 255, 255, 0.9);
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .project-wizard {
    .wizard-header,
    .wizard-actions {
      padding: 16px 20px;
    }

    .wizard-progress {
      padding: 20px;
    }

    .wizard-content {
      padding: 0 20px;

      .wizard-step {
        padding: 24px;

        .step-body {
          .config-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .features-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .preview-content {
            grid-template-columns: 1fr;
            gap: 20px;
          }
        }
      }
    }
  }
}
</style>
