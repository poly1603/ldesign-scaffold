# 命令行接口

LDesign Scaffold 提供了丰富的命令行工具，帮助你快速创建和管理项目。

## 全局命令

### 基本语法

```bash
ldesign-scaffold <command> [options]
```

### 全局选项

| 选项 | 简写 | 描述 | 默认值 |
|------|------|------|--------|
| `--version` | `-V` | 显示版本号 | - |
| `--help` | `-h` | 显示帮助信息 | - |
| `--verbose` | `-v` | 显示详细输出 | `false` |
| `--quiet` | `-q` | 静默模式 | `false` |
| `--debug` | | 启用调试模式 | `false` |

## 项目创建

### create

创建新项目。

**语法：**
```bash
ldesign-scaffold create <project-name> [options]
```

**参数：**
- `project-name` - 项目名称（必需）

**选项：**
| 选项 | 类型 | 描述 | 默认值 |
|------|------|------|--------|
| `--type` | string | 项目类型 | 交互式选择 |
| `--template` | string | 模板路径或名称 | - |
| `--build-tool` | string | 构建工具 | `vite` |
| `--package-manager` | string | 包管理器 | `pnpm` |
| `--features` | string[] | 项目特性 | `[]` |
| `--author` | string | 作者信息 | Git 配置 |
| `--description` | string | 项目描述 | - |
| `--version` | string | 项目版本 | `1.0.0` |
| `--license` | string | 许可证 | `MIT` |
| `--git` | boolean | 初始化 Git 仓库 | `true` |
| `--install` | boolean | 自动安装依赖 | `true` |
| `--overwrite` | boolean | 覆盖已存在目录 | `false` |

**示例：**
```bash
# 交互式创建项目
ldesign-scaffold create my-project

# 指定项目类型
ldesign-scaffold create my-vue-app --type vue3-project

# 指定多个特性
ldesign-scaffold create my-app --features typescript,eslint,vitest

# 使用自定义模板
ldesign-scaffold create my-app --template ./my-template

# 完整配置示例
ldesign-scaffold create my-project \
  --type vue3-project \
  --build-tool vite \
  --package-manager pnpm \
  --features typescript,eslint,prettier,vitest \
  --author "John Doe" \
  --description "My Vue 3 application" \
  --license MIT
```

## 开发服务器

### dev

启动开发服务器。

**语法：**
```bash
ldesign-scaffold dev [options]
```

**选项：**
| 选项 | 类型 | 描述 | 默认值 |
|------|------|------|--------|
| `--port` | number | 服务器端口 | `3000` |
| `--host` | string | 服务器主机 | `localhost` |
| `--open` | boolean | 自动打开浏览器 | `true` |
| `--https` | boolean | 启用 HTTPS | `false` |

**示例：**
```bash
# 默认启动
ldesign-scaffold dev

# 指定端口
ldesign-scaffold dev --port 8080

# 允许外部访问
ldesign-scaffold dev --host 0.0.0.0

# 启用 HTTPS
ldesign-scaffold dev --https
```

### build

构建生产版本。

**语法：**
```bash
ldesign-scaffold build [options]
```

**选项：**
| 选项 | 类型 | 描述 | 默认值 |
|------|------|------|--------|
| `--outDir` | string | 输出目录 | `dist` |
| `--mode` | string | 构建模式 | `production` |
| `--sourcemap` | boolean | 生成源码映射 | `false` |
| `--minify` | boolean | 压缩代码 | `true` |

**示例：**
```bash
# 默认构建
ldesign-scaffold build

# 指定输出目录
ldesign-scaffold build --outDir build

# 生成源码映射
ldesign-scaffold build --sourcemap
```

### preview

预览构建结果。

**语法：**
```bash
ldesign-scaffold preview [options]
```

**选项：**
| 选项 | 类型 | 描述 | 默认值 |
|------|------|------|--------|
| `--port` | number | 服务器端口 | `4173` |
| `--host` | string | 服务器主机 | `localhost` |
| `--open` | boolean | 自动打开浏览器 | `true` |

**示例：**
```bash
# 预览构建结果
ldesign-scaffold preview

# 指定端口
ldesign-scaffold preview --port 8080
```

## 项目管理

### list

列出可用模板和特性。

