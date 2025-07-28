import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { 
  getProjectsApi, 
  createProjectApi, 
  updateProjectApi, 
  deleteProjectApi, 
  startProjectApi, 
  stopProjectApi, 
  buildProjectApi, 
  deployProjectApi,
  getGitStatusApi,
  gitCommitApi,
  gitPushApi,
  gitPullApi
} from '../api/project';
import type { Project, ProjectStatus, GitStatus, LogEntry } from '../types/project';

export const useProjectStore = defineStore('project', () => {
  // 状态
  const projects = ref<Project[]>([]);
  const currentProject = ref<Project | null>(null);
  const selectedProjectId = ref<string>('');
  const loading = ref(false);
  const logs = ref<LogEntry[]>([]);
  const gitStatus = ref<GitStatus>({
    currentBranch: '',
    isClean: true,
    ahead: 0,
    behind: 0,
  });

  // 计算属性
  const selectedProject = computed(() => {
    return projects.value.find(p => p.id === selectedProjectId.value) || null;
  });

  const runningProjects = computed(() => {
    return projects.value.filter(p => p.status === 'running');
  });

  const projectsByStatus = computed(() => {
    const grouped: Record<ProjectStatus, Project[]> = {
      idle: [],
      running: [],
      building: [],
      error: [],
    };

    projects.value.forEach(project => {
      grouped[project.status].push(project);
    });

    return grouped;
  });

  // 操作
  const loadProjects = async () => {
    loading.value = true;
    try {
      const response = await getProjectsApi();
      projects.value = response;
    } catch (error) {
      console.error('加载项目失败:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const createProject = async (projectData: any) => {
    loading.value = true;
    try {
      const newProject = await createProjectApi(projectData);
      projects.value.push(newProject);
      return newProject;
    } catch (error) {
      console.error('创建项目失败:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    try {
      const updatedProject = await updateProjectApi(projectId, updates);
      
      const index = projects.value.findIndex(p => p.id === projectId);
      if (index > -1) {
        projects.value[index] = updatedProject;
      }
      
      return updatedProject;
    } catch (error) {
      console.error('更新项目失败:', error);
      throw error;
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      await deleteProjectApi(projectId);
      const index = projects.value.findIndex(p => p.id === projectId);
      if (index > -1) {
        projects.value.splice(index, 1);
      }
      
      if (selectedProjectId.value === projectId) {
        selectedProjectId.value = '';
      }
    } catch (error) {
      console.error('删除项目失败:', error);
      throw error;
    }
  };

  const startProject = async (projectId: string) => {
    try {
      await startProjectApi(projectId);
      await updateProjectStatus(projectId, 'running');
      addLog('success', `项目 ${getProjectName(projectId)} 启动成功`);
    } catch (error) {
      await updateProjectStatus(projectId, 'error');
      addLog('error', `项目 ${getProjectName(projectId)} 启动失败`);
      throw error;
    }
  };

  const stopProject = async (projectId: string) => {
    try {
      await stopProjectApi(projectId);
      await updateProjectStatus(projectId, 'idle');
      addLog('info', `项目 ${getProjectName(projectId)} 已停止`);
    } catch (error) {
      addLog('error', `项目 ${getProjectName(projectId)} 停止失败`);
      throw error;
    }
  };

  const buildProject = async (projectId: string, config?: any) => {
    try {
      await updateProjectStatus(projectId, 'building');
      addLog('info', `开始构建项目 ${getProjectName(projectId)}`);
      
      await buildProjectApi(projectId, config);
      
      await updateProjectStatus(projectId, 'idle');
      addLog('success', `项目 ${getProjectName(projectId)} 构建成功`);
    } catch (error) {
      await updateProjectStatus(projectId, 'error');
      addLog('error', `项目 ${getProjectName(projectId)} 构建失败`);
      throw error;
    }
  };

  const deployProject = async (projectId: string, config: any) => {
    try {
      addLog('info', `开始部署项目 ${getProjectName(projectId)}`);
      
      await deployProjectApi(projectId, config);
      
      addLog('success', `项目 ${getProjectName(projectId)} 部署成功`);
    } catch (error) {
      addLog('error', `项目 ${getProjectName(projectId)} 部署失败`);
      throw error;
    }
  };

  const loadGitStatus = async (projectId: string) => {
    try {
      const response = await getGitStatusApi(projectId);
      gitStatus.value = response;
    } catch (error) {
      console.error('加载 Git 状态失败:', error);
      throw error;
    }
  };

  const commitChanges = async (projectId: string, commitData: any) => {
    try {
      await gitCommitApi(projectId, commitData);
      await loadGitStatus(projectId);
      addLog('success', `项目 ${getProjectName(projectId)} 提交成功`);
    } catch (error) {
      addLog('error', `项目 ${getProjectName(projectId)} 提交失败`);
      throw error;
    }
  };

  const pushChanges = async (projectId: string) => {
    try {
      await gitPushApi(projectId);
      await loadGitStatus(projectId);
      addLog('success', `项目 ${getProjectName(projectId)} 推送成功`);
    } catch (error) {
      addLog('error', `项目 ${getProjectName(projectId)} 推送失败`);
      throw error;
    }
  };

  const pullChanges = async (projectId: string) => {
    try {
      await gitPullApi(projectId);
      await loadGitStatus(projectId);
      addLog('success', `项目 ${getProjectName(projectId)} 拉取成功`);
    } catch (error) {
      addLog('error', `项目 ${getProjectName(projectId)} 拉取失败`);
      throw error;
    }
  };

  // 辅助方法
  const updateProjectStatus = async (projectId: string, status: ProjectStatus) => {
    const project = projects.value.find(p => p.id === projectId);
    if (project) {
      project.status = status;
      project.lastModified = new Date();
    }
  };

  const getProjectName = (projectId: string) => {
    const project = projects.value.find(p => p.id === projectId);
    return project?.name || projectId;
  };

  const addLog = (level: 'info' | 'success' | 'warning' | 'error', message: string) => {
    logs.value.unshift({
      level,
      message,
      timestamp: new Date(),
    });

    // 限制日志数量
    if (logs.value.length > 1000) {
      logs.value = logs.value.slice(0, 1000);
    }
  };

  const clearLogs = () => {
    logs.value = [];
  };

  const selectProject = (projectId: string) => {
    selectedProjectId.value = projectId;
    const project = projects.value.find(p => p.id === projectId);
    if (project) {
      currentProject.value = project;
    }
  };

  const getProjectById = (projectId: string) => {
    return projects.value.find(p => p.id === projectId);
  };

  const refreshProject = async (projectId: string) => {
    try {
      const response = await projectApi.getProject(projectId);
      const updatedProject = response.data;
      
      const index = projects.value.findIndex(p => p.id === projectId);
      if (index > -1) {
        projects.value[index] = updatedProject;
      }
      
      return updatedProject;
    } catch (error) {
      console.error('刷新项目失败:', error);
      throw error;
    }
  };

  const refreshAllProjects = async () => {
    await loadProjects();
  };

  // 批量操作
  const startMultipleProjects = async (projectIds: string[]) => {
    const results = await Promise.allSettled(
      projectIds.map(id => startProject(id))
    );
    
    const failed = results.filter(r => r.status === 'rejected').length;
    if (failed > 0) {
      addLog('warning', `${projectIds.length - failed}/${projectIds.length} 个项目启动成功`);
    }
  };

  const stopMultipleProjects = async (projectIds: string[]) => {
    const results = await Promise.allSettled(
      projectIds.map(id => stopProject(id))
    );
    
    const failed = results.filter(r => r.status === 'rejected').length;
    if (failed > 0) {
      addLog('warning', `${projectIds.length - failed}/${projectIds.length} 个项目停止成功`);
    }
  };

  return {
    // 状态
    projects,
    currentProject,
    selectedProjectId,
    loading,
    logs,
    gitStatus,
    
    // 计算属性
    selectedProject,
    runningProjects,
    projectsByStatus,
    
    // 操作
    loadProjects,
    createProject,
    updateProject,
    deleteProject,
    startProject,
    stopProject,
    buildProject,
    deployProject,
    loadGitStatus,
    commitChanges,
    pushChanges,
    pullChanges,
    
    // 辅助方法
    addLog,
    clearLogs,
    selectProject,
    getProjectById,
    refreshProject,
    refreshAllProjects,
    startMultipleProjects,
    stopMultipleProjects,
  };
});