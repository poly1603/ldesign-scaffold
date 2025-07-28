# 安装

本页面详细介绍了如何在不同环境下安装和配置 LDesign Scaffold。

## 系统要求

### 必需环境

- **Node.js** >= 18.0.0
- **包管理器**: pnpm >= 8.0.0 (推荐) 或 npm >= 9.0.0 或 yarn >= 1.22.0
- **Git** >= 2.0.0

### 推荐环境

- **操作系统**: Windows 10+, macOS 10.15+, Ubuntu 18.04+
- **内存**: 4GB RAM 或更多
- **磁盘空间**: 至少 1GB 可用空间
- **IDE**: VS Code, WebStorm 等现代编辑器

## 安装方式

### 方式一：全局安装 (推荐)

```bash
# 使用 pnpm (推荐)
pnpm install -g ldesign-scaffold

# 使用 npm
npm install -g ldesign-scaffold

# 使用 yarn
yarn global add ldesign-scaffold
```

全局安装后，你可以在任何地方使用 `ldesign-scaffold` 命令。

### 方式二：npx 使用

如果你不想全局安装，可以使用 npx 直接运行：

```bash
npx ldesign-scaffold create my-project
```

### 方式三：本地安装

在现有项目中作为开发依赖安装：

```bash
pnpm add -D ldesign-scaffold
```

然后在 package.json 中添加脚本：

```json
{
  "scripts": {
    "scaffold": "ldesign-scaffold"
  }
}
```

## 验证安装

安装完成后，运行以下命令验证：

```bash
# 检查版本
ldesign-scaffold --version

# 查看帮助信息
ldesign-scaffold --help

# 运行环境检测
ldesign-scaffold doctor
```

如果看到版本号和帮助信息，说明安装成功。

## 环境配置

### Git 配置

确保 Git 已正确配置用户信息：

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 包管理器配置

#### pnpm 配置 (推荐)

```bash
# 安装 pnpm
npm install -g pnpm

# 配置镜像源 (可选)
pnpm config set registry https://registry.npmmirror.com/
```

#### npm 配置

```bash
# 配置镜像源 (可选)
npm config set registry https://registry.npmmirror.com/
```

### IDE 配置

#### VS Code

推荐安装以下扩展：

- **Vue Language Features (Volar)** - Vue 3 支持
- **TypeScript Vue Plugin (Volar)** - Vue TypeScript 支持
- **ESLint** - 代码检查
- **Prettier** - 代码格式化
- **Auto Rename Tag** - 标签自动重命名
- **Bracket Pair Colorizer** - 括号配色

#### WebStorm

WebStorm 内置了对 Vue、React、TypeScript 的支持，无需额外配置。

## 常见问题

### 安装失败

#### 权限问题 (macOS/Linux)

```bash
# 使用 sudo (不推荐)
sudo npm install -g ldesign-scaffold

# 或者配置 npm 全局目录
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

#### 网络问题

```bash
# 使用国内镜像源
npm config set registry https://registry.npmmirror.com/
pnpm config set registry https://registry.npmmirror.com/

# 或者使用代理
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
```

#### Node.js 版本过低

```bash
# 使用 nvm 管理 Node.js 版本
# 安装 nvm (macOS/Linux)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 安装最新 LTS 版本
nvm install --lts
nvm use --lts
```

### 命令找不到

如果安装后提示命令找不到：

1. **检查 PATH 环境变量**
   ```bash
   echo $PATH  # macOS/Linux
   echo %PATH% # Windows
   ```

2. **重新加载终端配置**
   ```bash
   source ~/.bashrc  # Linux
   source ~/.zshrc   # macOS with zsh
   ```

3. **重启终端或 IDE**

### 版本冲突

如果遇到版本冲突问题：

```bash
# 卸载旧版本
npm uninstall -g ldesign-scaffold

# 清理缓存
npm cache clean --force
pnpm store prune

# 重新安装
pnpm install -g ldesign-scaffold
```

## 更新

### 检查更新

```bash
# 检查当前版本
ldesign-scaffold --version

# 检查最新版本
npm view ldesign-scaffold version
```

### 更新到最新版本

```bash
# 使用 pnpm
pnpm update -g ldesign-scaffold

# 使用 npm
npm update -g ldesign-scaffold

# 使用 yarn
yarn global upgrade ldesign-scaffold
```

## 卸载

如果需要卸载 LDesign Scaffold：

```bash
# 使用 pnpm
pnpm uninstall -g ldesign-scaffold

# 使用 npm
npm uninstall -g ldesign-scaffold

# 使用 yarn
yarn global remove ldesign-scaffold
```

## 下一步

安装完成后，你可以：

1. [快速开始](/guide/getting-started) - 创建第一个项目
2. [创建项目](/guide/creating-projects) - 详细了解项目创建
3. [项目类型](/guide/project-types) - 选择合适的项目类型
