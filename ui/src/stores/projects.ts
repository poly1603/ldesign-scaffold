import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Project, ProjectConfig, CreateProjectOptions } from '@/types'
import { projectApi } from '@/api/projects'

export const useProjectsStore = defineStore('projects', () => {
  // State
  const projects = ref<Project[]>([])
  const currentProject = ref<Project | null>(null)
  const loading = ref(false)
  const creating = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const filterType = ref<string>('all')
  const sortBy = ref<'name' | 'createdAt' | 'updatedAt'>('createdAt')
  const sortOrder = ref<'asc' | 'desc'>('desc')
  
  // Getters
  const filteredProjects = computed(() => {
    let filtered = projects.value
    
    // Search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query) ||
        project.author?.toLowerCase().includes(query)
      )
    }
    
    // Type filter
    if (filterType.value !== 'all') {
      filtered = filtered.filter(project => project.type === filterType.value)
    }
    
    // Sort
    filtered.sort((a, b) => {
      const aValue = a[sortBy.value]
      const bValue = b[sortBy.value]
      
      if (sortBy.value === 'name') {
        const result = (aValue as string).localeCompare(bValue as string)
        return sortOrder.value === 'asc' ? result : -result
      } else {
        const aTime = new Date(aValue as string).getTime()
        const bTime = new Date(bValue as string).getTime()
        const result = aTime - bTime
        return sortOrder.value === 'asc' ? result : -result
      }
    })
    
    return filtered
  })
  
  const recentProjects = computed(() => {
    return projects.value
      .slice()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
  })
  
  const projectTypes = computed(() => {
    const types = new Set(projects.value.map(p => p.type))
    return Array.from(types)
  })
  
  const statistics = computed(() => {
    const total = projects.value.length
    const today = new Date().toDateString()
    const todayCreated = projects.value.filter(p => 
      new Date(p.createdAt).toDateString() === today
    ).length
    
    const typeStats = projects.value.reduce((acc, project) => {
      acc[project.type] = (acc[project.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return {
      total,
      todayCreated,
      typeStats
    }
  })
  
  // Actions
  const fetchProjects = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await projectApi.getProjects()
      const data = response.data as any
      projects.value = Array.isArray(data) ? data : (data.data || [])
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch projects'
      console.error('Failed to fetch projects:', err)
    } finally {
      loading.value = false
    }
  }
  
  const fetchProject = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await projectApi.getProject(id)
      const data = response.data as any
      currentProject.value = data.data || data
      return data.data || data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch project'
      console.error('Failed to fetch project:', err)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const createProject = async (options: CreateProjectOptions) => {
    creating.value = true
    error.value = null
    
    try {
      const response = await projectApi.createProject(options)
      const newProject = response.data.data || response.data

      // Add to projects list
      projects.value.unshift(newProject as any)

      return newProject
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create project'
      console.error('Failed to create project:', err)
      throw err
    } finally {
      creating.value = false
    }
  }
  
  const updateProject = async (id: string, updates: Partial<Project>) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await projectApi.updateProject(id, updates)
      const updatedProject = response.data.data || response.data

      // Update in projects list
      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        projects.value[index] = updatedProject as any
      }

      // Update current project if it's the same
      if (currentProject.value?.id === id) {
        currentProject.value = updatedProject as any
      }

      return updatedProject
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update project'
      console.error('Failed to update project:', err)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const deleteProject = async (id: string) => {
    loading.value = true
    error.value = null
    
    try {
      await projectApi.deleteProject(id)
      
      // Remove from projects list
      projects.value = projects.value.filter(p => p.id !== id)
      
      // Clear current project if it's the same
      if (currentProject.value?.id === id) {
        currentProject.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete project'
      console.error('Failed to delete project:', err)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const cloneProject = async (id: string, newName: string) => {
    creating.value = true
    error.value = null
    
    try {
      const response = await projectApi.cloneProject(id, newName)
      const clonedProject = response.data.data || response.data

      // Add to projects list
      projects.value.unshift(clonedProject as any)

      return clonedProject
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to clone project'
      console.error('Failed to clone project:', err)
      throw err
    } finally {
      creating.value = false
    }
  }
  
  const runProjectScript = async (id: string, script: string) => {
    try {
      const response = await projectApi.runScript(id, script)
      return response.data
    } catch (err) {
      console.error('Failed to run script:', err)
      throw err
    }
  }
  
  // Search and filter actions
  const setSearchQuery = (query: string) => {
    searchQuery.value = query
  }
  
  const setFilterType = (type: string) => {
    filterType.value = type
  }
  
  const setSorting = (field: 'name' | 'createdAt' | 'updatedAt', order: 'asc' | 'desc') => {
    sortBy.value = field
    sortOrder.value = order
  }
  
  const clearFilters = () => {
    searchQuery.value = ''
    filterType.value = 'all'
    sortBy.value = 'createdAt'
    sortOrder.value = 'desc'
  }
  
  return {
    // State
    projects,
    currentProject,
    loading,
    creating,
    error,
    searchQuery,
    filterType,
    sortBy,
    sortOrder,
    
    // Getters
    filteredProjects,
    recentProjects,
    projectTypes,
    statistics,
    
    // Actions
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    cloneProject,
    runProjectScript,
    setSearchQuery,
    setFilterType,
    setSorting,
    clearFilters
  }
})