**语法：**
```bash
ldesign-scaffold list [type]
```

**参数：**
- `type` - 列出类型：`templates`、`features`、`all`

**示例：**
```bash
# 列出所有信息
ldesign-scaffold list

# 只列出模板
ldesign-scaffold list templates

# 只列出特性
ldesign-scaffold list features
```

### doctor

环境检测和诊断。

**语法：**
```bash
ldesign-scaffold doctor [options]
```

**选项：**
| 选项 | 类型 | 描述 | 默认值 |
|------|------|------|--------|
| `--fix` | boolean | 自动修复问题 | `false` |
| `--report` | boolean | 生成检测报告 | `false` |
| `--output` | string | 报告输出文件 | - |

**示例：**
```bash
# 运行环境检测
ldesign-scaffold doctor

# 自动修复问题
ldesign-scaffold doctor --fix

# 生成报告
ldesign-scaffold doctor --report --output report.json
```

## 可视化界面

### ui

启动可视化界面。

**语法：**
```bash
ldesign-scaffold ui [options]
```

**选项：**
| 选项 | 类型 | 描述 | 默认值 |
|------|------|------|--------|
| `--port` | number | 界面端口 | `3000` |
| `--host` | string | 界面主机 | `localhost` |
| `--open` | boolean | 自动打开浏览器 | `true` |

**示例：**
```bash
# 启动可视化界面
ldesign-scaffold ui

# 指定端口
ldesign-scaffold ui --port 8080

# 允许外部访问
ldesign-scaffold ui --host 0.0.0.0
```

## 工具命令

### font

字体管理工具。

**子命令：**

#### font compress
压缩字体文件。

```bash
ldesign-scaffold font compress [options]
```

**选项：**
| 选项 | 类型 | 描述 | 默认值 |
|------|------|------|--------|
| `--input` | string | 输入目录 | `src/assets/fonts` |
| `--output` | string | 输出目录 | `dist/fonts` |
| `--level` | number | 压缩级别 | `6` |

#### font subset
字体子集化。

```bash
ldesign-scaffold font subset [options]
```

**选项：**
| 选项 | 类型 | 描述 | 默认值 |
|------|------|------|--------|
| `--text` | string | 包含的文字 | 自动检测 |
| `--chinese` | string | 中文字符集 | `common` |

### icon

图标管理工具。

**子命令：**

#### icon generate
生成图标组件。

```bash
ldesign-scaffold icon generate [options]
```

**选项：**
| 选项 | 类型 | 描述 | 默认值 |
|------|------|------|--------|
| `--vue` | boolean | 生成 Vue 组件 | `true` |
| `--react` | boolean | 生成 React 组件 | `false` |
| `--typescript` | boolean | 使用 TypeScript | `true` |

#### icon font
生成图标字体。

```bash
ldesign-scaffold icon font [options]
```

**选项：**
| 选项 | 类型 | 描述 | 默认值 |
|------|------|------|--------|
| `--input` | string | SVG 图标目录 | `src/assets/icons` |
| `--output` | string | 字体输出目录 | `src/assets/fonts` |
| `--name` | string | 字体名称 | `iconfont` |

### git

Git 管理工具。

**子命令：**

#### git init
初始化 Git 仓库。

```bash
ldesign-scaffold git init [options]
```

**选项：**
| 选项 | 类型 | 描述 | 默认值 |
|------|------|------|--------|
| `--hooks` | boolean | 安装 Git 钩子 | `true` |
| `--commit` | boolean | 创建初始提交 | `true` |

#### git remote
管理远程仓库。

```bash
ldesign-scaffold git remote <action> <name> <url>
```

**参数：**
- `action` - 操作：`add`、`remove`、`set-url`
- `name` - 远程仓库名称
- `url` - 仓库 URL

### docker

Docker 管理工具。

**子命令：**

#### docker build
构建 Docker 镜像。

```bash
ldesign-scaffold docker build [options]
```

**选项：**
| 选项 | 类型 | 描述 | 默认值 |
|------|------|------|--------|
| `--tag` | string | 镜像标签 | 项目名称 |
| `--dockerfile` | string | Dockerfile 路径 | `Dockerfile` |

#### docker up
启动 Docker 服务。

```bash
ldesign-scaffold docker up [options]
```

