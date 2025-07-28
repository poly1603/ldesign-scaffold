# Git 管理

LDesign Scaffold 提供了完整的 Git 集成功能，帮助你管理项目的版本控制。

## 自动 Git 初始化

### 项目创建时初始化

创建项目时自动初始化 Git 仓库：

```bash
ldesign-scaffold create my-project --git
```

**自动执行的操作：**
1. 初始化 Git 仓库 (`git init`)
2. 创建 `.gitignore` 文件
3. 添加所有文件到暂存区
4. 创建初始提交

### 配置 Git 信息

```bash
# 设置全局用户信息
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 或在项目创建时指定
ldesign-scaffold create my-project \
  --git \
  --git-user "Your Name" \
  --git-email "your.email@example.com"
```

## Git 配置文件

### .gitignore 模板

根据项目类型自动生成 `.gitignore`：

**Vue/React 项目：**
```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/
.output/

# Environment files
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Coverage
coverage/
.nyc_output/

# Cache
.cache/
.parcel-cache/
.vite/
```

**Node.js API 项目：**
```gitignore
# Dependencies
node_modules/
npm-debug.log*

# Build outputs
dist/
build/

# Environment files
.env
.env.*.local

# Logs
logs/
*.log

# Database
*.sqlite
*.db

# Uploads
uploads/
temp/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

### Git 属性配置

自动创建 `.gitattributes` 文件：

```gitattributes
# Auto detect text files and perform LF normalization
* text=auto

# Force LF for specific files
*.js text eol=lf
*.ts text eol=lf
*.vue text eol=lf
*.json text eol=lf
*.md text eol=lf

# Binary files
*.png binary
*.jpg binary
*.jpeg binary
*.gif binary
*.ico binary
*.woff binary
*.woff2 binary
*.ttf binary
*.eot binary
```

## 提交规范

### Conventional Commits

自动配置 Conventional Commits 规范：

**提交格式：**
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**提交类型：**
- `feat` - 新功能
- `fix` - 修复 bug
- `docs` - 文档更新
- `style` - 代码格式（不影响功能）
- `refactor` - 重构
- `perf` - 性能优化
- `test` - 测试相关
- `chore` - 构建过程或辅助工具的变动

**示例：**
```bash
git commit -m "feat(auth): add user login functionality"
git commit -m "fix(api): resolve data fetching issue"
git commit -m "docs(readme): update installation guide"
```

### Commitlint 配置

自动配置 commitlint：

**commitlint.config.js：**
```javascript
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'chore',
        'revert'
      ]
    ],
    'subject-max-length': [2, 'always', 100],
    'subject-case': [2, 'never', ['pascal-case', 'upper-case']]
  }
}
```

## Git 钩子

### Husky 集成

自动配置 Husky Git 钩子：

**pre-commit 钩子：**
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# 运行代码检查
npm run lint

# 运行测试
npm run test

# 检查类型
npm run type-check
```

**commit-msg 钩子：**
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# 验证提交信息格式
npx --no -- commitlint --edit $1
```

**pre-push 钩子：**
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# 运行完整测试套件
npm run test:ci

# 构建检查
npm run build
```

### 自定义钩子

添加自定义 Git 钩子：

```bash
# 添加 pre-commit 钩子
ldesign-scaffold git add-hook pre-commit "npm run lint && npm run test"

# 添加 commit-msg 钩子
ldesign-scaffold git add-hook commit-msg "commitlint --edit $1"
```

## 分支管理

### Git Flow 集成

支持 Git Flow 工作流：

```bash
# 初始化 Git Flow
ldesign-scaffold git flow init

# 创建功能分支
ldesign-scaffold git flow feature start my-feature

# 完成功能分支
ldesign-scaffold git flow feature finish my-feature

# 创建发布分支
ldesign-scaffold git flow release start 1.0.0

# 完成发布分支
ldesign-scaffold git flow release finish 1.0.0
```

### 分支保护规则

配置分支保护规则：

```javascript
// .github/branch-protection.js
export default {
  branches: {
    main: {
      protection: {
        required_status_checks: {
          strict: true,
          contexts: ['ci/build', 'ci/test']
        },
        enforce_admins: true,
        required_pull_request_reviews: {
          required_approving_review_count: 2,
          dismiss_stale_reviews: true
        },
        restrictions: null
      }
    }
  }
}
```

## 远程仓库管理

### 添加远程仓库

