# 图标管理

LDesign Scaffold 提供了完整的图标管理解决方案，支持 SVG 图标、图标字体和图标组件的自动化管理。

## 图标管理特性

### 启用图标管理

创建项目时启用图标管理功能：

```bash
ldesign-scaffold create my-project --features iconfont
```

或为现有项目添加图标管理：

```bash
ldesign-scaffold add iconfont
```

## SVG 图标管理

### SVG 图标优化

自动优化 SVG 图标文件：

```bash
# 优化项目中的所有 SVG 图标
ldesign-scaffold icon optimize

# 优化指定目录的图标
ldesign-scaffold icon optimize --input ./src/assets/icons --output ./dist/icons

# 优化单个图标文件
ldesign-scaffold icon optimize --file ./src/assets/icons/home.svg
```

### SVG 图标配置

**icon.config.js：**
```javascript
export default {
  // SVG 图标目录
  svgDir: './src/assets/icons',
  
  // 输出目录
  outputDir: './src/components/icons',
  
  // SVG 优化选项
  svgo: {
    plugins: [
      'removeDoctype',
      'removeXMLProcInst',
      'removeComments',
      'removeMetadata',
      'removeTitle',
      'removeDesc',
      'removeUselessDefs',
      'removeEditorsNSData',
      'removeEmptyAttrs',
      'removeHiddenElems',
      'removeEmptyText',
      'removeEmptyContainers',
      'removeViewBox',
      'cleanupEnableBackground',
      'convertStyleToAttrs',
      'convertColors',
      'convertPathData',
      'convertTransform',
      'removeUnknownsAndDefaults',
      'removeNonInheritableGroupAttrs',
      'removeUselessStrokeAndFill',
      'removeUnusedNS',
      'cleanupIDs',
      'cleanupNumericValues',
      'moveElemsAttrsToGroup',
      'moveGroupAttrsToElems',
      'collapseGroups',
      'removeRasterImages',
      'mergePaths',
      'convertShapeToPath',
      'sortAttrs',
      'removeDimensions'
    ]
  },
  
  // 图标组件生成
  component: {
    // 生成 Vue 组件
    vue: true,
    
    // 生成 React 组件
    react: false,
    
    // 组件模板
    template: 'functional', // 'functional' | 'class' | 'composition'
    
    // TypeScript 支持
    typescript: true,
    
    // 组件前缀
    prefix: 'Icon',
    
    // 组件后缀
    suffix: ''
  },
  
  // 图标字体生成
  font: {
    // 启用图标字体生成
    enabled: true,
    
    // 字体名称
    fontName: 'iconfont',
    
    // 字体格式
    formats: ['woff2', 'woff', 'ttf'],
    
    // CSS 类前缀
    classPrefix: 'icon-',
    
    // 起始 Unicode 码点
    startUnicode: 0xE001,
    
    // 字体大小
    fontSize: 16,
    
    // 字体高度
    fontHeight: 1000
  }
}
```

### SVG 图标组件生成

自动生成 Vue/React 图标组件：

```bash
# 生成 Vue 图标组件
ldesign-scaffold icon generate --vue

# 生成 React 图标组件
ldesign-scaffold icon generate --react

# 生成 TypeScript 组件
ldesign-scaffold icon generate --typescript
```

**生成的 Vue 组件示例：**
```vue
<!-- IconHome.vue -->
<template>
  <svg
    :width="size"
    :height="size"
    :class="className"
    :style="{ color }"
    viewBox="0 0 24 24"
    fill="currentColor"
    v-bind="$attrs"
  >
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
  </svg>
</template>

<script setup lang="ts">
interface Props {
  size?: string | number
  color?: string
  className?: string
}

withDefaults(defineProps<Props>(), {
  size: '1em',
  color: 'currentColor',
  className: ''
})
</script>
```

**生成的 React 组件示例：**
```tsx
// IconHome.tsx
import React from 'react';

interface IconHomeProps {
  size?: string | number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

const IconHome: React.FC<IconHomeProps> = ({
  size = '1em',
  color = 'currentColor',
  className = '',
  style,
  ...props
}) => {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      style={{ color, ...style }}
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
    </svg>
  );
};

export default IconHome;
```

