import { Router } from 'express';
import simpleGit, { SimpleGit } from 'simple-git';
import fs from 'fs-extra';
import path from 'path';
import { validateRequest, commonSchemas } from '../middleware/validation';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { ProjectService } from '../services/project';

const router = Router();
const projectService = new ProjectService();

// 获取项目Git状态
router.get('/:projectId/status',
  validateRequest({ params: commonSchemas.projectId }),
  asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    
    const project = projectService.getProject(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found',
        },
      });
    }
    
    const git = simpleGit(project.path);
    
    try {
      // 检查是否是Git仓库
      const isRepo = await git.checkIsRepo();
      if (!isRepo) {
        return res.json({
          success: true,
          data: {
            isRepository: false,
            message: 'Not a Git repository',
          },
        });
      }
      
      // 获取Git状态
      const [status, branches, remotes, log] = await Promise.all([
        git.status(),
        git.branch(),
        git.getRemotes(true),
        git.log({ maxCount: 10 }),
      ]);
      
      const gitStatus = {
        isRepository: true,
        currentBranch: status.current,
        tracking: status.tracking,
        ahead: status.ahead,
        behind: status.behind,
        staged: status.staged,
        modified: status.modified,
        not_added: status.not_added,
        deleted: status.deleted,
        renamed: status.renamed,
        conflicted: status.conflicted,
        created: status.created,
        isClean: status.isClean(),
        branches: {
          current: branches.current,
          all: branches.all,
          local: branches.all.filter(b => !b.startsWith('remotes/')),
          remote: branches.all.filter(b => b.startsWith('remotes/')),
        },
        remotes: remotes.map(remote => ({
          name: remote.name,
          refs: remote.refs,
        })),
        lastCommits: log.all.map(commit => ({
          hash: commit.hash,
          date: commit.date,
          message: commit.message,
          author: commit.author_name,
          email: commit.author_email,
        })),
      };
      
      res.json({
        success: true,
        data: gitStatus,
      });
    } catch (error: any) {
      logger.error(`Failed to get Git status for project ${projectId}:`, error);
      res.status(400).json({
        success: false,
        error: {
          code: 'GIT_ERROR',
          message: error.message || 'Failed to get Git status',
        },
      });
    }
  })
);

// 初始化Git仓库
router.post('/:projectId/init',
  validateRequest({ params: commonSchemas.projectId }),
  asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { initialBranch = 'main' } = req.body;
    
    const project = projectService.getProject(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found',
        },
      });
    }
    
    const git = simpleGit(project.path);
    
    try {
      // 检查是否已经是Git仓库
      const isRepo = await git.checkIsRepo();
      if (isRepo) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'ALREADY_GIT_REPO',
            message: 'Directory is already a Git repository',
          },
        });
      }
      
      // 初始化Git仓库
      await git.init();
      
      // 设置初始分支
      if (initialBranch !== 'master') {
        await git.checkoutLocalBranch(initialBranch);
      }
      
      // 创建.gitignore文件
      const gitignorePath = path.join(project.path, '.gitignore');
      if (!(await fs.pathExists(gitignorePath))) {
        const gitignoreContent = getDefaultGitignore(project.template);
        await fs.writeFile(gitignorePath, gitignoreContent);
      }
      
      logger.info(`Git repository initialized for project ${projectId}`);
      
      res.json({
        success: true,
        data: {
          initialBranch,
          message: 'Git repository initialized successfully',
        },
      });
    } catch (error: any) {
      logger.error(`Failed to initialize Git repository for project ${projectId}:`, error);
      res.status(400).json({
        success: false,
        error: {
          code: 'GIT_INIT_FAILED',
          message: error.message || 'Failed to initialize Git repository',
        },
      });
    }
  })
);

// 添加文件到暂存区
router.post('/:projectId/add',
  validateRequest({ params: commonSchemas.projectId }),
  asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { files = ['.'] } = req.body;
    
    const project = projectService.getProject(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found',
        },
      });
    }
    
    const git = simpleGit(project.path);
    
    try {
      await git.add(files);
      
      logger.info(`Files added to staging area for project ${projectId}:`, files);
      
      res.json({
        success: true,
        data: {
          files,
          message: 'Files added to staging area successfully',
        },
      });
    } catch (error: any) {
      logger.error(`Failed to add files for project ${projectId}:`, error);
      res.status(400).json({
        success: false,
        error: {
          code: 'GIT_ADD_FAILED',
          message: error.message || 'Failed to add files',
        },
      });
    }
  })
);