```bash
# 添加 GitHub 仓库
ldesign-scaffold git remote add origin https://github.com/user/repo.git

# 添加 GitLab 仓库
ldesign-scaffold git remote add origin https://gitlab.com/user/repo.git

# 添加 Gitee 仓库
ldesign-scaffold git remote add origin https://gitee.com/user/repo.git
```

### 推送到远程仓库

```bash
# 首次推送
ldesign-scaffold git push --set-upstream origin main

# 推送所有分支和标签
ldesign-scaffold git push --all --tags
```

## 版本管理

### 语义化版本

自动管理语义化版本：

```bash
# 补丁版本 (1.0.0 -> 1.0.1)
ldesign-scaffold version patch

# 次要版本 (1.0.0 -> 1.1.0)
ldesign-scaffold version minor

# 主要版本 (1.0.0 -> 2.0.0)
ldesign-scaffold version major
```

### 自动生成 CHANGELOG

基于提交历史生成变更日志：

**CHANGELOG.md：**
```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2024-01-15

### Added
- feat(auth): add user login functionality
- feat(api): add data export feature

### Fixed
- fix(ui): resolve button styling issue
- fix(api): fix data validation error

### Changed
- refactor(core): improve error handling

## [1.0.0] - 2024-01-01

### Added
- Initial release
```

### Git 标签管理

```bash
# 创建标签
ldesign-scaffold git tag v1.0.0

# 创建带注释的标签
ldesign-scaffold git tag v1.0.0 -m "Release version 1.0.0"

# 推送标签
ldesign-scaffold git push --tags

# 删除标签
ldesign-scaffold git tag -d v1.0.0
```

## 子模块管理

### 添加子模块

```bash
# 添加子模块
ldesign-scaffold git submodule add https://github.com/user/shared-lib.git lib/shared

# 初始化子模块
ldesign-scaffold git submodule init

# 更新子模块
ldesign-scaffold git submodule update
```

### 子模块配置

**.gitmodules：**
```ini
[submodule "lib/shared"]
    path = lib/shared
    url = https://github.com/user/shared-lib.git
    branch = main
```

## CI/CD 集成

### GitHub Actions

自动生成 GitHub Actions 工作流：

**.github/workflows/ci.yml：**
```yaml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18, 20]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'pnpm'
    
    - name: Install dependencies
      run: pnpm install
    
    - name: Run linter
      run: pnpm run lint
    
    - name: Run tests
      run: pnpm run test
    
    - name: Build project
      run: pnpm run build
```

### GitLab CI

**.gitlab-ci.yml：**
```yaml
stages:
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "18"

test:
  stage: test
  image: node:$NODE_VERSION
  script:
    - npm install -g pnpm
    - pnpm install
    - pnpm run lint
    - pnpm run test
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'

build:
  stage: build
  image: node:$NODE_VERSION
  script:
    - npm install -g pnpm
    - pnpm install
    - pnpm run build
  artifacts:
    paths:
      - dist/
```

## Git 工具命令

### 常用 Git 操作

```bash
# 查看状态
ldesign-scaffold git status

# 查看提交历史
ldesign-scaffold git log --oneline

# 查看分支
ldesign-scaffold git branch -a

# 切换分支
ldesign-scaffold git checkout develop

# 创建并切换分支
ldesign-scaffold git checkout -b feature/new-feature

# 合并分支
ldesign-scaffold git merge feature/new-feature

# 删除分支
ldesign-scaffold git branch -d feature/new-feature
```

### Git 别名配置

自动配置有用的 Git 别名：

```bash
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual '!gitk'
```

## 故障排除

### 常见问题

1. **提交被拒绝**
   ```bash
   # 检查提交信息格式
   git log --oneline -1
   
   # 修改最后一次提交
   git commit --amend -m "feat: correct commit message"
   ```

2. **合并冲突**
   ```bash
   # 查看冲突文件
   git status
   
   # 解决冲突后
   git add .
   git commit -m "resolve merge conflicts"
   ```

3. **子模块问题**
   ```bash
   # 重新初始化子模块
   git submodule deinit --all
   git submodule init
   git submodule update
   ```

### 重置和恢复

```bash
# 撤销工作区修改
ldesign-scaffold git checkout -- <file>

# 撤销暂存区修改
ldesign-scaffold git reset HEAD <file>

# 撤销最后一次提交
ldesign-scaffold git reset --soft HEAD~1

# 强制重置到远程分支
ldesign-scaffold git reset --hard origin/main
```

## 下一步

- [Docker 支持](/guide/docker-support) - 了解容器化部署
- [自定义模板](/guide/custom-templates) - 学习模板定制
- [环境检测](/guide/environment-check) - 检查开发环境
