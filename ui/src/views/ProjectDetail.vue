<template>
  <div class="project-detail">
    <div v-if="loading" class="loading-container">
      <el-loading />
      <span class="loading-text">加载项目信息中...</span>
    </div>
    
    <div v-else-if="project" class="project-content">
      <!-- Project Header -->
      <div class="project-header">
        <div class="header-left">
          <div class="project-icon">
            <el-icon>
              <component :is="getProjectIcon(project.type)" />
            </el-icon>
          </div>
          <div class="project-info">
            <h1 class="project-name">{{ project.name }}</h1>
            <p class="project-description">{{ project.description || '暂无描述' }}</p>
            <div class="project-meta">
              <span class="project-type">{{ $t(`types.${project.type}`) }}</span>
              <span class="project-author">{{ project.author }}</span>
              <span class="project-version">v{{ project.version }}</span>
            </div>
          </div>
        </div>
        <div class="header-right">
          <el-button-group>
            <el-button type="primary" @click="runProject('dev')">
              <el-icon><VideoPlay /></el-icon>
              启动开发
            </el-button>
            <el-button @click="runProject('build')">
              <el-icon><Finished /></el-icon>
              构建项目
            </el-button>
            <el-button @click="openInEditor">
              <el-icon><Edit /></el-icon>
              打开编辑器
            </el-button>
          </el-button-group>
        </div>
      </div>

      <!-- Project Tabs -->
      <div class="project-tabs">
        <el-tabs v-model="activeTab">
          <!-- Overview -->
          <el-tab-pane label="概览" name="overview">
            <div class="overview-content">
              <div class="overview-left">
                <!-- Project Stats -->
                <div class="card">
                  <div class="card-header">
                    <h3 class="card-title">项目统计</h3>
                  </div>
                  <div class="card-body">
                    <div class="stats-grid">
                      <div class="stat-item">
                        <div class="stat-value">{{ project.features.length }}</div>
                        <div class="stat-label">特性数量</div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-value">{{ formatTime(project.createdAt) }}</div>
                        <div class="stat-label">创建时间</div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-value">{{ formatTime(project.updatedAt) }}</div>
                        <div class="stat-label">更新时间</div>
                      </div>
                      <div class="stat-item">
                        <div class="stat-value">{{ project.buildTool }}</div>
                        <div class="stat-label">构建工具</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Project Features -->
                <div class="card">
                  <div class="card-header">
                    <h3 class="card-title">项目特性</h3>
                  </div>
                  <div class="card-body">
                    <div class="features-list">
                      <el-tag
                        v-for="feature in project.features"
                        :key="feature"
                        class="feature-tag"
                        type="info"
                      >
                        {{ $t(`features.${feature}`) }}
                      </el-tag>
                    </div>
                  </div>
                </div>
              </div>

              <div class="overview-right">
                <!-- Quick Actions -->
                <div class="card">
                  <div class="card-header">
                    <h3 class="card-title">快速操作</h3>
                  </div>
                  <div class="card-body">
                    <div class="quick-actions">
                      <div class="action-item" @click="runProject('dev')">
                        <el-icon><VideoPlay /></el-icon>
                        <span>启动开发服务器</span>
                      </div>
                      <div class="action-item" @click="runProject('build')">
                        <el-icon><Finished /></el-icon>
                        <span>构建生产版本</span>
                      </div>
                      <div class="action-item" @click="runProject('test')">
                        <el-icon><CircleCheck /></el-icon>
                        <span>运行测试</span>
                      </div>
                      <div class="action-item" @click="runProject('lint')">
                        <el-icon><DocumentChecked /></el-icon>
                        <span>代码检查</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Project Path -->
                <div class="card">
                  <div class="card-header">
                    <h3 class="card-title">项目路径</h3>
                  </div>
                  <div class="card-body">
                    <div class="project-path">
                      <el-input
                        :value="project.path"
                        readonly
                        size="small"
                      >
                        <template #append>
                          <el-button @click="copyPath">
                            <el-icon><CopyDocument /></el-icon>
                          </el-button>
                        </template>
                      </el-input>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- Scripts -->
          <el-tab-pane label="脚本" name="scripts">
            <div class="scripts-content">
              <div class="card">
                <div class="card-header">
                  <h3 class="card-title">可用脚本</h3>
                  <el-button size="small" @click="refreshScripts">
                    <el-icon><Refresh /></el-icon>
                    刷新
                  </el-button>
                </div>
                <div class="card-body">
                  <div v-if="scripts && Object.keys(scripts).length > 0" class="scripts-list">
                    <div
                      v-for="(command, name) in scripts"
                      :key="name"
                      class="script-item"
                    >
                      <div class="script-info">
                        <div class="script-name">{{ name }}</div>
                        <div class="script-command">{{ command }}</div>
                      </div>
                      <div class="script-actions">
                        <el-button size="small" @click="runScript(name)">
                          <el-icon><VideoPlay /></el-icon>
                          运行
                        </el-button>
                      </div>
                    </div>
                  </div>
                  <div v-else class="empty-state">
                    <div class="empty-icon">📜</div>
                    <div class="empty-title">暂无可用脚本</div>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- Dependencies -->
          <el-tab-pane label="依赖" name="dependencies">
            <div class="dependencies-content">
              <div class="card">
                <div class="card-header">
                  <h3 class="card-title">项目依赖</h3>
                  <el-button size="small" @click="refreshDependencies">
                    <el-icon><Refresh /></el-icon>
                    刷新
                  </el-button>
                </div>
                <div class="card-body">
                  <el-tabs type="border-card">
                    <el-tab-pane label="生产依赖" name="dependencies">
                      <div v-if="dependencies" class="deps-list">
                        <div
                          v-for="(version, name) in dependencies"
                          :key="name"
                          class="dep-item"
                        >
                          <span class="dep-name">{{ name }}</span>
                          <span class="dep-version">{{ version }}</span>
                        </div>
                      </div>
                    </el-tab-pane>
                    <el-tab-pane label="开发依赖" name="devDependencies">
                      <div v-if="devDependencies" class="deps-list">
                        <div
                          v-for="(version, name) in devDependencies"
                          :key="name"
                          class="dep-item"
                        >
                          <span class="dep-name">{{ name }}</span>
                          <span class="dep-version">{{ version }}</span>
                        </div>
                      </div>
                    </el-tab-pane>
                  </el-tabs>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
    
    <div v-else class="error-state">
      <div class="error-icon">❌</div>
      <div class="error-title">项目不存在</div>
      <div class="error-description">请检查项目 ID 是否正确</div>
      <el-button @click="$router.push('/projects')">返回项目列表</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useProjectsStore } from '@/stores/projects'