// 提交更改
router.post('/:projectId/commit',
  validateRequest({ 
    params: commonSchemas.projectId,
    body: commonSchemas.gitCommit,
  }),
  asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { message, files } = req.body;
    
    const project = projectService.getProject(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found',
        },
      });
    }
    
    const git = simpleGit(project.path);
    
    try {
      // 添加指定文件到暂存区
      if (files && files.length > 0) {
        await git.add(files);
      }
      
      // 提交更改
      const result = await git.commit(message);
      
      logger.info(`Commit created for project ${projectId}: ${result.commit}`);
      
      res.json({
        success: true,
        data: {
          commit: result.commit,
          summary: result.summary,
          message,
          files,
        },
      });
    } catch (error: any) {
      logger.error(`Failed to commit changes for project ${projectId}:`, error);
      res.status(400).json({
        success: false,
        error: {
          code: 'GIT_COMMIT_FAILED',
          message: error.message || 'Failed to commit changes',
        },
      });
    }
  })
);

// 推送到远程仓库
router.post('/:projectId/push',
  validateRequest({ params: commonSchemas.projectId }),
  asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { remote = 'origin', branch, force = false } = req.body;
    
    const project = projectService.getProject(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found',
        },
      });
    }
    
    const git = simpleGit(project.path);
    
    try {
      const currentBranch = branch || (await git.branch()).current;
      
      let result;
      if (force) {
        result = await git.push(remote, currentBranch, ['--force']);
      } else {
        result = await git.push(remote, currentBranch);
      }
      
      logger.info(`Pushed to remote for project ${projectId}: ${remote}/${currentBranch}`);
      
      res.json({
        success: true,
        data: {
          remote,
          branch: currentBranch,
          force,
          result,
        },
      });
    } catch (error: any) {
      logger.error(`Failed to push for project ${projectId}:`, error);
      res.status(400).json({
        success: false,
        error: {
          code: 'GIT_PUSH_FAILED',
          message: error.message || 'Failed to push to remote',
        },
      });
    }
  })
);

// 从远程仓库拉取
router.post('/:projectId/pull',
  validateRequest({ params: commonSchemas.projectId }),
  asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { remote = 'origin', branch } = req.body;
    
    const project = projectService.getProject(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found',
        },
      });
    }
    
    const git = simpleGit(project.path);
    
    try {
      const currentBranch = branch || (await git.branch()).current;
      const result = await git.pull(remote, currentBranch);
      
      logger.info(`Pulled from remote for project ${projectId}: ${remote}/${currentBranch}`);
      
      res.json({
        success: true,
        data: {
          remote,
          branch: currentBranch,
          result,
        },
      });
    } catch (error: any) {
      logger.error(`Failed to pull for project ${projectId}:`, error);
      res.status(400).json({
        success: false,
        error: {
          code: 'GIT_PULL_FAILED',
          message: error.message || 'Failed to pull from remote',
        },
      });
    }
  })
);

// 创建分支
router.post('/:projectId/branches',
  validateRequest({ 
    params: commonSchemas.projectId,
    body: commonSchemas.gitBranch,
  }),
  asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { name, from } = req.body;
    
    const project = projectService.getProject(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found',
        },
      });
    }
    
    const git = simpleGit(project.path);
    
    try {
      // 检查分支是否已存在
      const branches = await git.branch();
      if (branches.all.includes(name)) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'BRANCH_EXISTS',
            message: `Branch '${name}' already exists`,
          },
        });
      }
      
      // 创建分支
      if (from) {
        await git.checkoutBranch(name, from);
      } else {
        await git.checkoutLocalBranch(name);
      }
      
      logger.info(`Branch created for project ${projectId}: ${name}`);
      
      res.json({
        success: true,
        data: {
          name,
          from: from || branches.current,
          message: 'Branch created successfully',
        },
      });
    } catch (error: any) {
      logger.error(`Failed to create branch for project ${projectId}:`, error);
      res.status(400).json({
        success: false,
        error: {
          code: 'GIT_BRANCH_CREATE_FAILED',
          message: error.message || 'Failed to create branch',
        },
      });
    }
  })
);

// 切换分支
router.post('/:projectId/checkout',
  validateRequest({ params: commonSchemas.projectId }),
  asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { branch } = req.body;
    
    if (!branch) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BRANCH_REQUIRED',
          message: 'Branch name is required',
        },
      });
    }
    
    const project = projectService.getProject(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found',
        },
      });
    }
    
    const git = simpleGit(project.path);
    
    try {
      await git.checkout(branch);
      
      logger.info(`Checked out branch for project ${projectId}: ${branch}`);
      
      res.json({
        success: true,
        data: {
          branch,
          message: 'Branch checked out successfully',
        },
      });
    } catch (error: any) {
      logger.error(`Failed to checkout branch for project ${projectId}:`, error);
      res.status(400).json({
        success: false,
        error: {
          code: 'GIT_CHECKOUT_FAILED',
          message: error.message || 'Failed to checkout branch',
        },
      });
    }
  })
);

