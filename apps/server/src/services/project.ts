import fs from 'fs-extra';
import path from 'path';
import { spawn, ChildProcess } from 'child_process';
import chokidar from 'chokidar';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';

export interface Project {
  id: string;
  name: string;
  description: string;
  path: string;
  template: string;
  packageManager: 'npm' | 'yarn' | 'pnpm';
  status: 'idle' | 'running' | 'building' | 'error';
  port?: number;
  pid?: number;
  createdAt: string;
  updatedAt: string;
  lastBuildAt?: string;
  lastDeployAt?: string;
  config?: any;
}

export interface ProjectStats {
  totalProjects: number;
  runningProjects: number;
  buildingProjects: number;
  errorProjects: number;
  diskUsage: number;
}

export interface ProcessInfo {
  pid: number;
  process: ChildProcess;
  projectId: string;
  type: 'dev' | 'build' | 'deploy';
  startTime: number;
}

export class ProjectService {
  private projects: Map<string, Project> = new Map();
  private processes: Map<string, ProcessInfo> = new Map();
  private watchers: Map<string, chokidar.FSWatcher> = new Map();
  private projectsFile: string;
  private saveTimeout?: NodeJS.Timeout;

  constructor() {
    this.projectsFile = path.join(config.paths.projects, 'projects.json');
  }

  public async initialize(): Promise<void> {
    try {
      // 确保项目目录存在
      await fs.ensureDir(config.paths.projects);
      
      // 加载项目数据
      await this.loadProjects();
      
      // 清理无效的项目状态
      await this.cleanupProjectStates();
      
      logger.info(`ProjectService initialized with ${this.projects.size} projects`);
    } catch (error) {
      logger.error('Failed to initialize ProjectService:', error);
      throw error;
    }
  }

  private async loadProjects(): Promise<void> {
    try {
      if (await fs.pathExists(this.projectsFile)) {
        const data = await fs.readJson(this.projectsFile);
        if (Array.isArray(data)) {
          data.forEach(project => {
            this.projects.set(project.id, project);
          });
        }
      }
    } catch (error) {
      logger.error('Failed to load projects:', error);
    }
  }

  private async saveProjects(): Promise<void> {
    // 防抖保存
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    this.saveTimeout = setTimeout(async () => {
      try {
        const projects = Array.from(this.projects.values());
        await fs.writeJson(this.projectsFile, projects, { spaces: 2 });
        logger.debug('Projects saved to disk');
      } catch (error) {
        logger.error('Failed to save projects:', error);
      }
    }, 1000);
  }

  private async cleanupProjectStates(): Promise<void> {
    for (const [id, project] of this.projects) {
      // 检查项目路径是否存在
      if (!(await fs.pathExists(project.path))) {
        logger.warn(`Project path not found, removing project: ${project.name}`);
        this.projects.delete(id);
        continue;
      }
      
      // 重置运行状态
      if (project.status === 'running' || project.status === 'building') {
        project.status = 'idle';
        project.pid = undefined;
        project.port = undefined;
      }
    }
    
    await this.saveProjects();
  }

  // 获取所有项目
  public getProjects(): Project[] {
    return Array.from(this.projects.values());
  }

  // 获取项目详情
  public getProject(id: string): Project | undefined {
    return this.projects.get(id);
  }