## 图标字体生成

### 从 SVG 生成图标字体

将 SVG 图标转换为图标字体：

```bash
# 生成图标字体
ldesign-scaffold icon font

# 指定输入和输出目录
ldesign-scaffold icon font --input ./icons --output ./fonts

# 自定义字体名称
ldesign-scaffold icon font --name MyIcons
```

### 图标字体配置

**生成的 CSS 文件：**
```css
/* iconfont.css */
@font-face {
  font-family: 'iconfont';
  src: url('./iconfont.woff2') format('woff2'),
       url('./iconfont.woff') format('woff'),
       url('./iconfont.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

.iconfont {
  font-family: 'iconfont' !important;
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.icon-home:before {
  content: "\e001";
}

.icon-user:before {
  content: "\e002";
}

.icon-settings:before {
  content: "\e003";
}
```

### 图标字体使用

**HTML 使用：**
```html
<i class="iconfont icon-home"></i>
<i class="iconfont icon-user"></i>
<i class="iconfont icon-settings"></i>
```

**Vue 使用：**
```vue
<template>
  <div>
    <i class="iconfont icon-home"></i>
    <span class="iconfont icon-user"></span>
  </div>
</template>

<style>
@import './assets/fonts/iconfont.css';
</style>
```

## 图标库集成

### 流行图标库支持

支持从流行图标库导入图标：

```bash
# 从 Heroicons 导入图标
ldesign-scaffold icon import heroicons --icons home,user,settings

# 从 Feather Icons 导入图标
ldesign-scaffold icon import feather --icons home,user,settings

# 从 Material Icons 导入图标
ldesign-scaffold icon import material --icons home,person,settings

# 从 Font Awesome 导入图标
ldesign-scaffold icon import fontawesome --icons home,user,cog
```

### 自定义图标库

创建自定义图标库：

```javascript
// custom-icons.config.js
export default {
  name: 'custom-icons',
  version: '1.0.0',
  icons: {
    home: {
      svg: '<svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>',
      tags: ['house', 'building', 'main'],
      category: 'navigation'
    },
    user: {
      svg: '<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>',
      tags: ['person', 'profile', 'account'],
      category: 'user'
    }
  }
}
```

## 图标搜索和预览

### 图标搜索

```bash
# 搜索图标
ldesign-scaffold icon search home

# 按标签搜索
ldesign-scaffold icon search --tag navigation

# 按分类搜索
ldesign-scaffold icon search --category user
```

### 图标预览

生成图标预览页面：

```bash
# 生成图标预览页面
ldesign-scaffold icon preview

# 启动预览服务器
ldesign-scaffold icon preview --serve
```

**生成的预览页面：**
```html
<!DOCTYPE html>
<html>
<head>
  <title>图标预览</title>
  <link rel="stylesheet" href="./iconfont.css">
  <style>
    .icon-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 20px;
      padding: 20px;
    }
    .icon-item {
      text-align: center;
      padding: 20px;
      border: 1px solid #eee;
      border-radius: 8px;
    }
    .icon-item i {
      font-size: 32px;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <div class="icon-grid">
    <div class="icon-item">
      <i class="iconfont icon-home"></i>
      <div>home</div>
    </div>
    <div class="icon-item">
      <i class="iconfont icon-user"></i>
      <div>user</div>
    </div>
    <!-- 更多图标... -->
  </div>
</body>
</html>
```

## 图标优化

### SVG 优化

自动优化 SVG 图标：

```bash
# 优化 SVG 文件大小
ldesign-scaffold icon optimize --compress

# 移除不必要的属性
ldesign-scaffold icon optimize --clean

# 标准化颜色
ldesign-scaffold icon optimize --normalize-colors
```

### 图标去重

检测和移除重复图标：

```bash
# 检测重复图标
ldesign-scaffold icon dedupe --check

# 移除重复图标
ldesign-scaffold icon dedupe --remove

# 交互式去重
ldesign-scaffold icon dedupe --interactive
```

## 构建集成

### Vite 插件