**选项：**
| 选项 | 类型 | 描述 | 默认值 |
|------|------|------|--------|
| `--detach` | boolean | 后台运行 | `false` |
| `--build` | boolean | 重新构建 | `false` |

### nginx

Nginx 配置工具。

**子命令：**

#### nginx generate
生成 Nginx 配置。

```bash
ldesign-scaffold nginx generate [options]
```

**选项：**
| 选项 | 类型 | 描述 | 默认值 |
|------|------|------|--------|
| `--ssl` | boolean | 启用 HTTPS | `false` |
| `--proxy` | boolean | 启用反向代理 | `false` |
| `--domain` | string | 域名 | `localhost` |

## 配置文件

### 全局配置

**~/.ldesign-scaffold/config.json：**
```json
{
  "defaultProjectType": "vue3-project",
  "defaultPackageManager": "pnpm",
  "defaultFeatures": ["typescript", "eslint", "prettier"],
  "author": "Your Name",
  "email": "your.email@example.com",
  "license": "MIT"
}
```

### 项目配置

**ldesign.config.js：**
```javascript
export default {
  // 项目类型
  type: 'vue3-project',
  
  // 构建工具
  buildTool: 'vite',
  
  // 包管理器
  packageManager: 'pnpm',
  
  // 项目特性
  features: ['typescript', 'eslint', 'prettier'],
  
  // 自定义模板路径
  templatePaths: ['./templates'],
  
  // 插件配置
  plugins: []
}
```

## 环境变量

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| `LDESIGN_SCAFFOLD_HOME` | 脚手架主目录 | `~/.ldesign-scaffold` |
| `LDESIGN_SCAFFOLD_CACHE` | 缓存目录 | `~/.ldesign-scaffold/cache` |
| `LDESIGN_SCAFFOLD_TEMPLATES` | 模板目录 | `~/.ldesign-scaffold/templates` |
| `LDESIGN_SCAFFOLD_DEBUG` | 调试模式 | `false` |

## 退出码

| 退出码 | 描述 |
|--------|------|
| `0` | 成功 |
| `1` | 一般错误 |
| `2` | 参数错误 |
| `3` | 文件系统错误 |
| `4` | 网络错误 |
| `5` | 权限错误 |

## 示例脚本

### 批量创建项目

```bash
#!/bin/bash

projects=(
  "frontend:vue3-project:typescript,router,store"
  "backend:nodejs-api:typescript,docker"
  "admin:vue3-project:typescript,router,ui-library"
)

for project in "${projects[@]}"; do
  IFS=':' read -r name type features <<< "$project"
  
  echo "创建项目: $name"
  ldesign-scaffold create "$name" \
    --type "$type" \
    --features "$features" \
    --author "Team Lead" \
    --license "MIT" \
    --no-install
done

echo "所有项目创建完成！"
```

### 环境检测脚本

```bash
#!/bin/bash

echo "检查开发环境..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js 未安装"
  exit 1
fi

# 检查包管理器
if ! command -v pnpm &> /dev/null; then
  echo "⚠️ pnpm 未安装，正在安装..."
  npm install -g pnpm
fi

# 运行脚手架环境检测
ldesign-scaffold doctor --fix

echo "✅ 环境检测完成"
```

## 故障排除

### 常见错误

1. **命令未找到**
   ```bash
   # 检查安装
   npm list -g ldesign-scaffold
   
   # 重新安装
   npm install -g ldesign-scaffold
   ```

2. **权限错误**
   ```bash
   # macOS/Linux
   sudo ldesign-scaffold create my-project
   
   # 或修复 npm 权限
   npm config set prefix ~/.npm-global
   ```

3. **网络超时**
   ```bash
   # 使用代理
   ldesign-scaffold create my-project --proxy http://proxy:8080
   
   # 或配置镜像源
   npm config set registry https://registry.npmmirror.com/
   ```

### 调试技巧

```bash
# 启用详细输出
ldesign-scaffold create my-project --verbose

# 启用调试模式
ldesign-scaffold create my-project --debug

# 查看帮助信息
ldesign-scaffold create --help
```

## 下一步

- [配置选项](/api/config) - 详细的配置参考
- [核心 API](/api/core) - 核心类和方法
- [插件系统](/api/plugins) - 插件开发指南