  // 创建项目
  public async createProject(data: {
    name: string;
    description: string;
    template: string;
    path: string;
    packageManager: 'npm' | 'yarn' | 'pnpm';
    initGit?: boolean;
    installDeps?: boolean;
  }): Promise<Project> {
    const { name, description, template, path: projectPath, packageManager, initGit = true, installDeps = true } = data;

    // 检查项目名称是否已存在
    const existingProject = Array.from(this.projects.values()).find(p => p.name === name);
    if (existingProject) {
      throw new AppError(`Project with name '${name}' already exists`, 409);
    }

    // 规范化路径，处理跨平台兼容性
    const normalizedProjectPath = path.resolve(projectPath);
    logger.info(`Original path: ${projectPath}`);
    logger.info(`Normalized path: ${normalizedProjectPath}`);

    // 检查项目路径是否已存在，如果存在则在其中创建项目子目录
    let finalProjectPath = normalizedProjectPath;
    if (await fs.pathExists(normalizedProjectPath)) {
      // 如果路径已存在，检查是否是目录
      const stats = await fs.stat(normalizedProjectPath);
      if (stats.isDirectory()) {
        // 在现有目录中创建项目子目录
        finalProjectPath = path.join(normalizedProjectPath, name);
        if (await fs.pathExists(finalProjectPath)) {
          throw new AppError(`Directory '${finalProjectPath}' already exists`, 409);
        }
      } else {
        // 如果是文件，则报错
        throw new AppError(`File '${normalizedProjectPath}' already exists`, 409);
      }
    }
    
    // 检查项目数量限制
    if (this.projects.size >= config.limits.maxProjects) {
      throw new AppError(`Maximum number of projects (${config.limits.maxProjects}) reached`, 400);
    }
    
    const project: Project = {
      id: uuidv4(),
      name,
      description,
      path: finalProjectPath,
      template,
      packageManager,
      status: 'idle',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    try {
      // 创建项目目录
      await fs.ensureDir(finalProjectPath);
      
      // 从模板创建项目
      await this.createFromTemplate(project, template);
      
      // 初始化Git仓库
      if (initGit) {
        await this.initGitRepository(project);
      }
      
      // 安装依赖
      if (installDeps) {
        await this.installDependencies(project);
      }
      
      // 保存项目
      this.projects.set(project.id, project);
      await this.saveProjects();
      
      logger.info(`Project created: ${name} (${project.id})`);
      return project;
    } catch (error) {
      // 清理失败的项目
      await fs.remove(finalProjectPath).catch(() => {});
      throw error;
    }
  }

  // 更新项目
  public async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const project = this.projects.get(id);
    if (!project) {
      throw new AppError(`Project not found: ${id}`, 404);
    }
    
    // 更新项目信息
    Object.assign(project, updates, {
      updatedAt: new Date().toISOString(),
    });
    
    await this.saveProjects();
    logger.info(`Project updated: ${project.name} (${id})`);
    return project;
  }

  // 删除项目
  public async deleteProject(id: string, deleteFiles: boolean = false): Promise<void> {
    const project = this.projects.get(id);
    if (!project) {
      throw new AppError(`Project not found: ${id}`, 404);
    }
    
    // 停止项目进程
    await this.stopProject(id);
    
    // 删除文件
    if (deleteFiles && await fs.pathExists(project.path)) {
      await fs.remove(project.path);
    }
    
    // 移除项目
    this.projects.delete(id);
    await this.saveProjects();
    
    logger.info(`Project deleted: ${project.name} (${id})`);
  }

