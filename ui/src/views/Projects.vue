<template>
  <div class="projects">
    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">{{ $t('projects.title') }}</h1>
        <p class="page-subtitle">管理和查看所有项目</p>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="$router.push('/create')">
          <el-icon><Plus /></el-icon>
          {{ $t('projects.create') }}
        </el-button>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="filters-section">
      <div class="filters-left">
        <el-input
          v-model="searchQuery"
          placeholder="搜索项目名称、描述或作者..."
          clearable
          style="width: 300px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select
          v-model="filterType"
          placeholder="项目类型"
          clearable
          style="width: 150px"
        >
          <el-option label="全部类型" value="" />
          <el-option
            v-for="type in projectTypes"
            :key="type"
            :label="$t(`types.${type}`)"
            :value="type"
          />
        </el-select>
        
        <el-select
          v-model="sortBy"
          placeholder="排序方式"
          style="width: 120px"
        >
          <el-option label="创建时间" value="createdAt" />
          <el-option label="更新时间" value="updatedAt" />
          <el-option label="项目名称" value="name" />
        </el-select>
        
        <el-button
          :icon="sortOrder === 'asc' ? 'SortUp' : 'SortDown'"
          @click="toggleSortOrder"
        />
      </div>
      
      <div class="filters-right">
        <el-button-group>
          <el-button
            :type="viewMode === 'grid' ? 'primary' : ''"
            @click="viewMode = 'grid'"
          >
            <el-icon><Grid /></el-icon>
          </el-button>
          <el-button
            :type="viewMode === 'list' ? 'primary' : ''"
            @click="viewMode = 'list'"
          >
            <el-icon><List /></el-icon>
          </el-button>
        </el-button-group>
        
        <el-button @click="refreshProjects">
          <el-icon><Refresh /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- Projects Content -->
    <div class="projects-content">
      <div v-if="loading" class="loading-container">
        <el-loading />
        <span class="loading-text">加载项目中...</span>
      </div>
      
      <div v-else-if="filteredProjects.length === 0" class="empty-state">
        <div class="empty-icon">📁</div>
        <div class="empty-title">暂无项目</div>
        <div class="empty-description">
          {{ searchQuery ? '没有找到匹配的项目' : '还没有创建任何项目' }}
        </div>
        <el-button v-if="!searchQuery" type="primary" @click="$router.push('/create')">
          创建第一个项目
        </el-button>
      </div>
      
      <!-- Grid View -->
      <div v-else-if="viewMode === 'grid'" class="projects-grid">
        <div
          v-for="project in filteredProjects"
          :key="project.id"
          class="project-card"
          @click="openProject(project)"
        >
          <div class="card-header">
            <div class="project-icon">
              <el-icon>
                <component :is="getProjectIcon(project.type)" />
              </el-icon>
            </div>
            <div class="project-status" :class="project.status">
              <el-icon><CircleCheck v-if="project.status === 'active'" /><Warning v-else /></el-icon>
            </div>
          </div>
          
          <div class="card-body">
            <h3 class="project-name">{{ project.name }}</h3>
            <p class="project-description">{{ project.description || '暂无描述' }}</p>
            
            <div class="project-meta">
              <span class="project-type">{{ $t(`types.${project.type}`) }}</span>
              <span class="project-time">{{ formatTime(project.updatedAt) }}</span>
            </div>
            
            <div class="project-features">
              <el-tag
                v-for="feature in project.features.slice(0, 3)"
                :key="feature"
                size="small"
                type="info"
              >
                {{ $t(`features.${feature}`) }}
              </el-tag>
              <span v-if="project.features.length > 3" class="more-features">
                +{{ project.features.length - 3 }}
              </span>
            </div>
          </div>
          
          <div class="card-actions">
            <el-button text size="small" @click.stop="runProject(project)">
              <el-icon><VideoPlay /></el-icon>
              启动
            </el-button>
            <el-button text size="small" @click.stop="editProject(project)">
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-dropdown @command="(command) => handleAction(command, project)" @click.stop>
              <el-button text size="small">
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="clone">
                    <el-icon><CopyDocument /></el-icon>
                    克隆项目
                  </el-dropdown-item>
                  <el-dropdown-item command="export">
                    <el-icon><Download /></el-icon>
                    导出项目
                  </el-dropdown-item>
                  <el-dropdown-item command="archive" :disabled="project.status === 'archived'">
                    <el-icon><Box /></el-icon>
                    归档项目
                  </el-dropdown-item>
                  <el-dropdown-item command="delete" divided>
                    <el-icon><Delete /></el-icon>
                    删除项目
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>
      
      <!-- List View -->
      <div v-else class="projects-table">
        <el-table :data="filteredProjects" @row-click="openProject">
          <el-table-column width="60">
            <template #default="{ row }">
              <div class="project-icon small">
                <el-icon>
                  <component :is="getProjectIcon(row.type)" />
                </el-icon>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="name" label="项目名称" min-width="200">
            <template #default="{ row }">
              <div class="project-info">
                <div class="project-name">{{ row.name }}</div>
                <div class="project-description">{{ row.description || '暂无描述' }}</div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="type" label="类型" width="120">
            <template #default="{ row }">
              {{ $t(`types.${row.type}`) }}
            </template>
          </el-table-column>
          
          <el-table-column prop="author" label="作者" width="120" />
          
          <el-table-column prop="updatedAt" label="更新时间" width="120">
            <template #default="{ row }">
              {{ formatTime(row.updatedAt) }}
            </template>
          </el-table-column>
          
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'warning'" size="small">
                {{ row.status === 'active' ? '正常' : '异常' }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button text size="small" @click.stop="runProject(row)">
                <el-icon><VideoPlay /></el-icon>
              </el-button>
              <el-button text size="small" @click.stop="editProject(row)">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button text size="small" @click.stop="cloneProject(row)">
                <el-icon><CopyDocument /></el-icon>
              </el-button>
              <el-button text size="small" type="danger" @click.stop="deleteProject(row)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useProjectsStore } from '@/stores/projects'
import type { Project } from '@/types'

const router = useRouter()
const projectsStore = useProjectsStore()

// State
const viewMode = ref<'grid' | 'list'>('grid')

// Computed
const loading = computed(() => projectsStore.loading)
const filteredProjects = computed(() => projectsStore.filteredProjects)
const projectTypes = computed(() => projectsStore.projectTypes)

const searchQuery = computed({
  get: () => projectsStore.searchQuery,
  set: (value) => projectsStore.setSearchQuery(value)
})

const filterType = computed({
  get: () => projectsStore.filterType,
  set: (value) => projectsStore.setFilterType(value)
})

const sortBy = computed({
  get: () => projectsStore.sortBy,
  set: (value) => projectsStore.setSorting(value, projectsStore.sortOrder)
})

const sortOrder = computed(() => projectsStore.sortOrder)

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

const toggleSortOrder = () => {
  const newOrder = sortOrder.value === 'asc' ? 'desc' : 'asc'
  projectsStore.setSorting(sortBy.value, newOrder)
}

const refreshProjects = async () => {
  await projectsStore.fetchProjects()
  ElMessage.success('项目列表已刷新')
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

const editProject = (project: Project) => {
  router.push(`/project/${project.id}/settings`)
}

const cloneProject = async (project: Project) => {
  try {
    const { value: newName } = await ElMessageBox.prompt(
      '请输入新项目名称',
      '克隆项目',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValue: `${project.name}-copy`,
        inputPattern: /^[a-z0-9-_]+$/,
        inputErrorMessage: '项目名称只能包含小写字母、数字、连字符和下划线'
      }
    )
    
    await projectsStore.cloneProject(project.id, newName)
    ElMessage.success('项目克隆成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('项目克隆失败')
    }
  }
}

const deleteProject = async (project: Project) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除项目 "${project.name}" 吗？此操作不可撤销。`,
      '删除项目',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await projectsStore.deleteProject(project.id)
    ElMessage.success('项目删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('项目删除失败')
    }
  }
}

const handleAction = async (command: string, project: Project) => {
  switch (command) {
    case 'clone':
      await cloneProject(project)
      break
    case 'export':
      // Export project logic
      ElMessage.info('导出功能开发中')
      break
    case 'archive':
      // Archive project logic
      ElMessage.info('归档功能开发中')
      break
    case 'delete':
      await deleteProject(project)
      break
  }
}

// Lifecycle
onMounted(async () => {
  await projectsStore.fetchProjects()
})
</script>

<style lang="scss" scoped>
.projects {
  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;

    .header-left {
      .page-title {
        font-size: 28px;
        font-weight: bold;
        color: var(--el-text-color-primary);
        margin-bottom: 4px;
      }

      .page-subtitle {
        font-size: 14px;
        color: var(--el-text-color-secondary);
      }
    }
  }

  .filters-section {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    padding: 16px;
    background: var(--el-bg-color);
    border-radius: 8px;

    .filters-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .filters-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

  .projects-content {
    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 200px;

      .loading-text {
        margin-left: 12px;
        color: var(--el-text-color-secondary);
      }
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;

      .empty-icon {
        font-size: 64px;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      .empty-title {
        font-size: 18px;
        font-weight: 500;
        color: var(--el-text-color-primary);
        margin-bottom: 8px;
      }

      .empty-description {
        font-size: 14px;
        color: var(--el-text-color-secondary);
        margin-bottom: 24px;
      }
    }

    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;

      .project-card {
        background: var(--el-bg-color);
        border: 1px solid var(--el-border-color-light);
        border-radius: 12px;
        padding: 20px;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;

          .project-icon {
            width: 48px;
            height: 48px;
            border-radius: 12px;
            background: var(--el-color-primary-light-9);
            color: var(--el-color-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;

            &.small {
              width: 32px;
              height: 32px;
              font-size: 16px;
            }
          }

          .project-status {
            &.active {
              color: var(--el-color-success);
            }

            &.error {
              color: var(--el-color-danger);
            }
          }
        }

        .card-body {
          margin-bottom: 16px;

          .project-name {
            font-size: 18px;
            font-weight: 600;
            color: var(--el-text-color-primary);
            margin-bottom: 8px;
          }

          .project-description {
            font-size: 14px;
            color: var(--el-text-color-secondary);
            margin-bottom: 12px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }

          .project-meta {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;
            font-size: 12px;
            color: var(--el-text-color-secondary);

            .project-type {
              padding: 2px 6px;
              background: var(--el-fill-color-light);
              border-radius: 4px;
            }
          }

          .project-features {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-wrap: wrap;

            .more-features {
              font-size: 12px;
              color: var(--el-text-color-secondary);
            }
          }
        }

        .card-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        &:hover .card-actions {
          opacity: 1;
        }
      }
    }

    .projects-table {
      background: var(--el-bg-color);
      border-radius: 8px;
      overflow: hidden;

      .project-info {
        .project-name {
          font-weight: 500;
          color: var(--el-text-color-primary);
          margin-bottom: 4px;
        }

        .project-description {
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .projects {
    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }

    .filters-section {
      flex-direction: column;
      gap: 16px;

      .filters-left {
        flex-wrap: wrap;
      }
    }

    .projects-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