**vite.config.ts：**
```typescript
import { defineConfig } from 'vite'
import { iconPlugin } from 'ldesign-scaffold/plugins'

export default defineConfig({
  plugins: [
    iconPlugin({
      // SVG 图标目录
      iconDir: './src/assets/icons',
      
      // 生成组件
      generateComponents: true,
      
      // 组件输出目录
      componentDir: './src/components/icons',
      
      // 生成图标字体
      generateFont: true,
      
      // 字体输出目录
      fontDir: './src/assets/fonts',
      
      // 自动导入
      autoImport: true
    })
  ]
})
```

### Webpack 插件

**webpack.config.js：**
```javascript
const IconPlugin = require('ldesign-scaffold/webpack-plugin');

module.exports = {
  plugins: [
    new IconPlugin({
      iconDir: './src/assets/icons',
      outputDir: './dist/icons',
      generateComponents: true,
      generateFont: true
    })
  ]
};
```

## 图标管理最佳实践

### 命名规范

1. **使用语义化名称**
```
home.svg          ✅
user.svg          ✅
settings.svg      ✅
icon1.svg         ❌
```

2. **使用连字符分隔**
```
arrow-left.svg    ✅
arrow_left.svg    ❌
arrowLeft.svg     ❌
```

3. **分类组织**
```
icons/
├── navigation/
│   ├── home.svg
│   ├── menu.svg
│   └── back.svg
├── user/
│   ├── profile.svg
│   ├── settings.svg
│   └── logout.svg
└── actions/
    ├── edit.svg
    ├── delete.svg
    └── save.svg
```

### 图标设计规范

1. **统一尺寸**
   - 使用统一的画布尺寸 (如 24x24)
   - 保持图标在网格中对齐

2. **统一风格**
   - 保持线条粗细一致
   - 使用统一的圆角半径
   - 保持视觉重量平衡

3. **优化路径**
   - 合并重叠路径
   - 简化复杂形状
   - 移除不必要的锚点

### 性能优化

1. **按需加载**
```javascript
// 动态导入图标组件
const IconHome = () => import('./icons/IconHome.vue')
```

2. **图标缓存**
```javascript
// 缓存常用图标
const iconCache = new Map();

function getIcon(name) {
  if (!iconCache.has(name)) {
    iconCache.set(name, import(`./icons/Icon${name}.vue`));
  }
  return iconCache.get(name);
}
```

3. **SVG 精灵图**
```html
<!-- SVG 精灵图 -->
<svg style="display: none;">
  <defs>
    <g id="icon-home">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
    </g>
  </defs>
</svg>

<!-- 使用图标 -->
<svg><use href="#icon-home"></use></svg>
```

## 故障排除

### 常见问题

1. **图标显示异常**
   ```bash
   # 检查 SVG 文件格式
   ldesign-scaffold icon validate ./src/assets/icons/
   
   # 重新优化图标
   ldesign-scaffold icon optimize --force
   ```

2. **字体文件加载失败**
   ```css
   /* 检查字体路径 */
   @font-face {
     font-family: 'iconfont';
     src: url('./iconfont.woff2') format('woff2');
     font-display: swap;
   }
   ```

3. **组件生成失败**
   ```bash
   # 清理缓存重新生成
   ldesign-scaffold icon generate --clean
   
   # 检查模板配置
   ldesign-scaffold icon generate --debug
   ```

### 调试技巧

```javascript
// 检查图标加载状态
function checkIconFont() {
  const testElement = document.createElement('span');
  testElement.style.fontFamily = 'iconfont';
  testElement.style.position = 'absolute';
  testElement.style.left = '-9999px';
  testElement.innerHTML = '&#xe001;';
  
  document.body.appendChild(testElement);
  
  const width = testElement.offsetWidth;
  document.body.removeChild(testElement);
  
  return width > 0;
}

// 使用检测
if (checkIconFont()) {
  console.log('图标字体加载成功');
} else {
  console.log('图标字体加载失败');
}
```

## 下一步

- [性能优化](/guide/performance) - 项目性能优化
- [部署指南](/guide/deployment) - 项目部署配置
- [API 参考](/api/) - 查看完整的 API 文档
