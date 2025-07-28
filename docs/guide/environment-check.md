# 环境检测

LDesign Scaffold 提供了全面的开发环境检测功能，帮助你确保开发环境配置正确。

## 运行环境检测

### 基本检测

```bash
ldesign-scaffold doctor
```

这将检查你的开发环境，包括：
- Node.js 版本
- 包管理器可用性
- Git 配置
- Docker 状态
- IDE 支持

### 详细检测

```bash
ldesign-scaffold doctor --verbose
```

显示更详细的检测信息和建议。

### 检测特定组件

```bash
# 只检测 Node.js 环境
ldesign-scaffold doctor --node

# 只检测 Git 配置
ldesign-scaffold doctor --git

# 只检测 Docker 状态
ldesign-scaffold doctor --docker
```

## 检测项目

### Node.js 环境

**检测内容：**
- Node.js 版本是否满足要求（>= 18.0.0）
- npm 版本和配置
- 全局包安装情况

**检测结果示例：**
```
✅ Node.js 环境
  版本: v20.10.0 (推荐)
  路径: /usr/local/bin/node
  架构: x64
  平台: darwin
```

**常见问题和解决方案：**
```
❌ Node.js 版本过低 (v16.14.0)
  建议: 升级到 Node.js 18.0.0 或更高版本
  解决: 使用 nvm 管理 Node.js 版本
    nvm install 20
    nvm use 20
```

### 包管理器

**检测内容：**
- pnpm 可用性和版本
- npm 可用性和版本
- yarn 可用性和版本
- 镜像源配置

**检测结果示例：**
```
✅ 包管理器
  pnpm: v8.15.1 (推荐)
  npm: v10.2.4
  yarn: v1.22.19
  
  镜像源配置:
  npm: https://registry.npmjs.org/
  pnpm: https://registry.npmjs.org/
```

**配置建议：**
```bash
# 安装 pnpm (推荐)
npm install -g pnpm

# 配置国内镜像源 (可选)
pnpm config set registry https://registry.npmmirror.com/
```

### Git 配置

**检测内容：**
- Git 版本
- 用户配置 (user.name, user.email)
- SSH 密钥配置
- 常用别名设置

**检测结果示例：**
```
✅ Git 配置
  版本: git version 2.42.0
  用户名: John Doe
  邮箱: john@example.com
  SSH 密钥: ~/.ssh/id_rsa (已配置)
```

**配置建议：**
```bash
# 配置用户信息
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 生成 SSH 密钥
ssh-keygen -t rsa -b 4096 -C "your.email@example.com"

# 配置有用的别名
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
```

### Docker 环境

**检测内容：**
- Docker 安装状态
- Docker 版本
- Docker 服务运行状态
- Docker Compose 可用性

**检测结果示例：**
```
✅ Docker 环境
  Docker: 24.0.7 (运行中)
  Docker Compose: v2.23.0
  存储驱动: overlay2
  容器运行时: runc
```

**故障排除：**
```
❌ Docker 未运行
  解决: 启动 Docker 服务
    # macOS
    open -a Docker
    
    # Linux
    sudo systemctl start docker
    
    # Windows
    启动 Docker Desktop
```

### IDE 支持

**检测内容：**
- VS Code 安装和版本
- WebStorm 安装和版本
- 推荐扩展安装情况

**检测结果示例：**
```
✅ IDE 支持
  VS Code: 1.85.1 (已安装)
    - Vue Language Features (Volar): ✅
    - TypeScript Vue Plugin: ✅
    - ESLint: ✅
    - Prettier: ✅
  
  WebStorm: 2023.3 (已安装)
```

**推荐扩展：**
```
VS Code 推荐扩展:
- Vue Language Features (Volar)
- TypeScript Vue Plugin (Volar)
- ESLint
- Prettier - Code formatter
- Auto Rename Tag
- Bracket Pair Colorizer
- GitLens
```

## 系统要求检测

### 操作系统

**支持的系统：**
- Windows 10/11
- macOS 10.15+
- Ubuntu 18.04+
- CentOS 7+

**检测结果示例：**
```
✅ 操作系统
  系统: macOS 14.2.1
  架构: arm64
  内存: 16 GB
  磁盘空间: 256 GB 可用
```

### 网络连接

**检测内容：**
- 网络连接状态
- npm 注册表访问
- GitHub 访问
- 代理配置

**检测结果示例：**
```
✅ 网络连接
  npm 注册表: https://registry.npmjs.org/ (可访问)
  GitHub: https://github.com (可访问)
  代理: 未配置
```

**网络问题解决：**
```bash
# 配置代理 (如果需要)
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# 配置镜像源 (国内用户)
npm config set registry https://registry.npmmirror.com/
```

## 项目特定检测

### 检测现有项目