// 删除分支
router.delete('/:projectId/branches/:branchName',
  validateRequest({ params: commonSchemas.projectId }),
  asyncHandler(async (req, res) => {
    const { projectId, branchName } = req.params;
    const { force = false } = req.query as any;
    
    const project = projectService.getProject(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found',
        },
      });
    }
    
    const git = simpleGit(project.path);
    
    try {
      const branches = await git.branch();
      
      // 不能删除当前分支
      if (branches.current === branchName) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'CANNOT_DELETE_CURRENT_BRANCH',
            message: 'Cannot delete the current branch',
          },
        });
      }
      
      // 删除分支
      if (force === 'true') {
        await git.deleteLocalBranch(branchName, true);
      } else {
        await git.deleteLocalBranch(branchName);
      }
      
      logger.info(`Branch deleted for project ${projectId}: ${branchName}`);
      
      res.json({
        success: true,
        data: {
          branch: branchName,
          force: force === 'true',
          message: 'Branch deleted successfully',
        },
      });
    } catch (error: any) {
      logger.error(`Failed to delete branch for project ${projectId}:`, error);
      res.status(400).json({
        success: false,
        error: {
          code: 'GIT_BRANCH_DELETE_FAILED',
          message: error.message || 'Failed to delete branch',
        },
      });
    }
  })
);

// 合并分支
router.post('/:projectId/merge',
  validateRequest({ params: commonSchemas.projectId }),
  asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { branch, noFastForward = false } = req.body;
    
    if (!branch) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BRANCH_REQUIRED',
          message: 'Branch name is required',
        },
      });
    }
    
    const project = projectService.getProject(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found',
        },
      });
    }
    
    const git = simpleGit(project.path);
    
    try {
      const currentBranch = (await git.branch()).current;
      
      let result;
      if (noFastForward) {
        result = await git.merge([branch, '--no-ff']);
      } else {
        result = await git.merge([branch]);
      }
      
      logger.info(`Branch merged for project ${projectId}: ${branch} into ${currentBranch}`);
      
      res.json({
        success: true,
        data: {
          from: branch,
          to: currentBranch,
          noFastForward,
          result,
        },
      });
    } catch (error: any) {
      logger.error(`Failed to merge branch for project ${projectId}:`, error);
      res.status(400).json({
        success: false,
        error: {
          code: 'GIT_MERGE_FAILED',
          message: error.message || 'Failed to merge branch',
        },
      });
    }
  })
);

// 获取提交历史
router.get('/:projectId/log',
  validateRequest({ params: commonSchemas.projectId }),
  asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { limit = 20, skip = 0, branch } = req.query as any;
    
    const project = projectService.getProject(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found',
        },
      });
    }
    
    const git = simpleGit(project.path);
    
    try {
      const options: any = {
        maxCount: parseInt(limit, 10),
        from: skip ? parseInt(skip, 10) : undefined,
      };
      
      if (branch) {
        options.from = branch;
      }
      
      const log = await git.log(options);
      
      const commits = log.all.map(commit => ({
        hash: commit.hash,
        date: commit.date,
        message: commit.message,
        author: {
          name: commit.author_name,
          email: commit.author_email,
        },
        refs: commit.refs,
      }));
      
      res.json({
        success: true,
        data: {
          commits,
          total: log.total,
          latest: log.latest,
        },
      });
    } catch (error: any) {
      logger.error(`Failed to get commit log for project ${projectId}:`, error);
      res.status(400).json({
        success: false,
        error: {
          code: 'GIT_LOG_FAILED',
          message: error.message || 'Failed to get commit log',
        },
      });
    }
  })
);

// 添加远程仓库
router.post('/:projectId/remotes',
  validateRequest({ params: commonSchemas.projectId }),
  asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { name, url } = req.body;
    
    if (!name || !url) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NAME_AND_URL_REQUIRED',
          message: 'Remote name and URL are required',
        },
      });
    }
    
    const project = projectService.getProject(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found',
        },
      });
    }
    
    const git = simpleGit(project.path);
    
    try {
      await git.addRemote(name, url);
      
      logger.info(`Remote added for project ${projectId}: ${name} -> ${url}`);
      
      res.json({
        success: true,
        data: {
          name,
          url,
          message: 'Remote added successfully',
        },
      });
    } catch (error: any) {
      logger.error(`Failed to add remote for project ${projectId}:`, error);
      res.status(400).json({
        success: false,
        error: {
          code: 'GIT_REMOTE_ADD_FAILED',
          message: error.message || 'Failed to add remote',
        },
      });
    }
  })
);

// 辅助函数

// 获取默认.gitignore内容
function getDefaultGitignore(template: string): string {
  const common = `
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
`;
  
  const templateSpecific: Record<string, string> = {
    vue3: `
# Vue
dist/
.temp/
.cache/

# Vite
.vite/
`,
    react: `
# React
build/
.cache/

# Vite
.vite/
`,
    typescript: `
# TypeScript
*.tsbuildinfo
dist/
lib/
`,
    nodejs: `
# Node.js
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock
`,
    less: `
# Less
*.css
*.css.map
`,
  };
  
  return common + (templateSpecific[template] || '');
}

export default router;