import type { Project } from '@/types'

const route = useRoute()
const projectsStore = useProjectsStore()

// State
const activeTab = ref('overview')
const scripts = ref<Record<string, string> | null>(null)
const dependencies = ref<Record<string, string> | null>(null)
const devDependencies = ref<Record<string, string> | null>(null)

// Computed
const loading = computed(() => projectsStore.loading)
const project = computed(() => projectsStore.currentProject)

// Methods
const getProjectIcon = (type: string) => {
  const icons = {
    'vue3-project': 'ElementPlus',
    'vue2-project': 'ElementPlus',
    'react-project': 'Refresh',
    'nodejs-api': 'Service',
    'vue3-component': 'Grid'
  }
  return icons[type] || 'Folder'
}

const formatTime = (time: string) => {
  return new Date(time).toLocaleDateString()
}

const runProject = async (script: string) => {
  if (!project.value) return
  
  try {
    await projectsStore.runProjectScript(project.value.id, script)
    ElMessage.success(`脚本 ${script} 执行成功`)
  } catch (error) {
    ElMessage.error(`脚本 ${script} 执行失败`)
  }
}

const runScript = async (scriptName: string) => {
  await runProject(scriptName)
}

const openInEditor = () => {
  if (project.value) {
    window.open(`vscode://file/${project.value.path}`)
  }
}

const copyPath = () => {
  if (project.value) {
    navigator.clipboard.writeText(project.value.path)
    ElMessage.success('路径已复制到剪贴板')
  }
}

const refreshScripts = async () => {
  if (!project.value) return
  
  try {
    // Mock scripts data
    scripts.value = {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
      test: 'vitest',
      lint: 'eslint . --ext .vue,.js,.ts'
    }
    ElMessage.success('脚本列表已刷新')
  } catch (error) {
    ElMessage.error('刷新脚本列表失败')
  }
}