在项目目录中运行检测：

```bash
cd my-project
ldesign-scaffold doctor --project
```

**检测内容：**
- 项目类型识别
- 依赖安装状态
- 配置文件完整性
- 构建工具配置

**检测结果示例：**
```
✅ 项目检测
  项目类型: Vue 3 项目
  包管理器: pnpm
  依赖状态: 已安装 (234 个包)
  
  配置文件:
  ✅ package.json
  ✅ vite.config.ts
  ✅ tsconfig.json
  ✅ eslint.config.js
  
  脚本命令:
  ✅ dev
  ✅ build
  ✅ preview
  ✅ lint
```

### 依赖检测

**检测内容：**
- 依赖版本兼容性
- 安全漏洞检查
- 过时依赖提醒

```bash
# 检查依赖安全性
ldesign-scaffold doctor --security

# 检查依赖更新
ldesign-scaffold doctor --updates
```

## 性能检测

### 系统性能

**检测内容：**
- CPU 性能
- 内存使用情况
- 磁盘 I/O 性能
- 网络延迟

**检测结果示例：**
```
✅ 系统性能
  CPU: Apple M2 Pro (12 核)
  内存: 16 GB (使用率: 45%)
  磁盘: SSD (读取: 2.8 GB/s, 写入: 2.1 GB/s)
  网络延迟: npm 注册表 45ms
```

### 构建性能

**检测内容：**
- Node.js 性能
- 包管理器性能
- 构建工具性能

```bash
# 运行性能基准测试
ldesign-scaffold doctor --benchmark
```

## 自动修复

### 常见问题自动修复

```bash
# 自动修复检测到的问题
ldesign-scaffold doctor --fix

# 只修复特定类型的问题
ldesign-scaffold doctor --fix --git
ldesign-scaffold doctor --fix --npm
```

**可自动修复的问题：**
- Git 用户配置缺失
- npm 镜像源配置
- 基本的 Git 别名设置
- 缺失的配置文件

### 交互式修复

```bash
# 交互式修复向导
ldesign-scaffold doctor --interactive
```

这将引导你逐步解决检测到的问题。

## 生成检测报告

### 详细报告

```bash
# 生成详细的检测报告
ldesign-scaffold doctor --report

# 保存报告到文件
ldesign-scaffold doctor --report --output doctor-report.json
```

**报告格式：**
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "system": {
    "os": "darwin",
    "arch": "arm64",
    "node": "20.10.0",
    "npm": "10.2.4"
  },
  "checks": [
    {
      "name": "Node.js 版本",
      "status": "pass",
      "message": "Node.js v20.10.0 满足要求",
      "details": {
        "version": "20.10.0",
        "required": ">=18.0.0"
      }
    }
  ],
  "summary": {
    "total": 15,
    "passed": 13,
    "failed": 2,
    "warnings": 3
  }
}
```

### 团队共享

```bash
# 生成团队环境检测脚本
ldesign-scaffold doctor --generate-script

# 这将创建一个可分享的检测脚本
# team-doctor.sh 或 team-doctor.bat
```

## 持续监控

### 定期检测

设置定期环境检测：

```bash
# 添加到 crontab (Linux/macOS)
0 9 * * 1 /usr/local/bin/ldesign-scaffold doctor --quiet

# 或添加到项目的 package.json
{
  "scripts": {
    "doctor": "ldesign-scaffold doctor",
    "postinstall": "ldesign-scaffold doctor --quick"
  }
}
```

### CI/CD 集成

在 CI/CD 流水线中集成环境检测：

**.github/workflows/doctor.yml：**
```yaml
name: Environment Check

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  doctor:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Use Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'pnpm'
    
    - name: Install dependencies
      run: pnpm install
    
    - name: Run environment check
      run: pnpm run doctor
```

## 故障排除

### 常见问题

1. **检测命令失败**
   ```bash
   # 检查脚手架安装
   ldesign-scaffold --version
   
   # 重新安装脚手架
   npm install -g ldesign-scaffold
   ```

2. **权限问题**
   ```bash
   # macOS/Linux
   sudo ldesign-scaffold doctor
   
   # 或修复 npm 权限
   npm config set prefix ~/.npm-global
   ```

3. **网络问题**
   ```bash
   # 使用代理
   ldesign-scaffold doctor --proxy http://proxy:8080
   
   # 跳过网络检测
   ldesign-scaffold doctor --offline
   ```

### 调试模式

```bash
# 启用调试输出
ldesign-scaffold doctor --debug

# 查看详细错误信息
ldesign-scaffold doctor --verbose --debug
```

## 下一步

- [Nginx 配置](/guide/nginx-config) - Web 服务器配置
- [字体管理](/guide/font-management) - 字体优化工具
- [图标管理](/guide/icon-management) - 图标字体管理
