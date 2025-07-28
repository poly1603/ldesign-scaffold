<template>
  <div class="dashboard">
    <!-- Welcome Section -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h1 class="welcome-title">
          <el-icon class="welcome-icon"><Rocket /></el-icon>
          {{ $t('dashboard.welcome') }}
        </h1>
        <p class="welcome-subtitle">{{ $t('dashboard.subtitle') }}</p>
      </div>
      <div class="welcome-actions">
        <el-button type="primary" size="large" @click="$router.push('/create')">
          <el-icon><Plus /></el-icon>
          {{ $t('dashboard.createProject') }}
        </el-button>
        <el-button size="large" @click="$router.push('/projects')">
          <el-icon><Folder /></el-icon>
          {{ $t('dashboard.viewProjects') }}
        </el-button>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-section">
      <div class="grid grid-4">
        <div class="stat-card">
          <div class="stat-icon primary">
            <el-icon><Folder /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ statistics.total }}</div>
            <div class="stat-label">{{ $t('dashboard.totalProjects') }}</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon success">
            <el-icon><Plus /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ statistics.todayCreated }}</div>
            <div class="stat-label">{{ $t('dashboard.todayCreated') }}</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon warning">
            <el-icon><Connection /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ connectionStatus }}</div>
            <div class="stat-label">{{ $t('dashboard.systemStatus') }}</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon info">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ Object.keys(statistics.typeStats).length }}</div>
            <div class="stat-label">项目类型</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <div class="content-left">
        <!-- Recent Projects -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">{{ $t('dashboard.recentProjects') }}</h3>
            <el-button text @click="$router.push('/projects')">
              查看全部
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
          <div class="card-body">
            <div v-if="recentProjects.length === 0" class="empty-state">
              <div class="empty-icon">📁</div>
              <div class="empty-title">{{ $t('dashboard.noRecentProjects') }}</div>
              <el-button type="primary" @click="$router.push('/create')">
                创建第一个项目
              </el-button>
            </div>
            <div v-else class="project-list">
              <div
                v-for="project in recentProjects"
                :key="project.id"
                class="project-item"
                @click="openProject(project)"
              >
                <div class="project-icon">
                  <el-icon>
                    <component :is="getProjectIcon(project.type)" />
                  </el-icon>
                </div>
                <div class="project-info">
                  <div class="project-name">{{ project.name }}</div>
                  <div class="project-meta">
                    <span class="project-type">{{ $t(`types.${project.type}`) }}</span>
                    <span class="project-time">{{ formatTime(project.updatedAt) }}</span>
                  </div>
                </div>
                <div class="project-actions">
                  <el-button text size="small" @click.stop="runProject(project)">
                    <el-icon><VideoPlay /></el-icon>
                  </el-button>
                  <el-button text size="small" @click.stop="openInEditor(project)">
                    <el-icon><Edit /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">{{ $t('dashboard.quickActions') }}</h3>
          </div>
          <div class="card-body">
            <div class="quick-actions">
              <div class="action-item" @click="$router.push('/create')">
                <div class="action-icon primary">
                  <el-icon><Plus /></el-icon>
                </div>
                <div class="action-content">
                  <div class="action-title">创建新项目</div>
                  <div class="action-desc">使用向导快速创建项目</div>
                </div>
              </div>
              
              <div class="action-item" @click="importProject">
                <div class="action-icon success">
                  <el-icon><Upload /></el-icon>
                </div>
                <div class="action-content">
                  <div class="action-title">导入项目</div>
                  <div class="action-desc">从现有代码导入项目</div>
                </div>
              </div>
              
              <div class="action-item" @click="$router.push('/tools')">
                <div class="action-icon warning">
                  <el-icon><Tools /></el-icon>
                </div>
                <div class="action-content">
                  <div class="action-title">工具集成</div>
                  <div class="action-desc">环境检测和工具配置</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="content-right">
        <!-- Project Type Distribution -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">项目类型分布</h3>
          </div>
          <div class="card-body">
            <div class="type-stats">
              <div
                v-for="(count, type) in statistics.typeStats"
                :key="type"
                class="type-item"
              >
                <div class="type-info">
                  <span class="type-name">{{ $t(`types.${type}`) }}</span>
                  <span class="type-count">{{ count }}</span>
                </div>
                <div class="type-bar">
                  <div
                    class="type-progress"
                    :style="{ width: `${(count / statistics.total) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- System Info -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">系统信息</h3>
          </div>
          <div class="card-body">
            <div class="system-info">
              <div class="info-item">
                <span class="info-label">Node.js</span>
                <span class="info-value">{{ systemInfo.nodeVersion }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">包管理器</span>
                <span class="info-value">{{ systemInfo.packageManager }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">操作系统</span>
                <span class="info-value">{{ systemInfo.platform }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">内存使用</span>
                <span class="info-value">{{ systemInfo.memoryUsage }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useProjectsStore } from '@/stores/projects'
import { useSocketStore } from '@/stores/socket'
import type { Project } from '@/types'

const router = useRouter()
const projectsStore = useProjectsStore()
const socketStore = useSocketStore()

// Computed properties
const statistics = computed(() => projectsStore.statistics)
const recentProjects = computed(() => projectsStore.recentProjects)
const connectionStatus = computed(() => socketStore.isConnected ? '已连接' : '未连接')

// System info (mock data)
const systemInfo = ref({
  nodeVersion: 'v20.10.0',
  packageManager: 'pnpm 8.15.1',
  platform: 'macOS 14.2.1',
  memoryUsage: '45%'
})

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
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return `${Math.floor(diff / 86400000)}天前`
}

const openProject = (project: Project) => {
  router.push(`/project/${project.id}`)
}

const runProject = async (project: Project) => {
  try {
    await projectsStore.runProjectScript(project.id, 'dev')
    ElMessage.success(`项目 ${project.name} 启动成功`)
  } catch (error) {
    ElMessage.error('启动项目失败')
  }
}

const openInEditor = (project: Project) => {
  // Open project in external editor
  window.open(`vscode://file/${project.path}`)
}

const importProject = () => {
  ElMessageBox.confirm(
    '导入项目功能正在开发中，敬请期待！',
    '提示',
    {
      confirmButtonText: '确定',
      showCancelButton: false,
      type: 'info'
    }
  )
}

// Lifecycle
onMounted(async () => {
  await projectsStore.fetchProjects()
})
</script>

<style lang="scss" scoped>
.dashboard {
  .welcome-section {
    background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-light-3) 100%);
    border-radius: 12px;
    padding: 40px;
    margin-bottom: 24px;
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .welcome-content {
      .welcome-title {
        font-size: 32px;
        font-weight: bold;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        
        .welcome-icon {
          font-size: 36px;
          margin-right: 12px;
        }
      }
      
      .welcome-subtitle {
        font-size: 16px;
        opacity: 0.9;
      }
    }
    
    .welcome-actions {
      display: flex;
      gap: 12px;
    }
  }
  
  .stats-section {
    margin-bottom: 24px;
    
    .stat-card {
      background: var(--el-bg-color);
      border: 1px solid var(--el-border-color-light);
      border-radius: 8px;
      padding: 24px;
      display: flex;
      align-items: center;
      transition: all 0.3s ease;
      
      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }
      
      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;
        font-size: 24px;
        
        &.primary { background: var(--el-color-primary-light-9); color: var(--el-color-primary); }
        &.success { background: var(--el-color-success-light-9); color: var(--el-color-success); }
        &.warning { background: var(--el-color-warning-light-9); color: var(--el-color-warning); }
        &.info { background: var(--el-color-info-light-9); color: var(--el-color-info); }
      }
      
      .stat-content {
        .stat-number {
          font-size: 24px;
          font-weight: bold;
          color: var(--el-text-color-primary);
          margin-bottom: 4px;
        }
        
        .stat-label {
          font-size: 14px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }
  
  .main-content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 24px;
    
    .project-list {
      .project-item {
        display: flex;
        align-items: center;
        padding: 16px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          background: var(--el-fill-color-light);
        }
        
        .project-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: var(--el-color-primary-light-9);
          color: var(--el-color-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          font-size: 20px;
        }
        
        .project-info {
          flex: 1;
          
          .project-name {
            font-weight: 500;
            color: var(--el-text-color-primary);
            margin-bottom: 4px;
          }
          
          .project-meta {
            display: flex;
            gap: 12px;
            font-size: 12px;
            color: var(--el-text-color-secondary);
          }
        }
        
        .project-actions {
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        &:hover .project-actions {
          opacity: 1;
        }
      }
    }
    
    .quick-actions {
      .action-item {
        display: flex;
        align-items: center;
        padding: 16px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-bottom: 12px;
        
        &:hover {
          background: var(--el-fill-color-light);
        }
        
        .action-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          font-size: 20px;
          
          &.primary { background: var(--el-color-primary-light-9); color: var(--el-color-primary); }
          &.success { background: var(--el-color-success-light-9); color: var(--el-color-success); }
          &.warning { background: var(--el-color-warning-light-9); color: var(--el-color-warning); }
        }
        
        .action-content {
          .action-title {
            font-weight: 500;
            color: var(--el-text-color-primary);
            margin-bottom: 4px;
          }
          
          .action-desc {
            font-size: 12px;
            color: var(--el-text-color-secondary);
          }
        }
      }
    }
    
    .type-stats {
      .type-item {
        margin-bottom: 16px;
        
        .type-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          
          .type-name {
            font-size: 14px;
            color: var(--el-text-color-primary);
          }
          
          .type-count {
            font-size: 14px;
            font-weight: 500;
            color: var(--el-color-primary);
          }
        }
        
        .type-bar {
          height: 6px;
          background: var(--el-fill-color-light);
          border-radius: 3px;
          overflow: hidden;
          
          .type-progress {
            height: 100%;
            background: var(--el-color-primary);
            transition: width 0.3s ease;
          }
        }
      }
    }
    
    .system-info {
      .info-item {
        display: flex;
        justify-content: space-between;
        padding: 12px 0;
        border-bottom: 1px solid var(--el-border-color-lighter);
        
        &:last-child {
          border-bottom: none;
        }
        
        .info-label {
          font-size: 14px;
          color: var(--el-text-color-secondary);
        }
        
        .info-value {
          font-size: 14px;
          font-weight: 500;
          color: var(--el-text-color-primary);
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .dashboard {
    .welcome-section {
      flex-direction: column;
      text-align: center;
      
      .welcome-actions {
        margin-top: 20px;
      }
    }
    
    .main-content {
      grid-template-columns: 1fr;
    }
  }
}
</style>