const refreshDependencies = async () => {
  if (!project.value) return
  
  try {
    // Mock dependencies data
    dependencies.value = {
      vue: '^3.4.0',
      'vue-router': '^4.2.0',
      pinia: '^2.1.0'
    }
    
    devDependencies.value = {
      '@vitejs/plugin-vue': '^5.0.0',
      typescript: '^5.3.0',
      vite: '^5.0.0'
    }
    
    ElMessage.success('依赖列表已刷新')
  } catch (error) {
    ElMessage.error('刷新依赖列表失败')
  }
}

// Lifecycle
onMounted(async () => {
  const projectId = route.params.id as string
  if (projectId) {
    await projectsStore.fetchProject(projectId)
    await refreshScripts()
    await refreshDependencies()
  }
})
</script>

<style lang="scss" scoped>
.project-detail {
  .loading-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 300px;

    .loading-text {
      margin-left: 12px;
      color: var(--el-text-color-secondary);
    }
  }

  .error-state {
    text-align: center;
    padding: 60px 20px;

    .error-icon {
      font-size: 64px;
      margin-bottom: 16px;
    }

    .error-title {
      font-size: 18px;
      font-weight: 500;
      color: var(--el-text-color-primary);
      margin-bottom: 8px;
    }

    .error-description {
      font-size: 14px;
      color: var(--el-text-color-secondary);
      margin-bottom: 24px;
    }
  }

  .project-content {
    .project-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 32px;
      padding: 24px;
      background: var(--el-bg-color);
      border-radius: 12px;

      .header-left {
        display: flex;
        align-items: center;

        .project-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          background: var(--el-color-primary-light-9);
          color: var(--el-color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          margin-right: 20px;
        }

        .project-info {
          .project-name {
            font-size: 28px;
            font-weight: bold;
            color: var(--el-text-color-primary);
            margin-bottom: 8px;
          }

          .project-description {
            font-size: 16px;
            color: var(--el-text-color-secondary);
            margin-bottom: 12px;
          }

          .project-meta {
            display: flex;
            align-items: center;
            gap: 16px;
            font-size: 14px;

            span {
              padding: 4px 8px;
              background: var(--el-fill-color-light);
              border-radius: 4px;
              color: var(--el-text-color-regular);
            }
          }
        }
      }
    }

    .project-tabs {
      .overview-content {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 24px;

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;

          .stat-item {
            text-align: center;
            padding: 16px;
            background: var(--el-fill-color-lighter);
            border-radius: 8px;

            .stat-value {
              font-size: 20px;
              font-weight: bold;
              color: var(--el-color-primary);
              margin-bottom: 4px;
            }

            .stat-label {
              font-size: 12px;
              color: var(--el-text-color-secondary);
            }
          }
        }

        .features-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          .feature-tag {
            margin: 0;
          }
        }

        .quick-actions {
          .action-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-bottom: 8px;

            &:hover {
              background: var(--el-fill-color-light);
            }

            .el-icon {
              color: var(--el-color-primary);
            }

            span {
              color: var(--el-text-color-primary);
            }
          }
        }

        .project-path {
          .el-input {
            font-family: monospace;
          }
        }
      }

      .scripts-content,
      .dependencies-content {
        .scripts-list {
          .script-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px;
            border-bottom: 1px solid var(--el-border-color-lighter);

            &:last-child {
              border-bottom: none;
            }

            .script-info {
              .script-name {
                font-weight: 500;
                color: var(--el-text-color-primary);
                margin-bottom: 4px;
              }

              .script-command {
                font-size: 12px;
                color: var(--el-text-color-secondary);
                font-family: monospace;
                background: var(--el-fill-color-lighter);
                padding: 2px 6px;
                border-radius: 4px;
              }
            }
          }
        }

        .deps-list {
          max-height: 400px;
          overflow-y: auto;

          .dep-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid var(--el-border-color-lighter);

            &:last-child {
              border-bottom: none;
            }

            .dep-name {
              font-weight: 500;
              color: var(--el-text-color-primary);
            }

            .dep-version {
              font-size: 12px;
              color: var(--el-text-color-secondary);
              font-family: monospace;
              background: var(--el-fill-color-lighter);
              padding: 2px 6px;
              border-radius: 4px;
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .project-detail {
    .project-content {
      .project-header {
        flex-direction: column;
        text-align: center;

        .header-left {
          flex-direction: column;
          margin-bottom: 20px;

          .project-icon {
            margin-right: 0;
            margin-bottom: 16px;
          }
        }
      }

      .project-tabs {
        .overview-content {
          grid-template-columns: 1fr;
        }
      }
    }
  }
}
</style>