  // 启动项目开发服务器
  public async startProject(id: string): Promise<void> {
    const project = this.projects.get(id);
    if (!project) {
      throw new AppError(`Project not found: ${id}`, 404);
    }
    
    if (project.status === 'running') {
      throw new AppError(`Project is already running: ${project.name}`, 400);
    }
    
    try {
      const port = await this.findAvailablePort();
      const command = this.getDevCommand(project.packageManager);
      
      const childProcess = spawn(command.cmd, command.args, {
        cwd: project.path,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          PORT: port.toString(),
          NODE_ENV: 'development',
        },
      });
      
      const processInfo: ProcessInfo = {
        pid: childProcess.pid!,
        process: childProcess,
        projectId: id,
        type: 'dev',
        startTime: Date.now(),
      };
      
      this.processes.set(id, processInfo);
      
      // 更新项目状态
      project.status = 'running';
      project.pid = childProcess.pid;
      project.port = port;
      await this.saveProjects();
      
      // 设置进程事件监听
      this.setupProcessListeners(childProcess, project);
      
      logger.info(`Project started: ${project.name} on port ${port}`);
    } catch (error) {
      project.status = 'error';
      await this.saveProjects();
      throw error;
    }
  }

  // 停止项目
  public async stopProject(id: string): Promise<void> {
    const project = this.projects.get(id);
    if (!project) {
      throw new AppError(`Project not found: ${id}`, 404);
    }
    
    const processInfo = this.processes.get(id);
    if (processInfo) {
      processInfo.process.kill('SIGTERM');
      this.processes.delete(id);
    }
    
    // 更新项目状态
    project.status = 'idle';
    project.pid = undefined;
    project.port = undefined;
    await this.saveProjects();
    
    logger.info(`Project stopped: ${project.name}`);
  }

  // 构建项目
  public async buildProject(id: string, options: any = {}): Promise<void> {
    const project = this.projects.get(id);
    if (!project) {
      throw new AppError(`Project not found: ${id}`, 404);
    }
    
    if (project.status === 'building') {
      throw new AppError(`Project is already building: ${project.name}`, 400);
    }
    
    try {
      project.status = 'building';
      await this.saveProjects();
      
      const command = this.getBuildCommand(project.packageManager);
      
      const childProcess = spawn(command.cmd, command.args, {
        cwd: project.path,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          NODE_ENV: options.mode || 'production',
        },
      });
      
      const processInfo: ProcessInfo = {
        pid: childProcess.pid!,
        process: childProcess,
        projectId: id,
        type: 'build',
        startTime: Date.now(),
      };
      
      this.processes.set(`${id}_build`, processInfo);
      
      // 等待构建完成
      await new Promise<void>((resolve, reject) => {
        childProcess.on('exit', (code) => {
          this.processes.delete(`${id}_build`);
          if (code === 0) {
            project.status = 'idle';
            project.lastBuildAt = new Date().toISOString();
            resolve();
          } else {
            project.status = 'error';
            reject(new Error(`Build failed with exit code ${code}`));
          }
        });
        
        childProcess.on('error', (error) => {
          this.processes.delete(`${id}_build`);
          project.status = 'error';
          reject(error);
        });
      });
      
      await this.saveProjects();
      logger.info(`Project built successfully: ${project.name}`);
    } catch (error) {
      project.status = 'error';
      await this.saveProjects();
      throw error;
    }
  }

  // 获取项目统计信息
  public async getStats(): Promise<ProjectStats> {
    const projects = Array.from(this.projects.values());
    
    const stats: ProjectStats = {
      totalProjects: projects.length,
      runningProjects: projects.filter(p => p.status === 'running').length,
      buildingProjects: projects.filter(p => p.status === 'building').length,
      errorProjects: projects.filter(p => p.status === 'error').length,
      diskUsage: 0,
    };
    
    // 计算磁盘使用量
    try {
      for (const project of projects) {
        if (await fs.pathExists(project.path)) {
          const size = await this.getDirectorySize(project.path);
          stats.diskUsage += size;
        }
      }
    } catch (error) {
      logger.error('Failed to calculate disk usage:', error);
    }
    
    return stats;
  }

  // 从模板创建项目
  private async createFromTemplate(project: Project, template: string): Promise<void> {
    const templatePath = path.join(config.paths.templates, template);

    logger.info(`Looking for template at: ${templatePath}`);
    logger.info(`Templates directory: ${config.paths.templates}`);
    logger.info(`Current working directory: ${process.cwd()}`);

    // 检查模板目录是否存在
    const templatesDir = config.paths.templates;
    const templatesDirExists = await fs.pathExists(templatesDir);
    logger.info(`Templates directory exists: ${templatesDirExists}`);

    if (templatesDirExists) {
      const templatesList = await fs.readdir(templatesDir);
      logger.info(`Available templates: ${templatesList.join(', ')}`);
    }

    if (!(await fs.pathExists(templatePath))) {
      throw new AppError(`Template not found: ${template} at ${templatePath}`, 404);
    }
    
    // 复制模板文件
    await fs.copy(templatePath, project.path, {
      filter: (src) => {
        const basename = path.basename(src);
        return !['node_modules', '.git', 'dist', 'build'].includes(basename);
      },
    });
    
    // 更新package.json
    const packageJsonPath = path.join(project.path, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      packageJson.name = project.name;
      packageJson.description = project.description;
      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    }
  }

  // 初始化Git仓库
  private async initGitRepository(project: Project): Promise<void> {
    const gitProcess = spawn('git', ['init'], {
      cwd: project.path,
      stdio: 'pipe',
    });
    
    await new Promise<void>((resolve, reject) => {
      gitProcess.on('exit', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Git init failed with exit code ${code}`));
        }
      });
      
      gitProcess.on('error', reject);
    });
  }

  // 安装依赖
  private async installDependencies(project: Project): Promise<void> {
    const command = this.getInstallCommand(project.packageManager);
    
    const installProcess = spawn(command.cmd, command.args, {
      cwd: project.path,
      stdio: 'pipe',
    });
    
    await new Promise<void>((resolve, reject) => {
      installProcess.on('exit', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Dependency installation failed with exit code ${code}`));
        }
      });
      
      installProcess.on('error', reject);
    });
  }

  // 获取开发命令
  private getDevCommand(packageManager: string): { cmd: string; args: string[] } {
    switch (packageManager) {
      case 'yarn':
        return { cmd: 'yarn', args: ['dev'] };
      case 'pnpm':
        return { cmd: 'pnpm', args: ['dev'] };
      default:
        return { cmd: 'npm', args: ['run', 'dev'] };
    }
  }

  // 获取构建命令
  private getBuildCommand(packageManager: string): { cmd: string; args: string[] } {
    switch (packageManager) {
      case 'yarn':
        return { cmd: 'yarn', args: ['build'] };
      case 'pnpm':
        return { cmd: 'pnpm', args: ['build'] };
      default:
        return { cmd: 'npm', args: ['run', 'build'] };
    }
  }

  // 获取安装命令
  private getInstallCommand(packageManager: string): { cmd: string; args: string[] } {
    switch (packageManager) {
      case 'yarn':
        return { cmd: 'yarn', args: ['install'] };
      case 'pnpm':
        return { cmd: 'pnpm', args: ['install'] };
      default:
        return { cmd: 'npm', args: ['install'] };
    }
  }

  // 查找可用端口
  private async findAvailablePort(startPort: number = 3000): Promise<number> {
    // const net = require('net');
    
    for (let port = startPort; port < startPort + 100; port++) {
      if (await this.isPortAvailable(port)) {
        return port;
      }
    }
    
    throw new Error('No available port found');
  }

  // 检查端口是否可用
  private isPortAvailable(port: number): Promise<boolean> {
    const net = require('net');
    
    return new Promise((resolve) => {
      const server = net.createServer();
      
      server.listen(port, () => {
        server.close(() => resolve(true));
      });
      
      server.on('error', () => resolve(false));
    });
  }

  // 设置进程监听器
  private setupProcessListeners(childProcess: ChildProcess, project: Project): void {
    childProcess.on('exit', async (code, signal) => {
      logger.info(`Project process exited: ${project.name} (code: ${code}, signal: ${signal})`);
      
      project.status = 'idle';
      project.pid = undefined;
      project.port = undefined;
      
      this.processes.delete(project.id);
      await this.saveProjects();
    });
    
    childProcess.on('error', async (error) => {
      logger.error(`Project process error: ${project.name}`, error);
      
      project.status = 'error';
      this.processes.delete(project.id);
      await this.saveProjects();
    });
  }

  // 获取目录大小
  private async getDirectorySize(dirPath: string): Promise<number> {
    let totalSize = 0;
    
    try {
      const items = await fs.readdir(dirPath);
      
      for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = await fs.stat(itemPath);
        
        if (stats.isDirectory()) {
          if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
            totalSize += await this.getDirectorySize(itemPath);
          }
        } else {
          totalSize += stats.size;
        }
      }
    } catch (error) {
      // 忽略权限错误等
    }
    
    return totalSize;
  }

  // 预览项目
  public async previewProject(projectId: string): Promise<void> {
    const project = this.getProject(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // 检查是否已经有预览进程在运行
    const existingProcess = this.processes.get(`${projectId}-preview`);
    if (existingProcess) {
      throw new AppError('Preview is already running', 400);
    }

    // 检查构建产物是否存在
    const distPath = path.join(project.path, 'dist');
    if (!(await fs.pathExists(distPath))) {
      throw new AppError('Build artifacts not found. Please build the project first.', 400);
    }

    // 启动预览服务器
    const previewProcess = spawn('npx', ['serve', 'dist', '-p', '0'], {
      cwd: project.path,
      stdio: 'pipe',
    });

    this.processes.set(`${projectId}-preview`, {
      process: previewProcess,
      type: 'preview',
      startTime: new Date(),
    });

    // 更新项目状态
    project.status = 'previewing';
    project.lastActivity = new Date();
    this.saveProjectsDebounced();

    logger.info(`Preview started for project: ${project.name}`);
  }

  // 测试项目
  public async testProject(projectId: string): Promise<void> {
    const project = this.getProject(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // 检查是否已经有测试进程在运行
    const existingProcess = this.processes.get(`${projectId}-test`);
    if (existingProcess) {
      throw new AppError('Tests are already running', 400);
    }

    // 启动测试
    const testProcess = spawn('npm', ['test'], {
      cwd: project.path,
      stdio: 'pipe',
    });

    this.processes.set(`${projectId}-test`, {
      process: testProcess,
      type: 'test',
      startTime: new Date(),
    });

    // 更新项目状态
    project.status = 'testing';
    project.lastActivity = new Date();
    this.saveProjectsDebounced();

    logger.info(`Tests started for project: ${project.name}`);
  }

  // 获取 Git 状态
  public async getGitStatus(projectId: string): Promise<any> {
    const project = this.getProject(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    const gitDir = path.join(project.path, '.git');
    if (!(await fs.pathExists(gitDir))) {
      throw new AppError('Not a git repository', 400);
    }

    try {
      // 获取当前分支
      const branchResult = await this.execGitCommand(project.path, ['branch', '--show-current']);
      const currentBranch = branchResult.trim() || 'main';

      // 获取所有分支
      const branchesResult = await this.execGitCommand(project.path, ['branch']);
      const branches = branchesResult
        .split('\n')
        .filter(line => line.trim())
        .map(line => ({
          name: line.replace(/^\*\s*/, '').trim(),
          current: line.startsWith('*')
        }));

      // 获取状态
      const statusResult = await this.execGitCommand(project.path, ['status', '--porcelain']);
      const hasChanges = statusResult.trim().length > 0;
      const changedFiles = statusResult.split('\n').filter(line => line.trim()).length;

      // 获取提交历史
      const logResult = await this.execGitCommand(project.path, [
        'log', '--oneline', '--max-count=10', '--pretty=format:%H|%s|%an|%ad'
      ]);
      const commits = logResult
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          const [hash, message, author, date] = line.split('|');
          return {
            hash,
            message,
            author,
            date: new Date(date)
          };
        });

      return {
        currentBranch,
        status: hasChanges ? 'dirty' : 'clean',
        hasChanges,
        hasCommits: commits.length > 0,
        changedFiles,
        branches,
        commits
      };
    } catch (error: any) {
      logger.error(`Failed to get git status for project ${projectId}:`, error);
      throw new AppError(`Git status failed: ${error.message}`, 500);
    }
  }

  // 执行 Git 命令
  private async execGitCommand(cwd: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      const gitProcess = spawn('git', args, {
        cwd,
        stdio: 'pipe',
      });

      let stdout = '';
      let stderr = '';

      gitProcess.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      gitProcess.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      gitProcess.on('exit', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(stderr || `Git command failed with exit code ${code}`));
        }
      });

      gitProcess.on('error', (error) => {
        reject(error);
      });
    });
  }

  // 清理资源
  public async cleanup(): Promise<void> {
    // 停止所有进程
    for (const [, processInfo] of this.processes) {
      processInfo.process.kill('SIGTERM');
    }
    
    // 关闭文件监听器
    for (const [, watcher] of this.watchers) {
      await watcher.close();
    }
    
    // 保存项目数据
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      await this.saveProjects();
    }
    
    logger.info('ProjectService cleanup completed');
  }
}